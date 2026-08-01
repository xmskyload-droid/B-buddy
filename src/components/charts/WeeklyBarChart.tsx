import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface WeeklyBarChartProps {
  data: { day: string; amount: number; isToday: boolean }[];
  maxValue: number;
}

export const WeeklyBarChart = ({ data, maxValue }: WeeklyBarChartProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={{ height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 }}>
      {data.map((item, index) => {
        return (
          <Bar 
            key={index} 
            item={item} 
            maxValue={maxValue} 
            color={item.isToday ? '#22C55E' : colors.muted} 
            textColor={colors.secondary}
          />
        );
      })}
    </View>
  );
};

const Bar = ({ item, maxValue, color, textColor }: any) => {
  const height = useSharedValue(0);
  const targetHeight = maxValue > 0 ? (item.amount / maxValue) * 100 : 0;
  
  useEffect(() => {
    height.value = withTiming(targetHeight, { duration: 800 });
  }, [targetHeight]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`
  }));
  
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ height: 100, width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            {
              width: 12,
              borderRadius: 6,
              backgroundColor: color,
            },
            animatedStyle
          ]}
        />
      </View>
      <Text style={{ color: textColor, fontSize: 11, fontWeight: '600', marginTop: 8 }}>
        {item.day}
      </Text>
    </View>
  );
};
