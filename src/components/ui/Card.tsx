import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card = ({ children, className = '', noPadding = false, ...props }: CardProps) => {
  const { isDark } = useTheme();
  
  return (
    <View
      className={`rounded-[22px] overflow-hidden ${
        isDark ? 'bg-card' : 'bg-white shadow-sm'
      } ${!noPadding ? 'p-4' : ''} ${className}`}
      style={!isDark ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      } : {}}
      {...props}
    >
      {children}
    </View>
  );
};
