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

export const SkeletonBox = ({ width, height, borderRadius = 8, style }: any) => {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#27272A' : '#E5E7EB',
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const SkeletonExpenseCard = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 12,
        elevation: isDark ? 4 : 3,
      }}
    >
      <SkeletonBox width={46} height={46} borderRadius={14} style={{ marginRight: 12 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width="60%" height={16} />
        <SkeletonBox width="40%" height={12} />
      </View>
      <SkeletonBox width={60} height={20} />
    </View>
  );
};

export const SkeletonSummaryCard = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 12,
        elevation: isDark ? 4 : 3,
      }}
    >
      <SkeletonBox width="40%" height={16} style={{ marginBottom: 12 }} />
      <SkeletonBox width="70%" height={40} style={{ marginBottom: 24 }} />
      <SkeletonBox width="100%" height={8} borderRadius={4} />
    </View>
  );
};

export const SkeletonLoader = ({ className = '', style }: any) => {
  const opacity = useSharedValue(0.4);
  const { isDark } = useTheme();

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          borderRadius: 12,
          backgroundColor: isDark ? '#27272A' : '#E5E7EB',
        },
        animatedStyle,
        style,
      ]}
    />
  );
};
