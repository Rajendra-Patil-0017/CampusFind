import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { PrimaryButton } from './PrimaryButton';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  icon = 'search-outline',
  title,
  description,
  actionTitle,
  onAction,
  actionIcon,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}>
        <Ionicons name={icon} size={32} color={theme.textSecondary} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText
        style={[styles.description, { color: theme.textSecondary }]}>
        {description}
      </ThemedText>
      {actionTitle && onAction && (
        <PrimaryButton
          title={actionTitle}
          onPress={onAction}
          icon={actionIcon}
          size="md"
          variant="secondary"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: Spacing.four,
  },
  actionButton: {
    minWidth: 160,
  },
});
