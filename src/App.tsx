import React, { useState, useEffect } from 'react';
import { DateRangePicker } from './components/DateRangePicker';
import { ReportPage } from './components/ReportPage';
import { fetchReport } from './data/mockApi';
import { Report } from './types';
import './App.css';

export default function App() {
  const [report, setReport]   = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [theme, setTheme]     = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  async function handleSubmit(start: string, end: string) {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReport(start, end);
      setReport(data);
    } catch (e) {
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {error && <p className="app-error" role="alert">{error}</p>}

      {report
        ? <ReportPage report={report} onBack={() => setReport(null)} />
        : <DateRangePicker onSubmit={handleSubmit} loading={loading} />
      }
    </>
  );
}
