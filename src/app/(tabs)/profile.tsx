import React from 'react';
import { View, Text, ScrollView, Switch, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Moon, DollarSign, Globe, Lock, Shield, Download, FileText, Cloud, Star, MessageSquare, Info, Trash2, ChevronRight } from 'lucide-react-native';

import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenses } from '../../hooks/useExpenses';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { currency } = useSettingsStore();
  const { expenses } = useExpenses();

  const renderRow = (icon: any, label: string, value?: string, isDestructive?: boolean, showToggle?: boolean, toggleValue?: boolean, onToggle?: () => void) => (
    <Pressable style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDestructive ? '#EF444420' : `${colors.accent}20`, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
        {React.createElement(icon, { size: 18, color: isDestructive ? '#EF4444' : colors.accent })}
      </View>
      <Text style={{ flex: 1, color: isDestructive ? '#EF4444' : colors.primary, fontSize: 15, fontWeight: '600' }}>{label}</Text>
      {showToggle ? (
        <Switch value={toggleValue} onValueChange={onToggle} trackColor={{ false: colors.muted, true: colors.accent }} thumbColor="white" />
      ) : value ? (
        <Text style={{ color: colors.secondary, fontSize: 14, marginRight: 8 }}>{value}</Text>
      ) : (
        <ChevronRight size={18} color={colors.secondary} />
      )}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          
          <Animated.View entering={FadeInDown.delay(0).duration(400)} style={{ paddingTop: 16, paddingBottom: 24 }}>
            <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '800' }}>Profile</Text>
          </Animated.View>

          {/* User Card */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 12, elevation: 3 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>U</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700', marginBottom: 4 }}>User</Text>
              <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '500' }}>{expenses.length} transactions · {currency}</Text>
            </View>
            <View style={{ backgroundColor: '#22C55E15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '700' }}>FREE</Text>
            </View>
          </Animated.View>

          {/* Preferences */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 }}>PREFERENCES</Text>
            {renderRow(Moon, 'Dark Mode', undefined, false, true, isDark, toggleTheme)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(DollarSign, 'Currency', currency)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Globe, 'Language', 'English')}
          </Animated.View>

          {/* Security */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 }}>SECURITY</Text>
            {renderRow(Lock, 'Biometric Lock', undefined, false, true, false)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Shield, 'Set PIN')}
          </Animated.View>

          {/* Data & Export */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 }}>DATA & EXPORT</Text>
            {renderRow(Download, 'Export CSV')}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(FileText, 'Export PDF')}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Cloud, 'Backup')}
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 }}>ABOUT</Text>
            {renderRow(Star, 'Rate Coinly')}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(MessageSquare, 'Send Feedback')}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Info, 'Version', '1.0.0')}
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 8 }}>DANGER ZONE</Text>
            {renderRow(Trash2, 'Delete All Data', undefined, true)}
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
