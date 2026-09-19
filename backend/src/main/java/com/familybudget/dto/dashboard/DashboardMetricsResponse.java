package com.familybudget.dto.dashboard;

import com.familybudget.dto.account.AccountResponse;
import com.familybudget.dto.transaction.TransactionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsResponse {
    private BigDecimal totalBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal monthlyNetSavings;
    private Double savingsRate;
    private List<CategorySpendingDto> categoryBreakdown;
    private List<MonthlyTrendDto> monthlyTrends;
    private List<AccountResponse> accounts;
    private List<TransactionResponse> recentTransactions;
}
