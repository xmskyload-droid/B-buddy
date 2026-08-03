import { create } from 'zustand';
import { Expense, Category, Budget } from '../types';
import * as queries from '../database/queries';
import { openDb } from '../database/db';
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

// Helper: Sanitize payload to strip undefined fields (which crash Firestore)
const sanitize = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const syncToCloud = async (expense: Expense) => {
  const uid = getUserId();
  if (!uid || !db) return;
  try {
    const cleanData = sanitize(expense);
    await setDoc(doc(db, 'users', uid, 'expenses', expense.id), cleanData);
  } catch (e) {
    console.error('Cloud Sync Error (Expense):', e);
  }
};

const deleteFromCloud = async (id: string) => {
  const uid = getUserId();
  if (!uid || !db) return;
  try {
    await deleteDoc(doc(db, 'users', uid, 'expenses', id));
  } catch (e) {
    console.error('Cloud Delete Error:', e);
  }
};

const syncBudgetToCloud = async (budget: Budget) => {
  const uid = getUserId();
  if (!uid || !db) return;
  try {
    const cleanData = sanitize(budget);
    await setDoc(doc(db, 'users', uid, 'budgets', budget.id), cleanData);
  } catch (e) {
    console.error('Cloud Sync Error (Budget):', e);
  }
};

const loadExpensesFromCloud = async (): Promise<Expense[]> => {
  const uid = getUserId();
  if (!uid || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'expenses'));
    return snap.docs.map((d: any) => d.data() as Expense);
  } catch (e) {
    console.error('Load Cloud Expenses Error:', e);
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
  clearLocalExpenses: () => Promise<void>;
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

  clearLocalExpenses: async () => {
    try {
      const database = await openDb();
      await database.execAsync('DELETE FROM expenses; DELETE FROM budgets;');
      set({ expenses: [], budgets: [] });
    } catch (e) {
      set({ expenses: [], budgets: [] });
    }
  },

  syncWithCloud: async () => {
    const uid = getUserId();
    if (!uid) return;
    set({ syncing: true });
    try {
      // 1. Fetch cloud data for current user
      const cloudExpenses = await loadExpensesFromCloud();
      const cloudBudgets = await loadBudgetsFromCloud();

      // 2. Fetch current local SQLite expenses
      const localExpenses = await queries.getExpenses();
      const localBudgets = await queries.getBudgets();

      // 3. Merge: Cloud data takes precedence, local data is preserved and uploaded to cloud if not in cloud
      const mergedExpMap = new Map<string, Expense>();
      localExpenses.forEach(e => mergedExpMap.set(e.id, e));
      cloudExpenses.forEach(e => mergedExpMap.set(e.id, e));

      const mergedBudgetsMap = new Map<string, Budget>();
      localBudgets.forEach(b => mergedBudgetsMap.set(b.id, b));
      cloudBudgets.forEach(b => mergedBudgetsMap.set(b.id, b));

      const allMergedExpenses = Array.from(mergedExpMap.values());
      const allMergedBudgets = Array.from(mergedBudgetsMap.values());

      // 4. Save all merged items to local SQLite
      for (const exp of allMergedExpenses) {
        await queries.addExpense(exp);
      }
      for (const b of allMergedBudgets) {
        await queries.addBudget(b);
      }

      // 5. Upload any local items to Cloud Firestore if missing in cloud
      const cloudExpIds = new Set(cloudExpenses.map(e => e.id));
      for (const localExp of localExpenses) {
        if (!cloudExpIds.has(localExp.id)) {
          await syncToCloud(localExp);
        }
      }

      // 6. Update memory state with merged data
      set({ expenses: allMergedExpenses, budgets: allMergedBudgets, syncing: false });
    } catch (e) {
      set({ syncing: false });
    }
  },

  loadExpenses: async () => {
    try {
      set({ loading: true });
      const localExpenses = await queries.getExpenses();
      set({ expenses: localExpenses });

      const uid = getUserId();
      if (uid) {
        // Automatically perform cloud sync in background
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
      // 1. Optimistic update in memory and SQLite
      set(state => ({ expenses: [expense, ...state.expenses.filter(e => e.id !== expense.id)] }));
      await queries.addExpense(expense);

      // 2. Automatic Cloud Upload
      await syncToCloud(expense);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateExpense: async (expense) => {
    try {
      // 1. Optimistic update
      set(state => ({
        expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
      }));
      await queries.updateExpense(expense);

      // 2. Automatic Cloud Update
      await syncToCloud(expense);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteExpense: async (id) => {
    try {
      // 1. Optimistic update
      set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      await queries.deleteExpense(id);

      // 2. Automatic Cloud Delete
      await deleteFromCloud(id);
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
      await syncBudgetToCloud(budget);
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
