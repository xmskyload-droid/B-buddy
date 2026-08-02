import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint, Lock, ShieldAlert } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { PinModal } from './PinModal';

export const BiometricLockOverlay = () => {
  const { colors } = useTheme();
  const { biometricEnabled, pin, isLocked, setIsLocked } = useSettingsStore();
  const [showPinModal, setShowPinModal] = useState(false);

  const attemptBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled && biometricEnabled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock Coinly',
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: false,
        });

        if (result.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsLocked(false);
        } else if (pin) {
          setShowPinModal(true);
        }
      } else if (pin) {
        setShowPinModal(true);
      }
    } catch (e) {
      if (pin) setShowPinModal(true);
    }
  };

  useEffect(() => {
    if (isLocked) {
      attemptBiometric();
    }
  }, [isLocked]);

  if (!isLocked) return null;

  return (
    <Modal visible={isLocked} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: '#22C55E15', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#22C55E30' }}>
          <Lock size={40} color="#22C55E" />
        </View>

        <Text style={{ color: colors.primary, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
          Coinly is Locked
        </Text>

        <Text style={{ color: colors.secondary, fontSize: 15, textAlign: 'center', marginBottom: 40, lineHeight: 22 }}>
          Authenticate to view your personal financial data
        </Text>

        {biometricEnabled && (
          <Pressable
            onPress={attemptBiometric}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 18,
              backgroundColor: '#22C55E',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Fingerprint size={22} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '800' }}>Unlock with Biometrics</Text>
          </Pressable>
        )}

        {pin && (
          <Pressable
            onPress={() => setShowPinModal(true)}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 18,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Enter PIN</Text>
          </Pressable>
        )}

        <PinModal
          visible={showPinModal}
          mode="verify"
          onClose={() => setShowPinModal(false)}
          onSuccess={() => {
            setShowPinModal(false);
            setIsLocked(false);
          }}
        />
      </View>
    </Modal>
  );
};
