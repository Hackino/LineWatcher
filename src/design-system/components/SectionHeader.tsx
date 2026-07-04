import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color={colors.textMuted} uppercase>
        {title}
      </AppText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
});
