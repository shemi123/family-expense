package com.familybudget.service;

import com.familybudget.domain.entity.Account;
import com.familybudget.domain.entity.Transaction;
import com.familybudget.domain.enums.TransactionType;
import com.familybudget.dto.account.AccountResponse;
import com.familybudget.dto.dashboard.CategorySpendingDto;
import com.familybudget.dto.dashboard.DashboardMetricsResponse;
import com.familybudget.dto.dashboard.MonthlyTrendDto;
import com.familybudget.dto.transaction.TransactionResponse;
import com.familybudget.repository.AccountRepository;
import com.familybudget.repository.TransactionRepository;
import com.familybudget.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public DashboardMetricsResponse getDashboardMetrics() {
        UUID familyId = TenantContext.getCurrentFamilyId();
        LocalDate today = LocalDate.now();
        YearMonth currentYearMonth = YearMonth.from(today);
        LocalDate startOfMonth = currentYearMonth.atDay(1);
        LocalDate endOfMonth = currentYearMonth.atEndOfMonth();

        // 1. Account balances
        List<Account> accounts = accountRepository.findAllByFamilyIdAndIsActiveTrueOrderByCreatedAtDesc(familyId);
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Current month income & expense
        BigDecimal monthlyIncome = transactionRepository.calculateTotalForTypeAndPeriod(
                familyId, TransactionType.INCOME, startOfMonth, endOfMonth
        );
        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;

        BigDecimal monthlyExpense = transactionRepository.calculateTotalForTypeAndPeriod(
                familyId, TransactionType.EXPENSE, startOfMonth, endOfMonth
        );
        if (monthlyExpense == null) monthlyExpense = BigDecimal.ZERO;

        BigDecimal monthlyNetSavings = monthlyIncome.subtract(monthlyExpense);

        double savingsRate = 0.0;
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = monthlyNetSavings.divide(monthlyIncome, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        // 3. Category spending breakdown for current month
        var spendProjections = transactionRepository.findCategorySpend(
                familyId, TransactionType.EXPENSE, startOfMonth, endOfMonth
        );

        BigDecimal finalMonthlyExpense = monthlyExpense;
        List<CategorySpendingDto> categoryBreakdown = spendProjections.stream()
                .map(p -> {
                    double pct = 0.0;
                    if (finalMonthlyExpense.compareTo(BigDecimal.ZERO) > 0) {
                        pct = p.getTotalAmount().divide(finalMonthlyExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
                    }
                    return CategorySpendingDto.builder()
                            .categoryId(p.getCategoryId())
                            .categoryName(p.getCategoryName())
                            .color(p.getColor())
                            .icon(p.getIcon())
                            .amount(p.getTotalAmount())
                            .percentage(Math.round(pct * 10.0) / 10.0)
                            .build();
                })
                .toList();

        // 4. Six-month trend
        List<MonthlyTrendDto> monthlyTrends = new ArrayList<>();
        DateTimeFormatter trendFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYearMonth.minusMonths(i);
            LocalDate ymStart = ym.atDay(1);
            LocalDate ymEnd = ym.atEndOfMonth();

            BigDecimal inc = transactionRepository.calculateTotalForTypeAndPeriod(
                    familyId, TransactionType.INCOME, ymStart, ymEnd
            );
            if (inc == null) inc = BigDecimal.ZERO;

            BigDecimal exp = transactionRepository.calculateTotalForTypeAndPeriod(
                    familyId, TransactionType.EXPENSE, ymStart, ymEnd
            );
            if (exp == null) exp = BigDecimal.ZERO;

            monthlyTrends.add(MonthlyTrendDto.builder()
                    .monthYear(ym.format(trendFormatter))
                    .income(inc)
                    .expense(exp)
                    .netSavings(inc.subtract(exp))
                    .build());
        }

        // 5. Recent transactions
        List<Transaction> recentTxList = transactionRepository.findTop5ByFamilyIdOrderByDateDescCreatedAtDesc(familyId);
        List<TransactionResponse> recentTransactions = recentTxList.stream()
                .map(TransactionResponse::from)
                .toList();

        return DashboardMetricsResponse.builder()
                .totalBalance(totalBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpense(monthlyExpense)
                .monthlyNetSavings(monthlyNetSavings)
                .savingsRate(Math.round(savingsRate * 10.0) / 10.0)
                .categoryBreakdown(categoryBreakdown)
                .monthlyTrends(monthlyTrends)
                .accounts(accounts.stream().map(AccountResponse::from).toList())
                .recentTransactions(recentTransactions)
                .build();
    }
}
