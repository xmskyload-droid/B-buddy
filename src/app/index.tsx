import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useExpenseStore } from '../store/expenseStore';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<string | null>(null);
  const { loadCategories, loadExpenses, loadBudgets } = useExpenseStore();
  const { colors } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      await loadCategories();
      await loadExpenses();
      await loadBudgets();
      if (user) {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setDestination(hasLaunched ? '/(tabs)/home' : '/onboarding');
      } else {
        setDestination('/login');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#22C55E" size="large" />
    </View>
  );
  
  return <Redirect href={destination as any} />;
}
