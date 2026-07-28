import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export const Badge = ({ label, color = '#22C55E', className = '' }: BadgeProps) => {
  return (
    <View 
      className={`px-3 py-1 rounded-full items-center justify-center ${className}`}
      style={{ backgroundColor: `${color}20` }}
    >
      <Text 
        className="text-xs font-semibold"
        style={{ color }}
      >
        {label}
      </Text>
    </View>
  );
};
