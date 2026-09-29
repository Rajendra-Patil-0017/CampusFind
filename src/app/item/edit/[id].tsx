import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CategoryPicker } from '@/components/CategoryPicker';
import { LoadingState } from '@/components/LoadingState';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { ItemFormData, validateItemForm, ValidationErrors } from '@/utils/validation';
import { BorderRadius, MaxContentWidth, ScreenPadding, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function EditPostScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<ItemFormData>({
    type: 'lost',
    name: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactName: '',
    contactInfo: '',
    imageUri: undefined,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadItem() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const item = await StorageService.getItemById(id);
        if (item) {
          setFormData({
            type: item.type,
            name: item.name,
            description: item.description,
            category: item.category,
            location: item.location,
            date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
            contactName: item.contactName,
            contactInfo: item.contactInfo,
            imageUri: item.imageUri,
          });
        }
      } catch (e) {
        console.warn('Failed to load item for edit:', e);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('Permission to access photos is needed.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setFormData((prev) => ({
          ...prev,
          imageUri: result.assets[0].uri,
        }));
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUri: undefined }));
  };

  const handleFieldChange = (field: keyof ItemFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    const validation = validateItemForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await StorageService.updateItem(id, {
        type: formData.type,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        date: new Date(formData.date).toISOString(),
        contactName: formData.contactName.trim(),
        contactInfo: formData.contactInfo.trim(),
        imageUri: formData.imageUri,
      });

      router.back();
    } catch (e) {
      console.warn('Failed to update post:', e);
      alert('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScreenHeader title="Edit Notice" showBack />
        <LoadingState message="Loading notice..." />
      </SafeAreaView>
    );
  }

  const isLost = formData.type === 'lost';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        <ScreenHeader title="Edit Notice" showBack />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
          {/* Section 1: Type Selection */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              1. NOTICE TYPE
            </ThemedText>
            <View style={styles.typeSelectorRow}>
              <Pressable
                onPress={() => setFormData((prev) => ({ ...prev, type: 'lost' }))}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: isLost ? theme.lostBg : theme.card,
                    borderColor: isLost ? theme.lost : theme.border,
                  },
                ]}>
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={isLost ? theme.lost : theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.typeTitle,
                    { color: isLost ? theme.lostText : theme.text },
                  ]}>
                  Lost Item
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setFormData((prev) => ({ ...prev, type: 'found' }))}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: !isLost ? theme.foundBg : theme.card,
                    borderColor: !isLost ? theme.found : theme.border,
                  },
                ]}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={!isLost ? theme.found : theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.typeTitle,
                    { color: !isLost ? theme.foundText : theme.text },
                  ]}>
                  Found Item
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Section 2: Item Information */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              2. ITEM INFORMATION
            </ThemedText>

            {/* Name */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Item Name <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.name}
                onChangeText={(text) => handleFieldChange('name', text)}
                placeholder="Item name"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.name ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
                maxLength={80}
              />
              {errors.name && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.name}
                </ThemedText>
              )}
            </View>

            {/* Category */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Category <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <CategoryPicker
                selectedCategory={formData.category}
                onSelectCategory={(cat) => handleFieldChange('category', cat)}
              />
              {errors.category && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.category}
                </ThemedText>
              )}
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Description <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.description}
                onChangeText={(text) => handleFieldChange('description', text)}
                placeholder="Detailed description..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.description ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
                maxLength={1000}
              />
              {errors.description && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.description}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Section 3: Location and Date */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              3. LOCATION & DATE
            </ThemedText>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Campus Location <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.location}
                onChangeText={(text) => handleFieldChange('location', text)}
                placeholder="Location"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.location ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
                maxLength={100}
              />
              {errors.location && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.location}
                </ThemedText>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Date (YYYY-MM-DD) <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.date}
                onChangeText={(text) => handleFieldChange('date', text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.date ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
                maxLength={10}
              />
              {errors.date && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.date}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Section 4: Photo */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              4. PHOTO
            </ThemedText>

            {formData.imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: formData.imageUri }}
                  style={[styles.previewImage, { borderColor: theme.border }]}
                />
                <View style={styles.imageActionRow}>
                  <Pressable
                    onPress={handlePickImage}
                    style={[
                      styles.imageActionBtn,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <Ionicons name="camera-outline" size={16} color={theme.text} />
                    <ThemedText style={styles.imageActionText}>Change Photo</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleRemoveImage}
                    style={[
                      styles.imageActionBtn,
                      { backgroundColor: theme.dangerBg, borderColor: theme.danger },
                    ]}>
                    <Ionicons name="trash-outline" size={16} color={theme.danger} />
                    <ThemedText style={[styles.imageActionText, { color: theme.danger }]}>
                      Remove
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handlePickImage}
                style={[
                  styles.photoUploadBox,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderStrong,
                  },
                ]}>
                <Ionicons name="camera-outline" size={24} color={theme.textSecondary} />
                <ThemedText style={styles.photoUploadTitle}>Add Photo</ThemedText>
              </Pressable>
            )}
          </View>

          {/* Section 5: Contact Info */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              5. CONTACT INFO
            </ThemedText>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Your Name <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.contactName}
                onChangeText={(text) => handleFieldChange('contactName', text)}
                placeholder="Poster name"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.contactName ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
                maxLength={60}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Email or Phone <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.contactInfo}
                onChangeText={(text) => handleFieldChange('contactInfo', text)}
                placeholder="Contact details"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.contactInfo ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
                maxLength={80}
              />
            </View>
          </View>

            {/* Save Button */}
            <View style={styles.submitSection}>
              <PrimaryButton
                title={isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                size="lg"
                loading={isSubmitting}
                onPress={handleSubmit}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 60,
  },
  section: {
    marginTop: Spacing.three,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: Spacing.two,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: 8,
    justifyContent: 'center',
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: Spacing.three,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.three,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  photoUploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  photoUploadTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
    width: '100%',
  },
  imageActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  imageActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitSection: {
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
});
