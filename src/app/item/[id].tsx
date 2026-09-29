import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { APP_CONFIG } from '@/constants/config';
import { CATEGORY_DETAILS, Category } from '@/constants/categories';
import { LostFoundItem } from '@/types/item';
import { formatDisplayDate, formatRelativeTime } from '@/utils/formatters';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [resolveModalVisible, setResolveModalVisible] = useState<boolean>(false);

  const loadItem = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const found = await StorageService.getItemById(id);
      setItem(found);
    } catch (e) {
      console.warn('Failed to load item:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [loadItem])
  );

  const isOwner = item?.ownerId === APP_CONFIG.localUserId;

  const handleShare = async () => {
    if (!item) return;
    try {
      const statusText = item.type === 'lost' ? 'LOST ON CAMPUS' : 'FOUND ON CAMPUS';
      const shareMessage = `[CampusFind] ${statusText}: ${item.name}\nLocation: ${item.location}\nDate: ${formatDisplayDate(item.date)}\nDetails: ${item.description}\n\nContact: ${item.contactName} (${item.contactInfo})`;

      await Share.share({
        message: shareMessage,
        title: `${statusText}: ${item.name}`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleContactPress = () => {
    if (!item?.contactInfo) return;
    const info = item.contactInfo.trim();

    if (info.includes('@')) {
      Linking.openURL(`mailto:${info}?subject=CampusFind: Regarding ${item.name}`);
    } else if (/^[\d+\-()\s]+$/.test(info)) {
      Linking.openURL(`tel:${info}`);
    } else {
      Alert.alert('Poster Details', `${item.contactName}: ${item.contactInfo}`);
    }
  };

  const handleToggleResolved = async () => {
    if (!item) return;
    const newStatus = item.status === 'active' ? 'resolved' : 'active';
    await StorageService.updateItem(item.id, { status: newStatus });
    setResolveModalVisible(false);
    loadItem();
  };

  const handleDelete = async () => {
    if (!item) return;
    await StorageService.deleteItem(item.id);
    setDeleteModalVisible(false);
    router.replace('/(tabs)/my-posts' as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScreenHeader title="Record Details" showBack />
        <LoadingState message="Loading campus report..." />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScreenHeader title="Record Details" showBack />
        <EmptyState
          icon="alert-circle-outline"
          title="Notice Not Found"
          description="This post may have been removed or archived."
          actionTitle="Back to Bulletin"
          actionIcon="newspaper-outline"
          onAction={() => router.replace('/(tabs)' as any)}
        />
      </SafeAreaView>
    );
  }

  const categoryIcon = (CATEGORY_DETAILS[item.category as Category]?.icon ||
    'cube-outline') as keyof typeof Ionicons.glyphMap;

  const isResolved = item.status === 'resolved';
  const isLost = item.type === 'lost';
  const tagColor = isResolved ? theme.resolved : isLost ? theme.lost : theme.found;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={item.name}
        subtitle={`Campus Notice #${item.id.slice(-6)}`}
        showBack
        rightAction={{
          icon: 'share-social-outline',
          label: 'Share',
          onPress: handleShare,
          color: theme.primary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Physical Notice Banner / Image */}
        {item.imageUri ? (
          <View style={[styles.heroImageContainer, Shadows.tag, { borderColor: theme.borderStrong }]}>
            <Image
              source={{ uri: item.imageUri }}
              style={styles.heroImage}
              contentFit="cover"
            />
          </View>
        ) : (
          <View
            style={[
              styles.heroBanner,
              {
                backgroundColor: isResolved
                  ? theme.resolvedBg
                  : isLost
                  ? theme.lostBg
                  : theme.foundBg,
                borderColor: isResolved
                  ? theme.resolvedBorder
                  : isLost
                  ? theme.lostBorder
                  : theme.foundBorder,
              },
            ]}>
            <Ionicons
              name={categoryIcon}
              size={44}
              color={tagColor}
            />
            <ThemedText
              style={[
                styles.bannerType,
                { color: isResolved ? theme.resolvedText : isLost ? theme.lostText : theme.foundText },
              ]}>
              {isResolved
                ? 'RESOLVED • ITEM RETURNED'
                : isLost
                ? 'CAMPUS LOST ITEM NOTICE'
                : 'CAMPUS FOUND ITEM NOTICE'}
            </ThemedText>
          </View>
        )}

        {/* Status Badges */}
        <View style={styles.badgeRow}>
          <StatusBadge type={item.type} size="md" />
          <StatusBadge status={item.status} size="md" />
          <View
            style={[
              styles.categoryPill,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
            ]}>
            <Ionicons name={categoryIcon} size={13} color={theme.textSecondary} />
            <ThemedText style={[styles.categoryPillText, { color: theme.textSecondary }]}>
              {item.category}
            </ThemedText>
          </View>
        </View>

        {/* Main Document Details Card */}
        <View
          style={[
            styles.docCard,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>

          <View style={styles.metaGrid}>
            <View style={styles.metaBox}>
              <Ionicons name="location-sharp" size={15} color={theme.accent} />
              <View style={styles.metaTextGroup}>
                <ThemedText style={[styles.metaLabel, { color: theme.textMuted }]}>
                  Location
                </ThemedText>
                <ThemedText style={styles.metaValue}>{item.location}</ThemedText>
              </View>
            </View>

            <View style={styles.metaBox}>
              <Ionicons name="calendar-sharp" size={15} color={theme.primary} />
              <View style={styles.metaTextGroup}>
                <ThemedText style={[styles.metaLabel, { color: theme.textMuted }]}>
                  Date
                </ThemedText>
                <ThemedText style={styles.metaValue}>
                  {formatDisplayDate(item.date)}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <ThemedText style={styles.sectionHeading}>Description</ThemedText>
          <ThemedText style={[styles.descriptionText, { color: theme.text }]}>
            {item.description}
          </ThemedText>

          <View style={styles.timestampRow}>
            <Ionicons name="time-outline" size={13} color={theme.textMuted} />
            <ThemedText style={[styles.timestampText, { color: theme.textMuted }]}>
              Logged {formatRelativeTime(item.createdAt)}
              {item.createdAt !== item.updatedAt
                ? ` (Updated ${formatRelativeTime(item.updatedAt)})`
                : ''}
            </ThemedText>
          </View>
        </View>

        {/* Actions Section */}
        {isOwner ? (
          <View
            style={[
              styles.ownerPanel,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
              Shadows.tag,
            ]}>
            <View style={styles.ownerHeader}>
              <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
              <ThemedText style={styles.ownerTitle}>Your Post Controls</ThemedText>
            </View>

            <View style={styles.ownerButtonsRow}>
              <PrimaryButton
                title="Edit Details"
                icon="pencil"
                variant="secondary"
                size="md"
                onPress={() => router.push(`/item/edit/${item.id}` as any)}
                style={styles.ownerBtn}
              />

              <PrimaryButton
                title={item.status === 'active' ? 'Mark Resolved' : 'Reactivate'}
                icon={
                  item.status === 'active'
                    ? 'checkmark-done-circle'
                    : 'refresh-circle'
                }
                variant={item.status === 'active' ? 'primary' : 'outline'}
                size="md"
                onPress={() => setResolveModalVisible(true)}
                style={styles.ownerBtn}
              />
            </View>

            <PrimaryButton
              title="Delete Record"
              icon="trash-outline"
              variant="danger"
              size="sm"
              onPress={() => setDeleteModalVisible(true)}
            />
          </View>
        ) : (
          <View
            style={[
              styles.contactPanel,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
              Shadows.tag,
            ]}>
            <ThemedText style={styles.sectionHeading}>Contact Reporter</ThemedText>
            <ThemedText style={[styles.contactHelp, { color: theme.textSecondary }]}>
              Connect directly to confirm ownership and coordinate handover
            </ThemedText>

            <View style={styles.contactRow}>
              <View style={[styles.avatarBox, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="person" size={18} color={theme.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText style={styles.contactName}>{item.contactName}</ThemedText>
                <ThemedText style={[styles.contactDetail, { color: theme.textSecondary }]}>
                  {item.contactInfo}
                </ThemedText>
              </View>
            </View>

            <View style={styles.contactButtonsRow}>
              <PrimaryButton
                title={
                  item.contactInfo.includes('@') ? 'Email Reporter' : 'Call / Text'
                }
                icon={
                  item.contactInfo.includes('@') ? 'mail-outline' : 'call-outline'
                }
                onPress={handleContactPress}
                size="md"
                style={styles.contactActionBtn}
              />
              <PrimaryButton
                title="Share Notice"
                icon="share-social-outline"
                variant="secondary"
                onPress={handleShare}
                size="md"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteModalVisible}
        title="Delete this notice?"
        message="This action will permanently delete this record from CampusFind."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        icon="trash-outline"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      {/* Resolve Confirmation Dialog */}
      <ConfirmDialog
        visible={resolveModalVisible}
        title={
          item.status === 'active'
            ? 'Mark Notice as Resolved?'
            : 'Reopen Notice as Active?'
        }
        message={
          item.status === 'active'
            ? 'This flags the item as successfully returned or recovered.'
            : 'This returns the notice back to the active campus bulletin feed.'
        }
        confirmText={item.status === 'active' ? 'Mark Resolved' : 'Reactivate'}
        cancelText="Cancel"
        icon="checkmark-circle-outline"
        onConfirm={handleToggleResolved}
        onCancel={() => setResolveModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.seven,
  },
  heroImageContainer: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.three,
    borderWidth: 1,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroBanner: {
    height: 110,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
    gap: 6,
  },
  bannerType: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.three,
    flexWrap: 'wrap',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: 4,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  docCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.two,
    letterSpacing: -0.3,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginVertical: 4,
  },
  metaBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  metaTextGroup: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.three,
  },
  timestampText: {
    fontSize: 11,
  },
  ownerPanel: {
    padding: Spacing.four,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  ownerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ownerBtn: {
    flex: 1,
  },
  contactPanel: {
    padding: Spacing.four,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  contactHelp: {
    fontSize: 12,
    marginBottom: Spacing.three,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactDetail: {
    fontSize: 12,
    marginTop: 1,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactActionBtn: {
    flex: 1,
  },
});
