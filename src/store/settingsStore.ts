import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  currency: string;
  language: string;
  biometricEnabled: boolean;
  pin: string | null;
  isLocked: boolean;
  notificationsEnabled: boolean;
  name: string;
  avatar: string | null;
  lastBackupDate: string | null;
  setCurrency: (currency: string) => Promise<void>;
  setBiometric: (enabled: boolean) => Promise<void>;
  setPin: (pin: string | null) => Promise<void>;
  setIsLocked: (locked: boolean) => void;
  setLastBackupDate: (dateStr: string) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currency: '₹',
  language: 'English',
  biometricEnabled: false,
  pin: null,
  isLocked: false,
  notificationsEnabled: true,
  name: 'User',
  avatar: null,
  lastBackupDate: null,

  loadSettings: async () => {
    try {
      const storedCurrency = await AsyncStorage.getItem('@coinly_currency');
      const storedBiometric = await AsyncStorage.getItem('@coinly_biometric');
      const storedPin = await AsyncStorage.getItem('@coinly_pin');
      const storedBackup = await AsyncStorage.getItem('@coinly_backup_date');
      const storedName = await AsyncStorage.getItem('@coinly_name');
      const storedLang = await AsyncStorage.getItem('@coinly_lang');

      const biometricEnabled = storedBiometric === 'true';
      const pin = storedPin || null;

      set({
        currency: storedCurrency || '₹',
        biometricEnabled,
        pin,
        isLocked: biometricEnabled || pin !== null,
        lastBackupDate: storedBackup || null,
        name: storedName || 'User',
        language: storedLang || 'English',
      });
    } catch (e) {
      console.log('Error loading settings:', e);
    }
  },

  setCurrency: async (currency: string) => {
    set({ currency });
    await AsyncStorage.setItem('@coinly_currency', currency);
  },

  setBiometric: async (enabled: boolean) => {
    set({ biometricEnabled: enabled });
    await AsyncStorage.setItem('@coinly_biometric', enabled ? 'true' : 'false');
  },

  setPin: async (pin: string | null) => {
    set({ pin });
    if (pin) {
      await AsyncStorage.setItem('@coinly_pin', pin);
    } else {
      await AsyncStorage.removeItem('@coinly_pin');
    }
  },

  setIsLocked: (locked: boolean) => {
    set({ isLocked: locked });
  },

  setLastBackupDate: async (dateStr: string) => {
    set({ lastBackupDate: dateStr });
    await AsyncStorage.setItem('@coinly_backup_date', dateStr);
  },

  setName: async (name: string) => {
    set({ name });
    await AsyncStorage.setItem('@coinly_name', name);
  },

  setLanguage: async (language: string) => {
    set({ language });
    await AsyncStorage.setItem('@coinly_lang', language);
  },
}));
