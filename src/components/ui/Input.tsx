import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="text-secondary font-medium mb-2 ml-1">{label}</Text>}
      <View
        className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
          error
            ? 'border-danger'
            : isFocused
            ? 'border-accent'
            : isDark
            ? 'border-border bg-card'
            : 'border-border bg-white'
        }`}
      >
        <TextInput
          className={`flex-1 text-primary text-base font-medium h-full`}
          placeholderTextColor={colors.secondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text className="text-danger text-sm mt-1 ml-1">{error}</Text>}
    </View>
  );
};
