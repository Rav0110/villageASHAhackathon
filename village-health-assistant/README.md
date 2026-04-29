# Village Health Assistant

## Project Overview
Village Health Worker Digital Assistant for hackathon demos.
It includes:
- An offline-first mobile app for ASHA workers to record patients/visits and generate risk alerts.
- A simple Node/Express backend (JSON-file DB) for syncing and supervisor reporting.

## Features Implemented
Mobile (Expo + React Native + TypeScript):
- Dummy role login (`ASHA Worker` / `Supervisor`)
- Offline-first local storage using `AsyncStorage`
- Add Patient form with local risk alert generation
- Record Visit form that updates the patient and regenerates local alerts
- Risk Alerts screen (local)
- Sync screen (POST to backend; shows offline message if backend is down)
- Government-style summary report screen (text + JSON export/copy)

Backend (Node + Express + TypeScript):
- JSON-file database storage (`server/data/db.json`)
- `POST /api/sync` upsert of patients/visits/alerts
- `GET /api/reports/summary` computed summary counts
- `GET /api/patients`, `GET /api/alerts`

## Folder Structure
```
village-health-assistant/
  mobile/
  server/
  README.md
```

## Risk Rules (Used for Alerts + Summaries)
1. High Risk Pregnancy
- Condition: `pregnancyStatus === true` AND (`systolicBP >= 140` OR `diastolicBP >= 90`)
- Severity: `High`

2. TB Follow-up Required
- Condition: `tbSymptoms === true`
- Severity: `Medium`

3. Vaccination Pending
- Condition: `vaccinationStatus` is `"pending"` or `"missed"`
- Severity: `Medium`

## Setup Commands
### Backend
```bash
cd village-health-assistant/server
npm install
```

### Mobile
```bash
cd village-health-assistant/mobile
npm install
```

## How to Run Backend
```bash
cd village-health-assistant/server
npm run dev
```
Backend listens on port `3000`.

## How to Run Mobile App
### Android emulator (recommended for this demo)
```bash
cd village-health-assistant/mobile
npm run android
```
The mobile app sync base URL is `http://10.0.2.2:3000` (Android emulator localhost mapping).

Notes:
- Android emulator uses `http://10.0.2.2:3000`.
- `GET /api/visits` endpoint exists.
- Physical phone on the same Wi-Fi must use your laptop IP, for example `http://192.168.x.x:3000`.
- `Reset Demo Data` clears local patients, visits, and alerts.

## API Endpoints
Backend Base URL:
`http://10.0.2.2:3000`

1. `GET /health`
2. `POST /api/sync`
   - Accepts:
     ```json
     {
       "patients": [],
       "visits": [],
       "alerts": []
     }
     ```
3. `GET /api/patients`
4. `GET /api/alerts`
5. `GET /api/visits`
6. `GET /api/reports/summary`
   - Returns:
     - `totalPatients`
     - `pregnantPatients`
     - `highRiskPregnancyCases`
     - `tbSuspectedCases`
     - `vaccinationPendingCases`

## Demo Flow
1. Start backend.
2. Start mobile app.
3. Login as `ASHA Worker`.
4. Add a pregnant patient with BP `150/95`.
5. Confirm high-risk alert is generated.
6. Add TB symptoms to another patient.
7. Sync data.
8. Login as `Supervisor`.
9. View dashboard and alerts.
10. Open report screen and show generated summary.

