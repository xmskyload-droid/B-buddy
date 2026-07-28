import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../hooks/useTheme';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { PaymentMethod } from '../../types';
import { defaultCategories } from '../../utils/categories';
import { formatDate } from '../../utils/formatters';

const PAYMENT_METHODS = [
  { id: PaymentMethod.CASH, label: 'Cash', emoji: '💵' },
  { id: PaymentMethod.UPI, label: 'UPI', emoji: '📱' },
  { id: PaymentMethod.CREDIT_CARD, label: 'Credit', emoji: '💳' },
  { id: PaymentMethod.DEBIT_CARD, label: 'Debit', emoji: '🏧' },
  { id: PaymentMethod.BANK, label: 'Bank', emoji: '🏦' },
  { id: PaymentMethod.WALLET, label: 'Wallet', emoji: '👛' },
];

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  pizza: '🍕', car: '🚗', fuel: '⛽', 'shopping-bag': '🛍️',
  'file-text': '🧾', activity: '💊', book: '📚', plane: '✈️',
  film: '🎬', repeat: '🔄', 'trending-up': '📈', 'dollar-sign': '💰',
  gift: '🎁', home: '🏠', grid: '📦',
};

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { expenses, categories: storeCategories, updateExpense, deleteExpense } = useExpenseStore();
  const { currency } = useSettingsStore();

  const categories = storeCategories.length > 0 ? storeCategories : defaultCategories;
  const expense = expenses.find((e) => e.id === id);

  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState(expense?.categoryId || categories[0]?.id || 'food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (expense?.paymentMethod as PaymentMethod) || PaymentMethod.UPI
  );
  const [notes, setNotes] = useState(expense?.notes || '');
  const [saving, setSaving] = useState(false);

  if (!expense) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.secondary }}>Expense not found.</Text>
      </View>
    );
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    setSaving(true);
    await updateExpense({
      ...expense,
      amount: numAmount,
      categoryId,
      paymentMethod,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteExpense(expense.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ArrowLeft size={18} color={colors.primary} />
            </Pressable>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
              Edit Expense
            </Text>
            <Pressable
              onPress={handleDelete}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: `${colors.danger}18`, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trash2 size={18} color={colors.danger} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
            {/* Date Info */}
            <Text style={{ color: colors.secondary, fontSize: 13, marginBottom: 20 }}>
              Originally added on {formatDate(expense.date)}
            </Text>

            {/* Amount */}
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 }}>
              AMOUNT
            </Text>
            <View
              style={{
                backgroundColor: colors.card, borderRadius: 16, borderWidth: 1,
                borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20,
              }}
            >
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={{ color: colors.primary, fontSize: 24, fontWeight: '700' }}
                placeholder="0"
                placeholderTextColor={colors.secondary}
              />
            </View>

            {/* Category */}
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
              CATEGORY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={{
                    alignItems: 'center', marginRight: 12, width: 64,
                  }}
                >
                  <View
                    style={{
                      width: 52, height: 52, borderRadius: 16,
                      backgroundColor: categoryId === cat.id ? cat.color : `${cat.color}22`,
                      alignItems: 'center', justifyContent: 'center', marginBottom: 5,
                      borderWidth: categoryId === cat.id ? 2 : 0, borderColor: cat.color,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{CATEGORY_EMOJI_MAP[cat.icon] || '📦'}</Text>
                  </View>
                  <Text
                    style={{
                      color: categoryId === cat.id ? cat.color : colors.secondary,
                      fontSize: 10, fontWeight: categoryId === cat.id ? '700' : '400', textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {cat.name.split(' ')[0]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Payment Method */}
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
              PAYMENT METHOD
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {PAYMENT_METHODS.map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => setPaymentMethod(method.id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', marginRight: 8,
                    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14,
                    backgroundColor: paymentMethod === method.id ? '#22C55E' : colors.card,
                    borderWidth: 1, borderColor: paymentMethod === method.id ? '#22C55E' : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, marginRight: 6 }}>{method.emoji}</Text>
                  <Text style={{ color: paymentMethod === method.id ? 'white' : colors.secondary, fontSize: 13, fontWeight: '600' }}>
                    {method.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Notes */}
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
              NOTES
            </Text>
            <TextInput
              placeholder="Add a note..."
              placeholderTextColor={colors.secondary}
              value={notes}
              onChangeText={setNotes}
              style={{
                backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
                paddingHorizontal: 16, paddingVertical: 12, color: colors.primary, fontSize: 15, height: 52, marginBottom: 32,
              }}
            />

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                height: 58, borderRadius: 18, backgroundColor: '#22C55E',
                alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
              }}
            >
              <Check size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', marginLeft: 8 }}>
                {saving ? 'Saving...' : 'Update Expense'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
