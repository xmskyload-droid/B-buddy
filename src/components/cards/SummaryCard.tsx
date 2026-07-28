import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { formatCurrency } from '../../utils/formatters';

interface SummaryCardProps {
  totalSpent: number;
  budget?: number;
}

export const SummaryCard = ({ totalSpent, budget = 0 }: SummaryCardProps) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(totalSpent, { duration: 1000 });
  }, [totalSpent]);

  const percentUsed = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;
  
  return (
    <LinearGradient
      colors={['#16A34A', '#22C55E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-[24px] p-6 shadow-md mb-6"
    >
      <Text className="text-white/80 font-medium text-sm mb-1">Total Spent This Month</Text>
      <Text className="text-white font-bold text-4xl mb-6">
        {formatCurrency(totalSpent)}
      </Text>
      
      {budget > 0 && (
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white/90 text-xs font-medium">Budget: {formatCurrency(budget)}</Text>
            <Text className="text-white font-bold text-xs">{percentUsed.toFixed(0)}%</Text>
          </View>
          <View className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
            <View 
              className={`h-full rounded-full ${percentUsed > 90 ? 'bg-red-400' : percentUsed > 75 ? 'bg-yellow-400' : 'bg-white'}`}
              style={{ width: `${percentUsed}%` }} 
            />
          </View>
        </View>
      )}
    </LinearGradient>
  );
};
