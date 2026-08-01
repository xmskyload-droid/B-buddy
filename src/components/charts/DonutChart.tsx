import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';

interface DonutChartProps {
  data: { label: string; amount: number; color: string; percentage: number }[];
  total: number;
}

export const DonutChart = ({ data, total }: DonutChartProps) => {
  const { colors } = useTheme();
  const { currency } = useSettingsStore();

  return (
    <View style={{ paddingVertical: 10 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 20 }}>
        {/* Simple simulated donut via rounded view for fallback */}
        <View 
          style={{ 
            width: 160, 
            height: 160, 
            borderRadius: 80, 
            borderWidth: 24, 
            borderColor: colors.muted,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '600' }}>TOTAL</Text>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{formatCurrency(total, currency)}</Text>
        </View>
      </View>
      
      {/* Legend with progress bars */}
      <View style={{ marginTop: 10 }}>
        {data.slice(0, 5).map((item, index) => (
          <View key={index} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 8 }} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{item.label}</Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{formatCurrency(item.amount, currency)}</Text>
            </View>
            <View style={{ height: 4, backgroundColor: colors.muted, borderRadius: 2 }}>
              <View style={{ height: '100%', width: `${item.percentage}%`, backgroundColor: item.color, borderRadius: 2 }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
