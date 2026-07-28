import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Bell, Settings, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { useTheme } from '../../hooks/useTheme';
import { useExpenses } from '../../hooks/useExpenses';
import { useBudget } from '../../hooks/useBudget';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatters';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { totalThisMonth, totalToday, recentExpenses, expensesByCategory, loading } = useExpenses();
  const { monthlyBudget, remaining, percentUsed } = useBudget();
  const { loadExpenses, loadCategories, loadBudgets } = useExpenseStore();
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

  const progressColor =
    percentUsed > 90 ? colors.danger : percentUsed > 75 ? colors.warning : '#22C55E';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(0).duration(500)}
            className="flex-row justify-between items-center px-6 pt-4 pb-2"
          >
            <View>
              <Text style={{ color: colors.secondary, fontSize: 14, fontWeight: '500' }}>
                {getGreeting()}
              </Text>
              <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '700' }}>
                {name || 'Welcome'} 👋
              </Text>
            </View>
            <Pressable
              onPress={() => {}}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Bell size={18} color={colors.secondary} />
            </Pressable>
          </Animated.View>

          {/* Summary Card */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="mx-6 mt-4 mb-5"
          >
            <LinearGradient
              colors={['#16A34A', '#22C55E', '#4ADE80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500', marginBottom: 4 }}>
                {format(new Date(), 'MMMM yyyy')}
              </Text>
              <Text style={{ color: 'white', fontSize: 42, fontWeight: '800', marginBottom: 2 }}>
                {formatCurrency(totalThisMonth, currency)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 20 }}>
                total spent this month
              </Text>

              {monthlyBudget > 0 ? (
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' }}>
                      Budget: {formatCurrency(monthlyBudget, currency)}
                    </Text>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>
                      {formatCurrency(remaining, currency)} left
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        width: `${Math.min(percentUsed, 100)}%`,
                        backgroundColor: percentUsed > 90 ? '#FCA5A5' : 'white',
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                    + Set a budget
                  </Text>
                </Pressable>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Quick Stats Row */}
          <Animated.View
            entering={FadeInDown.delay(180).duration(500)}
            className="flex-row px-6 mb-5 gap-3"
          >
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            >
              <View className="flex-row items-center mb-2">
                <TrendingDown size={14} color={colors.danger} />
                <Text style={{ color: colors.secondary, fontSize: 11, marginLeft: 4, fontWeight: '500' }}>
                  TODAY
                </Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
                {formatCurrency(totalToday, currency)}
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl p-4"
              style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            >
              <View className="flex-row items-center mb-2">
                <TrendingUp size={14} color={colors.accent} />
                <Text style={{ color: colors.secondary, fontSize: 11, marginLeft: 4, fontWeight: '500' }}>
                  CATEGORIES
                </Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
                {expensesByCategory.length}
              </Text>
            </View>
          </Animated.View>

          {/* Category Breakdown */}
          {expensesByCategory.length > 0 && (
            <Animated.View entering={FadeInDown.delay(260).duration(500)} className="mb-5">
              <View className="flex-row justify-between items-center px-6 mb-3">
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
                  By Category
                </Text>
                <Pressable onPress={() => router.push('/(tabs)/analytics')}>
                  <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                    See all
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
                {expensesByCategory.slice(0, 6).map((item, i) => (
                  <View
                    key={item.categoryId}
                    className="mr-3 rounded-2xl p-4 items-center"
                    style={{
                      backgroundColor: colors.card,
                      width: 100,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: `${item.category?.color || '#22C55E'}22`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{getCategoryEmoji(item.category?.icon || '')}</Text>
                    </View>
                    <Text
                      style={{ color: colors.primary, fontSize: 13, fontWeight: '700', textAlign: 'center' }}
                      numberOfLines={1}
                    >
                      {formatCurrency(item.amount, currency)}
                    </Text>
                    <Text
                      style={{ color: colors.secondary, fontSize: 10, marginTop: 2, textAlign: 'center' }}
                      numberOfLines={1}
                    >
                      {item.category?.name || 'Other'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Recent Transactions */}
          <Animated.View entering={FadeInDown.delay(340).duration(500)} className="px-6 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
                Recent
              </Text>
              {recentExpenses.length > 0 && (
                <Pressable onPress={() => router.push('/(tabs)/transactions')}>
                  <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
                    View all
                  </Text>
                </Pressable>
              )}
            </View>

            {recentExpenses.length === 0 ? (
              <EmptyState
                emoji="💸"
                title="No expenses yet"
                subtitle="Tap the + button below to add your first expense."
              />
            ) : (
              recentExpenses.map((expense, index) => (
                <ExpenseCard key={expense.id} expense={expense} delay={index * 80} />
              ))
            )}
          </Animated.View>

          {/* Bottom padding for FAB */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
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
