import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, Platform } from 'react-native';
import { Home, List, PieChart, User, Plus } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Text } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FABButton() {
  const router = useRouter();
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 10 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/add-expense');
      }}
      style={[
        {
          width: 58,
          height: 58,
          borderRadius: 18,
          backgroundColor: '#22C55E',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#22C55E',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 10,
        },
        style,
      ]}
    >
      <Plus size={26} color="white" strokeWidth={2.5} />
    </AnimatedPressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();

  const TABS = [
    { name: 'home', label: 'Home', Icon: Home },
    { name: 'transactions', label: 'Transactions', Icon: List },
    { name: 'analytics', label: 'Analytics', Icon: PieChart },
    { name: 'profile', label: 'Profile', Icon: User },
  ];

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
      }}
    >
      {/* First two tabs */}
      {TABS.slice(0, 2).map((tab) => {
        const route = state.routes.find((r: any) => r.name === tab.name);
        if (!route) return null;
        const isFocused = state.index === state.routes.findIndex((r: any) => r.name === tab.name);
        const color = isFocused ? '#22C55E' : colors.secondary;

        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(tab.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}
          >
            <tab.Icon size={22} color={color} strokeWidth={isFocused ? 2.5 : 2} />
            <Text style={{ color, fontSize: 10, fontWeight: isFocused ? '700' : '500' }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}

      {/* Center FAB */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 }}>
        <FABButton />
      </View>

      {/* Last two tabs */}
      {TABS.slice(2).map((tab) => {
        const isFocused = state.index === state.routes.findIndex((r: any) => r.name === tab.name);
        const color = isFocused ? '#22C55E' : colors.secondary;

        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(tab.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}
          >
            <tab.Icon size={22} color={color} strokeWidth={isFocused ? 2.5 : 2} />
            <Text style={{ color, fontSize: 10, fontWeight: isFocused ? '700' : '500' }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
