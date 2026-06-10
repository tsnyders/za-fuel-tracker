import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../theme/oneUI';

export interface ChartDataPoint {
  month: string;   // "YYYY-MM"
  price: number;   // cents per litre
}

interface PriceChartProps {
  data: ChartDataPoint[];
  color: string;
  width: number;
  height?: number;
  /** Number of month labels to show on X axis */
  xLabelCount?: number;
}

const PADDING = { top: 16, right: 16, bottom: 40, left: 56 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d.push(`C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`);
  }
  return d.join(' ');
}

function shortMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleString('default', { month: 'short' });
}

function toCentsLabel(cents: number): string {
  return `R${(cents / 100).toFixed(0)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PriceChart({
  data,
  color,
  width,
  height = 200,
  xLabelCount = 6,
}: PriceChartProps) {
  const chartWidth  = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const { points, yMin, yMax, xLabels, yLabels } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], yMin: 0, yMax: 0, xLabels: [], yLabels: [] };
    }

    const prices = data.map(d => d.price).filter(p => p > 0);
    if (prices.length === 0) return { points: [], yMin: 0, yMax: 0, xLabels: [], yLabels: [] };

    const rawMin = Math.min(...prices);
    const rawMax = Math.max(...prices);
    const pad     = (rawMax - rawMin) * 0.1 || 50; // 10% padding, min 50c
    const yMinVal = Math.floor((rawMin - pad) / 100) * 100;
    const yMaxVal = Math.ceil((rawMax + pad) / 100) * 100;
    const yRange  = yMaxVal - yMinVal || 1; // guard divide-by-zero when all prices identical

    // X normalisation: when only one point exists, centre it horizontally.
    const xNorm = (i: number): number =>
      data.length > 1 ? i / (data.length - 1) : 0.5;

    const pts = data.map((d, i) => ({
      x: PADDING.left + xNorm(i) * chartWidth,
      y: PADDING.top + (1 - (d.price - yMinVal) / yRange) * chartHeight,
    }));

    // X-axis labels: evenly spaced
    const xStep = Math.max(1, Math.floor(data.length / xLabelCount));
    const xLbls = data
      .filter((_, i) => i % xStep === 0 || i === data.length - 1)
      .map((d) => {
        const idx = data.indexOf(d);
        return {
          x: PADDING.left + xNorm(idx) * chartWidth,
          label: shortMonth(d.month),
        };
      });

    // Y-axis labels: 4 evenly spaced ticks
    const yTickCount = 4;
    const yLbls = Array.from({ length: yTickCount + 1 }, (_, i) => {
      const val = yMinVal + (yRange / yTickCount) * i;
      const y   = PADDING.top + (1 - i / yTickCount) * chartHeight;
      return { y, label: toCentsLabel(val) };
    });

    return { points: pts, yMin: yMinVal, yMax: yMaxVal, xLabels: xLbls, yLabels: yLbls };
  }, [data, chartWidth, chartHeight, xLabelCount]);

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const linePath = buildSmoothPath(points);

  return (
    <Svg width={width} height={height}>
      {/* Y-axis grid lines + labels */}
      {yLabels.map((tick, i) => (
        <React.Fragment key={i}>
          <Line
            x1={PADDING.left}
            y1={tick.y}
            x2={PADDING.left + chartWidth}
            y2={tick.y}
            stroke={Colors.outlineVariant}
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />
          <SvgText
            x={PADDING.left - Spacing.xs}
            y={tick.y + 4}
            textAnchor="end"
            fontSize={10}
            fill={Colors.onSurfaceVariant}
          >
            {tick.label}
          </SvgText>
        </React.Fragment>
      ))}

      {/* X-axis labels */}
      {xLabels.map((tick, i) => (
        <SvgText
          key={i}
          x={tick.x}
          y={PADDING.top + chartHeight + 20}
          textAnchor="middle"
          fontSize={10}
          fill={Colors.onSurfaceVariant}
        >
          {tick.label}
        </SvgText>
      ))}

      {/* Price line */}
      <Path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data point dots — only show if few enough not to clutter */}
      {data.length <= 18 && points.map((pt, i) => (
        <Circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill={color} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
});
