import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface DesktopHeaderProps {
  selectedCampus?: string;
  onCampusPress?: () => void;
  onNotificationPress?: () => void;
}

export function DesktopHeader({
  selectedCampus = 'Main Campus • St. Jude University',
  onCampusPress,
  onNotificationPress,
}: DesktopHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      {/* Left: Campus Selector */}
      <Pressable
        onPress={onCampusPress}
        style={({ pressed }) => [
          styles.campusPill,
          {
            backgroundColor: pressed ? theme.border : theme.elevatedSurface,
            borderColor: theme.border,
          },
        ]}>
        <Ionicons name="location" size={14} color={theme.primary} />
        <ThemedText style={[styles.campusText, { color: theme.primary }]}>
          {selectedCampus}
        </ThemedText>
        <Ionicons name="chevron-down" size={12} color={theme.primary} />
      </Pressable>

      {/* Right: Quick Action Controls */}
      <View style={styles.rightActions}>
        {/* Report Shortcut */}
        <Pressable
          onPress={() => router.push('/(tabs)/add')}
          style={({ pressed }) => [
            styles.quickReportBtn,
            {
              backgroundColor: theme.primaryLight,
              borderColor: theme.primary,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <Ionicons name="add-circle-outline" size={15} color={theme.primary} />
          <ThemedText style={[styles.quickReportText, { color: theme.primary }]}>
            Report Notice
          </ThemedText>
        </Pressable>

        {/* Notifications Icon */}
        <Pressable
          onPress={onNotificationPress || (() => router.push('/about'))}
          accessibilityLabel="Campus announcements & safety notices"
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: pressed ? theme.elevatedSurface : 'transparent',
              borderColor: theme.border,
            },
          ]}>
          <Ionicons name="notifications-outline" size={18} color={theme.text} />
          <View style={[styles.notifDot, { backgroundColor: theme.lost }]} />
        </Pressable>

        {/* Safety Guide Icon */}
        <Pressable
          onPress={() => router.push('/about')}
          accessibilityLabel="Campus Safety Protocol"
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: pressed ? theme.elevatedSurface : 'transparent',
              borderColor: theme.border,
            },
          ]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.primary} />
        </Pressable>

        {/* User Profile Avatar Button */}
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityLabel="View profile"
          style={[styles.avatarBtn, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
          <Ionicons name="person" size={16} color={theme.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  campusText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  quickReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 5,
  },
  quickReportText: {
    fontSize: Typography.xs,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
