import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { PrimaryButton } from './PrimaryButton';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  icon = 'alert-circle-outline',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View
          style={[
            styles.dialogContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            Shadows.card,
          ]}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDestructive ? theme.dangerBg : theme.primaryLight,
              },
            ]}>
            <Ionicons
              name={icon}
              size={28}
              color={isDestructive ? theme.danger : theme.primary}
            />
          </View>

          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </ThemedText>

          <View style={styles.buttonRow}>
            <PrimaryButton
              title={cancelText}
              variant="secondary"
              onPress={onCancel}
              disabled={loading}
              style={styles.actionBtn}
            />
            <PrimaryButton
              title={confirmText}
              variant={isDestructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 28, 34, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.five,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
});
