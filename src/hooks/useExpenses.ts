import { useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

export const useExpenses = () => {
  const { expenses, categories } = useExpenseStore();
  const now = new Date();

  const totalThisMonth = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalToday = useMemo(() => {
    const start = startOfDay(now);
    const end = endOfDay(now);
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalThisWeek = useMemo(() => {
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 });    // Sunday
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalLastWeek = useMemo(() => {
    const lastWeekDate = new Date(now);
    lastWeekDate.setDate(now.getDate() - 7);
    const start = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
    const end = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const monthlyExpenses = expenses.filter(e =>
      isWithinInterval(new Date(e.date), { start, end })
    );
    const map: Record<string, number> = {};
    monthlyExpenses.forEach(e => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amount;
    });
    
    // Convert to array of objects with category info like before, since analytics expects array
    return Object.keys(map).map(id => ({
      categoryId: id,
      amount: map[id],
      category: categories.find(c => c.id === id)
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses, categories]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [expenses]);

  const dailyAverage = useMemo(() => {
    if (totalThisMonth === 0) return 0;
    const dayOfMonth = now.getDate();
    return totalThisMonth / dayOfMonth;
  }, [totalThisMonth]);

  const biggestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return expenses.reduce((max, e) => e.amount > (max?.amount || 0) ? e : max, expenses[0]);
  }, [expenses]);

  const weeklyData = useMemo(() => {
    // Returns array of 7 values Mon-Sun for current week
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const start = startOfDay(day);
      const end = endOfDay(day);
      return expenses
        .filter(e => isWithinInterval(new Date(e.date), { start, end }))
        .reduce((sum, e) => sum + e.amount, 0);
    });
  }, [expenses]);

  return {
    expenses,
    totalThisMonth,
    totalToday,
    totalThisWeek,
    totalLastWeek,
    expensesByCategory,
    recentExpenses,
    dailyAverage,
    biggestExpense,
    weeklyData,
  };
};
