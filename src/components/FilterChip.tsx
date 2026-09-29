import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius } from '@/constants/theme';
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

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}>
      {icon && (
        <Ionicons
          name={icon}
          size={13}
          color={selected ? '#FFFFFF' : theme.textSecondary}
          style={styles.icon}
        />
      )}
      <ThemedText
        style={[
          styles.label,
          {
            color: selected ? '#FFFFFF' : theme.text,
            fontWeight: selected ? '700' : '600',
          },
        ]}>
        {label}
      </ThemedText>
      {count !== undefined && (
        <ThemedText
          style={[
            styles.count,
            {
              color: selected ? 'rgba(255, 255, 255, 0.85)' : theme.textMuted,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    marginRight: 6,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
  },
  count: {
    fontSize: 11,
    marginLeft: 3,
  },
});
