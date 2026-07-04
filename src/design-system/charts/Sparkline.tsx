import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { linearScale, extent, linePath, areaPath } from './geometry';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

/** Minimal filled trend line for compact cards. */
export function Sparkline({
  data,
  width = 120,
  height = 40,
  color = colors.accent,
}: SparklineProps) {
  if (data.length < 2) return <Svg width={width} height={height} />;

  const [min, max] = extent(data);
  const pad = 3;
  const x = linearScale(0, data.length - 1, pad, width - pad);
  const y = linearScale(min, max, height - pad, pad);
  const points = data.map((v, i) => ({ x: x(i), y: y(v) }));
  const gradId = 'spark-grad';

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath(points, height - pad)} fill={`url(#${gradId})`} />
      <Path
        d={linePath(points)}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
