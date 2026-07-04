import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { AppText } from './Text';

interface ChipProps {
  label: string;
  tone?: 'safe' | 'alert' | 'neutral' | 'accent';
}

const TONES = {
  safe: { fg: colors.safe, bg: colors.safeDim },
  alert: { fg: colors.leak, bg: colors.leakDim },
  accent: { fg: colors.accent, bg: colors.accentDim },
  neutral: { fg: colors.textMuted, bg: colors.raised },
} as const;

export function Chip({ label, tone = 'neutral' }: ChipProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <View style={[styles.dot, { backgroundColor: t.fg }]} />
      <AppText variant="caption" color={t.fg} uppercase style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 10, letterSpacing: typography.caption.letter },
});
