import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useTheme } from '../hooks/useTheme';
import { useExpenseStore } from '../store/expenseStore';
import { useSettingsStore } from '../store/settingsStore';
import { PaymentMethod, Expense } from '../types';
import { defaultCategories } from '../utils/categories';

const PAYMENT_METHODS = [
  { id: PaymentMethod.CASH, label: 'Cash', emoji: '💵' },
  { id: PaymentMethod.UPI, label: 'UPI', emoji: '📱' },
  { id: PaymentMethod.CREDIT_CARD, label: 'Credit', emoji: '💳' },
  { id: PaymentMethod.DEBIT_CARD, label: 'Debit', emoji: '🏧' },
  { id: PaymentMethod.BANK, label: 'Bank', emoji: '🏦' },
  { id: PaymentMethod.WALLET, label: 'Wallet', emoji: '👛' },
];

function getCategoryEmoji(icon: string): string {
  const map: Record<string, string> = {
    pizza: '🍕', car: '🚗', fuel: '⛽', 'shopping-bag': '🛍️',
    'file-text': '🧾', activity: '💊', book: '📚', plane: '✈️',
    film: '🎬', repeat: '🔄', 'trending-up': '📈', 'dollar-sign': '💰',
    gift: '🎁', home: '🏠', grid: '📦',
  };
  return map[icon] || '📦';
}

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

export default function AddExpenseScreen() {
  const { colors, isDark } = useTheme();
  const { addExpense, categories: storeCategories } = useExpenseStore();
  const { currency } = useSettingsStore();
  const router = useRouter();

  const categories = storeCategories.length > 0 ? storeCategories : defaultCategories;

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.UPI);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveScale = useSharedValue(1);
  const saveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const handleKey = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount((prev) => prev + '.');
    } else {
      if (amount.length >= 10) return;
      // Prevent multiple leading zeros
      if (amount === '0' && key !== '.') {
        setAmount(key);
      } else {
        setAmount((prev) => prev + key);
      }
    }
  }, [amount]);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSaving(true);
    saveScale.value = withSpring(0.95);

    const expense: Expense = {
      id: Date.now().toString(),
      amount: numAmount,
      categoryId,
      date: new Date().toISOString(),
      paymentMethod,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addExpense(expense);
    setSaving(false);
    setSaved(true);
    saveScale.value = withSpring(1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      router.back();
    }, 600);
  };

  const displayAmount = amount || '0';
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View
            className="flex-row justify-between items-center px-6 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
          >
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
              Add Expense
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={colors.secondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Display */}
            <Animated.View entering={FadeInDown.delay(50).duration(400)}>
              <View className="items-center pt-8 pb-6">
                <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '500', marginBottom: 4 }}>
                  AMOUNT
                </Text>
                <View className="flex-row items-baseline">
                  <Text style={{ color: colors.secondary, fontSize: 28, fontWeight: '500', marginRight: 4 }}>
                    {currency}
                  </Text>
                  <Text
                    style={{
                      color: amount ? colors.primary : colors.secondary,
                      fontSize: 56,
                      fontWeight: '800',
                    }}
                  >
                    {displayAmount}
                  </Text>
                </View>
                {selectedCategory && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 8,
                      backgroundColor: `${selectedCategory.color}20`,
                      borderRadius: 20,
                      paddingHorizontal: 14,
                      paddingVertical: 5,
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>
                      {getCategoryEmoji(selectedCategory.icon)}
                    </Text>
                    <Text style={{ color: selectedCategory.color, fontSize: 13, fontWeight: '600' }}>
                      {selectedCategory.name}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Category Picker */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mb-5">
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
                CATEGORY
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategoryId(cat.id);
                    }}
                    style={{
                      alignItems: 'center',
                      marginRight: 12,
                      width: 64,
                    }}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        backgroundColor: categoryId === cat.id ? cat.color : `${cat.color}22`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 5,
                        borderWidth: categoryId === cat.id ? 2 : 0,
                        borderColor: cat.color,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{getCategoryEmoji(cat.icon)}</Text>
                    </View>
                    <Text
                      style={{
                        color: categoryId === cat.id ? cat.color : colors.secondary,
                        fontSize: 10,
                        fontWeight: categoryId === cat.id ? '700' : '400',
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                    >
                      {cat.name.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Payment Method */}
            <Animated.View entering={FadeInDown.delay(160).duration(400)} className="px-6 mb-5">
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
                PAYMENT METHOD
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PAYMENT_METHODS.map((method) => (
                  <Pressable
                    key={method.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPaymentMethod(method.id);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 14,
                      backgroundColor:
                        paymentMethod === method.id ? '#22C55E' : colors.card,
                      borderWidth: 1,
                      borderColor:
                        paymentMethod === method.id ? '#22C55E' : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>{method.emoji}</Text>
                    <Text
                      style={{
                        color: paymentMethod === method.id ? 'white' : colors.secondary,
                        fontSize: 13,
                        fontWeight: '600',
                      }}
                    >
                      {method.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Notes */}
            <Animated.View entering={FadeInDown.delay(220).duration(400)} className="px-6 mb-5">
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
                NOTES (OPTIONAL)
              </Text>
              <TextInput
                placeholder="Add a note..."
                placeholderTextColor={colors.secondary}
                value={notes}
                onChangeText={setNotes}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.primary,
                  fontSize: 15,
                  height: 52,
                }}
              />
            </Animated.View>

            {/* Numeric Keypad */}
            <Animated.View entering={FadeInDown.delay(280).duration(400)} className="px-4 mb-4">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {KEYPAD.map((key) => (
                  <Pressable
                    key={key}
                    onPress={() => handleKey(key)}
                    style={({ pressed }) => ({
                      width: '33.33%',
                      aspectRatio: 2.2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: pressed
                        ? colors.muted
                        : key === '⌫' ? `${colors.danger}15` : colors.card,
                      borderRadius: 16,
                      margin: 3,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: key === '⌫' ? 20 : 24,
                        fontWeight: '600',
                        color: key === '⌫' ? colors.danger : colors.primary,
                      }}
                    >
                      {key}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Save Button */}
            <Animated.View style={[{ paddingHorizontal: 24, paddingBottom: 32 }, saveStyle]}>
              <Pressable
                onPress={handleSave}
                disabled={saving || saved}
                style={{
                  height: 60,
                  borderRadius: 20,
                  backgroundColor: saved ? '#16A34A' : '#22C55E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1,
                }}
              >
                {saved ? (
                  <>
                    <Check size={22} color="white" />
                    <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginLeft: 8 }}>
                      Saved!
                    </Text>
                  </>
                ) : (
                  <Text style={{ color: 'white', fontSize: 17, fontWeight: '800' }}>
                    {saving ? 'Saving...' : 'Save Expense'}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
