import { FilterState, LostFoundItem } from '@/types/item';

export function applyFiltersAndSort(
  items: LostFoundItem[],
  filters: FilterState
): LostFoundItem[] {
  let result = [...items];

  // Filter by Type (Lost / Found / All)
  if (filters.type !== 'all') {
    result = result.filter((item) => item.type === filters.type);
  }

  // Filter by Category
  if (filters.category && filters.category !== 'all') {
    result = result.filter(
      (item) => item.category.toLowerCase() === filters.category.toLowerCase()
    );
  }

  // Filter by Status (Active / Resolved / All)
  if (filters.status !== 'all') {
    result = result.filter((item) => item.status === filters.status);
  }

  // Search Query across name, description, location, category, contactName
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.trim().toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.contactName.toLowerCase().includes(query)
    );
  }

  // Sort By
  result.sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (filters.sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return 0;
  });

  return result;
}
