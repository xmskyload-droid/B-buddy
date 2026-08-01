import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StatusBar, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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
const SCREEN_WIDTH = Dimensions.get('window').width;
const KEY_WIDTH = Math.floor((SCREEN_WIDTH - 32 - 16) / 3); // 32 padding + 16 for gaps
const KEY_HEIGHT = Math.floor(KEY_WIDTH * 0.58);

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
  const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));

  const handleKey = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount((prev) => prev + '.');
    } else {
      if (amount.length >= 10) return;
      if (amount === '0' && key !== '.') setAmount(key);
      else setAmount((prev) => prev + key);
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
    setTimeout(() => { router.back(); }, 400);
  };

  const displayAmount = amount || '0';
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}>
            <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color={colors.primary} />
            </Pressable>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>New Expense</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            
            {/* Amount Hero */}
            <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ alignItems: 'center', paddingVertical: 40 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.secondary, fontSize: 24, fontWeight: '600', marginRight: 8, marginTop: 12 }}>{currency}</Text>
                <Text style={{ color: amount ? colors.primary : colors.secondary, fontSize: 56, fontWeight: '800' }}>{displayAmount}</Text>
              </View>
              {selectedCategory && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: `${selectedCategory.color}20`, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>{getCategoryEmoji(selectedCategory.icon)}</Text>
                  <Text style={{ color: selectedCategory.color, fontSize: 14, fontWeight: '700' }}>{selectedCategory.name}</Text>
                </View>
              )}
            </Animated.View>

            {/* Category */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 20 }}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {categories.map((cat) => (
                  <Pressable key={cat.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategoryId(cat.id); }} style={{ alignItems: 'center', width: 56 }}>
                    <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: categoryId === cat.id ? cat.color : `${colors.card}`, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: categoryId === cat.id ? 2 : 1, borderColor: categoryId === cat.id ? cat.color : colors.border, opacity: categoryId === cat.id ? 1 : 0.7 }}>
                      <Text style={{ fontSize: 24 }}>{getCategoryEmoji(cat.icon)}</Text>
                    </View>
                    <Text style={{ color: categoryId === cat.id ? cat.color : colors.secondary, fontSize: 10, fontWeight: categoryId === cat.id ? '700' : '500' }} numberOfLines={1}>{cat.name.split(' ')[0]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Payment Method */}
            <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 20 }}>PAYMENT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                {PAYMENT_METHODS.map((method) => (
                  <Pressable key={method.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPaymentMethod(method.id); }} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: paymentMethod === method.id ? '#22C55E' : colors.card, borderWidth: 1, borderColor: paymentMethod === method.id ? '#22C55E' : colors.border }}>
                    <Text style={{ fontSize: 14, marginRight: 8 }}>{method.emoji}</Text>
                    <Text style={{ color: paymentMethod === method.id ? 'white' : colors.primary, fontSize: 13, fontWeight: '600' }}>{method.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Notes */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>NOTE (OPTIONAL)</Text>
              <TextInput placeholder="Coffee with friends..." placeholderTextColor={colors.secondary} value={notes} onChangeText={setNotes} style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14, color: colors.primary, fontSize: 15, fontWeight: '500' }} />
            </Animated.View>

            {/* Numpad */}
            <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {KEYPAD.map((key) => (
                  <Pressable
                    key={key}
                    onPress={() => handleKey(key)}
                    style={({ pressed }) => ({
                      width: KEY_WIDTH,
                      height: KEY_HEIGHT,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: pressed
                        ? colors.muted
                        : key === '⌫'
                        ? 'rgba(239,68,68,0.1)'
                        : colors.card,
                      borderRadius: 16,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: key === '⌫' ? 20 : 26,
                        fontWeight: '600',
                        color: key === '⌫' ? '#EF4444' : colors.primary,
                      }}
                    >
                      {key}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Save Button */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[{ paddingHorizontal: 20 }, saveStyle]}>
              <Pressable onPress={handleSave} disabled={saving || saved || !amount || parseFloat(amount) <= 0} style={{ height: 58, borderRadius: 18, backgroundColor: saved ? '#16A34A' : '#22C55E', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1 }}>
                {saved ? (
                  <>
                    <Check size={22} color="white" />
                    <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginLeft: 8 }}>Saved!</Text>
                  </>
                ) : (
                  <Text style={{ color: 'white', fontSize: 17, fontWeight: '800' }}>Save Expense</Text>
                )}
              </Pressable>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
