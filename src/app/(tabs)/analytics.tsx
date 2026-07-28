import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Zap } from 'lucide-react-native';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isThisMonth, parseISO } from 'date-fns';

import { useTheme } from '../../hooks/useTheme';
import { useExpenses } from '../../hooks/useExpenses';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatCurrency } from '../../utils/formatters';
import { EmptyState } from '../../components/ui/EmptyState';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 160;

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const { expenses, totalThisMonth, dailyAverage, expensesByCategory, biggestExpense } = useExpenses();
  const { categories } = useExpenseStore();
  const { currency } = useSettingsStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Filter expenses for selected month
  const monthExpenses = expenses.filter((e) => {
    const d = parseISO(e.date);
    return (
      d.getMonth() === selectedMonth.getMonth() &&
      d.getFullYear() === selectedMonth.getFullYear()
    );
  });

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthAvg = monthTotal / new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();

  // Category breakdown for selected month
  const catBreakdown = React.useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([id, amount]) => ({
        id,
        amount,
        category: categories.find((c) => c.id === id),
        pct: monthTotal > 0 ? (amount / monthTotal) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, categories, monthTotal]);

  // Daily spending for bar chart
  const dailyData = React.useMemo(() => {
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth),
    });
    return daysInMonth.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const total = monthExpenses
        .filter((e) => e.date.startsWith(dayStr))
        .reduce((s, e) => s + e.amount, 0);
      return { day: format(day, 'd'), total };
    });
  }, [monthExpenses, selectedMonth]);

  const maxDay = Math.max(...dailyData.map((d) => d.total), 1);

  const insights = React.useMemo(() => {
    if (monthExpenses.length === 0) return [];
    const msgs = [];
    if (catBreakdown[0]) {
      msgs.push(`🍕 ${catBreakdown[0].category?.name || 'Top category'} is your biggest expense at ${catBreakdown[0].pct.toFixed(0)}% of spending.`);
    }
    if (monthAvg > 0) {
      msgs.push(`📅 You spend an average of ${formatCurrency(monthAvg, currency)} per day this month.`);
    }
    if (biggestExpense) {
      msgs.push(`💸 Your largest single expense was ${formatCurrency(biggestExpense.amount, currency)}.`);
    }
    return msgs;
  }, [catBreakdown, monthAvg, biggestExpense, currency]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} className="px-6 pt-4 pb-2">
            <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>Analytics</Text>
          </Animated.View>

          {/* Month Selector */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <View className="flex-row justify-between items-center mx-6 mb-5">
              <Pressable
                onPress={() => setSelectedMonth((m) => subMonths(m, 1))}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ChevronLeft size={20} color={colors.primary} />
              </Pressable>
              <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '700' }}>
                {format(selectedMonth, 'MMMM yyyy')}
              </Text>
              <Pressable
                onPress={() => setSelectedMonth((m) => addMonths(m, 1))}
                disabled={isThisMonth(selectedMonth)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: isThisMonth(selectedMonth) ? colors.muted : colors.card,
                  borderWidth: 1, borderColor: colors.border,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: isThisMonth(selectedMonth) ? 0.4 : 1,
                }}
              >
                <ChevronRight size={20} color={colors.primary} />
              </Pressable>
            </View>
          </Animated.View>

          {monthExpenses.length === 0 ? (
            <EmptyState emoji="📊" title="No data for this month" subtitle="Add some expenses to see your analytics." />
          ) : (
            <>
              {/* Stats Row */}
              <Animated.View entering={FadeInDown.delay(140).duration(400)} className="flex-row px-6 mb-5 gap-3">
                {[
                  { label: 'Total Spent', value: formatCurrency(monthTotal, currency), icon: TrendingDown, color: colors.danger },
                  { label: 'Daily Avg', value: formatCurrency(Math.round(monthAvg), currency), icon: TrendingUp, color: colors.accent },
                  { label: 'Transactions', value: `${monthExpenses.length}`, icon: Zap, color: colors.warning },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    className="flex-1 rounded-2xl p-3"
                    style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                  >
                    <stat.icon size={14} color={stat.color} />
                    <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '800', marginTop: 6 }}>
                      {stat.value}
                    </Text>
                    <Text style={{ color: colors.secondary, fontSize: 10, marginTop: 1 }}>
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </Animated.View>

              {/* Daily Bar Chart */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mx-6 mb-5">
                <View
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
                    Daily Spending
                  </Text>
                  <View style={{ height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end' }}>
                    {dailyData.map((d, i) => {
                      const barHeight = d.total > 0 ? Math.max(4, (d.total / maxDay) * (CHART_HEIGHT - 20)) : 4;
                      return (
                        <View
                          key={i}
                          style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
                        >
                          <View
                            style={{
                              width: '60%',
                              height: barHeight,
                              backgroundColor: d.total > 0 ? '#22C55E' : colors.muted,
                              borderRadius: 3,
                              opacity: d.total > 0 ? 1 : 0.3,
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                  {/* X-axis labels — show every 5th */}
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    {dailyData.map((d, i) => (
                      <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                        {i % 5 === 0 && (
                          <Text style={{ color: colors.secondary, fontSize: 9 }}>{d.day}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>

              {/* Category Breakdown */}
              <Animated.View entering={FadeInDown.delay(260).duration(400)} className="mx-6 mb-5">
                <View
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
                    Category Breakdown
                  </Text>
                  {catBreakdown.map((item, i) => (
                    <View key={item.id} className="mb-4">
                      <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center">
                          <View
                            style={{
                              width: 10, height: 10, borderRadius: 5,
                              backgroundColor: item.category?.color || '#22C55E',
                              marginRight: 8,
                            }}
                          />
                          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '500' }}>
                            {item.category?.name || 'Other'}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <Text style={{ color: colors.secondary, fontSize: 12 }}>
                            {item.pct.toFixed(0)}%
                          </Text>
                          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
                            {formatCurrency(item.amount, currency)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          height: 6,
                          backgroundColor: colors.muted,
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            height: 6,
                            width: `${item.pct}%`,
                            backgroundColor: item.category?.color || '#22C55E',
                            borderRadius: 3,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </Animated.View>

              {/* Smart Insights */}
              {insights.length > 0 && (
                <Animated.View entering={FadeInDown.delay(320).duration(400)} className="mx-6 mb-5">
                  <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
                    Smart Insights
                  </Text>
                  {insights.map((insight, i) => (
                    <View
                      key={i}
                      className="rounded-2xl p-4 mb-3"
                      style={{
                        backgroundColor: `${colors.accent}12`,
                        borderWidth: 1,
                        borderColor: `${colors.accent}30`,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 14, lineHeight: 20 }}>
                        {insight}
                      </Text>
                    </View>
                  ))}
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
