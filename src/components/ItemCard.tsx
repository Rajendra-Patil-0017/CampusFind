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
  const accentColor = isResolved
    ? theme.resolved
    : item.type === 'lost'
    ? theme.lost
    : theme.found;

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
        Shadows.tag,
      ]}>
      {/* Signature physical tag indicator spine */}
      <View style={[styles.spine, { backgroundColor: accentColor }]} />

      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <StatusBadge type={item.type} size="sm" />
            {showStatus && isResolved && (
              <StatusBadge status={item.status} size="sm" />
            )}
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                },
              ]}>
              <Ionicons name={categoryIcon} size={11} color={theme.textSecondary} />
              <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
                {item.category}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.timeText, { color: theme.textMuted }]}>
            {formatRelativeTime(item.createdAt)}
          </ThemedText>
        </View>

        <View style={styles.bodyRow}>
          <View style={styles.textContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText
              style={[styles.description, { color: theme.textSecondary }]}
              numberOfLines={2}>
              {getTruncatedText(item.description, 100)}
            </ThemedText>

            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color={theme.accent} />
              <ThemedText
                style={[styles.locationText, { color: theme.textSecondary }]}
                numberOfLines={1}>
                {item.location}
              </ThemedText>
            </View>
          </View>

          {item.imageUri ? (
            <Image
              source={{ uri: item.imageUri }}
              style={[styles.thumbnail, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.iconPlaceholder,
                {
                  backgroundColor:
                    item.type === 'lost' ? theme.lostBg : theme.foundBg,
                  borderColor:
                    item.type === 'lost' ? theme.lostBorder : theme.foundBorder,
                },
              ]}>
              <Ionicons
                name={categoryIcon}
                size={22}
                color={item.type === 'lost' ? theme.lost : theme.found}
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.three,
    overflow: 'hidden',
  },
  spine: {
    width: 4.5,
  },
  cardInner: {
    flex: 1,
    padding: Spacing.three,
    paddingLeft: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: 3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
