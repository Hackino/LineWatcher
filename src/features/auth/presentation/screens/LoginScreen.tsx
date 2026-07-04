import React, { useRef, useState } from 'react';
import { View, Image, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  AppText,
  Field,
  PrimaryButton,
  ConfirmDialog,
  LoadingOverlay,
  colors,
  spacing,
  radius,
} from '@ds';
import { useAuthStore } from '../state/authStore';

export function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signUp';
  const passwordHint =
    password.length > 0 && password.length < 6 ? 'At least 6 characters' : undefined;
  const canSubmit = !busy && email.trim().length > 0 && password.length >= 6;

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signIn') await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
      // On success, the watchAuth subscription flips the navigator to the app.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      {/*
        KeyboardAwareScrollView tracks the native IME frame on both iOS and
        Android (like Jetpack Compose's `Modifier.imePadding()` / WindowInsets.ime)
        and scrolls just enough to keep the focused input — plus the amount set
        in `bottomOffset` — above the keyboard. `bottomOffset` here reserves the
        space taken by the primary CTA + secondary toggle, so both are always
        visible above the keyboard regardless of which field has focus.
      */}
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.xxl,
            paddingBottom: insets.bottom + spacing.xxxl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bottomOffset={CTA_BLOCK_HEIGHT}
      >
        <View style={styles.hero}>
          <Image
            source={require('../../../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <AppText variant="caption" color={colors.accent} uppercase>
            Line monitor
          </AppText>
          <AppText variant="display" color={colors.text}>
            LineWatch
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.tagline}>
            Track both meters. Catch anyone tapping your line before it hits your bill.
          </AppText>
        </View>

        <View style={styles.form}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="you@example.com"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••"
            error={passwordHint}
            inputRef={passwordRef}
            returnKeyType="go"
            onSubmitEditing={() => {
              if (canSubmit) submit();
            }}
          />
          <PrimaryButton
            label={isSignUp ? 'Create account' : 'Sign in'}
            icon="→"
            onPress={submit}
            disabled={!canSubmit}
            style={styles.cta}
          />
          <PrimaryButton
            label={isSignUp ? 'Have an account? Sign in' : 'New here? Create an account'}
            variant="ghost"
            onPress={() => {
              setError(null);
              setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
            }}
          />
        </View>
      </KeyboardAwareScrollView>

      <LoadingOverlay
        visible={busy}
        eyebrow={isSignUp ? 'Creating account' : 'Signing in'}
        message={isSignUp ? 'Setting things up…' : 'Verifying your credentials…'}
      />

      <ConfirmDialog
        visible={error !== null}
        eyebrow={isSignUp ? 'Sign-up failed' : 'Sign-in failed'}
        title={isSignUp ? "Couldn't create your account" : "Couldn't sign you in"}
        message={error ?? undefined}
        confirmLabel="Got it"
        tone="danger"
        singleAction
        onConfirm={() => setError(null)}
        onCancel={() => setError(null)}
      />
    </View>
  );
}

// Approx height of the primary CTA (52) + secondary toggle button (52) + the
// gap between them (spacing.lg = 16) + the CTA's marginTop (spacing.sm = 8).
// The KeyboardAwareScrollView keeps this much extra content above the keyboard
// alongside the focused field.
const CTA_BLOCK_HEIGHT = 52 + 16 + 52 + 8;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  hero: { gap: spacing.sm, alignItems: 'flex-start' },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  tagline: { lineHeight: 22, marginTop: spacing.xs, maxWidth: 320 },
  form: { gap: spacing.lg },
  cta: { marginTop: spacing.sm },
});
