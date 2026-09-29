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
import { BorderRadius, MaxContentWidth, ScreenPadding, Shadows, Spacing } from '@/constants/theme';
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
  const resolvedCount = items.filter((i) => i.status === 'resolved').length;

  const sortLabels: Record<ItemSortOption, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    updated: 'Recently Updated',
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Header with Title & Aligned Report Button */}
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <ThemedText style={styles.headerTitle}>CampusFind</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Find It. Report It. Return It.
            </ThemedText>
          </View>

          <PrimaryButton
            title="Report"
            icon="add"
            size="sm"
            onPress={() => router.push('/(tabs)/add')}
            style={styles.headerReportBtn}
          />
        </View>

        {/* Search Bar */}
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

        {/* Compact Filter Group */}
        <View style={styles.filterRow}>
          <FilterChip
            label="All"
            selected={filters.type === 'all' && filters.status === 'active'}
            onPress={() => setFilters((prev) => ({ ...prev, type: 'all', status: 'active' }))}
          />
          <FilterChip
            label="Lost"
            icon="alert-circle-outline"
            selected={filters.type === 'lost' && filters.status === 'active'}
            count={lostCount}
            tint="lost"
            onPress={() =>
              setFilters((prev) => ({
                ...prev,
                type: prev.type === 'lost' && prev.status === 'active' ? 'all' : 'lost',
                status: 'active',
              }))
            }
          />
          <FilterChip
            label="Found"
            icon="checkmark-circle-outline"
            selected={filters.type === 'found' && filters.status === 'active'}
            count={foundCount}
            tint="found"
            onPress={() =>
              setFilters((prev) => ({
                ...prev,
                type: prev.type === 'found' && prev.status === 'active' ? 'all' : 'found',
                status: 'active',
              }))
            }
          />
          <FilterChip
            label="Resolved"
            icon="archive-outline"
            selected={filters.status === 'resolved'}
            count={resolvedCount}
            onPress={() =>
              setFilters((prev) => ({
                ...prev,
                status: prev.status === 'resolved' ? 'active' : 'resolved',
              }))
            }
          />
        </View>

        {/* Category Horizontal Chips */}
        <View style={styles.categorySection}>
          <CategoryPicker
            horizontal
            includeAll
            selectedCategory={filters.category}
            onSelectCategory={(category) => setFilters((prev) => ({ ...prev, category }))}
          />
        </View>

        {/* Meta Bar with Count & Sort Trigger */}
        <View style={styles.metaRow}>
          <ThemedText style={[styles.resultsCount, { color: theme.textSecondary }]}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            {filters.category !== 'all' ? ` in ${filters.category}` : ''}
            {filters.status === 'resolved' ? ' (Resolved)' : ''}
          </ThemedText>

          <Pressable
            onPress={() => setSortModalVisible(true)}
            hitSlop={8}
            style={styles.sortButton}>
            <ThemedText style={[styles.sortText, { color: theme.primary }]}>
              {sortLabels[filters.sortBy]}
            </ThemedText>
            <Ionicons name="chevron-down" size={13} color={theme.primary} />
          </Pressable>
        </View>

        {/* Listings Feed */}
        {loading ? (
          <LoadingState message="Loading campus bulletin..." />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={(selected) => router.push(`/item/${selected.id}` as any)}
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
              <EmptyState
                icon="search-outline"
                title="No Notices Found"
                description={
                  hasActiveFilters
                    ? 'No notices match your current filters or search keywords.'
                    : 'There are no active lost or found posts on campus right now.'
                }
                actionTitle={hasActiveFilters ? 'Clear Filters' : 'Report an Item'}
                actionIcon={hasActiveFilters ? 'refresh-outline' : 'add'}
                onAction={hasActiveFilters ? resetFilters : () => router.push('/(tabs)/add')}
              />
            }
          />
        )}
      </View>

      {/* Sort & Filter Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSortModalVisible(false)} />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.card,
            ]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Sort & Filter</ThemedText>
              <Pressable
                onPress={() => setSortModalVisible(false)}
                hitSlop={8}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ThemedText style={[styles.modalSectionLabel, { color: theme.textSecondary }]}>
              SORT ORDER
            </ThemedText>
            {(['newest', 'oldest', 'updated'] as ItemSortOption[]).map((option) => {
              const isSelected = filters.sortBy === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setFilters((prev) => ({ ...prev, sortBy: option }));
                    setSortModalVisible(false);
                  }}
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : 'transparent',
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.sortOptionLabel,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {sortLabels[option]}
                  </ThemedText>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={theme.primary} />
                  )}
                </Pressable>
              );
            })}

            <ThemedText
              style={[
                styles.modalSectionLabel,
                { color: theme.textSecondary, marginTop: Spacing.four },
              ]}>
              STATUS FILTER
            </ThemedText>
            <View style={styles.statusOptionRow}>
              <Pressable
                onPress={() => {
                  setFilters((prev) => ({ ...prev, status: 'active' }));
                  setSortModalVisible(false);
                }}
                style={[
                  styles.statusOptionBtn,
                  {
                    backgroundColor:
                      filters.status === 'active' ? theme.primary : theme.elevatedSurface,
                    borderColor:
                      filters.status === 'active' ? theme.primary : theme.border,
                  },
                ]}>
                <ThemedText
                  style={{
                    color: filters.status === 'active' ? '#FFFFFF' : theme.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                  Active Notices
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setFilters((prev) => ({ ...prev, status: 'resolved' }));
                  setSortModalVisible(false);
                }}
                style={[
                  styles.statusOptionBtn,
                  {
                    backgroundColor:
                      filters.status === 'resolved' ? theme.resolved : theme.elevatedSurface,
                    borderColor:
                      filters.status === 'resolved' ? theme.resolved : theme.border,
                  },
                ]}>
                <ThemedText
                  style={{
                    color: filters.status === 'resolved' ? '#FFFFFF' : theme.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                  Resolved Archive
                </ThemedText>
              </Pressable>
            </View>

            {hasActiveFilters && (
              <PrimaryButton
                title="Reset All Filters"
                variant="secondary"
                size="sm"
                onPress={() => {
                  resetFilters();
                  setSortModalVisible(false);
                }}
                style={{ marginTop: Spacing.four }}
              />
            )}
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  titleArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12.5,
    marginTop: 1,
  },
  headerReportBtn: {
    height: 38,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  searchSection: {
    paddingHorizontal: ScreenPadding,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: ScreenPadding,
    marginBottom: Spacing.two,
    flexWrap: 'wrap',
    gap: 6,
  },
  categorySection: {
    marginBottom: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding,
    marginBottom: Spacing.two,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 28, 34, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
  },
  sortOptionLabel: {
    fontSize: 14,
  },
  statusOptionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
