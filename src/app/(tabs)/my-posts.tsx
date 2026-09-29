import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Snackbar } from '@/components/Snackbar';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { APP_CONFIG } from '@/constants/config';
import { ItemStatus, LostFoundItem } from '@/types/item';
import { BorderRadius, Fonts, MaxContentWidth, ScreenPadding, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function MyPostsScreen() {
  const theme = useTheme();

  const [posts, setPosts] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ItemStatus>('active');

  // Deletion modal & Undo states
  const [deleteTarget, setDeleteTarget] = useState<LostFoundItem | null>(null);
  const [deletedBackup, setDeletedBackup] = useState<LostFoundItem | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const loadMyPosts = useCallback(async () => {
    try {
      const allItems = await StorageService.getItems();
      const myItems = allItems.filter((item) => item.ownerId === APP_CONFIG.localUserId);
      setPosts(myItems);
    } catch (e) {
      console.warn('Failed to load user posts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyPosts();
    }, [loadMyPosts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMyPosts();
  }, [loadMyPosts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => p.status === activeTab);
  }, [posts, activeTab]);

  const activeCount = posts.filter((p) => p.status === 'active').length;
  const resolvedCount = posts.filter((p) => p.status === 'resolved').length;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const itemToDelete = deleteTarget;
    setDeleteTarget(null);

    setPosts((prev) => prev.filter((p) => p.id !== itemToDelete.id));
    setDeletedBackup(itemToDelete);
    setSnackbarMessage(`Notice "${itemToDelete.name}" deleted.`);
    setSnackbarVisible(true);

    await StorageService.deleteItem(itemToDelete.id);
  };

  const handleUndoDelete = async () => {
    if (!deletedBackup) return;
    const restored = deletedBackup;
    setDeletedBackup(null);
    setSnackbarVisible(false);

    await StorageService.createItem({
      ...restored,
    });
    loadMyPosts();
  };

  const handleToggleResolved = async (item: LostFoundItem) => {
    const newStatus: ItemStatus = item.status === 'active' ? 'resolved' : 'active';
    await StorageService.updateItem(item.id, { status: newStatus });
    loadMyPosts();
    setSnackbarMessage(
      newStatus === 'resolved'
        ? `Marked "${item.name}" as resolved.`
        : `Re-opened "${item.name}" as active.`
    );
    setSnackbarVisible(true);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Screen Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>My Reports</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Manage your lost and found listings
          </ThemedText>
        </View>

      {/* Segmented Tab Selector */}
      <View style={styles.tabContainer}>
        <View
          style={[
            styles.segmentedBar,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Pressable
            onPress={() => setActiveTab('active')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'active' }}
            style={[
              styles.segmentButton,
              {
                backgroundColor:
                  activeTab === 'active' ? theme.primary : 'transparent',
              },
            ]}>
            <ThemedText
              style={[
                styles.segmentText,
                {
                  color: activeTab === 'active' ? '#FFFFFF' : theme.text,
                  fontWeight: activeTab === 'active' ? '700' : '500',
                },
              ]}>
              Active ({activeCount})
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('resolved')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'resolved' }}
            style={[
              styles.segmentButton,
              {
                backgroundColor:
                  activeTab === 'resolved' ? theme.resolved : 'transparent',
              },
            ]}>
            <ThemedText
              style={[
                styles.segmentText,
                {
                  color: activeTab === 'resolved' ? '#FFFFFF' : theme.text,
                  fontWeight: activeTab === 'resolved' ? '700' : '500',
                },
              ]}>
              Resolved ({resolvedCount})
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Posts List */}
      {loading ? (
        <LoadingState message="Loading your reports..." />
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.postWrapper}>
              <ItemCard
                item={item}
                onPress={(selected) => router.push(`/item/${selected.id}` as any)}
              />

              {/* Quick Action Bar under Card */}
              <View
                style={[
                  styles.cardActions,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <Pressable
                  onPress={() => handleToggleResolved(item)}
                  style={styles.cardActionBtn}>
                  <Ionicons
                    name={
                      item.status === 'active'
                        ? 'checkmark-circle-outline'
                        : 'refresh-outline'
                    }
                    size={16}
                    color={item.status === 'active' ? theme.teal : theme.primary}
                  />
                  <ThemedText
                    style={[
                      styles.cardActionText,
                      { color: item.status === 'active' ? theme.teal : theme.primary },
                    ]}>
                    {item.status === 'active' ? 'Mark Resolved' : 'Re-open'}
                  </ThemedText>
                </Pressable>

                <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />

                <Pressable
                  onPress={() => router.push(`/item/edit/${item.id}` as any)}
                  style={styles.cardActionBtn}>
                  <Ionicons name="create-outline" size={16} color={theme.text} />
                  <ThemedText style={[styles.cardActionText, { color: theme.text }]}>
                    Edit
                  </ThemedText>
                </Pressable>

                <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />

                <Pressable
                  onPress={() => setDeleteTarget(item)}
                  style={styles.cardActionBtn}>
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                  <ThemedText style={[styles.cardActionText, { color: theme.danger }]}>
                    Delete
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === 'active' ? 'document-text-outline' : 'archive-outline'}
              title={
                activeTab === 'active'
                  ? 'No Active Listings'
                  : 'No Resolved Listings'
              }
              description={
                activeTab === 'active'
                  ? "You haven't reported any active lost or found items yet."
                  : 'Items you mark as resolved will be archived here for your records.'
              }
              actionTitle={activeTab === 'active' ? 'Report an Item' : undefined}
              actionIcon="add"
              onAction={() => router.push('/(tabs)/add')}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Notice?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? You will have 5 seconds to undo.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        icon="trash-outline"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

        {/* Animated Undo Toast */}
        <Snackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          actionText="UNDO"
          duration={APP_CONFIG.undoTimeoutMs}
          onAction={handleUndoDelete}
          onDismiss={() => {
            setSnackbarVisible(false);
            setDeletedBackup(null);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: ScreenPadding,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  tabContainer: {
    paddingHorizontal: ScreenPadding,
    marginVertical: Spacing.two,
  },
  segmentedBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: ScreenPadding,
    paddingTop: Spacing.one,
    paddingBottom: 120,
  },
  postWrapper: {
    marginBottom: Spacing.four,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: -Spacing.two,
    paddingVertical: 8,
  },
  cardActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 32,
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionDivider: {
    width: 1,
    height: 18,
  },
});
