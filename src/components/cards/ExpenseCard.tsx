import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, SlideOutRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Expense } from '../../types';
import { formatCurrency, formatRelativeDate, getCategoryById } from '../../utils/formatters';
import { useExpenseStore } from '../../store/expenseStore';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  pizza: '🍕', car: '🚗', fuel: '⛽', 'shopping-bag': '🛍️',
  'file-text': '🧾', activity: '💊', book: '📚', plane: '✈️',
  film: '🎬', repeat: '🔄', 'trending-up': '📈', 'dollar-sign': '💰',
  gift: '🎁', home: '🏠', grid: '📦',
};

const PAYMENT_METHOD_SHORT: Record<string, string> = {
  CASH: 'Cash', UPI: 'UPI', CREDIT_CARD: 'Credit',
  DEBIT_CARD: 'Debit', BANK: 'Bank', WALLET: 'Wallet',
};

interface ExpenseCardProps {
  expense: Expense;
  delay?: number;
}

export const ExpenseCard = ({ expense, delay = 0 }: ExpenseCardProps) => {
  const { categories } = useExpenseStore();
  const { colors } = useTheme();
  const { currency } = useSettingsStore();
  const router = useRouter();

  const category = getCategoryById(expense.categoryId, categories);
  const emoji = category ? (CATEGORY_EMOJI_MAP[category.icon] || '📦') : '📦';
  const catColor = category?.color || '#22C55E';
  const catName = category?.name || 'Other';
  const pmLabel = PAYMENT_METHOD_SHORT[expense.paymentMethod] || expense.paymentMethod;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350)}
      exiting={SlideOutRight.duration(250)}
      style={{ marginBottom: 10 }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/expense/${expense.id}`);
        }}
        style={({ pressed }) => ({
          backgroundColor: colors.card,
          borderRadius: 18,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        {/* Category Icon */}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: `${catColor}20`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>

        {/* Details */}
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: colors.primary, fontSize: 15, fontWeight: '600', marginBottom: 3 }}
            numberOfLines={1}
          >
            {catName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: colors.secondary, fontSize: 12 }}>
              {formatRelativeDate(expense.date)}
            </Text>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: colors.secondary,
                opacity: 0.5,
              }}
            />
            <View
              style={{
                backgroundColor: colors.muted,
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: colors.secondary, fontSize: 10, fontWeight: '600' }}>
                {pmLabel}
              </Text>
            </View>
          </View>
          {expense.notes ? (
            <Text
              style={{ color: colors.secondary, fontSize: 12, marginTop: 2 }}
              numberOfLines={1}
            >
              {expense.notes}
            </Text>
          ) : null}
        </View>

        {/* Amount */}
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>
          -{formatCurrency(expense.amount, currency)}
        </Text>
      </Pressable>
    </Animated.View>
  );
};
