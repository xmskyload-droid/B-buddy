import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../hooks/useTheme';

interface LineChartComponentProps {
  data: { value: number; label: string }[];
}

export const LineChartComponent = ({ data }: LineChartComponentProps) => {
  const { colors, isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <View className="items-center justify-center h-48 w-full">
        <Text className="text-secondary">No data available</Text>
      </View>
    );
  }

  return (
    <View className="my-4">
      <LineChart
        data={data}
        thickness={3}
        color={colors.accent}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={0}
        rulesType="solid"
        rulesColor={isDark ? '#27272A' : '#E5E7EB'}
        yAxisTextStyle={{ color: colors.secondary }}
        xAxisLabelTextStyle={{ color: colors.secondary }}
        isAnimated
        hideDataPoints
      />
    </View>
  );
};
