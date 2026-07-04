import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from './Card';
import { AppText } from './Text';
import { colors, spacing } from '../theme/tokens';

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  color?: string;
}

/** Compact labeled metric used in grids on Home / Leak / Analytics. */
export function StatTile({ label, value, hint, color = colors.text }: StatTileProps) {
  return (
    <Card style={styles.card}>
      <AppText variant="caption" color={colors.textMuted} uppercase>
        {label}
      </AppText>
      <AppText variant="h1" color={color} mono style={styles.value}>
        {value}
      </AppText>
      {hint ? (
        <AppText variant="label" color={colors.textFaint}>
          {hint}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: spacing.xs, minWidth: 0 },
  value: { marginTop: spacing.xs },
});
