# Production Line Report API — Documentation

## Overview

The Report API provides a single endpoint that returns all data required to render a production line performance report for a given time period. The response includes production line metadata, a summary of key metrics, a status timeline, a performance time-series, and a ranked list of downtime events.

This document defines the request format, response schema, field definitions, and data conventions used in the API.

---

## Endpoint

```
GET /api/report/
```

### Query Parameters

| Parameter | Type | Format | Required | Description |
|-----------|------|--------|----------|-------------|
| `start` | string | ISO 8601 UTC | Yes | Start of the report period (inclusive) |
| `end` | string | ISO 8601 UTC | Yes | End of the report period (inclusive) |

### Example Request

```
GET /api/report/?start=2026-03-10T00:00:00Z&end=2026-03-11T00:00:00Z
```

### Response Format

`Content-Type: application/json`

---

## Response Schema

```json
{
  "report": {
    "start": "2026-03-10T00:00:00Z",
    "end": "2026-03-11T00:00:00Z",
    "production_line": { ... },
    "summary": { ... },
    "timeline": [ ... ],
    "performance_series": [ ... ],
    "downtime_events": [ ... ]
  }
}
```

---

## Top-Level: `report`

| Field | Type | Description |
|-------|------|-------------|
| `start` | string (ISO 8601) | Echoed start of the requested report period |
| `end` | string (ISO 8601) | Echoed end of the requested report period |
| `production_line` | object | Static metadata about the production line |
| `summary` | object | Aggregate metrics computed over the full report period |
| `timeline` | array | Ordered list of status segments (on-change) |
| `performance_series` | array | 1-minute resolution time-series of speed and performance |
| `downtime_events` | array | Named downtime events, ranked by total duration (descending) |

---

## `production_line`

Static properties of the line being reported on.

```json
"production_line": {
  "id": "line_001",
  "name": "Packaging Line 1",
  "capacity": 40
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the production line |
| `name` | string | Human-readable display name |
| `capacity` | number | Maximum production speed in products per minute (ppm). Used as the denominator when computing `performance` |

---

## `summary`

Aggregate metrics covering the full report period. All values are pre-computed by the backend.

```json
"summary": {
  "total_products": 28440,
  "average_speed_ppm": 19.75,
  "average_performance": 0.49,
  "time_running_minutes": 612,
  "time_in_downtime_minutes": 187,
  "time_stopped_minutes": 641
}
```

| Field | Type | Description |
|-------|------|-------------|
| `total_products` | integer | Total number of products produced during the report period |
| `average_speed_ppm` | number | Mean production speed across all `Running` minutes in the period |
| `average_performance` | number | Mean performance across all `Running` minutes. Value between `0.0` and `1.0` |
| `time_running_minutes` | integer | Total minutes the line status was `Running` |
| `time_in_downtime_minutes` | integer | Total minutes the line status was `In Downtime` |
| `time_stopped_minutes` | integer | Total minutes the line status was `Stopped` |

> **Note:** `time_running_minutes + time_in_downtime_minutes + time_stopped_minutes` should equal the total duration of the report period in minutes.

---

## `timeline`

An ordered array of status segments representing every period within the report window. Each entry describes a contiguous block of time during which the line held a single status. A new entry is created only when the status changes (on-change encoding).

```json
"timeline": [
  {
    "start": "2026-03-10T00:00:00Z",
    "end": "2026-03-10T06:00:00Z",
    "status": "Stopped",
    "downtime_event_id": null
  },
  {
    "start": "2026-03-10T06:00:00Z",
    "end": "2026-03-10T09:14:00Z",
    "status": "Running",
    "downtime_event_id": null
  },
  {
    "start": "2026-03-10T09:14:00Z",
    "end": "2026-03-10T12:18:00Z",
    "status": "In Downtime",
    "downtime_event_id": "dt_001"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `start` | string (ISO 8601) | Start of this status segment (inclusive) |
| `end` | string (ISO 8601) | End of this status segment (exclusive) |
| `status` | string (enum) | Line status during this segment. See [Status Values](#status-values) |
| `downtime_event_id` | string \| null | Foreign key referencing a `downtime_events` entry. Only populated when `status` is `"In Downtime"`. `null` otherwise |

### Status Values

| Value | Description |
|-------|-------------|
| `"Running"` | The line is actively producing products |
| `"In Downtime"` | The line is not operating due to an unplanned event |
| `"Stopped"` | The line is intentionally off (e.g. overnight, weekend) |

### Invariants

- Segments are contiguous: the `end` of each entry equals the `start` of the next
- The `start` of the first segment equals `report.start`
- The `end` of the last segment equals `report.end`
- `downtime_event_id` is always `null` when `status` is `"Running"` or `"Stopped"`
- `downtime_event_id` is always populated (non-null) when `status` is `"In Downtime"`

---

## `performance_series`

A uniform 1-minute resolution time-series covering all minutes when the line was in `Running` status. Non-running minutes (Stopped, In Downtime) are omitted.

```json
"performance_series": [
  {
    "timestamp": "2026-03-10T06:00:00Z",
    "speed_ppm": 38,
    "performance": 0.95
  },
  {
    "timestamp": "2026-03-10T06:01:00Z",
    "speed_ppm": 37,
    "performance": 0.925
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string (ISO 8601) | Start of the 1-minute measurement window |
| `speed_ppm` | number | Measured production speed during this minute, in products per minute |
| `performance` | number | Speed as a fraction of line capacity. Computed server-side as `speed_ppm / production_line.capacity`. Value between `0.0` and `1.0` |

> **Why Running minutes only?** Speed and performance are only meaningful when the line is active. Including zeroes for stopped/downtime periods would distort chart averages and trend lines. The frontend can use the `timeline` array to shade downtime and stopped regions on the chart axes.

---

## `downtime_events`

A list of named downtime event types that occurred during the report period, ranked by `duration_minutes` in descending order (highest impact first).

```json
"downtime_events": [
  {
    "id": "dt_001",
    "cause": "Conveyor belt breakdown",
    "count": 1,
    "duration_minutes": 184
  },
  {
    "id": "dt_002",
    "cause": "Electrical issue",
    "count": 2,
    "duration_minutes": 83
  },
  {
    "id": "dt_003",
    "cause": "Waiting on products",
    "count": 5,
    "duration_minutes": 15
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for this downtime event. Referenced by `timeline[].downtime_event_id` |
| `cause` | string | Human-readable description of the failure or stoppage cause |
| `count` | integer | Number of times this event type occurred within the report period |
| `duration_minutes` | integer | Total cumulative duration of all occurrences of this event type, in minutes |

---

## Complete Response Example

```json
{
  "report": {
    "start": "2026-03-10T00:00:00Z",
    "end": "2026-03-11T00:00:00Z",
    "production_line": {
      "id": "line_001",
      "name": "Packaging Line 1",
      "capacity": 40
    },
    "summary": {
      "total_products": 28440,
      "average_speed_ppm": 19.75,
      "average_performance": 0.49,
      "time_running_minutes": 612,
      "time_in_downtime_minutes": 187,
      "time_stopped_minutes": 641
    },
    "timeline": [
      {
        "start": "2026-03-10T00:00:00Z",
        "end": "2026-03-10T06:00:00Z",
        "status": "Stopped",
        "downtime_event_id": null
      },
      {
        "start": "2026-03-10T06:00:00Z",
        "end": "2026-03-10T09:14:00Z",
        "status": "Running",
        "downtime_event_id": null
      },
      {
        "start": "2026-03-10T09:14:00Z",
        "end": "2026-03-10T12:18:00Z",
        "status": "In Downtime",
        "downtime_event_id": "dt_001"
      },
      {
        "start": "2026-03-10T12:18:00Z",
        "end": "2026-03-10T22:00:00Z",
        "status": "Running",
        "downtime_event_id": null
      },
      {
        "start": "2026-03-10T22:00:00Z",
        "end": "2026-03-11T00:00:00Z",
        "status": "Stopped",
        "downtime_event_id": null
      }
    ],
    "performance_series": [
      {
        "timestamp": "2026-03-10T06:00:00Z",
        "speed_ppm": 38,
        "performance": 0.95
      },
      {
        "timestamp": "2026-03-10T06:01:00Z",
        "speed_ppm": 37,
        "performance": 0.925
      }
    ],
    "downtime_events": [
      {
        "id": "dt_001",
        "cause": "Conveyor belt breakdown",
        "count": 1,
        "duration_minutes": 184
      },
      {
        "id": "dt_002",
        "cause": "Electrical issue",
        "count": 2,
        "duration_minutes": 83
      },
      {
        "id": "dt_003",
        "cause": "Waiting on products",
        "count": 5,
        "duration_minutes": 15
      }
    ]
  }
}
```

---

## Design Notes

### Two-Array Approach for Status and Performance

Status and speed are separated into `timeline` and `performance_series` intentionally. Status transitions are discrete events (on-change), while speed is a continuous signal best represented at uniform intervals. Combining them into a single array would require the frontend to handle both event-driven and sampled data with the same logic.

The `timeline` array drives the status overview bar. The `performance_series` array drives the performance chart. The frontend overlays them by checking which `timeline` segment each `performance_series` timestamp falls within — for example, to shade downtime periods on the chart background.

### Performance is Server-Computed

`performance` is calculated server-side as `speed_ppm / production_line.capacity` rather than leaving this to the frontend. This keeps business logic on the backend, where future adjustments to the performance formula (e.g. accounting for micro-stops or planned reduced-speed runs) require no frontend changes.

### Downtime Foreign Key

The `downtime_event_id` field on `timeline` entries creates an explicit relationship between status segments and named downtime events. This allows the frontend to highlight all timeline segments belonging to a specific downtime event when a user interacts with the downtime ranked list.

### Non-Running Minutes Omitted from `performance_series`

Only `Running` minutes appear in `performance_series`. This prevents stopped and downtime periods from distorting aggregated chart metrics. The frontend uses `timeline` to render visual indicators (e.g. greyed-out or shaded regions) for non-running periods on the chart's time axis.

