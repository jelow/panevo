# Panevo Production Line Report

A React + TypeScript single-page application for viewing production line performance reports.

## Features

- Date range selection constrained to available mock data (Apr 16–17, 2026)
- Performance chart with zoomable/scrollable time-series and red downtime highlights
- Summary KPI cards (total products, average speed, average performance, status durations)
- Ranked downtime events list with impact bars
- Responsive layout for desktop and tablet/mobile
- Light and dark mode

## Tech Stack

- React 18 + TypeScript
- Vite 5 (build tooling)
- Recharts (charting)
- date-fns (date formatting)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+

### Install & Run

```bash
npm install
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173).

### Other Scripts

```bash
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview the production build locally
```

## Mock Data

The mock data file is located at `public/mockData.json`. It simulates the `/api/report/` REST endpoint response and covers a 48-hour window from `2026-04-16T00:00:00Z` to `2026-04-17T23:59:59Z`.

The data includes:
- 1-minute resolution performance time-series for all running periods
- On-change status timeline (Running / In Downtime / Stopped)
- Three downtime event types: Conveyor belt breakdown, Electrical issue, Waiting on products
- Day shift pattern (06:00–20:00) with overnight shutdowns

## API Schema

See `API_DOCUMENTATION.md` for the full response schema definition.

## Project Structure

```
panevo-report/
├── index.html                      — Vite entry point (project root)
├── vite.config.ts                  — Vite configuration
├── tsconfig.json                   — TypeScript configuration
├── package.json
├── public/
│   └── mockData.json               — Mock API response data
└── src/
    ├── types.ts                    — TypeScript interfaces for the API response
    ├── App.tsx                     — Root component, theme management, routing
    ├── App.css                     — All component styles
    ├── index.css                   — Global design tokens and base reset
    ├── index.tsx                   — Application entry point
    ├── data/
    │   └── mockApi.ts              — Mock API fetch, caching, and date-range filtering
    └── components/
        ├── DateRangePicker.tsx     — Landing page with date inputs
        ├── ReportPage.tsx          — Report layout shell and header
        ├── PerformanceChart.tsx    — Recharts performance line chart with downtime bands
        ├── SummaryStats.tsx        — KPI summary cards
        └── DowntimeList.tsx        — Ranked downtime events list
```
