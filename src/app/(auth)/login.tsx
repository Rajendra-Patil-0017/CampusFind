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

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your university email and password.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.replace('/(tabs)' as any);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Login failed. Please check your credentials.');
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
                {APP_CONFIG.tagline}
              </ThemedText>
            </View>

            {/* Main Auth Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.card,
              ]}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Campus Member Sign In</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  Access your official lost and found reports
                </ThemedText>
              </View>

              {!isConfigured && (
                <View style={[styles.noticeBox, { backgroundColor: theme.lostBg, borderColor: theme.lostBorder }]}>
                  <Ionicons name="information-circle" size={16} color={theme.lost} />
                  <ThemedText style={[styles.noticeText, { color: theme.lostText }]}>
                    Supabase credentials not yet set in environment. Demo offline mode active.
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
                <View style={styles.passwordLabelRow}>
                  <ThemedText style={styles.fieldLabel}>Password</ThemedText>
                  <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)}>
                    <ThemedText style={[styles.forgotLink, { color: theme.primary }]}>
                      Forgot Password?
                    </ThemedText>
                  </Pressable>
                </View>
                <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.borderStrong }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter password"
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

              {/* Sign In Button */}
              <PrimaryButton
                title={isSubmitting ? 'Signing In...' : 'Sign In'}
                icon="log-in-outline"
                size="lg"
                loading={isSubmitting}
                onPress={handleLogin}
                style={styles.submitBtn}
              />

              {/* Browse as Guest / Offline Button */}
              <Pressable
                onPress={() => router.replace('/(tabs)' as any)}
                style={({ pressed }) => [
                  styles.guestBtn,
                  {
                    backgroundColor: pressed ? theme.elevatedSurface : 'transparent',
                    borderColor: theme.border,
                  },
                ]}>
                <Ionicons name="newspaper-outline" size={16} color={theme.textSecondary} />
                <ThemedText style={[styles.guestText, { color: theme.textSecondary }]}>
                  Browse Bulletin as Guest
                </ThemedText>
              </Pressable>
            </View>

            {/* Registration Footer Link */}
            <View style={styles.footerRow}>
              <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
                {"Don't have an academic account?"}
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/register' as any)}>
                <ThemedText style={[styles.registerLink, { color: theme.primary }]}>
                  Create Account
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
    marginBottom: Spacing.five,
  },
  crestBox: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  appName: {
    fontFamily: Fonts.serif,
    fontSize: Typography.xl,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: Typography.sm,
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
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.four,
    gap: 8,
  },
  noticeText: {
    fontSize: Typography.xs,
    flex: 1,
    lineHeight: 16,
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
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: Typography.xs,
    fontWeight: '600',
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
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  guestText: {
    fontSize: Typography.sm,
    fontWeight: '600',
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
  registerLink: {
    fontSize: Typography.sm,
    fontWeight: '700',
  },
});
