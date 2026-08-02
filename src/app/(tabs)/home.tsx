import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format, startOfWeek, isToday as dateFnsIsToday } from 'date-fns';

import { useTheme } from '../../hooks/useTheme';
import { useExpenses } from '../../hooks/useExpenses';
import { useBudget } from '../../hooks/useBudget';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { SummaryCard } from '../../components/cards/SummaryCard';
import { CategoryCard } from '../../components/cards/CategoryCard';
import { WeeklyBarChart } from '../../components/charts/WeeklyBarChart';
import { SkeletonSummaryCard } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getCategoryEmoji(icon: string): string {
  const map: Record<string, string> = {
    pizza: '🍕', car: '🚗', fuel: '⛽', 'shopping-bag': '🛍️',
    'file-text': '🧾', activity: '💊', book: '📚', plane: '✈️',
    film: '🎬', repeat: '🔄', 'trending-up': '📈', 'dollar-sign': '💰',
    gift: '🎁', home: '🏠', grid: '📦',
  };
  return map[icon] || '📦';
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const {
    totalThisMonth,
    totalToday,
    totalThisWeek,
    dailyAverage,
    recentExpenses,
    expensesByCategory,
    weeklyData: rawWeeklyData,
  } = useExpenses();
  const { monthlyBudget } = useBudget();
  const { loadExpenses, loadCategories, loadBudgets, loading } = useExpenseStore();
  const { name, currency } = useSettingsStore();
  const router = useRouter();

  useEffect(() => {
    loadCategories();
    loadExpenses();
    loadBudgets();
  }, []);

  const onRefresh = () => {
    loadExpenses();
    loadBudgets();
  };

  // Build real weekly chart data from calculations engine (Mon–Sun)
  const weeklyChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon...6=Sat
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1; // convert to Mon=0 ... Sun=6

    return days.map((day, i) => ({
      day,
      amount: rawWeeklyData[i] ?? 0,
      isToday: i === todayIndex,
    }));
  }, [rawWeeklyData]);

  const maxWeeklyAmount = Math.max(...weeklyChartData.map(d => d.amount), 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#22C55E" />
          }
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(0).duration(500)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
          >
            <View>
              <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '500', marginBottom: 2 }}>
                {getGreeting()}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800' }}>
                {name || 'User'} 👋
              </Text>
            </View>
            <Pressable
              style={{
                width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card,
                alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border
              }}
            >
              <Bell size={20} color={colors.primary} />
            </Pressable>
          </Animated.View>

          {/* SummaryCard */}
          {loading ? (
            <View style={{ paddingHorizontal: 20 }}><SkeletonSummaryCard /></View>
          ) : (
            <SummaryCard
              totalSpent={totalThisMonth}
              budget={monthlyBudget}
              transactionCount={recentExpenses.length}
              avgPerDay={dailyAverage}
              todaySpent={totalToday}
              thisWeekSpent={totalThisWeek}
            />
          )}

          {/* Weekly Spending Chart */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ marginBottom: 28, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>This Week</Text>
              <Pressable onPress={() => router.push('/(tabs)/analytics')}>
                <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: '600' }}>See details →</Text>
              </Pressable>
            </View>
            <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <WeeklyBarChart data={weeklyChartData} maxValue={maxWeeklyAmount} />
            </View>
          </Animated.View>

          {/* Spending by Category */}
          {expensesByCategory.length > 0 && (
            <Animated.View entering={FadeInDown.delay(180).duration(500)} style={{ marginBottom: 28 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>By Category</Text>
                <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '500' }}>{format(new Date(), 'MMMM')}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}>
                {expensesByCategory.slice(0, 6).map((item) => (
                  <CategoryCard
                    key={item.categoryId}
                    name={item.category?.name || 'Other'}
                    amount={formatCurrency(item.amount, currency)}
                    color={item.category?.color || '#22C55E'}
                    icon={getCategoryEmoji(item.category?.icon || '')}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Recent Transactions */}
          <Animated.View entering={FadeInDown.delay(260).duration(500)} style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>Recent</Text>
              {recentExpenses.length > 0 && (
                <Pressable onPress={() => router.push('/(tabs)/transactions')}>
                  <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: '600' }}>View all →</Text>
                </Pressable>
              )}
            </View>
            {recentExpenses.length === 0 ? (
              <EmptyState emoji="💸" title="No expenses yet" subtitle="Tap + to add one." />
            ) : (
              recentExpenses.slice(0, 5).map((expense, i) => (
                <ExpenseCard key={expense.id} expense={expense} delay={i * 80} />
              ))
            )}
          </Animated.View>

          {/* Bottom Padding for FAB */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
