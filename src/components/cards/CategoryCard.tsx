import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  amount: number;
  total: number;
}

export const CategoryCard = ({ category, amount, total }: CategoryCardProps) => {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  
  return (
    <Card className="w-40 mr-4 p-4">
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Text style={{ fontSize: 16 }}>{category.icon === 'pizza' ? '🍕' : '📊'}</Text>
      </View>
      
      <Text className="text-secondary text-xs mb-1" numberOfLines={1}>{category.name}</Text>
      <Text className="text-primary font-bold text-lg mb-3">{formatCurrency(amount)}</Text>
      
      <View className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: category.color }} 
        />
      </View>
    </Card>
  );
};
