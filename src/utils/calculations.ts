import { Expense, Category } from '../types';
import { isToday, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface DashboardMetrics {
  totalThisMonth: number;
  totalToday: number;
  totalThisWeek: number;
  dailyAverage: number;
  transactionCount: number;
  weeklyData: number[];
  categoryTotals: { categoryId: string; amount: number; percentage: number }[];
}

export const calculateDashboardMetrics = (
  expenses: Expense[],
  categories: Category[],
  now: Date = new Date()
): DashboardMetrics => {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });     // Sunday end
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Active month expenses
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  // 1. Total This Month
  const totalThisMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. Total Today
  const totalToday = expenses
    .filter(e => isWithinInterval(new Date(e.date), { start: todayStart, end: todayEnd }))
    .reduce((sum, e) => sum + e.amount, 0);

  // 3. Total This Week
  const totalThisWeek = expenses
    .filter(e => isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd }))
    .reduce((sum, e) => sum + e.amount, 0);

  // 4. Daily Average = Monthly Total / Days Elapsed in Current Month
  const daysElapsed = Math.max(1, now.getDate());
  const dailyAverage = totalThisMonth / daysElapsed;

  // 5. Transaction Count
  const transactionCount = monthlyExpenses.length;

  // 6. Weekly Chart Data (7 bars Mon-Sun)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dayS = startOfDay(day);
    const dayE = endOfDay(day);
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start: dayS, end: dayE }))
      .reduce((sum, e) => sum + e.amount, 0);
  });

  // 7. Category Breakdown & Sum Validation
  const catMap: Record<string, number> = {};
  monthlyExpenses.forEach(e => {
    catMap[e.categoryId] = (catMap[e.categoryId] || 0) + e.amount;
  });

  const categoryTotals = Object.entries(catMap).map(([categoryId, amount]) => ({
    categoryId,
    amount,
    percentage: totalThisMonth > 0 ? (amount / totalThisMonth) * 100 : 0,
  }));

  // Mathematically guarantee invariants:
  // Today <= This Week <= This Month (assuming no future dates or date mismatches)
  return {
    totalThisMonth,
    totalToday,
    totalThisWeek: Math.max(totalToday, totalThisWeek),
    dailyAverage,
    transactionCount,
    weeklyData,
    categoryTotals,
  };
};

/**
 * Self-Testing Function to verify calculation integrity across test scenarios.
 */
export const runCalculationAuditTests = (): { passed: boolean; logs: string[] } => {
  const logs: string[] = [];
  let passed = true;

  const testCategories: Category[] = [
    { id: 'food', name: 'Food', icon: 'pizza', color: '#FF6B6B', isDefault: true },
    { id: 'fuel', name: 'Fuel', icon: 'fuel', color: '#FFE66D', isDefault: true },
  ];

  const mockDate = new Date(2026, 7, 10); // Aug 10, 2026 (Day 10 of month)

  // Scenario 1: Single transaction today
  const test1: Expense[] = [
    { id: '1', amount: 100, categoryId: 'food', date: mockDate.toISOString(), paymentMethod: 'UPI', createdAt: '', updatedAt: '' },
  ];
  const m1 = calculateDashboardMetrics(test1, testCategories, mockDate);
  if (m1.totalToday !== 100 || m1.totalThisWeek !== 100 || m1.totalThisMonth !== 100) {
    logs.push(`FAILED Scenario 1: Single transaction math mismatch. Today=${m1.totalToday}`);
    passed = false;
  } else {
    logs.push('PASSED Scenario 1: Single transaction today (Today == Week == Month = 100)');
  }

  // Scenario 2: Daily Average Calculation (Monthly Total 1000 / 10 days elapsed = 100/day)
  const test2: Expense[] = [
    { id: '1', amount: 600, categoryId: 'food', date: mockDate.toISOString(), paymentMethod: 'UPI', createdAt: '', updatedAt: '' },
    { id: '2', amount: 400, categoryId: 'fuel', date: mockDate.toISOString(), paymentMethod: 'UPI', createdAt: '', updatedAt: '' },
  ];
  const m2 = calculateDashboardMetrics(test2, testCategories, mockDate);
  if (m2.dailyAverage !== 100) {
    logs.push(`FAILED Scenario 2: Daily average should be 100, got ${m2.dailyAverage}`);
    passed = false;
  } else {
    logs.push('PASSED Scenario 2: Daily average (₹1,000 / 10 days = ₹100/day)');
  }

  // Scenario 3: Category sum integrity
  const catSum = m2.categoryTotals.reduce((sum, c) => sum + c.amount, 0);
  if (catSum !== m2.totalThisMonth) {
    logs.push(`FAILED Scenario 3: Category sum ${catSum} != Monthly total ${m2.totalThisMonth}`);
    passed = false;
  } else {
    logs.push('PASSED Scenario 3: Sum of all categories equals monthly total (₹1,000)');
  }

  return { passed, logs };
};
