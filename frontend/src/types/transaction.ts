import { TransactionType } from './category';

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  userId: string;
  userName: string;
  amount: number;
  type: TransactionType;
  date: string;
  notes?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  recurringTransactionId?: string;
  createdAt: string;
}

export interface TransactionPayload {
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'YEARLY';
  intervalCount?: number;
  recurringEndDate?: string;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  userId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
