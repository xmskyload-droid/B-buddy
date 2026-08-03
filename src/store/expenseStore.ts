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
    // Silent fail if offline
  }
};

const deleteFromCloud = async (id: string) => {
  const uid = getUserId();
  if (!uid || !db) return;
  try {
    await deleteDoc(doc(db, 'users', uid, 'expenses', id));
  } catch (e) {
    // Silent fail if offline
  }
};

const syncBudgetToCloud = async (budget: Budget) => {
  const uid = getUserId();
  if (!uid || !db) return;
  try {
    await setDoc(doc(db, 'users', uid, 'budgets', budget.id), budget);
  } catch (e) {
    // Silent fail if offline
  }
};

const loadExpensesFromCloud = async (): Promise<Expense[]> => {
  const uid = getUserId();
  if (!uid || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'expenses'));
    return snap.docs.map((d: any) => d.data() as Expense);
  } catch (e) {
    return [];
  }
};

const loadBudgetsFromCloud = async (): Promise<Budget[]> => {
  const uid = getUserId();
  if (!uid || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'budgets'));
    return snap.docs.map((d: any) => d.data() as Budget);
  } catch (e) {
    return [];
  }
};

interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  loadExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  syncWithCloud: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  categories: [],
  budgets: [],
  loading: false,
  syncing: false,
  error: null,
  setLoading: (loading) => set({ loading }),

  syncWithCloud: async () => {
    const uid = getUserId();
    if (!uid) return;
    set({ syncing: true });
    try {
      // 1. Fetch cloud data
      const cloudExpenses = await loadExpensesFromCloud();
      const cloudBudgets = await loadBudgetsFromCloud();

      // 2. Write cloud data to local SQLite so offline mode is pre-populated
      for (const exp of cloudExpenses) {
        await queries.addExpense(exp);
      }
      for (const b of cloudBudgets) {
        await queries.addBudget(b);
      }

      // 3. Sync local expenses to cloud if missing in cloud
      const localExpenses = await queries.getExpenses();
      const cloudExpMap = new Map(cloudExpenses.map(e => [e.id, e]));
      for (const localExp of localExpenses) {
        if (!cloudExpMap.has(localExp.id)) {
          await syncToCloud(localExp);
        }
      }

      // 4. Update memory store with latest merged expenses
      const allExpenses = await queries.getExpenses();
      const allBudgets = await queries.getBudgets();
      set({ expenses: allExpenses, budgets: allBudgets, syncing: false });
    } catch (e) {
      set({ syncing: false });
    }
  },

  loadExpenses: async () => {
    try {
      set({ loading: true });
      const localExpenses = await queries.getExpenses();
      set({ expenses: localExpenses });

      // Trigger cloud sync in background if user is authenticated
      const uid = getUserId();
      if (uid) {
        get().syncWithCloud().catch(() => {});
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addExpense: async (expense) => {
    try {
      // Optimistic update
      set(state => ({ expenses: [expense, ...state.expenses.filter(e => e.id !== expense.id)] }));
      await queries.addExpense(expense);
      syncToCloud(expense).catch(() => {});
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateExpense: async (expense) => {
    try {
      // Optimistic update
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
      // Optimistic update
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

      const uid = getUserId();
      if (uid) {
        const cloudBudgets = await loadBudgetsFromCloud();
        if (cloudBudgets.length > 0) {
          for (const b of cloudBudgets) {
            await queries.addBudget(b);
          }
          const updatedBudgets = await queries.getBudgets();
          set({ budgets: updatedBudgets });
        }
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addBudget: async (budget: Budget) => {
    try {
      set(state => ({
        budgets: [budget, ...state.budgets.filter(b => b.id !== budget.id)]
      }));
      await queries.addBudget(budget);
      syncBudgetToCloud(budget).catch(() => {});
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
