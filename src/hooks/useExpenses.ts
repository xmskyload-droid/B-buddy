import { useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { calculateDashboardMetrics } from '../utils/calculations';
import { getCategoryById } from '../utils/formatters';

export const useExpenses = () => {
  const { expenses, categories } = useExpenseStore();

  const metrics = useMemo(() => {
    return calculateDashboardMetrics(expenses, categories);
  }, [expenses, categories]);

  const expensesByCategory = useMemo(() => {
    return metrics.categoryTotals.map(ct => ({
      categoryId: ct.categoryId,
      amount: ct.amount,
      percentage: ct.percentage,
      category: getCategoryById(ct.categoryId, categories),
    }));
  }, [metrics, categories]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [expenses]);

  const biggestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return expenses.reduce((max, e) => e.amount > (max?.amount || 0) ? e : max, expenses[0]);
  }, [expenses]);

  return {
    expenses,
    totalThisMonth: metrics.totalThisMonth,
    totalToday: metrics.totalToday,
    totalThisWeek: metrics.totalThisWeek,
    totalLastWeek: 0,
    dailyAverage: metrics.dailyAverage,
    transactionCount: metrics.transactionCount,
    weeklyData: metrics.weeklyData,
    expensesByCategory,
    recentExpenses,
    biggestExpense,
  };
};
