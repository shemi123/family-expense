import { Account } from './account';
import { Transaction } from './transaction';

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  monthYear: string;
  income: number;
  expense: number;
  netSavings: number;
}

export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNetSavings: number;
  savingsRate: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrends: MonthlyTrend[];
  accounts: Account[];
  recentTransactions: Transaction[];
}
