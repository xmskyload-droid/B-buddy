import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, Dimensions } from 'react-native';
import { X, Lock, Check, Delete } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';

interface PinModalProps {
  visible: boolean;
  mode: 'set' | 'verify' | 'remove';
  onClose: () => void;
  onSuccess: () => void;
}

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const KEY_WIDTH = Math.floor((SCREEN_WIDTH - 80) / 3);

export const PinModal = ({ visible, mode, onClose, onSuccess }: PinModalProps) => {
  const { colors } = useTheme();
  const { pin, setPin } = useSettingsStore();

  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStep('enter');
      setFirstPin('');
      setCurrentInput('');
      setErrorMsg(null);
    }
  }, [visible]);

  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMsg(null);

    if (key === '⌫') {
      setCurrentInput(prev => prev.slice(0, -1));
      return;
    }

    if (key === '') return;

    if (currentInput.length < 4) {
      const nextInput = currentInput + key;
      setCurrentInput(nextInput);

      if (nextInput.length === 4) {
        // Complete 4-digit PIN entered
        if (mode === 'set') {
          if (step === 'enter') {
            setFirstPin(nextInput);
            setStep('confirm');
            setCurrentInput('');
          } else {
            // Confirm step
            if (nextInput === firstPin) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setPin(nextInput);
              onSuccess();
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              setErrorMsg("PINs don't match. Try again.");
              setStep('enter');
              setFirstPin('');
              setCurrentInput('');
            }
          }
        } else if (mode === 'verify' || mode === 'remove') {
          if (nextInput === pin) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (mode === 'remove') {
              setPin(null);
            }
            onSuccess();
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setErrorMsg('Incorrect PIN. Please try again.');
            setCurrentInput('');
          }
        }
      }
    }
  };

  const getTitle = () => {
    if (mode === 'set') {
      return step === 'enter' ? 'Create a 4-Digit PIN' : 'Confirm Your 4-Digit PIN';
    }
    if (mode === 'remove') return 'Enter PIN to Remove';
    return 'Enter Current PIN';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <Pressable onPress={onClose} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
            <X size={20} color={colors.primary} />
          </Pressable>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>Security PIN</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#22C55E15', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Lock size={28} color="#22C55E" />
          </View>

          <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
            {getTitle()}
          </Text>

          {errorMsg ? (
            <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 24 }}>
              {errorMsg}
            </Text>
          ) : (
            <Text style={{ color: colors.secondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              {mode === 'set' ? 'This PIN will be required to open Coinly' : 'Verify your identity to proceed'}
            </Text>
          )}

          {/* 4 Dots Indicator */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 40 }}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: currentInput.length > i ? '#22C55E' : colors.border,
                  backgroundColor: currentInput.length > i ? '#22C55E' : 'transparent',
                }}
              />
            ))}
          </View>

          {/* Keypad */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', maxWidth: 300 }}>
            {KEYPAD.map((key, index) => (
              <Pressable
                key={index}
                onPress={() => handleKeyPress(key)}
                style={({ pressed }) => ({
                  width: KEY_WIDTH,
                  height: 60,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? colors.muted : key === '' ? 'transparent' : colors.card,
                  marginBottom: 14,
                  borderWidth: key === '' ? 0 : 1,
                  borderColor: colors.border,
                })}
              >
                {key === '⌫' ? (
                  <Delete size={22} color={colors.primary} />
                ) : (
                  <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '700' }}>{key}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};
