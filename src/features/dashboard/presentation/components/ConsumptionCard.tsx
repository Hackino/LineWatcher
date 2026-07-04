import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Chip, colors, spacing, radius } from '@ds';
import { formatKwh } from '@shared/format';
import type { LeakSummary } from '@core/domain/services';

interface ConsumptionCardProps {
  summary: LeakSummary;
  meterLabel: string;
}

/**
 * Hero card variant for single-meter sources — no leak concept, just the
 * headline consumption trend for the source.
 */
export function ConsumptionCard({ summary, meterLabel }: ConsumptionCardProps) {
  const latestIv = summary.intervals[summary.intervals.length - 1] ?? null;
  const totalProvider = summary.intervals.reduce(
    (sum, iv) => sum + Math.max(0, iv.providerDelta),
    0,
  );

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Chip label="Consumption only" tone="accent" />
        <AppText variant="display" color={colors.text} style={styles.headline}>
          {formatKwh(totalProvider)}
          <AppText variant="h2" color={colors.textFaint}>
            {' '}
            kWh
          </AppText>
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.sub}>
          Total drawn on {meterLabel} across the recorded intervals.
        </AppText>
        <View style={styles.metaRow}>
          <View>
            <AppText variant="caption" color={colors.textFaint} uppercase>
              Last interval
            </AppText>
            <AppText variant="h2" color={colors.text} mono>
              {formatKwh(latestIv?.providerDelta ?? 0)} kWh
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  left: { flex: 1, gap: spacing.sm },
  headline: { fontSize: 44, lineHeight: 48 },
  sub: { lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.xs },
});
