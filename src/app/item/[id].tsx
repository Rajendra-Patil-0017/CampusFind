import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
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
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { APP_CONFIG } from '@/constants/config';
import { CATEGORY_DETAILS, Category } from '@/constants/categories';
import { LostFoundItem } from '@/types/item';
import { formatDisplayDate, formatRelativeTime } from '@/utils/formatters';
import { BorderRadius, Fonts, MaxContentWidth, ScreenPadding, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailsScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 880;
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
        <ScreenHeader title="Item Notice" showBack />
        <LoadingState message="Loading campus report..." />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScreenHeader title="Item Notice" showBack />
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

  const renderContent = () => (
    <View style={styles.responsiveContainer}>
      <ScreenHeader
        title="Notice Details"
        showBack
        rightAction={{
          icon: 'share-outline',
          onPress: handleShare,
          label: 'Share',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Photo Banner or Icon Placeholder */}
        {item.imageUri ? (
          <View style={[styles.imageContainer, Shadows.card]}>
            <Image
              source={{ uri: item.imageUri }}
              style={[styles.heroImage, { borderColor: theme.border }]}
              contentFit="cover"
              transition={200}
            />
          </View>
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              {
                backgroundColor: isLost ? theme.lostBg : theme.foundBg,
                borderColor: isLost ? theme.lostBorder : theme.foundBorder,
              },
            ]}>
            <Ionicons
              name={categoryIcon}
              size={56}
              color={isLost ? theme.lost : theme.found}
            />
            <ThemedText
              style={[
                styles.placeholderLabel,
                { color: isLost ? theme.lostText : theme.foundText },
              ]}>
              {item.category} Notice
            </ThemedText>
          </View>
        )}

        {/* Header Block: Title & Badges */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <StatusBadge type={item.type} size="md" />
            <StatusBadge status={item.status} size="md" />
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <Ionicons name={categoryIcon} size={13} color={theme.textSecondary} />
              <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
                {item.category}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.title}>{item.name}</ThemedText>

          <ThemedText style={[styles.postedTime, { color: theme.textMuted }]}>
            Posted {formatRelativeTime(item.createdAt)} • Incident Date:{' '}
            {formatDisplayDate(item.date)}
          </ThemedText>
        </View>

        {/* Location & Details Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.subtle,
          ]}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={18} color={theme.teal} style={styles.metaIcon} />
            <View style={styles.metaCol}>
              <ThemedText style={[styles.metaLabel, { color: theme.textSecondary }]}>
                Campus Location
              </ThemedText>
              <ThemedText style={styles.metaValue}>{item.location}</ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={18} color={theme.teal} style={styles.metaIcon} />
            <View style={styles.metaCol}>
              <ThemedText style={[styles.metaLabel, { color: theme.textSecondary }]}>
                Reported Date
              </ThemedText>
              <ThemedText style={styles.metaValue}>{formatDisplayDate(item.date)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.subtle,
          ]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Description & Notes
          </ThemedText>
          <ThemedText style={[styles.descriptionText, { color: theme.text }]}>
            {item.description}
          </ThemedText>
        </View>

        {/* Contact Information Box */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.subtle,
          ]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Contact / Reported By
          </ThemedText>

          <View style={styles.contactRow}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="person" size={20} color={theme.primary} />
            </View>
            <View style={styles.contactDetails}>
              <ThemedText style={styles.contactName}>{item.contactName}</ThemedText>
              <ThemedText style={[styles.contactInfo, { color: theme.textSecondary }]}>
                {item.contactInfo}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Actions Area */}
        <View style={styles.actionsSection}>
          {/* Primary Contact Button */}
          {!isOwner && (
            <PrimaryButton
              title={
                item.contactInfo.includes('@')
                  ? `Email ${item.contactName}`
                  : `Call / Message ${item.contactName}`
              }
              icon={item.contactInfo.includes('@') ? 'mail' : 'call'}
              size="lg"
              onPress={handleContactPress}
              style={styles.primaryActionButton}
            />
          )}

          {/* Owner Actions */}
          {isOwner && (
            <View style={styles.ownerActionsBlock}>
              <PrimaryButton
                title={isResolved ? 'Re-open Notice as Active' : 'Mark as Resolved / Returned'}
                icon={isResolved ? 'refresh-outline' : 'checkmark-circle-outline'}
                variant={isResolved ? 'secondary' : 'primary'}
                size="lg"
                onPress={() => setResolveModalVisible(true)}
              />

              <View style={styles.secondaryOwnerRow}>
                <PrimaryButton
                  title="Edit Notice"
                  icon="create-outline"
                  variant="secondary"
                  size="md"
                  onPress={() => router.push(`/item/edit/${item.id}` as any)}
                  style={styles.flexBtn}
                />
                <PrimaryButton
                  title="Delete"
                  icon="trash-outline"
                  variant="danger"
                  size="md"
                  onPress={() => setDeleteModalVisible(true)}
                  style={styles.flexBtn}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        visible={deleteModalVisible}
        title="Delete Notice?"
        message="Are you sure you want to remove this notice from the campus bulletin? This action cannot be easily undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        icon="trash-outline"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      {/* Resolve Confirmation Modal */}
      <ConfirmDialog
        visible={resolveModalVisible}
        title={isResolved ? 'Re-open Notice?' : 'Mark as Resolved?'}
        message={
          isResolved
            ? 'This notice will become active again and appear in main campus searches.'
            : 'Marking this item as resolved indicates it has been successfully returned to its rightful owner.'
        }
        confirmText={isResolved ? 'Re-open' : 'Mark Resolved'}
        cancelText="Cancel"
        icon="checkmark-circle-outline"
        onConfirm={handleToggleResolved}
        onCancel={() => setResolveModalVisible(false)}
      />
    </View>
  );

  if (isDesktop) {
    return (
      <View style={[styles.desktopContainer, { backgroundColor: theme.background }]}>
        <DesktopSidebar activeRoute="bulletin" />
        <View style={styles.desktopMainArea}>
          <DesktopHeader />
          <View style={styles.desktopContentWrapper}>{renderContent()}</View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopMainArea: {
    flex: 1,
  },
  desktopContentWrapper: {
    flex: 1,
    paddingTop: 16,
  },
  safeArea: {
    flex: 1,
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 60,
  },
  imageContainer: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  heroPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    gap: 8,
  },
  placeholderLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerBlock: {
    marginBottom: Spacing.four,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.two,
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 6,
  },
  postedTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaIcon: {
    marginTop: 2,
    marginRight: Spacing.three,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactInfo: {
    fontSize: 13,
    marginTop: 2,
  },
  actionsSection: {
    marginTop: Spacing.three,
  },
  primaryActionButton: {
    marginBottom: Spacing.three,
  },
  ownerActionsBlock: {
    gap: Spacing.two,
  },
  secondaryOwnerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 4,
  },
  flexBtn: {
    flex: 1,
  },
});
