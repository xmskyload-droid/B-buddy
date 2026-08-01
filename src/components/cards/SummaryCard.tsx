import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { formatCurrency } from '../../utils/formatters';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../store/settingsStore';

interface SummaryCardProps {
  totalSpent: number;
  budget?: number;
  transactionCount?: number;
  avgPerDay?: number;
  todaySpent?: number;
  thisWeekSpent?: number;
}

export const SummaryCard = ({ 
  totalSpent, 
  budget = 0, 
  transactionCount = 0,
  avgPerDay = 0,
  todaySpent = 0,
  thisWeekSpent = 0 
}: SummaryCardProps) => {
  const router = useRouter();
  const { currency } = useSettingsStore();
  const percentUsed = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;
  const remaining = budget > totalSpent ? budget - totalSpent : 0;
  
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={{ marginBottom: 24, marginHorizontal: 20 }}>
      <LinearGradient
        colors={['#16A34A', '#22C55E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 24,
          shadowColor: '#16A34A',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 }}>
          THIS MONTH
        </Text>
        
        <Text style={{ color: 'white', fontSize: 48, fontWeight: '800', marginBottom: 4 }}>
          {formatCurrency(totalSpent, currency)}
        </Text>
        
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 24 }}>
          {transactionCount} transactions · avg {formatCurrency(avgPerDay, currency)}/day
        </Text>
        
        {budget > 0 ? (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>
                Budget: {formatCurrency(budget, currency)}
              </Text>
              <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ color: '#16A34A', fontSize: 10, fontWeight: '700' }}>
                  {formatCurrency(remaining, currency)} left
                </Text>
              </View>
            </View>
            <View style={{ height: 6, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 3, overflow: 'hidden' }}>
              <View 
                style={{ 
                  height: '100%', 
                  width: `${percentUsed}%`, 
                  backgroundColor: percentUsed > 90 ? '#FCA5A5' : percentUsed > 75 ? '#FDE047' : 'white',
                  borderRadius: 3
                }} 
              />
            </View>
          </View>
        ) : (
          <Pressable 
            onPress={() => router.push('/(tabs)/profile')}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12
            }}
          >
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Set budget →</Text>
          </Pressable>
        )}

        <View style={{ flexDirection: 'row', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 }}>Today's spending</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>{formatCurrency(todaySpent, currency)}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <View style={{ flex: 1, paddingLeft: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 }}>This week</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>{formatCurrency(thisWeekSpent, currency)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
