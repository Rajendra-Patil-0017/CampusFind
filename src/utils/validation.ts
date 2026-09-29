import { CATEGORIES } from '@/constants/categories';
import { ItemType } from '@/types/item';

export interface ItemFormData {
  type: ItemType;
  name: string;
  description: string;
  category: string;
  location: string;
  date: string;
  contactName: string;
  contactInfo: string;
  imageUri?: string;
}

export type ValidationErrors = Partial<Record<keyof ItemFormData, string>>;

export function validateItemForm(data: ItemFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // Name validation
  if (!data.name || !data.name.trim()) {
    errors.name = 'Item name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Item name must be at least 2 characters';
  } else if (data.name.trim().length > 80) {
    errors.name = 'Item name must be less than 80 characters';
  }

  // Description validation
  if (!data.description || !data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 5) {
    errors.description = 'Please provide more details (min 5 characters)';
  } else if (data.description.trim().length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  // Category validation
  if (!data.category || !data.category.trim()) {
    errors.category = 'Please select a category';
  } else if (!CATEGORIES.includes(data.category as any)) {
    errors.category = 'Invalid category selected';
  }

  // Location validation
  if (!data.location || !data.location.trim()) {
    errors.location = 'Campus location is required';
  } else if (data.location.trim().length < 2) {
    errors.location = 'Location must be at least 2 characters';
  }

  // Date validation
  if (!data.date || !data.date.trim()) {
    errors.date = 'Date is required';
  } else {
    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      errors.date = 'Please enter a valid date (YYYY-MM-DD)';
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (parsedDate > tomorrow) {
        errors.date = 'Date cannot be in the future';
      }
    }
  }

  // Contact Name validation
  if (!data.contactName || !data.contactName.trim()) {
    errors.contactName = 'Contact name is required';
  } else if (data.contactName.trim().length < 2) {
    errors.contactName = 'Name must be at least 2 characters';
  }

  // Contact Info validation
  if (!data.contactInfo || !data.contactInfo.trim()) {
    errors.contactInfo = 'Contact info (phone/email/handle) is required';
  } else if (data.contactInfo.trim().length < 3) {
    errors.contactInfo = 'Please provide valid contact information';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
