import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './Text';

type Tone = 'danger' | 'accent';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Small uppercase label above the title (matches Screen eyebrows). */
  eyebrow?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Colors the glow ring and the confirm button. Defaults to danger. */
  tone?: Tone;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Themed replacement for the native `Alert.alert`. Modal + backdrop with the
 * app's dark panel look, a semantic glow ring, and matching button styling.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  eyebrow,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const glow = tone === 'danger' ? colors.leak : colors.accent;
  const glowSurface = tone === 'danger' ? colors.leakDim : colors.accentDim;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="button">
        {/* Inner pressable stops the backdrop dismiss when tapping the dialog itself. */}
        <Pressable style={styles.center} onPress={() => {}}>
          <View style={[styles.dialog, { borderColor: glow, shadowColor: glow }]}>
            <View style={[styles.iconWrap, { backgroundColor: glowSurface, borderColor: glow }]}>
              <AppText variant="h1" color={glow}>
                {tone === 'danger' ? '⚠' : 'ⓘ'}
              </AppText>
            </View>
            {eyebrow ? (
              <AppText
                variant="caption"
                color={glow}
                uppercase
                style={styles.eyebrow}
              >
                {eyebrow}
              </AppText>
            ) : null}
            <AppText variant="h2" color={colors.text} style={styles.title}>
              {title}
            </AppText>
            {message ? (
              <AppText variant="body" color={colors.textMuted} style={styles.message}>
                {message}
              </AppText>
            ) : null}
            <View style={styles.actions}>
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnGhost,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <AppText variant="title" color={colors.textMuted}>
                  {cancelLabel}
                </AppText>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: glow, borderColor: glow },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <AppText variant="title" color={colors.bg}>
                  {confirmLabel}
                </AppText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  center: {
    width: '100%',
    alignItems: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  eyebrow: { marginBottom: 2 },
  title: {},
  message: { lineHeight: 21, marginTop: spacing.xs },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    backgroundColor: colors.raised,
    borderColor: colors.hairline,
  },
  pressed: { opacity: 0.75 },
});
