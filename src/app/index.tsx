import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useExpenseStore } from '../store/expenseStore';

export default function Index() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const { loadCategories, loadExpenses } = useExpenseStore();

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

  if (isFirstLaunch === null) return <View className="flex-1 bg-background" />;

  return <Redirect href={isFirstLaunch ? "/onboarding" : "/(tabs)/home"} />;
}
