import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './Text';
import { PrimaryButton } from './PrimaryButton';

interface ErrorStateProps {
  /** Icon glyph shown inside the round badge. Defaults to a warning triangle. */
  icon?: string;
  title?: string;
  message?: string;
  /** Label for the retry CTA. */
  retryLabel?: string;
  /** Optional retry handler — CTA is hidden when omitted. */
  onRetry?: () => void;
}

/**
 * Inline "we couldn't load your data" state used across the tab screens when
 * the realtime subscription errors or times out before the first snapshot.
 * Mirrors the visual language of `EmptyState` but uses the danger palette and
 * a retry CTA instead of a neutral prompt.
 */
export function ErrorState({
  icon = '⚠',
  title = "Can't reach your data",
  message = 'Check your internet connection and try again.',
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <AppText variant="h1" color={colors.leak}>
          {icon}
        </AppText>
      </View>
      <AppText variant="h2" color={colors.text} style={styles.center}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textMuted} style={styles.center}>
        {message}
      </AppText>
      {onRetry ? (
        <View style={styles.action}>
          <PrimaryButton label={retryLabel} icon="↻" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // flex: 1 (paired with the Screen ScrollView's flexGrow: 1 contentContainer)
    // stretches this to fill the viewport so the block centers vertically on
    // the page instead of hugging the top.
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.leak,
    backgroundColor: colors.leakDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center', maxWidth: 320 },
  action: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
