import { create } from 'zustand';
import { Expense, Category, Budget } from '../types';
import * as queries from '../database/queries';

interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  loadExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  categories: [],
  budgets: [],
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  
  loadExpenses: async () => {
    try {
      set({ loading: true });
      const expenses = await queries.getExpenses();
      set({ expenses, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
  
  addExpense: async (expense) => {
    try {
      await queries.addExpense(expense);
      const expenses = await queries.getExpenses();
      set({ expenses });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  
  updateExpense: async (expense) => {
    try {
      await queries.updateExpense(expense);
      const expenses = await queries.getExpenses();
      set({ expenses });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  
  deleteExpense: async (id) => {
    try {
      await queries.deleteExpense(id);
      const expenses = await queries.getExpenses();
      set({ expenses });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  
  loadCategories: async () => {
    try {
      const categories = await queries.getCategories();
      set({ categories });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  
  loadBudgets: async () => {
    try {
      const budgets = await queries.getBudgets();
      set({ budgets });
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
