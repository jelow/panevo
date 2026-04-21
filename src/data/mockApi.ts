import { Report } from '../types';

export const AVAILABLE_RANGE = {
  start: '2026-04-16',
  end: '2026-04-17',
};

let cache: Report | null = null;

export async function fetchReport(start: string, end: string): Promise<Report> {
  if (!cache) {
    const res = await fetch('/mockData.json');
    const json = await res.json();
    cache = json.report as Report;
  }
  const startTs = new Date(start + 'T00:00:00Z').getTime();
  const endTs   = new Date(end   + 'T23:59:59Z').getTime();

  const filteredSeries = cache.performance_series.filter(p => {
    const t = new Date(p.timestamp).getTime();
    return t >= startTs && t <= endTs;
  });

  const filteredTimeline = cache.timeline.filter(seg => {
    const segStart = new Date(seg.start).getTime();
    const segEnd   = new Date(seg.end).getTime();
    return segEnd > startTs && segStart < endTs;
  });

  const runningMins  = filteredTimeline.filter(s => s.status === 'Running')
    .reduce((acc, s) => acc + (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000, 0);
  const downtimeMins = filteredTimeline.filter(s => s.status === 'In Downtime')
    .reduce((acc, s) => acc + (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000, 0);
  const stoppedMins  = filteredTimeline.filter(s => s.status === 'Stopped')
    .reduce((acc, s) => acc + (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000, 0);

  const avgPerf  = filteredSeries.length
    ? filteredSeries.reduce((a, p) => a + p.performance, 0) / filteredSeries.length : 0;
  const avgSpeed = filteredSeries.length
    ? filteredSeries.reduce((a, p) => a + p.speed_ppm, 0) / filteredSeries.length : 0;
  const totalProducts = Math.round(filteredSeries.reduce((a, p) => a + p.speed_ppm, 0));

  const activeEventIds = new Set(
    filteredTimeline.map(s => s.downtime_event_id).filter(Boolean)
  );
  const filteredDowntime = cache.downtime_events.filter(e => activeEventIds.has(e.id));

  return {
    ...cache,
    start: start + 'T00:00:00Z',
    end:   end   + 'T23:59:59Z',
    summary: {
      total_products: totalProducts,
      average_speed_ppm:    Math.round(avgSpeed * 100) / 100,
      average_performance:  Math.round(avgPerf * 10000) / 10000,
      time_running_minutes:     Math.round(runningMins),
      time_in_downtime_minutes: Math.round(downtimeMins),
      time_stopped_minutes:     Math.round(stoppedMins),
    },
    timeline:           filteredTimeline,
    performance_series: filteredSeries,
    downtime_events:    filteredDowntime,
  };
}
