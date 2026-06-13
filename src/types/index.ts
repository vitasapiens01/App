export type TransactionType = 'income' | 'expense';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  recurringId?: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  frequency: RecurringFrequency;
  dayOfMonth: number; // 1-31
  active: boolean;
  // Tracks which months have been paid: key = "YYYY-MM"
  paidMonths: string[];
}

export interface NoMovementDay {
  id: string;
  date: string; // YYYY-MM-DD
}

export type UndoableAction =
  | { type: 'DELETE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_CATEGORY'; payload: Category }
  | { type: 'DELETE_RECURRING'; payload: RecurringTransaction }
  | { type: 'ADD_NO_MOVEMENT'; payload: NoMovementDay }
  | { type: 'MARK_RECURRING_PAID'; payload: { id: string; monthKey: string } }
  | { type: 'MARK_RECURRING_UNPAID'; payload: { id: string; monthKey: string } };

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  recurringTransactions: RecurringTransaction[];
  noMovementDays: NoMovementDay[];
  undoStack: UndoableAction[];
}
