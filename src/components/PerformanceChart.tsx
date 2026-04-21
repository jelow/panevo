import React, { useMemo, useState, useCallback } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ResponsiveContainer, Brush, Legend,
} from 'recharts';
import { format } from 'date-fns';
import { PerformancePoint, TimelineSegment } from '../types';

interface Props {
  series: PerformancePoint[];
  timeline: TimelineSegment[];
}

interface ChartPoint {
  ts: number;
  label: string;
  performance: number;
  speed_ppm: number;
}

const DOWNTIME_COLOR   = 'rgba(192, 57, 43, 0.15)';
const DOWNTIME_STROKE  = 'rgba(192, 57, 43, 0.4)';
const LINE_COLOR       = '#01696f';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartPoint;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-time">{format(new Date(d.ts), 'MMM d, HH:mm')}</p>
      <p><strong>Performance:</strong> {(d.performance * 100).toFixed(1)}%</p>
      <p><strong>Speed:</strong> {d.speed_ppm.toFixed(1)} ppm</p>
    </div>
  );
}

export function PerformanceChart({ series, timeline }: Props) {
  const data = useMemo<ChartPoint[]>(() =>
    series.map(p => ({
      ts: new Date(p.timestamp).getTime(),
      label: format(new Date(p.timestamp), 'HH:mm'),
      performance: p.performance,
      speed_ppm: p.speed_ppm,
    })), [series]);

  const downtimeSegments = useMemo(() =>
    timeline.filter(s => s.status === 'In Downtime'), [timeline]);

  // Zoom state
  const [refAreaLeft, setRefAreaLeft]   = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  const [isSelecting, setIsSelecting]   = useState(false);
  const [zoomDomain, setZoomDomain]     = useState<[number, number] | null>(null);
  const [brushRange, setBrushRange]     = useState<{ startIndex: number; endIndex: number } | null>(null);

  const displayData = useMemo(() => {
    if (!zoomDomain) return data;
    return data.filter(d => d.ts >= zoomDomain[0] && d.ts <= zoomDomain[1]);
  }, [data, zoomDomain]);

  const handleMouseDown = useCallback((e: any) => {
    if (!e?.activePayload?.[0]) return;
    setRefAreaLeft(e.activePayload[0].payload.ts);
    setIsSelecting(true);
  }, []);

  const handleMouseMove = useCallback((e: any) => {
    if (!isSelecting || !e?.activePayload?.[0]) return;
    setRefAreaRight(e.activePayload[0].payload.ts);
  }, [isSelecting]);

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft !== null && refAreaRight !== null && refAreaLeft !== refAreaRight) {
      const [l, r] = [Math.min(refAreaLeft, refAreaRight), Math.max(refAreaLeft, refAreaRight)];
      setZoomDomain([l, r]);
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [refAreaLeft, refAreaRight]);

  const resetZoom = () => setZoomDomain(null);

  const handleBrushChange = useCallback((brushState: any) => {
    if (brushState?.startIndex !== undefined && brushState?.endIndex !== undefined) {
      setBrushRange({ startIndex: brushState.startIndex, endIndex: brushState.endIndex });
    }
  }, []);

  const applyBrushZoom = useCallback(() => {
    if (brushRange && brushRange.startIndex < brushRange.endIndex && brushRange.startIndex >= 0 && brushRange.endIndex < data.length) {
      const [l, r] = [data[brushRange.startIndex].ts, data[brushRange.endIndex].ts];
      setZoomDomain([l, r]);
    }
  }, [brushRange, data]);

  const tickFormatter = (ts: number) => format(new Date(ts), 'HH:mm');
  const xDomain: [number, number] = displayData.length
    ? [displayData[0].ts, displayData[displayData.length - 1].ts]
    : [0, 1];

  return (
    <section className="section" aria-label="Performance chart">
      <div className="chart-header">
        <h2 className="section-title">Performance Over Time</h2>
        <div className="chart-header-buttons">
          {brushRange && !zoomDomain && (
            <button className="btn-primary" onClick={applyBrushZoom}>Apply zoom</button>
          )}
          {zoomDomain && (
            <button className="btn-primary" onClick={() => { setZoomDomain(null); setBrushRange(null); }}>Reset</button>
          )}
        </div>
      </div>
      {!zoomDomain && brushRange && (
        <p className="chart-hint">Click "Apply zoom" to zoom into your selection.</p>
      )}
      {!zoomDomain && !brushRange && (
        <p className="chart-hint">Drag the sliders at the bottom to select a range, then click "Apply zoom".</p>
      )}

      <div className="chart-wrap" style={{ userSelect: 'none' }}>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart
            data={displayData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={xDomain}
              tickFormatter={tickFormatter}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              minTickGap={60}
            />
            <YAxis
              tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              domain={[0, 1]}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Downtime reference areas */}
            {downtimeSegments.map(seg => {
              const segStart = new Date(seg.start).getTime();
              const segEnd   = new Date(seg.end).getTime();
              // Only draw if overlaps current view
              const viewStart = xDomain[0];
              const viewEnd   = xDomain[1];
              if (segEnd < viewStart || segStart > viewEnd) return null;
              return (
                <ReferenceArea
                  key={seg.start}
                  x1={Math.max(segStart, viewStart)}
                  x2={Math.min(segEnd, viewEnd)}
                  fill={DOWNTIME_COLOR}
                  stroke={DOWNTIME_STROKE}
                  strokeWidth={1}
                  label={{ value: '↓', fill: '#c0392b', fontSize: 11 }}
                />
              );
            })}

            {/* Zoom selection preview */}
            {isSelecting && refAreaLeft !== null && refAreaRight !== null && (
              <ReferenceArea
                x1={Math.min(refAreaLeft, refAreaRight)}
                x2={Math.max(refAreaLeft, refAreaRight)}
                fill="var(--color-primary-highlight)"
                fillOpacity={0.3}
              />
            )}

            <Line
              type="monotone"
              dataKey="performance"
              stroke={LINE_COLOR}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: LINE_COLOR }}
              isAnimationActive={false}
            />

            <Brush
              dataKey="ts"
              tickFormatter={tickFormatter}
              height={24}
              stroke="var(--color-border)"
              fill="var(--color-surface)"
              travellerWidth={6}
              onChange={handleBrushChange}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Downtime legend */}
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-swatch legend-line" />
          Performance %
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-downtime" />
          In Downtime
        </span>
      </div>
    </section>
  );
}
