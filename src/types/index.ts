export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK = 'BANK',
  WALLET = 'WALLET',
}

export type ThemeMode = 'light' | 'dark';

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod | string;
  notes?: string;
  receiptUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Budget {
  id: string;
  categoryId?: string;
  monthlyLimit: number;
  currentSpent: number;
  month: number;
  year: number;
}
