import { TransactionType } from './category';

export type Frequency = 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
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
  frequency: Frequency;
  intervalCount: number;
  startDate: string;
  endDate?: string;
  nextExecutionDate: string;
  lastExecutedDate?: string;
  notes?: string;
  isActive: boolean;
}

export interface RecurringPayload {
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  intervalCount?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}
