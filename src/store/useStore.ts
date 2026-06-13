import { useState, useCallback } from 'react';
import type {
  AppState, Transaction, Category, RecurringTransaction,
  NoMovementDay, UndoableAction,
} from '../types';

const STORAGE_KEY = 'finanzas_app_v1';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimentación', type: 'expense', color: '#ef4444', icon: '🍽️' },
  { id: 'cat-2', name: 'Transporte', type: 'expense', color: '#f97316', icon: '🚗' },
  { id: 'cat-3', name: 'Servicios', type: 'expense', color: '#eab308', icon: '💡' },
  { id: 'cat-4', name: 'Salud', type: 'expense', color: '#22c55e', icon: '🏥' },
  { id: 'cat-5', name: 'Entretenimiento', type: 'expense', color: '#8b5cf6', icon: '🎬' },
  { id: 'cat-6', name: 'Salario', type: 'income', color: '#10b981', icon: '💼' },
  { id: 'cat-7', name: 'Otros ingresos', type: 'income', color: '#06b6d4', icon: '💰' },
  { id: 'cat-8', name: 'Hogar', type: 'expense', color: '#64748b', icon: '🏠' },
];

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    recurringTransactions: [],
    noMovementDays: [],
    undoStack: [],
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  // ── Transactions ──────────────────────────────────────────────────────────
  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newT: Transaction = { ...t, id: crypto.randomUUID() };
    update(s => ({ ...s, transactions: [...s.transactions, newT] }));
  }, [update]);

  const updateTransaction = useCallback((t: Transaction) => {
    update(s => ({
      ...s,
      transactions: s.transactions.map(x => x.id === t.id ? t : x),
    }));
  }, [update]);

  const deleteTransaction = useCallback((id: string) => {
    update(s => {
      const target = s.transactions.find(x => x.id === id);
      if (!target) return s;
      return {
        ...s,
        transactions: s.transactions.filter(x => x.id !== id),
        undoStack: ([{ type: 'DELETE_TRANSACTION', payload: target }, ...s.undoStack].slice(0, 10) as UndoableAction[]),
      };
    });
  }, [update]);

  // ── Categories ────────────────────────────────────────────────────────────
  const addCategory = useCallback((c: Omit<Category, 'id'>) => {
    update(s => ({ ...s, categories: [...s.categories, { ...c, id: crypto.randomUUID() }] }));
  }, [update]);

  const updateCategory = useCallback((c: Category) => {
    update(s => ({ ...s, categories: s.categories.map(x => x.id === c.id ? c : x) }));
  }, [update]);

  const deleteCategory = useCallback((id: string) => {
    update(s => {
      const target = s.categories.find(x => x.id === id);
      if (!target) return s;
      return {
        ...s,
        categories: s.categories.filter(x => x.id !== id),
        undoStack: ([{ type: 'DELETE_CATEGORY', payload: target }, ...s.undoStack].slice(0, 10) as UndoableAction[]),
      };
    });
  }, [update]);

  // ── Recurring ─────────────────────────────────────────────────────────────
  const addRecurring = useCallback((r: Omit<RecurringTransaction, 'id' | 'paidMonths'>) => {
    const newR: RecurringTransaction = { ...r, id: crypto.randomUUID(), paidMonths: [] };
    update(s => ({ ...s, recurringTransactions: [...s.recurringTransactions, newR] }));
  }, [update]);

  const updateRecurring = useCallback((r: RecurringTransaction) => {
    update(s => ({
      ...s,
      recurringTransactions: s.recurringTransactions.map(x => x.id === r.id ? r : x),
    }));
  }, [update]);

  const deleteRecurring = useCallback((id: string) => {
    update(s => {
      const target = s.recurringTransactions.find(x => x.id === id);
      if (!target) return s;
      return {
        ...s,
        recurringTransactions: s.recurringTransactions.filter(x => x.id !== id),
        undoStack: ([{ type: 'DELETE_RECURRING', payload: target }, ...s.undoStack].slice(0, 10) as UndoableAction[]),
      };
    });
  }, [update]);

  const toggleRecurringPaid = useCallback((id: string, monthKey: string) => {
    update(s => {
      const rec = s.recurringTransactions.find(x => x.id === id);
      if (!rec) return s;
      const isPaid = rec.paidMonths.includes(monthKey);
      const undoAction: UndoableAction = isPaid
        ? { type: 'MARK_RECURRING_UNPAID', payload: { id, monthKey } }
        : { type: 'MARK_RECURRING_PAID', payload: { id, monthKey } };
      return {
        ...s,
        recurringTransactions: s.recurringTransactions.map(x =>
          x.id === id
            ? { ...x, paidMonths: isPaid ? x.paidMonths.filter(m => m !== monthKey) : [...x.paidMonths, monthKey] }
            : x
        ),
        undoStack: [undoAction, ...s.undoStack].slice(0, 10),
      };
    });
  }, [update]);

  // ── No Movement Days ──────────────────────────────────────────────────────
  const addNoMovementDay = useCallback((date: string) => {
    update(s => {
      if (s.noMovementDays.some(d => d.date === date)) return s;
      const newDay: NoMovementDay = { id: crypto.randomUUID(), date };
      return {
        ...s,
        noMovementDays: [...s.noMovementDays, newDay],
        undoStack: ([{ type: 'ADD_NO_MOVEMENT', payload: newDay }, ...s.undoStack].slice(0, 10) as UndoableAction[]),
      };
    });
  }, [update]);

  const removeNoMovementDay = useCallback((date: string) => {
    update(s => ({ ...s, noMovementDays: s.noMovementDays.filter(d => d.date !== date) }));
  }, [update]);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    update(s => {
      if (!s.undoStack.length) return s;
      const [action, ...rest] = s.undoStack;
      let next = { ...s, undoStack: rest };
      switch (action.type) {
        case 'DELETE_TRANSACTION':
          next.transactions = [...s.transactions, action.payload];
          break;
        case 'DELETE_CATEGORY':
          next.categories = [...s.categories, action.payload];
          break;
        case 'DELETE_RECURRING':
          next.recurringTransactions = [...s.recurringTransactions, action.payload];
          break;
        case 'ADD_NO_MOVEMENT':
          next.noMovementDays = s.noMovementDays.filter(d => d.id !== action.payload.id);
          break;
        case 'MARK_RECURRING_PAID':
          next.recurringTransactions = s.recurringTransactions.map(x =>
            x.id === action.payload.id
              ? { ...x, paidMonths: x.paidMonths.filter(m => m !== action.payload.monthKey) }
              : x
          );
          break;
        case 'MARK_RECURRING_UNPAID':
          next.recurringTransactions = s.recurringTransactions.map(x =>
            x.id === action.payload.id
              ? { ...x, paidMonths: [...x.paidMonths, action.payload.monthKey] }
              : x
          );
          break;
      }
      return next;
    });
  }, [update]);

  return {
    ...state,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    addRecurring, updateRecurring, deleteRecurring,
    toggleRecurringPaid,
    addNoMovementDay, removeNoMovementDay,
    undo,
  };
}

export type Store = ReturnType<typeof useStore>;
