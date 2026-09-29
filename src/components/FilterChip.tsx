import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
  tint?: 'default' | 'lost' | 'found';
}

export function FilterChip({
  label,
  selected,
  onPress,
  icon,
  count,
  tint = 'default',
}: FilterChipProps) {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (!selected) return theme.card;
    if (tint === 'lost') return theme.lost;
    if (tint === 'found') return theme.found;
    return theme.primary;
  };

  const getBorderColor = () => {
    if (!selected) return theme.borderStrong;
    if (tint === 'lost') return theme.lost;
    if (tint === 'found') return theme.found;
    return theme.primary;
  };

  const getTextColor = () => {
    if (selected) return '#FFFFFF';
    return theme.text;
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={getTextColor()}
          style={styles.icon}
        />
      )}
      <ThemedText
        style={[
          styles.label,
          {
            color: getTextColor(),
            fontWeight: selected ? '700' : '500',
          },
        ]}>
        {label}
      </ThemedText>
      {count !== undefined && (
        <ThemedText
          style={[
            styles.count,
            {
              color: selected ? 'rgba(255, 255, 255, 0.9)' : theme.textSecondary,
              fontWeight: selected ? '700' : '500',
            },
          ]}>
          ({count})
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.two,
    minHeight: 34,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 13,
  },
  count: {
    fontSize: 12,
    marginLeft: 3,
  },
});
