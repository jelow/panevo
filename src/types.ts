export type LineStatus = "Running" | "In Downtime" | "Stopped";

export interface ProductionLine {
  id: string;
  name: string;
  capacity: number;
}

export interface Summary {
  total_products: number;
  average_speed_ppm: number;
  average_performance: number;
  time_running_minutes: number;
  time_in_downtime_minutes: number;
  time_stopped_minutes: number;
}

export interface TimelineSegment {
  start: string;
  end: string;
  status: LineStatus;
  downtime_event_id: string | null;
}

export interface PerformancePoint {
  timestamp: string;
  speed_ppm: number;
  performance: number;
}

export interface DowntimeEvent {
  id: string;
  cause: string;
  count: number;
  duration_minutes: number;
}

export interface Report {
  start: string;
  end: string;
  production_line: ProductionLine;
  summary: Summary;
  timeline: TimelineSegment[];
  performance_series: PerformancePoint[];
  downtime_events: DowntimeEvent[];
}

export interface MockDataFile {
  report: Report;
}
