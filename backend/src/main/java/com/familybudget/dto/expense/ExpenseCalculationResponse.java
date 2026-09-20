package com.familybudget.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCalculationResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDaysInPeriod;

    private BigDecimal totalExpense;
    private BigDecimal totalIncome;
    private BigDecimal netSavings;
    private Double expenseToIncomeRatio;

    private BigDecimal averageDailyExpense;
    private BigDecimal averageWeeklyExpense;
    private BigDecimal averageMonthlyExpense;

    private Long totalExpenseTransactions;
    private BigDecimal averageExpenseTransactionAmount;

    // Period Comparison vs Previous Equivalent Range
    private BigDecimal previousPeriodExpense;
    private BigDecimal expenseChangeAmount;
    private Double expenseChangePercentage;

    // Budget Comparison
    private BigDecimal totalBudgetLimit;
    private BigDecimal budgetUsedAmount;
    private BigDecimal budgetRemainingAmount;
    private Double budgetUtilizationPercentage;
    private BigDecimal suggestedSafeDailySpend;

    // Breakdown lists
    private List<CategoryExpenseCalculationDto> categoryBreakdown;
    private List<AccountExpenseCalculationDto> accountBreakdown;
    private List<UserExpenseCalculationDto> userBreakdown;
    private List<DailyExpenseDto> dailyTrend;
}
