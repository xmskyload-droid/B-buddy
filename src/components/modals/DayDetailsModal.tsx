import React from 'react';
import { View, Text, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { X, Plus, Calendar as CalendarIcon, Wallet, CreditCard, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Expense, Category } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ExpenseCard } from '../cards/ExpenseCard';

interface DayDetailsModalProps {
  visible: boolean;
  date: Date | null;
  expenses: Expense[];
  categories: Category[];
  onClose: () => void;
}

export const DayDetailsModal = ({
  visible,
  date,
  expenses,
  categories,
  onClose,
}: DayDetailsModalProps) => {
  const { colors, isDark } = useTheme();
  const { currency } = useSettingsStore();
  const router = useRouter();

  if (!date || !visible) return null;

  const dateStr = date.toISOString().split('T')[0];

  // Filter expenses for this specific day
  const dayExpenses = expenses.filter(e => {
    const dStr = new Date(e.date).toISOString().split('T')[0];
    return dStr === dateStr;
  });

  const totalSpent = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown for this day
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const catTotals: Record<string, number> = {};
  dayExpenses.forEach(e => {
    catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount;
  });

  // Payment method breakdown for this day
  const paymentTotals: Record<string, number> = {};
  dayExpenses.forEach(e => {
    const pm = e.paymentMethod || 'Cash';
    paymentTotals[pm] = (paymentTotals[pm] || 0) + e.amount;
  });

  const handleAddExpenseForDay = () => {
    onClose();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/add-expense',
      params: { initialDate: date.toISOString() },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        
        <View style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: '85%',
          borderTopWidth: 1,
          borderColor: colors.border,
        }}>
          {/* Handle bar */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 }}>
            <View>
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>
                {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </Text>
              <Text style={{ color: colors.secondary, fontSize: 13, marginTop: 2 }}>
                {dayExpenses.length} transactions recorded
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
            >
              <X size={18} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
            
            {/* Top Stat Cards */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>TOTAL SPENT</Text>
                <Text style={{ color: totalSpent > 0 ? '#EF4444' : colors.primary, fontSize: 22, fontWeight: '800' }}>
                  {formatCurrency(totalSpent, currency)}
                </Text>
              </View>

              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>TRANSACTIONS</Text>
                <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>
                  {dayExpenses.length}
                </Text>
              </View>
            </View>

            {/* Quick Add Button */}
            <Pressable
              onPress={handleAddExpenseForDay}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#22C55E',
                height: 52,
                borderRadius: 16,
                marginBottom: 24,
                gap: 8,
              }}
            >
              <Plus size={20} color="white" strokeWidth={2.5} />
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>
                Add Expense for {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </Pressable>

            {dayExpenses.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📅</Text>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>No expenses recorded</Text>
                <Text style={{ color: colors.secondary, fontSize: 13, textAlign: 'center' }}>
                  You spent nothing on this day. Tap the button above to add an expense.
                </Text>
              </View>
            ) : (
              <>
                {/* Category Breakdown */}
                {Object.keys(catTotals).length > 0 && (
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>
                      BY CATEGORY
                    </Text>
                    <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
                      {Object.entries(catTotals).map(([catId, amt]) => {
                        const cat = categoryMap.get(catId);
                        const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : '0';
                        return (
                          <View key={catId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat?.color || '#22C55E', marginRight: 10 }} />
                              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>{cat?.name || 'Other'}</Text>
                            </View>
                            <Text style={{ color: colors.secondary, fontSize: 13, marginRight: 12 }}>{pct}%</Text>
                            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>{formatCurrency(amt, currency)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Transactions List */}
                <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>
                  TRANSACTIONS LIST
                </Text>
                <View style={{ gap: 8 }}>
                  {dayExpenses.map((expense, idx) => (
                    <Pressable
                      key={expense.id}
                      onPress={() => {
                        onClose();
                        router.push(`/expense/${expense.id}`);
                      }}
                    >
                      <ExpenseCard expense={expense} delay={idx * 40} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
