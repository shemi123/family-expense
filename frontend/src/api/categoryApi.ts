import { apiClient } from './client';
import { Category, CategoryPayload, TransactionType } from '../types/category';

export const categoryApi = {
  getCategories: async (type?: TransactionType): Promise<Category[]> => {
    const params = type ? { type } : undefined;
    const { data } = await apiClient.get<Category[]>('/categories', { params });
    return data;
  },

  createCategory: async (payload: CategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', payload);
    return data;
  },

  updateCategory: async (id: string, payload: CategoryPayload): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
