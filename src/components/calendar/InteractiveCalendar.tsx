import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Alert } from 'react-native';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  setYear,
  setMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface InteractiveCalendarProps {
  expenses: Expense[];
  onSelectDate: (date: Date) => void;
  onLongPressDate?: (date: Date) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = [2024, 2025, 2026, 2027, 2028];

export const InteractiveCalendar = ({
  expenses,
  onSelectDate,
  onLongPressDate,
}: InteractiveCalendarProps) => {
  const { colors, isDark } = useTheme();
  const { currency } = useSettingsStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPickerModal, setShowPickerModal] = useState(false);

  // Map expenses to date strings for O(1) daily total lookup
  const dailyExpenseMap = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(e => {
      const dateKey = new Date(e.date).toISOString().split('T')[0];
      const prev = map.get(dateKey) || { total: 0, count: 0 };
      map.set(dateKey, { total: prev.total + e.amount, count: prev.count + 1 });
    });
    return map;
  }, [expenses]);

  // Build grid dates
  const daysInGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDatePress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
    onSelectDate(date);
  };

  const handleDateLongPress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onLongPressDate) {
      onLongPressDate(date);
    }
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border }}>
      {/* Header Month Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Pressable
          onPress={() => setShowPickerModal(true)}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}
        >
          <CalendarIcon size={16} color="#22C55E" style={{ marginRight: 8 }} />
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={handlePrevMonth}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
          >
            <ChevronLeft size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={handleNextMonth}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
          >
            <ChevronRight size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {WEEKDAYS.map((wd, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700' }}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Calendar 7-Column Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {daysInGrid.map((day, idx) => {
          const dateKey = day.toISOString().split('T')[0];
          const expenseInfo = dailyExpenseMap.get(dateKey);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isCurrentMonthDay = isSameMonth(day, currentMonth);

          return (
            <Pressable
              key={idx}
              onPress={() => handleDatePress(day)}
              onLongPress={() => handleDateLongPress(day)}
              style={({ pressed }) => ({
                width: '14.28%',
                height: 54,
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 6,
                borderRadius: 14,
                backgroundColor: isSelected
                  ? '#22C55E'
                  : pressed
                  ? colors.muted
                  : 'transparent',
                borderWidth: isCurrentDay && !isSelected ? 1.5 : 0,
                borderColor: isCurrentDay && !isSelected ? '#22C55E' : 'transparent',
                opacity: isCurrentMonthDay ? 1 : 0.3,
              })}
            >
              {/* Day Number */}
              <Text
                style={{
                  color: isSelected ? 'white' : isCurrentDay ? '#22C55E' : colors.primary,
                  fontSize: 14,
                  fontWeight: isSelected || isCurrentDay ? '800' : '600',
                }}
              >
                {format(day, 'd')}
              </Text>

              {/* Expense Total Badge or Dot */}
              {expenseInfo && expenseInfo.total > 0 && (
                <View style={{ alignItems: 'center', marginTop: 2 }}>
                  <Text
                    style={{
                      color: isSelected ? 'white' : '#EF4444',
                      fontSize: 8,
                      fontWeight: '700',
                    }}
                    numberOfLines={1}
                  >
                    {expenseInfo.total >= 1000 ? `${(expenseInfo.total/1000).toFixed(0)}k` : `${currency}${expenseInfo.total}`}
                  </Text>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? 'white' : '#22C55E', marginTop: 1 }} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Jump to Month/Year Picker Modal */}
      <Modal visible={showPickerModal} transparent animationType="fade" onRequestClose={() => setShowPickerModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' }}>
              Select Month & Year
            </Text>

            {/* Year Selector */}
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>YEAR</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {YEARS.map(yr => (
                <Pressable
                  key={yr}
                  onPress={() => setCurrentMonth(prev => setYear(prev, yr))}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: currentMonth.getFullYear() === yr ? '#22C55E' : colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: currentMonth.getFullYear() === yr ? 'white' : colors.primary, fontSize: 13, fontWeight: '700' }}>{yr}</Text>
                </Pressable>
              ))}
            </View>

            {/* Month Selector */}
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>MONTH</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {MONTHS.map((m, idx) => (
                <Pressable
                  key={m}
                  onPress={() => setCurrentMonth(prev => setMonth(prev, idx))}
                  style={{
                    width: '30%',
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: currentMonth.getMonth() === idx ? '#22C55E' : colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: currentMonth.getMonth() === idx ? 'white' : colors.primary, fontSize: 13, fontWeight: '700' }}>{m}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setShowPickerModal(false)}
              style={{ height: 48, borderRadius: 14, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
