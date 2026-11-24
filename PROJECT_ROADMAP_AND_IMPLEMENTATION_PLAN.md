# BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
## MASTER PROJECT ROADMAP & GREENFIELD IMPLEMENTATION PLAN
**Document Identifier:** `BAL-PLN-ROADMAP-2026-V1.0`  
**Governing Architectural Standard:** BALSONS Standard Architecture Model (`SAM-2026`)  
**Design System Standard:** BFast Enterprise Design System (`BEDS V2.0`) & WCAG 2.1 AA  
**Corporate Entity:** BALSONS Heavy Lift & Shift  
**Anchor Project:** Jupiter Tatravagonka Railwheel Factory (JTRWF), Khordha, Odisha  
**Workspace Root:** `D:\jupiter files from\BALSONS PORTALS 2026`  

---

## 1. STRATEGIC FOUNDATION & CORE OPERATING PRINCIPLE

### 1.1 The Mandatory Technology Architecture
The BALSONS Enterprise Ecosystem operates under an immutable architectural model where each layer is strictly assigned to its specialized enterprise engine:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             MANDATORY TECHNOLOGY ARCHITECTURE                                          │
├──────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. DATABASE              │ Google Sheets — All structured operational tables, relational records, and audit journals   │
│ 2. MAIN ENGINE           │ Google Apps Script (V8) — Backend logic, APIs, business workflows, auth & automation        │
│ 3. FRONTEND              │ HTML5 + CSS3 (BEDS V2.0) + Vanilla ES6+ JS via Git — Portal interfaces published via Git   │
│ 4. DOCUMENT REPOSITORY   │ Google Drive — 87 provisioned sub-vaults under Root ID 1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde    │
│ 5. SYNCHRONIZATION       │ BALSONS Central Sync Hub — 30s auto-reload parity, local outbox queue, and cross-portal sync │
└──────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
```

> **CORE PRINCIPLE:**  
> **Google Sheets = Database | Google Apps Script = Main Engine | Git = Frontend Source & Hosting Link | Google Drive = Document Management. All components must operate as one integrated BALSONS enterprise system.**

---

## 2. 10-STAGE MASTER ROADMAP TIMELINE & GANTT SCHEDULE

```mermaid
gantt
    title BALSONS Enterprise Ecosystem: 10-Stage Implementation Master Schedule
    dateFormat  YYYY-MM-DD
    axisFormat  %d-%b
    
    section Foundation (Stages 1-3)
    Stage 1: Requirements & Architecture                 :done, s1, 2026-11-24, 2026-11-25
    Stage 2: Google Sheets - Database Development        :active, s2, 2026-11-26, 3d
    Stage 3: Google Apps Script - Main Engine           :s3, after s2, 5d
    
    section Frontend & Drive (Stages 4-6)
    Stage 4: Frontend Development - Git                  :s4, after s3, 5d
    Stage 5: Google Drive Integration                    :s5, after s4, 3d
    Stage 6: System Integration (Ecosystem + Sync)       :s6, after s5, 4d
    
    section Testing & Deployment (Stages 7-10)
    Stage 7: Offline-First Testing                       :s7, after s6, 3d
    Stage 8: Complete Testing & Optimization (Playwright):s8, after s7, 4d
    Stage 9: Final Build & Git Push                      :s9, after s8, 2d
    Stage 10: Production Deployment & Handover           :s10, after s9, 2d
```

---

## 3. DETAILED STAGE-BY-STAGE IMPLEMENTATION BLUEPRINT

---

### STAGE 1: REQUIREMENTS & ARCHITECTURE
* **Primary Objective:** Finalize functional requirements, technical architecture, database schemas, and the development roadmap across all 7 ecosystem portals.
* **Inputs & Reference Base:**
  - `DOCUMENT 01 — PORTAL-WISE PROJECT & FUNCTIONAL SPECIFICATIONS.md`
  - `DOCUMENT 02 — DATABASE ARCHITECTURE & AUTOMATED INITIALIZATION.md`
  - `DOCUMENT 03 — COMPLETE TECHNICAL ARCHITECTURE & ENTERPRISE INTEGRATION.md`
  - `DOCUMENT 04 — ENTERPRISE UI-UX, DESIGN SYSTEM & BRANDING.md`
  - `DOCUMENT 05 — ALL PORTALS MASTER VISUAL AND FUNCTIONAL SPECIFICATION.md`
  - `PROJECT ASSETS AND IMAGES REFERENCE/README.md`
* **Key Tasks & Deliverables:**
  1. Freeze the authoritative 26-column `EMPLOYEE_MASTER` schema.
  2. Codify the 9-discipline gate clearance decision rules (`CLEARED`, `CONDITIONAL`, `BLOCKED`).
  3. Freeze the deterministic dual-wage formulas (`att.present === 0` yields ₹0; advance recovery non-negative net pay guard).
  4. Finalize the 4-tier serverless topology (`SAM-2026`) and BEDS V2.0 color palette.
* **Exit Gate & Milestone:** Signed Master Engineering Specification Dossier (`BAL-ENG-MASTER-DOSSIER-2026-V1.0`). **[STATUS: COMPLETED & LOCKED]**

---

### STAGE 2: GOOGLE SHEETS – DATABASE DEVELOPMENT
* **Primary Objective:** Create fresh Google Sheets operational databases, structured relational sheets, validation rules, master seed data, and automated initializers.
* **Target Operational Databases (Dedicated Spreadsheets):**
  1. `BALSONS_HR_PAYROLL_DATABASE_MASTER` (ID: `1so_aH05vVxiUJsIK6VS-n7BpGrHWNgn_5EK7RuA3cuw`)
  2. `BALSONS_GATE_ENTRY_DATABASE_MASTER` (ID: `1yAuZOXc8WoC2TvTvnEWMrOyLl_50BRuJgDed_pdFT3o`)
  3. `BALSONS_SAFETY_DATABASE_MASTER` (ID: `1SyOGt6HEu6HJCufAbB2_P6BgF6pEppt28J_8cARaOP0`)
  4. `BALSONS_STORE_DATABASE_MASTER` (ID: `1u_ZKvvCVfEQDAtkoMR68q2d2hEK-eWBnvsS3AGfP6yQ`)
  5. `BALSONS_PURCHASE_DATABASE_MASTER` (ID: `1ANnu4X2dR0EITq5RvkyfMv1Xfz30Ba26IKjc40uyj_c`)
  6. `BALSONS_OPERATIONS_DATABASE_MASTER` (ID: `1GeqDDmBgdVm3ZUp4c9iB36__iLJ9wADQQRhEIwVxa-E`)
* **Step-by-Step Technical Execution:**
  1. Deploy `ProvisionEnterpriseDatabases.gs` to create spreadsheets and register their IDs in `PropertiesService`.
  2. Execute `initializeFreshHrDatabase()`:
     - Provision all 22 relational sheets (from `SYSTEM_CONFIG` through `BACKUP_LOG`).
     - Apply BEDS corporate styling: `#102D35` dark teal header background, `#FFFFFF` white bold text, freeze row 1, auto-fit column widths.
     - Enforce uppercase/date validation rules on columns `DOB`, `JoiningDate`, `PAN_No`, `BankIFSC`.
  3. Execute `initializeFreshGateDatabase()`:
     - Provision all 24 relational sheets (from `APP_CONFIG` through `GATE_PASS_REGISTER`).
     - Enforce foreign key constraints between `GATE_REQUEST_REGISTER` and `GATE_CLEARANCE_REGISTER`.
  4. Seed Master Dictionaries:
     - Populate `DEPARTMENT_MASTER` (Rigging, Erection, Safety, Mechanical, Admin, Stores).
     - Populate `PROJECT_MASTER` (JTRWF Khordha Project, Client: Jupiter Tatravagonka).
     - Populate `LEAVE_MASTER` (CL, SL, PL, CO).
* **Exit Gate & Milestone:** All 6 Google Sheets databases provisioned, validated, and accessible with 0 schema errors.

---

### STAGE 3: GOOGLE APPS SCRIPT – MAIN ENGINE
* **Primary Objective:** Develop backend serverless logic, REST/POST dispatchers, business workflows, cryptographic authentication, concurrency locks, and automation engines.
* **Core Modules to Build:**
  1. **Universal Web Dispatcher (`Code.gs`):**
     - Single `doPost(e)` entrypoint with JSON payload parsing from Simple Request `text/plain` headers.
     - Action routing map (`auth.login`, `hr.getEmployees`, `hr.calculatePayroll`, `gate.evaluateClearance`, `gate.logMovement`, `sync.pollUpdates`).
  2. **Cryptographic Authentication & Session Engine (`AuthService.gs`):**
     - PBKDF2-HMAC-SHA256 password derivation with 16-byte random salt.
     - `bootstrapGreenfieldAdmins()` seeding canonical accounts (`superadmin`, `admin.hr`, `admin.gate`, etc.).
     - Ephemeral bearer session generation (`"BT-" + UUID + "-" + timestamp`) cached in `CacheService` with 6-hour TTL (21,600 s).
     - Active status verification interceptor (`IsActive === 'ACTIVE'`).
  3. **Concurrency & Atomic Locks:**
     - Integration of `LockService.getScriptLock()` with 10-second wait locks to serialize mutations on attendance and gate movements.
  4. **Business Logic Engines:**
     - `PayrollEngine.gs`: Compiles attendance, applies daily wage present-days basis, enforces zero-attendance rule (0 days = ₹0 gross), calculates statutory PF/ESIC/PT, executes non-negative pay guard on advance recoveries, and locks the pay period upon PIN authorization.
     - `ClearanceEngine.gs`: Server-side evaluation of all 9 compliance disciplines (Identity, Police, Medical, Vertigo, Insurance, Competency, PPE, Work Docs, Equipment Fitness) outputting `CLEARED`, `CONDITIONAL`, or `BLOCKED`.
     - `GateTransactionService.gs`: Validates delivery challans against active Purchase Orders, tracks RGP return due dates, and manages exit dispatch authorization guards.
  5. **Audit Journal Engine:**
     - Continuous SHA-256 hash chaining journal writing to `AUDIT_LOG`.
* **Exit Gate & Milestone:** Apps Script APIs returning structured JSON envelopes with $< 600\text{ ms}$ query and $< 1200\text{ ms}$ mutation latency under lock.

---

### STAGE 4: FRONTEND DEVELOPMENT – GIT
* **Primary Objective:** Build fresh BALSONS-branded HTML, CSS, and JavaScript frontend interfaces, maintained and published via a BALSONS-owned Git repository.
* **Frontend Repository Layout:**
  ```
  balsons-portals-2026/
  ├── assets/
  │   ├── css/beds.css                             # Master BEDS V2.0 styling & tokens
  │   ├── js/
  │   │   ├── beds-workspace.js                    # Topbar, Dual-Sync & 30s countdown chip
  │   │   ├── balsons-sam-auth.js                  # SAM-2026 RBAC & Authority Simulator
  │   │   ├── beds-portal-login.js                 # Split-screen branded login controller
  │   │   ├── beds-superadmin.js                   # Super Admin command console modal
  │   │   ├── balsons-docs-manager.js              # Drive Vault integration controller
  │   │   └── qrcode.min.js                        # Zero-dependency QR generator
  │   └── images/                                  # Official logo & HD covers (2400x1600)
  ├── index.html                                   # Central Enterprise Launcher & Directory
  ├── BALSONS HR MANAGER/
  │   └── frontend/
  │       ├── index.html                           # HR Single Page Application
  │       ├── register.html                        # 6-step candidate onboarding wizard
  │       └── assets/js/app.js                     # Attendance, loans & payroll UI logic
  ├── BALSONS GATE ENTRY MANAGER/
  │   └── frontend/
  │       ├── index.html                           # Turnstile stream & clearance radar UI
  │       └── assets/js/app.js                     # Gate scan loop & modal logic
  ├── BALSONS SAFETY MANAGER/frontend/index.html   # 10 statutory PTW templates studio
  ├── BALSONS STORE MANAGER/frontend/index.html    # Offline IndexedDB 264-tackle catalog
  ├── BALSONS PURCHASE MANAGER/index.html          # PR workflow & commercial PO generator
  └── BALSONS OPERATIONS MANAGER/index.html        # Schuler press erection workfronts
  ```
* **Key Tasks:**
  1. Configure BALSONS Git repository with branch protection rules on `main`.
  2. Implement responsive BEDS V2.0 styling: 48px sticky topbar, high-contrast industrial tables, KPI summary cards, status badges, and mobile off-canvas drawer.
  3. Wire frontend fetch requests to the Apps Script backend using HTTPS POST Simple Requests (`Content-Type: text/plain;charset=utf-8`).
* **Exit Gate & Milestone:** All 7 portals loading cleanly in browser with zero console errors, responsive pinch-to-zoom enabled, and authentic HD photography.

---

### STAGE 5: GOOGLE DRIVE INTEGRATION
* **Primary Objective:** Create a structured, portal-wise Google Drive folder system for employee dossiers, reports, challans, and inspection records with bidirectional spreadsheet linkage.
* **Root Vault Configuration:**
  - Name: `BALSONS_ENTERPRISE_SYSTEM_MASTER_VAULT`
  - Root Folder ID: `1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde`
* **Departmental Vault Structure (87 Sub-Vaults):**
  - `01_GATE_ENTRY_MANAGER` (`1BbLIA4W...`): RGP, NRGP, Visitor passes, Vehicle fitness, Inward/Outward delivery challans.
  - `02_HR_AND_PAYROLL_MANAGER` (`1TGaAS1a...`): Aadhaar/PAN scans, Candidate photos, Form-32 medicals, EPFO records, Police verification PVC, Monthly salary slips.
  - `03_OPERATIONS_AND_RIGGING_MANAGER` (`1mNMSK9V...`): 360° completion dossiers, Daily shift DPRs, Crane lift checklists.
  - `04_PURCHASE_AND_COMMERCIAL_MANAGER` (`1lBWPI1V...`): Signed POs, supplier quotes, vendor tax invoices, GRN inspection certs.
  - `05_SAFETY_AND_RISK_MANAGER` (`14l-IAZc...`): Signed PTWs across 10 categories, TBT rosters, HIRA/JSA studies, CAPA photos.
  - `06_STORE_AND_TACKLE_MANAGER` (`1RSSF5Ld...`): Form 11 statutory certificates for all 264 tackles, issue slips, calibration records.
  - `07_EXECUTIVE_GOVERNANCE_AND_SYNC_HUB` (`1ZnMBMc2...`): Monthly ecosystem reports, daily 01:00 AM database snapshots.
* **Bidirectional Linkage:** Uploaded file URLs automatically populate relational columns (`EMPLOYEE_DOCUMENTS.DriveUrl`, `SALARY_SLIP_LOG.DriveFileUrl`, `TOOLS_TACKLES_REGISTER.TPI_Ref`).
* **Exit Gate & Milestone:** 100% verified folder structure with automated file streaming, search, and retrieval via `balsons-docs-manager.js`.

---

### STAGE 6: SYSTEM INTEGRATION
* **Primary Objective:** Wire together Frontend + Apps Script + Google Sheets + Google Drive + Central Sync Hub into one cohesive operational system.
* **Key Tasks:**
  1. Wire cross-portal data exchange contracts:
     - HR $\rightarrow$ Gate/Safety: Active Personnel Snapshot (`EmpID`, `FullName`, `Trade`, `VertigoClearance`, `Status`).
     - Gate $\rightarrow$ Safety/Store: Real-Time On-Site Headcount ensuring permits and tools are only issued to personnel physically verified inside the plant.
     - Purchase $\rightarrow$ Gate/Store: Approved PO records for delivery challan verification.
  2. Implement Central Sync Hub Telemetry:
     - Local outbox queue (`beds_pending_mutations_queue` in `localStorage`).
     - 30-second scheduled auto-reload parity engine with decrementing countdown chip (`#bedsAutoSyncChip`).
     - Real-time status pill (`#bedsSheetSyncPill`): `LIVE` (Emerald), `SYNCING` (Amber), `OFFLINE QUEUED` (Red).
* **Exit Gate & Milestone:** End-to-end multi-portal transaction execution with instant cross-portal data propagation and parity synchronization.

---

### STAGE 7: OFFLINE-FIRST TESTING
* **Primary Objective:** Test frontend and offline workflows locally using mock data and local storage, then verify cloud-dependent functionality separately online.
* **Key Tasks:**
  1. Validate Store Manager offline checkout using IndexedDB (`BALSONS_STORE_DB`).
  2. Disconnect network connectivity on test devices:
     - Verify that gate movements, attendance logs, and safety checklists buffer into `beds_pending_mutations_queue`.
     - Confirm non-blocking toast alert: *"Network offline: Transaction safely queued in local storage. Will auto-sync upon reconnection."*
     - Confirm topbar sync pill transitions to `OFFLINE QUEUED`.
  3. Reconnect network:
     - Verify automatic outbox queue flushing to Google Sheets without mutation loss or duplicate rows.
* **Exit Gate & Milestone:** Zero data loss during simulated network drops; 100% successful offline-to-online queue reconciliation.

---

### STAGE 8: COMPLETE TESTING & OPTIMIZATION
* **Primary Objective:** Execute comprehensive functional, database, security, integration, and Playwright automated tests across all portals. Fix all defects.
* **Test Suites to Execute:**
  1. **HR Manager Test Matrix:** Execute `HRP-001` through `HRP-024` (100% pass rate).
  2. **Gate Entry Test Matrix:** Execute `JGE-001` through `JGE-027` (100% pass rate).
  3. **SAM-2026 Access Governance Suite:** Execute `SAM-001` through `SAM-010` (Single Super Admin, role enforcement, URL tamper blocking).
  4. **Playwright Automated Browser Testing:**
     - Desktop viewports ($1440 \times 900$).
     - Mobile portrait viewports ($375 \times 812$).
     - Capture and archive verified screenshot evidence.
* **Optimization Targets:** FCP $< 1.2\text{ s}$ on 4G, API responses $< 600\text{ ms}$, zero memory leaks in auto-sync interval.
* **Exit Gate & Milestone:** 100% test pass fidelity across all 61 automated tests with verified screenshot logs.

---

### STAGE 9: FINAL BUILD & GIT PUSH
* **Primary Objective:** Finalize and verify the complete source code, then push all approved frontend files and assets to the BALSONS-owned Git repository.
* **Configured Repository Profile:**
  - **Git Account:** `balsonsportals`
  - **Author Identity:** `balsonsportals <balsonsportals@gmail.com>`
  - **Remote Origin:** `https://github.com/balsonsportals/BALSONS-PORTALS-2026.git`
  - **Official Google Account / Login:** `balsonsportals@gmail.com`
* **Key Tasks:**
  1. Purge all temporary debug code, test harnesses, and development keys.
  2. Verify code hygiene: semantic markup, BEDS token consistency, strict zero hardcoded credentials.
  3. Final verification of all asset paths (`assets/css/beds.css`, `assets/images/`, `assets/js/`).
  4. Create formal production release commit and tag: `git tag -a v1.0.0-PROD -m "BALSONS Enterprise Ecosystem Greenfield Production Release"`.
  5. Push production branch and tags to the BALSONS-owned Git repository.
* **Exit Gate & Milestone:** Clean production repository tagged `v1.0.0-PROD` on GitHub with automated deployment hooks configured.

---

### STAGE 10: PRODUCTION DEPLOYMENT & HANDOVER
* **Primary Objective:** Deploy frontend, publish Apps Script Web Apps under corporate tenancy, connect production databases and Drive vaults, verify integrations, and transfer ownership.
* **Key Tasks:**
  1. Publish Google Apps Script projects as Web Apps under BALSONS corporate tenancy (`@balsons.com`).
  2. Activate GitHub Pages / Enterprise CDN hosting for `main` branch.
  3. Execute live production smoke test suite: verify live Google Sheet connections and sync pills across all 7 portals.
  4. Perform Disaster Recovery validation: test daily backup snapshot restore and run `verifyAuditIntegrity()` to certify SHA-256 hash chains.
  5. Executive Technical Handover: transfer root credentials (Google Login: `balsonsportals@gmail.com`), repository admin rights (account: `balsonsportals`), and root Drive vault ownership (`1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde`) to BALSONS executive management.
* **Exit Gate & Milestone:** Production system live, operational, and signed off with complete corporate ownership transfer.

---

## 4. RESPONSIBILITY ASSIGNMENT MATRIX (RACI)

| Project Stage | Super Admin (`superadmin`) | HR Head (`admin.hr`) | Gate Admin (`admin.gate`) | Safety Admin (`admin.safety`) | Store Admin (`admin.store`) | Lead Engineer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Stage 1: Requirements & Architecture** | **A** | C | C | C | C | **R** |
| **Stage 2: Google Sheets DB Development** | **A** | C | C | C | C | **R** |
| **Stage 3: Google Apps Script Backend** | **A** | C | C | C | C | **R** |
| **Stage 4: Frontend Development - Git** | **A** | I | I | I | I | **R** |
| **Stage 5: Google Drive Integration** | **A** | C | C | C | C | **R** |
| **Stage 6: System Integration** | **A** | C | C | C | C | **R** |
| **Stage 7: Offline-First Testing** | **A** | I | C | I | C | **R** |
| **Stage 8: Complete Testing & Optimization**| **A** | C | C | C | C | **R** |
| **Stage 9: Final Build & Git Push** | **A** | I | I | I | I | **R** |
| **Stage 10: Production Cutover & Handover**| **A** | I | I | I | I | **R** |

*Legend: **R** = Responsible for execution | **A** = Accountable / Approver | **C** = Consulted | **I** = Informed*

---

## 5. RISK MANAGEMENT & MITIGATION MATRIX

| Identified Risk | Severity | Probability | Mitigation Strategy Enforced |
| :--- | :---: | :---: | :--- |
| **Site Network Outage in Khordha** | High | High | Offline-first architecture: `beds_pending_mutations_queue` buffers transactions locally; auto-flushes on reconnection. |
| **Simultaneous Gate Movements / DB Collisions** | High | Medium | `LockService` 10-second wait locks serialize all writes; first-committed-wins policy blocks duplicate entries (`ALREADY_INSIDE`). |
| **Non-Negative Pay Violation on Advances** | Critical | Low | Deterministic formula enforces recovery cap: $\text{Recovery} \le \text{Gross} - \text{Statutory}$. Unrecovered balances roll forward. |
| **Unverified Personnel in High-Risk Zones** | Critical | Medium | 9-Discipline Engine automatically outputs `BLOCKED` for missing police or vertigo clearances. Zero security override permitted. |
| **Unauthorized Access to HR / Salary Data** | Critical | Low | SAM-2026 RBAC restricts HR portal strictly to `SUPER_ADMIN` and `admin.hr`. PII masking hides Aadhaar/Bank details for supervisors. |
| **Database Corruption or Accidental Sheet Deletion** | Critical | Low | Automated daily snapshot executed at 01:00 AM IST to Drive `07_EXECUTIVE_GOVERNANCE/BACKUP`; SHA-256 hash chain certifies integrity. |

---

## 6. DOCUMENT SIGN-OFF & EXECUTION COMMENCEMENT

This Roadmap and Implementation Plan serves as the binding operational protocol for the greenfield implementation of the **BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)** at JTRWF Khordha, Odisha.

All operational activities proceed strictly in accordance with Stages 1 through 10.
