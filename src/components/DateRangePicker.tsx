import React, { useState } from 'react';
import { AVAILABLE_RANGE } from '../data/mockApi';

interface Props {
  onSubmit: (start: string, end: string) => void;
  loading: boolean;
}

export function DateRangePicker({ onSubmit, loading }: Props) {
  const [start, setStart] = useState(AVAILABLE_RANGE.start);
  const [end, setEnd]     = useState(AVAILABLE_RANGE.end);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (start > end) {
      setError('Start date must be before or equal to end date.');
      return;
    }
    onSubmit(start, end);
  }

  return (
    <div className="landing-wrap">
      <div className="landing-card">
        <div className="landing-logo">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="Panevo logo">
            <rect width="36" height="36" rx="8" fill="var(--color-primary)" />
            <rect x="8" y="18" width="5" height="10" rx="1.5" fill="white" opacity="0.5" />
            <rect x="15.5" y="12" width="5" height="16" rx="1.5" fill="white" opacity="0.75" />
            <rect x="23" y="8" width="5" height="20" rx="1.5" fill="white" />
          </svg>
          <span className="landing-brand">Panevo</span>
        </div>

        <h1 className="landing-title">Production Line Report</h1>
        <p className="landing-sub">Select a date range to generate a performance report for Packaging Line 1.</p>

        <form onSubmit={handleSubmit} className="picker-form">
          <div className="picker-row">
            <div className="picker-field">
              <label htmlFor="start-date">Start date</label>
              <input
                id="start-date"
                type="date"
                value={start}
                min={AVAILABLE_RANGE.start}
                max={AVAILABLE_RANGE.end}
                onChange={e => setStart(e.target.value)}
                required
              />
            </div>
            <div className="picker-divider" aria-hidden="true">→</div>
            <div className="picker-field">
              <label htmlFor="end-date">End date</label>
              <input
                id="end-date"
                type="date"
                value={end}
                min={AVAILABLE_RANGE.start}
                max={AVAILABLE_RANGE.end}
                onChange={e => setEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <p className="picker-hint">
            Available data: {AVAILABLE_RANGE.start} to {AVAILABLE_RANGE.end}
          </p>

          {error && <p className="picker-error" role="alert">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Loading…' : 'Generate Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
