package com.familybudget.service;

import com.familybudget.domain.entity.Budget;
import com.familybudget.domain.entity.Transaction;
import com.familybudget.domain.enums.TransactionType;
import com.familybudget.dto.expense.*;
import com.familybudget.dto.transaction.TransactionFilterParams;
import com.familybudget.repository.BudgetRepository;
import com.familybudget.repository.TransactionRepository;
import com.familybudget.repository.TransactionSpecification;
import com.familybudget.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseCalculationService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    @Transactional(readOnly = true)
    public ExpenseCalculationResponse calculateExpenses(ExpenseCalculationFilterParams filter) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        LocalDate today = LocalDate.now();

        // 1. Resolve date range
        LocalDate startDate;
        LocalDate endDate;

        String period = filter.getPeriod() != null ? filter.getPeriod().toUpperCase() : "THIS_MONTH";
        switch (period) {
            case "LAST_MONTH":
                YearMonth lastMonth = YearMonth.from(today).minusMonths(1);
                startDate = lastMonth.atDay(1);
                endDate = lastMonth.atEndOfMonth();
                break;
            case "LAST_30_DAYS":
                startDate = today.minusDays(29);
                endDate = today;
                break;
            case "LAST_90_DAYS":
                startDate = today.minusDays(89);
                endDate = today;
                break;
            case "THIS_YEAR":
                startDate = LocalDate.of(today.getYear(), 1, 1);
                endDate = LocalDate.of(today.getYear(), 12, 31);
                break;
            case "CUSTOM":
                startDate = filter.getStartDate() != null ? filter.getStartDate() : YearMonth.from(today).atDay(1);
                endDate = filter.getEndDate() != null ? filter.getEndDate() : YearMonth.from(today).atEndOfMonth();
                break;
            case "THIS_MONTH":
            default:
                YearMonth currentMonth = YearMonth.from(today);
                startDate = currentMonth.atDay(1);
                endDate = currentMonth.atEndOfMonth();
                break;
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (totalDays <= 0) totalDays = 1;

        // 2. Fetch current period transactions
        TransactionFilterParams currentFilter = new TransactionFilterParams();
        currentFilter.setStartDate(startDate);
        currentFilter.setEndDate(endDate);
        currentFilter.setAccountId(filter.getAccountId());
        currentFilter.setCategoryId(filter.getCategoryId());
        currentFilter.setUserId(filter.getUserId());

        Specification<Transaction> spec = TransactionSpecification.withFilter(familyId, currentFilter);
        List<Transaction> transactions = transactionRepository.findAll(spec);

        List<Transaction> expenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .toList();

        List<Transaction> incomes = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .toList();

        // Totals
        BigDecimal totalExpense = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalIncome = incomes.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        double expenseToIncomeRatio = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            expenseToIncomeRatio = totalExpense.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            expenseToIncomeRatio = Math.round(expenseToIncomeRatio * 10.0) / 10.0;
        }

        // Daily / Weekly / Monthly averages
        BigDecimal averageDailyExpense = totalExpense.divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP);
        BigDecimal averageWeeklyExpense = averageDailyExpense.multiply(BigDecimal.valueOf(7));
        BigDecimal averageMonthlyExpense = averageDailyExpense.multiply(BigDecimal.valueOf(30));

        long totalExpenseTransactions = expenses.size();
        BigDecimal averageExpenseTransactionAmount = totalExpenseTransactions > 0
                ? totalExpense.divide(BigDecimal.valueOf(totalExpenseTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 3. Fetch previous period for comparison
        LocalDate prevEndDate = startDate.minusDays(1);
        LocalDate prevStartDate = prevEndDate.minusDays(totalDays - 1);

        TransactionFilterParams prevFilterParams = new TransactionFilterParams();
        prevFilterParams.setStartDate(prevStartDate);
        prevFilterParams.setEndDate(prevEndDate);
        prevFilterParams.setAccountId(filter.getAccountId());
        prevFilterParams.setCategoryId(filter.getCategoryId());
        prevFilterParams.setUserId(filter.getUserId());

        Specification<Transaction> prevSpec = TransactionSpecification.withFilter(familyId, prevFilterParams);
        List<Transaction> prevTransactions = transactionRepository.findAll(prevSpec);

        BigDecimal previousPeriodExpense = prevTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expenseChangeAmount = totalExpense.subtract(previousPeriodExpense);
        double expenseChangePercentage = 0.0;
        if (previousPeriodExpense.compareTo(BigDecimal.ZERO) > 0) {
            expenseChangePercentage = expenseChangeAmount.divide(previousPeriodExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            expenseChangePercentage = Math.round(expenseChangePercentage * 10.0) / 10.0;
        }

        // 4. Budget Comparison for active month/year
        YearMonth ym = YearMonth.from(startDate);
        List<Budget> monthBudgets = budgetRepository.findAllByFamilyIdAndMonthAndYear(familyId, ym.getMonthValue(), ym.getYear());
        BigDecimal totalBudgetLimit = monthBudgets.stream()
                .map(Budget::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal budgetUsedAmount = totalExpense;
        BigDecimal budgetRemainingAmount = totalBudgetLimit.subtract(budgetUsedAmount);
        double budgetUtilizationPercentage = 0.0;
        if (totalBudgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            budgetUtilizationPercentage = budgetUsedAmount.divide(totalBudgetLimit, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            budgetUtilizationPercentage = Math.round(budgetUtilizationPercentage * 10.0) / 10.0;
        }

        int daysLeftInMonth = Math.max(1, ym.lengthOfMonth() - today.getDayOfMonth() + 1);
        BigDecimal suggestedSafeDailySpend = budgetRemainingAmount.compareTo(BigDecimal.ZERO) > 0
                ? budgetRemainingAmount.divide(BigDecimal.valueOf(daysLeftInMonth), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 5. Category Breakdown
        Map<UUID, List<Transaction>> categoryGroup = expenses.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getId()));

        List<CategoryExpenseCalculationDto> categoryBreakdown = categoryGroup.entrySet().stream()
                .map(entry -> {
                    var catTxList = entry.getValue();
                    var cat = catTxList.get(0).getCategory();
                    BigDecimal catTotal = catTxList.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    double pct = totalExpense.compareTo(BigDecimal.ZERO) > 0
                            ? catTotal.divide(totalExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                            : 0.0;
                    long count = catTxList.size();
                    BigDecimal avgTx = count > 0 ? catTotal.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

                    return CategoryExpenseCalculationDto.builder()
                            .categoryId(cat.getId())
                            .categoryName(cat.getName())
                            .icon(cat.getIcon())
                            .color(cat.getColor())
                            .amount(catTotal)
                            .percentage(Math.round(pct * 10.0) / 10.0)
                            .transactionCount(count)
                            .averageTransactionAmount(avgTx)
                            .build();
                })
                .sorted(Comparator.comparing(CategoryExpenseCalculationDto::getAmount).reversed())
                .toList();

        // 6. Account Breakdown
        Map<UUID, List<Transaction>> accountGroup = expenses.stream()
                .collect(Collectors.groupingBy(t -> t.getAccount().getId()));

        List<AccountExpenseCalculationDto> accountBreakdown = accountGroup.entrySet().stream()
                .map(entry -> {
                    var accTxList = entry.getValue();
                    var accName = accTxList.get(0).getAccount().getName();
                    BigDecimal accTotal = accTxList.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    double pct = totalExpense.compareTo(BigDecimal.ZERO) > 0
                            ? accTotal.divide(totalExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                            : 0.0;

                    return AccountExpenseCalculationDto.builder()
                            .accountId(entry.getKey())
                            .accountName(accName)
                            .amount(accTotal)
                            .percentage(Math.round(pct * 10.0) / 10.0)
                            .transactionCount((long) accTxList.size())
                            .build();
                })
                .sorted(Comparator.comparing(AccountExpenseCalculationDto::getAmount).reversed())
                .toList();

        // 7. User Breakdown
        Map<UUID, List<Transaction>> userGroup = expenses.stream()
                .collect(Collectors.groupingBy(t -> t.getUser().getId()));

        List<UserExpenseCalculationDto> userBreakdown = userGroup.entrySet().stream()
                .map(entry -> {
                    var userTxList = entry.getValue();
                    var userName = userTxList.get(0).getUser().getName();
                    BigDecimal usrTotal = userTxList.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    double pct = totalExpense.compareTo(BigDecimal.ZERO) > 0
                            ? usrTotal.divide(totalExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                            : 0.0;

                    return UserExpenseCalculationDto.builder()
                            .userId(entry.getKey())
                            .userName(userName)
                            .amount(usrTotal)
                            .percentage(Math.round(pct * 10.0) / 10.0)
                            .transactionCount((long) userTxList.size())
                            .build();
                })
                .sorted(Comparator.comparing(UserExpenseCalculationDto::getAmount).reversed())
                .toList();

        // 8. Daily Trend
        Map<LocalDate, List<Transaction>> dailyMap = expenses.stream()
                .collect(Collectors.groupingBy(Transaction::getDate));

        List<DailyExpenseDto> dailyTrend = new ArrayList<>();
        LocalDate curr = startDate;
        while (!curr.isAfter(endDate)) {
            List<Transaction> dayTx = dailyMap.getOrDefault(curr, Collections.emptyList());
            BigDecimal dayTotal = dayTx.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            dailyTrend.add(DailyExpenseDto.builder()
                    .date(curr)
                    .amount(dayTotal)
                    .transactionCount((long) dayTx.size())
                    .build());
            curr = curr.plusDays(1);
        }

        return ExpenseCalculationResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalDaysInPeriod((int) totalDays)
                .totalExpense(totalExpense)
                .totalIncome(totalIncome)
                .netSavings(netSavings)
                .expenseToIncomeRatio(expenseToIncomeRatio)
                .averageDailyExpense(averageDailyExpense)
                .averageWeeklyExpense(averageWeeklyExpense)
                .averageMonthlyExpense(averageMonthlyExpense)
                .totalExpenseTransactions(totalExpenseTransactions)
                .averageExpenseTransactionAmount(averageExpenseTransactionAmount)
                .previousPeriodExpense(previousPeriodExpense)
                .expenseChangeAmount(expenseChangeAmount)
                .expenseChangePercentage(expenseChangePercentage)
                .totalBudgetLimit(totalBudgetLimit)
                .budgetUsedAmount(budgetUsedAmount)
                .budgetRemainingAmount(budgetRemainingAmount)
                .budgetUtilizationPercentage(budgetUtilizationPercentage)
                .suggestedSafeDailySpend(suggestedSafeDailySpend)
                .categoryBreakdown(categoryBreakdown)
                .accountBreakdown(accountBreakdown)
                .userBreakdown(userBreakdown)
                .dailyTrend(dailyTrend)
                .build();
    }
}
