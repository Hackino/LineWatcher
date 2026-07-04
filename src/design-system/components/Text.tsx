import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { colors, typography } from '../theme/tokens';

type Variant = keyof typeof typography;

interface AppTextProps {
  children: React.ReactNode;
  variant?: Exclude<Variant, 'mono' | 'display'> | 'display';
  color?: string;
  mono?: boolean;
  uppercase?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

/** Typographic Text bound to the token scale. */
export function AppText({
  children,
  variant = 'body',
  color = colors.text,
  mono = false,
  uppercase = false,
  numberOfLines,
  style,
}: AppTextProps) {
  const t = typography[variant];
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        {
          color,
          fontSize: t.size,
          fontWeight: t.weight,
          letterSpacing: t.letter,
        },
        mono ? styles.mono : null,
        uppercase ? styles.upper : null,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  mono: { fontFamily: typography.mono, fontVariant: ['tabular-nums'] },
  upper: { textTransform: 'uppercase' },
});
