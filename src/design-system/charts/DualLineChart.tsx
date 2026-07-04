import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { colors, spacing, typography } from '../theme/tokens';
import { linearScale, extent, linePath } from './geometry';

interface Series {
  label: string;
  color: string;
  values: number[];
}

interface DualLineChartProps {
  series: Series[];
  width: number;
  height?: number;
}

/** Overlaid multi-series line chart with a faint grid. Shares one Y domain. */
export function DualLineChart({ series, width, height = 180 }: DualLineChartProps) {
  const all = series.flatMap((s) => s.values);
  const count = Math.max(...series.map((s) => s.values.length), 1);
  if (all.length < 2) {
    return <View style={{ width, height }} />;
  }

  const [min, max] = extent(all);
  const padX = 8;
  const padY = 14;
  const x = linearScale(0, count - 1, padX, width - padX);
  const y = linearScale(min, max, height - padY, padY);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View>
      <Svg width={width} height={height}>
        {gridLines.map((g) => {
          const gy = padY + g * (height - padY * 2);
          return (
            <Line
              key={g}
              x1={padX}
              y1={gy}
              x2={width - padX}
              y2={gy}
              stroke={colors.hairline}
              strokeWidth={1}
              strokeDasharray="2 5"
            />
          );
        })}
        {series.map((s) => {
          const pts = s.values.map((v, i) => ({ x: x(i), y: y(v) }));
          const last = pts[pts.length - 1];
          return (
            <React.Fragment key={s.label}>
              <Path
                d={linePath(pts)}
                stroke={s.color}
                strokeWidth={2.5}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {last && <Circle cx={last.x} cy={last.y} r={3.5} fill={s.color} />}
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    color: colors.textMuted,
    fontSize: typography.label.size,
    fontWeight: typography.label.weight,
  },
});
