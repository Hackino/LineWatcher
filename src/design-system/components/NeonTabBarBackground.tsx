import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

interface NeonTabBarBackgroundProps {
  /** Total tab bar height including safe-area padding. */
  height: number;
  /** Height of the arc peak above the bar's flat baseline. */
  archRise?: number;
}

/**
 * Background for the bottom tab bar: a domed top (single arc peaking in the
 * middle) with a stacked-stroke neon glow ring. The flat rectangle below the
 * arc is filled with the app's panel color so tab items sit on solid ground.
 */
export function NeonTabBarBackground({
  height,
  archRise = 18,
}: NeonTabBarBackgroundProps) {
  const { width } = useWindowDimensions();

  // Path: start at (0, archRise), cubic-bezier peak up to (width/2, 0) and
  // back down to (width, archRise), then close down the sides to a flat bottom.
  const domePath =
    `M 0 ${archRise}` +
    ` C ${width / 3} 0, ${(2 * width) / 3} 0, ${width} ${archRise}` +
    ` L ${width} ${height}` +
    ` L 0 ${height}` +
    ` Z`;

  // Top edge only — used for the neon stroke so the sides/bottom don't glow.
  const topEdgePath =
    `M 0 ${archRise}` +
    ` C ${width / 3} 0, ${(2 * width) / 3} 0, ${width} ${archRise}`;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={styles.svg}
      >
        {/* Panel body */}
        <Path d={domePath} fill={colors.panel} />

        {/* Neon glow — outer bloom (widest, faintest) */}
        <Path
          d={topEdgePath}
          stroke={colors.accent}
          strokeOpacity={0.12}
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
        />
        {/* Neon glow — mid bloom */}
        <Path
          d={topEdgePath}
          stroke={colors.accent}
          strokeOpacity={0.28}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        {/* Neon core */}
        <Path
          d={topEdgePath}
          stroke={colors.accent}
          strokeOpacity={1}
          strokeWidth={1.75}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Ambient glow behind the whole bar to reinforce the neon feel.
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  svg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});
