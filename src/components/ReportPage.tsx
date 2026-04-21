import React from 'react';
import { Report } from '../types';
import { SummaryStats } from './SummaryStats';
import { PerformanceChart } from './PerformanceChart';
import { DowntimeList } from './DowntimeList';
import { format } from 'date-fns';

interface Props {
  report: Report;
  onBack: () => void;
}

export function ReportPage({ report, onBack }: Props) {
  const { production_line, summary, timeline, performance_series, downtime_events } = report;
  const startFmt = format(new Date(report.start), 'MMM d, yyyy h:mm a');
  const endFmt   = format(new Date(report.end),   'MMM d, yyyy h:mm a');

  return (
    <div className="report-wrap">
      <header className="report-header">
        <div className="report-header-inner">
          <div className="report-header-left">
            <button className="btn-back btn-pill-outline" onClick={onBack} aria-label="Back to date selection">
              ← Back
            </button>
            <div>
              <h1 className="report-line-name">{production_line.name}</h1>
              <h2 className="report-date-range">{startFmt} — {endFmt}</h2>
            </div>
          </div>
          <div className="report-capacity-badge">
            Capacity: {production_line.capacity} ppm
          </div>
        </div>
      </header>

      <main className="report-main">
        <SummaryStats summary={summary} />
        <PerformanceChart series={performance_series} timeline={timeline} />
        <DowntimeList events={downtime_events} />
      </main>
    </div>
  );
}
