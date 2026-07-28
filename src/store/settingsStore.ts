import { create } from 'zustand';

interface SettingsState {
  currency: string;
  language: string;
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  name: string;
  avatar: string | null;
  setCurrency: (currency: string) => void;
  setBiometric: (enabled: boolean) => void;
  setName: (name: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: '₹',
  language: 'en',
  biometricEnabled: false,
  notificationsEnabled: true,
  name: 'User',
  avatar: null,
  setCurrency: (currency) => set({ currency }),
  setBiometric: (enabled) => set({ biometricEnabled: enabled }),
  setName: (name) => set({ name }),
}));
