import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '💳',
    title: 'Track Every Expense',
    subtitle:
      'Log your daily spending in seconds. No complexity, just clarity about where your money goes.',
    accentColor: '#22C55E',
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Understand Your Spending',
    subtitle:
      'Beautiful charts and insights reveal your spending patterns and habits at a glance.',
    accentColor: '#3B82F6',
  },
  {
    id: '3',
    emoji: '🎯',
    title: 'Build Better Habits',
    subtitle:
      'Set budgets, track goals, and build the financial discipline that leads to lasting freedom.',
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

  const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <Animated.View entering={FadeIn.delay(200).duration(600)}>
        <View
          className="w-32 h-32 rounded-[40px] items-center justify-center mb-10"
          style={{ backgroundColor: `${item.accentColor}18` }}
        >
          <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(600)}>
        <Text className="text-white text-4xl font-bold text-center mb-4 leading-tight">
          {item.title}
        </Text>
        <Text className="text-white/50 text-lg text-center leading-relaxed">
          {item.subtitle}
        </Text>
      </Animated.View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#09090B]">
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <SafeAreaView className="flex-1">
        {/* Skip Button */}
        <View className="flex-row justify-end px-6 pt-2">
          <Pressable onPress={handleSkip} className="py-2 px-4">
            <Text className="text-white/40 text-base font-medium">Skip</Text>
          </Pressable>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          scrollEnabled={false}
          className="flex-1"
        />

        {/* Bottom Section */}
        <View className="px-6 pb-8">
          {/* Dots */}
          <View className="flex-row justify-center mb-10">
            {SLIDES.map((_, i) => (
              <View
                key={i}
                className="mx-1 h-2 rounded-full"
                style={{
                  width: i === currentIndex ? 24 : 8,
                  backgroundColor: i === currentIndex ? '#22C55E' : '#fff3',
                }}
              />
            ))}
          </View>

          {/* Next / Get Started Button */}
          <Pressable
            onPress={handleNext}
            className="w-full h-16 rounded-2xl items-center justify-center"
            style={{ backgroundColor: '#22C55E' }}
          >
            <Text className="text-white text-lg font-bold">
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </Pressable>

          {/* Page indicator text */}
          <Text className="text-white/30 text-sm text-center mt-4">
            {currentIndex + 1} of {SLIDES.length}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
