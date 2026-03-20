<div align="center">

# 🏥 ASHA Assist
### AI Rural Health Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)

> **Empowering India's 1 million+ frontline ASHA workers with real-time AI-driven health screening, outbreak detection, and risk stratification at village level.**

[🌐 Live Demo](https://Sugeshan19.github.io/asha-assist/) · [📖 Docs](#setup-instructions) · [🐛 Issues](https://github.com/Sugeshan19/asha-assist/issues)

</div>

---

## 🎯 Problem Statement

India's **rural healthcare system** faces a critical gap:

- **ASHA workers** collect vital health data by hand, with no digital tools
- **Doctors** are overwhelmed — flagging high-risk patients from paper records is slow and error-prone
- **Disease outbreaks** (malaria, TB, dengue) go undetected until too late in remote villages
- **No data** flows from the field to district hospitals in real time

> **Result:** Preventable deaths due to delayed detection of high-risk pregnancies, infectious disease clusters, and chronic conditions.

---

## 💡 Solution Overview

**ASHA Assist** is a mobile-first, AI-powered platform that digitalises and amplifies the work of ASHA health workers:

| Feature | What it does |
|---|---|
| 🤖 **AI Symptom Engine** | Analyses symptoms, vitals, and history to classify patient risk (Low / Medium / High) |
| 🎙️ **Voice Input** | ASHA workers speak in local language — AI transcribes and structures data |
| 📊 **Doctor Dashboard** | Real-time alerts, disease trend charts, and prioritised patient queues |
| 🚨 **Outbreak Detection** | Detects geographic clustering of cases before epidemics spread |
| 📱 **OTP Authentication** | Secure mobile-number login — no emails or passwords needed |
| 🌐 **Offline-Capable** | Designed to work in low-connectivity rural environments |

---

## ✨ Features

### 🩺 ASHA Worker Portal
- Patient registration with full medical history
- AI-driven symptom screening with natural language
- Voice input with multi-language NLP (English, Hindi, Tamil, Telugu, Malayalam)
- Expandable Patient Cards with integrated real-time **Doctor Feedback**
- Risk badge display: 🔴 High / 🟠 Medium / 🟢 Low

### 👨‍⚕️ Doctor Portal
- Command centre dashboard with live high-risk alerts
- Advanced time-series screening trend charts (1 Week / 1 Month / 1 Year)
- Village-wise patient load analytics and rapid multi-filtering engine
- Outbreak alert panel with severity levels
- Comprehensive patient detail view with full diagnostic history

### 🔐 Authentication
- **Multi-mode login:** Email/password OR Mobile OTP (6-digit)
- OTP with 60-second resend timer and rate limiting
- JWT-based session, 7-day expiry
- Role-based access control (ASHA / Doctor / Admin)
- > **Note:** *Google Sign-In (Continue with Google) will be added in future versions for easier authentication.*

### 📈 Analytics Dashboard
- Dynamic time-scale visualization (Weekly, Monthly, Yearly)
- Disease trend line charts across historical data
- Risk distribution donut chart
- Village-wise bar chart (patients vs high-risk)
- Screening funnel (registration → treatment)

### 🛡️ Admin Panel & Global Settings
- Full platform user configuration (`Settings.jsx`)
- User management (ASHA workers + Doctors)
- Platform health metrics (coverage, adoption, follow-up rate)
- Interactive `<NotificationMenu />` globally wired to real-time reviews

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Material UI v5, Recharts |
| **Backend** | Node.js 20, Express.js, JWT, express-validator |
| **AI Service** | Python 3.11, FastAPI, symptom-engine NLP |
| **Database** | MongoDB (Atlas / Docker) |
| **Auth** | JWT + OTP (in-memory / Twilio-ready) |
| **Fonts** | Inter (Google Fonts) |
| **DevOps** | Docker Compose, Nginx |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  React 18 + MUI v5 (Vite)  ·  Mobile-first PWA             │
│  ASHA Portal | Doctor Portal | Admin Console                │
└───────────────────────┬────────────────────────────────────┘
                        │ HTTPS / REST
┌───────────────────────▼────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│         Node.js + Express  ·  JWT Auth Middleware            │
│  /auth  /patients  /screenings  /analytics  /alerts        │
└───────┬───────────────────────────────────┬────────────────┘
        │                                   │
┌───────▼──────────┐               ┌────────▼──────────────┐
│   MongoDB Atlas  │               │   Python AI Service   │
│   (Data Layer)   │               │   FastAPI + NLP       │
│  Users/Patients  │               │  Symptom Engine       │
│  Screenings/     │               │  Risk Classifier      │
│  Alerts/Villages │               │  Outbreak Detector    │
└──────────────────┘               └───────────────────────┘
```

---

## 🖼️ Screenshots

| Login (OTP Flow) | ASHA Dashboard | Doctor Dashboard |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

| Analytics | Patient List | Admin Panel |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB (local or Atlas URI)
- Docker & Docker Compose (optional)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/asha-assist.git
cd asha-assist
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.
```

### 3. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

**AI Service:**
```bash
cd ../ai-service
pip install -r requirements.txt
```

### 4. Seed Sample Data
```bash
cd backend
node seed.js
```

### 5. Start All Services

**Option A – Docker Compose (recommended):**
```bash
docker compose up --build
```

**Option B – Manual:**
```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev

# Terminal 3 – AI Service
cd ai-service && uvicorn main:app --reload --port 8000
```

The app will be available at: **http://localhost:5173**

---

## 🎮 Demo Flow

### Test Accounts

| Role | Email | Password | OTP Phone |
|---|---|---|---|
| ASHA Worker | `asha@asha.com` | `Asha@1234` | `9876543210` |
| Doctor | `doctor@asha.com` | `Doctor@123` | `9876543211` |
| Admin | `admin@asha.com` | `Admin@123` | `9876543212` |

> 💡 **Quick Login:** Click the role chips on the login screen to auto-fill credentials.

### Demo Walkthrough
1. **Login** → Click "ASHA Worker" chip → Sign In
2. **ASHA Dashboard** → View stats, quick actions, recent patients
3. **Register Patient** → Fill health form → Submit for AI screening
4. **View Result** → See AI-generated risk badge + recommendations
5. **Switch to Doctor** → Login as Doctor → See high-risk alerts
6. **Analytics** → Explore disease trend charts and outbreak signals
7. **Admin** → Login as Admin → Platform overview + user management

---

## 🔮 Roadmap

- [ ] Google Sign-In (OAuth 2.0)
- [ ] SMS OTP via Twilio integration (production tier)
- [ ] Offline mode capabilities (PWA + IndexedDB)
- [ ] Extended Regional language support
- [ ] WhatsApp bot AI interception for ASHA workers
- [ ] Government ABHA ID digital integration
- [ ] Predictive ML epidemic outbreak model (LLM fine-tuned)

---

## 🤝 Contributing

Pull requests are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## 📄 License

MIT © 2026 ASHA Assist Team · Built with ❤️ for rural India

---

<div align="center">
  <sub>Built for the 2026 Healthcare Innovation Hackathon</sub>
</div>
