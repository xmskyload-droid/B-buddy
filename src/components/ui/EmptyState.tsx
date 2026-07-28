import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
      </View>
      <Text
        style={{
          color: colors.primary,
          fontSize: 18,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.secondary,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {subtitle}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={{
            marginTop: 24,
            backgroundColor: '#22C55E',
            borderRadius: 14,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
};
