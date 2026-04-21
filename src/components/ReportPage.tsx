import React from 'react';
import { Report } from '../types';
import { SummaryStats } from './SummaryStats';
import { PerformanceChart } from './PerformanceChart';
import { DowntimeList } from './DowntimeList';
import { formatUTC } from '../utils';

interface Props {
  report: Report;
  onBack: () => void;
}

export function ReportPage({ report, onBack }: Props) {
  const { production_line, summary, timeline, performance_series, downtime_events } = report;
  const startFmt = formatUTC(new Date(report.start), 'MMM d, yyyy');
  const endFmt   = formatUTC(new Date(report.end),   'MMM d, yyyy');

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
            </div>
            <div className="report-date-range">
              <h2>Capacity: {production_line.capacity} ppm</h2>
            </div>
            <div>
              <h2 className="report-date-range">{startFmt} — {endFmt}</h2>
            </div>
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
