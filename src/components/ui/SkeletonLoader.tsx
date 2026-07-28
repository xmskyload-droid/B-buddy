import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

export const SkeletonLoader = ({ className = '', style }: any) => {
  const opacity = useSharedValue(0.5);
  const { isDark } = useTheme();

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`rounded-xl ${isDark ? 'bg-[#27272A]' : 'bg-[#E5E7EB]'} ${className}`}
      style={[animatedStyle, style]}
    />
  );
};
