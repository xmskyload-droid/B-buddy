import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../hooks/useTheme';

interface DonutChartProps {
  data: { value: number; color: string; text?: string }[];
  centerLabel?: string;
}

export const DonutChart = ({ data, centerLabel }: DonutChartProps) => {
  const { colors, isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <View className="items-center justify-center h-48 w-full">
        <Text className="text-secondary">No data available</Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center my-4">
      <PieChart
        donut
        data={data}
        radius={100}
        innerRadius={70}
        innerCircleColor={isDark ? colors.card : colors.card}
        centerLabelComponent={() => {
          return (
            <View className="items-center justify-center">
              <Text className="text-primary font-bold text-lg">{centerLabel}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};
