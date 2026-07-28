import { Category } from '../types';

export const defaultCategories: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'pizza', color: '#FF6B6B', isDefault: true },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#4ECDC4', isDefault: true },
  { id: 'fuel', name: 'Fuel', icon: 'fuel', color: '#FFE66D', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#A8E6CF', isDefault: true },
  { id: 'bills', name: 'Bills & Utilities', icon: 'file-text', color: '#FFB347', isDefault: true },
  { id: 'medical', name: 'Medical', icon: 'activity', color: '#87CEEB', isDefault: true },
  { id: 'education', name: 'Education', icon: 'book', color: '#DDA0DD', isDefault: true },
  { id: 'travel', name: 'Travel', icon: 'plane', color: '#98D8C8', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#F7DC6F', isDefault: true },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'repeat', color: '#BB8FCE', isDefault: true },
  { id: 'investment', name: 'Investment', icon: 'trending-up', color: '#82E0AA', isDefault: true },
  { id: 'salary', name: 'Salary', icon: 'dollar-sign', color: '#F8C471', isDefault: true },
  { id: 'gift', name: 'Gift', icon: 'gift', color: '#F1948A', isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'home', color: '#AED6F1', isDefault: true },
  { id: 'others', name: 'Others', icon: 'grid', color: '#D5DBDB', isDefault: true },
];
