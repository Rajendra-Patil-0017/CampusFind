export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'resolved';

export interface LostFoundItem {
  id: string;
  type: ItemType;
  status: ItemStatus;
  name: string;
  description: string;
  category: string;
  location: string;
  date: string; // ISO string or YYYY-MM-DD
  contactName: string;
  contactInfo: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  isSample?: boolean;
}

export type ItemSortOption = 'newest' | 'oldest' | 'updated';

export interface FilterState {
  type: 'all' | ItemType;
  category: string; // 'all' or specific category
  status: 'all' | ItemStatus;
  searchQuery: string;
  sortBy: ItemSortOption;
}
