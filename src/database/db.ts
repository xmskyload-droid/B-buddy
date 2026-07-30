import * as SQLite from 'expo-sqlite';
import { defaultCategories } from '../utils/categories';

let db: SQLite.SQLiteDatabase | null = null;

export const openDb = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('coinly.db');
  await initDb(db);
  return db;
};

const initDb = async (database: SQLite.SQLiteDatabase) => {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      icon TEXT,
      color TEXT,
      isDefault INTEGER
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL,
      categoryId TEXT,
      date TEXT,
      paymentMethod TEXT,
      notes TEXT,
      receiptUri TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories (id)
    );
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      categoryId TEXT,
      monthlyLimit REAL,
      currentSpent REAL,
      month INTEGER,
      year INTEGER
    );
  `);

  // Insert default categories
  const result = await database.getAllAsync('SELECT COUNT(*) as count FROM categories');
  const count = (result[0] as any).count;
  if (count === 0) {
    for (const cat of defaultCategories) {
      await database.runAsync(
        'INSERT INTO categories (id, name, icon, color, isDefault) VALUES (?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.icon, cat.color, cat.isDefault ? 1 : 0]
      );
    }
  }
};
