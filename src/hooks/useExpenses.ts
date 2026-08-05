import { useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useFilterStore } from '../store/filterStore';
import { calculateDashboardMetrics } from '../utils/calculations';
import { getCategoryById } from '../utils/formatters';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const useExpenses = () => {
  const { expenses, categories } = useExpenseStore();
  const { startDate, endDate, selectedSingleDate, filterType } = useFilterStore();

  const now = new Date();

  // Full monthly expenses for standard home/dashboard view (ignores single calendar date filter)
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => isWithinInterval(new Date(e.date), { start: currentMonthStart, end: currentMonthEnd }));
  }, [expenses, currentMonthStart, currentMonthEnd]);

  // Overall dashboard metrics (unaffected by single date selection)
  const monthMetrics = useMemo(() => {
    return calculateDashboardMetrics(currentMonthExpenses, categories, now);
  }, [currentMonthExpenses, categories, now]);

  // Filtered expenses by date range (if filter active)
  const filteredExpenses = useMemo(() => {
    if (!startDate || !endDate) return expenses;
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d >= startDate && d <= endDate;
    });
  }, [expenses, startDate, endDate]);

  const expensesByCategory = useMemo(() => {
    return monthMetrics.categoryTotals.map(ct => ({
      categoryId: ct.categoryId,
      amount: ct.amount,
      percentage: ct.percentage,
      category: getCategoryById(ct.categoryId, categories),
    }));
  }, [monthMetrics, categories]);

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
    expenses: filteredExpenses,
    allExpenses: expenses,
    currentMonthExpenses,
    totalThisMonth: monthMetrics.totalThisMonth,
    totalToday: monthMetrics.totalToday,
    totalThisWeek: monthMetrics.totalThisWeek,
    totalLastWeek: 0,
    dailyAverage: monthMetrics.dailyAverage,
    transactionCount: monthMetrics.transactionCount,
    weeklyData: monthMetrics.weeklyData,
    expensesByCategory,
    recentExpenses,
    biggestExpense,
  };
};
