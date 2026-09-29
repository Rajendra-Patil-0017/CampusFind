import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon?: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
    color?: string;
  };
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}: ScreenHeaderProps) {
  const theme = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: pressed ? theme.border : theme.inputBg,
                borderColor: theme.border,
              },
            ]}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </Pressable>
        )}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText
              style={[styles.subtitle, { color: theme.textSecondary }]}
              numberOfLines={1}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>

      {rightAction && (
        <Pressable
          onPress={rightAction.onPress}
          accessibilityRole="button"
          accessibilityLabel={rightAction.label || 'Action'}
          style={({ pressed }) => [
            styles.rightButton,
            {
              backgroundColor: pressed ? theme.border : 'transparent',
            },
          ]}>
          {rightAction.icon && (
            <Ionicons
              name={rightAction.icon}
              size={22}
              color={rightAction.color || theme.primary}
            />
          )}
          {rightAction.label && (
            <ThemedText
              style={[
                styles.rightLabel,
                { color: rightAction.color || theme.primary },
              ]}>
              {rightAction.label}
            </ThemedText>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 56,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  rightLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
