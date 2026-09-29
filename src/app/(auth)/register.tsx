import React, { useState } from 'react';
import {
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
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { APP_CONFIG } from '@/constants/config';
import { BorderRadius, Fonts, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal or preferred campus name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid university email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          'Account created successfully! Check your email if verification is required, or sign in.'
        );
        setTimeout(() => {
          router.replace('/(tabs)' as any);
        }, 1200);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.authContainer}>
            {/* Academic Brand Header */}
            <View style={styles.brandHeader}>
              <View style={[styles.crestBox, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                <Ionicons name="school" size={32} color={theme.primary} />
              </View>
              <ThemedText style={[styles.appName, { color: theme.text }]}>
                {APP_CONFIG.name}
              </ThemedText>
              <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
                Official Campus Dispatch & Registry
              </ThemedText>
            </View>

            {/* Registration Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.card,
              ]}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Create Academic Account</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  Join the verified campus lost and found network
                </ThemedText>
              </View>

              {successMsg && (
                <View style={[styles.successBox, { backgroundColor: theme.foundBg, borderColor: theme.found }]}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.found} />
                  <ThemedText style={[styles.successText, { color: theme.foundText }]}>
                    {successMsg}
                  </ThemedText>
                </View>
              )}

              {errorMsg && (
                <View style={[styles.errorBox, { backgroundColor: theme.dangerBg, borderColor: theme.danger }]}>
                  <Ionicons name="alert-circle" size={16} color={theme.danger} />
                  <ThemedText style={[styles.errorText, { color: theme.danger }]}>
                    {errorMsg}
                  </ThemedText>
                </View>
              )}

              {/* Full Name Field */}
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>Full Name</ThemedText>
                <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.borderStrong }]}>
                  <Ionicons name="person-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    value={fullName}
                    onChangeText={(t) => {
                      setFullName(t);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="e.g. Professor Sarah Connor"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="words"
                    style={[styles.input, { color: theme.text }]}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>University Email</ThemedText>
                <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.borderStrong }]}>
                  <Ionicons name="mail-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="student@university.edu"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    style={[styles.input, { color: theme.text }]}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>Password (min 6 characters)</ThemedText>
                <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.borderStrong }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Create a strong password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={[styles.input, { color: theme.text }]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={8}
                    style={styles.eyeBtn}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>Confirm Password</ThemedText>
                <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.borderStrong }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Re-enter password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={[styles.input, { color: theme.text }]}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <PrimaryButton
                title={isSubmitting ? 'Creating Account...' : 'Register Account'}
                icon="person-add-outline"
                size="lg"
                loading={isSubmitting}
                onPress={handleRegister}
                style={styles.submitBtn}
              />
            </View>

            {/* Login Footer Link */}
            <View style={styles.footerRow}>
              <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
                Already have an academic account?
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/login' as any)}>
                <ThemedText style={[styles.loginLink, { color: theme.primary }]}>
                  Sign In
                </ThemedText>
              </Pressable>
            </View>
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
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  authContainer: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  crestBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  appName: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: Typography.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.five,
  },
  cardHeader: {
    marginBottom: Spacing.four,
  },
  cardTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: Typography.sm,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: 8,
  },
  successText: {
    fontSize: Typography.xs,
    flex: 1,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: 8,
  },
  errorText: {
    fontSize: Typography.xs,
    flex: 1,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: Spacing.three,
  },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  inputIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    marginTop: Spacing.three,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
    gap: 6,
  },
  footerText: {
    fontSize: Typography.sm,
  },
  loginLink: {
    fontSize: Typography.sm,
    fontWeight: '700',
  },
});
