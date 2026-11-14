# LogPulse — Log Monitoring & Incident Management Frontend

LogPulse is an enterprise-grade React frontend application built for real-time log investigation and incident lifecycle management. It connects seamlessly with the Spring Boot backend REST API.

## Features

- **Dashboard Overview (`/dashboard`)**:
  - Live statistics cards: Total Incidents, Resolved Incidents, Pending Incidents, In-Progress Incidents, Total Logs Ingested.
  - Interactive Incident Lifecycle Distribution donut chart (powered by Recharts).
  - Overall Incident Resolution Rate progress indicator.
  - Quick action shortcuts to explore logs or review active incidents.

- **Log Explorer (`/logs` & `/logs/:id`)**:
  - Server-side paginated data table with customizable page sizes (10, 25, 50, 100).
  - Multi-parameter search & filtering: Correlation ID, Log Level, Log Source / Service, From and To datetime ranges.
  - Color-coded badges for log levels (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`) and HTTP status codes.
  - Deep-linkable Correlation ID investigation: click any correlation ID to instantly filter the log stream.
  - One-click copy for UUIDs and trace identifiers.
  - Dedicated log details page displaying 17+ telemetry fields.
  - Embedded **Raw JSON Viewer** with pretty-printing, monospace formatting, and one-click clipboard copy.
  - Direct **Create Incident from Log** action pre-populating correlation ID, title, and description.

- **Incident Management (`/incidents` & `/incidents/:id`)**:
  - Server-side paginated incident listing with status and correlation ID filtering.
  - Full incident creation modal enforcing initial status `INCIDENT_IDENTIFIED`.
  - Detailed incident investigation page with timeline audit dates (Created, Updated, Resolved).
  - Metadata updates (`PATCH /api/incidents/:id`) for Title, Description, and Remediation Plan.
  - **Strict Incident Lifecycle Management (`PATCH /api/incidents/:id/status`)**:
    - Stepper progression: `INCIDENT_IDENTIFIED` → `REMEDIATION_DEFINED` → `REMEDIATION_IN_PROGRESS` → `RESOLVED`.
    - Only the single valid next stage is enabled.
    - Prevents stage-skipping, backward transitions, or modifications post-resolution.
    - Confirmation dialogs before critical state transitions.

- **Design System & UX**:
  - Violet/purple theme (`#5B21B6`, `#7C3AED`, `#1E0F38`) with yellow/orange alerts and accents.
  - Modern dashboard layout with persistent collapsible desktop sidebar and mobile navigation drawer.
  - Toast notification system with auto-dismiss.
  - Loading skeletons, empty states, error states with retry actions.

## Technology Stack

- **React 18**
- **Vite 5**
- **React Router DOM 6**
- **Axios** (Centralized API service architecture)
- **Lucide React** (Icons)
- **Recharts** (Visual analytics)

## Environment Variables

Configure `.env` in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`. API requests to `/api` are automatically proxied to `http://localhost:8080`.

### 3. Build for Production
```bash
npm run build
```

Production-ready assets are compiled into the `dist/` directory with optimized vendor and chart chunks.

