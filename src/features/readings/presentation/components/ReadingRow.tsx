import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { AppText, Chip, colors, spacing, radius } from '@ds';
import { formatKwh, formatDateTime } from '@shared/format';
import type { Interval } from '@core/model';

interface ReadingRowProps {
  at: string;
  providerValue: number;
  houseValue?: number;
  interval: Interval | null; // derived vs previous reading; null for the first
  showLeakColumn?: boolean; // when false, right side shows consumption only
  onPress?: () => void;
  onLongPress?: () => void;
}

/** One history row: timestamp, both meter values, and the leak for the step. */
export function ReadingRow({
  at,
  providerValue,
  houseValue,
  interval,
  showLeakColumn = true,
  onPress,
  onLongPress,
}: ReadingRowProps) {
  const alert = interval?.status === 'alert';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <AppText variant="title" color={colors.text}>
          {formatDateTime(at)}
        </AppText>
        <View style={styles.values}>
          <AppText variant="label" color={colors.provider} mono>
            P {formatKwh(providerValue)}
          </AppText>
          {houseValue != null ? (
            <AppText variant="label" color={colors.house} mono>
              H {formatKwh(houseValue)}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.right}>
        {interval ? (
          showLeakColumn ? (
            <>
              <AppText variant="title" color={alert ? colors.leak : colors.textMuted} mono>
                {interval.leak > 0 ? '+' : ''}
                {formatKwh(interval.leak)}
              </AppText>
              <Chip label={alert ? 'suspicious' : 'ok'} tone={alert ? 'alert' : 'safe'} />
            </>
          ) : (
            <>
              <AppText variant="title" color={colors.provider} mono>
                {interval.providerDelta > 0 ? '+' : ''}
                {formatKwh(interval.providerDelta)}
              </AppText>
              <AppText variant="label" color={colors.textFaint}>
                kWh used
              </AppText>
            </>
          )
        ) : (
          <AppText variant="label" color={colors.textFaint}>
            baseline
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.7 },
  left: { gap: spacing.xs },
  values: { flexDirection: 'row', gap: spacing.md },
  right: { alignItems: 'flex-end', gap: spacing.xs },
});
