import { apiClient } from './client';
import { Transaction, TransactionPayload, TransactionFilters, PagedResponse } from '../types/transaction';

export const transactionApi = {
  getTransactions: async (filters?: TransactionFilters): Promise<PagedResponse<Transaction>> => {
    const { data } = await apiClient.get<PagedResponse<Transaction>>('/transactions', {
      params: filters,
    });
    return data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);
    return data;
  },

  createTransaction: async (payload: TransactionPayload): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>('/transactions', payload);
    return data;
  },

  createBulkTransactions: async (payloads: TransactionPayload[]): Promise<Transaction[]> => {
    const { data } = await apiClient.post<Transaction[]>('/transactions/bulk', { transactions: payloads });
    return data;
  },

  updateTransaction: async (id: string, payload: TransactionPayload): Promise<Transaction> => {
    const { data } = await apiClient.put<Transaction>(`/transactions/${id}`, payload);
    return data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },

  exportCsv: async (filters?: TransactionFilters): Promise<void> => {
    const response = await apiClient.get('/transactions/export', {
      params: filters,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
