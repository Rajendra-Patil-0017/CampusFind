import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { PrimaryButton } from './PrimaryButton';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
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
          styles.iconCircle,
          {
            backgroundColor: theme.primaryLight,
          },
        ]}>
        <Ionicons name={icon} size={40} color={theme.primary} />
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: Spacing.four,
  },
  actionButton: {
    minWidth: 160,
  },
});
