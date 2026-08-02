import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
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
    setTimeout(() => { router.back(); }, 300);
  };

  const isValidAmount = parseFloat(amount) > 0;
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          {/* Top Bar */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}
            >
              <X size={20} color={colors.primary} />
            </Pressable>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>New Expense</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            
            {/* Amount Hero Input */}
            <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.secondary, fontSize: 32, fontWeight: '700', marginRight: 6, marginTop: 4 }}>
                  {currency}
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={(text) => {
                    // Allow numbers and single decimal point
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 2) return;
                    setAmount(cleaned);
                  }}
                  keyboardType="decimal-pad"
                  autoFocus={true}
                  placeholder="0.00"
                  placeholderTextColor={colors.secondary}
                  selectionColor="#22C55E"
                  style={{
                    color: amount ? colors.primary : colors.secondary,
                    fontSize: 52,
                    fontWeight: '800',
                    textAlign: 'left',
                    minWidth: 140,
                    padding: 0,
                  }}
                />
              </View>
              
              <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '500', marginTop: 8 }}>
                Enter the expense amount
              </Text>

              {selectedCategory && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: `${selectedCategory.color}20`, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: `${selectedCategory.color}40` }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>{getCategoryEmoji(selectedCategory.icon)}</Text>
                  <Text style={{ color: selectedCategory.color, fontSize: 14, fontWeight: '700' }}>{selectedCategory.name}</Text>
                </View>
              )}
            </Animated.View>

            {/* Category Selector */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 20 }}>
                CATEGORY
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategoryId(cat.id);
                    }}
                    style={{ alignItems: 'center', width: 58 }}
                  >
                    <View style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      backgroundColor: categoryId === cat.id ? cat.color : colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      borderWidth: categoryId === cat.id ? 2 : 1,
                      borderColor: categoryId === cat.id ? cat.color : colors.border,
                      opacity: categoryId === cat.id ? 1 : 0.75,
                    }}>
                      <Text style={{ fontSize: 24 }}>{getCategoryEmoji(cat.icon)}</Text>
                    </View>
                    <Text style={{ color: categoryId === cat.id ? cat.color : colors.secondary, fontSize: 10, fontWeight: categoryId === cat.id ? '700' : '500' }} numberOfLines={1}>
                      {cat.name.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Payment Method Selector */}
            <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, paddingHorizontal: 20 }}>
                PAYMENT METHOD
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
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
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: paymentMethod === method.id ? '#22C55E' : colors.card,
                      borderWidth: 1,
                      borderColor: paymentMethod === method.id ? '#22C55E' : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 8 }}>{method.emoji}</Text>
                    <Text style={{ color: paymentMethod === method.id ? 'white' : colors.primary, fontSize: 13, fontWeight: '600' }}>
                      {method.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Notes Input */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>
                NOTE (OPTIONAL)
              </Text>
              <TextInput
                placeholder="Coffee with friends..."
                placeholderTextColor={colors.secondary}
                value={notes}
                onChangeText={setNotes}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: colors.primary,
                  fontSize: 15,
                  fontWeight: '500',
                }}
              />
            </Animated.View>

          </ScrollView>

          {/* Sticky Save Button at Bottom */}
          <Animated.View style={[{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 16 : 20, paddingTop: 10, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }, saveStyle]}>
            <Pressable
              onPress={handleSave}
              disabled={saving || saved || !isValidAmount}
              style={{
                height: 58,
                borderRadius: 18,
                backgroundColor: saved ? '#16A34A' : '#22C55E',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                opacity: !isValidAmount ? 0.5 : 1,
                shadowColor: '#22C55E',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isValidAmount ? 0.3 : 0,
                shadowRadius: 10,
                elevation: isValidAmount ? 4 : 0,
              }}
            >
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

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
