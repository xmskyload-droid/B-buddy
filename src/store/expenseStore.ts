import { create } from 'zustand';
import { Expense, Category, Budget } from '../types';
import * as queries from '../database/queries';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
// @ts-ignore
import { auth, db } from '../config/firebase';

const getUserId = () => {
  try {
    return auth?.currentUser?.uid || null;
  } catch (e) {
    return null;
  }
};

const syncToCloud = async (expense: Expense) => {
  const uid = getUserId();
  if (!uid || !db) return;
  try {
    await setDoc(doc(db, 'users', uid, 'expenses', expense.id), expense);
  } catch (e) {
    // Silent fail if network/firebase not setup
  }
};

const deleteFromCloud = async (id: string) => {
  const uid = getUserId();
  if (!uid || !db) return;
  try {
    await deleteDoc(doc(db, 'users', uid, 'expenses', id));
  } catch (e) {
    // Silent fail if network/firebase not setup
  }
};

const loadFromCloud = async (): Promise<Expense[]> => {
  const uid = getUserId();
  if (!uid || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'expenses'));
    return snap.docs.map((d: any) => d.data() as Expense);
  } catch (e) {
    return [];
  }
};

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
  addBudget: (budget: Budget) => Promise<void>;
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
      const localExpenses = await queries.getExpenses();
      
      // Try loading cloud expenses safely without blocking if it fails
      let cloudExpenses: Expense[] = [];
      try {
        cloudExpenses = await loadFromCloud();
      } catch (e) {
        cloudExpenses = [];
      }
      
      // Merge: cloud takes precedence for same id
      const mergedMap = new Map<string, Expense>();
      localExpenses.forEach(e => mergedMap.set(e.id, e));
      cloudExpenses.forEach(e => mergedMap.set(e.id, e));
      
      const expenses = Array.from(mergedMap.values());
      set({ expenses, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
  
  addExpense: async (expense) => {
    try {
      // Optimistic state update
      set(state => ({ expenses: [expense, ...state.expenses.filter(e => e.id !== expense.id)] }));
      await queries.addExpense(expense);
      syncToCloud(expense).catch(() => {});
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  
  updateExpense: async (expense) => {
    try {
      // Optimistic state update
      set(state => ({
        expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
      }));
      await queries.updateExpense(expense);
      syncToCloud(expense).catch(() => {});
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  
  deleteExpense: async (id) => {
    try {
      // Optimistic state update immediately so UI updates cleanly
      set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      await queries.deleteExpense(id);
      deleteFromCloud(id).catch(() => {});
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
  },
  
  addBudget: async (budget: Budget) => {
    try {
      // Optimistic state update
      set(state => ({
        budgets: [budget, ...state.budgets.filter(b => b.id !== budget.id)]
      }));
      await queries.addBudget(budget);
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
