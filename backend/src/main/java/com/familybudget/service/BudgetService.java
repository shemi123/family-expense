package com.familybudget.service;

import com.familybudget.domain.entity.Budget;
import com.familybudget.domain.entity.Category;
import com.familybudget.domain.entity.Family;
import com.familybudget.domain.enums.TransactionType;
import com.familybudget.dto.budget.BudgetRequest;
import com.familybudget.dto.budget.BudgetResponse;
import com.familybudget.dto.budget.BudgetSummaryResponse;
import com.familybudget.exception.ResourceNotFoundException;
import com.familybudget.repository.BudgetRepository;
import com.familybudget.repository.FamilyRepository;
import com.familybudget.repository.TransactionRepository;
import com.familybudget.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final FamilyRepository familyRepository;
    private final CategoryService categoryService;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Integer month, Integer year) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return budgetRepository.findAllByFamilyIdAndMonthAndYear(familyId, month, year).stream()
                .map(BudgetResponse::from)
                .toList();
    }

    @Transactional
    public BudgetResponse setBudget(BudgetRequest request) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Family not found"));

        Category category = categoryService.getCategoryEntity(request.getCategoryId());

        Optional<Budget> existingOpt = budgetRepository.findByFamilyIdAndCategoryIdAndMonthAndYear(
                familyId, category.getId(), request.getMonth(), request.getYear()
        );

        Budget budget;
        if (existingOpt.isPresent()) {
            budget = existingOpt.get();
            budget.setLimitAmount(request.getLimitAmount());
        } else {
            budget = Budget.builder()
                    .family(family)
                    .category(category)
                    .month(request.getMonth())
                    .year(request.getYear())
                    .limitAmount(request.getLimitAmount())
                    .build();
        }

        budget = budgetRepository.save(budget);
        return BudgetResponse.from(budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetSummaryResponse> getBudgetSummaries(Integer month, Integer year) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Budget> budgets = budgetRepository.findAllByFamilyIdAndMonthAndYear(familyId, month, year);
        List<BudgetSummaryResponse> summaries = new ArrayList<>();

        for (Budget budget : budgets) {
            Category category = budget.getCategory();
            BigDecimal spent = transactionRepository.calculateTotalForCategoryAndPeriod(
                    familyId, category.getId(), TransactionType.EXPENSE, startDate, endDate
            );
            if (spent == null) spent = BigDecimal.ZERO;

            BigDecimal limit = budget.getLimitAmount();
            BigDecimal remaining = limit.subtract(spent);

            double percentage = 0.0;
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                percentage = spent.divide(limit, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            }

            boolean isOverBudget = spent.compareTo(limit) > 0;

            summaries.add(BudgetSummaryResponse.builder()
                    .budgetId(budget.getId())
                    .categoryId(category.getId())
                    .categoryName(category.getName())
                    .categoryIcon(category.getIcon())
                    .categoryColor(category.getColor())
                    .month(month)
                    .year(year)
                    .limitAmount(limit)
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .percentageUsed(Math.round(percentage * 10.0) / 10.0)
                    .isOverBudget(isOverBudget)
                    .build());
        }

        return summaries;
    }

    @Transactional
    public void deleteBudget(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Budget budget = budgetRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));
        budgetRepository.delete(budget);
    }
}
