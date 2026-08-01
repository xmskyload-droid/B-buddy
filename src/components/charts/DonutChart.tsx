import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CategorySegment {
  name?: string;
  label?: string; // Add label for compatibility with analytics.tsx
  amount: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  segments?: CategorySegment[];
  data?: CategorySegment[]; // Adding data prop to be compatible with analytics.tsx
  total: number;
  size?: number;
}

export const DonutChart = ({ segments, data, total, size = 160 }: DonutChartProps) => {
  const { colors } = useTheme();
  const { currency } = useSettingsStore();
  const radius = (size - 20) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  const activeData = segments || data;

  if (!activeData || activeData.length === 0 || total === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={colors.muted} strokeWidth={18} />
        </Svg>
        <Text style={{ color: colors.secondary, marginTop: 12, fontSize: 13 }}>No data yet</Text>
      </View>
    );
  }

  // Build segments with cumulative offset
  let cumulativePercentage = 0;
  const segmentData = activeData.map(seg => {
    const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
    const rotation = -90 + cumulativePercentage * 3.6; // -90 to start from top
    cumulativePercentage += seg.percentage;
    return { ...seg, strokeDasharray, rotation };
  });

  return (
    <View>
      {/* Donut */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ position: 'relative', width: size, height: size }}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${cx},${cy}`}>
              {/* Background track */}
              <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={colors.muted} strokeWidth={18} />
              {/* Colored segments */}
              {segmentData.map((seg, i) => (
                <Circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={18}
                  strokeDasharray={`${(seg.percentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-segmentData.slice(0, i).reduce((acc, s) => acc + (s.percentage / 100) * circumference, 0)}
                  strokeLinecap="butt"
                />
              ))}
            </G>
          </Svg>
          {/* Center text */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.secondary, fontSize: 10, fontWeight: '600' }}>TOTAL</Text>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{currency}{total >= 1000 ? `${(total/1000).toFixed(1)}K` : total.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={{ gap: 10 }}>
        {activeData.slice(0, 5).map((seg, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: seg.color, marginRight: 10 }} />
            <Text style={{ flex: 1, color: colors.primary, fontSize: 13, fontWeight: '500' }}>{seg.name || seg.label}</Text>
            <Text style={{ color: colors.secondary, fontSize: 12 }}>{seg.percentage.toFixed(1)}%</Text>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', marginLeft: 12, minWidth: 60, textAlign: 'right' }}>
              {currency}{seg.amount.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
