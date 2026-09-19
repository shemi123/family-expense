import { apiClient } from './client';
import { RecurringTransaction, RecurringPayload } from '../types/recurring';

export const recurringApi = {
  getRecurring: async (): Promise<RecurringTransaction[]> => {
    const { data } = await apiClient.get<RecurringTransaction[]>('/recurring');
    return data;
  },

  createRecurring: async (payload: RecurringPayload): Promise<RecurringTransaction> => {
    const { data } = await apiClient.post<RecurringTransaction>('/recurring', payload);
    return data;
  },

  toggleActive: async (id: string): Promise<RecurringTransaction> => {
    const { data } = await apiClient.patch<RecurringTransaction>(`/recurring/${id}/toggle`);
    return data;
  },

  deleteRecurring: async (id: string): Promise<void> => {
    await apiClient.delete(`/recurring/${id}`);
  },

  processDue: async (asOfDate?: string): Promise<{ status: string; processedDate: string; generatedTransactions: number }> => {
    const { data } = await apiClient.post('/recurring/process', null, {
      params: asOfDate ? { asOfDate } : undefined,
    });
    return data;
  },
};
