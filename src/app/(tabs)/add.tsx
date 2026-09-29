import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CategoryPicker } from '@/components/CategoryPicker';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { APP_CONFIG } from '@/constants/config';
import { ItemFormData, validateItemForm, ValidationErrors } from '@/utils/validation';
import { BorderRadius, Fonts, MaxContentWidth, ScreenPadding, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const CAMPUS_LOCATION_SUGGESTIONS = [
  'Central Library',
  'Dining Hall / Cafeteria',
  'Student Center',
  'Engineering Hall',
  'Gym & Sports Complex',
  'Science Building',
];

export default function AddPostScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 880;
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState<ItemFormData>(() => ({
    type: 'lost',
    name: '',
    description: '',
    category: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactName: profile?.fullName || user?.email?.split('@')[0] || '',
    contactInfo: user?.email || '',
    imageUri: undefined,
  }));

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    const validation = validateItemForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await StorageService.createItem(
        {
          type: formData.type,
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          location: formData.location.trim(),
          date: new Date(formData.date).toISOString(),
          contactName: formData.contactName.trim(),
          contactInfo: formData.contactInfo.trim(),
          imageUri: formData.imageUri,
          status: 'active',
          ownerId: user?.id || APP_CONFIG.localUserId,
        },
        user?.id || APP_CONFIG.localUserId
      );

      // Reset form
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

      router.replace(`/item/${created.id}` as any);
    } catch (e) {
      console.warn('Failed to save post:', e);
      alert('Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLost = formData.type === 'lost';

  const renderFormContent = () => (
    <View style={styles.responsiveContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Report Item</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Submit an official campus lost or found notice
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Step 1: Type Selection (Lost vs Found) */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              1. NOTICE TYPE
            </ThemedText>
            <View style={styles.typeSelectorRow}>
              <Pressable
                onPress={() => setFormData((prev) => ({ ...prev, type: 'lost' }))}
                accessibilityRole="radio"
                accessibilityState={{ checked: isLost }}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: isLost ? theme.lostBg : theme.card,
                    borderColor: isLost ? theme.lost : theme.border,
                  },
                ]}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={isLost ? theme.lost : theme.textSecondary}
                />
                <View style={styles.typeTextCol}>
                  <ThemedText
                    style={[
                      styles.typeTitle,
                      { color: isLost ? theme.lostText : theme.text },
                    ]}>
                    I Lost Something
                  </ThemedText>
                  <ThemedText style={[styles.typeDesc, { color: theme.textSecondary }]}>
                    Ask the campus community for help
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setFormData((prev) => ({ ...prev, type: 'found' }))}
                accessibilityRole="radio"
                accessibilityState={{ checked: !isLost }}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: !isLost ? theme.foundBg : theme.card,
                    borderColor: !isLost ? theme.found : theme.border,
                  },
                ]}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={!isLost ? theme.found : theme.textSecondary}
                />
                <View style={styles.typeTextCol}>
                  <ThemedText
                    style={[
                      styles.typeTitle,
                      { color: !isLost ? theme.foundText : theme.text },
                    ]}>
                    I Found Something
                  </ThemedText>
                  <ThemedText style={[styles.typeDesc, { color: theme.textSecondary }]}>
                    Help return an item to its owner
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Step 2: Item Name & Category */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              2. ITEM INFORMATION
            </ThemedText>

            {/* Item Name */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Item Name <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.name}
                onChangeText={(text) => handleFieldChange('name', text)}
                placeholder="e.g., Matte Black Leather Wallet, Silver MacBook Charger"
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

            {/* Category Selector */}
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

            {/* Detailed Description */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Description <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.description}
                onChangeText={(text) => handleFieldChange('description', text)}
                placeholder="Describe brand, color, stickers, unique scratches, contents, or handover details..."
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

          {/* Step 3: Location and Date */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              3. LOCATION & DATE
            </ThemedText>

            {/* Location */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Campus Location <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.location}
                onChangeText={(text) => handleFieldChange('location', text)}
                placeholder="e.g., Central Library 2nd floor, Cafeteria Booth #4"
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

              {/* Quick Location Chips */}
              <View style={styles.suggestionChips}>
                {CAMPUS_LOCATION_SUGGESTIONS.map((loc) => (
                  <Pressable
                    key={loc}
                    onPress={() => handleFieldChange('location', loc)}
                    style={[
                      styles.suggestionPill,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    <ThemedText style={[styles.suggestionText, { color: theme.textSecondary }]}>
                      + {loc}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Date */}
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

          {/* Step 4: Optional Photo Upload */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              4. PHOTO (OPTIONAL)
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
                <Ionicons name="camera-outline" size={28} color={theme.textSecondary} />
                <ThemedText style={styles.photoUploadTitle}>Attach Photo</ThemedText>
                <ThemedText style={[styles.photoUploadSubtitle, { color: theme.textSecondary }]}>
                  Photos help students verify items faster
                </ThemedText>
              </Pressable>
            )}
          </View>

          {/* Step 5: Contact Information */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              5. CONTACT INFORMATION
            </ThemedText>

            {/* Poster Name */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Your Name <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.contactName}
                onChangeText={(text) => handleFieldChange('contactName', text)}
                placeholder="e.g., Alex Johnson or Student Services Desk"
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
              {errors.contactName && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.contactName}
                </ThemedText>
              )}
            </View>

            {/* Contact Details */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>
                Email or Phone <ThemedText style={{ color: theme.danger }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={formData.contactInfo}
                onChangeText={(text) => handleFieldChange('contactInfo', text)}
                placeholder="e.g., alex.j@campus.edu or +1 (555) 234-5678"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
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
              {errors.contactInfo && (
                <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                  {errors.contactInfo}
                </ThemedText>
              )}
            </View>

            {/* Privacy note */}
            <View
              style={[
                styles.privacyNote,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <Ionicons name="shield-checkmark-outline" size={16} color={theme.teal} />
              <ThemedText style={[styles.privacyText, { color: theme.textSecondary }]}>
                Your contact details are only visible on this notice to facilitate campus handoffs.
              </ThemedText>
            </View>
          </View>

          {/* Step 6: Submit Button */}
          <View style={styles.submitSection}>
            <PrimaryButton
              title={isSubmitting ? 'Submitting...' : isLost ? 'Submit Lost Item Notice' : 'Submit Found Item Notice'}
              size="lg"
              loading={isSubmitting}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      {isDesktop ? (
        <View style={styles.desktopLayoutRow}>
          <DesktopSidebar activeRoute="add" />
          <View style={styles.desktopMainCol}>
            <DesktopHeader />
            <View style={styles.desktopContentArea}>{renderFormContent()}</View>
          </View>
        </View>
      ) : (
        renderFormContent()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  desktopLayoutRow: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  desktopMainCol: {
    flex: 1,
    height: '100%',
  },
  desktopContentArea: {
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
  header: {
    paddingHorizontal: ScreenPadding,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 120,
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: Spacing.two,
  },
  typeSelectorRow: {
    flexDirection: 'column',
    gap: Spacing.two,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.three,
  },
  typeTextCol: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  typeDesc: {
    fontSize: 12,
    marginTop: 1,
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
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  suggestionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  photoUploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  photoUploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  photoUploadSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  submitSection: {
    marginTop: Spacing.five,
    marginBottom: Spacing.four,
  },
});
