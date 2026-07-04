import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Field, PrimaryButton, colors, spacing, radius } from '@ds';
import { useAuthStore } from '../state/authStore';

export function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.xxxl,
            paddingBottom: insets.bottom + spacing.xxxl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••"
          />
          {error ? (
            <AppText variant="label" color={colors.leak}>
              {error}
            </AppText>
          ) : null}
          <PrimaryButton
            label={busy ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : 'Create account'}
            icon="→"
            onPress={submit}
            disabled={busy || !email.trim() || password.length < 6}
            style={styles.cta}
          />
          <PrimaryButton
            label={mode === 'signIn' ? 'New here? Create an account' : 'Have an account? Sign in'}
            variant="ghost"
            onPress={() => {
              setError(null);
              setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xxxl,
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
