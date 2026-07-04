import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { AppText } from './Text';

const SEGMENT_W = 96;
const SEGMENT_H = 2;
const DOT = 12;
const SONAR_MAX = 4.2;

/**
 * Bootstrap splash. The wordmark is the mark:
 *   Line / Watcher, split into provider-blue + house-violet — the two
 *   consumption lines the product exists to compare. A two-tone underline
 *   slides in from opposite edges and meets at a bright watchpoint that
 *   emits a slow sonar pulse so the screen never looks frozen.
 */
export function AnimatedSplash() {
  const word = useRef(new Animated.Value(0)).current;
  const leftLine = useRef(new Animated.Value(0)).current;
  const rightLine = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0)).current;
  const caption = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const sonar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.timing(word, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(leftLine, {
            toValue: 1,
            duration: 720,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(rightLine, {
            toValue: 1,
            duration: 720,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(950),
        Animated.timing(dot, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(1350),
        Animated.timing(caption, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const sonarLoop = Animated.loop(
      Animated.timing(sonar, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    intro.start(() => {
      pulseLoop.start();
      sonarLoop.start();
    });

    return () => {
      intro.stop();
      pulseLoop.stop();
      sonarLoop.stop();
    };
  }, [word, leftLine, rightLine, dot, caption, pulse, sonar]);

  const wordTranslate = word.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const wordScale = word.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

  const leftTranslate = leftLine.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });
  const rightTranslate = rightLine.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const dotIntroScale = dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const dotPulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  const sonarScale = sonar.interpolate({ inputRange: [0, 1], outputRange: [1, SONAR_MAX] });
  const sonarOpacity = sonar.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 0.55, 0],
  });

  const captionTranslate = caption.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  return (
    <View style={styles.root}>
      <View style={styles.stack}>
        <Animated.View
          style={[
            styles.wordRow,
            {
              opacity: word,
              transform: [{ translateY: wordTranslate }, { scale: wordScale }],
            },
          ]}
        >
          <AppText color={colors.provider} style={styles.wordChunk}>
            Line
          </AppText>
          <AppText color={colors.house} style={styles.wordChunk}>
            Watcher
          </AppText>
        </Animated.View>

        <View style={styles.lineRow}>
          <Animated.View
            style={[
              styles.segment,
              styles.leftSegment,
              {
                opacity: leftLine,
                transform: [{ translateX: leftTranslate }],
              },
            ]}
          />

          <View style={styles.dotSlot}>
            <Animated.View
              style={[
                styles.sonar,
                {
                  opacity: sonarOpacity,
                  transform: [{ scale: sonarScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dot,
                  transform: [{ scale: dotIntroScale }, { scale: dotPulseScale }],
                },
              ]}
            />
          </View>

          <Animated.View
            style={[
              styles.segment,
              styles.rightSegment,
              {
                opacity: rightLine,
                transform: [{ translateX: rightTranslate }],
              },
            ]}
          />
        </View>

        <Animated.View
          style={{
            opacity: caption,
            transform: [{ translateY: captionTranslate }],
            marginTop: spacing.lg,
          }}
        >
          <AppText variant="caption" color={colors.textMuted} uppercase>
            Watching the line · kWh
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordChunk: {
    fontSize: 40,
    fontWeight: typography.display.weight,
    letterSpacing: -1.2,
  },
  lineRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    height: SEGMENT_H,
    width: SEGMENT_W,
    borderRadius: SEGMENT_H,
  },
  leftSegment: {
    backgroundColor: colors.provider,
  },
  rightSegment: {
    backgroundColor: colors.house,
  },
  dotSlot: {
    width: DOT * 4,
    height: DOT * 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -DOT,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.text,
  },
  sonar: {
    position: 'absolute',
    width: DOT * 2,
    height: DOT * 2,
    borderRadius: DOT,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
});
