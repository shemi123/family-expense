import { apiClient } from './client';
import { Budget, BudgetPayload, BudgetSummary } from '../types/budget';

export const budgetApi = {
  getBudgets: async (month: number, year: number): Promise<Budget[]> => {
    const { data } = await apiClient.get<Budget[]>('/budgets', {
      params: { month, year },
    });
    return data;
  },

  getBudgetSummaries: async (month: number, year: number): Promise<BudgetSummary[]> => {
    const { data } = await apiClient.get<BudgetSummary[]>('/budgets/summary', {
      params: { month, year },
    });
    return data;
  },

  setBudget: async (payload: BudgetPayload): Promise<Budget> => {
    const { data } = await apiClient.post<Budget>('/budgets', payload);
    return data;
  },

  deleteBudget: async (id: string): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
  },
};
