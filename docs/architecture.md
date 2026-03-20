# ASHA Assist Architecture

## High Level Components
- `frontend` (React + Vite + Material UI)
  - Mobile-first ASHA interface
  - Doctor analytics dashboard
  - Map + outbreak controls
- `backend` (Node.js + Express)
  - JWT auth, role-based access
  - Patient, screening, alerts, analytics APIs
  - Twilio alert integration
- `ai-service` (Python + FastAPI)
  - Symptom triage engine
  - Disease prediction + risk scoring
- `mongodb` (MongoDB)
  - Stores users, patients, screenings, alerts, villages

## Request Flow
1. ASHA worker registers patient and symptoms.
2. Backend calls AI service `/predict`.
3. AI returns disease, risk, recommendation.
4. Backend stores screening and updates patient risk.
5. If risk is `High`, backend sends doctor SMS via Twilio and logs alert.
6. Doctor dashboard visualizes high-risk cases and trends.

## Security
- JWT-based authentication
- Role access:
  - `asha`: patient registration + screening
  - `doctor`: review + analytics + alerts
  - `admin`: all permissions including outbreak simulation
- API rate limiting with `express-rate-limit`
- Basic hardening using `helmet` + CORS

## Hackathon Demo Enhancements
- Seed script creates realistic historical and high-risk cases
- Outbreak simulation endpoint creates clustered dengue spikes
- Geo-location fields support map visualization and clustering
