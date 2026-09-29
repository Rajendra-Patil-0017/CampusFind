import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { SearchBar } from '@/components/SearchBar';
import { FilterChip } from '@/components/FilterChip';
import { CategoryPicker } from '@/components/CategoryPicker';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { FilterState, ItemSortOption, LostFoundItem } from '@/types/item';
import { applyFiltersAndSort } from '@/utils/filters';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const theme = useTheme();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: 'all',
    status: 'active',
    searchQuery: '',
    sortBy: 'newest',
  });

  const loadItems = useCallback(async () => {
    try {
      const data = await StorageService.getItems();
      setItems(data);
    } catch (e) {
      console.warn('Failed to load items:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    return applyFiltersAndSort(items, filters);
  }, [items, filters]);

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'active' ||
    filters.searchQuery.trim().length > 0;

  const resetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      status: 'active',
      searchQuery: '',
      sortBy: 'newest',
    });
  };

  const lostCount = items.filter((i) => i.type === 'lost' && i.status === 'active').length;
  const foundCount = items.filter((i) => i.type === 'found' && i.status === 'active').length;

  const sortLabels: Record<ItemSortOption, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    updated: 'Recently Updated',
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      {/* Campus Notice Board Header */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <ThemedText style={styles.headerTitle}>Campus Bulletin</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Live Lost & Found Directory
          </ThemedText>
        </View>

        <PrimaryButton
          title="Report Item"
          icon="add"
          size="sm"
          onPress={() => router.push('/(tabs)/add')}
        />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={filters.searchQuery}
          onChangeText={(text) => setFilters((prev) => ({ ...prev, searchQuery: text }))}
          onClear={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
          showFilterButton
          hasActiveFilters={hasActiveFilters}
          onFilterPress={() => setSortModalVisible(true)}
        />
      </View>

      {/* Notice Type Filter Tabs */}
      <View style={styles.filterRow}>
        <FilterChip
          label="All"
          selected={filters.type === 'all'}
          onPress={() => setFilters((prev) => ({ ...prev, type: 'all' }))}
        />
        <FilterChip
          label="Lost"
          icon="alert-circle-outline"
          selected={filters.type === 'lost'}
          count={lostCount}
          tint="lost"
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              type: prev.type === 'lost' ? 'all' : 'lost',
            }))
          }
        />
        <FilterChip
          label="Found"
          icon="checkmark-circle-outline"
          selected={filters.type === 'found'}
          count={foundCount}
          tint="found"
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              type: prev.type === 'found' ? 'all' : 'found',
            }))
          }
        />

        {/* Resolution Toggle */}
        <Pressable
          onPress={() =>
            setFilters((prev) => ({
              ...prev,
              status: prev.status === 'active' ? 'all' : 'active',
            }))
          }
          style={[
            styles.resolutionToggle,
            {
              backgroundColor:
                filters.status === 'all' ? theme.primaryLight : theme.card,
              borderColor:
                filters.status === 'all' ? theme.primary : theme.borderStrong,
            },
          ]}>
          <ThemedText
            style={[
              styles.resolutionToggleText,
              {
                color: filters.status === 'all' ? theme.primary : theme.textSecondary,
              },
            ]}>
            {filters.status === 'all' ? 'Inc. Resolved' : 'Active Only'}
          </ThemedText>
        </Pressable>
      </View>

      {/* Category Horizontal Scroller */}
      <View style={styles.categorySection}>
        <CategoryPicker
          horizontal
          includeAll
          selectedCategory={filters.category}
          onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
        />
      </View>

      {/* Active Filter Counter & Reset */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersBar}>
          <ThemedText style={[styles.filterCountText, { color: theme.textSecondary }]}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item found' : 'items found'}
          </ThemedText>
          <Pressable onPress={resetFilters} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={13} color={theme.lost} />
            <ThemedText style={[styles.clearBtnText, { color: theme.lost }]}>
              Reset Filters
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* Feed List */}
      {loading ? (
        <LoadingState message="Fetching campus records..." />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={(i) => router.push(`/item/${i.id}` as any)}
            />
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
            items.length === 0 ? (
              <EmptyState
                icon="newspaper-outline"
                title="Notice Board is Empty"
                description="No items have been registered on campus yet. Be the first to report."
                actionTitle="Report Item"
                actionIcon="add-circle"
                onAction={() => router.push('/(tabs)/add')}
              />
            ) : (
              <EmptyState
                icon="search-outline"
                title="No Matching Records"
                description="No items match your active search terms or selected category filter."
                actionTitle="Reset Filters"
                actionIcon="refresh"
                onAction={resetFilters}
              />
            )
          }
        />
      )}

      {/* Sort Options Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSortModalVisible(false)}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
            ]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Sort & Filter</ThemedText>
              <Pressable onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText style={[styles.sectionTitle, { color: theme.textMuted }]}>
              Sort Feed By
            </ThemedText>
            {(['newest', 'oldest', 'updated'] as ItemSortOption[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setFilters((prev) => ({ ...prev, sortBy: option }));
                  setSortModalVisible(false);
                }}
                style={[
                  styles.sortOption,
                  {
                    backgroundColor:
                      filters.sortBy === option ? theme.primaryLight : 'transparent',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.sortOptionText,
                    {
                      color:
                        filters.sortBy === option ? theme.primary : theme.text,
                      fontWeight: filters.sortBy === option ? '700' : '500',
                    },
                  ]}>
                  {sortLabels[option]}
                </ThemedText>
                {filters.sortBy === option && (
                  <Ionicons name="checkmark" size={16} color={theme.primary} />
                )}
              </Pressable>
            ))}

            <View style={styles.modalFooter}>
              <PrimaryButton
                title="Clear All Filters"
                variant="outline"
                size="sm"
                onPress={() => {
                  resetFilters();
                  setSortModalVisible(false);
                }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  titleArea: {
    flex: 1,
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
  searchSection: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 4,
  },
  resolutionToggle: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  resolutionToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categorySection: {
    paddingVertical: 4,
  },
  activeFiltersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: 4,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.five,
    borderWidth: 1,
    gap: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.one,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.xs,
  },
  sortOptionText: {
    fontSize: 14,
  },
  modalFooter: {
    marginTop: Spacing.three,
  },
});
