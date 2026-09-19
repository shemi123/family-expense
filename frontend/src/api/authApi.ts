import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload, AddMemberPayload, User } from '../types/auth';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  addMember: async (payload: AddMemberPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/members', payload);
    return data;
  },

  getFamilyMembers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/auth/members');
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};
