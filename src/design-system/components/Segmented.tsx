import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface Option {
  value: string;
  label: string;
}

interface SegmentedProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

/** Compact segmented control for range/period toggles. */
export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.active]}
          >
            <AppText variant="label" color={active ? colors.bg : colors.textMuted}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  active: { backgroundColor: colors.accent },
});
