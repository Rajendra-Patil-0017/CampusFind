import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { ItemStatus, ItemType } from '@/types/item';
import { BorderRadius } from '@/constants/theme';

interface StatusBadgeProps {
  type?: ItemType;
  status?: ItemStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ type, status, size = 'md' }: StatusBadgeProps) {
  const theme = useTheme();

  if (type) {
    const isLost = type === 'lost';
    const bg = isLost ? theme.lostBg : theme.foundBg;
    const borderColor = isLost ? theme.lostBorder : theme.foundBorder;
    const textColor = isLost ? theme.lostText : theme.foundText;
    const dotColor = isLost ? theme.lost : theme.found;
    const label = isLost ? 'LOST' : 'FOUND';

    return (
      <View
        style={[
          styles.badge,
          size === 'sm' ? styles.badgeSm : styles.badgeMd,
          { backgroundColor: bg, borderColor },
        ]}
        accessibilityRole="text"
        accessibilityLabel={`Type: ${label}`}>
        <View
          style={[
            styles.dot,
            size === 'sm' ? styles.dotSm : styles.dotMd,
            { backgroundColor: dotColor },
          ]}
        />
        <ThemedText
          style={[
            styles.text,
            size === 'sm' ? styles.textSm : styles.textMd,
            { color: textColor },
          ]}>
          {label}
        </ThemedText>
      </View>
    );
  }

  if (status) {
    const isResolved = status === 'resolved';
    const bg = isResolved ? theme.resolvedBg : theme.activeBg;
    const borderColor = isResolved ? theme.resolvedBorder : theme.activeBorder;
    const textColor = isResolved ? theme.resolvedText : theme.activeText;
    const label = isResolved ? 'Resolved' : 'Active';

    return (
      <View
        style={[
          styles.badge,
          size === 'sm' ? styles.badgeSm : styles.badgeMd,
          { backgroundColor: bg, borderColor },
        ]}
        accessibilityRole="text"
        accessibilityLabel={`Status: ${label}`}>
        <ThemedText
          style={[
            styles.text,
            size === 'sm' ? styles.textSm : styles.textMd,
            { color: textColor },
          ]}>
          {label}
        </ThemedText>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    gap: 5,
  },
  dot: {
    borderRadius: 9999,
  },
  dotSm: {
    width: 5,
    height: 5,
  },
  dotMd: {
    width: 6,
    height: 6,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
    lineHeight: 13,
  },
  textMd: {
    fontSize: 11,
    lineHeight: 14,
  },
});
