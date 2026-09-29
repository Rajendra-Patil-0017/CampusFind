import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { ItemFormData, validateItemForm, ValidationErrors } from '@/utils/validation';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AddPostScreen() {
  const theme = useTheme();

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
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('Permission to access photos is needed to attach an image.');
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
    const validation = validateItemForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await StorageService.createItem({
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

      setSubmitSuccess(true);

      setFormData({
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

      setTimeout(() => {
        setSubmitSuccess(false);
        router.replace(`/item/${created.id}` as any);
      }, 550);
    } catch (e) {
      console.warn('Failed to save post:', e);
      alert('Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLost = formData.type === 'lost';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        {/* Screen Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Register Notice</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Submit an official lost or found report to the campus registry
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Intake Type Selector */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Report Category *</ThemedText>
            <View style={styles.typeSelector}>
              <Pressable
                onPress={() => handleFieldChange('type', 'lost')}
                accessibilityRole="button"
                accessibilityState={{ selected: isLost }}
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
                accessibilityRole="button"
                accessibilityState={{ selected: !isLost }}
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
              placeholder="e.g. Matte Black Leather Wallet, Student ID Card"
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

          {/* Category Picker Grid */}
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

          {/* Campus Location */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Campus Coordinates / Location *</ThemedText>
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
                placeholder="e.g. Library 2nd Floor study cubicles, Cafeteria Booth #4"
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

          {/* Incident Date */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>Date *</ThemedText>
              <Pressable
                onPress={() =>
                  handleFieldChange('date', new Date().toISOString().split('T')[0])
                }>
                <ThemedText style={[styles.todayLink, { color: theme.primary }]}>
                  Set Today
                </ThemedText>
              </Pressable>
            </View>
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
            <ThemedText style={styles.label}>Physical Description & Distinct Features *</ThemedText>
            <TextInput
              value={formData.description}
              onChangeText={(t) => handleFieldChange('description', t)}
              placeholder="Provide color, brand, stickers, scratches, case type, or specific contents..."
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

          {/* Photo Attachment */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Attached Photo (Optional)</ThemedText>
            {formData.imageUri ? (
              <View style={[styles.imagePreviewContainer, { borderColor: theme.borderStrong }]}>
                <Image
                  source={{ uri: formData.imageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={handleRemoveImage}
                  style={styles.removeImageBtn}
                  accessibilityLabel="Remove photo">
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
                  Attach an item photo
                </ThemedText>
                <ThemedText style={[styles.uploadSubtext, { color: theme.textMuted }]}>
                  Improves recognition speed across the campus community
                </ThemedText>
              </Pressable>
            )}
          </View>

          {/* Contact Details */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.borderStrong }]}>
            <ThemedText style={styles.sectionHeading}>Reporter Contact Info</ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Used by fellow campus members to coordinate return
            </ThemedText>

            <View style={styles.fieldSpacer}>
              <ThemedText style={styles.label}>Your Name *</ThemedText>
              <TextInput
                value={formData.contactName}
                onChangeText={(t) => handleFieldChange('contactName', t)}
                placeholder="e.g. Jordan Miller"
                placeholderTextColor={theme.textMuted}
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
              <ThemedText style={styles.label}>Contact Detail (Email / Phone / Handle) *</ThemedText>
              <TextInput
                value={formData.contactInfo}
                onChangeText={(t) => handleFieldChange('contactInfo', t)}
                placeholder="e.g. jmiller@campus.edu or (555) 234-5678"
                placeholderTextColor={theme.textMuted}
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

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <PrimaryButton
              title={
                submitSuccess
                  ? 'Notice Published!'
                  : isLost
                  ? 'Publish Lost Item Notice'
                  : 'Publish Found Item Notice'
              }
              icon={submitSuccess ? 'checkmark-circle' : 'send'}
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
    marginTop: 2,
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  todayLink: {
    fontSize: 11,
    fontWeight: '700',
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
    height: 100,
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
  uploadSubtext: {
    fontSize: 11,
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
