import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card = ({ children, className = '', noPadding = false, style, ...props }: CardProps) => {
  const { isDark, colors } = useTheme();
  
  return (
    <View
      className={`rounded-[22px] overflow-hidden ${!noPadding ? 'p-4' : ''} ${className}`}
      style={[
        { backgroundColor: isDark ? colors.card : 'white' },
        !isDark ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        } : {},
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
