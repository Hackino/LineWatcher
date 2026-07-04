import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { linearScale } from './geometry';

interface Bar {
  value: number;
  color?: string;
}

interface BarChartProps {
  bars: Bar[];
  width: number;
  height?: number;
  baseColor?: string;
}

/** Simple vertical bar chart; each bar can carry its own semantic color. */
export function BarChart({
  bars,
  width,
  height = 150,
  baseColor = colors.accent,
}: BarChartProps) {
  if (bars.length === 0) return <View style={{ width, height }} />;

  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  const padY = 10;
  const y = linearScale(0, max, height - padY, padY);
  const slot = width / bars.length;
  const barW = Math.max(3, Math.min(slot * 0.6, 18));
  const baselineY = height - padY;

  return (
    <Svg width={width} height={height}>
      <Line
        x1={0}
        y1={baselineY}
        x2={width}
        y2={baselineY}
        stroke={colors.hairline}
        strokeWidth={1}
      />
      {bars.map((b, i) => {
        const cx = i * slot + slot / 2;
        const topY = y(Math.abs(b.value));
        const h = Math.max(0, baselineY - topY);
        return (
          <Rect
            key={i}
            x={cx - barW / 2}
            y={topY}
            width={barW}
            height={h}
            rx={3}
            fill={b.color ?? baseColor}
            opacity={0.9}
          />
        );
      })}
    </Svg>
  );
}
