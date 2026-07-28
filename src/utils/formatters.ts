import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { Expense, Category } from '../types';

export const formatCurrency = (amount: number, currency: string = '₹') => {
  return `${currency}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
};

export const formatRelativeDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
};

export const groupExpensesByDate = (expenses: Expense[]) => {
  const groups: Record<string, Expense[]> = {};
  
  expenses.forEach(expense => {
    const dateStr = expense.date.split('T')[0];
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(expense);
  });
  
  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      title: formatRelativeDate(new Date(date).toISOString()),
      data: groups[date]
    }));
};

export const getCategoryById = (id: string, categories: Category[]): Category | undefined => {
  return categories.find(c => c.id === id);
};
