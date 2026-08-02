import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Expense, Category, Budget } from '../types';

export interface BackupPayload {
  version: number;
  appName: string;
  exportedAt: string;
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
}

export const createBackup = async (
  expenses: Expense[],
  categories: Category[],
  budgets: Budget[]
): Promise<string> => {
  try {
    const payload: BackupPayload = {
      version: 1,
      appName: 'Coinly',
      exportedAt: new Date().toISOString(),
      expenses,
      categories,
      budgets,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
    const fileUri = `${docDir}Coinly_Backup_${dateStr}.json`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save Coinly Backup File',
        UTI: 'public.json',
      });
    }

    return payload.exportedAt;
  } catch (error) {
    console.error('Backup creation error:', error);
    throw error;
  }
};

export const parseBackupFile = (jsonString: string): BackupPayload => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON backup structure.');
    }
    if (!Array.isArray(parsed.expenses)) {
      throw new Error('Missing expenses array in backup file.');
    }
    return parsed as BackupPayload;
  } catch (error: any) {
    throw new Error(`Failed to parse backup: ${error.message}`);
  }
};
