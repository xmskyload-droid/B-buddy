import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const BG = '#09090B';
const CARD_BG = '#18181B';
const ACCENT = '#22C55E';

const SLIDES = [
  {
    id: '1',
    emoji: '💰',
    title: 'Track Every Expense',
    subtitle: 'Log your daily spending in seconds. No complexity, just clarity about where your money goes.',
    accentColor: '#22C55E',
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Understand Your Spending',
    subtitle: 'Beautiful charts and insights reveal your spending patterns and habits at a glance.',
    accentColor: '#3B82F6',
  },
  {
    id: '3',
    emoji: '🎯',
    title: 'Build Better Habits',
    subtitle: 'Set budgets, track goals, and build the financial discipline that leads to lasting freedom.',
    accentColor: '#8B5CF6',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('hasLaunched', 'true');
    router.replace('/(tabs)/home');
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('hasLaunched', 'true');
    router.replace('/(tabs)/home');
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View
      style={{
        width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
      }}
    >
      <Animated.View entering={FadeIn.delay(200).duration(600)}>
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 44,
            backgroundColor: `${item.accentColor}22`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            borderWidth: 1,
            borderColor: `${item.accentColor}40`,
          }}
        >
          <Text style={{ fontSize: 64 }}>{item.emoji}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(600)} style={{ alignItems: 'center' }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 40,
            letterSpacing: -0.5,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 17,
            textAlign: 'center',
            lineHeight: 26,
            fontWeight: '400',
          }}
        >
          {item.subtitle}
        </Text>
      </Animated.View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Skip */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8 }}>
          <Pressable
            onPress={handleSkip}
            style={{ paddingVertical: 8, paddingHorizontal: 16 }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '500' }}>
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          style={{ flex: 1 }}
        />

        {/* Bottom */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          {/* Dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 36 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  width: i === currentIndex ? 28 : 8,
                  backgroundColor: i === currentIndex ? ACCENT : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </View>

          {/* Continue / Get Started */}
          <Pressable
            onPress={handleNext}
            style={{
              width: '100%',
              height: 60,
              borderRadius: 20,
              backgroundColor: ACCENT,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: ACCENT,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 }}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started 🚀' : 'Continue'}
            </Text>
          </Pressable>

          {/* Page counter */}
          <Text
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: 13,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            {currentIndex + 1} of {SLIDES.length}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
