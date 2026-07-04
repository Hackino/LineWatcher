import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  style,
}: PrimaryButtonProps) {
  const isGhost = variant === 'ghost';
  const accent = variant === 'danger' ? colors.leak : colors.accent;

  // Disabled uses a solid muted surface (never opacity) so the label stays
  // readable instead of the dark page showing through the dark text.
  const backgroundColor = disabled ? (isGhost ? 'transparent' : colors.raised) : isGhost ? 'transparent' : accent;
  const borderColor = disabled ? colors.hairline : isGhost ? colors.hairline : accent;
  const labelColor = disabled ? colors.textFaint : isGhost ? colors.text : colors.bg;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, borderColor },
        !isGhost && !disabled
          ? {
              shadowColor: accent,
              shadowOpacity: pressed ? 0.2 : 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            }
          : null,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <AppText variant="title" color={labelColor} style={styles.label}>
        {icon ? `${icon}  ${label}` : label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
  },
  label: { fontWeight: '800' },
  pressed: { transform: [{ scale: 0.98 }] },
});
