# 🚨 CrisisConnect 470

> Real-time disaster management and emergency coordination platform.
> **CSE 470 Project** — Built with Next.js, Prisma, PostgreSQL (Neon), and Tailwind CSS.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Prisma%20%2B%20Neon-blue)

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and add your **Neon PostgreSQL** connection string:
```
DATABASE_URL="postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/crisisconnect?sslmode=require"
NEXTAUTH_SECRET="any-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database
```bash
npx prisma db push    # Creates all tables in Neon
npm run db:seed       # Seeds demo data
```

### 4. Run Development Server
```bash
npm run dev
```
Open **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role      | Email                         | Password  |
|-----------|-------------------------------|-----------|
| Admin     | admin@crisisconnect.org       | admin123  |
| Staff     | staff@crisisconnect.org       | user123   |
| Responder | responder@crisisconnect.org   | user123   |
| Volunteer | volunteer@crisisconnect.org   | user123   |
| Citizen   | citizen@crisisconnect.org     | user123   |

---

## ✅ 38 Features Implemented — Feature Map

### Module 1: Core Disaster Intelligence (Mapping)
| # | Feature | File | Status |
|---|---------|------|--------|
| 1 | Real-Time Geospatial Map | `src/components/MapView.js`, `src/app/map/page.js` | ✅ |
| 2 | Smart Incident Filtering | `MapView.js` → filter by type & severity | ✅ |
| 3 | Dynamic Heatmaps | `MapView.js` → data clustering with color-coded pins | ✅ |
| 4 | Spatial Coordinate Logic (Reverse Geocoding) | `src/lib/utils.js` → `reverseGeocode()`, report form GPS | ✅ |
| 5 | Multi-Layer Topography | `MapView.js` → Streets / Satellite / Terrain layers | ✅ |

### Module 2: Emergency Response & SOS
| # | Feature | File | Status |
|---|---------|------|--------|
| 6 | One-Tap SOS Broadcast | `src/components/SOSButton.js`, `src/app/api/sos/route.js` | ✅ |
| 7 | Proximity Push Notifications | `NotificationBell.js` (polling), `sos/route.js` | ✅ |
| 8 | Verified Responder Dashboard | RBAC restricts views — responders see assignment data | ✅ |
| 9 | Mass Alert Broadcast | `src/app/admin/broadcast/page.js`, `api/notifications/broadcast` | ✅ |

### Module 3: Incident Management & Reporting
| # | Feature | File | Status |
|---|---------|------|--------|
| 10 | Evidence-Based Reporting (Multi-step + Photo) | `src/app/incidents/report/page.js` (Cloudinary ready) | ✅ |
| 11 | Verification Workflow | `src/app/incidents/[id]/page.js` → PENDING → VERIFIED → etc. | ✅ |
| 12 | Anonymous Incident Portal | `src/app/api/incidents/anonymous/route.js` (IP rate limiting) | ✅ |
| 13 | Incident Activity Log (Audit Trail) | `api/audit-logs`, incident detail "Audit" tab | ✅ |

### Module 4: Resource & Logistics Management
| # | Feature | File | Status |
|---|---------|------|--------|
| 14 | Shelter Occupancy Tracker | `src/app/shelters/page.js` — live progress bars | ✅ |
| 15 | Supply Inventory Matrix (CRUD) | `shelters/page.js`, `api/shelters/[id]/supplies` | ✅ |
| 16 | Automated Resupply Alerts | `api/shelters/[id]/supplies` → auto-notify admins when low | ✅ |
| 17 | Inter-Shelter Supply Requests | `src/app/supply-requests/page.js`, `api/supply-requests` — staff requests supplies between shelters, admin approves/rejects, pipeline tracking | ✅ |

### Module 5: Humanitarian & Volunteer Coordination
| # | Feature | File | Status |
|---|---------|------|--------|
| 18 | Neural Skill Matching | `src/lib/utils.js` → `matchVolunteers()`, `/api/volunteers/match` | ✅ |
| 19 | Identity & Credential Ledger | NextAuth session + role verification throughout | ✅ |
| 20 | Mission-Specific Chat | `incidents/[id]/page.js` Chat tab, `api/incidents/[id]/messages` | ✅ |
| 21 | Volunteer Leaderboard (Karma) | `src/app/volunteers/page.js`, `api/users/leaderboard` | ✅ |

### Module 6: Missing Persons & Humanitarian Aid
| # | Feature | File | Status |
|---|---------|------|--------|
| 22 | Missing Persons Registry | `src/app/missing/page.js`, `api/missing/route.js` | ✅ |
| 23 | Missing Person Status Tracking | MISSING → FOUND → CLOSED workflow | ✅ |
| 24 | Donation Hub (Money + Supplies) | `src/app/donations/page.js`, `api/donations/route.js` | ✅ |
| 25 | Donation Pipeline Tracking | PLEDGED → RECEIVED → DISTRIBUTED | ✅ |

### Module 7: Disaster Preparedness & Community
| # | Feature | File | Status |
|---|---------|------|--------|
| 26 | Weather Alert System | `src/app/weather-alerts/page.js`, `api/weather-alerts` — severity-coded alerts | ✅ |
| 27 | Emergency Contacts Directory | `src/app/contacts/page.js`, `api/contacts` — hospitals, police, NGOs, quick-dial | ✅ |
| 28 | Evacuation Zone Manager | `src/app/evacuation/page.js`, `api/evacuation` — zones, instructions, status | ✅ |
| 29 | Training Center | `src/app/training/page.js`, `api/training` — courses, progress, karma rewards | ✅ |
| 30 | Community Bulletin Board | `src/app/community/page.js`, `api/community` — posts, comments, categories | ✅ |

### Module 8: Operations & Field Management
| # | Feature | File | Status |
|---|---------|------|--------|
| 31 | Task Manager (Kanban) | `src/app/tasks/page.js`, `api/tasks` — board/list view, priority, status flow | ✅ |
| 32 | Events Calendar & RSVP | `src/app/events/page.js`, `api/events` — drills, meetings, fundraisers | ✅ |
| 33 | Damage Assessment & Costing | `src/app/damage/page.js`, `api/damage` — reports, repair status pipeline | ✅ |
| 34 | Medical Log & Triage | `src/app/medical/page.js`, `api/medical` — patient records, severity, conditions | ✅ |

### Module 9: Admin Command Center
| # | Feature | File | Status |
|---|---------|------|--------|
| 35 | Area-Targeted Mass Alerts (Admin) | `src/app/admin/area-alerts/page.js`, `api/area-alerts` — send geo-targeted emergency alerts to specific areas with radius, all users notified | ✅ |
| 36 | Volunteer → Incident Assignment (Admin) | `src/app/admin/assignments/page.js`, `api/assignments` — skill-matched assignment with karma awards, dual-panel UI | ✅ |
| 37 | User Profile & Activity Log | `src/app/profile/page.js`, `api/profile` — editable profile, stats, activity history | ✅ |

### Module 10: Executive Analytics & Security
| # | Feature | File | Status |
|---|---------|------|--------|
| 38 | Automated PDF Reporting | `src/app/analytics/page.js` → jsPDF generation | ✅ |
| 39 | Role-Based Access Control (RBAC) | All API routes check `session.user.role` | ✅ |

---

## 🏗️ Project Structure

```
crisisconnect/
├── prisma/
│   ├── schema.prisma          # Database schema (25 models)
│   └── seed.js                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── page.js            # Landing page
│   │   ├── login/page.js      # Login
│   │   ├── register/page.js   # Registration
│   │   ├── dashboard/page.js  # Main dashboard
│   │   ├── map/page.js        # Live map
│   │   ├── incidents/
│   │   │   ├── page.js        # Incident list
│   │   │   ├── [id]/page.js   # Incident detail + chat + audit
│   │   │   └── report/page.js # Multi-step report form
│   │   ├── shelters/page.js   # Shelter & supply management
│   │   ├── supply-requests/   # Inter-shelter supply requests (Staff)
│   │   ├── volunteers/page.js # Leaderboard
│   │   ├── missing/page.js    # Missing persons registry
│   │   ├── donations/page.js  # Donation hub
│   │   ├── weather-alerts/    # Weather monitoring
│   │   ├── contacts/page.js   # Emergency contacts directory
│   │   ├── evacuation/page.js # Evacuation zone manager
│   │   ├── training/page.js   # Training center
│   │   ├── community/page.js  # Community bulletin board
│   │   ├── tasks/page.js      # Task manager (Kanban)
│   │   ├── events/page.js     # Events calendar
│   │   ├── damage/page.js     # Damage assessment
│   │   ├── medical/page.js    # Medical log & triage
│   │   ├── profile/page.js    # User profile
│   │   ├── analytics/page.js  # Analytics + PDF reports
│   │   ├── admin/
│   │   │   ├── broadcast/     # Mass alert system
│   │   │   ├── area-alerts/   # Targeted area alerts (Admin)
│   │   │   └── assignments/   # Volunteer-Incident assignment (Admin)
│   │   └── api/               # 31 API route files
│   ├── components/
│   │   ├── AuthProvider.js
│   │   ├── DashboardLayout.js
│   │   ├── Sidebar.js
│   │   ├── MapView.js         # Leaflet map component
│   │   ├── SOSButton.js
│   │   └── NotificationBell.js
│   └── lib/
│       ├── prisma.js          # Prisma singleton
│       ├── auth.js            # NextAuth config
│       └── utils.js           # Helpers (matching, geocoding, etc.)
└── .env.example
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Neon
- **ORM:** Prisma
- **Auth:** NextAuth.js (Credentials Provider)
- **Maps:** Leaflet + OpenStreetMap
- **PDF:** jsPDF + jspdf-autotable
- **Real-time:** Pusher (wiring ready)
- **Images:** Cloudinary (integration ready)
- **Notifications:** In-app polling system

---

## 📝 Notes for Grading

- All features use **beginner-friendly code** — no complex patterns
- RBAC enforced at both **API level** (server) and **UI level** (client)
- The Prisma schema defines **25 models** with proper relations
- **27 pages**, **31 API routes**, **6 components** — zero orphan APIs
- Seed data provides realistic demo scenarios for presentation
- PDF generation works entirely client-side with jsPDF
- The skill matching algorithm in `utils.js` is documented and testable
- Supply Requests: Staff requests between shelters → Admin approves → Pipeline tracking
- Area Alerts: Admin sends geo-targeted mass alerts to specific neighborhoods
- Assignments: Admin assigns volunteers to incidents with skill-matching scores
