import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Budget } from '../../types';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SetBudgetModal = ({ visible, onClose }: SetBudgetModalProps) => {
  const { colors } = useTheme();
  const { addBudget, budgets } = useExpenseStore();
  const { currency } = useSettingsStore();
  const now = new Date();
  
  // Find existing budget for this month
  const existingBudget = budgets.find(
    b => !b.categoryId && b.month === now.getMonth() && b.year === now.getFullYear()
  );
  
  const [amount, setAmount] = useState(existingBudget ? existingBudget.monthlyLimit.toString() : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const limit = parseFloat(amount);
    if (!limit || limit <= 0) return;
    setSaving(true);
    try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch(e) {}
    const budget: Budget = {
      id: existingBudget?.id || Date.now().toString(),
      categoryId: undefined,
      monthlyLimit: limit,
      currentSpent: 0,
      month: now.getMonth(),
      year: now.getFullYear(),
    };
    await addBudget(budget);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        <View style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 28,
          paddingBottom: 40,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>Set Monthly Budget</Text>
            <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color={colors.secondary} />
            </Pressable>
          </View>
          
          <Text style={{ color: colors.secondary, fontSize: 13, marginBottom: 12 }}>
            How much do you want to spend this month?
          </Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#22C55E',
            paddingHorizontal: 16,
            paddingVertical: 4,
            marginBottom: 24,
          }}>
            <Text style={{ color: colors.secondary, fontSize: 22, fontWeight: '600', marginRight: 8 }}>{currency}</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="10,000"
              placeholderTextColor={colors.secondary}
              style={{ flex: 1, color: colors.primary, fontSize: 28, fontWeight: '800', paddingVertical: 12 }}
              autoFocus
            />
          </View>
          
          <Pressable
            onPress={handleSave}
            disabled={saving || !amount || parseFloat(amount) <= 0}
            style={{
              height: 56,
              borderRadius: 16,
              backgroundColor: '#22C55E',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1,
            }}
          >
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '800' }}>Save Budget</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
