import React, { useEffect, useState } from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { AppText, Field, colors, radius, spacing } from '@ds';

interface EditNameDialogProps {
  visible: boolean;
  initialValue: string;
  onSave: (name: string) => void | Promise<void>;
  onCancel: () => void;
}

/** Themed modal for editing the profile display name. */
export function EditNameDialog({
  visible,
  initialValue,
  onSave,
  onCancel,
}: EditNameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setSaving(false);
    }
  }, [visible, initialValue]);

  const trimmed = value.trim();
  const canSave = trimmed.length > 0 && trimmed !== initialValue.trim() && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView style={styles.avoider} behavior="padding">
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="button">
          <Pressable style={styles.center} onPress={() => {}}>
            <View style={styles.dialog}>
            <View style={styles.iconWrap}>
              <PenIcon size={22} color={colors.accent} />
            </View>
            <AppText
              variant="caption"
              color={colors.accent}
              uppercase
              style={styles.eyebrow}
            >
              Profile
            </AppText>
            <AppText variant="h2" color={colors.text}>
              Edit display name
            </AppText>
            <AppText variant="body" color={colors.textMuted} style={styles.message}>
              This is how you appear across LineWatch.
            </AppText>

            <View style={styles.fieldWrap}>
              <Field
                label="Display name"
                value={value}
                onChangeText={setValue}
                placeholder="e.g. Alex"
                autoCapitalize="sentences"
                returnKeyType="done"
              />
            </View>

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
                  Cancel
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={!canSave}
                style={({ pressed }) => [
                  styles.btn,
                  canSave ? styles.btnPrimary : styles.btnDisabled,
                  pressed && canSave && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSave }}
              >
                <AppText
                  variant="title"
                  color={canSave ? colors.bg : colors.textFaint}
                >
                  {saving ? 'Saving…' : 'Save'}
                </AppText>
              </Pressable>
            </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PenIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 20 L4 16 L15 5 L19 9 L8 20 Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M13 7 L17 11"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  avoider: { flex: 1 },
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
    borderColor: colors.accent,
    padding: spacing.xl,
    gap: spacing.sm,
    shadowColor: colors.accent,
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
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  eyebrow: { marginBottom: 2 },
  message: { lineHeight: 21, marginTop: spacing.xs },
  fieldWrap: { marginTop: spacing.md },
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
  btnPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  btnDisabled: {
    backgroundColor: colors.raised,
    borderColor: colors.hairline,
  },
  pressed: { opacity: 0.75 },
});
