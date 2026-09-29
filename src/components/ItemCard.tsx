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
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
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
          opacity: pressed ? 0.92 : 1,
        },
        Shadows.card,
      ]}>
      {/* Thumbnail or Category Icon Placeholder */}
      <View style={styles.mediaContainer}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={[styles.thumbnail, { backgroundColor: theme.background }]}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                backgroundColor: item.type === 'lost' ? theme.lostBg : theme.foundBg,
                borderColor: item.type === 'lost' ? theme.lostBorder : theme.foundBorder,
              },
            ]}>
            <Ionicons
              name={categoryIcon}
              size={24}
              color={item.type === 'lost' ? theme.lost : theme.found}
            />
          </View>
        )}
      </View>

      {/* Content Body */}
      <View style={styles.content}>
        {/* Top Badges & Timestamp */}
        <View style={styles.topRow}>
          <View style={styles.badgeGroup}>
            <StatusBadge type={item.type} size="sm" />
            {showStatus && isResolved && (
              <StatusBadge status={item.status} size="sm" />
            )}
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
                {item.category}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.timeText, { color: theme.textMuted }]}>
            {formatRelativeTime(item.createdAt)}
          </ThemedText>
        </View>

        {/* Item Name */}
        <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </ThemedText>

        {/* Short Description */}
        {item.description ? (
          <ThemedText
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={2}>
            {getTruncatedText(item.description, 90)}
          </ThemedText>
        ) : null}

        {/* Location Row */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
          <ThemedText
            style={[styles.locationText, { color: theme.textSecondary }]}
            numberOfLines={1}>
            {item.location}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    alignItems: 'flex-start',
  },
  mediaContainer: {
    marginRight: Spacing.three,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.sm,
  },
  placeholder: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
