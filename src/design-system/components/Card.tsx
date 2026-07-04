import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'panel' | 'raised';
  glowColor?: string;
}

/** Layered surface. Optional semantic glow ring for status emphasis. */
export function Card({ children, style, tone = 'panel', glowColor }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: tone === 'raised' ? colors.raised : colors.panel },
        glowColor
          ? {
              borderColor: glowColor,
              shadowColor: glowColor,
              shadowOpacity: 0.4,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
            }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
});
