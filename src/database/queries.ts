import { openDb } from './db';
import { Expense, Category, Budget } from '../types';

export const addExpense = async (expense: Expense) => {
  const db = await openDb();
  await db.runAsync(
    'INSERT INTO expenses (id, amount, categoryId, date, paymentMethod, notes, receiptUri, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      expense.id,
      expense.amount,
      expense.categoryId,
      expense.date,
      expense.paymentMethod,
      expense.notes || '',
      expense.receiptUri || '',
      expense.createdAt,
      expense.updatedAt,
    ]
  );
};

export const updateExpense = async (expense: Expense) => {
  const db = await openDb();
  await db.runAsync(
    'UPDATE expenses SET amount = ?, categoryId = ?, date = ?, paymentMethod = ?, notes = ?, receiptUri = ?, updatedAt = ? WHERE id = ?',
    [
      expense.amount,
      expense.categoryId,
      expense.date,
      expense.paymentMethod,
      expense.notes || '',
      expense.receiptUri || '',
      expense.updatedAt,
      expense.id,
    ]
  );
};

export const deleteExpense = async (id: string) => {
  const db = await openDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
};

export const getExpenses = async (): Promise<Expense[]> => {
  const db = await openDb();
  return await db.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC');
};

export const getCategories = async (): Promise<Category[]> => {
  const db = await openDb();
  const rows = await db.getAllAsync('SELECT * FROM categories');
  return rows.map((row: any) => ({
    ...row,
    isDefault: row.isDefault === 1,
  }));
};

export const addCategory = async (category: Category) => {
  const db = await openDb();
  await db.runAsync(
    'INSERT INTO categories (id, name, icon, color, isDefault) VALUES (?, ?, ?, ?, ?)',
    [category.id, category.name, category.icon, category.color, category.isDefault ? 1 : 0]
  );
};

export const getBudgets = async (): Promise<Budget[]> => {
  const db = await openDb();
  return await db.getAllAsync<Budget>('SELECT * FROM budgets');
};

export const addBudget = async (budget: Budget) => {
  const db = await openDb();
  await db.runAsync(
    'INSERT INTO budgets (id, categoryId, monthlyLimit, currentSpent, month, year) VALUES (?, ?, ?, ?, ?, ?)',
    [budget.id, budget.categoryId || null, budget.monthlyLimit, budget.currentSpent, budget.month, budget.year]
  );
};

export const updateBudget = async (budget: Budget) => {
  const db = await openDb();
  await db.runAsync(
    'UPDATE budgets SET monthlyLimit = ?, currentSpent = ? WHERE id = ?',
    [budget.monthlyLimit, budget.currentSpent, budget.id]
  );
};
