import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, SectionList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';

import { useTheme } from '../../hooks/useTheme';
import { useExpenses } from '../../hooks/useExpenses';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { groupExpensesByDate, formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../store/settingsStore';

export default function TransactionsScreen() {
  const { colors, isDark } = useTheme();
  const { expenses, totalThisMonth } = useExpenses();
  const { currency } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '800' }}>
              Transactions
            </Text>
            <View
              style={{
                backgroundColor: '#22C55E20',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: '700' }}>
                {formatCurrency(totalThisMonth, currency)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              height: 48,
              borderRadius: 16,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 8,
              elevation: 2
            }}
          >
            <Search size={18} color={colors.secondary} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor={colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                marginLeft: 12,
                color: colors.primary,
                fontSize: 15,
                fontWeight: '500'
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
            subtitle={searchQuery ? `No transactions matching "${searchQuery}"` : 'Your expenses will appear here once you add them.'}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={{ paddingVertical: 8, marginBottom: 8, backgroundColor: colors.background }}>
                <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {title}
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
