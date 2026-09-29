import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search items, locations, categories...',
  showFilterButton,
  onFilterPress,
  hasActiveFilters,
}: SearchBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.borderStrong,
          },
        ]}>
        <Ionicons
          name="search"
          size={18}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="search"
          clearButtonMode="never"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search lost and found items"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
            hitSlop={8}
            accessibilityLabel="Clear search text"
            style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {showFilterButton && (
        <Pressable
          onPress={onFilterPress}
          accessibilityLabel="Toggle filter and sort options"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.filterButton,
            {
              backgroundColor: hasActiveFilters ? theme.primary : theme.card,
              borderColor: hasActiveFilters ? theme.primary : theme.borderStrong,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <Ionicons
            name="options-outline"
            size={18}
            color={hasActiveFilters ? '#FFFFFF' : theme.text}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: Spacing.half,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
