# Smart Assignment Workload Balancer 📚⚖️

An intelligent, full-stack academic workload management system that synchronizes assignments from **Google Classroom**, accesses coursework briefs via **Google Drive**, schedules balanced study sessions in **Google Calendar**, estimates difficulty and decomposes steps using **Gemini AI**, predicts and mitigates burnout peaks using an **ML workload balancing algorithm**, and updates states in real-time with **Socket.IO**.

---

## 🌟 Key Features

### 1. Assignment Card Action Menu & Quick Actions
- Every assignment card features a direct **`[Mark as Done]`** button alongside a responsive **`[⋮]` Action Menu**.
- Actions include:
  - **Edit Details**: Opens the local edit dialog.
  - **Mark as Done / Undone**: Instantly flips assignment status and moves it between active and completed queues.
  - **View Full Details**: Inspects complete coursework specifications, rubrics, attachments, and AI decomposition.
  - **Delete Assignment**: Safely removes the assignment from your dashboard without touching Google Classroom.
- Clearly displays **Subject Name**, **Subject Code**, **Title**, **Due Date & Time**, **Priority Badge**, and **Deadline Risk**.
- Clicking either the Subject Name or Subject Code opens the detailed view.

### 2. Local Assignment Customization (Edit Mode)
- Edit local parameters:
  - Title & description
  - Due date & due time
  - Difficulty rating (1 to 5)
  - Estimated workload duration (slider with hours/minutes)
  - Priority level (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
  - Personal strategy notes
- **Clear Separation**: Local edits are marked with a `Locally edited` tag and stored in the local database. The original Google Classroom coursework is preserved and never modified.

### 3. Mark as Done & Completed Archive
- Clicking **Mark as Done**:
  - Updates assignment status to `COMPLETED` and records the exact `completed_at` timestamp.
  - Recalculates dashboard statistics and removes completed hours from pending workload.
  - Emits real-time `assignment:status_changed` event via Socket.IO.
  - Retains the item in the dedicated **Completed Assignments** view.
- Provides a **Mark as Undone / Restore** action in the Completed view to move coursework back to `PENDING` without touching Google Classroom.

### 4. Safe Local Deletion
- Prompts with a transparent confirmation dialog:
  > *"Remove this assignment from your dashboard? This will only remove it from this app. The original Google Classroom assignment will not be deleted."*
- Implements soft deletion (`deleted_at != null`) and keeps external Google Classroom IDs so subsequent re-syncs will not re-create or duplicate deleted assignments.

### 5. Resilient Google Classroom Re-sync
- Uses `classroom_coursework_id` as the external unique identifier.
- **Duplicate Prevention**: Never duplicates existing coursework.
- **Status Protection**: Never overwrites `COMPLETED` status with `PENDING` on re-sync.
- **Soft-delete Respect**: Never resurrects deleted assignments.
- **Customization Retention**: Retains local user edits (titles, notes, estimates) while pulling updated materials or attachments.

### 6. Workload Balancer & Burnout Prevention Engine
- Evaluates student daily capacity (default: 4h/day weekdays, 6h/day weekends).
- Detects **Burnout Peaks** where clustered deadlines exceed safe study thresholds.
- Applies **Earliest Deadline First (EDF) Smoothing**:
  - Distributes study blocks backward across available light days before deadlines.
  - Generates balanced `StudyBlock` slots ready to sync to **Google Calendar**.

### 7. Gemini AI Task Decomposition
- Integrated using Google Gemini (`gemini-1.5-flash`).
- Decomposes complex assignments into sequential, bite-sized micro-tasks (with estimated durations).
- Provides context-aware academic study tips and key focus areas.

---

## 🛠️ Project Architecture

```
smart-assignment-workload-balancer/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssignmentCard.jsx          # Card with [Mark as Done] & [⋮] menu
│   │   │   ├── EditAssignmentModal.jsx     # Local assignment editor dialog
│   │   │   ├── DeleteConfirmDialog.jsx     # Safe deletion confirmation modal
│   │   │   ├── AssignmentDetailsModal.jsx  # Detailed view with drive files & AI
│   │   │   ├── CompletedAssignmentsView.jsx# Completed archive with Restore action
│   │   │   ├── WorkloadHeatmap.jsx         # 14-day density chart & burnout gauge
│   │   │   ├── CalendarView.jsx            # Unified academic schedule
│   │   │   ├── DashboardStats.jsx          # Real database statistics
│   │   │   └── Navbar.jsx                  # Navigation & 1-click sync actions
│   │   ├── services/
│   │   │   ├── api.js                      # REST client for backend routes
│   │   │   └── socket.js                   # Real-time Socket.IO client
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Socket.IO)
│   ├── src/
│   │   ├── services/
│   │   │   ├── googleAuthService.js        # Google OAuth 2.0 & Token manager
│   │   │   ├── classroomService.js         # Google Classroom API + safe sync
│   │   │   ├── calendarService.js          # Google Calendar API & busy slot checks
│   │   │   ├── driveService.js             # Google Drive API & attachment parser
│   │   │   ├── geminiService.js            # Gemini 1.5 Flash AI analyzer
│   │   │   └── workloadBalancer.js         # ML workload smoothing & statistics
│   │   ├── routes/                         # REST controllers
│   │   ├── tests/
│   │   │   └── balancer.test.js            # Automated verification test suite
│   │   ├── prisma.js                       # Prisma client instance
│   │   └── server.js                       # Server entrypoint
│   ├── prisma/
│   │   ├── schema.prisma                   # SQLite / relational schema
│   │   └── dev.db                          # Active database
│   ├── .env                                # Environment variables
│   └── package.json
│
├── start.bat                   # 1-click launcher for Windows
└── README.md
```

---

## 🚀 Quick Start Instructions

### Option 1: One-Click Startup (Windows)
Double-click **`start.bat`** in the project root directory. It will automatically launch the backend server on port 5000 and the Vite frontend on port 5173.

### Option 2: Manual Terminal Startup

**1. Start Backend:**
```bash
cd server
npm run dev
```
Backend runs at `http://localhost:5000`.

**2. Start Frontend:**
```bash
cd client
npm run dev
```
Frontend runs at `http://localhost:5173`.

**3. Run Verification Tests:**
```bash
cd server
npm test
```