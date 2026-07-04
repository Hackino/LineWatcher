import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from './Card';
import { AppText } from './Text';
import { colors, spacing } from '../theme/tokens';
import { formatKwh } from '@shared/format';

interface MeterReadoutCardProps {
  label: string;
  value: number;
  delta: number | null;
  color: string;
}

/** Compact latest-reading readout for one meter, with its consumption delta. */
export function MeterReadoutCard({
  label,
  value,
  delta,
  color,
}: MeterReadoutCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <AppText variant="caption" color={colors.textMuted} uppercase>
          {label}
        </AppText>
      </View>
      <AppText variant="h1" color={colors.text} mono style={styles.value}>
        {formatKwh(value)}
      </AppText>
      <AppText variant="label" color={colors.textFaint}>
        kWh total
      </AppText>
      {delta != null ? (
        <AppText variant="label" color={color} style={styles.delta}>
          +{formatKwh(delta)} last interval
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: spacing.xs },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  value: { marginTop: spacing.xs },
  delta: { marginTop: spacing.xs },
});
