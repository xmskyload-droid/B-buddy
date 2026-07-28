import { useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useExpenses } from './useExpenses';

export const useBudget = () => {
  const { budgets } = useExpenseStore();
  const { totalThisMonth } = useExpenses();
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyBudget = useMemo(() => {
    const budget = budgets.find(b => b.month === currentMonth && b.year === currentYear && !b.categoryId);
    return budget ? budget.monthlyLimit : 0;
  }, [budgets, currentMonth, currentYear]);

  const remaining = useMemo(() => {
    return Math.max(0, monthlyBudget - totalThisMonth);
  }, [monthlyBudget, totalThisMonth]);

  const percentUsed = useMemo(() => {
    if (monthlyBudget === 0) return 0;
    return Math.min(100, (totalThisMonth / monthlyBudget) * 100);
  }, [totalThisMonth, monthlyBudget]);

  const categoryBudgets = useMemo(() => {
    return budgets.filter(b => b.categoryId && b.month === currentMonth && b.year === currentYear);
  }, [budgets, currentMonth, currentYear]);

  return {
    monthlyBudget,
    remaining,
    percentUsed,
    categoryBudgets
  };
};
