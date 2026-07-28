import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../hooks/useTheme';

interface BarChartComponentProps {
  data: { value: number; label: string }[];
}

export const BarChartComponent = ({ data }: BarChartComponentProps) => {
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
      <BarChart
        data={data}
        barWidth={22}
        noOfSections={4}
        barBorderRadius={4}
        frontColor={colors.accent}
        yAxisThickness={0}
        xAxisThickness={0}
        rulesType="solid"
        rulesColor={isDark ? '#27272A' : '#E5E7EB'}
        yAxisTextStyle={{ color: colors.secondary }}
        xAxisLabelTextStyle={{ color: colors.secondary }}
        isAnimated
      />
    </View>
  );
};
