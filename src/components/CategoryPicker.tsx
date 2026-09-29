import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES, CATEGORY_DETAILS } from '@/constants/categories';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface CategoryPickerProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  horizontal?: boolean;
  includeAll?: boolean;
}

export function CategoryPicker({
  selectedCategory,
  onSelectCategory,
  horizontal = false,
  includeAll = false,
}: CategoryPickerProps) {
  const theme = useTheme();

  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContent}>
        {includeAll && (
          <Pressable
            onPress={() => onSelectCategory('all')}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === 'all' }}
            style={({ pressed }) => [
              styles.horizontalItem,
              {
                backgroundColor:
                  selectedCategory === 'all' ? theme.primary : theme.card,
                borderColor:
                  selectedCategory === 'all' ? theme.primary : theme.borderStrong,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <Ionicons
              name="apps-outline"
              size={13}
              color={selectedCategory === 'all' ? '#FFFFFF' : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.horizontalLabel,
                {
                  color: selectedCategory === 'all' ? '#FFFFFF' : theme.text,
                  fontWeight: selectedCategory === 'all' ? '700' : '500',
                },
              ]}>
              All Categories
            </ThemedText>
          </Pressable>
        )}
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          const iconName = (CATEGORY_DETAILS[category]?.icon || 'cube-outline') as keyof typeof Ionicons.glyphMap;

          return (
            <Pressable
              key={category}
              onPress={() => onSelectCategory(category)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.horizontalItem,
                {
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : theme.borderStrong,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <Ionicons
                name={iconName}
                size={13}
                color={isSelected ? '#FFFFFF' : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.horizontalLabel,
                  {
                    color: isSelected ? '#FFFFFF' : theme.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}>
                {category}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        const iconName = (CATEGORY_DETAILS[category]?.icon || 'cube-outline') as keyof typeof Ionicons.glyphMap;

        return (
          <Pressable
            key={category}
            onPress={() => onSelectCategory(category)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.gridItem,
              {
                backgroundColor: isSelected ? theme.primaryLight : theme.card,
                borderColor: isSelected ? theme.primary : theme.border,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <Ionicons
              name={iconName}
              size={18}
              color={isSelected ? theme.primary : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.gridLabel,
                {
                  color: isSelected ? theme.primary : theme.text,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}>
              {category}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContent: {
    paddingVertical: 2,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.six + 12,
    gap: 6,
  },
  horizontalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
    minHeight: 32,
  },
  horizontalLabel: {
    fontSize: Typography.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
    width: '48.5%',
    minHeight: 44,
  },
  gridLabel: {
    fontSize: Typography.sm,
    flexShrink: 1,
  },
});
