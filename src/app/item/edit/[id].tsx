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
import { BorderRadius, Spacing } from '@/constants/theme';
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
        quality: 0.6,
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
      alert('Failed to update post.');
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
      <ScreenHeader title="Edit Campus Notice" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Post Type Selector */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Notice Category *</ThemedText>
            <View style={styles.typeSelector}>
              <Pressable
                onPress={() => handleFieldChange('type', 'lost')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: isLost ? theme.lostBg : theme.card,
                    borderColor: isLost ? theme.lost : theme.borderStrong,
                  },
                ]}>
                <View
                  style={[
                    styles.typeDot,
                    { backgroundColor: isLost ? theme.lost : theme.textMuted },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.typeText,
                    {
                      color: isLost ? theme.lostText : theme.text,
                      fontWeight: isLost ? '800' : '600',
                    },
                  ]}>
                  LOST ITEM
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => handleFieldChange('type', 'found')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: !isLost ? theme.foundBg : theme.card,
                    borderColor: !isLost ? theme.found : theme.borderStrong,
                  },
                ]}>
                <View
                  style={[
                    styles.typeDot,
                    { backgroundColor: !isLost ? theme.found : theme.textMuted },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.typeText,
                    {
                      color: !isLost ? theme.foundText : theme.text,
                      fontWeight: !isLost ? '800' : '600',
                    },
                  ]}>
                  FOUND ITEM
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Item Name */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Item Title *</ThemedText>
            <TextInput
              value={formData.name}
              onChangeText={(t) => handleFieldChange('name', t)}
              placeholder="Item title"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: errors.name ? theme.danger : theme.borderStrong,
                  color: theme.text,
                },
              ]}
            />
            {errors.name && (
              <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                {errors.name}
              </ThemedText>
            )}
          </View>

          {/* Category Picker */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Classification *</ThemedText>
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

          {/* Location */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Campus Location *</ThemedText>
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="location-sharp"
                size={16}
                color={theme.accent}
                style={styles.fieldIcon}
              />
              <TextInput
                value={formData.location}
                onChangeText={(t) => handleFieldChange('location', t)}
                placeholder="Location"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  styles.flexInput,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.location ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
              />
            </View>
            {errors.location && (
              <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                {errors.location}
              </ThemedText>
            )}
          </View>

          {/* Date */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Date *</ThemedText>
            <View style={styles.inputWithIcon}>
              <Ionicons
                name="calendar-sharp"
                size={16}
                color={theme.textMuted}
                style={styles.fieldIcon}
              />
              <TextInput
                value={formData.date}
                onChangeText={(t) => handleFieldChange('date', t)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  styles.flexInput,
                  {
                    backgroundColor: theme.card,
                    borderColor: errors.date ? theme.danger : theme.borderStrong,
                    color: theme.text,
                  },
                ]}
              />
            </View>
            {errors.date && (
              <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                {errors.date}
              </ThemedText>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Description *</ThemedText>
            <TextInput
              value={formData.description}
              onChangeText={(t) => handleFieldChange('description', t)}
              placeholder="Description"
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
            />
            {errors.description && (
              <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                {errors.description}
              </ThemedText>
            )}
          </View>

          {/* Image */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Attached Photo</ThemedText>
            {formData.imageUri ? (
              <View style={[styles.imagePreviewContainer, { borderColor: theme.borderStrong }]}>
                <Image
                  source={{ uri: formData.imageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={handleRemoveImage}
                  style={styles.removeImageBtn}>
                  <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                  <ThemedText style={styles.removeImageText}>Remove</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickImage}
                style={[
                  styles.uploadBox,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderStrong,
                  },
                ]}>
                <Ionicons name="camera-outline" size={24} color={theme.primary} />
                <ThemedText style={[styles.uploadText, { color: theme.text }]}>
                  Add photo
                </ThemedText>
              </Pressable>
            )}
          </View>

          {/* Contact Details */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.borderStrong }]}>
            <ThemedText style={styles.sectionHeading}>Reporter Details</ThemedText>

            <View style={styles.fieldSpacer}>
              <ThemedText style={styles.label}>Your Name *</ThemedText>
              <TextInput
                value={formData.contactName}
                onChangeText={(t) => handleFieldChange('contactName', t)}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: errors.contactName ? theme.danger : theme.border,
                    color: theme.text,
                  },
                ]}
              />
              {errors.contactName && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.contactName}
                </ThemedText>
              )}
            </View>

            <View style={styles.fieldSpacer}>
              <ThemedText style={styles.label}>Contact Info *</ThemedText>
              <TextInput
                value={formData.contactInfo}
                onChangeText={(t) => handleFieldChange('contactInfo', t)}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    borderColor: errors.contactInfo ? theme.danger : theme.border,
                    color: theme.text,
                  },
                ]}
              />
              {errors.contactInfo && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.contactInfo}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.submitSection}>
            <PrimaryButton
              title="Save Changes"
              icon="save"
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.seven,
  },
  section: {
    marginBottom: Spacing.three,
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    gap: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  input: {
    height: 44,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    position: 'absolute',
    left: Spacing.three,
    zIndex: 1,
  },
  flexInput: {
    flex: 1,
    paddingLeft: Spacing.six,
  },
  textArea: {
    minHeight: 90,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    padding: Spacing.three,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  uploadBox: {
    height: 80,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '700',
  },
  imagePreviewContainer: {
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  imagePreview: {
    width: '100%',
    height: 160,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(200, 75, 49, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fieldSpacer: {
    marginTop: Spacing.two,
  },
  submitSection: {
    marginTop: Spacing.two,
  },
});
