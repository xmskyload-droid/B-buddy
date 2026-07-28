import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Moon, Sun, Globe, Shield, Download, Database, Info, MessageCircle, ChevronRight,
  Fingerprint, Lock, Trash2, Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenseStore } from '../../store/expenseStore';

function SettingRow({
  icon: Icon,
  iconColor,
  label,
  value,
  onPress,
  rightElement,
  danger,
  colors,
}: {
  icon: any;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${iconColor}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Icon size={18} color={iconColor} />
      </View>
      <Text
        style={{
          flex: 1,
          color: danger ? colors.danger : colors.primary,
          fontSize: 15,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
      {value && (
        <Text style={{ color: colors.secondary, fontSize: 14, marginRight: 4 }}>{value}</Text>
      )}
      {rightElement || (!rightElement && onPress && (
        <ChevronRight size={16} color={colors.secondary} />
      ))}
    </Pressable>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <Animated.View entering={FadeInDown.duration(400)} className="mx-6 mb-5">
      <Text
        style={{
          color: colors.secondary,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.8,
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

function Divider({ colors }: { colors: any }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 66,
      }}
    />
  );
}

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { toggleTheme } = useThemeStore();
  const { name, currency } = useSettingsStore();
  const { expenses } = useExpenseStore();

  const initials = (name || 'U').slice(0, 2).toUpperCase();
  const totalTransactions = expenses.length;

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your expense records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} className="px-6 pt-4 pb-6">
            <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>Profile</Text>
          </Animated.View>

          {/* Avatar Card */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)} className="mx-6 mb-6">
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 24,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: '#22C55E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{initials}</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
                  {name || 'Guest User'}
                </Text>
                <Text style={{ color: colors.secondary, fontSize: 13, marginTop: 2 }}>
                  {totalTransactions} transactions · {currency}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: `${'#22C55E'}15`,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '700' }}>Free</Text>
              </View>
            </View>
          </Animated.View>

          {/* Preferences */}
          <Section title="Preferences" colors={colors}>
            <SettingRow
              icon={isDark ? Moon : Sun}
              iconColor="#8B5CF6"
              label="Dark Mode"
              colors={colors}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleTheme();
                  }}
                  trackColor={{ false: colors.border, true: '#22C55E' }}
                  thumbColor="white"
                />
              }
            />
            <Divider colors={colors} />
            <SettingRow icon={Globe} iconColor="#3B82F6" label="Currency" value={`${currency} (INR)`} onPress={() => {}} colors={colors} />
            <Divider colors={colors} />
            <SettingRow icon={Globe} iconColor="#06B6D4" label="Language" value="English" onPress={() => {}} colors={colors} />
          </Section>

          {/* Security */}
          <Section title="Security" colors={colors}>
            <SettingRow icon={Fingerprint} iconColor="#22C55E" label="Biometric Lock" colors={colors}
              rightElement={
                <Switch value={false} onValueChange={() => {}}
                  trackColor={{ false: colors.border, true: '#22C55E' }} thumbColor="white" />
              }
            />
            <Divider colors={colors} />
            <SettingRow icon={Lock} iconColor="#F59E0B" label="Set PIN" onPress={() => {}} colors={colors} />
          </Section>

          {/* Data */}
          <Section title="Data & Export" colors={colors}>
            <SettingRow icon={Download} iconColor="#10B981" label="Export as CSV" onPress={() => {}} colors={colors} />
            <Divider colors={colors} />
            <SettingRow icon={Download} iconColor="#3B82F6" label="Export as PDF" onPress={() => {}} colors={colors} />
            <Divider colors={colors} />
            <SettingRow icon={Database} iconColor="#8B5CF6" label="Backup Data" onPress={() => {}} colors={colors} />
          </Section>

          {/* About */}
          <Section title="About" colors={colors}>
            <SettingRow icon={Star} iconColor="#F59E0B" label="Rate Flow Finance" onPress={() => {}} colors={colors} />
            <Divider colors={colors} />
            <SettingRow icon={MessageCircle} iconColor="#3B82F6" label="Send Feedback" onPress={() => {}} colors={colors} />
            <Divider colors={colors} />
            <SettingRow icon={Info} iconColor="#6B7280" label="Version" value="1.0.0" colors={colors} />
          </Section>

          {/* Danger Zone */}
          <Section title="Danger Zone" colors={colors}>
            <SettingRow
              icon={Trash2}
              iconColor={colors.danger}
              label="Delete All Data"
              onPress={handleDeleteData}
              danger
              colors={colors}
            />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
