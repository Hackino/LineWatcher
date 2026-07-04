import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon = '⌁', title, message, children }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="display" color={colors.accent} style={styles.icon}>
        {icon}
      </AppText>
      <AppText variant="h2" color={colors.text} style={styles.center}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textMuted} style={styles.center}>
        {message}
      </AppText>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  icon: { fontSize: 56 },
  center: { textAlign: 'center' },
  actions: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
