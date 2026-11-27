# TrafficIQ — Smart Traffic Violation Dashboard

A full-stack demo application with a React + Vite frontend and a Node.js backend. Violation records are stored persistently in `data/violations.json`.

## Features

### Frontend
- Responsive traffic command dashboard
- Violation search and status filters
- Violation activity and category charts (sample analytics)
- Vijayawada demo hotspot visualization and camera-network illustration
- Live demo event simulator (creates sample incidents every 11 seconds)
- Incident detail modal and CSV export

### Backend
- Node.js HTTP API (uses built-in Node modules; no backend framework required)
- `GET /api/health` — backend health check
- `GET /api/violations` — list saved violations
- `POST /api/violations` — create a violation
- `PATCH /api/violations/:id` — update a violation status
- JSON-file persistence in `data/violations.json`
- Input validation and HTTP error responses

## Requirements
- Node.js 18 or newer (Node.js 20 LTS recommended)
- npm
- VS Code (recommended)

## Run the full-stack application

1. Extract this ZIP file.
2. Open the `smart-traffic-violation-dashboard` folder in VS Code.
3. Open **Terminal → New Terminal** and install frontend dependencies:

   ```bash
   npm install
   ```

4. Start the backend in the first terminal:

   ```bash
   npm run server
   ```

   The API runs at `http://localhost:4000`.

5. Open a **second terminal** in the same project folder and start the frontend:

   ```bash
   npm run dev
   ```

6. Open the Vite URL shown in the terminal (usually `http://localhost:5173`). Keep both terminals running.

The Vite development server proxies `/api` requests to the backend on port 4000. The backend automatically creates `data/violations.json` with starter records on first run.

## Verify the backend

Open `http://localhost:4000/api/health` in your browser. You should see a JSON response similar to:

```json
{"status":"ok","service":"TrafficIQ API"}
```

Open `http://localhost:4000/api/violations` to see the saved records.

## Production build check

```bash
npm run build
```

This creates the optimized frontend in `dist/`. The backend is started separately with `npm run server`.

## Important limitations

This is a functional full-stack demo, not a live traffic enforcement system. The incident simulator creates synthetic records; charts and hotspot counts are sample analytics; the camera panel is an illustration. No real CCTV/video stream, ANPR/OCR, AI violation model, vehicle registry, police database, challan provider, or payment gateway is connected. Do not use demo detections to issue real penalties. A real deployment needs authorized data integrations, validated detection, human review, authentication/authorization, audit logging, privacy safeguards, and secure production storage.
