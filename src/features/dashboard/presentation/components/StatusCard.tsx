import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Chip, LeakGauge, colors, spacing, radius } from '@ds';
import { formatKwh } from '@shared/format';
import type { LeakSummary } from '@core/domain/services';

interface StatusCardProps {
  summary: LeakSummary;
}

/** Hero line-status card — the emotional center of the app. */
export function StatusCard({ summary }: StatusCardProps) {
  const alert = summary.status === 'alert';
  const accent = alert ? colors.leak : colors.safe;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: accent,
          backgroundColor: alert ? colors.leakDim : colors.safeDim,
          shadowColor: accent,
        },
      ]}
    >
      <View style={styles.left}>
        <Chip label={alert ? 'Leak detected' : 'Line secure'} tone={alert ? 'alert' : 'safe'} />
        <AppText variant="display" color={accent} style={styles.headline}>
          {alert ? 'LEAK' : 'SAFE'}
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.sub}>
          {alert
            ? `${summary.suspiciousCount} interval${
                summary.suspiciousCount === 1 ? '' : 's'
              } drew power outside your house.`
            : 'Provider and house meters are tracking together.'}
        </AppText>
        <View style={styles.metaRow}>
          <View>
            <AppText variant="caption" color={colors.textFaint} uppercase>
              Last interval
            </AppText>
            <AppText variant="h2" color={colors.text} mono>
              {formatKwh(summary.latestLeak)} kWh
            </AppText>
          </View>
        </View>
      </View>
      <LeakGauge fraction={summary.latestLeakPct} status={summary.status} size={150} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  left: { flex: 1, gap: spacing.sm },
  headline: { fontSize: 52, lineHeight: 56 },
  sub: { lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.xs },
});
