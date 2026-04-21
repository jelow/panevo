import React from 'react';
import { DowntimeEvent } from '../types';

interface Props { events: DowntimeEvent[]; }

function fmtMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function DowntimeList({ events }: Props) {
  if (!events.length) return null;

  const maxDuration = events[0].duration_minutes;

  return (
    <section className="section" aria-label="Downtime events">
      <h2 className="section-title">Downtime Events</h2>
      <div className="downtime-list">
        {events.map((e, i) => {
          const barWidth = Math.round((e.duration_minutes / maxDuration) * 100);
          return (
            <div key={e.id} className="downtime-row">
              <div className="downtime-rank">#{i + 1}</div>
              <div className="downtime-info">
                <div className="downtime-cause">{e.cause}</div>
                <div className="downtime-bar-wrap">
                  <div className="downtime-bar" style={{ width: `${barWidth}%` }} />
                </div>
              </div>
              <div className="downtime-meta">
                <span className="downtime-count">{e.count} {e.count === 1 ? 'event' : 'events'}</span>
                <span className="downtime-duration">{fmtMins(e.duration_minutes)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
