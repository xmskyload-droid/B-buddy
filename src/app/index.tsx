import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useExpenseStore } from '../store/expenseStore';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const { loadCategories, loadExpenses } = useExpenseStore();
  const { colors } = useTheme();

  useEffect(() => {
    async function init() {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
        await loadCategories();
        await loadExpenses();
      } catch (e) {
        setIsFirstLaunch(false);
      }
    }
    init();
  }, []);

  if (isFirstLaunch === null) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return <Redirect href={isFirstLaunch ? "/onboarding" : "/(tabs)/home"} />;
}
