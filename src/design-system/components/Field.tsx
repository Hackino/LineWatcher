import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type ReturnKeyTypeOptions,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { AppText } from './Text';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  error?: string;
  suffix?: string;
  mono?: boolean;
  /** Keyboard return key. Use `'next'` to chain into another field. */
  returnKeyType?: ReturnKeyTypeOptions;
  /** Fired when the user hits the return key on the keyboard. */
  onSubmitEditing?: () => void;
  /** Set `false` when chaining to the next field so the keyboard stays open. */
  blurOnSubmit?: boolean;
  /** Ref to the underlying TextInput — used to focus the field programmatically. */
  inputRef?: React.Ref<TextInput>;
  /** Called when the field gains focus. */
  onFocus?: () => void;
}

/** Labeled text/numeric input with inline error + optional unit suffix. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  error,
  suffix,
  mono = false,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  inputRef,
  onFocus,
}: FieldProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <View
        style={[
          styles.inputRow,
          { borderColor: error ? colors.leak : colors.hairline },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          onFocus={onFocus}
          style={[
            styles.input,
            mono && { fontFamily: typography.mono, fontVariant: ['tabular-nums'] },
          ]}
        />
        {suffix ? (
          <AppText variant="label" color={colors.textFaint}>
            {suffix}
          </AppText>
        ) : null}
      </View>
      {error ? (
        <AppText variant="label" color={colors.leak} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { marginLeft: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  error: { marginLeft: spacing.xs },
});
