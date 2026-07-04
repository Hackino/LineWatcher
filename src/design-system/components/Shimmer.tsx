import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius as tokenRadius } from '../theme/tokens';

interface ShimmerProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Loading placeholder with a moving light band. Uses only RN Animated,
 * no external gradient dependency — a white-ish stripe translates across
 * a hairline-tinted base.
 */
export function Shimmer({ width, height = 16, radius = tokenRadius.sm, style }: ShimmerProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 260],
  });

  return (
    <View
      style={[
        styles.base,
        { height, borderRadius: radius },
        width != null ? { width } : null,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.stripe,
          {
            borderRadius: radius,
            transform: [{ translateX }, { skewX: '-12deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.raised,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 120,
    backgroundColor: colors.hairline,
    opacity: 0.75,
  },
});
