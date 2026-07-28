import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenseStore } from '../../store/expenseStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PaymentMethod, Expense } from '../../types';

interface AddExpenseFormProps {
  initialData?: Expense;
}

export const AddExpenseForm = ({ initialData }: AddExpenseFormProps) => {
  const router = useRouter();
  const { categories, addExpense, updateExpense } = useExpenseStore();
  
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>(
    initialData?.paymentMethod || PaymentMethod.UPI
  );

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) return;

    const expenseData: Expense = {
      id: initialData?.id || Date.now().toString(),
      amount: Number(amount),
      categoryId,
      date: initialData?.date || new Date().toISOString(),
      paymentMethod,
      notes,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (initialData) {
      await updateExpense(expenseData);
    } else {
      await addExpense(expenseData);
    }
    
    router.back();
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Input
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
      />
      
      <Text className="text-secondary font-medium mb-2 ml-1">Category</Text>
      <View className="flex-row flex-wrap mb-4">
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategoryId(cat.id)}
            className={`mr-2 mb-2 px-4 py-2 rounded-xl border-2 ${
              categoryId === cat.id ? 'border-accent bg-accent/10' : 'border-border'
            }`}
          >
            <Text className={categoryId === cat.id ? 'text-accent font-bold' : 'text-primary'}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-secondary font-medium mb-2 ml-1">Payment Method</Text>
      <View className="flex-row flex-wrap mb-4">
        {Object.values(PaymentMethod).map((method) => (
          <Pressable
            key={method}
            onPress={() => setPaymentMethod(method)}
            className={`mr-2 mb-2 px-4 py-2 rounded-xl border-2 ${
              paymentMethod === method ? 'border-accent bg-accent/10' : 'border-border'
            }`}
          >
            <Text className={paymentMethod === method ? 'text-accent font-bold' : 'text-primary'}>
              {method}
            </Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes"
      />
      
      <Button title={initialData ? "Update Expense" : "Save Expense"} onPress={handleSave} className="mt-4 mb-12" />
    </ScrollView>
  );
};
