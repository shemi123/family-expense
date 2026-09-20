import { apiClient } from './client';
import { ExpenseCalculationData, ExpenseCalculationFilterParams } from '../types/expenseCalculation';

export const expenseCalculationApi = {
  getCalculation: async (params?: ExpenseCalculationFilterParams): Promise<ExpenseCalculationData> => {
    const { data } = await apiClient.get<ExpenseCalculationData>('/expense-calculation', {
      params,
    });
    return data;
  },
};
