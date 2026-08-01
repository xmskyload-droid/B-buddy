import React, { ReactNode } from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export const Card = ({ children, style, onPress }: { children: ReactNode; style?: ViewStyle; onPress?: () => void }) => {
  const { colors, isDark } = useTheme();
  
  const cardStyle = { 
    backgroundColor: colors.card, 
    borderRadius: 20, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: isDark ? 0.3 : 0.06, 
    shadowRadius: 12, 
    elevation: isDark ? 4 : 3, 
    borderWidth: 1, 
    borderColor: colors.border 
  };
  
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[cardStyle, style]}>
        {children}
      </Pressable>
    );
  }
  
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};
