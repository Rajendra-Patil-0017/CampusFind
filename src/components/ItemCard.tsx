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
            style={[styles.thumbnail, { backgroundColor: theme.background, borderColor: theme.border }]}
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

      {/* Content Area with strict Information Hierarchy */}
      <View style={styles.content}>
        {/* 1. Item Title */}
        <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </ThemedText>

        {/* 2. Status Badge and Category */}
        <View style={styles.metaRow}>
          <StatusBadge type={item.type} size="sm" />
          {showStatus && isResolved && (
            <StatusBadge status={item.status} size="sm" />
          )}
          <View
            style={[
              styles.categoryPill,
              { backgroundColor: theme.elevatedSurface, borderColor: theme.border },
            ]}>
            <Ionicons name={categoryIcon} size={11} color={theme.textSecondary} style={{ marginRight: 3 }} />
            <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
              {item.category}
            </ThemedText>
          </View>
        </View>

        {/* 3. Location and Date */}
        <View style={styles.locationDateRow}>
          <View style={styles.locationItem}>
            <Ionicons name="location-outline" size={12} color={theme.textSecondary} style={{ marginRight: 3 }} />
            <ThemedText
              style={[styles.locationText, { color: theme.textSecondary }]}
              numberOfLines={1}>
              {item.location}
            </ThemedText>
          </View>
          <ThemedText style={[styles.dotSeparator, { color: theme.textMuted }]}>•</ThemedText>
          <ThemedText style={[styles.timeText, { color: theme.textMuted }]}>
            {formatRelativeTime(item.createdAt)}
          </ThemedText>
        </View>

        {/* 4. Short Description */}
        {item.description ? (
          <ThemedText
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={2}>
            {getTruncatedText(item.description, 95)}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.two + 2,
    alignItems: 'flex-start',
  },
  mediaContainer: {
    marginRight: Spacing.three,
    marginTop: 2,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
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
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  locationDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dotSeparator: {
    fontSize: 10,
    marginHorizontal: 2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  description: {
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 1,
  },
});
