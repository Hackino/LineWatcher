import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface SourceChipProps {
  locationLabel: string;
  sourceLabel: string;
  onPress?: () => void;
  compact?: boolean;
}

/**
 * Header/inline chip that names the currently focused location + source.
 * Tapping it usually opens the source picker.
 */
export function SourceChip({
  locationLabel,
  sourceLabel,
  onPress,
  compact = false,
}: SourceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Change source. Selected ${locationLabel} · ${sourceLabel}`}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.dot} />
      <View style={styles.text}>
        <AppText variant="caption" color={colors.textFaint} uppercase numberOfLines={1}>
          {locationLabel}
        </AppText>
        <AppText variant="title" color={colors.text} numberOfLines={1}>
          {sourceLabel}
        </AppText>
      </View>
      {onPress ? (
        <AppText variant="h2" color={colors.textMuted} style={styles.caret}>
          ›
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.panel,
  },
  chipCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: 0.7 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  text: { flex: 1 },
  caret: { lineHeight: 24 },
});
