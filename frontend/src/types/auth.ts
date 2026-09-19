export type Role = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  familyId: string;
  familyName: string;
  currency: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  familyName: string;
  currency?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AddMemberPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}
