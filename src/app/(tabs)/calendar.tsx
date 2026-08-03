import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Filter, Calendar as CalendarIcon, RefreshCw, Download } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../hooks/useTheme';
import { useExpenses } from '../../hooks/useExpenses';
import { useExpenseStore } from '../../store/expenseStore';
import { useFilterStore, DateFilterType } from '../../store/filterStore';
import { InteractiveCalendar } from '../../components/calendar/InteractiveCalendar';
import { DayDetailsModal } from '../../components/modals/DayDetailsModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';

const FILTER_PRESETS: { type: DateFilterType; label: string }[] = [
  { type: 'THIS_MONTH', label: 'This Month' },
  { type: 'TODAY', label: 'Today' },
  { type: 'YESTERDAY', label: 'Yesterday' },
  { type: 'THIS_WEEK', label: 'This Week' },
  { type: 'LAST_WEEK', label: 'Last Week' },
  { type: 'LAST_MONTH', label: 'Last Month' },
  { type: 'ALL', label: 'All Time' },
];

export default function CalendarScreen() {
  const { colors, isDark } = useTheme();
  const { expenses } = useExpenses();
  const { categories } = useExpenseStore();
  const { currency } = useSettingsStore();
  const router = useRouter();

  const {
    filterType,
    setFilterType,
    selectedSingleDate,
    setSelectedSingleDate,
    resetFilter,
  } = useFilterStore();

  const [activeDateForModal, setActiveDateForModal] = useState<Date | null>(null);

  const handleSelectDate = (date: Date) => {
    setSelectedSingleDate(date);
    setActiveDateForModal(date);
  };

  const handleLongPressDate = (date: Date) => {
    Alert.alert(
      formatDate(date.toISOString()),
      'Choose an action for this date',
      [
        {
          text: 'Add Expense for Date',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({
              pathname: '/add-expense',
              params: { initialDate: date.toISOString() },
            });
          },
        },
        {
          text: 'View Day Details',
          onPress: () => setActiveDateForModal(date),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          
          {/* Title Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={{ paddingTop: 16, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '800' }}>Calendar</Text>
                <Text style={{ color: colors.secondary, fontSize: 13, marginTop: 2 }}>
                  Day-wise expense tracking & date filters
                </Text>
              </View>
              {selectedSingleDate && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    resetFilter();
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#22C55E15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
                >
                  <RefreshCw size={14} color="#22C55E" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '700' }}>Reset Filter</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Preset Filter Chips */}
          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {FILTER_PRESETS.map((preset) => {
                const isActive = filterType === preset.type && !selectedSingleDate;
                return (
                  <Pressable
                    key={preset.type}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFilterType(preset.type);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: isActive ? '#22C55E' : colors.card,
                      borderWidth: 1,
                      borderColor: isActive ? '#22C55E' : colors.border,
                    }}
                  >
                    <Text style={{ color: isActive ? 'white' : colors.primary, fontSize: 13, fontWeight: '600' }}>
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Interactive Calendar Component */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginBottom: 24 }}>
            <InteractiveCalendar
              expenses={expenses}
              onSelectDate={handleSelectDate}
              onLongPressDate={handleLongPressDate}
            />
          </Animated.View>

        </ScrollView>
      </SafeAreaView>

      {/* Day Details Bottom Sheet / Modal */}
      {activeDateForModal && (
        <DayDetailsModal
          visible={!!activeDateForModal}
          date={activeDateForModal}
          expenses={expenses}
          categories={categories}
          onClose={() => setActiveDateForModal(null)}
        />
      )}
    </View>
  );
}
