import { useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useFilterStore } from '../store/filterStore';
import { calculateDashboardMetrics } from '../utils/calculations';
import { getCategoryById } from '../utils/formatters';

export const useExpenses = () => {
  const { expenses, categories } = useExpenseStore();
  const { startDate, endDate, selectedSingleDate } = useFilterStore();

  const referenceDate = selectedSingleDate || new Date();

  // Filter expenses by selected date range if active
  const filteredExpenses = useMemo(() => {
    if (!startDate || !endDate) return expenses;

    return expenses.filter(e => {
      const d = new Date(e.date);
      return d >= startDate && d <= endDate;
    });
  }, [expenses, startDate, endDate]);

  const metrics = useMemo(() => {
    return calculateDashboardMetrics(filteredExpenses, categories, referenceDate);
  }, [filteredExpenses, categories, referenceDate]);

  const expensesByCategory = useMemo(() => {
    return metrics.categoryTotals.map(ct => ({
      categoryId: ct.categoryId,
      amount: ct.amount,
      percentage: ct.percentage,
      category: getCategoryById(ct.categoryId, categories),
    }));
  }, [metrics, categories]);

  const recentExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [filteredExpenses]);

  const biggestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    return filteredExpenses.reduce((max, e) => e.amount > (max?.amount || 0) ? e : max, filteredExpenses[0]);
  }, [filteredExpenses]);

  return {
    expenses: filteredExpenses,
    allExpenses: expenses,
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
