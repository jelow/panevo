import React from 'react';
import { Summary } from '../types';

interface Props { summary: Summary; }

function fmtMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtPct(val: number): string {
  return (val * 100).toFixed(1) + '%';
}

export function SummaryStats({ summary }: Props) {
  const cards = [
    { label: 'Total Products',      value: summary.total_products.toLocaleString(),           unit: 'units',  color: 'primary' },
    { label: 'Avg Speed',           value: summary.average_speed_ppm.toFixed(1),              unit: 'ppm',    color: 'primary' },
    { label: 'Avg Performance',     value: fmtPct(summary.average_performance),               unit: '',       color: 'primary' },
    { label: 'Time Running',        value: fmtMins(summary.time_running_minutes),             unit: '',       color: 'success' },
    { label: 'Time in Downtime',    value: fmtMins(summary.time_in_downtime_minutes),         unit: '',       color: 'error'   },
    { label: 'Time Stopped',        value: fmtMins(summary.time_stopped_minutes),             unit: '',       color: 'muted'   },
  ];

  return (
    <section className="section" aria-label="Summary statistics">
      <h2 className="section-title">Summary</h2>
      <div className="kpi-grid">
        {cards.map(c => (
          <div key={c.label} className={`kpi-card kpi-${c.color}`}>
            <span className="kpi-label">{c.label}</span>
            <span className="kpi-value">
              {c.value}
              {c.unit && <span className="kpi-unit"> {c.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
