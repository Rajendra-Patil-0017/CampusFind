import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { StatusBadge } from './StatusBadge';
import { useTheme } from '@/hooks/use-theme';
import { LostFoundItem } from '@/types/item';
import { CATEGORY_DETAILS, Category } from '@/constants/categories';
import { BorderRadius, Fonts, Shadows, Spacing, Typography } from '@/constants/theme';
import { formatRelativeTime, getTruncatedText } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface ItemCardProps {
  item: LostFoundItem;
  onPress: (item: LostFoundItem) => void;
  showStatus?: boolean;
}

export function ItemCard({ item, onPress, showStatus = true }: ItemCardProps) {
  const theme = useTheme();
  const categoryIcon = (CATEGORY_DETAILS[item.category as Category]?.icon ||
    'cube-outline') as keyof typeof Ionicons.glyphMap;

  const isResolved = item.status === 'resolved';
  const isLost = item.type === 'lost';

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.type.toUpperCase()}: ${item.name} at ${item.location}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.94 : 1,
        },
        Shadows.card,
      ]}>
      {/* Media Banner with Overlaid Badges */}
      <View style={styles.mediaContainer}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={[styles.thumbnail, { backgroundColor: theme.elevatedSurface, borderColor: theme.border }]}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                backgroundColor: isLost ? theme.lostBg : theme.foundBg,
                borderColor: isLost ? theme.lostBorder : theme.foundBorder,
              },
            ]}>
            <Ionicons
              name={categoryIcon}
              size={36}
              color={isLost ? theme.lost : theme.found}
            />
            <ThemedText
              style={[
                styles.placeholderTag,
                { color: isLost ? theme.lostText : theme.foundText },
              ]}>
              {item.category}
            </ThemedText>
          </View>
        )}

        {/* Top-Left Overlaid Status Badge */}
        <View style={styles.overlayTopLeft}>
          <StatusBadge type={item.type} size="sm" />
          {showStatus && isResolved && (
            <StatusBadge status={item.status} size="sm" />
          )}
        </View>

        {/* Top-Right Category Pill */}
        <View
          style={[
            styles.categoryOverlayPill,
            { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderColor: theme.border },
          ]}>
          <Ionicons name={categoryIcon} size={11} color={theme.textSecondary} style={{ marginRight: 3 }} />
          <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
            {item.category}
          </ThemedText>
        </View>
      </View>

      {/* Editorial Content Block */}
      <View style={styles.content}>
        {/* Date & Location Meta Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={12} color={theme.primary} style={{ marginRight: 3 }} />
            <ThemedText
              style={[styles.metaText, { color: theme.textSecondary }]}
              numberOfLines={1}>
              {item.location}
            </ThemedText>
          </View>
          <ThemedText style={[styles.dot, { color: theme.textMuted }]}>•</ThemedText>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={theme.textMuted} style={{ marginRight: 3 }} />
            <ThemedText style={[styles.metaText, { color: theme.textMuted }]}>
              {formatRelativeTime(item.createdAt)}
            </ThemedText>
          </View>
        </View>

        {/* Serif Item Title */}
        <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </ThemedText>

        {/* Short Description */}
        {item.description ? (
          <ThemedText
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={2}>
            {getTruncatedText(item.description, 110)}
          </ThemedText>
        ) : null}

        {/* Card Footer Button */}
        <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
          <ThemedText style={[styles.viewDetailsText, { color: theme.primary }]}>
            View Details
          </ThemedText>
          <Ionicons name="arrow-forward" size={13} color={theme.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: Spacing.three,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 155,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  placeholder: {
    width: '100%',
    height: 140,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderTag: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  overlayTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryOverlayPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: Typography.xs,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  metaText: {
    fontSize: Typography.xs,
    fontWeight: '500',
  },
  dot: {
    fontSize: Typography.xs,
    marginHorizontal: 2,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  description: {
    fontSize: Typography.sm,
    lineHeight: 19,
    marginBottom: Spacing.three,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  viewDetailsText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
