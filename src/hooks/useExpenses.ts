import { useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { isThisMonth, isToday, parseISO } from 'date-fns';

export const useExpenses = () => {
  const { expenses, categories, loading } = useExpenseStore();

  const totalThisMonth = useMemo(() => {
    return expenses
      .filter(e => isThisMonth(parseISO(e.date)))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalToday = useMemo(() => {
    return expenses
      .filter(e => isToday(parseISO(e.date)))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses
      .filter(e => isThisMonth(parseISO(e.date)))
      .forEach(e => {
        grouped[e.categoryId] = (grouped[e.categoryId] || 0) + e.amount;
      });
      
    return Object.keys(grouped).map(id => ({
      categoryId: id,
      amount: grouped[id],
      category: categories.find(c => c.id === id)
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses, categories]);

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);
  
  const dailyAverage = useMemo(() => {
    const days = new Date().getDate();
    return totalThisMonth / days || 0;
  }, [totalThisMonth]);
  
  const biggestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return [...expenses].sort((a, b) => b.amount - a.amount)[0];
  }, [expenses]);

  return {
    expenses,
    loading,
    totalThisMonth,
    totalToday,
    expensesByCategory,
    recentExpenses,
    dailyAverage,
    biggestExpense
  };
};
