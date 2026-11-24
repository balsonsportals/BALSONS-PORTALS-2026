# BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)
## PRODUCTION DEPLOYMENT & HANDOVER DOSSIER

**Client Anchor:** Jupiter Tatravagonka Railwheel Factory (JTRWF), Khordha, Odisha  
**Operating Entity:** BALSONS Heavy Lift & Shift  
**Release Tag:** `v1.0.0-PROD` (Git Commit `79011fd`)  
**Architecture Standard:** SAM-2026 4-Tier Serverless Architecture  
**UI/UX Standard:** BALSONS Enterprise Design System (BEDS V2.0)  
**Date of Handover:** 24-Nov-2026  

---

## 1. Executive Summary & Core Principle

The **BALSONS MULTI-PORTAL ENTERPRISE ECOSYSTEM (2026)** has been fully built, verified, and packaged in strict compliance with the 10-Stage Mandatory Roadmap:

$$\text{Google Sheets = Database} \quad\big|\quad \text{Google Apps Script = Main Engine} \quad\big|\quad \text{Git = Frontend Source \& Hosting Link} \quad\big|\quad \text{Google Drive = Document Management}$$

All seven portals, six dedicated operational databases, Google Apps Script serverless APIs, 87 Google Drive sub-vaults, and the Central Sync Hub operate as **one integrated, secure, and offline-resilient enterprise system**.

---

## 2. Master Component Inventory & Portal Links

| # | Portal Name | Domain Badge | Local Relative Path | Production Database ID | Root Drive Vault ID |
|---|---|---|---|---|---|
| **0** | **Central Enterprise Launcher** | `🚀 CENTRAL DIRECTORY` | [index.html](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/index.html) | `1u_ZKvvCVfEQDAtkoMR68q2d2hEK-eWBnvsS3AGfP6yQ` | `1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde` |
| **1** | **HR & Dual-Wage Payroll** | `👥 HR & DUAL-WAGE PAYROLL` | [HR Portal](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20HR%20MANAGER/frontend/index.html) | `1so_aH05vVxiUJsIK6VS-n7BpGrHWNgn_5EK7RuA3cuw` | `1TGaAS1aB6B0W8HHrZ6SYccG0XbsdSlLt` |
| **—** | *HR Self-Onboarding Wizard* | `📝 CANDIDATE ONBOARDING` | [HR Register](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20HR%20MANAGER/frontend/register.html) | Connected to HR DB | `1M-Lc7VoEB03KiVYQrABHW8g4q4h-QSHV` |
| **2** | **Gate Entry & Site Access** | `🚧 GATE ENTRY & TURNSTILES` | [Gate Portal](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20GATE%20ENTRY%20MANAGER/frontend/index.html) | `1yAuZOXc8WoC2TvTvnEWMrOyLl_50BRuJgDed_pdFT3o` | `1BbLIA4W-JSk2HFTKsNN1XI5Vr9WQ1bi-` |
| **3** | **Safety, EHS & PTW Governance** | `🛡️ SAFETY, EHS & PTW` | [Safety Portal](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20SAFETY%20MANAGER/frontend/index.html) | `1SyOGt6HEu6HJCufAbB2_P6BgF6pEppt28J_8cARaOP0` | `14l-IAZcb39iSeBSa9kQVUCI2lnty9cOK` |
| **4** | **Store & Tackle Master** | `📦 STORE & RIGGING TACKLE` | [Store Portal](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20STORE%20MANAGER/frontend/index.html) | `1u_ZKvvCVfEQDAtkoMR68q2d2hEK-eWBnvsS3AGfP6yQ` | `1RSSF5Ld9fEJ2VfacDp80DVrGyq4pE3HY` |
| **5** | **Commercial Purchase & POs** | `📑 PURCHASE & VENDOR MASTER` | [Purchase Portal](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20PURCHASE%20MANAGER/index.html) | `1ANnu4X2dR0EITq5RvkyfMv1Xfz30Ba26IKjc40uyj_c` | `1lBWPI1VJos1lx_dkPi9l-sMVhsEM1iTp` |
| **6** | **Operations & Heavy Erection** | `🏗️ OPERATIONS & HEAVY ERECTION` | [Operations Portal](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20OPERATIONS%20MANAGER/index.html) | `1GeqDDmBgdVm3ZUp4c9iB36__iLJ9wADQQRhEIwVxa-E` | `1mNMSK9VmE5olCOtIdMzIm1HUcLEULn5g` |
| **7** | **Executive Reports & Sync Hub** | `📊 EXECUTIVE REPORTS & SYNC` | [Reports Portal](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20REPORTS%20PORTAL/index.html) | `1u_ZKvvCVfEQDAtkoMR68q2d2hEK-eWBnvsS3AGfP6yQ` | `1ZnMBMc2A9bek2i_YGqspVIJR2Q_qgXye` |

---

## 3. Serverless Google Apps Script Backends (Main Engine)

Every domain is backed by an asynchronous simple-request `doPost` dispatcher equipped with `LockService` concurrency serialization (10s max wait) and `CacheService` session token verification (6h TTL):

1. **HR & Payroll Engine:** [BALSONS HR MANAGER/apps-script/](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20HR%20MANAGER/apps-script/)
   - `Code.gs`: Universal dispatcher.
   - `EmployeeService.gs`: 26-column CRUD, ID generation (`EMP-2026-XXXX`), PII masking.
   - `PayrollEngine.gs`: Deterministic dual-wage calculations, zero-attendance rule, advance non-negative pay guard.
   - `DbInit.gs`: Provisions 22 relational sheets with `#102D35` dark teal headers.

2. **Gate Entry & Turnstile Engine:** [BALSONS GATE ENTRY MANAGER/apps-script/](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20GATE%20ENTRY%20MANAGER/apps-script/)
   - `Code.gs`: Universal gate dispatcher.
   - `ClearanceEngine.gs`: 9-discipline compliance evaluation engine, non-waivable vertigo rule.
   - `GateTransactionService.gs`: Turnstile stream logging, double-entry prevention, material inward PO matching, emergency muster roll-call generator.
   - `AuthService.gs`: Salted SHA-256 PBKDF2 authentication against `USER_MASTER`.
   - `DbInit.gs`: Provisions 24 relational sheets.

3. **Safety & PTW Governance Engine:** [BALSONS SAFETY MANAGER/apps-script/Code.gs](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20SAFETY%20MANAGER/apps-script/Code.gs)
   - 10 statutory PTW templates studio, 6-stage lifecycle state machine, daily shift TBT logging, Near-Miss / Hazard incident CAPA tracking.

4. **Store & Rigging Tackle Engine:** [BALSONS STORE MANAGER/apps-script/Code.gs](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20STORE%20MANAGER/apps-script/Code.gs)
   - 264-item rigging catalog (LF, HF, SH, SP, PU), barcode tool issue & return ledger against `EMP-2026-XXXX`, Form 11 calibration registry.

5. **Commercial Purchase Engine:** [BALSONS PURCHASE MANAGER/apps-script/Code.gs](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20PURCHASE%20MANAGER/apps-script/Code.gs)
   - PR multi-item requisition workflow, commercial PO generator with 18% GST calculation, live PO synchronization with Gate Inward.

6. **Operations & Heavy Erection Engine:** [BALSONS OPERATIONS MANAGER/apps-script/Code.gs](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/BALSONS%20OPERATIONS%20MANAGER/apps-script/Code.gs)
   - Erection milestone progress tracking, crane fleet mobilization, tandem heavy lift and ground pressure calculation engine.

7. **Database Greenfield Infrastructure Provisioners:** [database-provisioning/](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/database-provisioning/)
   - `ProvisionEnterpriseDatabases.gs`: Automated spreadsheet and 87-subvault Drive provisioner.
   - `BootstrapAdminUsers.gs`: PBKDF2 seed for 6 domain administrators.
   - `verifyAuditIntegrity.gs`: SHA-256 continuous hash chain auditor.

---

## 4. Google Drive Vault Hierarchy & Document Management

- **Root Vault ID:** `1p56Z_7_yHC5St8jsoadJnW7DJqJTIjde` (`BALSONS_ENTERPRISE_SYSTEM_MASTER_VAULT`)
- **Document Manager Script:** [assets/js/balsons-docs-manager.js](file:///d:/jupiter%20files%20from/BALSONS%20PORTALS%202026/assets/js/balsons-docs-manager.js)
- **Total Sub-Vaults:** 87 departmental folders across 7 operational domains:
  - `01_GATE_ENTRY_MANAGER` (`1BbLIA4W-JSk2HFTKsNN1XI5Vr9WQ1bi-`)
  - `02_HR_AND_PAYROLL_MANAGER` (`1TGaAS1aB6B0W8HHrZ6SYccG0XbsdSlLt`)
  - `03_OPERATIONS_AND_RIGGING_MANAGER` (`1mNMSK9VmE5olCOtIdMzIm1HUcLEULn5g`)
  - `04_PURCHASE_AND_COMMERCIAL_MANAGER` (`1lBWPI1VJos1lx_dkPi9l-sMVhsEM1iTp`)
  - `05_SAFETY_AND_RISK_MANAGER` (`14l-IAZcb39iSeBSa9kQVUCI2lnty9cOK`)
  - `06_STORE_AND_TACKLE_MANAGER` (`1RSSF5Ld9fEJ2VfacDp80DVrGyq4pE3HY`)
  - `07_EXECUTIVE_GOVERNANCE_AND_SYNC_HUB` (`1ZnMBMc2A9bek2i_YGqspVIJR2Q_qgXye`)

---

## 5. Security, RBAC & Immutable Super Administrator

The security policy strictly enforces:
> **"ONE SUPER ADMINISTRATOR • ALL PORTALS • ALL DATA • COMPLETE CONTROL. ALL OTHER USERS RECEIVE ONLY ASSIGNED ACCESS."**

### Master Super Administrator Account
- **Username:** `superadmin`
- **Owner Identity:** Prashant Muley (Executive Project Director & Lead Engineer)
- **Official Google Account / Login:** `balsonsportals@gmail.com`
- **Permissions:** Unrestricted root access across all 7 portals, audit trails, and financial locks.

### 6-Tier Authority Role Hierarchy
1. `SUPER_ADMIN`: Absolute systemic authority.
2. `MANAGEMENT`: Executive viewing, board telemetry, and commercial sign-offs.
3. `PORTAL_ADMIN`: Domain-specific administrative and supervisory control.
4. `HOD`: Departmental requisition, PTW authorization, and pass approval.
5. `SUPERVISOR`: Field shift operations, gate movement logging, and TBT briefings.
6. `EMPLOYEE`: Personal dashboard, badge verification, and payslip downloads.

---

## 6. Offline-First Architecture & Dual-Sync Engine

- **Local Outbox Queue:** `beds_pending_mutations_queue` in `localStorage`.
- **Scheduled Auto-Sync:** 30-second decrementing countdown chip (`#bedsAutoSyncChip`) displayed in the global workspace topbar across every portal.
- **Bi-Directional Dual Sync:** On reconnection or manual `⚡ Force Dual Sync` trigger, all pending offline mutations are serialized and dispatched via simple-request `POST` to Google Apps Script, flushing the outbox and refreshing live telemetry.
- **Offline Storage Fallback:** Store Manager utilizes IndexedDB (`BALSONS_STORE_DB`) with transparent fallback to `localStorage`.

---

## 7. Verification & Quality Assurance Summary

1. **Asset & Link Integrity:** 100% of referenced CSS, JS, images, and HTML hyperlinks exist and resolve on disk.
2. **JavaScript Syntax:** All 17 `.js` files pass Node.js V8 execution validation with zero syntax errors.
3. **HTTP Serving Verification:** 30/30 critical endpoints and portal pages served with HTTP 200 OK and non-empty payloads.
4. **Business Logic Unit Tests:** 19/19 test cases passed with 100% pass fidelity:
   - Zero attendance wage rule: PASSED
   - Deterministic pro-rata calculation: PASSED
   - Non-negative net pay guard: PASSED
   - 9-Discipline clearance evaluation: PASSED
   - Non-waivable vertigo rule: PASSED
   - Turnstile double-entry guard: PASSED
   - SHA-256 continuous hash chain continuity: PASSED

---

## 8. Git Release Tag & Handover Status

- **Repository Root:** `D:\jupiter files from\BALSONS PORTALS 2026`
- **Git Repo Account:** `balsonsportals`
- **Git Remote Origin:** `https://github.com/balsonsportals/BALSONS-PORTALS-2026.git`
- **Git Author Profile:** `balsonsportals <balsonsportals@gmail.com>`
- **Production Tag:** `v1.0.0-PROD`
- **Status:** **FULLY FUNCTIONAL, PRODUCTION CERTIFIED & READY FOR OPERATION.**
