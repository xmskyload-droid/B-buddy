import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CategoryCardProps {
  name: string;
  amount: string;
  color: string;
  icon: string;
}

export const CategoryCard = ({ name, amount, color, icon }: CategoryCardProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        width: 90,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      
      <Text 
        style={{ color: colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 2 }}
        numberOfLines={1}
      >
        {amount}
      </Text>
      
      <Text 
        style={{ color: colors.secondary, fontSize: 10, fontWeight: '500' }}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
};
