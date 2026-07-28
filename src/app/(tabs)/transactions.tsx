import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  SectionList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';

import { useTheme } from '../../hooks/useTheme';
import { useExpenses } from '../../hooks/useExpenses';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { groupExpensesByDate } from '../../utils/formatters';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';

export default function TransactionsScreen() {
  const { colors, isDark } = useTheme();
  const { expenses, totalThisMonth } = useExpenses();
  const { currency } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        searchQuery === '' ||
        e.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.amount.toString().includes(searchQuery);
      return matchesSearch;
    });
  }, [expenses, searchQuery]);

  const sections = useMemo(() => {
    return groupExpensesByDate(filtered);
  }, [filtered]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} className="px-6 pt-4 pb-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>
              Transactions
            </Text>
            <View
              style={{
                backgroundColor: `${colors.accent}18`,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700' }}>
                {formatCurrency(totalThisMonth, currency)}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.secondary, fontSize: 13 }}>
            {expenses.length} transactions total
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} className="px-6 mb-4">
          <View
            className="flex-row items-center rounded-2xl px-4"
            style={{
              backgroundColor: colors.card,
              height: 48,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Search size={18} color={colors.secondary} />
            <TextInput
              placeholder="Search transactions..."
              placeholderTextColor={colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                marginLeft: 10,
                color: colors.primary,
                fontSize: 15,
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.secondary} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title={searchQuery ? 'No results found' : 'No transactions yet'}
            subtitle={
              searchQuery
                ? `No transactions matching "${searchQuery}"`
                : 'Your expenses will appear here once you add them.'
            }
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            renderSectionHeader={({ section: { title, data } }) => (
              <View
                className="flex-row justify-between items-center py-2 mb-1"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  style={{ color: colors.secondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}
                >
                  {title.toUpperCase()}
                </Text>
                <Text style={{ color: colors.secondary, fontSize: 12 }}>
                  {data.length} items
                </Text>
              </View>
            )}
            renderItem={({ item, index }) => (
              <ExpenseCard expense={item} delay={index * 50} />
            )}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
