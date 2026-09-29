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

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter your valid university email address.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          'Password reset link has been dispatched to your email address. Follow the instructions to choose a new password.'
        );
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to dispatch reset email. Please try again.');
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
                <Ionicons name="key-outline" size={30} color={theme.primary} />
              </View>
              <ThemedText style={[styles.appName, { color: theme.text }]}>
                Password Recovery
              </ThemedText>
              <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
                {APP_CONFIG.name} Security Dispatch
              </ThemedText>
            </View>

            {/* Recovery Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.card,
              ]}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Reset Academic Password</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  Enter the email associated with your account to receive a secure recovery link.
                </ThemedText>
              </View>

              {successMsg && (
                <View style={[styles.successBox, { backgroundColor: theme.foundBg, borderColor: theme.found }]}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.found} />
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

              {!successMsg ? (
                <>
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

                  <PrimaryButton
                    title={isSubmitting ? 'Sending Link...' : 'Send Recovery Link'}
                    icon="send-outline"
                    size="lg"
                    loading={isSubmitting}
                    onPress={handleReset}
                    style={styles.submitBtn}
                  />
                </>
              ) : (
                <PrimaryButton
                  title="Return to Sign In"
                  icon="arrow-back"
                  variant="secondary"
                  size="lg"
                  onPress={() => router.replace('/(auth)/login' as any)}
                  style={styles.submitBtn}
                />
              )}
            </View>

            {/* Back to Login Footer */}
            <View style={styles.footerRow}>
              <Pressable
                onPress={() => router.replace('/(auth)/login' as any)}
                style={styles.backLinkRow}>
                <Ionicons name="arrow-back" size={14} color={theme.primary} />
                <ThemedText style={[styles.backLinkText, { color: theme.primary }]}>
                  Back to Sign In
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
    lineHeight: 20,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: 8,
  },
  successText: {
    fontSize: Typography.xs,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
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
    marginBottom: Spacing.four,
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
  submitBtn: {
    marginTop: Spacing.two,
  },
  footerRow: {
    marginTop: Spacing.five,
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLinkText: {
    fontSize: Typography.sm,
    fontWeight: '700',
  },
});
