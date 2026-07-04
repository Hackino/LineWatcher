import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface ScreenProps {
  title?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  back?: boolean;
  onBack?: () => void;
  /**
   * When set, uses `KeyboardAwareScrollView` from react-native-keyboard-controller
   * (same lib LoginScreen uses) and reserves this many pixels below the focused
   * input — sized to fit any CTA that follows the fields, so the button stays
   * above the keyboard alongside the field.
   */
  keyboardBottomOffset?: number;
}

/** Standard screen scaffold: control-room bg, safe-area header, scroll body. */
export function Screen({
  title,
  eyebrow,
  right,
  children,
  scroll = true,
  back = false,
  onBack,
  keyboardBottomOffset,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation.canGoBack()) navigation.goBack();
  };
  // Present when the screen is rendered under the bottom tab navigator; the
  // tab bar is positioned absolutely and floats over content, so we reserve
  // exactly its height at the bottom of the scroll body. Falls back to a plain
  // safe-area bottom padding for stack screens with no tab bar.
  const tabBarHeight = React.useContext(BottomTabBarHeightContext);
  const bottomPadding =
    tabBarHeight != null ? tabBarHeight + spacing.md : insets.bottom + spacing.xxxl;

  const header = title ? (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      {back ? (
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          accessibilityLabel="Back"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Svg width={14} height={14} viewBox="0 0 12 14">
            <Path
              d="M9 1 L3 7 L9 13"
              stroke={colors.text}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>
      ) : null}
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
  );

  const scrollContent = {
    // flexGrow lets full-height children (ErrorState, EmptyState) fill the
    // available viewport so they can center themselves vertically. Children
    // without flex still lay out top-aligned as before.
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: bottomPadding,
    gap: spacing.lg,
  } as const;

  // Same wiring as LoginScreen: KeyboardAwareScrollView tracks the native IME
  // frame on both platforms and scrolls just enough to keep the focused input
  // plus `bottomOffset` (e.g. the CTA that follows it) above the keyboard.
  // Header sits inside the scroll view — same as login's hero — so the whole
  // page participates in the scroll.
  if (scroll && keyboardBottomOffset != null) {
    return (
      <View style={styles.root}>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            paddingBottom: bottomPadding,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bottomOffset={keyboardBottomOffset}
          showsVerticalScrollIndicator={false}
        >
          {header}
          <View style={styles.avoidingBody}>{children}</View>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  const body = scroll ? (
    <ScrollView
      style={styles.body}
      contentContainerStyle={scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.body}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {header}
      {body}
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
    gap: spacing.sm,
  },
  headerText: { flex: 1, gap: 2 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: { opacity: 0.6 },
  body: { flex: 1 },
  avoidingBody: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
