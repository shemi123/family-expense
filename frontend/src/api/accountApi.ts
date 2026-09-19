import { apiClient } from './client';
import { Account, AccountPayload } from '../types/account';

export const accountApi = {
  getAccounts: async (): Promise<Account[]> => {
    const { data } = await apiClient.get<Account[]>('/accounts');
    return data;
  },

  getAccount: async (id: string): Promise<Account> => {
    const { data } = await apiClient.get<Account>(`/accounts/${id}`);
    return data;
  },

  createAccount: async (payload: AccountPayload): Promise<Account> => {
    const { data } = await apiClient.post<Account>('/accounts', payload);
    return data;
  },

  updateAccount: async (id: string, payload: AccountPayload): Promise<Account> => {
    const { data } = await apiClient.put<Account>(`/accounts/${id}`, payload);
    return data;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`);
  },
};
