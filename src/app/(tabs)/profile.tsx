import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Pressable, StatusBar, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Moon, DollarSign, Globe, Lock, Shield, Download, FileText, Cloud, Star, MessageSquare, Info, Trash2, ChevronRight, Calendar, LogOut, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
// @ts-ignore
import { auth } from '../../config/firebase';

import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useExpenses } from '../../hooks/useExpenses';
import { exportToCSV, exportToPDF } from '../../utils/export';
import { createBackup } from '../../utils/backup';
import { PinModal } from '../../components/modals/PinModal';
import * as queries from '../../database/queries';
import { openDb } from '../../database/db';
import * as Haptics from 'expo-haptics';

const CURRENCIES = ['₹', '$', '€', '£', '¥', 'A$'];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    currency,
    setCurrency,
    biometricEnabled,
    setBiometric,
    pin,
    lastBackupDate,
    setLastBackupDate,
    language,
    setLanguage,
  } = useSettingsStore();

  const { expenses, totalThisMonth } = useExpenses();
  const { categories, budgets, loadExpenses, syncWithCloud, syncing } = useExpenseStore();

  const [loadingExport, setLoadingExport] = useState<string | null>(null);
  const [pinModalMode, setPinModalMode] = useState<'set' | 'remove' | null>(null);

  const currentUser = auth?.currentUser;
  const userEmail = currentUser?.email || 'Logged in user';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  // 1. Biometrics Handler
  const handleToggleBiometrics = async (enabled: boolean) => {
    try {
      if (enabled) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          Alert.alert(
            'Biometrics Unavailable',
            'Your device does not support biometric authentication or no biometrics are enrolled.'
          );
          return;
        }

        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirm Biometric Lock',
          fallbackLabel: 'Use PIN',
        });

        if (authResult.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await setBiometric(true);
        }
      } else {
        await setBiometric(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle biometric settings.');
    }
  };

  // 2. CSV Export
  const handleExportCSV = async () => {
    try {
      setLoadingExport('csv');
      await exportToCSV(expenses, categories, currency);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export CSV file.');
    } finally {
      setLoadingExport(null);
    }
  };

  // 3. PDF Export
  const handleExportPDF = async () => {
    try {
      setLoadingExport('pdf');
      await exportToPDF(expenses, categories, totalThisMonth, currency);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not generate PDF report.');
    } finally {
      setLoadingExport(null);
    }
  };

  // 4. Backup Data
  const handleBackup = async () => {
    try {
      setLoadingExport('backup');
      await createBackup(expenses, categories, budgets);
      const dateStr = new Date().toLocaleDateString();
      setLastBackupDate(dateStr);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Backup Failed', 'Could not create JSON backup file.');
    } finally {
      setLoadingExport(null);
    }
  };

  // 5. Rate App
  const handleRateApp = () => {
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com'
      : 'https://play.google.com/store';
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert('Coinly', 'Thank you for rating Coinly!');
    });
  };

  // 6. Send Feedback
  const handleSendFeedback = () => {
    Linking.openURL('mailto:support@coinly.app?subject=Coinly%20Feedback').catch(() => {
      Alert.alert('Feedback', 'Send us your feedback at support@coinly.app');
    });
  };

  // 7. Change Currency
  const handleSelectCurrency = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency symbol',
      CURRENCIES.map(curr => ({
        text: `${curr} ${curr === '₹' ? '(INR)' : curr === '$' ? '(USD)' : curr === '€' ? '(EUR)' : ''}`,
        onPress: () => setCurrency(curr),
      })),
      { cancelable: true }
    );
  };

  // 8. Manual Cloud Sync
  const handleSyncNow = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await syncWithCloud();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Cloud Sync Complete', 'All your expenses & budgets are up to date in the cloud!');
    } catch (e) {
      Alert.alert('Sync Error', 'Could not sync with cloud. Check network connection.');
    }
  };

  // 9. Logout Handler
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account? Your data will remain safely stored in the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.setItem('coinly_user_authed', 'false');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/login' as any);
            } catch (e) {
              Alert.alert('Error', 'Failed to log out.');
            }
          },
        },
      ]
    );
  };

  // 10. Delete All Data
  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data ⚠️',
      'This will permanently delete all your local expenses and budgets. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await openDb();
              await db.execAsync('DELETE FROM expenses; DELETE FROM budgets;');
              await loadExpenses();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Alert.alert('Reset Complete', 'All local transaction records have been deleted.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear database.');
            }
          },
        },
      ]
    );
  };

  const renderRow = (
    icon: any,
    label: string,
    value?: string,
    isDestructive?: boolean,
    showToggle?: boolean,
    toggleValue?: boolean,
    onToggle?: (val: boolean) => void,
    onPress?: () => void,
    isLoading?: boolean
  ) => (
    <Pressable
      onPress={onPress}
      disabled={showToggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isDestructive ? '#EF444415' : colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        {React.createElement(icon, {
          size: 18,
          color: isDestructive ? '#EF4444' : colors.primary,
        })}
      </View>
      <Text
        style={{
          flex: 1,
          color: isDestructive ? '#EF4444' : colors.primary,
          fontSize: 15,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="small" color="#22C55E" />
      ) : showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="white"
        />
      ) : value ? (
        <Text style={{ color: colors.secondary, fontSize: 14, marginRight: 8, fontWeight: '500' }}>{value}</Text>
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
            <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '800' }}>Profile & Settings</Text>
          </Animated.View>

          {/* User Card */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 12, elevation: 3 }}>
            <View style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>
                {userEmail.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700', marginBottom: 2 }} numberOfLines={1}>
                {userEmail}
              </Text>
              <Text style={{ color: colors.secondary, fontSize: 13, fontWeight: '500' }}>
                {expenses.length} transactions · {currency}
              </Text>
            </View>
            <View style={{ backgroundColor: '#22C55E15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: '#22C55E', fontSize: 11, fontWeight: '700' }}>CLOUD SYNCED</Text>
            </View>
          </Animated.View>

          {/* Cloud Sync Section */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, paddingTop: 4 }}>CLOUD SYNC</Text>
            {renderRow(RefreshCw, 'Sync with Cloud Now', syncing ? 'Syncing...' : 'Up to date', false, false, undefined, undefined, handleSyncNow, syncing)}
          </Animated.View>

          {/* Preferences */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, paddingTop: 4 }}>PREFERENCES</Text>
            {renderRow(Moon, 'Dark Mode', undefined, false, true, isDark, toggleTheme)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(DollarSign, 'Currency', `${currency}`, false, false, undefined, undefined, handleSelectCurrency)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Calendar, 'Expense Calendar', undefined, false, false, undefined, undefined, () => router.navigate('/(tabs)/calendar' as any))}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Globe, 'Language', language)}
          </Animated.View>

          {/* Security */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, paddingTop: 4 }}>SECURITY</Text>
            {renderRow(Lock, 'Biometric Lock', undefined, false, true, biometricEnabled, handleToggleBiometrics)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Shield, pin ? 'Change or Remove PIN' : 'Set Security PIN', pin ? 'Enabled' : 'Not Set', false, false, undefined, undefined, () => setPinModalMode(pin ? 'remove' : 'set'))}
          </Animated.View>

          {/* Data & Export */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, paddingTop: 4 }}>DATA & EXPORT</Text>
            {renderRow(Download, 'Export CSV', undefined, false, false, undefined, undefined, handleExportCSV, loadingExport === 'csv')}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(FileText, 'Export PDF', undefined, false, false, undefined, undefined, handleExportPDF, loadingExport === 'pdf')}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Cloud, 'Backup Data', lastBackupDate ? `Last: ${lastBackupDate}` : undefined, false, false, undefined, undefined, handleBackup, loadingExport === 'backup')}
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, paddingTop: 4 }}>ABOUT</Text>
            {renderRow(Star, 'Rate Coinly', undefined, false, false, undefined, undefined, handleRateApp)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(MessageSquare, 'Send Feedback', undefined, false, false, undefined, undefined, handleSendFeedback)}
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />
            {renderRow(Info, 'Version', appVersion)}
          </Animated.View>

          {/* Log Out Button */}
          <Animated.View entering={FadeInDown.delay(550).duration(400)} style={{ marginBottom: 20 }}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#EF444415',
                borderRadius: 20,
                height: 56,
                borderWidth: 1,
                borderColor: '#EF444430',
                gap: 8,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <LogOut size={20} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '700' }}>
                Log Out of Account
              </Text>
            </Pressable>
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ backgroundColor: colors.card, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, paddingTop: 4 }}>DANGER ZONE</Text>
            {renderRow(Trash2, 'Delete All Local Data', undefined, true, false, undefined, undefined, handleDeleteAllData)}
          </Animated.View>

        </ScrollView>
      </SafeAreaView>

      {/* Pin Setup/Remove Modal */}
      {pinModalMode && (
        <PinModal
          visible={!!pinModalMode}
          mode={pinModalMode}
          onClose={() => setPinModalMode(null)}
          onSuccess={() => {
            setPinModalMode(null);
            Alert.alert('Success', pinModalMode === 'set' ? 'Security PIN saved successfully.' : 'Security PIN removed.');
          }}
        />
      )}
    </View>
  );
}
