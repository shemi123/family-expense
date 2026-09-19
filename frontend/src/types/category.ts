export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isSystem: boolean;
  familyId?: string;
}

export interface CategoryPayload {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}
