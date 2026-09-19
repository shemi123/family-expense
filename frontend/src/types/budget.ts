export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  month: number;
  year: number;
  limitAmount: number;
}

export interface BudgetSummary {
  budgetId?: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  month: number;
  year: number;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface BudgetPayload {
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
}
