import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { AppText } from './Text';

interface LoadingOverlayProps {
  visible: boolean;
  /** Small uppercase label above the title (matches Screen eyebrows). */
  eyebrow?: string;
  /** Main line — what the app is doing. */
  message?: string;
}

/**
 * Full-screen themed loader. Dark backdrop with a floating panel showing a
 * pulsing neon ring + spinner. Matches the control-room aesthetic used across
 * the rest of the app.
 */
export function LoadingOverlay({
  visible,
  eyebrow = 'Working',
  message = 'Just a moment…',
}: LoadingOverlayProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.3] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.ringWrap}>
            <Animated.View
              style={[styles.pulseRing, { transform: [{ scale }], opacity }]}
            />
            <View style={styles.core}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          </View>
          <AppText variant="caption" color={colors.accent} uppercase>
            {eyebrow}
          </AppText>
          <AppText variant="title" color={colors.text} style={styles.title}>
            {message}
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
    minWidth: 220,
  },
  ringWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  pulseRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  core: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { textAlign: 'center' },
});
