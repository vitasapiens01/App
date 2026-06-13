import type { Transaction, RecurringTransaction } from '../types';
import { format, getDaysInMonth } from 'date-fns';

export function monthKey(date: Date = new Date()) {
  return format(date, 'yyyy-MM');
}

export function transactionsForMonth(transactions: Transaction[], key: string) {
  return transactions.filter(t => t.date.startsWith(key));
}

export function sumByType(transactions: Transaction[], type: 'income' | 'expense') {
  return transactions.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
}

export interface MonthlySummary {
  monthKey: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recurringTotal: number;
  recurringPaid: number;
  recurringPending: number;
  projectedBalance: number;
  daysInMonth: number;
  currentDay: number;
}

export function getMonthlySummary(
  transactions: Transaction[],
  recurring: RecurringTransaction[],
  date: Date = new Date(),
): MonthlySummary {
  const key = monthKey(date);
  const monthTxs = transactionsForMonth(transactions, key);

  const totalIncome = sumByType(monthTxs, 'income');
  const totalExpenses = sumByType(monthTxs, 'expense');
  const balance = totalIncome - totalExpenses;

  const activeRecurring = recurring.filter(r => r.active);
  const recurringTotal = activeRecurring.reduce((s, r) => {
    const val = r.type === 'expense' ? r.amount : -r.amount;
    return s + val;
  }, 0);

  const recurringPaid = activeRecurring
    .filter(r => r.paidMonths.includes(key))
    .reduce((s, r) => {
      const val = r.type === 'expense' ? r.amount : -r.amount;
      return s + val;
    }, 0);

  const recurringPending = recurringTotal - recurringPaid;
  const projectedBalance = balance - recurringPending;

  return {
    monthKey: key,
    totalIncome,
    totalExpenses,
    balance,
    recurringTotal,
    recurringPaid,
    recurringPending,
    projectedBalance,
    daysInMonth: getDaysInMonth(date),
    currentDay: date.getDate(),
  };
}
