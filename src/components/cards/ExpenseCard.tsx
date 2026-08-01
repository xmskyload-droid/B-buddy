import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
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
  const { colors, isDark } = useTheme();
  const { currency } = useSettingsStore();
  const router = useRouter();

  const category = getCategoryById(expense.categoryId, categories);
  const emoji = category ? (CATEGORY_EMOJI_MAP[category.icon] || '📦') : '📦';
  const catColor = category?.color || '#22C55E';
  const catName = category?.name || 'Other';
  const pmLabel = PAYMENT_METHOD_SHORT[expense.paymentMethod] || expense.paymentMethod;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350)}
      style={[{ marginBottom: 12 }, animatedStyle]}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/expense/${expense.id}`);
        }}
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.04,
          shadowRadius: 8,
          elevation: isDark ? 4 : 2,
        }}
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
            marginRight: 14,
          }}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>

        {/* Details */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text
              style={{ color: colors.primary, fontSize: 15, fontWeight: '600', marginRight: 6 }}
              numberOfLines={1}
            >
              {catName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.secondary, fontSize: 12 }}>
              {formatRelativeDate(expense.date)}
            </Text>
            {expense.notes ? (
              <>
                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.secondary, opacity: 0.5, marginHorizontal: 6 }} />
                <Text
                  style={{ color: colors.secondary, fontSize: 12, flex: 1 }}
                  numberOfLines={1}
                >
                  {expense.notes}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Amount & Badge */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>
            -{formatCurrency(expense.amount, currency)}
          </Text>
          <View
            style={{
              backgroundColor: colors.muted,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: colors.secondary, fontSize: 10, fontWeight: '600' }}>
              {pmLabel}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};
