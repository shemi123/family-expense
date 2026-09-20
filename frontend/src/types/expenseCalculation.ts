export type CalculationPeriod = 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'THIS_YEAR' | 'CUSTOM';

export interface ExpenseCalculationFilterParams {
  startDate?: string;
  endDate?: string;
  period?: CalculationPeriod;
  accountId?: string;
  categoryId?: string;
  userId?: string;
}

export interface CategoryExpenseCalculation {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageTransactionAmount: number;
}

export interface AccountExpenseCalculation {
  accountId: string;
  accountName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface UserExpenseCalculation {
  userId: string;
  userName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailyExpenseTrend {
  date: string;
  amount: number;
  transactionCount: number;
}

export interface ExpenseCalculationData {
  startDate: string;
  endDate: string;
  totalDaysInPeriod: number;

  totalExpense: number;
  totalIncome: number;
  netSavings: number;
  expenseToIncomeRatio: number;

  averageDailyExpense: number;
  averageWeeklyExpense: number;
  averageMonthlyExpense: number;

  totalExpenseTransactions: number;
  averageExpenseTransactionAmount: number;

  previousPeriodExpense: number;
  expenseChangeAmount: number;
  expenseChangePercentage: number;

  totalBudgetLimit: number;
  budgetUsedAmount: number;
  budgetRemainingAmount: number;
  budgetUtilizationPercentage: number;
  suggestedSafeDailySpend: number;

  categoryBreakdown: CategoryExpenseCalculation[];
  accountBreakdown: AccountExpenseCalculation[];
  userBreakdown: UserExpenseCalculation[];
  dailyTrend: DailyExpenseTrend[];
}
