import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { colors, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface ScreenProps {
  title?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
}

/** Standard screen scaffold: control-room bg, safe-area header, scroll body. */
export function Screen({
  title,
  eyebrow,
  right,
  children,
  scroll = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  // Present when the screen is rendered under the bottom tab navigator; the
  // tab bar is positioned absolutely and floats over content, so we reserve
  // exactly its height at the bottom of the scroll body. Falls back to a plain
  // safe-area bottom padding for stack screens with no tab bar.
  const tabBarHeight = React.useContext(BottomTabBarHeightContext);
  const bottomPadding =
    tabBarHeight != null ? tabBarHeight + spacing.md : insets.bottom + spacing.xxxl;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {title ? (
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.headerText}>
            {eyebrow ? (
              <AppText variant="caption" color={colors.accent} uppercase>
                {eyebrow}
              </AppText>
            ) : null}
            <AppText variant="h1">{title}</AppText>
          </View>
          {right}
        </View>
      ) : (
        <View style={{ height: insets.top }} />
      )}
      {scroll ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={{
            // flexGrow lets full-height children (ErrorState, EmptyState) fill
            // the available viewport so they can center themselves vertically.
            // Children without flex still lay out top-aligned as before.
            flexGrow: 1,
            padding: spacing.lg,
            paddingBottom: bottomPadding,
            gap: spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.body}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: { gap: 2 },
  body: { flex: 1 },
});
