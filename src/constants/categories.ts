export const CATEGORIES = [
  'Electronics',
  'ID Card',
  'Wallet',
  'Keys',
  'Books',
  'Bags',
  'Clothing',
  'Documents',
  'Accessories',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface CategoryInfo {
  name: Category;
  iconName: string;
  badgeBg: string;
  badgeColor: string;
}

export const CATEGORY_DETAILS: Record<Category, { icon: string }> = {
  Electronics: { icon: 'laptop-outline' },
  'ID Card': { icon: 'card-outline' },
  Wallet: { icon: 'wallet-outline' },
  Keys: { icon: 'key-outline' },
  Books: { icon: 'book-outline' },
  Bags: { icon: 'bag-handle-outline' },
  Clothing: { icon: 'shirt-outline' },
  Documents: { icon: 'document-text-outline' },
  Accessories: { icon: 'watch-outline' },
  Other: { icon: 'cube-outline' },
};
