import React, { useMemo } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react-native';

import { useTheme } from '../../hooks/useTheme';
import { useExpenses } from '../../hooks/useExpenses';
import { WeeklyBarChart } from '../../components/charts/WeeklyBarChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenseStore } from '../../store/expenseStore';

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const { 
    totalThisMonth, 
    expensesByCategory, 
    expenses, 
    totalThisWeek, 
    totalLastWeek, 
    dailyAverage, 
    weeklyData: rawWeeklyData 
  } = useExpenses();
  const { currency } = useSettingsStore();
  const { categories } = useExpenseStore();

  const donutData = useMemo(() => {
    return expensesByCategory.map(e => ({
      label: e.category?.name || 'Other',
      name: e.category?.name || 'Other',
      amount: e.amount,
      percentage: (e.amount / Math.max(totalThisMonth, 1)) * 100,
      color: e.category?.color || '#22C55E'
    }));
  }, [expensesByCategory, totalThisMonth]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = new Date().getDay();
    const mapDay = currentDay === 0 ? 6 : currentDay - 1;
    return days.map((day, i) => ({
      day,
      amount: rawWeeklyData[i] || 0,
      isToday: i === mapDay,
    }));
  }, [rawWeeklyData]);
  const maxWeeklyAmount = Math.max(...weeklyData.map(d => d.amount), 1);
  
  const avgPerDay = totalThisMonth / Math.max(1, new Date().getDate());

  const generateInsights = () => {
    const insights = [];
    
    // Insight 1: Top category
    const topCategoryEntry = expensesByCategory[0];
    if (topCategoryEntry && topCategoryEntry.amount > 0) {
      const cat = topCategoryEntry.category;
      const pct = totalThisMonth > 0 ? ((topCategoryEntry.amount / totalThisMonth) * 100).toFixed(0) : 0;
      if (cat) insights.push({ emoji: '🏆', title: `Top Category: ${cat.name}`, body: `${pct}% of your spending this month (${currency}${topCategoryEntry.amount.toFixed(0)})` });
    }
    
    // Insight 2: Week comparison
    if (totalLastWeek > 0) {
      const diff = ((totalThisWeek - totalLastWeek) / totalLastWeek) * 100;
      const up = diff > 0;
      insights.push({
        emoji: up ? '⚠️' : '✅',
        title: up ? 'Spending Up' : 'Spending Down',
        body: `You spent ${Math.abs(diff).toFixed(0)}% ${up ? 'more' : 'less'} this week vs last week`,
      });
    } else if (totalThisWeek > 0) {
      insights.push({ emoji: '📊', title: 'First Week Data', body: `You've spent ${currency}${totalThisWeek.toFixed(0)} this week` });
    }
    
    // Insight 3: Daily average
    if (dailyAverage > 0) {
      insights.push({ emoji: '📅', title: 'Daily Average', body: `You spend about ${currency}${dailyAverage.toFixed(0)} per day this month` });
    }
  
    return insights;
  };
  
  const insights = generateInsights();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(0).duration(400)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
            <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '800' }}>Analytics</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: colors.border }}>
              <ChevronLeft size={18} color={colors.secondary} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', marginHorizontal: 8 }}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
              <ChevronRight size={18} color={colors.secondary} />
            </View>
          </Animated.View>

          {/* Top Stats */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24, gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 10, elevation: 2 }}>
              <TrendingDown size={18} color="#EF4444" style={{ marginBottom: 12 }} />
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>{formatCurrency(totalThisMonth, currency)}</Text>
              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '500' }}>Total Spent</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 10, elevation: 2 }}>
              <Target size={18} color="#3B82F6" style={{ marginBottom: 12 }} />
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>{formatCurrency(avgPerDay, currency)}</Text>
              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '500' }}>Avg / Day</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 10, elevation: 2 }}>
              <TrendingUp size={18} color="#22C55E" style={{ marginBottom: 12 }} />
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>{expenses.length}</Text>
              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '500' }}>Transactions</Text>
            </View>
          </Animated.View>

          {/* Spending Trend */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 12, elevation: 3 }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>Spending Trend</Text>
              <WeeklyBarChart data={weeklyData} maxValue={maxWeeklyAmount} />
            </View>
          </Animated.View>

          {/* Category Breakdown */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 12, elevation: 3 }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>By Category</Text>
              <DonutChart data={donutData} total={totalThisMonth} />
            </View>
          </Animated.View>

          {/* Smart Insights */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Smart Insights</Text>
            
            {insights.length > 0 ? insights.map((insight, index) => (
              <View key={index} style={{ backgroundColor: '#22C55E15', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#22C55E40', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <Text style={{ fontSize: 20 }}>{insight.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>{insight.title}</Text>
                  <Text style={{ color: colors.secondary, fontSize: 13, lineHeight: 18 }}>{insight.body}</Text>
                </View>
              </View>
            )) : (
              <Text style={{ color: colors.secondary, fontSize: 14, textAlign: 'center', marginVertical: 20 }}>Not enough data for insights yet.</Text>
            )}
            
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
