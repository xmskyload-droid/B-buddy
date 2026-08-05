import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../hooks/useTheme';
import { useExpenseStore } from '../store/expenseStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Save local flag so next app launch skips login screen instantly
      await AsyncStorage.setItem('coinly_user_authed', 'true');
      
      // Automatically download and sync cloud expenses for this logged-in account
      const { syncWithCloud } = useExpenseStore.getState();
      await syncWithCloud();

      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const skipAuth = async () => {
    const hasLaunched = await AsyncStorage.getItem('hasLaunched');
    if (hasLaunched) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} scrollEnabled>
          
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View style={{ width: 80, height: 80, backgroundColor: '#22C55E', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 40 }}>💰</Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800', marginBottom: 8 }}>
              Welcome to Spendy
            </Text>
            <Text style={{ color: colors.secondary, fontSize: 16 }}>
              {isLogin ? 'Sign in to sync your expenses' : 'Create an account to save your data'}
            </Text>
          </View>

          {error && (
            <View style={{ backgroundColor: '#EF444420', padding: 12, borderRadius: 12, marginBottom: 24 }}>
              <Text style={{ color: '#EF4444', fontSize: 14, textAlign: 'center' }}>{error}</Text>
            </View>
          )}

          <View style={{ gap: 16, marginBottom: 32 }}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.secondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                color: colors.primary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: colors.border
              }}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                color: colors.primary,
                fontSize: 16,
                borderWidth: 1,
                borderColor: colors.border
              }}
            />
          </View>

          <Pressable
            onPress={handleAuth}
            disabled={loading}
            style={{
              backgroundColor: '#22C55E',
              borderRadius: 16,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={() => setIsLogin(!isLogin)} style={{ alignItems: 'center', padding: 16, marginBottom: 16 }}>
            <Text style={{ color: colors.primary, fontSize: 15 }}>
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </Text>
          </Pressable>

          <Pressable onPress={skipAuth} style={{ alignItems: 'center', padding: 16 }}>
            <Text style={{ color: colors.secondary, fontSize: 15, fontWeight: '600' }}>
              Skip for now
            </Text>
          </Pressable>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
