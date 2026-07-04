import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';

interface LeakGaugeProps {
  /** 0..1 (or beyond) — leak as a fraction of provider consumption. */
  fraction: number;
  status: 'safe' | 'alert';
  size?: number;
  label?: string;
}

const START = 135; // degrees
const SWEEP = 270; // degrees of the arc

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${start.x.toFixed(2)},${start.y.toFixed(2)} A${r},${r} 0 ${large} 1 ${end.x.toFixed(
    2,
  )},${end.y.toFixed(2)}`;
}

/** Radial gauge: track + colored progress arc for the leak fraction. */
export function LeakGauge({
  fraction,
  status,
  size = 160,
  label = 'LEAK',
}: LeakGaugeProps) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const progressColor = status === 'alert' ? colors.leak : colors.safe;
  const endDeg = START + SWEEP * clamped;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Path
          d={arc(cx, cy, r, START, START + SWEEP)}
          stroke={colors.hairline}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
        />
        {clamped > 0 && (
          <Path
            d={arc(cx, cy, r, START, endDeg)}
            stroke={progressColor}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
          />
        )}
        <Circle cx={cx} cy={cy} r={r - 18} fill={colors.panel} />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.value, { color: progressColor }]}>
          {Math.round(fraction * 100)}%
        </Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    fontFamily: typography.mono,
  },
  label: {
    color: colors.textFaint,
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    letterSpacing: typography.caption.letter,
    marginTop: 2,
  },
});
