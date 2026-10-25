# Chartered Accountancy (CA) Practice & Task Management System
### Enterprise Google Workspace Solution for CA Firms, Tax Consultants & Audit Practices
**Configured Primary Super Admin:** `insaf143@gmail.com`

---

## 🏛️ System Architecture Overview
This system is an enterprise-grade Practice Management & Statutory Compliance Suite designed for Chartered Accountancy firms. It combines Google Sheets as a high-integrity relational database with Google Apps Script (HTML Service / Web App) for a role-based, secure UI.

```
                          ┌─────────────────────────────┐
                          │   CLIENT-SIDE WEB APP UI    │
                          │  (Tailwind CSS + JS Engine) │
                          └──────────────┬──────────────┘
                                         │  google.script.run (RPC)
                                         ▼
                          ┌─────────────────────────────┐
                          │    APPS SCRIPT CONTROLLER   │
                          │   (RBAC & Business Logic)   │
                          └──────┬───────────────┬──────┘
                                 │               │
        Confidential Data Access │               │ File Storage
                                 ▼               ▼
        ┌────────────────────────────────┐   ┌───────────────────────────────┐
        │     GOOGLE SHEETS DATABASE     │   │      GOOGLE DRIVE STORAGE     │
        │  • DB_Users (RBAC Directory)   │   │  CA Practice Management Files │
        │  • DB_Clients (Confidential)   │   │   ├── [Client_Legal_Name]     │
        │  • DB_Tasks (Compliance Jobs)  │   │   │    └── [Task_ID]          │
        │  • DB_Activity_Log (Audit)     │   │        └── Deliverables & Ack │
        └────────────────────────────────┘   └───────────────────────────────┘
```

---

## 🔑 Role-Based Access Control (RBAC) Matrix

| Feature / Workspace Tab | Staff / Article Trainee | Partner / Manager | Super Admin (`insaf143@gmail.com`) |
| :--- | :---: | :---: | :---: |
| **My Workspace (Kanban & Table)** | ✅ (Assigned Tasks Only) | ✅ (Assigned Tasks) | ✅ (Full Firm Access) |
| **Start Task & Attach Working Papers** | ✅ | ✅ | ✅ |
| **Submit Filing Ack & Mark Completed** | ✅ (Sends to Partner) | ✅ | ✅ |
| **Partner Quality Review & Approval** | ❌ | ✅ | ✅ |
| **Firm KPI & TAT Analytics Dashboard** | ❌ | ✅ | ✅ |
| **Firm-Wide Tasks Master Grid** | ❌ | ✅ | ✅ |
| **Single Task Assignment** | ❌ | ✅ | ✅ |
| **Bulk Compliance Allocation (GSTR/ITR)**| ❌ | ✅ | ✅ |
| **Task Reassignment Window** | ❌ | ✅ | ✅ |
| **Client Master Directory (PAN/CIN)** | ❌ (Masked in Dropdowns)| ✅ | ✅ |
| **User & Team Management** | ❌ | ❌ | ✅ |
| **Activity Audit Logs** | ❌ | ✅ | ✅ |
| **Direct Google Sheets Backend Access** | ❌ (Strictly Blocked) | ❌ (Blocked) | ✅ (Full Owner Access) |

---

## 🚀 3-Minute Deployment Instructions

Follow these simple steps using your Google Account (`insaf143@gmail.com`):

### Step 1: Create a New Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) in your browser while signed in as `insaf143@gmail.com`.
2. Rename the spreadsheet to:
   ```
   CA Practice & Task Management System
   ```

### Step 2: Open Google Apps Script Editor
1. In the Google Sheets top menu, click **Extensions** > **Apps Script**.
2. Rename the project to `CA Practice Portal Engine`.

### Step 3: Copy the System Files
1. In the Apps Script left panel, open `Code.gs`.
   - Delete any default code inside.
   - Copy the entire contents of [`Code.gs`](file:///c:/Users/Public/OFFICE%20SUIT/Code.gs) and paste it into the editor.
2. Click the **+** icon (Add a file) next to "Files" > select **HTML**.
   - Name the file: `Index` (Apps Script automatically adds `.html`).
   - Delete default code.
   - Copy the entire contents of [`Index.html`](file:///c:/Users/Public/OFFICE%20SUIT/Index.html) and paste it into `Index.html`.
3. *(Optional)* Click Project Settings (gear icon) > Check **"Show 'appsscript.json' manifest file in editor"**.
   - Paste the contents of [`appsscript.json`](file:///c:/Users/Public/OFFICE%20SUIT/appsscript.json).
4. Click **Save** (floppy disk icon or `Ctrl + S`).

### Step 4: Run Database Initialization
1. In the Apps Script toolbar at the top, select the function dropdown and choose **`setupDatabase`**.
2. Click **Run**.
3. Google will show an **"Authorization Required"** dialog:
   - Click **Review permissions**.
   - Select your account `insaf143@gmail.com`.
   - Click **Advanced** > **Go to CA Practice Portal Engine (unsafe)**.
   - Click **Allow**.
4. The script will execute and automatically:
   - Create and format `DB_Users`, `DB_Clients`, `DB_Tasks`, and `DB_Activity_Log`.
   - Apply Corporate Navy headers, auto-filters, text-wrapping, and dropdown data validations.
   - Register `insaf143@gmail.com` as **Super Admin / Managing Partner**.
   - Seed sample clients, article trainees, and CA compliance tasks.
   - Create the Google Drive root folder: `CA Practice Management Files`.

### Step 5: Lock Sheets for RBAC
1. In the Apps Script function dropdown, select **`lockSheetsForRBAC`** and click **Run**.
2. This locks all 4 database sheets so only you (`insaf143@gmail.com`) can view/edit the raw sheet. All team staff are forced to interact exclusively through the Web App UI, ensuring strict client data confidentiality.

### Step 6: Deploy as Web Application
1. Click the blue **Deploy** button in the top right corner > select **New deployment**.
2. Click the gear icon next to "Select type" > select **Web app**.
3. Configure the deployment settings:
   - **Description**: `CA Practice Portal v1.0`
   - **Execute as**: **Me (insaf143@gmail.com)** *(Crucial: Ensures script interacts with the protected database on your behalf)*
   - **Who has access**: **Anyone with Google Account** (or *Anyone within your Workspace domain*)
4. Click **Deploy**.
5. Copy the **Web App URL** provided (e.g., `https://script.google.com/macros/s/.../exec`).
6. Bookmark this URL! Share this link with your managers, partners, and article trainees.

---

## 📁 Database Schema Details

### 1. `DB_Users`
- `User_ID`: Unique staff identifier (e.g. `USR-001`)
- `Full_Name`: User's legal name
- `Email`: Google Workspace / Gmail address
- `Role`: `Super_Admin` | `Partner/Manager` | `Staff/Article_Trainee`
- `Department`: Practice division (e.g. `Direct Tax`, `Audit & Assurance`, `Indirect Tax`)
- `Status`: `Active` | `Inactive`
- `Created_At`: Timestamp of user onboarding

### 2. `DB_Clients` (Confidential Master)
- `Client_ID`: Unique client code (e.g. `CLI-101`)
- `Client_Legal_Name`: Registered legal entity name
- `Trade_Name`: Commercial brand or trade style
- `Entity_Type`: `Private Ltd` | `LLP` | `Firm` | `Individual` | `Trust` | `Public Ltd`
- `PAN`: 10-character Permanent Account Number
- `GSTIN`: 15-character GST Identification Number
- `MCA_CIN`: Corporate Identification Number
- `Primary_Contact_Person`: Director, Partner, or Authorized Signatory
- `Mobile`: Contact telephone
- `Email`: Client accounts email
- `Assigned_Partner_ID`: Supervising partner
- `Billing_Group`: Retainer tier or engagement model
- `Portal_Credentials_Vault_Link`: Secure encrypted password vault URL
- `Status`: `Active` | `Inactive`

### 3. `DB_Tasks` (Compliance Workflow Engine)
- `Task_ID`: Sequential task code (e.g. `TSK-1001`)
- `Client_ID`: Foreign key to `DB_Clients`
- `Client_Name`: De-normalized client legal name
- `Service_Category`: `Direct Tax` | `Indirect Tax` | `Corporate / MCA` | `Audit & Assurance` | `Accounting & Advisory`
- `Sub_Task_Description`: Statutory form or engagement scope (e.g. `Monthly GSTR-3B Return Filing`, `Tax Audit Form 3CA/3CD`)
- `Financial_Year`: Relevant financial year (e.g. `FY 2024-25`)
- `Assessment_Year`: Assessment year or return period (e.g. `AY 2025-26`, `July 2024`)
- `Statutory_Due_Date`: Legal statutory cutoff date
- `Target_Completion_Date`: Firm's internal completion milestone
- `Priority`: `Urgent` | `High` | `Medium` | `Low`
- `Allocated_By_User_ID`: Partner or Manager who assigned the task
- `Assigned_To_User_ID`: Team member responsible
- `Assignment_Date`: Date of allocation
- `Status`: `Pending` | `In Progress` | `Review Required` | `Completed` | `On Hold`
- `Work_Notes`: Chronological notes, checklist details, and observations
- `Drive_Attachment_Folder_URL`: Google Drive folder containing working papers & acknowledgements
- `Completed_Timestamp`: Timestamp of completion / submission
- `Reviewer_Remarks`: Partner sign-off or rework instructions
- `Reassigned_From_User_ID`: Previous assignee (if reassigned)
- `Reassigned_Timestamp`: Reassignment timestamp

### 4. `DB_Activity_Log` (Audit Trail)
- `Log_ID`: Sequential audit identifier
- `Task_ID`: Task reference or system tag
- `User_Email`: Actor's email address
- `Action_Type`: `Created` | `Assigned` | `Reassigned` | `Status_Changed` | `Completed` | `Partner_Review`
- `Previous_Value`: State before change
- `New_Value`: Updated state and remarks
- `Timestamp`: Precise date-time of action

---

## 💼 Core Compliance Categories Supported

### 1. Direct Tax
- ITR-1 to ITR-7 Filings
- Advance Tax computations (Q1, Q2, Q3, Q4)
- TDS/TCS Quarterly Returns (24Q, 26Q, 27Q, 27EQ)
- Tax Audit Reports (Form 3CA/3CD & 3CB/3CD)
- Assessment & Scrutiny replies (Section 143/148)
- CIT(A) and ITAT Appeal representation

### 2. Indirect Tax (GST)
- Monthly GSTR-1 & GSTR-3B filings
- Annual Return GSTR-9 & Reconciliation Statement GSTR-9C
- GST Registrations and Amendments
- Letter of Undertaking (LUT) Annual Renewal
- E-Way Bill & E-Invoice reconciliations
- GST Show Cause Notice (SCN) replies

### 3. Corporate / MCA
- Annual ROC Filings: AOC-4 (Financials) & MGT-7/7A (Annual Return)
- Company / LLP Incomporations
- Director KYC (DIR-3 KYC Web & e-Form)
- Auditor Appointment (ADT-1) and Resignations (ADT-3)
- Board Resolutions and Secretarial Records

### 4. Audit & Assurance
- Statutory Audit of Financial Statements
- Internal Financial Controls (IFC) & Internal Audit
- Physical Stock Audit & Asset Verification
- Concurrent & Statutory Bank Branch Audit
- Forensic & Revenue Leakage Audits

### 5. Accounting & Advisory
- Monthly Bookkeeping & Bank Reconciliations
- Periodic Management Information System (MIS) Reports
- Payroll, PF & ESI Monthly Compliance
- Virtual CFO & Strategic Advisory

---

## 🔒 Confidentiality & Data Security Measures
1. **Zero Sheet Exposure for Staff**: By deploying the Web App with **"Execute as Me (insaf143@gmail.com)"**, staff members never receive direct edit or view permissions to the Google Spreadsheet backend.
2. **Encrypted Google Drive Hierarchies**: Every client task automatically receives an isolated Google Drive folder: `CA Practice Management Files / [Client_Name] / [Task_ID]`. Working papers, draft financial statements, and e-filing acknowledgements remain safely organized and backed up.
3. **ICAI Practice Audit Trail**: Every status change, task reassignment, and review remark is permanently written to `DB_Activity_Log`, satisfying quality control and professional standards.
