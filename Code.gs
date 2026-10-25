/**
 * ==============================================================================
 * CHARTERED ACCOUNTANCY (CA) PRACTICE & TASK MANAGEMENT SYSTEM
 * Backend: Google Apps Script & Google Sheets Database
 * Frontend: Google Apps Script HTML Service Web App
 * Designed for: Multi-Partner CA Firms, Tax Consultants, and Audit Practices
 * Primary Super Admin: insaf143@gmail.com
 * ==============================================================================
 */

/**
 * Serves the HTML Web App UI
 */
function doGet(e) {
  try {
    let template;
    try {
      template = HtmlService.createTemplateFromFile("Index");
    } catch (e1) {
      try {
        template = HtmlService.createTemplateFromFile("Index.html");
      } catch (e2) {
        throw new Error("Could not find 'Index' HTML file in the Apps Script project. Please ensure you created an HTML file named 'Index' in Apps Script.");
      }
    }
    return template.evaluate()
      .setTitle(APP_TITLE || "CA Practice & Task Management System")
      .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput(
      "<div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;padding:32px;max-width:640px;margin:50px auto;border:1px solid #cbd5e1;border-radius:12px;background:#ffffff;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);'>" +
      "<h2 style='color:#1e3a8a;margin-top:0;display:flex;align-items:center;gap:10px;'>⚖️ CA Practice Management System</h2>" +
      "<div style='background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:6px;margin:20px 0;color:#991b1b;font-size:14px;'>" +
      "<strong>Initialization Notice:</strong> " + err.message +
      "</div>" +
      "<h4 style='color:#334155;margin-bottom:8px;'>How to Resolve in Apps Script:</h4>" +
      "<ol style='color:#475569;font-size:13px;line-height:1.8;padding-left:20px;'>" +
      "<li>In the Apps Script editor left panel, verify that a file named <strong>Index.html</strong> exists under <em>Files</em>.</li>" +
      "<li>If missing, click the <strong>+</strong> button next to Files &gt; select <strong>HTML</strong> &gt; enter <strong>Index</strong>.</li>" +
      "<li>Paste the complete contents of <code>Index.html</code> into it.</li>" +
      "<li>Click <strong>Save (Ctrl + S)</strong>.</li>" +
      "<li>Go to <strong>Deploy &gt; Manage deployments &gt; Edit (pencil icon) &gt; Select 'New version' &gt; Deploy</strong>.</li>" +
      "</ol>" +
      "</div>"
    );
  }
}

/**
 * Include helper for modular HTML/CSS/JS files if required
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


// --- GLOBAL CONFIGURATION & CONSTANTS ---
const APP_TITLE = "CA Practice & Task Management System";
const ROOT_DRIVE_FOLDER_NAME = "CA Practice Management Files";
const SUPER_ADMIN_FALLBACK_EMAIL = "insaf143@gmail.com";

// Sheet Names
const SHEETS = {
  USERS: "DB_Users",
  CLIENTS: "DB_Clients",
  TASKS: "DB_Tasks",
  LOGS: "DB_Activity_Log"
};

// Column Schema Definitions (1-indexed for Spreadsheet, 0-indexed for JS Arrays)
const COLS_USERS = [
  "User_ID", "Full_Name", "Email", "Role", "Department", "Status", "Created_At"
];

const COLS_CLIENTS = [
  "Client_ID", "Client_Legal_Name", "Trade_Name", "Entity_Type", "PAN", "GSTIN",
  "MCA_CIN", "Primary_Contact_Person", "Mobile", "Email", "Assigned_Partner_ID",
  "Billing_Group", "Portal_Credentials_Vault_Link", "Status"
];

const COLS_TASKS = [
  "Task_ID", "Client_ID", "Client_Name", "Service_Category", "Sub_Task_Description",
  "Financial_Year", "Assessment_Year", "Statutory_Due_Date", "Target_Completion_Date",
  "Priority", "Allocated_By_User_ID", "Assigned_To_User_ID", "Assignment_Date",
  "Status", "Work_Notes", "Drive_Attachment_Folder_URL", "Completed_Timestamp",
  "Reviewer_Remarks", "Reassigned_From_User_ID", "Reassigned_Timestamp"
];

const COLS_LOGS = [
  "Log_ID", "Task_ID", "User_Email", "Action_Type", "Previous_Value", "New_Value", "Timestamp"
];

// Service Taxonomy for Chartered Accountants
const CA_SERVICES_TAXONOMY = {
  "Direct Tax": [
    "ITR-1 (Sahaj - Salaried)",
    "ITR-2 (Capital Gains & Foreign Assets)",
    "ITR-3 (Business & Profession)",
    "ITR-4 (Sugam - Presumptive)",
    "ITR-5 (Firms / LLPs / AOPs)",
    "ITR-6 (Companies)",
    "ITR-7 (Trusts & Non-Profits)",
    "Advance Tax Computation & Payment (Q1/Q2/Q3/Q4)",
    "TDS/TCS Quarterly Return (24Q / 26Q / 27Q / 27EQ)",
    "Tax Audit Report (Form 3CA/3CD / 3CB/3CD)",
    "Income Tax Assessment / Scrutiny Reply (Sec 143/148)",
    "Income Tax Appeals (CIT(A) / ITAT Representation)"
  ],
  "Indirect Tax": [
    "Monthly GSTR-1 Return Filing",
    "Monthly GSTR-3B Return Filing",
    "Annual Return GSTR-9 Filing",
    "Reconciliation Statement GSTR-9C",
    "GST New Registration / Amendment",
    "Letter of Undertaking (LUT) Annual Filing",
    "E-Way Bill & E-Invoice Audit / Reconciliation",
    "GST Notice Reply & SCN Legal Representation"
  ],
  "Corporate / MCA": [
    "Annual MCA Filing: Financials (AOC-4 / AOC-4 XBRL)",
    "Annual MCA Filing: Annual Return (MGT-7 / MGT-7A)",
    "Private Limited / Section 8 / LLP Incorporation",
    "Director KYC Filing (DIR-3 KYC / Web KYC)",
    "Auditor Appointment / Resignation (ADT-1 / ADT-3)",
    "Board Resolutions & Secretarial Statutory Records"
  ],
  "Audit & Assurance": [
    "Statutory Audit of Financial Statements",
    "Internal Audit & Internal Financial Controls (IFC)",
    "Physical Stock Audit & Asset Verification",
    "Concurrent & Statutory Bank Branch Audit",
    "Forensic & Revenue Leakage Audit"
  ],
  "Accounting & Advisory": [
    "Monthly Bookkeeping & Bank Account Reconciliation",
    "Monthly / Quarterly Management Information System (MIS)",
    "Payroll, PF & ESI Monthly Compliance",
    "Virtual CFO & Strategic Financial Advisory",
    "Financial Due Diligence & Valuation"
  ]
};

// ==============================================================================
// 1. WEB APP ENTRY POINT & UI DISPATCHER
// ==============================================================================

// ==============================================================================
// 2. SPREADSHEET INITIALIZATION & RBAC LOCKDOWN
// ==============================================================================

/**
 * Adds custom menu in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("⚖️ CA Practice Suite")
    .addItem("1. Initialize & Seed Database", "setupDatabase")
    .addItem("2. Lock Sheets for Staff (RBAC)", "lockSheetsForRBAC")
    .addItem("3. Launch Web App URL", "showWebAppUrl")
    .addToUi();
}

/**
 * Displays the deployed web app URL to the user in a prompt
 */
function showWebAppUrl() {
  const ui = SpreadsheetApp.getUi();
  const url = ScriptApp.getService().getUrl();
  if (url) {
    ui.alert("Web App URL", "Access your CA Practice Management Portal at:\n\n" + url, ui.ButtonSet.OK);
  } else {
    ui.alert("Deployment Required", "Please click 'Deploy' > 'New deployment' > 'Web app' in Apps Script editor to get your portal link.", ui.ButtonSet.OK);
  }
}

/**
 * Creates and formats all sheets with professional styling, validations, and sample data.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create or retrieve sheets
  const sheetUsers = getOrCreateSheet(ss, SHEETS.USERS);
  const sheetClients = getOrCreateSheet(ss, SHEETS.CLIENTS);
  const sheetTasks = getOrCreateSheet(ss, SHEETS.TASKS);
  const sheetLogs = getOrCreateSheet(ss, SHEETS.LOGS);

  // Apply Headers and Formatting
  formatSheetHeader(sheetUsers, COLS_USERS);
  formatSheetHeader(sheetClients, COLS_CLIENTS);
  formatSheetHeader(sheetTasks, COLS_TASKS);
  formatSheetHeader(sheetLogs, COLS_LOGS);

  // Apply Data Validations
  applyDataValidations(sheetUsers, sheetTasks);

  // Seed Initial Users if empty
  if (sheetUsers.getLastRow() <= 1) {
    seedInitialUsers(sheetUsers);
  }

  // Seed Initial Clients if empty
  if (sheetClients.getLastRow() <= 1) {
    seedInitialClients(sheetClients);
  }

  // Seed Initial Tasks if empty
  if (sheetTasks.getLastRow() <= 1) {
    seedInitialTasks(sheetTasks);
  }

  // Ensure Root Drive Folder Exists
  getRootDriveFolder();

  // Log Setup Event
  logActivity("SYSTEM", "Setup", "", "Database initialized successfully");

  return { success: true, message: "CA Practice Management System initialized successfully!" };
}

/**
 * Helper to get or create sheet
 */
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Formats header row with Deep Navy CA Theme
 */
function formatSheetHeader(sheet, columns) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  
  const headerRange = sheet.getRange(1, 1, 1, columns.length);
  headerRange
    .setBackground("#1E3A8A") // Deep Corporate Navy Blue
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontFamily("Segoe UI")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
    
  sheet.setRowHeight(1, 34);
  sheet.setFrozenRows(1);

  // Enable text wrapping and auto resize
  for (let c = 1; c <= columns.length; c++) {
    sheet.setColumnWidth(c, 160);
  }
}

/**
 * Adds dropdown validations for Roles, Status, Priority in the Sheets backend
 */
function applyDataValidations(sheetUsers, sheetTasks) {
  // Roles validation on DB_Users Col 4 (Role)
  const roleRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Super_Admin", "Partner/Manager", "Staff/Article_Trainee"], true)
    .setAllowInvalid(false)
    .build();
  sheetUsers.getRange("D2:D500").setDataValidation(roleRule);

  // User Status validation on DB_Users Col 6 (Status)
  const userStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Active", "Inactive"], true)
    .setAllowInvalid(false)
    .build();
  sheetUsers.getRange("F2:F500").setDataValidation(userStatusRule);

  // Priority validation on DB_Tasks Col 10 (Priority)
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Urgent", "High", "Medium", "Low"], true)
    .setAllowInvalid(false)
    .build();
  sheetTasks.getRange("J2:J5000").setDataValidation(priorityRule);

  // Task Status validation on DB_Tasks Col 14 (Status)
  const taskStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "In Progress", "Review Required", "Completed", "On Hold"], true)
    .setAllowInvalid(false)
    .build();
  sheetTasks.getRange("N2:N5000").setDataValidation(taskStatusRule);
}

/**
 * Seeds Initial CA Practice Users (Including insaf143@gmail.com as Super Admin)
 */
function seedInitialUsers(sheet) {
  const now = new Date();
  const sampleUsers = [
    ["USR-001", "CA Insaf (Managing Partner)", SUPER_ADMIN_FALLBACK_EMAIL, "Super_Admin", "Executive & Advisory", "Active", now],
    ["USR-002", "CA Ramesh Sharma (Partner)", "partner.audit@firm.com", "Partner/Manager", "Audit & Assurance", "Active", now],
    ["USR-003", "Priya Sundaram (Manager)", "manager.gst@firm.com", "Partner/Manager", "Indirect Tax (GST)", "Active", now],
    ["USR-004", "Rahul Verma (Senior Article)", "article.tax1@firm.com", "Staff/Article_Trainee", "Direct Tax", "Active", now],
    ["USR-005", "Ananya Iyer (Article Trainee)", "article.audit1@firm.com", "Staff/Article_Trainee", "Statutory Audit", "Active", now],
    ["USR-006", "Karan Mehta (Article Trainee)", "article.mca@firm.com", "Staff/Article_Trainee", "Corporate / MCA", "Active", now]
  ];
  sheet.getRange(2, 1, sampleUsers.length, sampleUsers[0].length).setValues(sampleUsers);
}

/**
 * Seeds Initial CA Clients Master
 */
function seedInitialClients(sheet) {
  const sampleClients = [
    ["CLI-101", "Apex Infotech Solutions Pvt Ltd", "Apex Infotech", "Private Ltd", "AABCA1234F", "27AABCA1234F1Z5", "U72200MH2018PTC305891", "Vikram Shah", "+91 9820123456", "vikram@apexinfotech.in", "USR-001", "Tier-1 Corporate", "https://vault.firm.internal/apex", "Active"],
    ["CLI-102", "Bluecrest Global Logistics LLP", "Bluecrest Cargo", "LLP", "AADCB5678G", "29AADCB5678G1ZP", "AAE-1234", "Sunil Nair", "+91 9845098765", "sunil@bluecrestlogistics.com", "USR-002", "Monthly Retainer", "https://vault.firm.internal/bluecrest", "Active"],
    ["CLI-103", "Rajeshwar & Sons Jewellers", "Rajeshwar Jewellers", "Firm", "AAFFR9012K", "33AAFFR9012K1Z3", "", "Rajeshwar Gupta", "+91 9444154321", "accounts@rajeshwarjewels.com", "USR-001", "Standard SME", "https://vault.firm.internal/rajeshwar", "Active"],
    ["CLI-104", "Dr. Vikramaditya Singhania", "Singhania Heart Clinic", "Individual", "ABCPS3456L", "", "", "Dr. V. Singhania", "+91 9811234567", "dr.singhania@gmail.com", "USR-001", "HNI Tax", "https://vault.firm.internal/singhania", "Active"],
    ["CLI-105", "Sai Shanti Charitable Healthcare Trust", "Sai Shanti Hospital", "Trust", "AAATS7890M", "", "", "Mahesh Bhagat (Trustee)", "+91 9823055443", "trustee@saishanti.org", "USR-002", "Non-Profit / 12A", "https://vault.firm.internal/saishanti", "Active"],
    ["CLI-106", "Zenith Polymer Industries Pvt Ltd", "Zenith Polymers", "Private Ltd", "AABCZ4567P", "24AABCZ4567P1ZA", "U25200GJ2015PTC084123", "Bhavesh Patel", "+91 9825067890", "bpatel@zenithpolymers.com", "USR-003", "Tier-1 Corporate", "https://vault.firm.internal/zenith", "Active"]
  ];
  sheet.getRange(2, 1, sampleClients.length, sampleClients[0].length).setValues(sampleClients);
}

/**
 * Seeds Realistic Initial CA Tasks
 */
function seedInitialTasks(sheet) {
  const today = new Date();
  const formatYmd = (d) => Utilities.formatDate(d, Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd");
  
  const dOverdue = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
  const dDueSoon = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
  const dNextWeek = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
  const dNextMonth = new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000);

  const sampleTasks = [
    [
      "TSK-1001", "CLI-101", "Apex Infotech Solutions Pvt Ltd", "Indirect Tax",
      "Monthly GSTR-3B Return Filing", "FY 2024-25", "July 2024",
      formatYmd(dDueSoon), formatYmd(today), "Urgent",
      "USR-001", SUPER_ADMIN_FALLBACK_EMAIL, formatYmd(dOverdue),
      "In Progress", "Bank statements received. Purchase register ITC 2B recon underway.",
      "", "", "", "", ""
    ],
    [
      "TSK-1002", "CLI-102", "Bluecrest Global Logistics LLP", "Direct Tax",
      "Tax Audit Report (Form 3CA/3CD / 3CB/3CD)", "FY 2023-24", "AY 2024-25",
      formatYmd(dNextMonth), formatYmd(dNextWeek), "High",
      "USR-002", "article.audit1@firm.com", formatYmd(dOverdue),
      "Pending", "Ledger scrutiny completed. Clause 34 TDS breakdown requested from client accountant.",
      "", "", "", "", ""
    ],
    [
      "TSK-1003", "CLI-103", "Rajeshwar & Sons Jewellers", "Direct Tax",
      "Advance Tax Computation & Payment (Q1/Q2/Q3/Q4)", "FY 2024-25", "AY 2025-26",
      formatYmd(dOverdue), formatYmd(dOverdue), "Urgent",
      "USR-001", "article.tax1@firm.com", formatYmd(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
      "Pending", "Client provided provisional P&L. Tax liability calculation ready.",
      "", "", "", "", ""
    ],
    [
      "TSK-1004", "CLI-106", "Zenith Polymer Industries Pvt Ltd", "Corporate / MCA",
      "Annual MCA Filing: Financials (AOC-4 / AOC-4 XBRL)", "FY 2023-24", "AY 2024-25",
      formatYmd(dNextMonth), formatYmd(dNextWeek), "Medium",
      "USR-003", "article.mca@firm.com", formatYmd(today),
      "Pending", "Awaiting signed financial statements and Director's Report.",
      "", "", "", "", ""
    ],
    [
      "TSK-1005", "CLI-105", "Sai Shanti Charitable Healthcare Trust", "Audit & Assurance",
      "Statutory Audit of Financial Statements", "FY 2023-24", "AY 2024-25",
      formatYmd(dNextWeek), formatYmd(dDueSoon), "High",
      "USR-002", "article.audit1@firm.com", formatYmd(dOverdue),
      "Review Required", "Draft audit report prepared and uploaded for Partner review. Form 10B prepared.",
      "", "", "Draft Audit Report & Form 10B submitted. Ready for Partner signature.", "", ""
    ],
    [
      "TSK-1006", "CLI-104", "Dr. Vikramaditya Singhania", "Direct Tax",
      "ITR-3 (Business & Profession)", "FY 2023-24", "AY 2024-25",
      formatYmd(dDueSoon), formatYmd(dDueSoon), "Medium",
      "USR-001", SUPER_ADMIN_FALLBACK_EMAIL, formatYmd(dOverdue),
      "Completed", "ITR filed successfully. Ack No: 98765432101234. E-verified via Aadhaar OTP.",
      "", formatYmd(today), "Filing acknowledged and verified.", "", ""
    ]
  ];
  sheet.getRange(2, 1, sampleTasks.length, sampleTasks[0].length).setValues(sampleTasks);
}

/**
 * Locks Google Sheets so only Super Admin (insaf143@gmail.com) can edit directly.
 * All staff members must use the Web App, preventing confidential data leakage.
 */
function lockSheetsForRBAC() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const owner = ss.getOwner();
  const me = Session.getEffectiveUser().getEmail();
  
  const targetSheets = [SHEETS.USERS, SHEETS.CLIENTS, SHEETS.TASKS, SHEETS.LOGS];
  let protectedCount = 0;

  targetSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    // Remove existing protections on this sheet
    const existingProtections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    existingProtections.forEach(p => p.remove());

    // Create new sheet protection
    const protection = sheet.protect().setDescription("Strict RBAC Lockdown - CA Practice Suite");
    protection.setWarningOnly(false);

    // Only owner & effective script deployer can edit
    const editors = protection.getEditors();
    protection.removeEditors(editors);
    if (owner) {
      try { protection.addEditor(owner); } catch (e) {}
    }
    try { protection.addEditor(me); } catch (e) {}
    if (SUPER_ADMIN_FALLBACK_EMAIL) {
      try { protection.addEditor(SUPER_ADMIN_FALLBACK_EMAIL); } catch (e) {}
    }

    protectedCount++;
  });

  return {
    success: true,
    message: `Locked ${protectedCount} sheets. Only Super Admin has backend access. Staff must use the Web App.`
  };
}

// ==============================================================================
// 3. RBAC & USER CONTEXT PROVIDER
// ==============================================================================

/**
 * Detects current logged-in user and determines role and permissions.
 */
function getCurrentUserContext() {
  const activeEmail = (Session.getActiveUser().getEmail() || "").trim().toLowerCase();
  const effectiveEmail = (Session.getEffectiveUser().getEmail() || "").trim().toLowerCase();
  
  // Default fallback if activeEmail is blank in certain test environments
  const emailToLookup = activeEmail || effectiveEmail || SUPER_ADMIN_FALLBACK_EMAIL;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsers = ss.getSheetByName(SHEETS.USERS);

  // If DB_Users does not exist or has no data, treat as Super_Admin for initial setup
  if (!sheetUsers || sheetUsers.getLastRow() <= 1) {
    return {
      isAuthenticated: true,
      user_id: "USR-001",
      full_name: "CA Insaf (Managing Partner)",
      email: emailToLookup,
      role: "Super_Admin",
      department: "Executive & Tax",
      status: "Active",
      isSuperAdmin: true,
      isAdmin: true,
      isStaff: false
    };
  }

  const usersData = sheetUsers.getDataRange().getValues();
  // Col 0: User_ID, Col 1: Full_Name, Col 2: Email, Col 3: Role, Col 4: Department, Col 5: Status
  let matchedUser = null;
  for (let i = 1; i < usersData.length; i++) {
    const rowEmail = (usersData[i][2] || "").toString().trim().toLowerCase();
    if (rowEmail === emailToLookup) {
      matchedUser = {
        user_id: usersData[i][0],
        full_name: usersData[i][1],
        email: usersData[i][2],
        role: usersData[i][3],
        department: usersData[i][4],
        status: usersData[i][5]
      };
      break;
    }
  }

  // If user matches our primary Super Admin email, force Super_Admin role
  if (emailToLookup === SUPER_ADMIN_FALLBACK_EMAIL.toLowerCase()) {
    if (!matchedUser) {
      matchedUser = {
        user_id: "USR-001",
        full_name: "CA Insaf (Managing Partner)",
        email: SUPER_ADMIN_FALLBACK_EMAIL,
        role: "Super_Admin",
        department: "Executive & Tax",
        status: "Active"
      };
    } else {
      matchedUser.role = "Super_Admin";
    }
  }

  // If user not in DB_Users at all, check if they are the sheet owner/deployer
  if (!matchedUser) {
    if (emailToLookup === effectiveEmail) {
      matchedUser = {
        user_id: "USR-ADMIN",
        full_name: "Administrator",
        email: emailToLookup,
        role: "Super_Admin",
        department: "Administration",
        status: "Active"
      };
    } else {
      return {
        isAuthenticated: false,
        email: emailToLookup,
        role: "Unauthorized",
        message: "Your email address is not registered in the CA Practice Management System. Please contact the Managing Partner."
      };
    }
  }

  const isSuperAdmin = (matchedUser.role === "Super_Admin");
  const isAdmin = (isSuperAdmin || matchedUser.role === "Partner/Manager");
  const isStaff = (matchedUser.role === "Staff/Article_Trainee");

  return {
    isAuthenticated: true,
    user_id: matchedUser.user_id,
    full_name: matchedUser.full_name,
    email: matchedUser.email,
    role: matchedUser.role,
    department: matchedUser.department,
    status: matchedUser.status,
    isSuperAdmin: isSuperAdmin,
    isAdmin: isAdmin,
    isStaff: isStaff
  };
}

// ==============================================================================
// 4. TASK MANAGEMENT (CRUD & WORKFLOWS)
// ==============================================================================

/**
 * Returns tasks strictly according to RBAC.
 * Staff only get their own tasks. Partners/Super Admin get all or filtered.
 */
function getTasks(filters) {
  const user = getCurrentUserContext();
  if (!user.isAuthenticated) throw new Error("Unauthorized access.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  if (!sheetTasks || sheetTasks.getLastRow() <= 1) return [];

  const rawData = sheetTasks.getDataRange().getValues();
  const tasks = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    const task = {
      task_id: row[0],
      client_id: row[1],
      client_name: row[2],
      service_category: row[3],
      sub_task_description: row[4],
      financial_year: row[5],
      assessment_year: row[6],
      statutory_due_date: formatDateStr(row[7]),
      target_completion_date: formatDateStr(row[8]),
      priority: row[9],
      allocated_by_user_id: row[10],
      assigned_to_user_id: row[11],
      assignment_date: formatDateStr(row[12]),
      status: row[13],
      work_notes: row[14],
      drive_attachment_folder_url: row[15],
      completed_timestamp: formatDateStr(row[16]),
      reviewer_remarks: row[17],
      reassigned_from_user_id: row[18],
      reassigned_timestamp: formatDateStr(row[19])
    };

    // RBAC FILTERING:
    // If staff, only show tasks assigned to them (by email or user_id)
    if (user.isStaff) {
      const assignedTarget = (task.assigned_to_user_id || "").toLowerCase();
      const userEmail = (user.email || "").toLowerCase();
      const userId = (user.user_id || "").toLowerCase();

      if (assignedTarget !== userEmail && assignedTarget !== userId) {
        continue;
      }
    }

    // Optional filters applied by Admin/Super Admin
    if (filters) {
      if (filters.status && filters.status !== "All" && task.status !== filters.status) continue;
      if (filters.priority && filters.priority !== "All" && task.priority !== filters.priority) continue;
      if (filters.category && filters.category !== "All" && task.service_category !== filters.category) continue;
      if (filters.client_id && filters.client_id !== "All" && task.client_id !== filters.client_id) continue;
      if (filters.assignee && filters.assignee !== "All" && task.assigned_to_user_id !== filters.assignee) continue;
    }

    tasks.push(task);
  }

  // Sort tasks by Statutory Due Date ascending
  tasks.sort((a, b) => {
    if (!a.statutory_due_date) return 1;
    if (!b.statutory_due_date) return -1;
    return new Date(a.statutory_due_date) - new Date(b.statutory_due_date);
  });

  return tasks;
}

/**
 * Creates a single task. Admin/Super Admin only.
 */
function createTask(taskData) {
  const user = getCurrentUserContext();
  if (!user.isAdmin) throw new Error("Only Partners, Managers, and Super Admin can allocate tasks.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  
  const taskId = generateUniqueId("TSK", sheetTasks);
  const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd");

  // Create dedicated Drive folder structure for the task
  let driveFolderUrl = "";
  try {
    const folder = getOrCreateTaskFolder(taskData.client_name, taskId);
    driveFolderUrl = folder.getUrl();
  } catch (err) {
    Logger.log("Drive folder creation note: " + err.message);
  }

  const rowData = [
    taskId,
    taskData.client_id || "",
    taskData.client_name || "",
    taskData.service_category || "",
    taskData.sub_task_description || "",
    taskData.financial_year || "",
    taskData.assessment_year || "",
    taskData.statutory_due_date || "",
    taskData.target_completion_date || "",
    taskData.priority || "Medium",
    user.user_id || user.email,
    taskData.assigned_to_user_id || "",
    todayStr,
    "Pending",
    taskData.work_notes || "",
    driveFolderUrl,
    "", // Completed_Timestamp
    "", // Reviewer_Remarks
    "", // Reassigned_From_User_ID
    ""  // Reassigned_Timestamp
  ];

  sheetTasks.appendRow(rowData);

  // Log activity
  logActivity(taskId, "Created", "", `Task created and assigned to ${taskData.assigned_to_user_id}`);

  // Send assignment notification email
  sendTaskNotificationEmail(taskData.assigned_to_user_id, "New Task Assigned: " + taskData.sub_task_description, {
    task_id: taskId,
    client: taskData.client_name,
    category: taskData.service_category,
    task: taskData.sub_task_description,
    due_date: taskData.statutory_due_date,
    priority: taskData.priority,
    notes: taskData.work_notes,
    folder_url: driveFolderUrl
  });

  return { success: true, task_id: taskId, folder_url: driveFolderUrl };
}

/**
 * Bulk creates tasks for recurring compliance across multiple clients.
 */
function bulkCreateTasks(bulkData) {
  const user = getCurrentUserContext();
  if (!user.isAdmin) throw new Error("Only Partners, Managers, and Super Admin can bulk allocate tasks.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  
  const clientList = bulkData.clients || []; // array of { client_id, client_name }
  const assignees = bulkData.assignees || []; // array of user emails or IDs
  const serviceCategory = bulkData.service_category;
  const subTask = bulkData.sub_task_description;
  const finYear = bulkData.financial_year;
  const period = bulkData.assessment_year;
  const statDueDate = bulkData.statutory_due_date;
  const targetDueDate = bulkData.target_completion_date;
  const priority = bulkData.priority || "Medium";
  const notes = bulkData.work_notes || "";
  const allocationMode = bulkData.allocation_mode || "RoundRobin"; // "Single" or "RoundRobin"

  if (clientList.length === 0) throw new Error("No clients selected.");
  if (assignees.length === 0) throw new Error("No staff members selected for allocation.");

  const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd");
  const newRows = [];
  let currentLastRow = sheetTasks.getLastRow();

  clientList.forEach((c, idx) => {
    const nextNum = 1000 + currentLastRow + idx;
    const taskId = `TSK-${nextNum}`;
    
    // Determine assignee
    let assignedTo = assignees[0];
    if (allocationMode === "RoundRobin") {
      assignedTo = assignees[idx % assignees.length];
    }

    newRows.push([
      taskId,
      c.client_id,
      c.client_name,
      serviceCategory,
      subTask,
      finYear,
      period,
      statDueDate,
      targetDueDate,
      priority,
      user.user_id || user.email,
      assignedTo,
      todayStr,
      "Pending",
      notes,
      "", // Drive folder generated on-demand
      "", "", "", ""
    ]);
  });

  if (newRows.length > 0) {
    sheetTasks.getRange(currentLastRow + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    
    // Log Bulk Action
    logActivity("BULK-JOB", "Bulk_Created", "", `Bulk allocated ${newRows.length} tasks for category ${serviceCategory} (${subTask})`);
  }

  return { success: true, count: newRows.length };
}

/**
 * Reassigns an existing task to another team member with reason tracking.
 */
function reassignTask(taskId, newAssigneeEmail, reason) {
  const user = getCurrentUserContext();
  if (!user.isAdmin) throw new Error("Only Partners/Managers and Super Admin can reassign tasks.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  const data = sheetTasks.getDataRange().getValues();

  let targetRowIdx = -1;
  let oldAssignee = "";
  let clientName = "";
  let taskDesc = "";

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      targetRowIdx = i + 1; // 1-based index
      clientName = data[i][2];
      taskDesc = data[i][4];
      oldAssignee = data[i][11];
      break;
    }
  }

  if (targetRowIdx === -1) throw new Error("Task not found: " + taskId);

  const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd HH:mm");

  // Update Col 12 (Assigned_To), Col 19 (Reassigned_From), Col 20 (Reassigned_Timestamp)
  sheetTasks.getRange(targetRowIdx, 12).setValue(newAssigneeEmail);
  sheetTasks.getRange(targetRowIdx, 19).setValue(oldAssignee);
  sheetTasks.getRange(targetRowIdx, 20).setValue(nowStr);

  // Append reassign reason to work notes (Col 15)
  const currentNotes = sheetTasks.getRange(targetRowIdx, 15).getValue();
  const updatedNotes = (currentNotes ? currentNotes + "\n" : "") + `[Reassigned on ${nowStr} by ${user.full_name} (${user.email}) from ${oldAssignee} to ${newAssigneeEmail}. Reason: ${reason}]`;
  sheetTasks.getRange(targetRowIdx, 15).setValue(updatedNotes);

  // Log activity
  logActivity(taskId, "Reassigned", oldAssignee, `${newAssigneeEmail} (Reason: ${reason})`);

  // Send email alerts to both old and new assignees
  sendTaskNotificationEmail(newAssigneeEmail, `Task Reassigned to You: ${taskId} - ${taskDesc}`, {
    task_id: taskId,
    client: clientName,
    task: taskDesc,
    reassigned_by: user.full_name,
    reason: reason
  });

  sendTaskNotificationEmail(oldAssignee, `Task Reassigned: ${taskId} - ${taskDesc}`, {
    task_id: taskId,
    client: clientName,
    task: taskDesc,
    reassigned_by: user.full_name,
    reason: `This task has been handed over to ${newAssigneeEmail}. Reason: ${reason}`
  });

  return { success: true, message: `Task ${taskId} successfully reassigned to ${newAssigneeEmail}.` };
}

/**
 * Updates task status, work notes, and completion details.
 * Used by Staff to Start, add Working Papers, and Submit for Partner Review.
 */
function updateTaskStatus(taskId, newStatus, workNotes, filingAckNo, fileDataList) {
  const user = getCurrentUserContext();
  if (!user.isAuthenticated) throw new Error("Unauthorized.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  const data = sheetTasks.getDataRange().getValues();

  let targetRowIdx = -1;
  let currentTask = null;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      targetRowIdx = i + 1;
      currentTask = {
        client_name: data[i][2],
        sub_task: data[i][4],
        assigned_to: data[i][11],
        current_status: data[i][13],
        notes: data[i][14],
        drive_folder: data[i][15],
        allocated_by: data[i][10]
      };
      break;
    }
  }

  if (targetRowIdx === -1) throw new Error("Task not found: " + taskId);

  // RBAC Check: Staff can only update their own tasks
  if (user.isStaff) {
    const assigned = (currentTask.assigned_to || "").toLowerCase();
    if (assigned !== user.email.toLowerCase() && assigned !== user.user_id.toLowerCase()) {
      throw new Error("You are not authorized to modify this task.");
    }
  }

  const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd HH:mm");

  // Handle File Uploads to Drive
  let folderUrl = currentTask.drive_folder;
  if (fileDataList && fileDataList.length > 0) {
    const folder = getOrCreateTaskFolder(currentTask.client_name, taskId);
    folderUrl = folder.getUrl();
    sheetTasks.getRange(targetRowIdx, 16).setValue(folderUrl);

    fileDataList.forEach(f => {
      try {
        const decodedBytes = Utilities.base64Decode(f.base64);
        const blob = Utilities.newBlob(decodedBytes, f.mimeType, f.fileName);
        folder.createFile(blob);
      } catch (err) {
        Logger.log("Error saving file: " + err.message);
      }
    });
  }

  // Update Status in Col 14
  const oldStatus = currentTask.current_status;
  sheetTasks.getRange(targetRowIdx, 14).setValue(newStatus);

  // Update Work Notes in Col 15
  let updatedNotes = currentTask.notes || "";
  if (workNotes) {
    updatedNotes = (updatedNotes ? updatedNotes + "\n" : "") + `[${nowStr} - ${user.full_name}]: ${workNotes}`;
  }
  if (filingAckNo) {
    updatedNotes = (updatedNotes ? updatedNotes + "\n" : "") + `[Acknowledgement / Challan / BSR]: ${filingAckNo}`;
  }
  sheetTasks.getRange(targetRowIdx, 15).setValue(updatedNotes);

  // If status is "Review Required" or "Completed", set Completed_Timestamp (Col 17)
  if (newStatus === "Review Required" || newStatus === "Completed") {
    sheetTasks.getRange(targetRowIdx, 17).setValue(nowStr);
  }

  // Log activity
  logActivity(taskId, "Status_Changed", oldStatus, `${newStatus} by ${user.full_name}`);

  // If submitted for review, notify allocating partner/manager
  if (newStatus === "Review Required" && currentTask.allocated_by) {
    sendTaskNotificationEmail(currentTask.allocated_by, `Review Required: ${taskId} - ${currentTask.sub_task}`, {
      task_id: taskId,
      client: currentTask.client_name,
      task: currentTask.sub_task,
      submitted_by: user.full_name,
      ack: filingAckNo,
      notes: workNotes,
      folder_url: folderUrl
    });
  }

  return { success: true, task_id: taskId, new_status: newStatus, folder_url: folderUrl };
}

/**
 * Partner Review Action: Approve (Mark Completed) or Request Rework (In Progress with remarks)
 */
function partnerReviewTask(taskId, reviewAction, remarks) {
  const user = getCurrentUserContext();
  if (!user.isAdmin) throw new Error("Only Partners/Managers and Super Admin can review tasks.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  const data = sheetTasks.getDataRange().getValues();

  let targetRowIdx = -1;
  let assignedTo = "";
  let subTask = "";
  let clientName = "";

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      targetRowIdx = i + 1;
      clientName = data[i][2];
      subTask = data[i][4];
      assignedTo = data[i][11];
      break;
    }
  }

  if (targetRowIdx === -1) throw new Error("Task not found: " + taskId);

  const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd HH:mm");
  const newStatus = (reviewAction === "Approve") ? "Completed" : "In Progress";

  sheetTasks.getRange(targetRowIdx, 14).setValue(newStatus);
  sheetTasks.getRange(targetRowIdx, 18).setValue(`[${reviewAction} by ${user.full_name} on ${nowStr}]: ${remarks}`);

  // Log activity
  logActivity(taskId, "Partner_Review", reviewAction, `${newStatus} (Remarks: ${remarks})`);

  // Notify staff member
  sendTaskNotificationEmail(assignedTo, `Task Review Result: ${taskId} [${reviewAction}]`, {
    task_id: taskId,
    client: clientName,
    task: subTask,
    reviewer: user.full_name,
    result: reviewAction,
    remarks: remarks
  });

  return { success: true, message: `Task ${taskId} marked as ${newStatus}.` };
}

// ==============================================================================
// 5. CLIENTS MANAGEMENT (MASTER DIRECTORY)
// ==============================================================================

/**
 * Returns Client Master list. Confidential: Viewable only by Partners & Super Admin.
 */
function getClients() {
  const user = getCurrentUserContext();
  if (!user.isAuthenticated) throw new Error("Unauthorized.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetClients = ss.getSheetByName(SHEETS.CLIENTS);
  if (!sheetClients || sheetClients.getLastRow() <= 1) return [];

  const rawData = sheetClients.getDataRange().getValues();
  const clients = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];

    // If Staff, return only minimal identification for task assignment dropdowns, hiding vault credentials
    if (user.isStaff) {
      clients.push({
        client_id: row[0],
        client_legal_name: row[1],
        trade_name: row[2],
        entity_type: row[3],
        status: row[13]
      });
      continue;
    }

    // Full confidential access for Partners and Super Admin
    clients.push({
      client_id: row[0],
      client_legal_name: row[1],
      trade_name: row[2],
      entity_type: row[3],
      pan: row[4],
      gstin: row[5],
      mca_cin: row[6],
      primary_contact_person: row[7],
      mobile: row[8],
      email: row[9],
      assigned_partner_id: row[10],
      billing_group: row[11],
      portal_credentials_vault_link: row[12],
      status: row[13]
    });
  }

  return clients;
}

/**
 * Saves or updates a client record (Partners / Super Admin only).
 */
function saveClient(clientData) {
  const user = getCurrentUserContext();
  if (!user.isAdmin) throw new Error("Confidential: Only Partners and Super Admin can manage clients.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetClients = ss.getSheetByName(SHEETS.CLIENTS);
  const data = sheetClients.getDataRange().getValues();

  let isUpdate = false;
  let targetRowIdx = -1;
  const clientId = clientData.client_id || generateUniqueId("CLI", sheetClients);

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clientId) {
      isUpdate = true;
      targetRowIdx = i + 1;
      break;
    }
  }

  const rowData = [
    clientId,
    clientData.client_legal_name || "",
    clientData.trade_name || "",
    clientData.entity_type || "Private Ltd",
    clientData.pan || "",
    clientData.gstin || "",
    clientData.mca_cin || "",
    clientData.primary_contact_person || "",
    clientData.mobile || "",
    clientData.email || "",
    clientData.assigned_partner_id || user.user_id,
    clientData.billing_group || "Standard",
    clientData.portal_credentials_vault_link || "",
    clientData.status || "Active"
  ];

  if (isUpdate) {
    sheetClients.getRange(targetRowIdx, 1, 1, rowData.length).setValues([rowData]);
    logActivity("CLIENT", "Updated", clientId, `Updated client ${clientData.client_legal_name}`);
  } else {
    sheetClients.appendRow(rowData);
    logActivity("CLIENT", "Created", "", `Added new client ${clientData.client_legal_name} (${clientId})`);
  }

  return { success: true, client_id: clientId };
}

// ==============================================================================
// 6. USER & TEAM MANAGEMENT (SUPER ADMIN ONLY)
// ==============================================================================

/**
 * Returns team members. Super Admin sees all. Partners see active staff for assignment.
 */
function getUsers() {
  const user = getCurrentUserContext();
  if (!user.isAuthenticated) throw new Error("Unauthorized.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsers = ss.getSheetByName(SHEETS.USERS);
  if (!sheetUsers || sheetUsers.getLastRow() <= 1) return [];

  const rawData = sheetUsers.getDataRange().getValues();
  const users = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    users.push({
      user_id: row[0],
      full_name: row[1],
      email: row[2],
      role: row[3],
      department: row[4],
      status: row[5],
      created_at: formatDateStr(row[6])
    });
  }

  return users;
}

/**
 * Adds or modifies a user (Super Admin only).
 */
function saveUser(userData) {
  const user = getCurrentUserContext();
  if (!user.isSuperAdmin) throw new Error("Security Alert: Only Managing Partner (Super Admin) can manage firm users.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsers = ss.getSheetByName(SHEETS.USERS);
  const data = sheetUsers.getDataRange().getValues();

  let isUpdate = false;
  let targetRowIdx = -1;
  const userId = userData.user_id || generateUniqueId("USR", sheetUsers);

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId || data[i][2].toString().toLowerCase() === userData.email.toLowerCase()) {
      isUpdate = true;
      targetRowIdx = i + 1;
      break;
    }
  }

  const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd");
  const rowData = [
    userId,
    userData.full_name || "",
    userData.email.toLowerCase().trim(),
    userData.role || "Staff/Article_Trainee",
    userData.department || "General Practice",
    userData.status || "Active",
    isUpdate ? data[targetRowIdx - 1][6] : todayStr
  ];

  if (isUpdate) {
    sheetUsers.getRange(targetRowIdx, 1, 1, rowData.length).setValues([rowData]);
    logActivity("USER", "Updated", userId, `Updated user ${userData.full_name} (${userData.role})`);
  } else {
    sheetUsers.appendRow(rowData);
    logActivity("USER", "Created", "", `Created user ${userData.full_name} with role ${userData.role}`);
  }

  return { success: true, user_id: userId };
}

// ==============================================================================
// 7. KPI & EXECUTIVE DASHBOARD ANALYTICS
// ==============================================================================

/**
 * Calculates firm-wide and user-specific KPIs.
 */
function getKPIDashboardData() {
  const user = getCurrentUserContext();
  if (!user.isAuthenticated) throw new Error("Unauthorized.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  const sheetUsers = ss.getSheetByName(SHEETS.USERS);

  const stats = {
    total_tasks: 0,
    pending: 0,
    in_progress: 0,
    review_required: 0,
    completed: 0,
    on_hold: 0,
    overdue_tasks: 0,
    due_this_week: 0,
    completed_today: 0,
    category_counts: {
      "Direct Tax": 0,
      "Indirect Tax": 0,
      "Corporate / MCA": 0,
      "Audit & Assurance": 0,
      "Accounting & Advisory": 0,
      "Other": 0
    },
    staff_performance: [],
    monthly_trend: {}
  };

  if (!sheetTasks || sheetTasks.getLastRow() <= 1) return stats;

  const tasksData = sheetTasks.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd");

  const staffMap = {};

  for (let i = 1; i < tasksData.length; i++) {
    const row = tasksData[i];
    const status = row[13] || "Pending";
    const category = row[3] || "Other";
    const statDueDateStr = formatDateStr(row[7]);
    const completedTimestampStr = formatDateStr(row[16]);
    const assignedTo = (row[11] || "Unassigned").toLowerCase();
    const assignmentDateStr = formatDateStr(row[12]);

    // RBAC: If staff, count only their own tasks
    if (user.isStaff) {
      if (assignedTo !== user.email.toLowerCase() && assignedTo !== user.user_id.toLowerCase()) {
        continue;
      }
    }

    stats.total_tasks++;

    // Status aggregation
    if (status === "Pending") stats.pending++;
    else if (status === "In Progress") stats.in_progress++;
    else if (status === "Review Required") stats.review_required++;
    else if (status === "Completed") stats.completed++;
    else if (status === "On Hold") stats.on_hold++;

    // Category aggregation
    if (stats.category_counts[category] !== undefined) {
      stats.category_counts[category]++;
    } else {
      stats.category_counts["Other"]++;
    }

    // Overdue Calculation (Statutory Due Date is in the past AND status != Completed)
    let isOverdue = false;
    if (statDueDateStr && status !== "Completed") {
      const dueDate = new Date(statDueDateStr);
      if (dueDate < today) {
        stats.overdue_tasks++;
        isOverdue = true;
      } else if (dueDate <= nextWeek) {
        stats.due_this_week++;
      }
    }

    // Completed Today
    if (status === "Completed" && completedTimestampStr && completedTimestampStr.startsWith(todayStr)) {
      stats.completed_today++;
    }

    // Staff Performance Tracking (for Partners & Super Admin)
    if (!staffMap[assignedTo]) {
      staffMap[assignedTo] = {
        assignee: assignedTo,
        total: 0,
        pending: 0,
        in_progress: 0,
        review_required: 0,
        completed: 0,
        overdue: 0,
        tat_days_sum: 0,
        tat_count: 0,
        on_time_completions: 0
      };
    }

    const s = staffMap[assignedTo];
    s.total++;
    if (status === "Pending") s.pending++;
    else if (status === "In Progress") s.in_progress++;
    else if (status === "Review Required") s.review_required++;
    else if (status === "Completed") {
      s.completed++;
      
      // Calculate Turnaround Time (TAT) in days
      if (assignmentDateStr && completedTimestampStr) {
        const dAssign = new Date(assignmentDateStr);
        const dComp = new Date(completedTimestampStr);
        const diffDays = Math.max(0, Math.round((dComp - dAssign) / (1000 * 60 * 60 * 24)));
        s.tat_days_sum += diffDays;
        s.tat_count++;
      }

      // Check Statutory Deadline Adherence
      if (statDueDateStr && completedTimestampStr) {
        const dStat = new Date(statDueDateStr);
        const dComp = new Date(completedTimestampStr.split(" ")[0]);
        if (dComp <= dStat) {
          s.on_time_completions++;
        }
      }
    }

    if (isOverdue) s.overdue++;
  }

  // Finalize Staff Performance Stats
  Object.keys(staffMap).forEach(key => {
    const s = staffMap[key];
    const avgTat = s.tat_count > 0 ? (s.tat_days_sum / s.tat_count).toFixed(1) : "N/A";
    const onTimeRate = s.completed > 0 ? Math.round((s.on_time_completions / s.completed) * 100) : 100;

    stats.staff_performance.push({
      assignee: s.assignee,
      total: s.total,
      pending: s.pending,
      in_progress: s.in_progress,
      review_required: s.review_required,
      completed: s.completed,
      overdue: s.overdue,
      avg_tat_days: avgTat,
      adherence_rate: onTimeRate
    });
  });

  return stats;
}

// ==============================================================================
// 8. GOOGLE DRIVE FOLDER & FILE MANAGEMENT
// ==============================================================================

/**
 * Gets or creates the Root Folder for CA Practice Files in Google Drive
 */
function getRootDriveFolder() {
  const folders = DriveApp.getFoldersByName(ROOT_DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(ROOT_DRIVE_FOLDER_NAME);
}

/**
 * Creates or retrieves Client and Task subfolder:
 * Root / [Client_Legal_Name] / [Task_ID]
 */
function getOrCreateTaskFolder(clientName, taskId) {
  const root = getRootDriveFolder();
  const safeClientName = (clientName || "General Clients").replace(/[\/\\:*?"<>|]/g, "_");
  
  // Find or create Client Folder
  let clientFolder;
  const clientFolders = root.getFoldersByName(safeClientName);
  if (clientFolders.hasNext()) {
    clientFolder = clientFolders.next();
  } else {
    clientFolder = root.createFolder(safeClientName);
  }

  // Find or create Task Folder
  let taskFolder;
  const taskFolders = clientFolder.getFoldersByName(taskId);
  if (taskFolders.hasNext()) {
    taskFolder = taskFolders.next();
  } else {
    taskFolder = clientFolder.createFolder(taskId);
  }

  return taskFolder;
}

/**
 * Uploads a file directly into the Task's Google Drive Folder
 */
function uploadTaskFile(taskId, clientName, base64Data, fileName, mimeType) {
  const user = getCurrentUserContext();
  if (!user.isAuthenticated) throw new Error("Unauthorized.");

  const folder = getOrCreateTaskFolder(clientName, taskId);
  const decoded = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decoded, mimeType, fileName);
  const file = folder.createFile(blob);
  
  // Update task Drive link if empty
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetTasks = ss.getSheetByName(SHEETS.TASKS);
  const data = sheetTasks.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      if (!data[i][15]) {
        sheetTasks.getRange(i + 1, 16).setValue(folder.getUrl());
      }
      break;
    }
  }

  logActivity(taskId, "Attachment_Uploaded", "", `${fileName} uploaded by ${user.full_name}`);

  return {
    success: true,
    file_id: file.getId(),
    file_name: fileName,
    file_url: file.getUrl(),
    folder_url: folder.getUrl()
  };
}

// ==============================================================================
// 9. ACTIVITY AUDIT LOGGING
// ==============================================================================

/**
 * Logs an activity into DB_Activity_Log
 */
function logActivity(taskId, actionType, prevVal, newVal) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetLogs = ss.getSheetByName(SHEETS.LOGS);
    if (!sheetLogs) return;

    const userEmail = (Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || "System").toLowerCase();
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    const logId = "LOG-" + new Date().getTime();

    sheetLogs.appendRow([
      logId,
      taskId,
      userEmail,
      actionType,
      prevVal ? prevVal.toString() : "",
      newVal ? newVal.toString() : "",
      nowStr
    ]);
  } catch (err) {
    Logger.log("Activity log failure: " + err.message);
  }
}

/**
 * Returns recent activity audit logs
 */
function getActivityLogs(limit) {
  const user = getCurrentUserContext();
  if (!user.isAdmin) throw new Error("Only Partners/Managers and Super Admin can view audit logs.");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetLogs = ss.getSheetByName(SHEETS.LOGS);
  if (!sheetLogs || sheetLogs.getLastRow() <= 1) return [];

  const raw = sheetLogs.getDataRange().getValues();
  const max = limit || 50;
  const logs = [];

  for (let i = raw.length - 1; i >= 1 && logs.length < max; i--) {
    logs.push({
      log_id: raw[i][0],
      task_id: raw[i][1],
      user_email: raw[i][2],
      action_type: raw[i][3],
      previous_value: raw[i][4],
      new_value: raw[i][5],
      timestamp: formatDateStr(raw[i][6])
    });
  }

  return logs;
}

// ==============================================================================
// 10. NOTIFICATIONS & EMAIL HELPER
// ==============================================================================

/**
 * Sends professional HTML notification emails to CA team members
 */
function sendTaskNotificationEmail(toEmail, subject, details) {
  if (!toEmail || !toEmail.includes("@")) return;

  try {
    const webAppUrl = ScriptApp.getService().getUrl() || "";
    let body = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #1e3a8a; padding: 20px 24px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">⚖️ CA PRACTICE MANAGEMENT ALERT</h2>
          </div>
          <div style="padding: 24px;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">${escapeHtml(subject)}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
    `;

    Object.keys(details).forEach(key => {
      const label = key.replace(/_/g, " ").toUpperCase();
      const val = details[key];
      if (val) {
        body += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; font-weight: 600; color: #64748b; width: 35%;">${label}</td>
            <td style="padding: 8px 0; color: #1e293b;">${escapeHtml(String(val))}</td>
          </tr>
        `;
      }
    });

    body += `
            </table>
    `;

    if (webAppUrl) {
      body += `
            <div style="margin-top: 24px; text-align: center;">
              <a href="${webAppUrl}" style="background-color: #1e3a8a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Open CA Practice Portal</a>
            </div>
      `;
    }

    body += `
            <div style="margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
              This is an automated workflow notification from Chartered Accountancy Practice & Task Management System.
            </div>
          </div>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: toEmail,
      subject: `[CA Task Alert] ${subject}`,
      htmlBody: body
    });
  } catch (err) {
    Logger.log("Email dispatch failed: " + err.message);
  }
}

// ==============================================================================
// 11. GENERAL HELPERS & TAXONOMY EXPOSURE
// ==============================================================================

/**
 * Returns CA service categories and sub-tasks for dynamic cascading dropdowns
 */
function getCAServicesTaxonomy() {
  return CA_SERVICES_TAXONOMY;
}

/**
 * Generates sequential unique ID like TSK-1007, CLI-107, USR-007
 */
function generateUniqueId(prefix, sheet) {
  const lastRow = sheet.getLastRow();
  const nextNum = 1000 + lastRow;
  return `${prefix}-${nextNum}`;
}

/**
 * Formats date values to string YYYY-MM-DD safely
 */
function formatDateStr(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd");
  }
  return String(val).trim();
}

/**
 * HTML Escaping helper
 */
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
