import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, Alert, ActivityIndicator } from 'react-native';
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
  isWithinInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, FileText, FileSpreadsheet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenseStore } from '../../store/expenseStore';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { exportToPDF, exportToCSV } from '../../utils/export';

interface InteractiveCalendarProps {
  expenses: Expense[];
  onSelectDate: (date: Date) => void;
  onLongPressDate?: (date: Date) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = [2024, 2025, 2026, 2027, 2028];

// Helper to chunk array into weeks of 7 days
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const results: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

export const InteractiveCalendar = ({
  expenses,
  onSelectDate,
  onLongPressDate,
}: InteractiveCalendarProps) => {
  const { colors, isDark } = useTheme();
  const { currency } = useSettingsStore();
  const { categories } = useExpenseStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

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

  // Active month expenses & stats
  const monthlyStats = useMemo(() => {
    const mStart = startOfMonth(currentMonth);
    const mEnd = endOfMonth(currentMonth);
    const mExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start: mStart, end: mEnd }));
    const total = mExpenses.reduce((sum, e) => sum + e.amount, 0);
    const uniqueDays = new Set(mExpenses.map(e => new Date(e.date).toISOString().split('T')[0])).size;
    const avgPerDay = uniqueDays > 0 ? total / uniqueDays : 0;

    return {
      total,
      count: mExpenses.length,
      uniqueDays,
      avgPerDay,
      monthExpenses: mExpenses,
    };
  }, [expenses, currentMonth]);

  // Build grid dates chunked by weeks (7 days per row)
  const weekRows = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
    return chunkArray(allDays, 7);
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

  // Export Monthly Report Handlers
  const handleExportMonthReport = () => {
    const monthName = format(currentMonth, 'MMMM yyyy');
    Alert.alert(
      `Export ${monthName} Report`,
      'Choose a format to download or share your monthly expense report:',
      [
        {
          text: '📄 Export PDF Report',
          onPress: async () => {
            try {
              setExporting('pdf');
              await exportToPDF(expenses, categories, monthlyStats.total, currency, currentMonth);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
              Alert.alert('Export Error', 'Could not generate monthly PDF report.');
            } finally {
              setExporting(null);
            }
          },
        },
        {
          text: '📊 Export CSV Spreadsheet',
          onPress: async () => {
            try {
              setExporting('csv');
              await exportToCSV(expenses, categories, currency, currentMonth);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
              Alert.alert('Export Error', 'Could not generate monthly CSV spreadsheet.');
            } finally {
              setExporting(null);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 12, elevation: 3 }}>
      
      {/* Header Month Navigation & Download Button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Pressable
          onPress={() => setShowPickerModal(true)}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}
        >
          <CalendarIcon size={18} color="#22C55E" style={{ marginRight: 8 }} />
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Download Monthly Report Button */}
          <Pressable
            onPress={handleExportMonthReport}
            disabled={!!exporting}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#22C55E15',
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#22C55E40',
              gap: 6,
            }}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#22C55E" />
            ) : (
              <>
                <Download size={16} color="#22C55E" />
                <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '700' }}>Report</Text>
              </>
            )}
          </Pressable>

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

      {/* Month Summary Bar */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.background, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border, justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>SPENT IN {format(currentMonth, 'MMM').toUpperCase()}</Text>
          <Text style={{ color: monthlyStats.total > 0 ? '#EF4444' : colors.primary, fontSize: 20, fontWeight: '800', marginTop: 2 }}>
            {formatCurrency(monthlyStats.total, currency)}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>DAILY AVG</Text>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
            {formatCurrency(monthlyStats.avgPerDay, currency)}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>ITEMS</Text>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
            {monthlyStats.count}
          </Text>
        </View>
      </View>

      {/* Weekday Row Headers */}
      <View style={{ flexDirection: 'row', width: '100%', marginBottom: 10 }}>
        {WEEKDAYS.map((wd, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '700' }}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Pixel-Perfect 7-Column Grid by Week Rows */}
      <View style={{ gap: 6 }}>
        {weekRows.map((week, wIdx) => (
          <View key={wIdx} style={{ flexDirection: 'row', width: '100%' }}>
            {week.map((day, dIdx) => {
              const dateKey = day.toISOString().split('T')[0];
              const expenseInfo = dailyExpenseMap.get(dateKey);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              const isCurrentMonthDay = isSameMonth(day, currentMonth);

              return (
                <View key={dIdx} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 2 }}>
                  <Pressable
                    onPress={() => handleDatePress(day)}
                    onLongPress={() => handleDateLongPress(day)}
                    style={({ pressed }) => ({
                      width: '100%',
                      height: 52,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? '#22C55E'
                        : pressed
                        ? colors.muted
                        : isCurrentMonthDay
                        ? colors.background
                        : 'transparent',
                      borderWidth: isCurrentDay && !isSelected ? 1.5 : isSelected ? 0 : 1,
                      borderColor: isCurrentDay && !isSelected ? '#22C55E' : isSelected ? 'transparent' : isCurrentMonthDay ? colors.border : 'transparent',
                      opacity: isCurrentMonthDay ? 1 : 0.25,
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

                    {/* Expense Badge & Indicator Dot */}
                    {expenseInfo && expenseInfo.total > 0 && (
                      <View style={{ alignItems: 'center', marginTop: 1 }}>
                        <Text
                          style={{
                            color: isSelected ? 'white' : '#EF4444',
                            fontSize: 9,
                            fontWeight: '800',
                          }}
                          numberOfLines={1}
                        >
                          {expenseInfo.total >= 1000 ? `${(expenseInfo.total/1000).toFixed(0)}k` : `${currency}${expenseInfo.total}`}
                        </Text>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? 'white' : '#22C55E', marginTop: 1 }} />
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
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
