import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useExpenseStore } from '../store/expenseStore';
import { useTheme } from '../hooks/useTheme';

const AUTH_PERSISTED_KEY = 'coinly_user_authed';

export default function Index() {
  const [destination, setDestination] = useState<string | null>(null);
  const { loadCategories, loadExpenses, loadBudgets } = useExpenseStore();
  const { colors } = useTheme();

  useEffect(() => {
    let resolved = false;

    const resolve = async (isLoggedIn: boolean) => {
      if (resolved) return;
      resolved = true;

      // Load data in parallel — don't block routing on this
      loadCategories();
      loadExpenses();
      loadBudgets();

      if (isLoggedIn) {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setDestination(hasLaunched ? '/(tabs)/home' : '/onboarding');
      } else {
        setDestination('/login');
      }
    };

    // Step 1: Check local flag immediately (no network round-trip)
    AsyncStorage.getItem(AUTH_PERSISTED_KEY).then((cached) => {
      if (cached === 'true' && !resolved) {
        resolve(true);
      }
    });

    // Step 2: Confirm with Firebase auth state (may take a moment)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Update the local cache for next launch
      await AsyncStorage.setItem(AUTH_PERSISTED_KEY, user ? 'true' : 'false');
      resolve(!!user);
    });

    // Fallback: if neither fires in 4s, go to login
    const timeout = setTimeout(() => {
      if (!resolved) resolve(false);
    }, 4000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (!destination) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#22C55E" size="large" />
    </View>
  );

  return <Redirect href={destination as any} />;
}
