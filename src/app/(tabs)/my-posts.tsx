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
import { BorderRadius, Spacing } from '@/constants/theme';
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
      {/* Screen Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Campus Reports</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Manage active notices and resolution records
        </ThemedText>
      </View>

      {/* Segmented Tab Bar */}
      <View
        style={[
          styles.segmentedContainer,
          { backgroundColor: theme.card, borderColor: theme.borderStrong },
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
                color: activeTab === 'active' ? '#FFFFFF' : theme.textSecondary,
                fontWeight: activeTab === 'active' ? '700' : '600',
              },
            ]}>
            Active Notices ({activeCount})
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
                activeTab === 'resolved' ? theme.primary : 'transparent',
            },
          ]}>
          <ThemedText
            style={[
              styles.segmentText,
              {
                color:
                  activeTab === 'resolved' ? '#FFFFFF' : theme.textSecondary,
                fontWeight: activeTab === 'resolved' ? '700' : '600',
              },
            ]}>
            Resolved Returns ({resolvedCount})
          </ThemedText>
        </Pressable>
      </View>

      {/* Posts List */}
      {loading ? (
        <LoadingState message="Loading your campus posts..." />
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <ItemCard
                item={item}
                onPress={() => router.push(`/item/${item.id}` as any)}
              />
              {/* Quick Actions Bar */}
              <View
                style={[
                  styles.quickActions,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderStrong,
                  },
                ]}>
                <Pressable
                  onPress={() => router.push(`/item/edit/${item.id}` as any)}
                  style={styles.actionBtn}>
                  <Ionicons name="pencil" size={14} color={theme.primary} />
                  <ThemedText style={[styles.actionBtnText, { color: theme.primary }]}>
                    Edit
                  </ThemedText>
                </Pressable>

                <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />

                <Pressable
                  onPress={() => handleToggleResolved(item)}
                  style={styles.actionBtn}>
                  <Ionicons
                    name={
                      item.status === 'active'
                        ? 'checkmark-done-circle'
                        : 'refresh-circle'
                    }
                    size={16}
                    color={item.status === 'active' ? theme.found : theme.primary}
                  />
                  <ThemedText
                    style={[
                      styles.actionBtnText,
                      {
                        color:
                          item.status === 'active' ? theme.found : theme.primary,
                      },
                    ]}>
                    {item.status === 'active' ? 'Mark Resolved' : 'Reactivate'}
                  </ThemedText>
                </Pressable>

                <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />

                <Pressable
                  onPress={() => setDeleteTarget(item)}
                  style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={14} color={theme.danger} />
                  <ThemedText style={[styles.actionBtnText, { color: theme.danger }]}>
                    Delete
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}
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
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === 'active' ? 'file-tray-outline' : 'checkmark-done-circle-outline'}
              title={activeTab === 'active' ? 'No Active Notices' : 'No Resolved Notices'}
              description={
                activeTab === 'active'
                  ? "You don't currently have any active items posted on the bulletin."
                  : 'Items marked as resolved will remain archived here.'
              }
              actionTitle={activeTab === 'active' ? 'Report an Item' : undefined}
              actionIcon="add-circle"
              onAction={() => router.push('/(tabs)/add')}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete this notice?"
        message="This will remove the notice from CampusFind. You'll have 4 seconds to undo."
        confirmText="Delete Notice"
        cancelText="Cancel"
        isDestructive
        icon="trash-outline"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Undo / Success Toast */}
      <Snackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        actionText={deletedBackup ? 'UNDO' : undefined}
        onAction={deletedBackup ? handleUndoDelete : undefined}
        onDismiss={() => {
          setSnackbarVisible(false);
          setDeletedBackup(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.two,
    padding: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xs,
  },
  segmentText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: Spacing.three,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginTop: -Spacing.three + 2,
    marginBottom: Spacing.two,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionDivider: {
    width: 1,
    height: 14,
  },
});
