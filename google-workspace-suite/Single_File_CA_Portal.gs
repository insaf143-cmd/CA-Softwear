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
    let htmlOutput;
    try {
      htmlOutput = HtmlService.createHtmlOutputFromFile("Index");
    } catch (e1) {
      try {
        htmlOutput = HtmlService.createHtmlOutputFromFile("Index.html");
      } catch (e2) {
        // Fallback to embedded HTML
        htmlOutput = HtmlService.createHtmlOutput(getEmbeddedPortalHtml());
      }
    }
    return htmlOutput
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



/**
 * Universal Database Connection:
 * Works seamlessly whether container-bound (inside Sheet) or standalone.
 * If standalone, automatically creates 'CA Practice & Task Management System'
 * in the user\'s Google Drive and connects to it automatically.
 */
function getDatabaseSpreadsheet() {
  let ss = null;
  try {
    ss = getDatabaseSpreadsheet();
  } catch (e) {}

  if (ss) return ss;

  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('DATABASE_SPREADSHEET_ID');
  if (savedId) {
    try {
      ss = SpreadsheetApp.openById(savedId);
      if (ss) return ss;
    } catch (e) {}
  }

  // Look for existing sheet in Drive
  try {
    const files = DriveApp.getFilesByName('CA Practice & Task Management System');
    if (files.hasNext()) {
      const file = files.next();
      ss = SpreadsheetApp.openById(file.getId());
      props.setProperty('DATABASE_SPREADSHEET_ID', ss.getId());
      return ss;
    }
  } catch (e) {}

  // Create new Google Sheet automatically in Google Drive
  try {
    ss = SpreadsheetApp.create('CA Practice & Task Management System');
    props.setProperty('DATABASE_SPREADSHEET_ID', ss.getId());
    setupDatabase();
    return ss;
  } catch (err) {
    throw new Error('Database Connection Error: ' + err.message);
  }
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
  const ss = getDatabaseSpreadsheet();

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
  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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
  const ss = getDatabaseSpreadsheet();
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
    const ss = getDatabaseSpreadsheet();
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

  const ss = getDatabaseSpreadsheet();
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


/**
 * Embedded Base64 Frontend UI:
 * Allows the entire CA Practice Management System to run from this SINGLE file.
 * No need to create Index.html if you prefer a single-file deployment!
 */
const EMBEDDED_PORTAL_HTML_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CiAgPG1ldGEgY2hhcnNldD0iVVRGLTgiPgogIDx0aXRsZT5DQSBQcmFjdGljZSAmIFRhc2sgTWFuYWdlbWVudCBTeXN0ZW08L3RpdGxlPgogIDxtZXRhIG5hbWU9InZpZXdwb3J0IiBjb250ZW50PSJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wIj4KICAKICA8IS0tIFRhaWx3aW5kIENTUyBDRE4gLS0+CiAgPHNjcmlwdCBzcmM9Imh0dHBzOi8vY2RuLnRhaWx3aW5kY3NzLmNvbSI+PC9zY3JpcHQ+CiAgPCEtLSBGb250QXdlc29tZSBJY29ucyBDRE4gLS0+CiAgPGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBocmVmPSJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9mb250LWF3ZXNvbWUvNi40LjAvY3NzL2FsbC5taW4uY3NzIj4KICA8IS0tIEdvb2dsZSBGb250czogSW50ZXIgLS0+CiAgPGxpbmsgcmVsPSJwcmVjb25uZWN0IiBocmVmPSJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tIj4KICA8bGluayByZWw9InByZWNvbm5lY3QiIGhyZWY9Imh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb20iIGNyb3Nzb3JpZ2luPgogIDxsaW5rIGhyZWY9Imh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9SW50ZXI6d2dodEAzMDA7NDAwOzUwMDs2MDA7NzAwJmRpc3BsYXk9c3dhcCIgcmVsPSJzdHlsZXNoZWV0Ij4KCiAgPHNjcmlwdD4KICAgIHRhaWx3aW5kLmNvbmZpZyA9IHsKICAgICAgdGhlbWU6IHsKICAgICAgICBleHRlbmQ6IHsKICAgICAgICAgIGZvbnRGYW1pbHk6IHsKICAgICAgICAgICAgc2FuczogWydJbnRlcicsICdzYW5zLXNlcmlmJ10sCiAgICAgICAgICB9LAogICAgICAgICAgY29sb3JzOiB7CiAgICAgICAgICAgIGNhOiB7CiAgICAgICAgICAgICAgbmF2eTogJyMxRTNBOEEnLAogICAgICAgICAgICAgIG5hdnlEYXJrOiAnIzBGMTcyQScsCiAgICAgICAgICAgICAgYmx1ZTogJyMyNTYzRUInLAogICAgICAgICAgICAgIGFjY2VudDogJyMzQjgyRjYnLAogICAgICAgICAgICAgIGdvbGQ6ICcjRDk3NzA2JywKICAgICAgICAgICAgICBlbWVyYWxkOiAnIzA1OTY2OScsCiAgICAgICAgICAgICAgcm9zZTogJyNFMTFENDgnCiAgICAgICAgICAgIH0KICAgICAgICAgIH0KICAgICAgICB9CiAgICAgIH0KICAgIH0KICA8L3NjcmlwdD4KCiAgPHN0eWxlPgogICAgLyogQ3VzdG9tIHNjcm9sbGJhcnMgKi8KICAgIDo6LXdlYmtpdC1zY3JvbGxiYXIgeyB3aWR0aDogNnB4OyBoZWlnaHQ6IDZweDsgfQogICAgOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7IGJhY2tncm91bmQ6ICNmMWY1Zjk7IH0KICAgIDo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIgeyBiYWNrZ3JvdW5kOiAjY2JkNWUxOyBib3JkZXItcmFkaXVzOiA0cHg7IH0KICAgIDo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIgeyBiYWNrZ3JvdW5kOiAjOTRhM2I4OyB9CiAgICAKICAgIC5iYWRnZS11cmdlbnQgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZmVlMmUyOyBjb2xvcjogIzk5MWIxYjsgYm9yZGVyOiAxcHggc29saWQgI2ZlY2FjYTsgfQogICAgLmJhZGdlLWhpZ2ggeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZlZGQ1OyBjb2xvcjogIzlhMzQxMjsgYm9yZGVyOiAxcHggc29saWQgI2ZlZDdhYTsgfQogICAgLmJhZGdlLW1lZGl1bSB7IGJhY2tncm91bmQtY29sb3I6ICNmZWY5YzM7IGNvbG9yOiAjODU0ZDBlOyBib3JkZXI6IDFweCBzb2xpZCAjZmVmMDhhOyB9CiAgICAuYmFkZ2UtbG93IHsgYmFja2dyb3VuZC1jb2xvcjogI2YxZjVmOTsgY29sb3I6ICM0NzU1Njk7IGJvcmRlcjogMXB4IHNvbGlkICNlMmU4ZjA7IH0KCiAgICAuc3RhdHVzLXBlbmRpbmcgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjFmNWY5OyBjb2xvcjogIzMzNDE1NTsgfQogICAgLnN0YXR1cy1pbnByb2dyZXNzIHsgYmFja2dyb3VuZC1jb2xvcjogI2RiZWFmZTsgY29sb3I6ICMxZTQwYWY7IH0KICAgIC5zdGF0dXMtcmV2aWV3IHsgYmFja2dyb3VuZC1jb2xvcjogI2YzZThmZjsgY29sb3I6ICM2YjIxYTg7IH0KICAgIC5zdGF0dXMtY29tcGxldGVkIHsgYmFja2dyb3VuZC1jb2xvcjogI2RjZmNlNzsgY29sb3I6ICMxNjY1MzQ7IH0KICAgIC5zdGF0dXMtb25ob2xkIHsgYmFja2dyb3VuZC1jb2xvcjogI2ZlZTJlMjsgY29sb3I6ICM5OTFiMWI7IH0KCiAgICAua2FuYmFuLWNvbCB7IG1pbi1oZWlnaHQ6IDUyMHB4OyB9CiAgPC9zdHlsZT4KPC9oZWFkPgoKPGJvZHkgY2xhc3M9ImJnLXNsYXRlLTUwIHRleHQtc2xhdGUtODAwIGZvbnQtc2FucyBhbnRpYWxpYXNlZCBtaW4taC1zY3JlZW4gZmxleCBmbGV4LWNvbCI+CgogIDwhLS0gPT09PT09PT09PT09PT09PT0gVE9QIE5BVklHQVRJT04gQkFSID09PT09PT09PT09PT09PT09IC0tPgogIDxoZWFkZXIgY2xhc3M9ImJnLWNhLW5hdnkgdGV4dC13aGl0ZSBzaGFkb3ctbWQgc3RpY2t5IHRvcC0wIHotNDAiPgogICAgPGRpdiBjbGFzcz0ibWF4LXctN3hsIG14LWF1dG8gcHgtNCBzbTpweC02IGxnOnB4LTgiPgogICAgICA8ZGl2IGNsYXNzPSJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gaC0xNiI+CiAgICAgICAgCiAgICAgICAgPCEtLSBCcmFuZCAmIEZpcm0gSWRlbnRpdHkgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgc3BhY2UteC0zIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InctMTAgaC0xMCByb3VuZGVkLWxnIGJnLXdoaXRlLzEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtYW1iZXItNDAwIGZvbnQtYm9sZCB0ZXh0LXhsIGJvcmRlciBib3JkZXItd2hpdGUvMjAiPgogICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtc2NhbGUtYmFsYW5jZWQiPjwvaT4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGgxIGNsYXNzPSJmb250LWJvbGQgdGV4dC1sZyBsZWFkaW5nLXRpZ2h0IHRyYWNraW5nLXdpZGUgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIiPgogICAgICAgICAgICAgIENBIFBSQUNUSUNFIE1BTkFHRU1FTlQKICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0idGV4dC14cyBiZy1hbWJlci01MDAvMjAgdGV4dC1hbWJlci0zMDAgZm9udC1tZWRpdW0gcHgtMiBweS0wLjUgcm91bmRlZCBib3JkZXIgYm9yZGVyLWFtYmVyLTQwMC8zMCI+UFJPPC9zcGFuPgogICAgICAgICAgICA8L2gxPgogICAgICAgICAgICA8cCBjbGFzcz0idGV4dC14cyB0ZXh0LWJsdWUtMjAwIj5DaGFydGVyZWQgQWNjb3VudGFuY3kgUHJhY3RpY2UgJiBDb21wbGlhbmNlIFN1aXRlPC9wPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDwhLS0gR2xvYmFsIFNlYXJjaCAmIEFjdGlvbnMgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgc3BhY2UteC00Ij4KICAgICAgICAgIDwhLS0gUmVmcmVzaCBEYXRhIEJ1dHRvbiAtLT4KICAgICAgICAgIDxidXR0b24gb25jbGljaz0icmVmcmVzaEN1cnJlbnRWaWV3KCkiIHRpdGxlPSJSZWZyZXNoIFN5c3RlbSBEYXRhIiBjbGFzcz0icC0yIHRleHQtYmx1ZS0yMDAgaG92ZXI6dGV4dC13aGl0ZSBob3ZlcjpiZy13aGl0ZS8xMCByb3VuZGVkLWxnIHRyYW5zaXRpb24iPgogICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtcm90YXRlIHRleHQtc20iIGlkPSJyZWZyZXNoLWljb24iPjwvaT4KICAgICAgICAgIDwvYnV0dG9uPgoKICAgICAgICAgIDwhLS0gQ3VycmVudCBVc2VyIFByb2ZpbGUgUGlsbCAtLT4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGJnLXdoaXRlLzEwIHJvdW5kZWQtZnVsbCBweS0xIHB4LTMgYm9yZGVyIGJvcmRlci13aGl0ZS8xNSI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InctNyBoLTcgcm91bmRlZC1mdWxsIGJnLWJsdWUtNjAwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtd2hpdGUgdGV4dC14cyBmb250LXNlbWlib2xkIG1yLTIiIGlkPSJ1c2VyLWF2YXRhciI+CiAgICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXVzZXIiPjwvaT4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InRleHQtbGVmdCBtci0yIj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC13aGl0ZSBsZWFkaW5nLXRpZ2h0IiBpZD0idXNlci1kaXNwbGF5LW5hbWUiPkxvYWRpbmcgdXNlci4uLjwvZGl2PgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InRleHQtWzEwcHhdIHRleHQtYmx1ZS0yMDAgbGVhZGluZy1ub25lIiBpZD0idXNlci1kaXNwbGF5LXJvbGUiPkF1dGhlbnRpY2F0aW5nLi4uPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8c3BhbiBpZD0icm9sZS1iYWRnZSIgY2xhc3M9InRleHQtWzEwcHhdIHVwcGVyY2FzZSBmb250LWJvbGQgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIGJnLWJsdWUtNTAwLzQwIHRleHQtYmx1ZS0xMDAgYm9yZGVyIGJvcmRlci1ibHVlLTQwMC80MCI+CiAgICAgICAgICAgICAgLi4uCiAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICA8L2hlYWRlcj4KCiAgPCEtLSA9PT09PT09PT09PT09PT09PSBTRUNPTkRBUlkgTkFWSUdBVElPTiAoVEFCUykgPT09PT09PT09PT09PT09PT0gLS0+CiAgPG5hdiBjbGFzcz0iYmctd2hpdGUgYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTIwMCBzdGlja3kgdG9wLTE2IHotMzAgc2hhZG93LXNtIj4KICAgIDxkaXYgY2xhc3M9Im1heC13LTd4bCBteC1hdXRvIHB4LTQgc206cHgtNiBsZzpweC04Ij4KICAgICAgPGRpdiBjbGFzcz0iZmxleCBzcGFjZS14LTEgc206c3BhY2UteC00IG92ZXJmbG93LXgtYXV0byBweS0yIiBpZD0ibmF2LXRhYnMtY29udGFpbmVyIj4KICAgICAgICAKICAgICAgICA8IS0tIFN0YWZmICYgQWRtaW4gQ29tbW9uIFRhYiAtLT4KICAgICAgICA8YnV0dG9uIG9uY2xpY2s9InN3aXRjaFRhYignd29ya3NwYWNlJykiIGlkPSJ0YWItd29ya3NwYWNlIiBjbGFzcz0ibmF2LXRhYiBweC0zIHB5LTIgcm91bmRlZC1sZyB0ZXh0LXNtIGZvbnQtbWVkaXVtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtY2EtYmx1ZSBiZy1ibHVlLTUwIGJvcmRlciBib3JkZXItYmx1ZS0yMDAiPgogICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWNsaXBib2FyZC1jaGVjayI+PC9pPgogICAgICAgICAgPHNwYW4+TXkgV29ya3NwYWNlPC9zcGFuPgogICAgICAgICAgPHNwYW4gaWQ9Im15LXRhc2tzLWNvdW50IiBjbGFzcz0ibWwtMSB0ZXh0LXhzIGJnLWJsdWUtNjAwIHRleHQtd2hpdGUgcm91bmRlZC1mdWxsIHB4LTIgcHktMC41Ij4wPC9zcGFuPgogICAgICAgIDwvYnV0dG9uPgoKICAgICAgICA8IS0tIEFkbWluIC8gUGFydG5lciAvIFN1cGVyIEFkbWluIFRhYnMgKEhpZGRlbiBmb3IgU3RhZmYpIC0tPgogICAgICAgIDxidXR0b24gb25jbGljaz0ic3dpdGNoVGFiKCdkYXNoYm9hcmQnKSIgaWQ9InRhYi1kYXNoYm9hcmQiIGNsYXNzPSJuYXYtdGFiIHB4LTMgcHktMiByb3VuZGVkLWxnIHRleHQtc20gZm9udC1tZWRpdW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC1zbGF0ZS02MDAgaG92ZXI6dGV4dC1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtMTAwIHRyYW5zaXRpb24iPgogICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWNoYXJ0LXBpZSI+PC9pPgogICAgICAgICAgPHNwYW4+S1BJIEFuYWx5dGljczwvc3Bhbj4KICAgICAgICA8L2J1dHRvbj4KCiAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJzd2l0Y2hUYWIoJ2FsbHRhc2tzJykiIGlkPSJ0YWItYWxsdGFza3MiIGNsYXNzPSJuYXYtdGFiIHB4LTMgcHktMiByb3VuZGVkLWxnIHRleHQtc20gZm9udC1tZWRpdW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC1zbGF0ZS02MDAgaG92ZXI6dGV4dC1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtMTAwIHRyYW5zaXRpb24iPgogICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWxpc3QtY2hlY2siPjwvaT4KICAgICAgICAgIDxzcGFuPkZpcm0gVGFza3M8L3NwYW4+CiAgICAgICAgPC9idXR0b24+CgogICAgICAgIDxidXR0b24gb25jbGljaz0ic3dpdGNoVGFiKCdhc3NpZ24nKSIgaWQ9InRhYi1hc3NpZ24iIGNsYXNzPSJuYXYtdGFiIHB4LTMgcHktMiByb3VuZGVkLWxnIHRleHQtc20gZm9udC1tZWRpdW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC1zbGF0ZS02MDAgaG92ZXI6dGV4dC1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtMTAwIHRyYW5zaXRpb24iPgogICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWNpcmNsZS1wbHVzIj48L2k+CiAgICAgICAgICA8c3Bhbj5Bc3NpZ24gVGFzazwvc3Bhbj4KICAgICAgICA8L2J1dHRvbj4KCiAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJzd2l0Y2hUYWIoJ2J1bGsnKSIgaWQ9InRhYi1idWxrIiBjbGFzcz0ibmF2LXRhYiBweC0zIHB5LTIgcm91bmRlZC1sZyB0ZXh0LXNtIGZvbnQtbWVkaXVtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtc2xhdGUtNjAwIGhvdmVyOnRleHQtc2xhdGUtOTAwIGhvdmVyOmJnLXNsYXRlLTEwMCB0cmFuc2l0aW9uIj4KICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1sYXllci1ncm91cCI+PC9pPgogICAgICAgICAgPHNwYW4+QnVsayBBbGxvY2F0aW9uPC9zcGFuPgogICAgICAgIDwvYnV0dG9uPgoKICAgICAgICA8YnV0dG9uIG9uY2xpY2s9InN3aXRjaFRhYigncmVhc3NpZ24nKSIgaWQ9InRhYi1yZWFzc2lnbiIgY2xhc3M9Im5hdi10YWIgcHgtMyBweS0yIHJvdW5kZWQtbGcgdGV4dC1zbSBmb250LW1lZGl1bSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNsYXRlLTYwMCBob3Zlcjp0ZXh0LXNsYXRlLTkwMCBob3ZlcjpiZy1zbGF0ZS0xMDAgdHJhbnNpdGlvbiI+CiAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtYXJyb3ctcmlnaHQtYXJyb3ctbGVmdCI+PC9pPgogICAgICAgICAgPHNwYW4+UmVhc3NpZ248L3NwYW4+CiAgICAgICAgPC9idXR0b24+CgogICAgICAgIDxidXR0b24gb25jbGljaz0ic3dpdGNoVGFiKCdjbGllbnRzJykiIGlkPSJ0YWItY2xpZW50cyIgY2xhc3M9Im5hdi10YWIgcHgtMyBweS0yIHJvdW5kZWQtbGcgdGV4dC1zbSBmb250LW1lZGl1bSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNsYXRlLTYwMCBob3Zlcjp0ZXh0LXNsYXRlLTkwMCBob3ZlcjpiZy1zbGF0ZS0xMDAgdHJhbnNpdGlvbiI+CiAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtYnVpbGRpbmctdXNlciI+PC9pPgogICAgICAgICAgPHNwYW4+Q2xpZW50IE1hc3Rlcjwvc3Bhbj4KICAgICAgICA8L2J1dHRvbj4KCiAgICAgICAgPCEtLSBTdXBlciBBZG1pbiBPbmx5IFRhYnMgLS0+CiAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJzd2l0Y2hUYWIoJ3VzZXJzJykiIGlkPSJ0YWItdXNlcnMiIGNsYXNzPSJuYXYtdGFiIHB4LTMgcHktMiByb3VuZGVkLWxnIHRleHQtc20gZm9udC1tZWRpdW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC1zbGF0ZS02MDAgaG92ZXI6dGV4dC1zbGF0ZS05MDAgaG92ZXI6Ymctc2xhdGUtMTAwIHRyYW5zaXRpb24iPgogICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXVzZXJzLWdlYXIiPjwvaT4KICAgICAgICAgIDxzcGFuPlRlYW0gLyBVc2Vyczwvc3Bhbj4KICAgICAgICA8L2J1dHRvbj4KCiAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJzd2l0Y2hUYWIoJ2xvZ3MnKSIgaWQ9InRhYi1sb2dzIiBjbGFzcz0ibmF2LXRhYiBweC0zIHB5LTIgcm91bmRlZC1sZyB0ZXh0LXNtIGZvbnQtbWVkaXVtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtc2xhdGUtNjAwIGhvdmVyOnRleHQtc2xhdGUtOTAwIGhvdmVyOmJnLXNsYXRlLTEwMCB0cmFuc2l0aW9uIj4KICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1jbG9jay1yb3RhdGUtbGVmdCI+PC9pPgogICAgICAgICAgPHNwYW4+QXVkaXQgTG9nPC9zcGFuPgogICAgICAgIDwvYnV0dG9uPgoKICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICA8L25hdj4KCiAgPCEtLSA9PT09PT09PT09PT09PT09PSBNQUlOIENPTlRFTlQgV1JBUFBFUiA9PT09PT09PT09PT09PT09PSAtLT4KICA8bWFpbiBjbGFzcz0ibWF4LXctN3hsIG14LWF1dG8gcHgtNCBzbTpweC02IGxnOnB4LTggcHktNiBmbGV4LWdyb3cgdy1mdWxsIj4KCiAgICA8IS0tIExvYWRpbmcgSW5kaWNhdG9yIEJhbm5lciAtLT4KICAgIDxkaXYgaWQ9Imdsb2JhbC1sb2FkZXIiIGNsYXNzPSJtYi00IGJnLWJsdWUtNTAgYm9yZGVyIGJvcmRlci1ibHVlLTIwMCB0ZXh0LWJsdWUtNzAwIHB4LTQgcHktMyByb3VuZGVkLWxnIGZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHNoYWRvdy1zbSI+CiAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1zcGlubmVyIGZhLXNwaW4gdGV4dC1sZyB0ZXh0LWJsdWUtNjAwIj48L2k+CiAgICAgIDxkaXYgY2xhc3M9InRleHQtc20iPgogICAgICAgIDxzcGFuIGNsYXNzPSJmb250LXNlbWlib2xkIiBpZD0ibG9hZGVyLW1lc3NhZ2UiPkNvbm5lY3RpbmcgdG8gQ0EgUHJhY3RpY2UgRGF0YWJhc2UuLi48L3NwYW4+CiAgICAgICAgPHNwYW4gY2xhc3M9InRleHQteHMgdGV4dC1ibHVlLTUwMCBibG9jayI+U3luY2hyb25pemluZyBjb21wbGlhbmNlIHNjaGVkdWxlcyBhbmQgYWN0aXZlIGVuZ2FnZW1lbnRzPC9zcGFuPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgoKICAgIDwhLS0gQWxlcnQgQmFubmVyIC8gVG9hc3RzIENvbnRhaW5lciAtLT4KICAgIDxkaXYgaWQ9InRvYXN0LWNvbnRhaW5lciIgY2xhc3M9ImZpeGVkIGJvdHRvbS01IHJpZ2h0LTUgei01MCBmbGV4IGZsZXgtY29sIGdhcC0yIG1heC13LXNtIj48L2Rpdj4KCiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPCEtLSBWSUVXIDE6IE1ZIFdPUktTUEFDRSAoRk9SIEFMTCBVU0VSUzogQVJUSUNMRVMsIE1BTkFHRVJTLCBQQVJUTkVSUykgLS0+CiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPHNlY3Rpb24gaWQ9InZpZXctd29ya3NwYWNlIiBjbGFzcz0idGFiLXZpZXciPgogICAgICAKICAgICAgPCEtLSBUb3AgQWN0aW9uIEJhciBmb3IgV29ya3NwYWNlIC0tPgogICAgICA8ZGl2IGNsYXNzPSJiZy13aGl0ZSBwLTQgcm91bmRlZC14bCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgbWItNiBmbGV4IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC00Ij4KICAgICAgICA8ZGl2PgogICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCI+TXkgQ29tcGxpYW5jZSBXb3Jrc3BhY2U8L2gyPgogICAgICAgICAgPHAgY2xhc3M9InRleHQteHMgdGV4dC1zbGF0ZS01MDAiPlRyYWNrIGFuZCBleGVjdXRlIHlvdXIgYXNzaWduZWQgdGF4IHJldHVybnMsIGF1ZGl0IHNjaGVkdWxlcywgYW5kIGZpbGluZ3M8L3A+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIGZsZXgtd3JhcCI+CiAgICAgICAgICA8IS0tIFZpZXcgVG9nZ2xlOiBLYW5iYW4gdnMgVGFibGUgLS0+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJiZy1zbGF0ZS0xMDAgcC0xIHJvdW5kZWQtbGcgZmxleCBpdGVtcy1jZW50ZXIgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNjAwIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIj4KICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJzZXRXb3Jrc3BhY2VMYXlvdXQoJ2thbmJhbicpIiBpZD0iYnRuLWxheW91dC1rYW5iYW4iIGNsYXNzPSJweC0zIHB5LTEuNSByb3VuZGVkLW1kIGJnLXdoaXRlIHRleHQtc2xhdGUtODAwIHNoYWRvdy14cyBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHRyYW5zaXRpb24iPgogICAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS10YWJsZS1jb2x1bW5zIj48L2k+IEthbmJhbgogICAgICAgICAgICA8L2J1dHRvbj4KICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJzZXRXb3Jrc3BhY2VMYXlvdXQoJ3RhYmxlJykiIGlkPSJidG4tbGF5b3V0LXRhYmxlIiBjbGFzcz0icHgtMyBweS0xLjUgcm91bmRlZC1tZCB0ZXh0LXNsYXRlLTYwMCBob3Zlcjp0ZXh0LXNsYXRlLTkwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHRyYW5zaXRpb24iPgogICAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS10YWJsZS1saXN0Ij48L2k+IFRhYmxlCiAgICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPCEtLSBGYXN0IEZpbHRlciBieSBTdGF0dXMgLS0+CiAgICAgICAgICA8c2VsZWN0IGlkPSJ3cy1maWx0ZXItc3RhdHVzIiBvbmNoYW5nZT0icmVuZGVyTXlXb3Jrc3BhY2UoKSIgY2xhc3M9InRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBweC0zIHB5LTIgdGV4dC1zbGF0ZS03MDAgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMSBmb2N1czpyaW5nLWJsdWUtNTAwIj4KICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iQWxsIj5BbGwgU3RhdHVzZXM8L29wdGlvbj4KICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iUGVuZGluZyI+UGVuZGluZzwvb3B0aW9uPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJJbiBQcm9ncmVzcyI+SW4gUHJvZ3Jlc3M8L29wdGlvbj4KICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iUmV2aWV3IFJlcXVpcmVkIj5SZXZpZXcgUmVxdWlyZWQ8L29wdGlvbj4KICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iQ29tcGxldGVkIj5Db21wbGV0ZWQ8L29wdGlvbj4KICAgICAgICAgIDwvc2VsZWN0PgoKICAgICAgICAgIDwhLS0gU2VhcmNoIElucHV0IC0tPgogICAgICAgICAgPGRpdiBjbGFzcz0icmVsYXRpdmUiPgogICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9IndzLXNlYXJjaCIgb25pbnB1dD0icmVuZGVyTXlXb3Jrc3BhY2UoKSIgcGxhY2Vob2xkZXI9IlNlYXJjaCBjbGllbnQgb3IgdGFzay4uLiIgY2xhc3M9InRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwbC04IHByLTMgcHktMiB0ZXh0LXNsYXRlLTcwMCB3LTQ4IHNtOnctNjQgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMSBmb2N1czpyaW5nLWJsdWUtNTAwIj4KICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLW1hZ25pZnlpbmctZ2xhc3MgdGV4dC1zbGF0ZS00MDAgYWJzb2x1dGUgbGVmdC0yLjUgdG9wLTIuNSB0ZXh0LXhzIj48L2k+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CgogICAgICA8IS0tIEtBTkJBTiBCT0FSRCBDT05UQUlORVIgLS0+CiAgICAgIDxkaXYgaWQ9IndzLWthbmJhbi1jb250YWluZXIiIGNsYXNzPSJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy00IGdhcC01Ij4KICAgICAgICAKICAgICAgICA8IS0tIENvbHVtbiAxOiBQZW5kaW5nIC0tPgogICAgICAgIDxkaXYgY2xhc3M9ImJnLXNsYXRlLTEwMC84MCByb3VuZGVkLXhsIHAtMyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMC84MCBrYW5iYW4tY29sIGZsZXggZmxleC1jb2wiPgogICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHBiLTIgbWItMyBib3JkZXItYiBib3JkZXItc2xhdGUtMjAwIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ3LTMgaC0zIHJvdW5kZWQtZnVsbCBiZy1zbGF0ZS00MDAiPjwvc3Bhbj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0iZm9udC1zZW1pYm9sZCB0ZXh0LXhzIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LXNsYXRlLTYwMCI+UGVuZGluZzwvc3Bhbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxzcGFuIGlkPSJjb2wtY291bnQtcGVuZGluZyIgY2xhc3M9InRleHQteHMgZm9udC1ib2xkIHRleHQtc2xhdGUtNjAwIGJnLXdoaXRlIHB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCI+MDwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBpZD0ia2FuYmFuLWNhcmRzLXBlbmRpbmciIGNsYXNzPSJzcGFjZS15LTMgZmxleC1ncm93IG92ZXJmbG93LXktYXV0byBtYXgtaC1bNzB2aF0iPjwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8IS0tIENvbHVtbiAyOiBJbiBQcm9ncmVzcyAtLT4KICAgICAgICA8ZGl2IGNsYXNzPSJiZy1ibHVlLTUwLzUwIHJvdW5kZWQteGwgcC0zIGJvcmRlciBib3JkZXItYmx1ZS0xMDAga2FuYmFuLWNvbCBmbGV4IGZsZXgtY29sIj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwYi0yIG1iLTMgYm9yZGVyLWIgYm9yZGVyLWJsdWUtMjAwIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ3LTMgaC0zIHJvdW5kZWQtZnVsbCBiZy1ibHVlLTUwMCI+PC9zcGFuPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJmb250LXNlbWlib2xkIHRleHQteHMgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtYmx1ZS04MDAiPkluIFByb2dyZXNzPC9zcGFuPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPHNwYW4gaWQ9ImNvbC1jb3VudC1pbnByb2dyZXNzIiBjbGFzcz0idGV4dC14cyBmb250LWJvbGQgdGV4dC1ibHVlLTcwMCBiZy13aGl0ZSBweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgYm9yZGVyIGJvcmRlci1ibHVlLTIwMCI+MDwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBpZD0ia2FuYmFuLWNhcmRzLWlucHJvZ3Jlc3MiIGNsYXNzPSJzcGFjZS15LTMgZmxleC1ncm93IG92ZXJmbG93LXktYXV0byBtYXgtaC1bNzB2aF0iPjwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8IS0tIENvbHVtbiAzOiBSZXZpZXcgUmVxdWlyZWQgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0iYmctcHVycGxlLTUwLzUwIHJvdW5kZWQteGwgcC0zIGJvcmRlciBib3JkZXItcHVycGxlLTEwMCBrYW5iYW4tY29sIGZsZXggZmxleC1jb2wiPgogICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHBiLTIgbWItMyBib3JkZXItYiBib3JkZXItcHVycGxlLTIwMCI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0idy0zIGgtMyByb3VuZGVkLWZ1bGwgYmctcHVycGxlLTUwMCI+PC9zcGFuPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJmb250LXNlbWlib2xkIHRleHQteHMgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtcHVycGxlLTgwMCI+UmV2aWV3IFJlcXVpcmVkPC9zcGFuPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPHNwYW4gaWQ9ImNvbC1jb3VudC1yZXZpZXciIGNsYXNzPSJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LXB1cnBsZS03MDAgYmctd2hpdGUgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIGJvcmRlciBib3JkZXItcHVycGxlLTIwMCI+MDwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBpZD0ia2FuYmFuLWNhcmRzLXJldmlldyIgY2xhc3M9InNwYWNlLXktMyBmbGV4LWdyb3cgb3ZlcmZsb3cteS1hdXRvIG1heC1oLVs3MHZoXSI+PC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDwhLS0gQ29sdW1uIDQ6IENvbXBsZXRlZCAtLT4KICAgICAgICA8ZGl2IGNsYXNzPSJiZy1lbWVyYWxkLTUwLzUwIHJvdW5kZWQteGwgcC0zIGJvcmRlciBib3JkZXItZW1lcmFsZC0xMDAga2FuYmFuLWNvbCBmbGV4IGZsZXgtY29sIj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwYi0yIG1iLTMgYm9yZGVyLWIgYm9yZGVyLWVtZXJhbGQtMjAwIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ3LTMgaC0zIHJvdW5kZWQtZnVsbCBiZy1lbWVyYWxkLTUwMCI+PC9zcGFuPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJmb250LXNlbWlib2xkIHRleHQteHMgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtZW1lcmFsZC04MDAiPkNvbXBsZXRlZDwvc3Bhbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxzcGFuIGlkPSJjb2wtY291bnQtY29tcGxldGVkIiBjbGFzcz0idGV4dC14cyBmb250LWJvbGQgdGV4dC1lbWVyYWxkLTcwMCBiZy13aGl0ZSBweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgYm9yZGVyIGJvcmRlci1lbWVyYWxkLTIwMCI+MDwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBpZD0ia2FuYmFuLWNhcmRzLWNvbXBsZXRlZCIgY2xhc3M9InNwYWNlLXktMyBmbGV4LWdyb3cgb3ZlcmZsb3cteS1hdXRvIG1heC1oLVs3MHZoXSI+PC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICA8L2Rpdj4KCiAgICAgIDwhLS0gVEFCTEUgVklFVyBDT05UQUlORVIgKEhJRERFTiBJTklUSUFMTFkpIC0tPgogICAgICA8ZGl2IGlkPSJ3cy10YWJsZS1jb250YWluZXIiIGNsYXNzPSJoaWRkZW4gYmctd2hpdGUgcm91bmRlZC14bCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgb3ZlcmZsb3ctaGlkZGVuIj4KICAgICAgICA8ZGl2IGNsYXNzPSJvdmVyZmxvdy14LWF1dG8iPgogICAgICAgICAgPHRhYmxlIGNsYXNzPSJtaW4tdy1mdWxsIGRpdmlkZS15IGRpdmlkZS1zbGF0ZS0yMDAgdGV4dC1sZWZ0IHRleHQteHMiPgogICAgICAgICAgICA8dGhlYWQgY2xhc3M9ImJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNjAwIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIj4KICAgICAgICAgICAgICA8dHI+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+VGFzayBJRDwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+Q2xpZW50ICYgRW50aXR5PC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5DYXRlZ29yeSAmIFN1Yi1UYXNrPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5QZXJpb2QgLyBGWTwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+U3RhdHV0b3J5IER1ZTwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+UHJpb3JpdHk8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlN0YXR1czwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyB0ZXh0LXJpZ2h0Ij5BY3Rpb25zPC90aD4KICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICA8L3RoZWFkPgogICAgICAgICAgICA8dGJvZHkgaWQ9IndzLXRhYmxlLWJvZHkiIGNsYXNzPSJkaXZpZGUteSBkaXZpZGUtc2xhdGUtMjAwIGZvbnQtbm9ybWFsIHRleHQtc2xhdGUtNzAwIj48L3Rib2R5PgogICAgICAgICAgPC90YWJsZT4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CgogICAgPC9zZWN0aW9uPgoKICAgIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgICA8IS0tIFZJRVcgMjogS1BJICYgRklSTSBBTkFMWVRJQ1MgREFTSEJPQVJEIChQQVJUTkVSUyAmIFNVUEVSIEFETUlOKSAtLT4KICAgIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgICA8c2VjdGlvbiBpZD0idmlldy1kYXNoYm9hcmQiIGNsYXNzPSJ0YWItdmlldyBoaWRkZW4iPgogICAgICAKICAgICAgPCEtLSBLZXkgS1BJIE1ldHJpYyBDYXJkcyAtLT4KICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNSBtYi02Ij4KICAgICAgICAKICAgICAgICA8IS0tIE92ZXJkdWUgVGFza3MgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0iYmctd2hpdGUgcC01IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1yZWQtMjAwIHNoYWRvdy14cyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4iPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPHAgY2xhc3M9InRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXJlZC02MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIj5PdmVyZHVlIENvbXBsaWFuY2U8L3A+CiAgICAgICAgICAgIDxoMyBjbGFzcz0idGV4dC0yeGwgZm9udC1ib2xkIHRleHQtc2xhdGUtOTAwIG10LTEiIGlkPSJrcGktb3ZlcmR1ZSI+MDwvaDM+CiAgICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LVsxMXB4XSB0ZXh0LXJlZC01MDAgbXQtMSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSI+CiAgICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXRyaWFuZ2xlLWV4Y2xhbWF0aW9uIj48L2k+IFBhc3NlZCBzdGF0dXRvcnkgZGF0ZQogICAgICAgICAgICA8L3A+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InctMTIgaC0xMiByb3VuZGVkLXhsIGJnLXJlZC01MCB0ZXh0LXJlZC02MDAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC14bCBib3JkZXIgYm9yZGVyLXJlZC0xMDAiPgogICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtY2xvY2siPjwvaT4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8IS0tIER1ZSBUaGlzIFdlZWsgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0iYmctd2hpdGUgcC01IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1hbWJlci0yMDAgc2hhZG93LXhzIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiI+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8cCBjbGFzcz0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtYW1iZXItNjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciI+RHVlIGluIDcgRGF5czwvcD4KICAgICAgICAgICAgPGgzIGNsYXNzPSJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1zbGF0ZS05MDAgbXQtMSIgaWQ9ImtwaS1kdWUtd2VlayI+MDwvaDM+CiAgICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LVsxMXB4XSB0ZXh0LWFtYmVyLTUwMCBtdC0xIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIj4KICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtY2FsZW5kYXItd2VlayI+PC9pPiBJbW1lZGlhdGUgcHJpb3JpdHkKICAgICAgICAgICAgPC9wPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ3LTEyIGgtMTIgcm91bmRlZC14bCBiZy1hbWJlci01MCB0ZXh0LWFtYmVyLTYwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LXhsIGJvcmRlciBib3JkZXItYW1iZXItMTAwIj4KICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWhvdXJnbGFzcy1oYWxmIj48L2k+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPCEtLSBQZW5kaW5nIFBhcnRuZXIgUmV2aWV3IC0tPgogICAgICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHAtNSByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItcHVycGxlLTIwMCBzaGFkb3cteHMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIj4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1wdXJwbGUtNjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciI+UGVuZGluZyBSZXZpZXc8L3A+CiAgICAgICAgICAgIDxoMyBjbGFzcz0idGV4dC0yeGwgZm9udC1ib2xkIHRleHQtc2xhdGUtOTAwIG10LTEiIGlkPSJrcGktcmV2aWV3Ij4wPC9oMz4KICAgICAgICAgICAgPHAgY2xhc3M9InRleHQtWzExcHhdIHRleHQtcHVycGxlLTUwMCBtdC0xIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIj4KICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtc3RhbXAiPjwvaT4gQXdhaXRpbmcgUGFydG5lciBzaWduLW9mZgogICAgICAgICAgICA8L3A+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InctMTIgaC0xMiByb3VuZGVkLXhsIGJnLXB1cnBsZS01MCB0ZXh0LXB1cnBsZS02MDAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC14bCBib3JkZXIgYm9yZGVyLXB1cnBsZS0xMDAiPgogICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtc2lnbmF0dXJlIj48L2k+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPCEtLSBDb21wbGV0ZWQgVG9kYXkgLyBNb250aCAtLT4KICAgICAgICA8ZGl2IGNsYXNzPSJiZy13aGl0ZSBwLTUgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWVtZXJhbGQtMjAwIHNoYWRvdy14cyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4iPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPHAgY2xhc3M9InRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWVtZXJhbGQtNjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciI+Q29tcGxldGVkIERlbGl2ZXJpZXM8L3A+CiAgICAgICAgICAgIDxoMyBjbGFzcz0idGV4dC0yeGwgZm9udC1ib2xkIHRleHQtc2xhdGUtOTAwIG10LTEiIGlkPSJrcGktY29tcGxldGVkIj4wPC9oMz4KICAgICAgICAgICAgPHAgY2xhc3M9InRleHQtWzExcHhdIHRleHQtZW1lcmFsZC02MDAgbXQtMSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSI+CiAgICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWNpcmNsZS1jaGVjayI+PC9pPiA8c3BhbiBpZD0ia3BpLWNvbXBsZXRlZC10b2RheSI+MDwvc3Bhbj4gY29tcGxldGVkIHRvZGF5CiAgICAgICAgICAgIDwvcD4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0idy0xMiBoLTEyIHJvdW5kZWQteGwgYmctZW1lcmFsZC01MCB0ZXh0LWVtZXJhbGQtNjAwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQteGwgYm9yZGVyIGJvcmRlci1lbWVyYWxkLTEwMCI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1hd2FyZCI+PC9pPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICA8L2Rpdj4KCiAgICAgIDwhLS0gQ29tcGxpYW5jZSBCcmVha2Rvd24gJiBXb3JrbG9hZCBUYWJsZSAtLT4KICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMyBnYXAtNiBtYi02Ij4KICAgICAgICAKICAgICAgICA8IS0tIFByYWN0aWNlIENhdGVnb3JpZXMgRGlzdHJpYnV0aW9uIC0tPgogICAgICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHAtNSByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHNoYWRvdy14cyBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlbiI+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8aDMgY2xhc3M9InRleHQtc20gZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIj4KICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtY2hhcnQtc2ltcGxlIHRleHQtYmx1ZS02MDAiPjwvaT4gUHJhY3RpY2UgQXJlYSBEaXN0cmlidXRpb24KICAgICAgICAgICAgPC9oMz4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic3BhY2UteS0zIiBpZD0ia3BpLWNhdGVnb3J5LWJhcnMiPgogICAgICAgICAgICAgIDwhLS0gUmVuZGVyZWQgdmlhIEpTIC0tPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0icHQtNCBib3JkZXItdCBib3JkZXItc2xhdGUtMTAwIG10LTQgdGV4dC1bMTFweF0gdGV4dC1zbGF0ZS01MDAiPgogICAgICAgICAgICBSZWFsLXRpbWUgYnJlYWtkb3duIG9mIG9wZW4gZW5nYWdlbWVudHMgYWNyb3NzIHRheCwgYXVkaXQsIGFuZCBNQ0EgZmlsaW5ncy4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8IS0tIFN0YWZmIFdvcmtsb2FkICYgUGVyZm9ybWFuY2UgU2NvcmVjYXJkIChUQVQgJiBBZGhlcmVuY2UpIC0tPgogICAgICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHAtNSByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHNoYWRvdy14cyBsZzpjb2wtc3Bhbi0yIj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi00Ij4KICAgICAgICAgICAgPGgzIGNsYXNzPSJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIiPgogICAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS11c2VycyB0ZXh0LWJsdWUtNjAwIj48L2k+IFRlYW0gV29ya2xvYWQgJiBLUEkgU2NvcmVjYXJkCiAgICAgICAgICAgIDwvaDM+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIj5UQVQgKFR1cm5hcm91bmQgVGltZSkgJiBTdGF0dXRvcnkgQWRoZXJlbmNlPC9zcGFuPgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPGRpdiBjbGFzcz0ib3ZlcmZsb3cteC1hdXRvIj4KICAgICAgICAgICAgPHRhYmxlIGNsYXNzPSJtaW4tdy1mdWxsIGRpdmlkZS15IGRpdmlkZS1zbGF0ZS0yMDAgdGV4dC1sZWZ0IHRleHQteHMiPgogICAgICAgICAgICAgIDx0aGVhZCBjbGFzcz0iYmctc2xhdGUtNTAgdGV4dC1zbGF0ZS02MDAgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UiPgogICAgICAgICAgICAgICAgPHRyPgogICAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTMgcHktMiI+VGVhbSBNZW1iZXI8L3RoPgogICAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTMgcHktMiB0ZXh0LWNlbnRlciI+QWN0aXZlIFRhc2tzPC90aD4KICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC0zIHB5LTIgdGV4dC1jZW50ZXIiPkluIFJldmlldzwvdGg+CiAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtMyBweS0yIHRleHQtY2VudGVyIj5PdmVyZHVlPC90aD4KICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC0zIHB5LTIgdGV4dC1jZW50ZXIiPkF2ZyBUQVQ8L3RoPgogICAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTMgcHktMiB0ZXh0LWNlbnRlciI+U3RhdHV0b3J5IE9uLVRpbWU8L3RoPgogICAgICAgICAgICAgICAgPC90cj4KICAgICAgICAgICAgICA8L3RoZWFkPgogICAgICAgICAgICAgIDx0Ym9keSBpZD0ia3BpLXN0YWZmLXRhYmxlLWJvZHkiIGNsYXNzPSJkaXZpZGUteSBkaXZpZGUtc2xhdGUtMTAwIj4KICAgICAgICAgICAgICAgIDwhLS0gUmVuZGVyZWQgZHluYW1pY2FsbHkgLS0+CiAgICAgICAgICAgICAgPC90Ym9keT4KICAgICAgICAgICAgPC90YWJsZT4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgPC9kaXY+CgogICAgPC9zZWN0aW9uPgoKICAgIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgICA8IS0tIFZJRVcgMzogQUxMIEZJUk0gVEFTS1MgKFBBUlRORVJTIC8gU1VQRVIgQURNSU4pIC0tPgogICAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICAgIDxzZWN0aW9uIGlkPSJ2aWV3LWFsbHRhc2tzIiBjbGFzcz0idGFiLXZpZXcgaGlkZGVuIj4KICAgICAgCiAgICAgIDwhLS0gVG9wIEZpbHRlcnMgLS0+CiAgICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHAtNCByb3VuZGVkLXhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBtYi02IGZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTQiPgogICAgICAgIDxkaXY+CiAgICAgICAgICA8aDIgY2xhc3M9InRleHQteGwgZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIj5GaXJtLVdpZGUgQ29tcGxpYW5jZSBNYXN0ZXI8L2gyPgogICAgICAgICAgPHAgY2xhc3M9InRleHQteHMgdGV4dC1zbGF0ZS01MDAiPkNlbnRyYWxpemVkIHRyYWNraW5nIG9mIGFsbCBjbGllbnQgZmlsaW5ncyBhY3Jvc3MgZGlyZWN0IHRheCwgYXVkaXQsIGFuZCBST0M8L3A+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIGZsZXgtd3JhcCI+CiAgICAgICAgICA8c2VsZWN0IGlkPSJhbGwtZmlsdGVyLWNhdGVnb3J5IiBvbmNoYW5nZT0icmVuZGVyQWxsRmlybVRhc2tzKCkiIGNsYXNzPSJ0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcHgtMyBweS0yIHRleHQtc2xhdGUtNzAwIj4KICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iQWxsIj5BbGwgQ2F0ZWdvcmllczwvb3B0aW9uPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJEaXJlY3QgVGF4Ij5EaXJlY3QgVGF4PC9vcHRpb24+CiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkluZGlyZWN0IFRheCI+SW5kaXJlY3QgVGF4PC9vcHRpb24+CiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkNvcnBvcmF0ZSAvIE1DQSI+Q29ycG9yYXRlIC8gTUNBPC9vcHRpb24+CiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkF1ZGl0ICYgQXNzdXJhbmNlIj5BdWRpdCAmIEFzc3VyYW5jZTwvb3B0aW9uPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJBY2NvdW50aW5nICYgQWR2aXNvcnkiPkFjY291bnRpbmcgJiBBZHZpc29yeTwvb3B0aW9uPgogICAgICAgICAgPC9zZWxlY3Q+CgogICAgICAgICAgPHNlbGVjdCBpZD0iYWxsLWZpbHRlci1zdGF0dXMiIG9uY2hhbmdlPSJyZW5kZXJBbGxGaXJtVGFza3MoKSIgY2xhc3M9InRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBweC0zIHB5LTIgdGV4dC1zbGF0ZS03MDAiPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJBbGwiPkFsbCBTdGF0dXNlczwvb3B0aW9uPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJQZW5kaW5nIj5QZW5kaW5nPC9vcHRpb24+CiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkluIFByb2dyZXNzIj5JbiBQcm9ncmVzczwvb3B0aW9uPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJSZXZpZXcgUmVxdWlyZWQiPlJldmlldyBSZXF1aXJlZDwvb3B0aW9uPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJDb21wbGV0ZWQiPkNvbXBsZXRlZDwvb3B0aW9uPgogICAgICAgICAgPC9zZWxlY3Q+CgogICAgICAgICAgPHNlbGVjdCBpZD0iYWxsLWZpbHRlci1hc3NpZ25lZSIgb25jaGFuZ2U9InJlbmRlckFsbEZpcm1UYXNrcygpIiBjbGFzcz0idGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHB4LTMgcHktMiB0ZXh0LXNsYXRlLTcwMCI+CiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkFsbCI+QWxsIFN0YWZmIC8gQXNzaWduZWVzPC9vcHRpb24+CiAgICAgICAgICA8L3NlbGVjdD4KCiAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImFsbC1zZWFyY2giIG9uaW5wdXQ9InJlbmRlckFsbEZpcm1UYXNrcygpIiBwbGFjZWhvbGRlcj0iU2VhcmNoIGNsaWVudCwgdGFzaywgSUQuLi4iIGNsYXNzPSJ0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcHgtMyBweS0yIHRleHQtc2xhdGUtNzAwIHctNDggc206dy02MCI+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSBBbGwgVGFza3MgVGFibGUgLS0+CiAgICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHJvdW5kZWQteGwgc2hhZG93LXNtIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIG92ZXJmbG93LWhpZGRlbiI+CiAgICAgICAgPGRpdiBjbGFzcz0ib3ZlcmZsb3cteC1hdXRvIj4KICAgICAgICAgIDx0YWJsZSBjbGFzcz0ibWluLXctZnVsbCBkaXZpZGUteSBkaXZpZGUtc2xhdGUtMjAwIHRleHQtbGVmdCB0ZXh0LXhzIj4KICAgICAgICAgICAgPHRoZWFkIGNsYXNzPSJiZy1zbGF0ZS01MCB0ZXh0LXNsYXRlLTYwMCBmb250LXNlbWlib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciI+CiAgICAgICAgICAgICAgPHRyPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlRhc2sgSUQ8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPkNsaWVudCBOYW1lPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5DYXRlZ29yeSAmIFN1Yi1UYXNrPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5QZXJpb2Q8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlN0YXR1dG9yeSBEYXRlPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5Bc3NpZ25lZTwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+UHJpb3JpdHk8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlN0YXR1czwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyB0ZXh0LXJpZ2h0Ij5BY3Rpb25zPC90aD4KICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICA8L3RoZWFkPgogICAgICAgICAgICA8dGJvZHkgaWQ9ImFsbC10YXNrcy10YWJsZS1ib2R5IiBjbGFzcz0iZGl2aWRlLXkgZGl2aWRlLXNsYXRlLTIwMCBmb250LW5vcm1hbCB0ZXh0LXNsYXRlLTcwMCI+PC90Ym9keT4KICAgICAgICAgIDwvdGFibGU+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgIDwvc2VjdGlvbj4KCiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPCEtLSBWSUVXIDQ6IFNJTkdMRSBUQVNLIEFTU0lHTk1FTlQgLS0+CiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPHNlY3Rpb24gaWQ9InZpZXctYXNzaWduIiBjbGFzcz0idGFiLXZpZXcgaGlkZGVuIj4KICAgICAgPGRpdiBjbGFzcz0ibWF4LXctM3hsIG14LWF1dG8gYmctd2hpdGUgcC02IHNtOnAtOCByb3VuZGVkLXhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCI+CiAgICAgICAgPGRpdiBjbGFzcz0iYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTIwMCBwYi00IG1iLTYiPgogICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1maWxlLWNpcmNsZS1wbHVzIHRleHQtY2EtbmF2eSI+PC9pPiBBc3NpZ24gTmV3IENvbXBsaWFuY2UgVGFzawogICAgICAgICAgPC9oMj4KICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIG10LTEiPkRlbGVnYXRlIHN0YXR1dG9yeSBmaWxpbmdzLCBhdWRpdCBlbmdhZ2VtZW50cywgb3IgYWR2aXNvcnkgdGFza3MgdG8gZmlybSBtZW1iZXJzPC9wPgogICAgICAgIDwvZGl2PgoKICAgICAgICA8Zm9ybSBpZD0iZm9ybS1zaW5nbGUtdGFzayIgb25zdWJtaXQ9ImhhbmRsZUNyZWF0ZVNpbmdsZVRhc2soZXZlbnQpIiBjbGFzcz0ic3BhY2UteS01Ij4KICAgICAgICAgIAogICAgICAgICAgPCEtLSBDbGllbnQgU2VsZWN0aW9uIC0tPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPkNsaWVudCBFbnRpdHkgKjwvbGFiZWw+CiAgICAgICAgICAgIDxzZWxlY3QgaWQ9ImFzc2lnbi1jbGllbnQtaWQiIHJlcXVpcmVkIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIGZvY3VzOnJpbmctMSBmb2N1czpyaW5nLWJsdWUtNTAwIj4KICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSIiPi0tIFNlbGVjdCBDbGllbnQgKFNlYXJjaGFibGUgYnkgUEFOIC8gVHJhZGUgTmFtZSkgLS08L29wdGlvbj4KICAgICAgICAgICAgPC9zZWxlY3Q+CiAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICA8IS0tIFNlcnZpY2UgQ2F0ZWdvcnkgJiBEeW5hbWljIFN1Yi1UYXNrIC0tPgogICAgICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBnYXAtNCI+CiAgICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPlNlcnZpY2UgQ2F0ZWdvcnkgKjwvbGFiZWw+CiAgICAgICAgICAgICAgPHNlbGVjdCBpZD0iYXNzaWduLXNlcnZpY2UtY2F0IiBvbmNoYW5nZT0ib25DYXRlZ29yeUNoYW5nZSgpIiByZXF1aXJlZCBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCBmb2N1czpyaW5nLTEgZm9jdXM6cmluZy1ibHVlLTUwMCI+CiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSIiPi0tIFNlbGVjdCBDYXRlZ29yeSAtLTwvb3B0aW9uPgogICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iRGlyZWN0IFRheCI+RGlyZWN0IFRheDwvb3B0aW9uPgogICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iSW5kaXJlY3QgVGF4Ij5JbmRpcmVjdCBUYXg8L29wdGlvbj4KICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkNvcnBvcmF0ZSAvIE1DQSI+Q29ycG9yYXRlIC8gTUNBPC9vcHRpb24+CiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJBdWRpdCAmIEFzc3VyYW5jZSI+QXVkaXQgJiBBc3N1cmFuY2U8L29wdGlvbj4KICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkFjY291bnRpbmcgJiBBZHZpc29yeSI+QWNjb3VudGluZyAmIEFkdmlzb3J5PC9vcHRpb24+CiAgICAgICAgICAgICAgPC9zZWxlY3Q+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPGRpdj4KICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+Q29tcGxpYW5jZSAvIFN1Yi1UYXNrICo8L2xhYmVsPgogICAgICAgICAgICAgIDxzZWxlY3QgaWQ9ImFzc2lnbi1zdWItdGFzayIgcmVxdWlyZWQgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAgZm9jdXM6cmluZy0xIGZvY3VzOnJpbmctYmx1ZS01MDAiPgogICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iIj4tLSBTZWxlY3QgQ2F0ZWdvcnkgRmlyc3QgLS08L29wdGlvbj4KICAgICAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICA8IS0tIEZpbmFuY2lhbCBZZWFyICYgUmV0dXJuIFBlcmlvZCAvIEFzc2Vzc21lbnQgWWVhciAtLT4KICAgICAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZ3JpZC1jb2xzLTEgc206Z3JpZC1jb2xzLTIgZ2FwLTQiPgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5GaW5hbmNpYWwgWWVhciAoRlkpPC9sYWJlbD4KICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImFzc2lnbi1meSIgcGxhY2Vob2xkZXI9ImUuZy4gRlkgMjAyNC0yNSIgdmFsdWU9IkZZIDIwMjQtMjUiIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5QZXJpb2QgLyBBc3Nlc3NtZW50IFllYXIgKEFZKTwvbGFiZWw+CiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJhc3NpZ24tcGVyaW9kIiBwbGFjZWhvbGRlcj0iZS5nLiBBWSAyMDI1LTI2IC8gSnVseSAyMDI0IC8gUTIiIHZhbHVlPSJBWSAyMDI1LTI2IiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPCEtLSBTdGF0dXRvcnkgRHVlIERhdGUgJiBJbnRlcm5hbCBUYXJnZXQgRGF0ZSAtLT4KICAgICAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZ3JpZC1jb2xzLTEgc206Z3JpZC1jb2xzLTIgZ2FwLTQiPgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIHRleHQtcmVkLTYwMCI+U3RhdHV0b3J5IER1ZSBEYXRlICo8L2xhYmVsPgogICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJkYXRlIiBpZD0iYXNzaWduLXN0YXQtZGF0ZSIgcmVxdWlyZWQgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPkludGVybmFsIFRhcmdldCBEYXRlICo8L2xhYmVsPgogICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJkYXRlIiBpZD0iYXNzaWduLXRhcmdldC1kYXRlIiByZXF1aXJlZCBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPCEtLSBBc3NpZ25lZSAmIFByaW9yaXR5IC0tPgogICAgICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBnYXAtNCI+CiAgICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPkFzc2lnbiBUbyAoU3RhZmYgLyBBcnRpY2xlKSAqPC9sYWJlbD4KICAgICAgICAgICAgICA8c2VsZWN0IGlkPSJhc3NpZ24tdXNlci1pZCIgcmVxdWlyZWQgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAgZm9jdXM6cmluZy0xIGZvY3VzOnJpbmctYmx1ZS01MDAiPgogICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iIj4tLSBTZWxlY3QgVGVhbSBNZW1iZXIgLS08L29wdGlvbj4KICAgICAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5Qcmlvcml0eSBMZXZlbCAqPC9sYWJlbD4KICAgICAgICAgICAgICA8c2VsZWN0IGlkPSJhc3NpZ24tcHJpb3JpdHkiIHJlcXVpcmVkIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IlVyZ2VudCI+VXJnZW50IChJbW1lZGlhdGUgRGVhZGxpbmUpPC9vcHRpb24+CiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJIaWdoIj5IaWdoIFByaW9yaXR5PC9vcHRpb24+CiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJNZWRpdW0iIHNlbGVjdGVkPk1lZGl1bSBQcmlvcml0eTwvb3B0aW9uPgogICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iTG93Ij5Mb3cgUHJpb3JpdHk8L29wdGlvbj4KICAgICAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICA8IS0tIFdvcmsgTm90ZXMgJiBTcGVjaWZpYyBJbnN0cnVjdGlvbnMgLS0+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+QXVkaXQgTm90ZXMgLyBTY29wZSBJbnN0cnVjdGlvbnM8L2xhYmVsPgogICAgICAgICAgICA8dGV4dGFyZWEgaWQ9ImFzc2lnbi1ub3RlcyIgcm93cz0iMyIgcGxhY2Vob2xkZXI9IkVudGVyIHNwZWNpZmljIGNoZWNrbGlzdHMsIHBvcnRhbCBjcmVkZW50aWFscyBub3RlLCBvciBjbGllbnQgY29udGFjdCBpbnN0cnVjdGlvbnMuLi4iIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj48L3RleHRhcmVhPgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPCEtLSBTdWJtaXQgQnV0dG9uIC0tPgogICAgICAgICAgPGRpdiBjbGFzcz0icHQtNCBmbGV4IGp1c3RpZnktZW5kIGdhcC0zIj4KICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJyZXNldCIgY2xhc3M9InB4LTUgcHktMi41IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LXNsYXRlLTcwMCBob3ZlcjpiZy1zbGF0ZS01MCB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgICBSZXNldCBGb3JtCiAgICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgICAgICA8YnV0dG9uIHR5cGU9InN1Ym1pdCIgaWQ9ImJ0bi1zdWJtaXQtdGFzayIgY2xhc3M9InB4LTYgcHktMi41IHJvdW5kZWQtbGcgYmctY2EtbmF2eSB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1zZW1pYm9sZCBob3ZlcjpiZy1zbGF0ZS05MDAgdHJhbnNpdGlvbiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWNoZWNrIj48L2k+IEFsbG9jYXRlIFRhc2sgJiBDcmVhdGUgRHJpdmUgRm9sZGVyCiAgICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgICAgPC9kaXY+CgogICAgICAgIDwvZm9ybT4KICAgICAgPC9kaXY+CiAgICA8L3NlY3Rpb24+CgogICAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICAgIDwhLS0gVklFVyA1OiBCVUxLIENPTVBMSUFOQ0UgQUxMT0NBVElPTiAtLT4KICAgIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgICA8c2VjdGlvbiBpZD0idmlldy1idWxrIiBjbGFzcz0idGFiLXZpZXcgaGlkZGVuIj4KICAgICAgPGRpdiBjbGFzcz0ibWF4LXctNHhsIG14LWF1dG8gYmctd2hpdGUgcC02IHNtOnAtOCByb3VuZGVkLXhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCI+CiAgICAgICAgPGRpdiBjbGFzcz0iYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTIwMCBwYi00IG1iLTYiPgogICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1sYXllci1ncm91cCB0ZXh0LWNhLW5hdnkiPjwvaT4gQnVsayBDb21wbGlhbmNlIFRhc2sgQWxsb2NhdGlvbgogICAgICAgICAgPC9oMj4KICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIG10LTEiPkJhdGNoIGFsbG9jYXRlIHJlY3VycmluZyBjb21wbGlhbmNlIChlLmcuIEdTVFItM0IsIEFkdmFuY2UgVGF4LCBBbm51YWwgTUNBKSBhY3Jvc3MgbXVsdGlwbGUgY2xpZW50czwvcD4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGZvcm0gaWQ9ImZvcm0tYnVsay10YXNrIiBvbnN1Ym1pdD0iaGFuZGxlQnVsa0NyZWF0ZVRhc2tzKGV2ZW50KSIgY2xhc3M9InNwYWNlLXktNiI+CiAgICAgICAgICAKICAgICAgICAgIDwhLS0gQ2F0ZWdvcnkgJiBTdWItVGFzayAtLT4KICAgICAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZ3JpZC1jb2xzLTEgc206Z3JpZC1jb2xzLTIgZ2FwLTQiPgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5TZXJ2aWNlIENhdGVnb3J5ICo8L2xhYmVsPgogICAgICAgICAgICAgIDxzZWxlY3QgaWQ9ImJ1bGstc2VydmljZS1jYXQiIG9uY2hhbmdlPSJvbkJ1bGtDYXRlZ29yeUNoYW5nZSgpIiByZXF1aXJlZCBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSIiPi0tIFNlbGVjdCBDYXRlZ29yeSAtLTwvb3B0aW9uPgogICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iRGlyZWN0IFRheCI+RGlyZWN0IFRheDwvb3B0aW9uPgogICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iSW5kaXJlY3QgVGF4Ij5JbmRpcmVjdCBUYXg8L29wdGlvbj4KICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkNvcnBvcmF0ZSAvIE1DQSI+Q29ycG9yYXRlIC8gTUNBPC9vcHRpb24+CiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJBdWRpdCAmIEFzc3VyYW5jZSI+QXVkaXQgJiBBc3N1cmFuY2U8L29wdGlvbj4KICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkFjY291bnRpbmcgJiBBZHZpc29yeSI+QWNjb3VudGluZyAmIEFkdmlzb3J5PC9vcHRpb24+CiAgICAgICAgICAgICAgPC9zZWxlY3Q+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPGRpdj4KICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+Q29tcGxpYW5jZSBUYXNrICo8L2xhYmVsPgogICAgICAgICAgICAgIDxzZWxlY3QgaWQ9ImJ1bGstc3ViLXRhc2siIHJlcXVpcmVkIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IiI+LS0gU2VsZWN0IENhdGVnb3J5IEZpcnN0IC0tPC9vcHRpb24+CiAgICAgICAgICAgICAgPC9zZWxlY3Q+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPCEtLSBGaW5hbmNpYWwgWWVhciAmIFBlcmlvZCAtLT4KICAgICAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZ3JpZC1jb2xzLTEgc206Z3JpZC1jb2xzLTQgZ2FwLTQiPgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5GWTwvbGFiZWw+CiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJidWxrLWZ5IiB2YWx1ZT0iRlkgMjAyNC0yNSIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yIHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPlBlcmlvZCAvIEFZPC9sYWJlbD4KICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImJ1bGstcGVyaW9kIiB2YWx1ZT0iSnVseSAyMDI0IiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPGRpdj4KICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXJlZC02MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPlN0YXR1dG9yeSBEYXRlICo8L2xhYmVsPgogICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJkYXRlIiBpZD0iYnVsay1zdGF0LWRhdGUiIHJlcXVpcmVkIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMiB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5UYXJnZXQgRGF0ZSAqPC9sYWJlbD4KICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0iZGF0ZSIgaWQ9ImJ1bGstdGFyZ2V0LWRhdGUiIHJlcXVpcmVkIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMiB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPCEtLSBNdWx0aS1DbGllbnQgU2VsZWN0aW9uIENoZWNrbGlzdCAtLT4KICAgICAgICAgIDxkaXYgY2xhc3M9ImJvcmRlciBib3JkZXItc2xhdGUtMjAwIHJvdW5kZWQteGwgcC00IGJnLXNsYXRlLTUwLzUwIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTMiPgogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0idGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIj4KICAgICAgICAgICAgICAgIFNlbGVjdCBDbGllbnRzICg8c3BhbiBpZD0iYnVsay1zZWxlY3RlZC1jb3VudCI+MDwvc3Bhbj4gY2hvc2VuKQogICAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBnYXAtMiI+CiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgb25jbGljaz0ic2VsZWN0QWxsQnVsa0NsaWVudHModHJ1ZSkiIGNsYXNzPSJ0ZXh0LXhzIHRleHQtYmx1ZS02MDAgaG92ZXI6dW5kZXJsaW5lIj5TZWxlY3QgQWxsPC9idXR0b24+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0idGV4dC1zbGF0ZS0zMDAiPnw8L3NwYW4+CiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgb25jbGljaz0ic2VsZWN0QWxsQnVsa0NsaWVudHMoZmFsc2UpIiBjbGFzcz0idGV4dC14cyB0ZXh0LXNsYXRlLTUwMCBob3Zlcjp1bmRlcmxpbmUiPkNsZWFyPC9idXR0b24+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPGRpdiBpZD0iYnVsay1jbGllbnQtY2hlY2tsaXN0IiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBtZDpncmlkLWNvbHMtMyBnYXAtMi41IG1heC1oLTQ4IG92ZXJmbG93LXktYXV0byBwLTIgYmctd2hpdGUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCI+CiAgICAgICAgICAgICAgPCEtLSBEeW5hbWljYWxseSBwb3B1bGF0ZWQgLS0+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPCEtLSBBbGxvY2F0aW9uIE1vZGUgJiBBc3NpZ25lZXMgLS0+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCByb3VuZGVkLXhsIHAtNCBiZy1zbGF0ZS01MC81MCI+CiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTIiPlRlYW0gRGlzdHJpYnV0aW9uIFN0cmF0ZWd5PC9sYWJlbD4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBnYXAtNCBtYi0zIj4KICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQteHMgdGV4dC1zbGF0ZS03MDAgYmctd2hpdGUgcC0yLjUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBjdXJzb3ItcG9pbnRlciI+CiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9ImJ1bGstYWxsb2MtbW9kZSIgdmFsdWU9IlJvdW5kUm9iaW4iIGNoZWNrZWQgY2xhc3M9InRleHQtYmx1ZS02MDAiPgogICAgICAgICAgICAgICAgPHNwYW4+PHN0cm9uZz5Sb3VuZC1Sb2Jpbjo8L3N0cm9uZz4gQmFsYW5jZSBsb2FkIGVxdWFsbHkgYW1vbmcgc2VsZWN0ZWQgc3RhZmY8L3NwYW4+CiAgICAgICAgICAgICAgPC9sYWJlbD4KICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQteHMgdGV4dC1zbGF0ZS03MDAgYmctd2hpdGUgcC0yLjUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCBjdXJzb3ItcG9pbnRlciI+CiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFkaW8iIG5hbWU9ImJ1bGstYWxsb2MtbW9kZSIgdmFsdWU9IlNpbmdsZSIgY2xhc3M9InRleHQtYmx1ZS02MDAiPgogICAgICAgICAgICAgICAgPHNwYW4+PHN0cm9uZz5TaW5nbGUgQXNzaWduZWU6PC9zdHJvbmc+IEFzc2lnbiBhbGwgdG8gb25lIHNwZWNpZmljIHBlcnNvbjwvc3Bhbj4KICAgICAgICAgICAgICA8L2xhYmVsPgogICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5TZWxlY3QgQXNzaWduZWUocyk8L2xhYmVsPgogICAgICAgICAgICA8ZGl2IGlkPSJidWxrLXN0YWZmLWNoZWNrbGlzdCIgY2xhc3M9ImdyaWQgZ3JpZC1jb2xzLTEgc206Z3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTMgZ2FwLTIgbWF4LWgtMzYgb3ZlcmZsb3cteS1hdXRvIHAtMiBiZy13aGl0ZSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIj4KICAgICAgICAgICAgICA8IS0tIER5bmFtaWNhbGx5IHBvcHVsYXRlZCAtLT4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICA8IS0tIFN1Ym1pdCAtLT4KICAgICAgICAgIDxkaXYgY2xhc3M9InB0LTIgZmxleCBqdXN0aWZ5LWVuZCI+CiAgICAgICAgICAgIDxidXR0b24gdHlwZT0ic3VibWl0IiBpZD0iYnRuLXN1Ym1pdC1idWxrIiBjbGFzcz0icHgtNiBweS0yLjUgcm91bmRlZC1sZyBiZy1jYS1uYXZ5IHRleHQtd2hpdGUgdGV4dC14cyBmb250LXNlbWlib2xkIGhvdmVyOmJnLXNsYXRlLTkwMCB0cmFuc2l0aW9uIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIj4KICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtYm9sdCI+PC9pPiBHZW5lcmF0ZSBCdWxrIFRhc2tzCiAgICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgICAgPC9kaXY+CgogICAgICAgIDwvZm9ybT4KICAgICAgPC9kaXY+CiAgICA8L3NlY3Rpb24+CgogICAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICAgIDwhLS0gVklFVyA2OiBUQVNLIFJFQVNTSUdOTUVOVCBXSU5ET1cgLS0+CiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPHNlY3Rpb24gaWQ9InZpZXctcmVhc3NpZ24iIGNsYXNzPSJ0YWItdmlldyBoaWRkZW4iPgogICAgICA8ZGl2IGNsYXNzPSJiZy13aGl0ZSBwLTYgcm91bmRlZC14bCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgbWItNiI+CiAgICAgICAgPGRpdiBjbGFzcz0iYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTIwMCBwYi00IG1iLTYiPgogICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1hcnJvdy1yaWdodC1hcnJvdy1sZWZ0IHRleHQtY2EtbmF2eSI+PC9pPiBUYXNrIFJlYXNzaWdubWVudCAmIEhhbmRvdmVyIFdpbmRvdwogICAgICAgICAgPC9oMj4KICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIG10LTEiPlJlYXNzaWduIGluLXByb2dyZXNzIG9yIHBlbmRpbmcgdGFza3MgdG8gaGFuZGxlIHdvcmtsb2FkIHJlYmFsYW5jaW5nIG9yIGxlYXZlIGNvdmVyYWdlPC9wPgogICAgICAgIDwvZGl2PgoKICAgICAgICA8IS0tIEZpbHRlciBvcGVuIHRhc2tzIGZvciByZWFzc2lnbm1lbnQgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIGdhcC00IG1iLTQiPgogICAgICAgICAgPHNlbGVjdCBpZD0icmVhc3NpZ24tZmlsdGVyLXVzZXIiIG9uY2hhbmdlPSJyZW5kZXJSZWFzc2lnbm1lbnRUYWJsZSgpIiBjbGFzcz0idGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHB4LTMgcHktMiB0ZXh0LXNsYXRlLTcwMCI+CiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkFsbCI+QWxsIEN1cnJlbnQgQXNzaWduZWVzPC9vcHRpb24+CiAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0icmVhc3NpZ24tc2VhcmNoIiBvbmlucHV0PSJyZW5kZXJSZWFzc2lnbm1lbnRUYWJsZSgpIiBwbGFjZWhvbGRlcj0iU2VhcmNoIGNsaWVudCBvciB0YXNrLi4uIiBjbGFzcz0idGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHB4LTMgcHktMiB0ZXh0LXNsYXRlLTcwMCB3LTY0Ij4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0ib3ZlcmZsb3cteC1hdXRvIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHJvdW5kZWQtbGciPgogICAgICAgICAgPHRhYmxlIGNsYXNzPSJtaW4tdy1mdWxsIGRpdmlkZS15IGRpdmlkZS1zbGF0ZS0yMDAgdGV4dC1sZWZ0IHRleHQteHMiPgogICAgICAgICAgICA8dGhlYWQgY2xhc3M9ImJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNjAwIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIj4KICAgICAgICAgICAgICA8dHI+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+VGFzayBJRDwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+Q2xpZW50PC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5TdWItVGFzazwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+U3RhdHV0b3J5IERhdGU8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPkN1cnJlbnQgQXNzaWduZWU8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlN0YXR1czwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyB0ZXh0LXJpZ2h0Ij5BY3Rpb248L3RoPgogICAgICAgICAgICAgIDwvdHI+CiAgICAgICAgICAgIDwvdGhlYWQ+CiAgICAgICAgICAgIDx0Ym9keSBpZD0icmVhc3NpZ24tdGFibGUtYm9keSIgY2xhc3M9ImRpdmlkZS15IGRpdmlkZS1zbGF0ZS0yMDAgdGV4dC1zbGF0ZS03MDAiPjwvdGJvZHk+CiAgICAgICAgICA8L3RhYmxlPgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KICAgIDwvc2VjdGlvbj4KCiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPCEtLSBWSUVXIDc6IENMSUVOVCBNQVNURVIgRElSRUNUT1JZIChDT05GSURFTlRJQUwpIC0tPgogICAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICAgIDxzZWN0aW9uIGlkPSJ2aWV3LWNsaWVudHMiIGNsYXNzPSJ0YWItdmlldyBoaWRkZW4iPgogICAgICA8ZGl2IGNsYXNzPSJiZy13aGl0ZSBwLTYgcm91bmRlZC14bCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAiPgogICAgICAgIDxkaXYgY2xhc3M9ImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcGItNCBtYi02IGJvcmRlci1iIGJvcmRlci1zbGF0ZS0yMDAgZ2FwLTQiPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLWJ1aWxkaW5nLXVzZXIgdGV4dC1jYS1uYXZ5Ij48L2k+IENvbmZpZGVudGlhbCBDbGllbnQgTWFzdGVyCiAgICAgICAgICAgIDwvaDI+CiAgICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIG10LTEiPkRpcmVjdCBQQU4sIEdTVElOLCBDSU4gcmVnaXN0ZXJzIGFuZCBzZWN1cmVkIHBvcnRhbCBjcmVkZW50aWFsIGxpbmtzPC9wPgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMiPgogICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImNsaWVudC1zZWFyY2giIG9uaW5wdXQ9InJlbmRlckNsaWVudHNNYXN0ZXIoKSIgcGxhY2Vob2xkZXI9IlNlYXJjaCBQQU4sIEdTVElOLCBDbGllbnQuLi4iIGNsYXNzPSJ0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcHgtMyBweS0yIHRleHQtc2xhdGUtNzAwIHctNjAiPgogICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9Im9wZW5DbGllbnRNb2RhbCgpIiBjbGFzcz0icHgtNCBweS0yIHJvdW5kZWQtbGcgYmctY2EtbmF2eSB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1zZW1pYm9sZCBob3ZlcjpiZy1zbGF0ZS05MDAgdHJhbnNpdGlvbiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXBsdXMiPjwvaT4gQWRkIE5ldyBDbGllbnQKICAgICAgICAgICAgPC9idXR0b24+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPCEtLSBDbGllbnRzIEdyaWQgLS0+CiAgICAgICAgPGRpdiBjbGFzcz0ib3ZlcmZsb3cteC1hdXRvIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHJvdW5kZWQtbGciPgogICAgICAgICAgPHRhYmxlIGNsYXNzPSJtaW4tdy1mdWxsIGRpdmlkZS15IGRpdmlkZS1zbGF0ZS0yMDAgdGV4dC1sZWZ0IHRleHQteHMiPgogICAgICAgICAgICA8dGhlYWQgY2xhc3M9ImJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNjAwIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIj4KICAgICAgICAgICAgICA8dHI+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+Q2xpZW50IElEPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5MZWdhbCBOYW1lICYgVHJhZGUgTmFtZTwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+RW50aXR5IFR5cGU8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlBBTjwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+R1NUSU48L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPkNvbnRhY3QgUGVyc29uPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5CaWxsaW5nIEdyb3VwPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIHRleHQtcmlnaHQiPkFjdGlvbnM8L3RoPgogICAgICAgICAgICAgIDwvdHI+CiAgICAgICAgICAgIDwvdGhlYWQ+CiAgICAgICAgICAgIDx0Ym9keSBpZD0iY2xpZW50cy10YWJsZS1ib2R5IiBjbGFzcz0iZGl2aWRlLXkgZGl2aWRlLXNsYXRlLTIwMCB0ZXh0LXNsYXRlLTcwMCI+PC90Ym9keT4KICAgICAgICAgIDwvdGFibGU+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgPC9zZWN0aW9uPgoKICAgIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgICA8IS0tIFZJRVcgODogVVNFUiAmIFRFQU0gTUFOQUdFTUVOVCAoU1VQRVIgQURNSU4gT05MWSkgLS0+CiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPHNlY3Rpb24gaWQ9InZpZXctdXNlcnMiIGNsYXNzPSJ0YWItdmlldyBoaWRkZW4iPgogICAgICA8ZGl2IGNsYXNzPSJiZy13aGl0ZSBwLTYgcm91bmRlZC14bCBzaGFkb3ctc20gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAiPgogICAgICAgIDxkaXYgY2xhc3M9ImZsZXggZmxleC13cmFwIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcGItNCBtYi02IGJvcmRlci1iIGJvcmRlci1zbGF0ZS0yMDAgZ2FwLTQiPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXVzZXJzLWdlYXIgdGV4dC1jYS1uYXZ5Ij48L2k+IEZpcm0gVXNlciAmIFJCQUMgTWFuYWdlbWVudAogICAgICAgICAgICA8L2gyPgogICAgICAgICAgICA8cCBjbGFzcz0idGV4dC14cyB0ZXh0LXNsYXRlLTUwMCBtdC0xIj5TdXBlciBBZG1pbiBjb250cm9sOiBQcm92aXNpb24gcGFydG5lcnMsIG1hbmFnZXJzLCBhbmQgYXJ0aWNsZSB0cmFpbmVlczwvcD4KICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIj4KICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJvcGVuVXNlck1vZGFsKCkiIGNsYXNzPSJweC00IHB5LTIgcm91bmRlZC1sZyBiZy1jYS1uYXZ5IHRleHQtd2hpdGUgdGV4dC14cyBmb250LXNlbWlib2xkIGhvdmVyOmJnLXNsYXRlLTkwMCB0cmFuc2l0aW9uIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIj4KICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtdXNlci1wbHVzIj48L2k+IEFkZCBOZXcgVGVhbSBNZW1iZXIKICAgICAgICAgICAgPC9idXR0b24+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0ib3ZlcmZsb3cteC1hdXRvIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHJvdW5kZWQtbGciPgogICAgICAgICAgPHRhYmxlIGNsYXNzPSJtaW4tdy1mdWxsIGRpdmlkZS15IGRpdmlkZS1zbGF0ZS0yMDAgdGV4dC1sZWZ0IHRleHQteHMiPgogICAgICAgICAgICA8dGhlYWQgY2xhc3M9ImJnLXNsYXRlLTUwIHRleHQtc2xhdGUtNjAwIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIj4KICAgICAgICAgICAgICA8dHI+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+VXNlciBJRDwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+RnVsbCBOYW1lPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5FbWFpbCBBZGRyZXNzPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5Sb2xlPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5EZXBhcnRtZW50PC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5TdGF0dXM8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMgdGV4dC1yaWdodCI+QWN0aW9uPC90aD4KICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICA8L3RoZWFkPgogICAgICAgICAgICA8dGJvZHkgaWQ9InVzZXJzLXRhYmxlLWJvZHkiIGNsYXNzPSJkaXZpZGUteSBkaXZpZGUtc2xhdGUtMjAwIHRleHQtc2xhdGUtNzAwIj48L3Rib2R5PgogICAgICAgICAgPC90YWJsZT4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L3NlY3Rpb24+CgogICAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICAgIDwhLS0gVklFVyA5OiBBQ1RJVklUWSAmIEFVRElUIExPR1MgLS0+CiAgICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogICAgPHNlY3Rpb24gaWQ9InZpZXctbG9ncyIgY2xhc3M9InRhYi12aWV3IGhpZGRlbiI+CiAgICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHAtNiByb3VuZGVkLXhsIHNoYWRvdy1zbSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCI+CiAgICAgICAgPGRpdiBjbGFzcz0iYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTIwMCBwYi00IG1iLTYiPgogICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1jbG9jay1yb3RhdGUtbGVmdCB0ZXh0LWNhLW5hdnkiPjwvaT4gQ29tcGxpYW5jZSBBY3Rpdml0eSBBdWRpdCBUcmFpbAogICAgICAgICAgPC9oMj4KICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIG10LTEiPkltbXV0YWJsZSBzeXN0ZW0gbG9ncyBmb3IgSUNBSSBjb21wbGlhbmNlLCBhdWRpdCBldmlkZW5jZSwgYW5kIHRhc2sgc3RhdHVzIGhhbmRvZmZzPC9wPgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2IGNsYXNzPSJvdmVyZmxvdy14LWF1dG8gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgcm91bmRlZC1sZyI+CiAgICAgICAgICA8dGFibGUgY2xhc3M9Im1pbi13LWZ1bGwgZGl2aWRlLXkgZGl2aWRlLXNsYXRlLTIwMCB0ZXh0LWxlZnQgdGV4dC14cyI+CiAgICAgICAgICAgIDx0aGVhZCBjbGFzcz0iYmctc2xhdGUtNTAgdGV4dC1zbGF0ZS02MDAgZm9udC1zZW1pYm9sZCB1cHBlcmNhc2UiPgogICAgICAgICAgICAgIDx0cj4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5UaW1lc3RhbXA8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlRhc2sgSUQ8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPlVzZXI8L3RoPgogICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJweC00IHB5LTMiPkFjdGlvbiBUeXBlPC90aD4KICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0icHgtNCBweS0zIj5QcmV2aW91cyBTdGF0ZTwvdGg+CiAgICAgICAgICAgICAgICA8dGggY2xhc3M9InB4LTQgcHktMyI+VXBkYXRlZCBTdGF0ZSAvIFJlbWFya3M8L3RoPgogICAgICAgICAgICAgIDwvdHI+CiAgICAgICAgICAgIDwvdGhlYWQ+CiAgICAgICAgICAgIDx0Ym9keSBpZD0ibG9ncy10YWJsZS1ib2R5IiBjbGFzcz0iZGl2aWRlLXkgZGl2aWRlLXNsYXRlLTIwMCB0ZXh0LXNsYXRlLTcwMCI+PC90Ym9keT4KICAgICAgICAgIDwvdGFibGU+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgPC9zZWN0aW9uPgoKICA8L21haW4+CgogIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgPCEtLSBNT0RBTCAxOiBUQVNLIFdPUksgU1VCTUlTU0lPTiAmIENPTVBMRVRJT04gLS0+CiAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICA8ZGl2IGlkPSJtb2RhbC10YXNrLXN1Ym1pdCIgY2xhc3M9ImZpeGVkIGluc2V0LTAgYmctc2xhdGUtOTAwLzUwIGJhY2tkcm9wLWJsdXIteHMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00IHotNTAgaGlkZGVuIj4KICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHJvdW5kZWQteGwgc2hhZG93LXhsIG1heC13LWxnIHctZnVsbCBvdmVyZmxvdy1oaWRkZW4gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAiPgogICAgICA8ZGl2IGNsYXNzPSJiZy1jYS1uYXZ5IHRleHQtd2hpdGUgcC00IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiI+CiAgICAgICAgPGgzIGNsYXNzPSJmb250LWJvbGQgdGV4dC1zbSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtZmlsZS1zaWduYXR1cmUgdGV4dC1hbWJlci00MDAiPjwvaT4gU3VibWl0IFdvcmtpbmcgUGFwZXJzIC8gQ29tcGxldGUgVGFzawogICAgICAgIDwvaDM+CiAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJjbG9zZU1vZGFsKCdtb2RhbC10YXNrLXN1Ym1pdCcpIiBjbGFzcz0idGV4dC13aGl0ZS83MCBob3Zlcjp0ZXh0LXdoaXRlIj4KICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS14bWFyayI+PC9pPgogICAgICAgIDwvYnV0dG9uPgogICAgICA8L2Rpdj4KCiAgICAgIDxmb3JtIGlkPSJmb3JtLXRhc2stc3VibWl0IiBvbnN1Ym1pdD0iaGFuZGxlVGFza1N1Ym1pdChldmVudCkiIGNsYXNzPSJwLTYgc3BhY2UteS00Ij4KICAgICAgICA8aW5wdXQgdHlwZT0iaGlkZGVuIiBpZD0ic3VibWl0LXRhc2staWQiPgoKICAgICAgICA8ZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0idGV4dC14cyB0ZXh0LXNsYXRlLTUwMCI+VGFzayBSZWZlcmVuY2U6PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgdGV4dC1zbSIgaWQ9InN1Ym1pdC10YXNrLXN1bW1hcnkiPi4uLjwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2PgogICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPlRhcmdldCBTdGF0dXMgKjwvbGFiZWw+CiAgICAgICAgICA8c2VsZWN0IGlkPSJzdWJtaXQtbmV3LXN0YXR1cyIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJSZXZpZXcgUmVxdWlyZWQiIHNlbGVjdGVkPlJldmlldyBSZXF1aXJlZCAoU2VuZCBmb3IgUGFydG5lciBBcHByb3ZhbCk8L29wdGlvbj4KICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iQ29tcGxldGVkIj5Db21wbGV0ZWQgKEZpbmFsaXplZCAvIEUtRmlsZWQpPC9vcHRpb24+CiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkluIFByb2dyZXNzIj5JbiBQcm9ncmVzcyAoU2F2ZSBXb3JrIE5vdGVzIC8gRmlsZXMgT25seSk8L29wdGlvbj4KICAgICAgICAgIDwvc2VsZWN0PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2PgogICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPkZpbGluZyBBY2sgTm8gLyBDaGFsbGFuIEJTUiAvIFJlbWFya3M8L2xhYmVsPgogICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJzdWJtaXQtYWNrLW5vIiBwbGFjZWhvbGRlcj0iZS5nLiBBY2sgTm86IDg3MTIzNDkwODEyIG9yIEJTUiBDb2RlIDAyMTAwNCIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2PgogICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPkV4ZWN1dGlvbiBXb3JrIE5vdGVzPC9sYWJlbD4KICAgICAgICAgIDx0ZXh0YXJlYSBpZD0ic3VibWl0LXdvcmstbm90ZXMiIHJvd3M9IjMiIHBsYWNlaG9sZGVyPSJTdW1tYXJ5IG9mIGF1ZGl0IGNoZWNrcywgd29ya2luZyBwYXBlciByZWZlcmVuY2VzLCB0YXggcGF5YWJsZSBjb21wdXRhdGlvbi4uLiIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPjwvdGV4dGFyZWE+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDwhLS0gV29ya2luZyBQYXBlciBGaWxlIFVwbG9hZCB0byBHb29nbGUgRHJpdmUgLS0+CiAgICAgICAgPGRpdj4KICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5BdHRhY2ggRmluYWwgRGVsaXZlcmFibGVzIC8gV29ya2luZyBQYXBlcnM8L2xhYmVsPgogICAgICAgICAgPGlucHV0IHR5cGU9ImZpbGUiIGlkPSJzdWJtaXQtZmlsZS1pbnB1dCIgbXVsdGlwbGUgY2xhc3M9InctZnVsbCB0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIGZpbGU6bXItMyBmaWxlOnB5LTIgZmlsZTpweC00IGZpbGU6cm91bmRlZC1sZyBmaWxlOmJvcmRlci0wIGZpbGU6dGV4dC14cyBmaWxlOmZvbnQtc2VtaWJvbGQgZmlsZTpiZy1ibHVlLTUwIGZpbGU6dGV4dC1ibHVlLTcwMCBob3ZlcjpmaWxlOmJnLWJsdWUtMTAwIj4KICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LVsxMXB4XSB0ZXh0LXNsYXRlLTQwMCBtdC0xIj5GaWxlcyB3aWxsIGJlIHNhZmVseSBzdG9yZWQgaW4gR29vZ2xlIERyaXZlIHVuZGVyOiA8Y29kZT5DQSBQcmFjdGljZSBGaWxlcyAvIFtDbGllbnRdIC8gW1Rhc2tfSURdPC9jb2RlPjwvcD4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0icHQtMyBib3JkZXItdCBib3JkZXItc2xhdGUtMjAwIGZsZXgganVzdGlmeS1lbmQgZ2FwLTMiPgogICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uY2xpY2s9ImNsb3NlTW9kYWwoJ21vZGFsLXRhc2stc3VibWl0JykiIGNsYXNzPSJweC00IHB5LTIgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtc2xhdGUtNzAwIGhvdmVyOmJnLXNsYXRlLTUwIj5DYW5jZWw8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gdHlwZT0ic3VibWl0IiBpZD0iYnRuLXNhdmUtc3VibWl0IiBjbGFzcz0icHgtNSBweS0yIHJvdW5kZWQtbGcgYmctZW1lcmFsZC02MDAgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgaG92ZXI6YmctZW1lcmFsZC03MDAgdHJhbnNpdGlvbiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41Ij4KICAgICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXBhcGVyLXBsYW5lIj48L2k+IFN1Ym1pdCAmIFVwZGF0ZQogICAgICAgICAgPC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZm9ybT4KICAgIDwvZGl2PgogIDwvZGl2PgoKICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogIDwhLS0gTU9EQUwgMjogUEFSVE5FUiBSRVZJRVcgKEFQUFJPVkUgT1IgUkVXT1JLKSAtLT4KICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogIDxkaXYgaWQ9Im1vZGFsLXBhcnRuZXItcmV2aWV3IiBjbGFzcz0iZml4ZWQgaW5zZXQtMCBiZy1zbGF0ZS05MDAvNTAgYmFja2Ryb3AtYmx1ci14cyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTQgei01MCBoaWRkZW4iPgogICAgPGRpdiBjbGFzcz0iYmctd2hpdGUgcm91bmRlZC14bCBzaGFkb3cteGwgbWF4LXctbWQgdy1mdWxsIG92ZXJmbG93LWhpZGRlbiBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCI+CiAgICAgIDxkaXYgY2xhc3M9ImJnLWNhLW5hdnkgdGV4dC13aGl0ZSBwLTQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIj4KICAgICAgICA8aDMgY2xhc3M9ImZvbnQtYm9sZCB0ZXh0LXNtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIj4KICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1zaWduYXR1cmUgdGV4dC1wdXJwbGUtNDAwIj48L2k+IFBhcnRuZXIgUXVhbGl0eSBSZXZpZXcKICAgICAgICA8L2gzPgogICAgICAgIDxidXR0b24gb25jbGljaz0iY2xvc2VNb2RhbCgnbW9kYWwtcGFydG5lci1yZXZpZXcnKSIgY2xhc3M9InRleHQtd2hpdGUvNzAgaG92ZXI6dGV4dC13aGl0ZSI+CiAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEteG1hcmsiPjwvaT4KICAgICAgICA8L2J1dHRvbj4KICAgICAgPC9kaXY+CgogICAgICA8Zm9ybSBpZD0iZm9ybS1wYXJ0bmVyLXJldmlldyIgb25zdWJtaXQ9ImhhbmRsZVBhcnRuZXJSZXZpZXdTdWJtaXQoZXZlbnQpIiBjbGFzcz0icC02IHNwYWNlLXktNCI+CiAgICAgICAgPGlucHV0IHR5cGU9ImhpZGRlbiIgaWQ9InJldmlldy10YXNrLWlkIj4KCiAgICAgICAgPGRpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InRleHQteHMgdGV4dC1zbGF0ZS01MDAiPlJldmlld2luZyBUYXNrOjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIHRleHQtc20iIGlkPSJyZXZpZXctdGFzay1zdW1tYXJ5Ij4uLi48L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdj4KICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5QYXJ0bmVyIFJldmlldyBEZWNpc2lvbiAqPC9sYWJlbD4KICAgICAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTMiPgogICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHAtMyByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZW1lcmFsZC0yMDAgYmctZW1lcmFsZC01MC81MCBjdXJzb3ItcG9pbnRlciI+CiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InJhZGlvIiBuYW1lPSJyZXZpZXctZGVjaXNpb24iIHZhbHVlPSJBcHByb3ZlIiBjaGVja2VkIGNsYXNzPSJ0ZXh0LWVtZXJhbGQtNjAwIj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0idGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZW1lcmFsZC04MDAiPkFwcHJvdmUgJiBNYXJrIENvbXBsZXRlZDwvc3Bhbj4KICAgICAgICAgICAgPC9sYWJlbD4KICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBwLTMgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMCBiZy1hbWJlci01MC81MCBjdXJzb3ItcG9pbnRlciI+CiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9InJhZGlvIiBuYW1lPSJyZXZpZXctZGVjaXNpb24iIHZhbHVlPSJSZXdvcmsiIGNsYXNzPSJ0ZXh0LWFtYmVyLTYwMCI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWFtYmVyLTgwMCI+UmVxdWVzdCBSZXdvcmsgKFJldHVybik8L3NwYW4+CiAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdj4KICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5QYXJ0bmVyIFJlbWFya3MgLyBGZWVkYmFjazwvbGFiZWw+CiAgICAgICAgICA8dGV4dGFyZWEgaWQ9InJldmlldy1yZW1hcmtzIiByb3dzPSIzIiByZXF1aXJlZCBwbGFjZWhvbGRlcj0iVmVyaWZpY2F0aW9uIG9ic2VydmF0aW9ucywgc2lnbmF0dXJlIGNsZWFyYW5jZSwgb3IgaXRlbXMgbmVlZGluZyBjb3JyZWN0aW9uLi4uIiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+PC90ZXh0YXJlYT4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0icHQtMyBib3JkZXItdCBib3JkZXItc2xhdGUtMjAwIGZsZXgganVzdGlmeS1lbmQgZ2FwLTMiPgogICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uY2xpY2s9ImNsb3NlTW9kYWwoJ21vZGFsLXBhcnRuZXItcmV2aWV3JykiIGNsYXNzPSJweC00IHB5LTIgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtc2xhdGUtNzAwIGhvdmVyOmJnLXNsYXRlLTUwIj5DYW5jZWw8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gdHlwZT0ic3VibWl0IiBjbGFzcz0icHgtNSBweS0yIHJvdW5kZWQtbGcgYmctY2EtbmF2eSB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1zZW1pYm9sZCBob3ZlcjpiZy1zbGF0ZS05MDAgdHJhbnNpdGlvbiI+CiAgICAgICAgICAgIENvbmZpcm0gRGVjaXNpb24KICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICA8L2Zvcm0+CiAgICA8L2Rpdj4KICA8L2Rpdj4KCiAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICA8IS0tIE1PREFMIDM6IFJFQVNTSUdOIFRBU0sgLS0+CiAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICA8ZGl2IGlkPSJtb2RhbC1yZWFzc2lnbiIgY2xhc3M9ImZpeGVkIGluc2V0LTAgYmctc2xhdGUtOTAwLzUwIGJhY2tkcm9wLWJsdXIteHMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00IHotNTAgaGlkZGVuIj4KICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHJvdW5kZWQteGwgc2hhZG93LXhsIG1heC13LW1kIHctZnVsbCBvdmVyZmxvdy1oaWRkZW4gYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAiPgogICAgICA8ZGl2IGNsYXNzPSJiZy1jYS1uYXZ5IHRleHQtd2hpdGUgcC00IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiI+CiAgICAgICAgPGgzIGNsYXNzPSJmb250LWJvbGQgdGV4dC1zbSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiI+CiAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtYXJyb3ctcmlnaHQtYXJyb3ctbGVmdCB0ZXh0LWFtYmVyLTQwMCI+PC9pPiBSZWFzc2lnbiBUYXNrCiAgICAgICAgPC9oMz4KICAgICAgICA8YnV0dG9uIG9uY2xpY2s9ImNsb3NlTW9kYWwoJ21vZGFsLXJlYXNzaWduJykiIGNsYXNzPSJ0ZXh0LXdoaXRlLzcwIGhvdmVyOnRleHQtd2hpdGUiPgogICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXhtYXJrIj48L2k+CiAgICAgICAgPC9idXR0b24+CiAgICAgIDwvZGl2PgoKICAgICAgPGZvcm0gaWQ9ImZvcm0tcmVhc3NpZ24tdGFzayIgb25zdWJtaXQ9ImhhbmRsZVJlYXNzaWduU3VibWl0KGV2ZW50KSIgY2xhc3M9InAtNiBzcGFjZS15LTQiPgogICAgICAgIDxpbnB1dCB0eXBlPSJoaWRkZW4iIGlkPSJtb2RhbC1yZWFzc2lnbi10YXNrLWlkIj4KCiAgICAgICAgPGRpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InRleHQteHMgdGV4dC1zbGF0ZS01MDAiPlJlYXNzaWduaW5nIFRhc2s6PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAgdGV4dC1zbSIgaWQ9Im1vZGFsLXJlYXNzaWduLXN1bW1hcnkiPi4uLjwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2PgogICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPk5ldyBBc3NpZ25lZSAqPC9sYWJlbD4KICAgICAgICAgIDxzZWxlY3QgaWQ9Im1vZGFsLXJlYXNzaWduLXVzZXIiIHJlcXVpcmVkIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iIj4tLSBTZWxlY3QgTmV3IFRlYW0gTWVtYmVyIC0tPC9vcHRpb24+CiAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdj4KICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5SZWFzc2lnbm1lbnQgUmVhc29uICo8L2xhYmVsPgogICAgICAgICAgPHRleHRhcmVhIGlkPSJtb2RhbC1yZWFzc2lnbi1yZWFzb24iIHJvd3M9IjMiIHJlcXVpcmVkIHBsYWNlaG9sZGVyPSJTdGF0ZSByZWFzb24gKGUuZy4gQXJ0aWNsZSBUcmFpbmVlIGV4YW1pbmF0aW9uIGxlYXZlLCB3b3JrbG9hZCByZWJhbGFuY2UpLi4uIiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+PC90ZXh0YXJlYT4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0icHQtMyBib3JkZXItdCBib3JkZXItc2xhdGUtMjAwIGZsZXgganVzdGlmeS1lbmQgZ2FwLTMiPgogICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uY2xpY2s9ImNsb3NlTW9kYWwoJ21vZGFsLXJlYXNzaWduJykiIGNsYXNzPSJweC00IHB5LTIgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtc2xhdGUtNzAwIGhvdmVyOmJnLXNsYXRlLTUwIj5DYW5jZWw8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gdHlwZT0ic3VibWl0IiBjbGFzcz0icHgtNSBweS0yIHJvdW5kZWQtbGcgYmctYW1iZXItNjAwIHRleHQtd2hpdGUgdGV4dC14cyBmb250LXNlbWlib2xkIGhvdmVyOmJnLWFtYmVyLTcwMCB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgQ29uZmlybSBIYW5kb3ZlcgogICAgICAgICAgPC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZm9ybT4KICAgIDwvZGl2PgogIDwvZGl2PgoKICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogIDwhLS0gTU9EQUwgNDogQUREL0VESVQgQ0xJRU5UIC0tPgogIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgPGRpdiBpZD0ibW9kYWwtY2xpZW50IiBjbGFzcz0iZml4ZWQgaW5zZXQtMCBiZy1zbGF0ZS05MDAvNTAgYmFja2Ryb3AtYmx1ci14cyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTQgei01MCBoaWRkZW4iPgogICAgPGRpdiBjbGFzcz0iYmctd2hpdGUgcm91bmRlZC14bCBzaGFkb3cteGwgbWF4LXcteGwgdy1mdWxsIG92ZXJmbG93LWhpZGRlbiBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMCI+CiAgICAgIDxkaXYgY2xhc3M9ImJnLWNhLW5hdnkgdGV4dC13aGl0ZSBwLTQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIj4KICAgICAgICA8aDMgY2xhc3M9ImZvbnQtYm9sZCB0ZXh0LXNtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIj4KICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1idWlsZGluZy1jaXJjbGUtY2hlY2sgdGV4dC1ibHVlLTMwMCI+PC9pPiBDbGllbnQgTWFzdGVyIFJlY29yZAogICAgICAgIDwvaDM+CiAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJjbG9zZU1vZGFsKCdtb2RhbC1jbGllbnQnKSIgY2xhc3M9InRleHQtd2hpdGUvNzAgaG92ZXI6dGV4dC13aGl0ZSI+CiAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEteG1hcmsiPjwvaT4KICAgICAgICA8L2J1dHRvbj4KICAgICAgPC9kaXY+CgogICAgICA8Zm9ybSBpZD0iZm9ybS1jbGllbnQtbWFzdGVyIiBvbnN1Ym1pdD0iaGFuZGxlU2F2ZUNsaWVudChldmVudCkiIGNsYXNzPSJwLTYgc3BhY2UteS00Ij4KICAgICAgICA8aW5wdXQgdHlwZT0iaGlkZGVuIiBpZD0iY2xpZW50LWVkaXQtaWQiPgoKICAgICAgICA8ZGl2IGNsYXNzPSJncmlkIGdyaWQtY29scy0xIHNtOmdyaWQtY29scy0yIGdhcC00Ij4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5MZWdhbCBOYW1lICo8L2xhYmVsPgogICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImNsaWVudC1sZWdhbC1uYW1lIiByZXF1aXJlZCBwbGFjZWhvbGRlcj0iZS5nLiBBY21lIEluZHVzdHJpZXMgUHZ0IEx0ZCIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+VHJhZGUgTmFtZTwvbGFiZWw+CiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2xpZW50LXRyYWRlLW5hbWUiIHBsYWNlaG9sZGVyPSJlLmcuIEFjbWUgVGVjaCIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxkaXYgY2xhc3M9ImdyaWQgZ3JpZC1jb2xzLTEgc206Z3JpZC1jb2xzLTMgZ2FwLTQiPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPkVudGl0eSBUeXBlICo8L2xhYmVsPgogICAgICAgICAgICA8c2VsZWN0IGlkPSJjbGllbnQtZW50aXR5LXR5cGUiIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJQcml2YXRlIEx0ZCI+UHJpdmF0ZSBMdGQ8L29wdGlvbj4KICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJMTFAiPkxMUDwvb3B0aW9uPgogICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IkZpcm0iPlBhcnRuZXJzaGlwIEZpcm08L29wdGlvbj4KICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJJbmRpdmlkdWFsIj5JbmRpdmlkdWFsIChQcm9wL0hOSSk8L29wdGlvbj4KICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJUcnVzdCI+VHJ1c3QgLyBOR08gKDEyQS84MEcpPC9vcHRpb24+CiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iUHVibGljIEx0ZCI+UHVibGljIEx0ZDwvb3B0aW9uPgogICAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPlBBTiAqPC9sYWJlbD4KICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJjbGllbnQtcGFuIiByZXF1aXJlZCBwbGFjZWhvbGRlcj0iQUJDREUxMjM0RiIgbWF4bGVuZ3RoPSIxMCIgY2xhc3M9InVwcGVyY2FzZSB3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPkdTVElOPC9sYWJlbD4KICAgICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJjbGllbnQtZ3N0aW4iIHBsYWNlaG9sZGVyPSIyN0FCQ0RFMTIzNEYxWjUiIG1heGxlbmd0aD0iMTUiIGNsYXNzPSJ1cHBlcmNhc2Ugdy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMyBnYXAtNCI+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+Q29udGFjdCBQZXJzb248L2xhYmVsPgogICAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImNsaWVudC1jb250YWN0IiBwbGFjZWhvbGRlcj0iRGlyZWN0b3IgLyBPZmZpY2VyIE5hbWUiIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPk1vYmlsZTwvbGFiZWw+CiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2xpZW50LW1vYmlsZSIgcGxhY2Vob2xkZXI9Iis5MSA5OC4uLiIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+RW1haWw8L2xhYmVsPgogICAgICAgICAgICA8aW5wdXQgdHlwZT0iZW1haWwiIGlkPSJjbGllbnQtZW1haWwiIHBsYWNlaG9sZGVyPSJhY2NvdW50c0BjbGllbnQuY29tIiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBncmlkLWNvbHMtMSBzbTpncmlkLWNvbHMtMiBnYXAtNCI+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+QmlsbGluZyBSZXRhaW5lciBHcm91cDwvbGFiZWw+CiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2xpZW50LWJpbGxpbmciIHBsYWNlaG9sZGVyPSJlLmcuIFRpZXItMSBNb250aGx5IC8gQW5udWFsIEF1ZGl0IiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5Qb3J0YWwgQ3JlZGVudGlhbHMgVmF1bHQgTGluazwvbGFiZWw+CiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0iY2xpZW50LXZhdWx0IiBwbGFjZWhvbGRlcj0iaHR0cHM6Ly92YXVsdC5pbnRlcm5hbC8uLi4iIGNsYXNzPSJ3LWZ1bGwgdGV4dC14cyBiZy1zbGF0ZS01MCBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCByb3VuZGVkLWxnIHAtMi41IHRleHQtc2xhdGUtODAwIj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2IGNsYXNzPSJwdC0zIGJvcmRlci10IGJvcmRlci1zbGF0ZS0yMDAgZmxleCBqdXN0aWZ5LWVuZCBnYXAtMyI+CiAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgb25jbGljaz0iY2xvc2VNb2RhbCgnbW9kYWwtY2xpZW50JykiIGNsYXNzPSJweC00IHB5LTIgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXNsYXRlLTMwMCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtc2xhdGUtNzAwIGhvdmVyOmJnLXNsYXRlLTUwIj5DYW5jZWw8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gdHlwZT0ic3VibWl0IiBjbGFzcz0icHgtNSBweS0yIHJvdW5kZWQtbGcgYmctY2EtbmF2eSB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1zZW1pYm9sZCBob3ZlcjpiZy1zbGF0ZS05MDAgdHJhbnNpdGlvbiI+U2F2ZSBDbGllbnQ8L2J1dHRvbj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9mb3JtPgogICAgPC9kaXY+CiAgPC9kaXY+CgogIDwhLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLS0+CiAgPCEtLSBNT0RBTCA1OiBBREQvRURJVCBVU0VSIChTVVBFUiBBRE1JTiBPTkxZKSAtLT4KICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogIDxkaXYgaWQ9Im1vZGFsLXVzZXIiIGNsYXNzPSJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC81MCBiYWNrZHJvcC1ibHVyLXhzIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHAtNCB6LTUwIGhpZGRlbiI+CiAgICA8ZGl2IGNsYXNzPSJiZy13aGl0ZSByb3VuZGVkLXhsIHNoYWRvdy14bCBtYXgtdy1tZCB3LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIj4KICAgICAgPGRpdiBjbGFzcz0iYmctY2EtbmF2eSB0ZXh0LXdoaXRlIHAtNCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4iPgogICAgICAgIDxoMyBjbGFzcz0iZm9udC1ib2xkIHRleHQtc20gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIiPgogICAgICAgICAgPGkgY2xhc3M9ImZhLXNvbGlkIGZhLXVzZXItc2hpZWxkIHRleHQtYW1iZXItNDAwIj48L2k+IE1hbmFnZSBUZWFtIFVzZXIKICAgICAgICA8L2gzPgogICAgICAgIDxidXR0b24gb25jbGljaz0iY2xvc2VNb2RhbCgnbW9kYWwtdXNlcicpIiBjbGFzcz0idGV4dC13aGl0ZS83MCBob3Zlcjp0ZXh0LXdoaXRlIj4KICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS14bWFyayI+PC9pPgogICAgICAgIDwvYnV0dG9uPgogICAgICA8L2Rpdj4KCiAgICAgIDxmb3JtIGlkPSJmb3JtLXVzZXItbWFzdGVyIiBvbnN1Ym1pdD0iaGFuZGxlU2F2ZVVzZXIoZXZlbnQpIiBjbGFzcz0icC02IHNwYWNlLXktNCI+CiAgICAgICAgPGlucHV0IHR5cGU9ImhpZGRlbiIgaWQ9InVzZXItZWRpdC1pZCI+CgogICAgICAgIDxkaXY+CiAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+RnVsbCBOYW1lICo8L2xhYmVsPgogICAgICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJ1c2VyLWZ1bGxuYW1lIiByZXF1aXJlZCBwbGFjZWhvbGRlcj0iZS5nLiBDQSBSYW1lc2ggU2hhcm1hIiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxkaXY+CiAgICAgICAgICA8bGFiZWwgY2xhc3M9ImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMSI+RW1haWwgQWRkcmVzcyAqPC9sYWJlbD4KICAgICAgICAgIDxpbnB1dCB0eXBlPSJlbWFpbCIgaWQ9InVzZXItZW1haWwiIHJlcXVpcmVkIHBsYWNlaG9sZGVyPSJ1c2VyQGdtYWlsLmNvbSIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2IGNsYXNzPSJncmlkIGdyaWQtY29scy0yIGdhcC00Ij4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5TeXN0ZW0gUm9sZSAqPC9sYWJlbD4KICAgICAgICAgICAgPHNlbGVjdCBpZD0idXNlci1yb2xlIiByZXF1aXJlZCBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iU3RhZmYvQXJ0aWNsZV9UcmFpbmVlIj5TdGFmZiAvIEFydGljbGUgVHJhaW5lZTwvb3B0aW9uPgogICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9IlBhcnRuZXIvTWFuYWdlciI+UGFydG5lciAvIE1hbmFnZXI8L29wdGlvbj4KICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJTdXBlcl9BZG1pbiI+U3VwZXIgQWRtaW4gKE1hbmFnaW5nIFBhcnRuZXIpPC9vcHRpb24+CiAgICAgICAgICAgIDwvc2VsZWN0PgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGxhYmVsIGNsYXNzPSJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS03MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEiPlN0YXR1czwvbGFiZWw+CiAgICAgICAgICAgIDxzZWxlY3QgaWQ9InVzZXItc3RhdHVzIiBjbGFzcz0idy1mdWxsIHRleHQteHMgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgcm91bmRlZC1sZyBwLTIuNSB0ZXh0LXNsYXRlLTgwMCI+CiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iQWN0aXZlIj5BY3RpdmU8L29wdGlvbj4KICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJJbmFjdGl2ZSI+SW5hY3RpdmU8L29wdGlvbj4KICAgICAgICAgICAgPC9zZWxlY3Q+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdj4KICAgICAgICAgIDxsYWJlbCBjbGFzcz0iYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtNzAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xIj5EZXBhcnRtZW50IC8gUHJhY3RpY2UgQXJlYTwvbGFiZWw+CiAgICAgICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9InVzZXItZGVwdCIgcGxhY2Vob2xkZXI9ImUuZy4gRGlyZWN0IFRheCwgQXVkaXQsIEluZGlyZWN0IFRheCIgY2xhc3M9InctZnVsbCB0ZXh0LXhzIGJnLXNsYXRlLTUwIGJvcmRlciBib3JkZXItc2xhdGUtMzAwIHJvdW5kZWQtbGcgcC0yLjUgdGV4dC1zbGF0ZS04MDAiPgogICAgICAgIDwvZGl2PgoKICAgICAgICA8ZGl2IGNsYXNzPSJwdC0zIGJvcmRlci10IGJvcmRlci1zbGF0ZS0yMDAgZmxleCBqdXN0aWZ5LWVuZCBnYXAtMyI+CiAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgb25jbGljaz0iY2xvc2VNb2RhbCgnbW9kYWwtdXNlcicpIiBjbGFzcz0icHgtNCBweS0yIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0zMDAgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LXNsYXRlLTcwMCBob3ZlcjpiZy1zbGF0ZS01MCI+Q2FuY2VsPC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIHR5cGU9InN1Ym1pdCIgY2xhc3M9InB4LTUgcHktMiByb3VuZGVkLWxnIGJnLWNhLW5hdnkgdGV4dC13aGl0ZSB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgaG92ZXI6Ymctc2xhdGUtOTAwIHRyYW5zaXRpb24iPlNhdmUgVXNlcjwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICA8L2Zvcm0+CiAgICA8L2Rpdj4KICA8L2Rpdj4KCiAgPCEtLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAtLT4KICA8IS0tIEZPT1RFUiAtLT4KICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogIDxmb290ZXIgY2xhc3M9ImJnLXdoaXRlIGJvcmRlci10IGJvcmRlci1zbGF0ZS0yMDAgbXQtYXV0byBweS00IHRleHQtY2VudGVyIHRleHQteHMgdGV4dC1zbGF0ZS01MDAiPgogICAgPGRpdiBjbGFzcz0ibWF4LXctN3hsIG14LWF1dG8gcHgtNCBmbGV4IGZsZXgtY29sIHNtOmZsZXgtcm93IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTIiPgogICAgICA8ZGl2PgogICAgICAgIENoYXJ0ZXJlZCBBY2NvdW50YW5jeSBQcmFjdGljZSAmIFRhc2sgTWFuYWdlbWVudCBTeXN0ZW0gJmNvcHk7IDxzcGFuIGlkPSJmb290ZXIteWVhciI+MjAyNjwvc3Bhbj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC00IHRleHQtc2xhdGUtNDAwIj4KICAgICAgICA8c3Bhbj5JQ0FJIFN0YXR1dG9yeSBDb21wbGlhbnQ8L3NwYW4+CiAgICAgICAgPHNwYW4+JmJ1bGw7PC9zcGFuPgogICAgICAgIDxzcGFuPkVuY3J5cHRlZCBSQkFDIFNlY3VyaXR5PC9zcGFuPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIDwvZm9vdGVyPgoKICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogIDwhLS0gQ0xJRU5ULVNJREUgQVBQTElDQVRJT04gSkFWQVNDUklQVCAtLT4KICA8IS0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC0tPgogIDxzY3JpcHQ+CiAgICAvLyBHbG9iYWwgQXBwbGljYXRpb24gU3RhdGUKICAgIGxldCBjdXJyZW50VXNlciA9IG51bGw7CiAgICBsZXQgYWxsVGFza3MgPSBbXTsKICAgIGxldCBhbGxDbGllbnRzID0gW107CiAgICBsZXQgYWxsVXNlcnMgPSBbXTsKICAgIGxldCBzZXJ2aWNlVGF4b25vbXkgPSB7fTsKICAgIGxldCB3b3Jrc3BhY2VMYXlvdXQgPSAna2FuYmFuJzsgLy8gJ2thbmJhbicgb3IgJ3RhYmxlJwoKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb290ZXIteWVhcicpLmlubmVyVGV4dCA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTsKCiAgICAvLyA9PT09PT09PT09PT09PT09PSBJTklUSUFMSVpBVElPTiA9PT09PT09PT09PT09PT09PQogICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7CiAgICAgIGluaXRBcHAoKTsKICAgIH0pOwoKICAgIGZ1bmN0aW9uIGluaXRBcHAoKSB7CiAgICAgIHNob3dMb2FkZXIoIkF1dGhlbnRpY2F0aW5nIGFuZCBsb2FkaW5nIHByYWN0aWNlIGNvbnRleHQuLi4iKTsKCiAgICAgIC8vIDEuIEdldCBDdXJyZW50IFVzZXIgQ29udGV4dCAmIFJvbGUKICAgICAgZ29vZ2xlLnNjcmlwdC5ydW4KICAgICAgICAud2l0aFN1Y2Nlc3NIYW5kbGVyKG9uVXNlckNvbnRleHRMb2FkZWQpCiAgICAgICAgLndpdGhGYWlsdXJlSGFuZGxlcihoYW5kbGVTZXJ2ZXJFcnJvcikKICAgICAgICAuZ2V0Q3VycmVudFVzZXJDb250ZXh0KCk7CgogICAgICAvLyAyLiBMb2FkIFRheG9ub215CiAgICAgIGdvb2dsZS5zY3JpcHQucnVuCiAgICAgICAgLndpdGhTdWNjZXNzSGFuZGxlcihvblRheG9ub215TG9hZGVkKQogICAgICAgIC53aXRoRmFpbHVyZUhhbmRsZXIoaGFuZGxlU2VydmVyRXJyb3IpCiAgICAgICAgLmdldENBU2VydmljZXNUYXhvbm9teSgpOwogICAgfQoKICAgIGZ1bmN0aW9uIG9uVXNlckNvbnRleHRMb2FkZWQodXNlcikgewogICAgICBjdXJyZW50VXNlciA9IHVzZXI7CiAgICAgIGhpZGVMb2FkZXIoKTsKCiAgICAgIGlmICghdXNlci5pc0F1dGhlbnRpY2F0ZWQpIHsKICAgICAgICBzaG93VG9hc3QoIkFjY2VzcyBEZW5pZWQ6ICIgKyB1c2VyLm1lc3NhZ2UsICJlcnJvciIpOwogICAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gYAogICAgICAgICAgPGRpdiBjbGFzcz0ibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHAtNiBiZy1zbGF0ZS0xMDAiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJiZy13aGl0ZSBwLTggcm91bmRlZC14bCBzaGFkb3ctbWQgbWF4LXctbWQgdGV4dC1jZW50ZXIgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAiPgogICAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1sb2NrIHRleHQtNHhsIHRleHQtcmVkLTUwMCBtYi00Ij48L2k+CiAgICAgICAgICAgICAgPGgyIGNsYXNzPSJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTgwMCI+VW5hdXRob3JpemVkIEFjY2VzczwvaDI+CiAgICAgICAgICAgICAgPHAgY2xhc3M9InRleHQtc20gdGV4dC1zbGF0ZS02MDAgbXQtMiI+JHt1c2VyLm1lc3NhZ2V9PC9wPgogICAgICAgICAgICAgIDxwIGNsYXNzPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNDAwIG10LTQiPkxvZ2dlZCBpbiBhczogPHN0cm9uZz4ke3VzZXIuZW1haWx9PC9zdHJvbmc+PC9wPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIGA7CiAgICAgICAgcmV0dXJuOwogICAgICB9CgogICAgICAvLyBQb3B1bGF0ZSBVc2VyIEhlYWRlcgogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1kaXNwbGF5LW5hbWUnKS5pbm5lclRleHQgPSB1c2VyLmZ1bGxfbmFtZSB8fCB1c2VyLmVtYWlsOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1kaXNwbGF5LXJvbGUnKS5pbm5lclRleHQgPSB1c2VyLnJvbGUucmVwbGFjZSgvXy9nLCAnICcpOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9sZS1iYWRnZScpLmlubmVyVGV4dCA9IHVzZXIucm9sZS5yZXBsYWNlKC9fL2csICcgJyk7CgogICAgICAvLyBFbmZvcmNlIFJCQUMgdmlzaWJpbGl0eSBvbiB0YWJzCiAgICAgIGVuZm9yY2VSQkFDVGFiVmlzaWJpbGl0eSgpOwoKICAgICAgLy8gTG9hZCBDb3JlIFByYWN0aWNlIERhdGEKICAgICAgcmVmcmVzaEFsbERhdGEoKTsKICAgIH0KCiAgICBmdW5jdGlvbiBvblRheG9ub215TG9hZGVkKHRheG9ub215KSB7CiAgICAgIHNlcnZpY2VUYXhvbm9teSA9IHRheG9ub215IHx8IHt9OwogICAgICBwb3B1bGF0ZVNlcnZpY2VDYXRlZ29yaWVzKCk7CiAgICB9CgogICAgZnVuY3Rpb24gZW5mb3JjZVJCQUNUYWJWaXNpYmlsaXR5KCkgewogICAgICBpZiAoIWN1cnJlbnRVc2VyKSByZXR1cm47CgogICAgICBjb25zdCBpc1N0YWZmID0gY3VycmVudFVzZXIuaXNTdGFmZjsKICAgICAgY29uc3QgaXNBZG1pbiA9IGN1cnJlbnRVc2VyLmlzQWRtaW47CiAgICAgIGNvbnN0IGlzU3VwZXJBZG1pbiA9IGN1cnJlbnRVc2VyLmlzU3VwZXJBZG1pbjsKCiAgICAgIC8vIFRhYnMKICAgICAgY29uc3QgdGFiRGFzaGJvYXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYi1kYXNoYm9hcmQnKTsKICAgICAgY29uc3QgdGFiQWxsVGFza3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWFsbHRhc2tzJyk7CiAgICAgIGNvbnN0IHRhYkFzc2lnbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWItYXNzaWduJyk7CiAgICAgIGNvbnN0IHRhYkJ1bGsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWJ1bGsnKTsKICAgICAgY29uc3QgdGFiUmVhc3NpZ24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLXJlYXNzaWduJyk7CiAgICAgIGNvbnN0IHRhYkNsaWVudHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWNsaWVudHMnKTsKICAgICAgY29uc3QgdGFiVXNlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLXVzZXJzJyk7CiAgICAgIGNvbnN0IHRhYkxvZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWxvZ3MnKTsKCiAgICAgIGlmIChpc1N0YWZmKSB7CiAgICAgICAgdGFiRGFzaGJvYXJkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgICAgdGFiQWxsVGFza3Muc3R5bGUuZGlzcGxheSA9ICdub25lJzsKICAgICAgICB0YWJBc3NpZ24uc3R5bGUuZGlzcGxheSA9ICdub25lJzsKICAgICAgICB0YWJCdWxrLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgICAgdGFiUmVhc3NpZ24uc3R5bGUuZGlzcGxheSA9ICdub25lJzsKICAgICAgICB0YWJDbGllbnRzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgICAgdGFiVXNlcnMuc3R5bGUuZGlzcGxheSA9ICdub25lJzsKICAgICAgICB0YWJMb2dzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgICAgc3dpdGNoVGFiKCd3b3Jrc3BhY2UnKTsKICAgICAgfSBlbHNlIHsKICAgICAgICB0YWJEYXNoYm9hcmQuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7CiAgICAgICAgdGFiQWxsVGFza3Muc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7CiAgICAgICAgdGFiQXNzaWduLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWZsZXgnOwogICAgICAgIHRhYkJ1bGsuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7CiAgICAgICAgdGFiUmVhc3NpZ24uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7CiAgICAgICAgdGFiQ2xpZW50cy5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JzsKCiAgICAgICAgLy8gU3VwZXIgQWRtaW4gb25seSB0YWJzCiAgICAgICAgaWYgKCFpc1N1cGVyQWRtaW4pIHsKICAgICAgICAgIHRhYlVzZXJzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgICAgICB0YWJMb2dzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgICAgfSBlbHNlIHsKICAgICAgICAgIHRhYlVzZXJzLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWZsZXgnOwogICAgICAgICAgdGFiTG9ncy5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JzsKICAgICAgICB9CiAgICAgIH0KICAgIH0KCiAgICBmdW5jdGlvbiByZWZyZXNoQWxsRGF0YSgpIHsKICAgICAgc2hvd0xvYWRlcigiUmVmcmVzaGluZyB0YXNrcyBhbmQgY29tcGxpYW5jZSBzY2hlZHVsZXMuLi4iKTsKICAgICAgY29uc3QgaWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZyZXNoLWljb24nKTsKICAgICAgaWYgKGljb24pIGljb24uY2xhc3NMaXN0LmFkZCgnZmEtc3BpbicpOwoKICAgICAgLy8gMS4gRmV0Y2ggVGFza3MKICAgICAgZ29vZ2xlLnNjcmlwdC5ydW4KICAgICAgICAud2l0aFN1Y2Nlc3NIYW5kbGVyKCh0YXNrcykgPT4gewogICAgICAgICAgYWxsVGFza3MgPSB0YXNrcyB8fCBbXTsKICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteS10YXNrcy1jb3VudCcpLmlubmVyVGV4dCA9IGFsbFRhc2tzLmZpbHRlcih0ID0+IHQuc3RhdHVzICE9PSAnQ29tcGxldGVkJykubGVuZ3RoOwogICAgICAgICAgcmVuZGVyTXlXb3Jrc3BhY2UoKTsKICAgICAgICAgIGlmIChjdXJyZW50VXNlci5pc0FkbWluKSB7CiAgICAgICAgICAgIHJlbmRlckFsbEZpcm1UYXNrcygpOwogICAgICAgICAgICByZW5kZXJSZWFzc2lnbm1lbnRUYWJsZSgpOwogICAgICAgICAgfQogICAgICAgICAgY2hlY2tBbmRIaWRlTG9hZGVyKCk7CiAgICAgICAgfSkKICAgICAgICAud2l0aEZhaWx1cmVIYW5kbGVyKGhhbmRsZVNlcnZlckVycm9yKQogICAgICAgIC5nZXRUYXNrcygpOwoKICAgICAgLy8gMi4gRmV0Y2ggQ2xpZW50cwogICAgICBnb29nbGUuc2NyaXB0LnJ1bgogICAgICAgIC53aXRoU3VjY2Vzc0hhbmRsZXIoKGNsaWVudHMpID0+IHsKICAgICAgICAgIGFsbENsaWVudHMgPSBjbGllbnRzIHx8IFtdOwogICAgICAgICAgcG9wdWxhdGVDbGllbnREcm9wZG93bnMoKTsKICAgICAgICAgIGlmIChjdXJyZW50VXNlci5pc0FkbWluKSB7CiAgICAgICAgICAgIHJlbmRlckNsaWVudHNNYXN0ZXIoKTsKICAgICAgICAgIH0KICAgICAgICAgIGNoZWNrQW5kSGlkZUxvYWRlcigpOwogICAgICAgIH0pCiAgICAgICAgLndpdGhGYWlsdXJlSGFuZGxlcihoYW5kbGVTZXJ2ZXJFcnJvcikKICAgICAgICAuZ2V0Q2xpZW50cygpOwoKICAgICAgLy8gMy4gRmV0Y2ggVXNlcnMgKGlmIGFkbWluKQogICAgICBpZiAoY3VycmVudFVzZXIuaXNBZG1pbikgewogICAgICAgIGdvb2dsZS5zY3JpcHQucnVuCiAgICAgICAgICAud2l0aFN1Y2Nlc3NIYW5kbGVyKCh1c2VycykgPT4gewogICAgICAgICAgICBhbGxVc2VycyA9IHVzZXJzIHx8IFtdOwogICAgICAgICAgICBwb3B1bGF0ZVVzZXJEcm9wZG93bnMoKTsKICAgICAgICAgICAgaWYgKGN1cnJlbnRVc2VyLmlzU3VwZXJBZG1pbikgewogICAgICAgICAgICAgIHJlbmRlclVzZXJzTWFzdGVyKCk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgY2hlY2tBbmRIaWRlTG9hZGVyKCk7CiAgICAgICAgICB9KQogICAgICAgICAgLndpdGhGYWlsdXJlSGFuZGxlcihoYW5kbGVTZXJ2ZXJFcnJvcikKICAgICAgICAgIC5nZXRVc2VycygpOwoKICAgICAgICAvLyA0LiBGZXRjaCBLUEkgRGFzaGJvYXJkIERhdGEKICAgICAgICBnb29nbGUuc2NyaXB0LnJ1bgogICAgICAgICAgLndpdGhTdWNjZXNzSGFuZGxlcigoa3BpcykgPT4gewogICAgICAgICAgICByZW5kZXJLUElEYXNoYm9hcmQoa3Bpcyk7CiAgICAgICAgICAgIGNoZWNrQW5kSGlkZUxvYWRlcigpOwogICAgICAgICAgfSkKICAgICAgICAgIC53aXRoRmFpbHVyZUhhbmRsZXIoaGFuZGxlU2VydmVyRXJyb3IpCiAgICAgICAgICAuZ2V0S1BJRGFzaGJvYXJkRGF0YSgpOwoKICAgICAgICAvLyA1LiBGZXRjaCBBdWRpdCBMb2dzIChpZiBzdXBlciBhZG1pbikKICAgICAgICBpZiAoY3VycmVudFVzZXIuaXNTdXBlckFkbWluKSB7CiAgICAgICAgICBnb29nbGUuc2NyaXB0LnJ1bgogICAgICAgICAgICAud2l0aFN1Y2Nlc3NIYW5kbGVyKChsb2dzKSA9PiB7CiAgICAgICAgICAgICAgcmVuZGVyQXVkaXRMb2dzKGxvZ3MpOwogICAgICAgICAgICAgIGNoZWNrQW5kSGlkZUxvYWRlcigpOwogICAgICAgICAgICB9KQogICAgICAgICAgICAud2l0aEZhaWx1cmVIYW5kbGVyKGhhbmRsZVNlcnZlckVycm9yKQogICAgICAgICAgICAuZ2V0QWN0aXZpdHlMb2dzKDUwKTsKICAgICAgICB9CiAgICAgIH0KICAgIH0KCiAgICBsZXQgcGVuZGluZ0xvYWRzID0gMDsKICAgIGZ1bmN0aW9uIGNoZWNrQW5kSGlkZUxvYWRlcigpIHsKICAgICAgaGlkZUxvYWRlcigpOwogICAgICBjb25zdCBpY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZnJlc2gtaWNvbicpOwogICAgICBpZiAoaWNvbikgaWNvbi5jbGFzc0xpc3QucmVtb3ZlKCdmYS1zcGluJyk7CiAgICB9CgogICAgZnVuY3Rpb24gcmVmcmVzaEN1cnJlbnRWaWV3KCkgewogICAgICByZWZyZXNoQWxsRGF0YSgpOwogICAgICBzaG93VG9hc3QoIlByYWN0aWNlIGRhdGEgcmUtc3luY2hyb25pemVkLiIsICJpbmZvIik7CiAgICB9CgogICAgLy8gPT09PT09PT09PT09PT09PT0gVEFCIE5BVklHQVRJT04gPT09PT09PT09PT09PT09PT0KICAgIGZ1bmN0aW9uIHN3aXRjaFRhYih0YWJLZXkpIHsKICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhYi12aWV3JykuZm9yRWFjaCh2ID0+IHYuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykpOwogICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmF2LXRhYicpLmZvckVhY2goYiA9PiB7CiAgICAgICAgYi5jbGFzc0xpc3QucmVtb3ZlKCd0ZXh0LWNhLWJsdWUnLCAnYmctYmx1ZS01MCcsICdib3JkZXItYmx1ZS0yMDAnKTsKICAgICAgICBiLmNsYXNzTGlzdC5hZGQoJ3RleHQtc2xhdGUtNjAwJyk7CiAgICAgIH0pOwoKICAgICAgY29uc3QgdGFyZ2V0VmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGB2aWV3LSR7dGFiS2V5fWApOwogICAgICBjb25zdCB0YXJnZXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgdGFiLSR7dGFiS2V5fWApOwoKICAgICAgaWYgKHRhcmdldFZpZXcpIHRhcmdldFZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgIGlmICh0YXJnZXRCdG4pIHsKICAgICAgICB0YXJnZXRCdG4uY2xhc3NMaXN0LnJlbW92ZSgndGV4dC1zbGF0ZS02MDAnKTsKICAgICAgICB0YXJnZXRCdG4uY2xhc3NMaXN0LmFkZCgndGV4dC1jYS1ibHVlJywgJ2JnLWJsdWUtNTAnLCAnYm9yZGVyJywgJ2JvcmRlci1ibHVlLTIwMCcpOwogICAgICB9CiAgICB9CgogICAgLy8gPT09PT09PT09PT09PT09PT0gV09SS1NQQUNFIChLQU5CQU4gJiBUQUJMRSkgPT09PT09PT09PT09PT09PT0KICAgIGZ1bmN0aW9uIHNldFdvcmtzcGFjZUxheW91dChsYXlvdXQpIHsKICAgICAgd29ya3NwYWNlTGF5b3V0ID0gbGF5b3V0OwogICAgICBjb25zdCBidG5LYW5iYW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWxheW91dC1rYW5iYW4nKTsKICAgICAgY29uc3QgYnRuVGFibGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWxheW91dC10YWJsZScpOwogICAgICBjb25zdCBrYW5iYW5Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd3Mta2FuYmFuLWNvbnRhaW5lcicpOwogICAgICBjb25zdCB0YWJsZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cy10YWJsZS1jb250YWluZXInKTsKCiAgICAgIGlmIChsYXlvdXQgPT09ICdrYW5iYW4nKSB7CiAgICAgICAgYnRuS2FuYmFuLmNsYXNzTGlzdC5hZGQoJ2JnLXdoaXRlJywgJ3RleHQtc2xhdGUtODAwJywgJ3NoYWRvdy14cycpOwogICAgICAgIGJ0blRhYmxlLmNsYXNzTGlzdC5yZW1vdmUoJ2JnLXdoaXRlJywgJ3RleHQtc2xhdGUtODAwJywgJ3NoYWRvdy14cycpOwogICAgICAgIGthbmJhbkNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKICAgICAgICB0YWJsZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICAgICAgfSBlbHNlIHsKICAgICAgICBidG5UYWJsZS5jbGFzc0xpc3QuYWRkKCdiZy13aGl0ZScsICd0ZXh0LXNsYXRlLTgwMCcsICdzaGFkb3cteHMnKTsKICAgICAgICBidG5LYW5iYW4uY2xhc3NMaXN0LnJlbW92ZSgnYmctd2hpdGUnLCAndGV4dC1zbGF0ZS04MDAnLCAnc2hhZG93LXhzJyk7CiAgICAgICAgdGFibGVDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgICAga2FuYmFuQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgICB9CiAgICB9CgogICAgZnVuY3Rpb24gcmVuZGVyTXlXb3Jrc3BhY2UoKSB7CiAgICAgIGNvbnN0IHNlYXJjaCA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd3Mtc2VhcmNoJykudmFsdWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7CiAgICAgIGNvbnN0IHN0YXR1c0ZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cy1maWx0ZXItc3RhdHVzJykudmFsdWU7CgogICAgICAvLyBGaWx0ZXIgdGFza3MgZm9yIGxvZ2dlZCBpbiB1c2VyIChpZiBzdGFmZiwgYWxyZWFkeSBmaWx0ZXJlZDsgaWYgYWRtaW4sIGZpbHRlciB3aGVyZSBhc3NpZ25lZF90byBtYXRjaGVzIG9yIHNob3cgYWxsKQogICAgICBsZXQgZmlsdGVyZWQgPSBhbGxUYXNrcy5maWx0ZXIodCA9PiB7CiAgICAgICAgaWYgKGN1cnJlbnRVc2VyLmlzU3RhZmYpIHsKICAgICAgICAgIGNvbnN0IG1hdGNoVXNlciA9ICh0LmFzc2lnbmVkX3RvX3VzZXJfaWQgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09IGN1cnJlbnRVc2VyLmVtYWlsLnRvTG93ZXJDYXNlKCkgfHwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0LmFzc2lnbmVkX3RvX3VzZXJfaWQgfHwgJycpLnRvTG93ZXJDYXNlKCkgPT09IGN1cnJlbnRVc2VyLnVzZXJfaWQudG9Mb3dlckNhc2UoKTsKICAgICAgICAgIGlmICghbWF0Y2hVc2VyKSByZXR1cm4gZmFsc2U7CiAgICAgICAgfQogICAgICAgIGlmIChzdGF0dXNGaWx0ZXIgIT09ICdBbGwnICYmIHQuc3RhdHVzICE9PSBzdGF0dXNGaWx0ZXIpIHJldHVybiBmYWxzZTsKICAgICAgICBpZiAoc2VhcmNoKSB7CiAgICAgICAgICBjb25zdCBoYXkgPSBgJHt0LnRhc2tfaWR9ICR7dC5jbGllbnRfbmFtZX0gJHt0LnNlcnZpY2VfY2F0ZWdvcnl9ICR7dC5zdWJfdGFza19kZXNjcmlwdGlvbn1gLnRvTG93ZXJDYXNlKCk7CiAgICAgICAgICBpZiAoIWhheS5pbmNsdWRlcyhzZWFyY2gpKSByZXR1cm4gZmFsc2U7CiAgICAgICAgfQogICAgICAgIHJldHVybiB0cnVlOwogICAgICB9KTsKCiAgICAgIC8vIFJlbmRlciBLYW5iYW4gQ29sdW1ucwogICAgICBjb25zdCBwQ29sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2thbmJhbi1jYXJkcy1wZW5kaW5nJyk7CiAgICAgIGNvbnN0IGlwQ29sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2thbmJhbi1jYXJkcy1pbnByb2dyZXNzJyk7CiAgICAgIGNvbnN0IHJDb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgna2FuYmFuLWNhcmRzLXJldmlldycpOwogICAgICBjb25zdCBjQ29sID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2thbmJhbi1jYXJkcy1jb21wbGV0ZWQnKTsKCiAgICAgIHBDb2wuaW5uZXJIVE1MID0gJyc7CiAgICAgIGlwQ29sLmlubmVySFRNTCA9ICcnOwogICAgICByQ29sLmlubmVySFRNTCA9ICcnOwogICAgICBjQ29sLmlubmVySFRNTCA9ICcnOwoKICAgICAgbGV0IHBDb3VudCA9IDAsIGlwQ291bnQgPSAwLCByQ291bnQgPSAwLCBjQ291bnQgPSAwOwoKICAgICAgZmlsdGVyZWQuZm9yRWFjaCh0YXNrID0+IHsKICAgICAgICBjb25zdCBjYXJkSHRtbCA9IGNyZWF0ZUthbmJhbkNhcmRIdG1sKHRhc2spOwogICAgICAgIGlmICh0YXNrLnN0YXR1cyA9PT0gJ1BlbmRpbmcnKSB7CiAgICAgICAgICBwQ29sLmlubmVySFRNTCArPSBjYXJkSHRtbDsKICAgICAgICAgIHBDb3VudCsrOwogICAgICAgIH0gZWxzZSBpZiAodGFzay5zdGF0dXMgPT09ICdJbiBQcm9ncmVzcycpIHsKICAgICAgICAgIGlwQ29sLmlubmVySFRNTCArPSBjYXJkSHRtbDsKICAgICAgICAgIGlwQ291bnQrKzsKICAgICAgICB9IGVsc2UgaWYgKHRhc2suc3RhdHVzID09PSAnUmV2aWV3IFJlcXVpcmVkJykgewogICAgICAgICAgckNvbC5pbm5lckhUTUwgKz0gY2FyZEh0bWw7CiAgICAgICAgICByQ291bnQrKzsKICAgICAgICB9IGVsc2UgaWYgKHRhc2suc3RhdHVzID09PSAnQ29tcGxldGVkJykgewogICAgICAgICAgY0NvbC5pbm5lckhUTUwgKz0gY2FyZEh0bWw7CiAgICAgICAgICBjQ291bnQrKzsKICAgICAgICB9CiAgICAgIH0pOwoKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbC1jb3VudC1wZW5kaW5nJykuaW5uZXJUZXh0ID0gcENvdW50OwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29sLWNvdW50LWlucHJvZ3Jlc3MnKS5pbm5lclRleHQgPSBpcENvdW50OwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29sLWNvdW50LXJldmlldycpLmlubmVyVGV4dCA9IHJDb3VudDsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbC1jb3VudC1jb21wbGV0ZWQnKS5pbm5lclRleHQgPSBjQ291bnQ7CgogICAgICAvLyBSZW5kZXIgVGFibGUgVmlldwogICAgICBjb25zdCB0Qm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3cy10YWJsZS1ib2R5Jyk7CiAgICAgIHRCb2R5LmlubmVySFRNTCA9ICcnOwogICAgICBmaWx0ZXJlZC5mb3JFYWNoKHQgPT4gewogICAgICAgIGNvbnN0IHN0YXREYXRlID0gdC5zdGF0dXRvcnlfZHVlX2RhdGUgPyB0LnN0YXR1dG9yeV9kdWVfZGF0ZS5zcGxpdCgnVCcpWzBdIDogJy0nOwogICAgICAgIGNvbnN0IGlzT3ZlcmR1ZSA9IGNoZWNrSWZPdmVyZHVlKHQpOwogICAgICAgIHRCb2R5LmlubmVySFRNTCArPSBgCiAgICAgICAgICA8dHIgY2xhc3M9ImhvdmVyOmJnLXNsYXRlLTUwIHRyYW5zaXRpb24iPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyBmb250LXNlbWlib2xkIHRleHQtYmx1ZS03MDAiPiR7dC50YXNrX2lkfTwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIGZvbnQtbWVkaXVtIHRleHQtc2xhdGUtODAwIj4ke2VzY2FwZUh0bWwodC5jbGllbnRfbmFtZSl9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJmb250LW1lZGl1bSB0ZXh0LXNsYXRlLTgwMCBibG9jayI+JHtlc2NhcGVIdG1sKHQuc3ViX3Rhc2tfZGVzY3JpcHRpb24pfTwvc3Bhbj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0idGV4dC1bMTBweF0gdGV4dC1zbGF0ZS00MDAiPiR7dC5zZXJ2aWNlX2NhdGVnb3J5fTwvc3Bhbj4KICAgICAgICAgICAgPC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgdGV4dC1zbGF0ZS02MDAiPiR7dC5hc3Nlc3NtZW50X3llYXIgfHwgdC5maW5hbmNpYWxfeWVhciB8fCAnLSd9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgZm9udC1tZWRpdW0gJHtpc092ZXJkdWUgPyAndGV4dC1yZWQtNjAwIGZvbnQtYm9sZCcgOiAndGV4dC1zbGF0ZS03MDAnfSI+CiAgICAgICAgICAgICAgJHtzdGF0RGF0ZX0gJHtpc092ZXJkdWUgPyAnPHNwYW4gY2xhc3M9InRleHQtWzEwcHhdIGJnLXJlZC0xMDAgdGV4dC1yZWQtNzAwIHB4LTEuNSBweS0wLjUgcm91bmRlZCBtbC0xIj5PdmVyZHVlPC9zcGFuPicgOiAnJ30KICAgICAgICAgICAgPC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgdGV4dC1bMTBweF0gZm9udC1zZW1pYm9sZCBiYWRnZS0keyh0LnByaW9yaXR5IHx8ICdtZWRpdW0nKS50b0xvd2VyQ2FzZSgpfSI+JHt0LnByaW9yaXR5fTwvc3Bhbj4KICAgICAgICAgICAgPC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgdGV4dC1bMTBweF0gZm9udC1zZW1pYm9sZCBzdGF0dXMtJHsodC5zdGF0dXMgfHwgJ3BlbmRpbmcnKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xzKy9nLCAnJyl9Ij4ke3Quc3RhdHVzfTwvc3Bhbj4KICAgICAgICAgICAgPC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgdGV4dC1yaWdodCI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1lbmQgZ2FwLTEuNSI+CiAgICAgICAgICAgICAgICAke3QuZHJpdmVfYXR0YWNobWVudF9mb2xkZXJfdXJsID8gYDxhIGhyZWY9IiR7dC5kcml2ZV9hdHRhY2htZW50X2ZvbGRlcl91cmx9IiB0YXJnZXQ9Il9ibGFuayIgdGl0bGU9Ik9wZW4gRHJpdmUgRm9sZGVyIiBjbGFzcz0icC0xLjUgdGV4dC1ibHVlLTYwMCBob3ZlcjpiZy1ibHVlLTUwIHJvdW5kZWQiPjxpIGNsYXNzPSJmYS1zb2xpZCBmYS1mb2xkZXItb3BlbiI+PC9pPjwvYT5gIDogJyd9CiAgICAgICAgICAgICAgICAke3Quc3RhdHVzID09PSAnUGVuZGluZycgPyBgPGJ1dHRvbiBvbmNsaWNrPSJzdGFydFRhc2soJyR7dC50YXNrX2lkfScpIiBjbGFzcz0icHgtMi41IHB5LTEgcm91bmRlZCBiZy1ibHVlLTYwMCB0ZXh0LXdoaXRlIHRleHQtWzEwcHhdIGZvbnQtbWVkaXVtIGhvdmVyOmJnLWJsdWUtNzAwIj5TdGFydDwvYnV0dG9uPmAgOiAnJ30KICAgICAgICAgICAgICAgIDxidXR0b24gb25jbGljaz0ib3BlblRhc2tTdWJtaXRNb2RhbCgnJHt0LnRhc2tfaWR9JykiIGNsYXNzPSJweC0yLjUgcHktMSByb3VuZGVkIGJnLWVtZXJhbGQtNjAwIHRleHQtd2hpdGUgdGV4dC1bMTBweF0gZm9udC1tZWRpdW0gaG92ZXI6YmctZW1lcmFsZC03MDAiPkNvbXBsZXRlIC8gUGFwZXJzPC9idXR0b24+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICA8L3RyPgogICAgICAgIGA7CiAgICAgIH0pOwogICAgfQoKICAgIGZ1bmN0aW9uIGNyZWF0ZUthbmJhbkNhcmRIdG1sKHQpIHsKICAgICAgY29uc3QgaXNPdmVyZHVlID0gY2hlY2tJZk92ZXJkdWUodCk7CiAgICAgIGNvbnN0IHN0YXREYXRlID0gdC5zdGF0dXRvcnlfZHVlX2RhdGUgPyB0LnN0YXR1dG9yeV9kdWVfZGF0ZS5zcGxpdCgnVCcpWzBdIDogJy0nOwogICAgICBjb25zdCB0YXJnZXREYXRlID0gdC50YXJnZXRfY29tcGxldGlvbl9kYXRlID8gdC50YXJnZXRfY29tcGxldGlvbl9kYXRlLnNwbGl0KCdUJylbMF0gOiAnLSc7CgogICAgICByZXR1cm4gYAogICAgICAgIDxkaXYgY2xhc3M9ImJnLXdoaXRlIHJvdW5kZWQteGwgcC0zLjUgc2hhZG93LXhzIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIGhvdmVyOnNoYWRvdy1tZCB0cmFuc2l0aW9uIj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0yIj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InRleHQtWzExcHhdIGZvbnQtYm9sZCB0ZXh0LWJsdWUtNzAwIj4ke3QudGFza19pZH08L3NwYW4+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJweC0yIHB5LTAuNSByb3VuZGVkIHRleHQtWzEwcHhdIGZvbnQtYm9sZCBiYWRnZS0keyh0LnByaW9yaXR5IHx8ICdtZWRpdW0nKS50b0xvd2VyQ2FzZSgpfSI+JHt0LnByaW9yaXR5fTwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgIDxoNCBjbGFzcz0iZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIHRleHQteHMgbGVhZGluZy1zbnVnIGxpbmUtY2xhbXAtMiI+JHtlc2NhcGVIdG1sKHQuY2xpZW50X25hbWUpfTwvaDQ+CiAgICAgICAgICA8cCBjbGFzcz0idGV4dC14cyB0ZXh0LXNsYXRlLTYwMCBtdC0xIGZvbnQtbWVkaXVtIj4ke2VzY2FwZUh0bWwodC5zdWJfdGFza19kZXNjcmlwdGlvbil9PC9wPgogICAgICAgICAgPGRpdiBjbGFzcz0idGV4dC1bMTBweF0gdGV4dC1zbGF0ZS00MDAgbXQtMC41Ij4ke3Quc2VydmljZV9jYXRlZ29yeX0gJmJ1bGw7ICR7dC5hc3Nlc3NtZW50X3llYXIgfHwgdC5maW5hbmNpYWxfeWVhciB8fCAnJ308L2Rpdj4KCiAgICAgICAgICA8ZGl2IGNsYXNzPSJtdC0zIHB0LTIgYm9yZGVyLXQgYm9yZGVyLXNsYXRlLTEwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gdGV4dC1bMTFweF0iPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSIke2lzT3ZlcmR1ZSA/ICd0ZXh0LXJlZC02MDAgZm9udC1ib2xkJyA6ICd0ZXh0LXNsYXRlLTUwMCd9Ij4KICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEtcmVndWxhciBmYS1jYWxlbmRhci14bWFyayBtci0xIj48L2k+IER1ZTogJHtzdGF0RGF0ZX0KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICR7dC5kcml2ZV9hdHRhY2htZW50X2ZvbGRlcl91cmwgPyBgPGEgaHJlZj0iJHt0LmRyaXZlX2F0dGFjaG1lbnRfZm9sZGVyX3VybH0iIHRhcmdldD0iX2JsYW5rIiBjbGFzcz0idGV4dC1ibHVlLTYwMCBob3Zlcjp0ZXh0LWJsdWUtODAwIHRleHQteHMiIHRpdGxlPSJPcGVuIFRhc2sgRm9sZGVyIGluIERyaXZlIj48aSBjbGFzcz0iZmEtc29saWQgZmEtZm9sZGVyLW9wZW4iPjwvaT48L2E+YCA6ICcnfQogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgJHt0Lndvcmtfbm90ZXMgPyBgPGRpdiBjbGFzcz0ibXQtMiB0ZXh0LVsxMHB4XSB0ZXh0LXNsYXRlLTUwMCBiZy1zbGF0ZS01MCBwLTIgcm91bmRlZCBib3JkZXIgYm9yZGVyLXNsYXRlLTEwMCBpdGFsaWMgbGluZS1jbGFtcC0yIj4ke2VzY2FwZUh0bWwodC53b3JrX25vdGVzKX08L2Rpdj5gIDogJyd9CgogICAgICAgICAgPCEtLSBDYXJkIEFjdGlvbiBCdXR0b25zIC0tPgogICAgICAgICAgPGRpdiBjbGFzcz0ibXQtMyBwdC0yIGJvcmRlci10IGJvcmRlci1zbGF0ZS0xMDAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0yIj4KICAgICAgICAgICAgJHt0LnN0YXR1cyA9PT0gJ1BlbmRpbmcnID8gYAogICAgICAgICAgICAgIDxidXR0b24gb25jbGljaz0ic3RhcnRUYXNrKCcke3QudGFza19pZH0nKSIgY2xhc3M9InctMS8yIHB5LTEuNSBweC0yIGJnLWJsdWUtNTAgdGV4dC1ibHVlLTcwMCBob3ZlcjpiZy1ibHVlLTEwMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcm91bmRlZC1sZyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMSB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgICAgIDxpIGNsYXNzPSJmYS1zb2xpZCBmYS1wbGF5IHRleHQtWzEwcHhdIj48L2k+IFN0YXJ0IFdvcmsKICAgICAgICAgICAgICA8L2J1dHRvbj4KICAgICAgICAgICAgYCA6ICcnfQogICAgICAgICAgICAKICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJvcGVuVGFza1N1Ym1pdE1vZGFsKCcke3QudGFza19pZH0nKSIgY2xhc3M9IiR7dC5zdGF0dXMgPT09ICdQZW5kaW5nJyA/ICd3LTEvMicgOiAndy1mdWxsJ30gcHktMS41IHB4LTIgYmctZW1lcmFsZC02MDAgdGV4dC13aGl0ZSBob3ZlcjpiZy1lbWVyYWxkLTcwMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcm91bmRlZC1sZyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMSB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgICA8aSBjbGFzcz0iZmEtc29saWQgZmEtcGFwZXItcGxhbmUgdGV4dC1bMTBweF0iPjwvaT4gU3VibWl0IC8gQ29tcGxldGUKICAgICAgICAgICAgPC9idXR0b24+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgYDsKICAgIH0KCiAgICBmdW5jdGlvbiBjaGVja0lmT3ZlcmR1ZSh0KSB7CiAgICAgIGlmICh0LnN0YXR1cyA9PT0gJ0NvbXBsZXRlZCcpIHJldHVybiBmYWxzZTsKICAgICAgaWYgKCF0LnN0YXR1dG9yeV9kdWVfZGF0ZSkgcmV0dXJuIGZhbHNlOwogICAgICBjb25zdCBkdWUgPSBuZXcgRGF0ZSh0LnN0YXR1dG9yeV9kdWVfZGF0ZS5zcGxpdCgnVCcpWzBdKTsKICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTsKICAgICAgbm93LnNldEhvdXJzKDAsMCwwLDApOwogICAgICByZXR1cm4gZHVlIDwgbm93OwogICAgfQoKICAgIGZ1bmN0aW9uIHN0YXJ0VGFzayh0YXNrSWQpIHsKICAgICAgc2hvd0xvYWRlcihgU2V0dGluZyB0YXNrICR7dGFza0lkfSB0byBJbiBQcm9ncmVzcy4uLmApOwogICAgICBnb29nbGUuc2NyaXB0LnJ1bgogICAgICAgIC53aXRoU3VjY2Vzc0hhbmRsZXIoKHJlcykgPT4gewogICAgICAgICAgaGlkZUxvYWRlcigpOwogICAgICAgICAgc2hvd1RvYXN0KGBUYXNrICR7dGFza0lkfSBpcyBub3cgSW4gUHJvZ3Jlc3MhYCwgJ3N1Y2Nlc3MnKTsKICAgICAgICAgIHJlZnJlc2hBbGxEYXRhKCk7CiAgICAgICAgfSkKICAgICAgICAud2l0aEZhaWx1cmVIYW5kbGVyKGhhbmRsZVNlcnZlckVycm9yKQogICAgICAgIC51cGRhdGVUYXNrU3RhdHVzKHRhc2tJZCwgJ0luIFByb2dyZXNzJywgJ1Rhc2sgc3RhcnRlZCBieSBhc3NpZ25lZS4nLCAnJywgW10pOwogICAgfQoKICAgIC8vID09PT09PT09PT09PT09PT09IE1PREFMOiBUQVNLIFNVQk1JU1NJT04gJiBXT1JLSU5HIFBBUEVSUyA9PT09PT09PT09PT09PT09PQogICAgbGV0IGN1cnJlbnRTdWJtaXRUYXNrID0gbnVsbDsKICAgIGZ1bmN0aW9uIG9wZW5UYXNrU3VibWl0TW9kYWwodGFza0lkKSB7CiAgICAgIGN1cnJlbnRTdWJtaXRUYXNrID0gYWxsVGFza3MuZmluZCh0ID0+IHQudGFza19pZCA9PT0gdGFza0lkKTsKICAgICAgaWYgKCFjdXJyZW50U3VibWl0VGFzaykgcmV0dXJuOwoKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Ym1pdC10YXNrLWlkJykudmFsdWUgPSB0YXNrSWQ7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXQtdGFzay1zdW1tYXJ5JykuaW5uZXJUZXh0ID0gYCR7Y3VycmVudFN1Ym1pdFRhc2sudGFza19pZH06ICR7Y3VycmVudFN1Ym1pdFRhc2suY2xpZW50X25hbWV9IC0gJHtjdXJyZW50U3VibWl0VGFzay5zdWJfdGFza19kZXNjcmlwdGlvbn1gOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VibWl0LWFjay1ubycpLnZhbHVlID0gJyc7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXQtd29yay1ub3RlcycpLnZhbHVlID0gJyc7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXQtZmlsZS1pbnB1dCcpLnZhbHVlID0gJyc7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXQtbmV3LXN0YXR1cycpLnZhbHVlID0gJ1JldmlldyBSZXF1aXJlZCc7CgogICAgICBvcGVuTW9kYWwoJ21vZGFsLXRhc2stc3VibWl0Jyk7CiAgICB9CgogICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlVGFza1N1Ym1pdChlKSB7CiAgICAgIGUucHJldmVudERlZmF1bHQoKTsKICAgICAgY29uc3QgdGFza0lkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Ym1pdC10YXNrLWlkJykudmFsdWU7CiAgICAgIGNvbnN0IG5ld1N0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXQtbmV3LXN0YXR1cycpLnZhbHVlOwogICAgICBjb25zdCBhY2tObyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXQtYWNrLW5vJykudmFsdWU7CiAgICAgIGNvbnN0IG5vdGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Ym1pdC13b3JrLW5vdGVzJykudmFsdWU7CiAgICAgIGNvbnN0IGZpbGVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWJtaXQtZmlsZS1pbnB1dCcpOwoKICAgICAgc2hvd0xvYWRlcigiRW5jb2Rpbmcgd29ya2luZyBwYXBlcnMgYW5kIHVwZGF0aW5nIHRhc2sgc3RhdGUuLi4iKTsKICAgICAgY29uc3QgZmlsZURhdGFMaXN0ID0gW107CgogICAgICBpZiAoZmlsZUlucHV0LmZpbGVzICYmIGZpbGVJbnB1dC5maWxlcy5sZW5ndGggPiAwKSB7CiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlSW5wdXQuZmlsZXMubGVuZ3RoOyBpKyspIHsKICAgICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlSW5wdXQuZmlsZXNbaV07CiAgICAgICAgICBjb25zdCBiYXNlNjQgPSBhd2FpdCB0b0Jhc2U2NChmaWxlKTsKICAgICAgICAgIGZpbGVEYXRhTGlzdC5wdXNoKHsKICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGUubmFtZSwKICAgICAgICAgICAgbWltZVR5cGU6IGZpbGUudHlwZSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJywKICAgICAgICAgICAgYmFzZTY0OiBiYXNlNjQuc3BsaXQoJywnKVsxXSAvLyByZW1vdmUgZGF0YToqLyo7YmFzZTY0LAogICAgICAgICAgfSk7CiAgICAgICAgfQogICAgICB9CgogICAgICBnb29nbGUuc2NyaXB0LnJ1bgogICAgICAgIC53aXRoU3VjY2Vzc0hhbmRsZXIoKHJlcykgPT4gewogICAgICAgICAgaGlkZUxvYWRlcigpOwogICAgICAgICAgY2xvc2VNb2RhbCgnbW9kYWwtdGFzay1zdWJtaXQnKTsKICAgICAgICAgIHNob3dUb2FzdChgVGFzayAke3Rhc2tJZH0gdXBkYXRlZCBzdWNjZXNzZnVsbHkhYCwgJ3N1Y2Nlc3MnKTsKICAgICAgICAgIHJlZnJlc2hBbGxEYXRhKCk7CiAgICAgICAgfSkKICAgICAgICAud2l0aEZhaWx1cmVIYW5kbGVyKGhhbmRsZVNlcnZlckVycm9yKQogICAgICAgIC51cGRhdGVUYXNrU3RhdHVzKHRhc2tJZCwgbmV3U3RhdHVzLCBub3RlcywgYWNrTm8sIGZpbGVEYXRhTGlzdCk7CiAgICB9CgogICAgLy8gPT09PT09PT09PT09PT09PT0gQUxMIEZJUk0gVEFTS1MgVklFVyAoQURNSU4vUEFSVE5FUikgPT09PT09PT09PT09PT09PT0KICAgIGZ1bmN0aW9uIHJlbmRlckFsbEZpcm1UYXNrcygpIHsKICAgICAgY29uc3QgY2F0RmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsbC1maWx0ZXItY2F0ZWdvcnknKS52YWx1ZTsKICAgICAgY29uc3Qgc3RhdHVzRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsbC1maWx0ZXItc3RhdHVzJykudmFsdWU7CiAgICAgIGNvbnN0IGFzc2lnbmVlRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsbC1maWx0ZXItYXNzaWduZWUnKS52YWx1ZTsKICAgICAgY29uc3Qgc2VhcmNoID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGwtc2VhcmNoJykudmFsdWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7CgogICAgICBjb25zdCBmaWx0ZXJlZCA9IGFsbFRhc2tzLmZpbHRlcih0ID0+IHsKICAgICAgICBpZiAoY2F0RmlsdGVyICE9PSAnQWxsJyAmJiB0LnNlcnZpY2VfY2F0ZWdvcnkgIT09IGNhdEZpbHRlcikgcmV0dXJuIGZhbHNlOwogICAgICAgIGlmIChzdGF0dXNGaWx0ZXIgIT09ICdBbGwnICYmIHQuc3RhdHVzICE9PSBzdGF0dXNGaWx0ZXIpIHJldHVybiBmYWxzZTsKICAgICAgICBpZiAoYXNzaWduZWVGaWx0ZXIgIT09ICdBbGwnICYmIHQuYXNzaWduZWRfdG9fdXNlcl9pZCAhPT0gYXNzaWduZWVGaWx0ZXIpIHJldHVybiBmYWxzZTsKICAgICAgICBpZiAoc2VhcmNoKSB7CiAgICAgICAgICBjb25zdCBoYXkgPSBgJHt0LnRhc2tfaWR9ICR7dC5jbGllbnRfbmFtZX0gJHt0LnN1Yl90YXNrX2Rlc2NyaXB0aW9ufSAke3QuYXNzaWduZWRfdG9fdXNlcl9pZH1gLnRvTG93ZXJDYXNlKCk7CiAgICAgICAgICBpZiAoIWhheS5pbmNsdWRlcyhzZWFyY2gpKSByZXR1cm4gZmFsc2U7CiAgICAgICAgfQogICAgICAgIHJldHVybiB0cnVlOwogICAgICB9KTsKCiAgICAgIGNvbnN0IHRCb2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsbC10YXNrcy10YWJsZS1ib2R5Jyk7CiAgICAgIHRCb2R5LmlubmVySFRNTCA9ICcnOwoKICAgICAgZmlsdGVyZWQuZm9yRWFjaCh0ID0+IHsKICAgICAgICBjb25zdCBpc092ZXJkdWUgPSBjaGVja0lmT3ZlcmR1ZSh0KTsKICAgICAgICBjb25zdCBzdGF0RGF0ZSA9IHQuc3RhdHV0b3J5X2R1ZV9kYXRlID8gdC5zdGF0dXRvcnlfZHVlX2RhdGUuc3BsaXQoJ1QnKVswXSA6ICctJzsKICAgICAgICB0Qm9keS5pbm5lckhUTUwgKz0gYAogICAgICAgICAgPHRyIGNsYXNzPSJob3ZlcjpiZy1zbGF0ZS01MCB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgZm9udC1zZW1pYm9sZCB0ZXh0LWJsdWUtNzAwIj4ke3QudGFza19pZH08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyBmb250LW1lZGl1bSB0ZXh0LXNsYXRlLTgwMCI+JHtlc2NhcGVIdG1sKHQuY2xpZW50X25hbWUpfTwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0iZm9udC1tZWRpdW0gdGV4dC1zbGF0ZS04MDAgYmxvY2siPiR7ZXNjYXBlSHRtbCh0LnN1Yl90YXNrX2Rlc2NyaXB0aW9uKX08L3NwYW4+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InRleHQtWzEwcHhdIHRleHQtc2xhdGUtNDAwIj4ke3Quc2VydmljZV9jYXRlZ29yeX08L3NwYW4+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIHRleHQtc2xhdGUtNjAwIj4ke3QuYXNzZXNzbWVudF95ZWFyIHx8IHQuZmluYW5jaWFsX3llYXIgfHwgJy0nfTwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIGZvbnQtbWVkaXVtICR7aXNPdmVyZHVlID8gJ3RleHQtcmVkLTYwMCBmb250LWJvbGQnIDogJ3RleHQtc2xhdGUtNzAwJ30iPgogICAgICAgICAgICAgICR7c3RhdERhdGV9ICR7aXNPdmVyZHVlID8gJzxzcGFuIGNsYXNzPSJ0ZXh0LVsxMHB4XSBiZy1yZWQtMTAwIHRleHQtcmVkLTcwMCBweC0xLjUgcHktMC41IHJvdW5kZWQgbWwtMSI+T3ZlcmR1ZTwvc3Bhbj4nIDogJyd9CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIHRleHQtc2xhdGUtNzAwIGZvbnQtbWVkaXVtIj4ke2VzY2FwZUh0bWwodC5hc3NpZ25lZF90b191c2VyX2lkKX08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCB0ZXh0LVsxMHB4XSBmb250LXNlbWlib2xkIGJhZGdlLSR7KHQucHJpb3JpdHkgfHwgJ21lZGl1bScpLnRvTG93ZXJDYXNlKCl9Ij4ke3QucHJpb3JpdHl9PC9zcGFuPgogICAgICAgICAgICA8L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCB0ZXh0LVsxMHB4XSBmb250LXNlbWlib2xkIHN0YXR1cy0keyh0LnN0YXR1cyB8fCAncGVuZGluZycpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXHMrL2csICcnKX0iPiR7dC5zdGF0dXN9PC9zcGFuPgogICAgICAgICAgICA8L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyB0ZXh0LXJpZ2h0Ij4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMS41Ij4KICAgICAgICAgICAgICAgICR7dC5kcml2ZV9hdHRhY2htZW50X2ZvbGRlcl91cmwgPyBgPGEgaHJlZj0iJHt0LmRyaXZlX2F0dGFjaG1lbnRfZm9sZGVyX3VybH0iIHRhcmdldD0iX2JsYW5rIiB0aXRsZT0iRHJpdmUgRm9sZGVyIiBjbGFzcz0icC0xLjUgdGV4dC1ibHVlLTYwMCBob3ZlcjpiZy1ibHVlLTUwIHJvdW5kZWQiPjxpIGNsYXNzPSJmYS1zb2xpZCBmYS1mb2xkZXItb3BlbiI+PC9pPjwvYT5gIDogJyd9CiAgICAgICAgICAgICAgICAke3Quc3RhdHVzID09PSAnUmV2aWV3IFJlcXVpcmVkJyA/IGA8YnV0dG9uIG9uY2xpY2s9Im9wZW5QYXJ0bmVyUmV2aWV3TW9kYWwoJyR7dC50YXNrX2lkfScpIiBjbGFzcz0icHgtMi41IHB5LTEgcm91bmRlZCBiZy1wdXJwbGUtNjAwIHRleHQtd2hpdGUgdGV4dC1bMTBweF0gZm9udC1tZWRpdW0gaG92ZXI6YmctcHVycGxlLTcwMCI+UmV2aWV3PC9idXR0b24+YCA6ICcnfQogICAgICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJvcGVuUmVhc3NpZ25Nb2RhbCgnJHt0LnRhc2tfaWR9JykiIHRpdGxlPSJSZWFzc2lnbiIgY2xhc3M9InAtMS41IHRleHQtYW1iZXItNjAwIGhvdmVyOmJnLWFtYmVyLTUwIHJvdW5kZWQiPjxpIGNsYXNzPSJmYS1zb2xpZCBmYS1hcnJvdy1yaWdodC1hcnJvdy1sZWZ0Ij48L2k+PC9idXR0b24+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICA8L3RyPgogICAgICAgIGA7CiAgICAgIH0pOwogICAgfQoKICAgIC8vID09PT09PT09PT09PT09PT09IE1PREFMOiBQQVJUTkVSIFFVQUxJVFkgUkVWSUVXID09PT09PT09PT09PT09PT09CiAgICBmdW5jdGlvbiBvcGVuUGFydG5lclJldmlld01vZGFsKHRhc2tJZCkgewogICAgICBjb25zdCB0YXNrID0gYWxsVGFza3MuZmluZCh0ID0+IHQudGFza19pZCA9PT0gdGFza0lkKTsKICAgICAgaWYgKCF0YXNrKSByZXR1cm47CgogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmV2aWV3LXRhc2staWQnKS52YWx1ZSA9IHRhc2tJZDsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jldmlldy10YXNrLXN1bW1hcnknKS5pbm5lclRleHQgPSBgJHt0YXNrLnRhc2tfaWR9OiAke3Rhc2suY2xpZW50X25hbWV9ICgke3Rhc2suc3ViX3Rhc2tfZGVzY3JpcHRpb259KWA7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXZpZXctcmVtYXJrcycpLnZhbHVlID0gJyc7CiAgICAgIG9wZW5Nb2RhbCgnbW9kYWwtcGFydG5lci1yZXZpZXcnKTsKICAgIH0KCiAgICBmdW5jdGlvbiBoYW5kbGVQYXJ0bmVyUmV2aWV3U3VibWl0KGUpIHsKICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOwogICAgICBjb25zdCB0YXNrSWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmV2aWV3LXRhc2staWQnKS52YWx1ZTsKICAgICAgY29uc3QgZGVjaXNpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPSJyZXZpZXctZGVjaXNpb24iXTpjaGVja2VkJykudmFsdWU7CiAgICAgIGNvbnN0IHJlbWFya3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmV2aWV3LXJlbWFya3MnKS52YWx1ZTsKCiAgICAgIHNob3dMb2FkZXIoIlJlY29yZGluZyBwYXJ0bmVyIHJldmlldyBkZWNpc2lvbi4uLiIpOwogICAgICBnb29nbGUuc2NyaXB0LnJ1bgogICAgICAgIC53aXRoU3VjY2Vzc0hhbmRsZXIoKHJlcykgPT4gewogICAgICAgICAgaGlkZUxvYWRlcigpOwogICAgICAgICAgY2xvc2VNb2RhbCgnbW9kYWwtcGFydG5lci1yZXZpZXcnKTsKICAgICAgICAgIHNob3dUb2FzdChgVGFzayAke3Rhc2tJZH0gcmV2aWV3IHByb2Nlc3NlZDogJHtkZWNpc2lvbn0hYCwgJ3N1Y2Nlc3MnKTsKICAgICAgICAgIHJlZnJlc2hBbGxEYXRhKCk7CiAgICAgICAgfSkKICAgICAgICAud2l0aEZhaWx1cmVIYW5kbGVyKGhhbmRsZVNlcnZlckVycm9yKQogICAgICAgIC5wYXJ0bmVyUmV2aWV3VGFzayh0YXNrSWQsIGRlY2lzaW9uLCByZW1hcmtzKTsKICAgIH0KCiAgICAvLyA9PT09PT09PT09PT09PT09PSBTSU5HTEUgVEFTSyBDUkVBVElPTiA9PT09PT09PT09PT09PT09PQogICAgZnVuY3Rpb24gb25DYXRlZ29yeUNoYW5nZSgpIHsKICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fzc2lnbi1zZXJ2aWNlLWNhdCcpLnZhbHVlOwogICAgICBjb25zdCBzdWJTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNzaWduLXN1Yi10YXNrJyk7CiAgICAgIHN1YlNlbGVjdC5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT0iIj4tLSBTZWxlY3QgU3ViLVRhc2sgLyBGb3JtIC0tPC9vcHRpb24+JzsKCiAgICAgIGlmIChzZXJ2aWNlVGF4b25vbXlbY2F0XSkgewogICAgICAgIHNlcnZpY2VUYXhvbm9teVtjYXRdLmZvckVhY2goaXRlbSA9PiB7CiAgICAgICAgICBzdWJTZWxlY3QuaW5uZXJIVE1MICs9IGA8b3B0aW9uIHZhbHVlPSIke2VzY2FwZUh0bWwoaXRlbSl9Ij4ke2VzY2FwZUh0bWwoaXRlbSl9PC9vcHRpb24+YDsKICAgICAgICB9KTsKICAgICAgfQogICAgfQoKICAgIGZ1bmN0aW9uIGhhbmRsZUNyZWF0ZVNpbmdsZVRhc2soZSkgewogICAgICBlLnByZXZlbnREZWZhdWx0KCk7CiAgICAgIGNvbnN0IGNsaWVudFNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc3NpZ24tY2xpZW50LWlkJyk7CiAgICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gY2xpZW50U2VsZWN0Lm9wdGlvbnNbY2xpZW50U2VsZWN0LnNlbGVjdGVkSW5kZXhdOwoKICAgICAgY29uc3QgdGFza0RhdGEgPSB7CiAgICAgICAgY2xpZW50X2lkOiBjbGllbnRTZWxlY3QudmFsdWUsCiAgICAgICAgY2xpZW50X25hbWU6IHNlbGVjdGVkT3B0aW9uLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJykgfHwgc2VsZWN0ZWRPcHRpb24udGV4dCwKICAgICAgICBzZXJ2aWNlX2NhdGVnb3J5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNzaWduLXNlcnZpY2UtY2F0JykudmFsdWUsCiAgICAgICAgc3ViX3Rhc2tfZGVzY3JpcHRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc3NpZ24tc3ViLXRhc2snKS52YWx1ZSwKICAgICAgICBmaW5hbmNpYWxfeWVhcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fzc2lnbi1meScpLnZhbHVlLAogICAgICAgIGFzc2Vzc21lbnRfeWVhcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fzc2lnbi1wZXJpb2QnKS52YWx1ZSwKICAgICAgICBzdGF0dXRvcnlfZHVlX2RhdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc3NpZ24tc3RhdC1kYXRlJykudmFsdWUsCiAgICAgICAgdGFyZ2V0X2NvbXBsZXRpb25fZGF0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fzc2lnbi10YXJnZXQtZGF0ZScpLnZhbHVlLAogICAgICAgIGFzc2lnbmVkX3RvX3VzZXJfaWQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc3NpZ24tdXNlci1pZCcpLnZhbHVlLAogICAgICAgIHByaW9yaXR5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNzaWduLXByaW9yaXR5JykudmFsdWUsCiAgICAgICAgd29ya19ub3RlczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fzc2lnbi1ub3RlcycpLnZhbHVlCiAgICAgIH07CgogICAgICBzaG93TG9hZGVyKCJDcmVhdGluZyB0YXNrIGFuZCBwcm92aXNpb25pbmcgR29vZ2xlIERyaXZlIGZvbGRlci4uLiIpOwogICAgICBnb29nbGUuc2NyaXB0LnJ1bgogICAgICAgIC53aXRoU3VjY2Vzc0hhbmRsZXIoKHJlcykgPT4gewogICAgICAgICAgaGlkZUxvYWRlcigpOwogICAgICAgICAgc2hvd1RvYXN0KGBUYXNrICR7cmVzLnRhc2tfaWR9IHN1Y2Nlc3NmdWxseSBhbGxvY2F0ZWQhYCwgJ3N1Y2Nlc3MnKTsKICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXNpbmdsZS10YXNrJykucmVzZXQoKTsKICAgICAgICAgIHN3aXRjaFRhYignYWxsdGFza3MnKTsKICAgICAgICAgIHJlZnJlc2hBbGxEYXRhKCk7CiAgICAgICAgfSkKICAgICAgICAud2l0aEZhaWx1cmVIYW5kbGVyKGhhbmRsZVNlcnZlckVycm9yKQogICAgICAgIC5jcmVhdGVUYXNrKHRhc2tEYXRhKTsKICAgIH0KCiAgICAvLyA9PT09PT09PT09PT09PT09PSBCVUxLIFRBU0sgQ1JFQVRJT04gPT09PT09PT09PT09PT09PT0KICAgIGZ1bmN0aW9uIG9uQnVsa0NhdGVnb3J5Q2hhbmdlKCkgewogICAgICBjb25zdCBjYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnVsay1zZXJ2aWNlLWNhdCcpLnZhbHVlOwogICAgICBjb25zdCBzdWJTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnVsay1zdWItdGFzaycpOwogICAgICBzdWJTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9IiI+LS0gU2VsZWN0IFN1Yi1UYXNrIC8gRm9ybSAtLTwvb3B0aW9uPic7CgogICAgICBpZiAoc2VydmljZVRheG9ub215W2NhdF0pIHsKICAgICAgICBzZXJ2aWNlVGF4b25vbXlbY2F0XS5mb3JFYWNoKGl0ZW0gPT4gewogICAgICAgICAgc3ViU2VsZWN0LmlubmVySFRNTCArPSBgPG9wdGlvbiB2YWx1ZT0iJHtlc2NhcGVIdG1sKGl0ZW0pfSI+JHtlc2NhcGVIdG1sKGl0ZW0pfTwvb3B0aW9uPmA7CiAgICAgICAgfSk7CiAgICAgIH0KICAgIH0KCiAgICBmdW5jdGlvbiBzZWxlY3RBbGxCdWxrQ2xpZW50cyhjaGVja2VkKSB7CiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idWxrLWNsaWVudC1jYicpLmZvckVhY2goY2IgPT4gY2IuY2hlY2tlZCA9IGNoZWNrZWQpOwogICAgICB1cGRhdGVCdWxrU2VsZWN0ZWRDb3VudCgpOwogICAgfQoKICAgIGZ1bmN0aW9uIHVwZGF0ZUJ1bGtTZWxlY3RlZENvdW50KCkgewogICAgICBjb25zdCBjb3VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idWxrLWNsaWVudC1jYjpjaGVja2VkJykubGVuZ3RoOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnVsay1zZWxlY3RlZC1jb3VudCcpLmlubmVyVGV4dCA9IGNvdW50OwogICAgfQoKICAgIGZ1bmN0aW9uIGhhbmRsZUJ1bGtDcmVhdGVUYXNrcyhlKSB7CiAgICAgIGUucHJldmVudERlZmF1bHQoKTsKICAgICAgY29uc3Qgc2VsZWN0ZWRDbGllbnRzID0gW107CiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idWxrLWNsaWVudC1jYjpjaGVja2VkJykuZm9yRWFjaChjYiA9PiB7CiAgICAgICAgc2VsZWN0ZWRDbGllbnRzLnB1c2goewogICAgICAgICAgY2xpZW50X2lkOiBjYi52YWx1ZSwKICAgICAgICAgIGNsaWVudF9uYW1lOiBjYi5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpCiAgICAgICAgfSk7CiAgICAgIH0pOwoKICAgICAgaWYgKHNlbGVjdGVkQ2xpZW50cy5sZW5ndGggPT09IDApIHsKICAgICAgICBzaG93VG9hc3QoIlBsZWFzZSBzZWxlY3QgYXQgbGVhc3Qgb25lIGNsaWVudCBmb3IgYnVsayBhbGxvY2F0aW9uLiIsICJ3YXJuaW5nIik7CiAgICAgICAgcmV0dXJuOwogICAgICB9CgogICAgICBjb25zdCBzZWxlY3RlZEFzc2lnbmVlcyA9IFtdOwogICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnVsay1zdGFmZi1jYjpjaGVja2VkJykuZm9yRWFjaChjYiA9PiB7CiAgICAgICAgc2VsZWN0ZWRBc3NpZ25lZXMucHVzaChjYi52YWx1ZSk7CiAgICAgIH0pOwoKICAgICAgaWYgKHNlbGVjdGVkQXNzaWduZWVzLmxlbmd0aCA9PT0gMCkgewogICAgICAgIHNob3dUb2FzdCgiUGxlYXNlIHNlbGVjdCBhdCBsZWFzdCBvbmUgdGVhbSBtZW1iZXIgdG8gZGlzdHJpYnV0ZSB0YXNrcyB0by4iLCAid2FybmluZyIpOwogICAgICAgIHJldHVybjsKICAgICAgfQoKICAgICAgY29uc3QgYnVsa0RhdGEgPSB7CiAgICAgICAgY2xpZW50czogc2VsZWN0ZWRDbGllbnRzLAogICAgICAgIGFzc2lnbmVlczogc2VsZWN0ZWRBc3NpZ25lZXMsCiAgICAgICAgYWxsb2NhdGlvbl9tb2RlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPSJidWxrLWFsbG9jLW1vZGUiXTpjaGVja2VkJykudmFsdWUsCiAgICAgICAgc2VydmljZV9jYXRlZ29yeTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1bGstc2VydmljZS1jYXQnKS52YWx1ZSwKICAgICAgICBzdWJfdGFza19kZXNjcmlwdGlvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1bGstc3ViLXRhc2snKS52YWx1ZSwKICAgICAgICBmaW5hbmNpYWxfeWVhcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1bGstZnknKS52YWx1ZSwKICAgICAgICBhc3Nlc3NtZW50X3llYXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidWxrLXBlcmlvZCcpLnZhbHVlLAogICAgICAgIHN0YXR1dG9yeV9kdWVfZGF0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1bGstc3RhdC1kYXRlJykudmFsdWUsCiAgICAgICAgdGFyZ2V0X2NvbXBsZXRpb25fZGF0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1bGstdGFyZ2V0LWRhdGUnKS52YWx1ZSwKICAgICAgICBwcmlvcml0eTogIk1lZGl1bSIKICAgICAgfTsKCiAgICAgIHNob3dMb2FkZXIoYEJhdGNoIGFsbG9jYXRpbmcgJHtzZWxlY3RlZENsaWVudHMubGVuZ3RofSBjb21wbGlhbmNlIGpvYnMuLi5gKTsKICAgICAgZ29vZ2xlLnNjcmlwdC5ydW4KICAgICAgICAud2l0aFN1Y2Nlc3NIYW5kbGVyKChyZXMpID0+IHsKICAgICAgICAgIGhpZGVMb2FkZXIoKTsKICAgICAgICAgIHNob3dUb2FzdChgU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgJHtyZXMuY291bnR9IHRhc2tzIGFjcm9zcyB0ZWFtIWAsICdzdWNjZXNzJyk7CiAgICAgICAgICBzd2l0Y2hUYWIoJ2FsbHRhc2tzJyk7CiAgICAgICAgICByZWZyZXNoQWxsRGF0YSgpOwogICAgICAgIH0pCiAgICAgICAgLndpdGhGYWlsdXJlSGFuZGxlcihoYW5kbGVTZXJ2ZXJFcnJvcikKICAgICAgICAuYnVsa0NyZWF0ZVRhc2tzKGJ1bGtEYXRhKTsKICAgIH0KCiAgICAvLyA9PT09PT09PT09PT09PT09PSBSRUFTU0lHTk1FTlQgV0lORE9XID09PT09PT09PT09PT09PT09CiAgICBmdW5jdGlvbiByZW5kZXJSZWFzc2lnbm1lbnRUYWJsZSgpIHsKICAgICAgY29uc3QgdXNlckZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFzc2lnbi1maWx0ZXItdXNlcicpLnZhbHVlOwogICAgICBjb25zdCBzZWFyY2ggPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYXNzaWduLXNlYXJjaCcpLnZhbHVlIHx8ICcnKS50b0xvd2VyQ2FzZSgpOwoKICAgICAgY29uc3Qgb3BlblRhc2tzID0gYWxsVGFza3MuZmlsdGVyKHQgPT4gdC5zdGF0dXMgIT09ICdDb21wbGV0ZWQnKTsKICAgICAgY29uc3QgZmlsdGVyZWQgPSBvcGVuVGFza3MuZmlsdGVyKHQgPT4gewogICAgICAgIGlmICh1c2VyRmlsdGVyICE9PSAnQWxsJyAmJiB0LmFzc2lnbmVkX3RvX3VzZXJfaWQgIT09IHVzZXJGaWx0ZXIpIHJldHVybiBmYWxzZTsKICAgICAgICBpZiAoc2VhcmNoKSB7CiAgICAgICAgICBjb25zdCBoYXkgPSBgJHt0LnRhc2tfaWR9ICR7dC5jbGllbnRfbmFtZX0gJHt0LnN1Yl90YXNrX2Rlc2NyaXB0aW9ufWAudG9Mb3dlckNhc2UoKTsKICAgICAgICAgIGlmICghaGF5LmluY2x1ZGVzKHNlYXJjaCkpIHJldHVybiBmYWxzZTsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIHRydWU7CiAgICAgIH0pOwoKICAgICAgY29uc3QgdEJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhc3NpZ24tdGFibGUtYm9keScpOwogICAgICB0Qm9keS5pbm5lckhUTUwgPSAnJzsKCiAgICAgIGZpbHRlcmVkLmZvckVhY2godCA9PiB7CiAgICAgICAgdEJvZHkuaW5uZXJIVE1MICs9IGAKICAgICAgICAgIDx0ciBjbGFzcz0iaG92ZXI6Ymctc2xhdGUtNTAgdHJhbnNpdGlvbiI+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIGZvbnQtc2VtaWJvbGQgdGV4dC1ibHVlLTcwMCI+JHt0LnRhc2tfaWR9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgZm9udC1tZWRpdW0gdGV4dC1zbGF0ZS04MDAiPiR7ZXNjYXBlSHRtbCh0LmNsaWVudF9uYW1lKX08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyB0ZXh0LXNsYXRlLTcwMCI+JHtlc2NhcGVIdG1sKHQuc3ViX3Rhc2tfZGVzY3JpcHRpb24pfTwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIHRleHQtc2xhdGUtNjAwIj4ke3Quc3RhdHV0b3J5X2R1ZV9kYXRlID8gdC5zdGF0dXRvcnlfZHVlX2RhdGUuc3BsaXQoJ1QnKVswXSA6ICctJ308L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyBmb250LXNlbWlib2xkIHRleHQtc2xhdGUtODAwIj4ke2VzY2FwZUh0bWwodC5hc3NpZ25lZF90b191c2VyX2lkKX08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCB0ZXh0LVsxMHB4XSBmb250LXNlbWlib2xkIHN0YXR1cy0keyh0LnN0YXR1cyB8fCAncGVuZGluZycpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXHMrL2csICcnKX0iPiR7dC5zdGF0dXN9PC9zcGFuPgogICAgICAgICAgICA8L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyB0ZXh0LXJpZ2h0Ij4KICAgICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9Im9wZW5SZWFzc2lnbk1vZGFsKCcke3QudGFza19pZH0nKSIgY2xhc3M9InB4LTMgcHktMSBiZy1hbWJlci02MDAgdGV4dC13aGl0ZSByb3VuZGVkIHRleHQteHMgZm9udC1zZW1pYm9sZCBob3ZlcjpiZy1hbWJlci03MDAgdHJhbnNpdGlvbiI+CiAgICAgICAgICAgICAgICBSZWFzc2lnbgogICAgICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgICAgICA8L3RkPgogICAgICAgICAgPC90cj4KICAgICAgICBgOwogICAgICB9KTsKICAgIH0KCiAgICBmdW5jdGlvbiBvcGVuUmVhc3NpZ25Nb2RhbCh0YXNrSWQpIHsKICAgICAgY29uc3QgdGFzayA9IGFsbFRhc2tzLmZpbmQodCA9PiB0LnRhc2tfaWQgPT09IHRhc2tJZCk7CiAgICAgIGlmICghdGFzaykgcmV0dXJuOwoKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlYXNzaWduLXRhc2staWQnKS52YWx1ZSA9IHRhc2tJZDsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlYXNzaWduLXN1bW1hcnknKS5pbm5lclRleHQgPSBgJHt0YXNrLnRhc2tfaWR9OiAke3Rhc2suY2xpZW50X25hbWV9IChDdXJyZW50bHk6ICR7dGFzay5hc3NpZ25lZF90b191c2VyX2lkfSlgOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcmVhc3NpZ24tcmVhc29uJykudmFsdWUgPSAnJzsKICAgICAgb3Blbk1vZGFsKCdtb2RhbC1yZWFzc2lnbicpOwogICAgfQoKICAgIGZ1bmN0aW9uIGhhbmRsZVJlYXNzaWduU3VibWl0KGUpIHsKICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpOwogICAgICBjb25zdCB0YXNrSWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtcmVhc3NpZ24tdGFzay1pZCcpLnZhbHVlOwogICAgICBjb25zdCBuZXdVc2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlYXNzaWduLXVzZXInKS52YWx1ZTsKICAgICAgY29uc3QgcmVhc29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXJlYXNzaWduLXJlYXNvbicpLnZhbHVlOwoKICAgICAgc2hvd0xvYWRlcihgUmVhc3NpZ25pbmcgJHt0YXNrSWR9IHRvICR7bmV3VXNlcn0uLi5gKTsKICAgICAgZ29vZ2xlLnNjcmlwdC5ydW4KICAgICAgICAud2l0aFN1Y2Nlc3NIYW5kbGVyKChyZXMpID0+IHsKICAgICAgICAgIGhpZGVMb2FkZXIoKTsKICAgICAgICAgIGNsb3NlTW9kYWwoJ21vZGFsLXJlYXNzaWduJyk7CiAgICAgICAgICBzaG93VG9hc3QocmVzLm1lc3NhZ2UsICdzdWNjZXNzJyk7CiAgICAgICAgICByZWZyZXNoQWxsRGF0YSgpOwogICAgICAgIH0pCiAgICAgICAgLndpdGhGYWlsdXJlSGFuZGxlcihoYW5kbGVTZXJ2ZXJFcnJvcikKICAgICAgICAucmVhc3NpZ25UYXNrKHRhc2tJZCwgbmV3VXNlciwgcmVhc29uKTsKICAgIH0KCiAgICAvLyA9PT09PT09PT09PT09PT09PSBDTElFTlQgRElSRUNUT1JZIChNQVNURVIpID09PT09PT09PT09PT09PT09CiAgICBmdW5jdGlvbiByZW5kZXJDbGllbnRzTWFzdGVyKCkgewogICAgICBjb25zdCBzZWFyY2ggPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1zZWFyY2gnKS52YWx1ZSB8fCAnJykudG9Mb3dlckNhc2UoKTsKICAgICAgY29uc3QgZmlsdGVyZWQgPSBhbGxDbGllbnRzLmZpbHRlcihjID0+IHsKICAgICAgICBpZiAoc2VhcmNoKSB7CiAgICAgICAgICBjb25zdCBoYXkgPSBgJHtjLmNsaWVudF9pZH0gJHtjLmNsaWVudF9sZWdhbF9uYW1lfSAke2MudHJhZGVfbmFtZX0gJHtjLnBhbiB8fCAnJ30gJHtjLmdzdGluIHx8ICcnfWAudG9Mb3dlckNhc2UoKTsKICAgICAgICAgIGlmICghaGF5LmluY2x1ZGVzKHNlYXJjaCkpIHJldHVybiBmYWxzZTsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIHRydWU7CiAgICAgIH0pOwoKICAgICAgY29uc3QgdEJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpZW50cy10YWJsZS1ib2R5Jyk7CiAgICAgIHRCb2R5LmlubmVySFRNTCA9ICcnOwoKICAgICAgZmlsdGVyZWQuZm9yRWFjaChjID0+IHsKICAgICAgICB0Qm9keS5pbm5lckhUTUwgKz0gYAogICAgICAgICAgPHRyIGNsYXNzPSJob3ZlcjpiZy1zbGF0ZS01MCB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgZm9udC1zZW1pYm9sZCB0ZXh0LWJsdWUtNzAwIj4ke2MuY2xpZW50X2lkfTwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0iZm9udC1ib2xkIHRleHQtc2xhdGUtODAwIGJsb2NrIj4ke2VzY2FwZUh0bWwoYy5jbGllbnRfbGVnYWxfbmFtZSl9PC9zcGFuPgogICAgICAgICAgICAgICR7Yy50cmFkZV9uYW1lID8gYDxzcGFuIGNsYXNzPSJ0ZXh0LVsxMXB4XSB0ZXh0LXNsYXRlLTQwMCI+VHJhZGU6ICR7ZXNjYXBlSHRtbChjLnRyYWRlX25hbWUpfTwvc3Bhbj5gIDogJyd9CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIj48c3BhbiBjbGFzcz0icHgtMiBweS0wLjUgcm91bmRlZCBiZy1zbGF0ZS0xMDAgdGV4dC1zbGF0ZS03MDAgZm9udC1tZWRpdW0gdGV4dC1bMTBweF0iPiR7Yy5lbnRpdHlfdHlwZX08L3NwYW4+PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgZm9udC1tb25vIGZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS04MDAiPiR7Yy5wYW4gfHwgJy0nfTwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIGZvbnQtbW9ubyB0ZXh0LVsxMXB4XSB0ZXh0LXNsYXRlLTYwMCI+JHtjLmdzdGluIHx8ICctJ308L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImJsb2NrIGZvbnQtbWVkaXVtIHRleHQtc2xhdGUtODAwIj4ke2VzY2FwZUh0bWwoYy5wcmltYXJ5X2NvbnRhY3RfcGVyc29uIHx8ICctJyl9PC9zcGFuPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0ZXh0LVsxMHB4XSB0ZXh0LXNsYXRlLTQwMCI+JHtjLm1vYmlsZSB8fCAnJ308L3NwYW4+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIHRleHQtc2xhdGUtNjAwIj4ke2MuYmlsbGluZ19ncm91cCB8fCAnU3RhbmRhcmQnfTwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIHRleHQtcmlnaHQiPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0yIj4KICAgICAgICAgICAgICAgICR7Yy5wb3J0YWxfY3JlZGVudGlhbHNfdmF1bHRfbGluayA/IGA8YSBocmVmPSIke2MucG9ydGFsX2NyZWRlbnRpYWxzX3ZhdWx0X2xpbmt9IiB0YXJnZXQ9Il9ibGFuayIgdGl0bGU9IlZhdWx0IExpbmsiIGNsYXNzPSJ0ZXh0LWJsdWUtNjAwIGhvdmVyOnRleHQtYmx1ZS04MDAiPjxpIGNsYXNzPSJmYS1zb2xpZCBmYS1rZXkiPjwvaT48L2E+YCA6ICcnfQogICAgICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPSJlZGl0Q2xpZW50KCcke2MuY2xpZW50X2lkfScpIiBjbGFzcz0idGV4dC1zbGF0ZS01MDAgaG92ZXI6dGV4dC1zbGF0ZS04MDAiPjxpIGNsYXNzPSJmYS1zb2xpZCBmYS1wZW4tdG8tc3F1YXJlIj48L2k+PC9idXR0b24+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICA8L3RyPgogICAgICAgIGA7CiAgICAgIH0pOwogICAgfQoKICAgIGZ1bmN0aW9uIG9wZW5DbGllbnRNb2RhbCgpIHsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm0tY2xpZW50LW1hc3RlcicpLnJlc2V0KCk7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtZWRpdC1pZCcpLnZhbHVlID0gJyc7CiAgICAgIG9wZW5Nb2RhbCgnbW9kYWwtY2xpZW50Jyk7CiAgICB9CgogICAgZnVuY3Rpb24gZWRpdENsaWVudChjbGllbnRJZCkgewogICAgICBjb25zdCBjID0gYWxsQ2xpZW50cy5maW5kKGl0ZW0gPT4gaXRlbS5jbGllbnRfaWQgPT09IGNsaWVudElkKTsKICAgICAgaWYgKCFjKSByZXR1cm47CgogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpZW50LWVkaXQtaWQnKS52YWx1ZSA9IGMuY2xpZW50X2lkOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpZW50LWxlZ2FsLW5hbWUnKS52YWx1ZSA9IGMuY2xpZW50X2xlZ2FsX25hbWU7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtdHJhZGUtbmFtZScpLnZhbHVlID0gYy50cmFkZV9uYW1lIHx8ICcnOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpZW50LWVudGl0eS10eXBlJykudmFsdWUgPSBjLmVudGl0eV90eXBlIHx8ICdQcml2YXRlIEx0ZCc7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtcGFuJykudmFsdWUgPSBjLnBhbiB8fCAnJzsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1nc3RpbicpLnZhbHVlID0gYy5nc3RpbiB8fCAnJzsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1jb250YWN0JykudmFsdWUgPSBjLnByaW1hcnlfY29udGFjdF9wZXJzb24gfHwgJyc7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtbW9iaWxlJykudmFsdWUgPSBjLm1vYmlsZSB8fCAnJzsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1lbWFpbCcpLnZhbHVlID0gYy5lbWFpbCB8fCAnJzsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1iaWxsaW5nJykudmFsdWUgPSBjLmJpbGxpbmdfZ3JvdXAgfHwgJyc7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtdmF1bHQnKS52YWx1ZSA9IGMucG9ydGFsX2NyZWRlbnRpYWxzX3ZhdWx0X2xpbmsgfHwgJyc7CgogICAgICBvcGVuTW9kYWwoJ21vZGFsLWNsaWVudCcpOwogICAgfQoKICAgIGZ1bmN0aW9uIGhhbmRsZVNhdmVDbGllbnQoZSkgewogICAgICBlLnByZXZlbnREZWZhdWx0KCk7CiAgICAgIGNvbnN0IGNsaWVudERhdGEgPSB7CiAgICAgICAgY2xpZW50X2lkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpZW50LWVkaXQtaWQnKS52YWx1ZSwKICAgICAgICBjbGllbnRfbGVnYWxfbmFtZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1sZWdhbC1uYW1lJykudmFsdWUsCiAgICAgICAgdHJhZGVfbmFtZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC10cmFkZS1uYW1lJykudmFsdWUsCiAgICAgICAgZW50aXR5X3R5cGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtZW50aXR5LXR5cGUnKS52YWx1ZSwKICAgICAgICBwYW46IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtcGFuJykudmFsdWUudG9VcHBlckNhc2UoKSwKICAgICAgICBnc3RpbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1nc3RpbicpLnZhbHVlLnRvVXBwZXJDYXNlKCksCiAgICAgICAgcHJpbWFyeV9jb250YWN0X3BlcnNvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1jb250YWN0JykudmFsdWUsCiAgICAgICAgbW9iaWxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpZW50LW1vYmlsZScpLnZhbHVlLAogICAgICAgIGVtYWlsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpZW50LWVtYWlsJykudmFsdWUsCiAgICAgICAgYmlsbGluZ19ncm91cDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWVudC1iaWxsaW5nJykudmFsdWUsCiAgICAgICAgcG9ydGFsX2NyZWRlbnRpYWxzX3ZhdWx0X2xpbms6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGllbnQtdmF1bHQnKS52YWx1ZQogICAgICB9OwoKICAgICAgc2hvd0xvYWRlcigiU2F2aW5nIGNsaWVudCB0byBtYXN0ZXIgcmVnaXN0cnkuLi4iKTsKICAgICAgZ29vZ2xlLnNjcmlwdC5ydW4KICAgICAgICAud2l0aFN1Y2Nlc3NIYW5kbGVyKChyZXMpID0+IHsKICAgICAgICAgIGhpZGVMb2FkZXIoKTsKICAgICAgICAgIGNsb3NlTW9kYWwoJ21vZGFsLWNsaWVudCcpOwogICAgICAgICAgc2hvd1RvYXN0KCJDbGllbnQgc2F2ZWQgc3VjY2Vzc2Z1bGx5ISIsICJzdWNjZXNzIik7CiAgICAgICAgICByZWZyZXNoQWxsRGF0YSgpOwogICAgICAgIH0pCiAgICAgICAgLndpdGhGYWlsdXJlSGFuZGxlcihoYW5kbGVTZXJ2ZXJFcnJvcikKICAgICAgICAuc2F2ZUNsaWVudChjbGllbnREYXRhKTsKICAgIH0KCiAgICAvLyA9PT09PT09PT09PT09PT09PSBVU0VSICYgUkJBQyBNQU5BR0VNRU5UIChTVVBFUiBBRE1JTikgPT09PT09PT09PT09PT09PT0KICAgIGZ1bmN0aW9uIHJlbmRlclVzZXJzTWFzdGVyKCkgewogICAgICBjb25zdCB0Qm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2Vycy10YWJsZS1ib2R5Jyk7CiAgICAgIHRCb2R5LmlubmVySFRNTCA9ICcnOwoKICAgICAgYWxsVXNlcnMuZm9yRWFjaCh1ID0+IHsKICAgICAgICB0Qm9keS5pbm5lckhUTUwgKz0gYAogICAgICAgICAgPHRyIGNsYXNzPSJob3ZlcjpiZy1zbGF0ZS01MCB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgZm9udC1zZW1pYm9sZCB0ZXh0LWJsdWUtNzAwIj4ke3UudXNlcl9pZH08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMyBmb250LWJvbGQgdGV4dC1zbGF0ZS04MDAiPiR7ZXNjYXBlSHRtbCh1LmZ1bGxfbmFtZSl9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMgZm9udC1tb25vIHRleHQtc2xhdGUtNzAwIj4ke2VzY2FwZUh0bWwodS5lbWFpbCl9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJweC0yLjUgcHktMC41IHJvdW5kZWQtZnVsbCB0ZXh0LVsxMHB4XSBmb250LWJvbGQgJHt1LnJvbGUgPT09ICdTdXBlcl9BZG1pbicgPyAnYmctcHVycGxlLTEwMCB0ZXh0LXB1cnBsZS04MDAnIDogKHUucm9sZSA9PT0gJ1BhcnRuZXIvTWFuYWdlcicgPyAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCcgOiAnYmctc2xhdGUtMTAwIHRleHQtc2xhdGUtNzAwJyl9Ij4KICAgICAgICAgICAgICAgICR7dS5yb2xlLnJlcGxhY2UoL18vZywgJyAnKX0KICAgICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIHRleHQtc2xhdGUtNjAwIj4ke3UuZGVwYXJ0bWVudCB8fCAnLSd9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTMiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJweC0yIHB5LTAuNSByb3VuZGVkIHRleHQtWzEwcHhdIGZvbnQtc2VtaWJvbGQgJHt1LnN0YXR1cyA9PT0gJ0FjdGl2ZScgPyAnYmctZW1lcmFsZC0xMDAgdGV4dC1lbWVyYWxkLTgwMCcgOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAnfSI+JHt1LnN0YXR1c308L3NwYW4+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0zIHRleHQtcmlnaHQiPgogICAgICAgICAgICAgIDxidXR0b24gb25jbGljaz0iZWRpdFVzZXIoJyR7dS51c2VyX2lkfScpIiBjbGFzcz0idGV4dC1zbGF0ZS01MDAgaG92ZXI6dGV4dC1zbGF0ZS04MDAiPjxpIGNsYXNzPSJmYS1zb2xpZCBmYS1wZW4tdG8tc3F1YXJlIj48L2k+PC9idXR0b24+CiAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICA8L3RyPgogICAgICAgIGA7CiAgICAgIH0pOwogICAgfQoKICAgIGZ1bmN0aW9uIG9wZW5Vc2VyTW9kYWwoKSB7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtLXVzZXItbWFzdGVyJykucmVzZXQoKTsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZWRpdC1pZCcpLnZhbHVlID0gJyc7CiAgICAgIG9wZW5Nb2RhbCgnbW9kYWwtdXNlcicpOwogICAgfQoKICAgIGZ1bmN0aW9uIGVkaXRVc2VyKHVzZXJJZCkgewogICAgICBjb25zdCB1ID0gYWxsVXNlcnMuZmluZChpdGVtID0+IGl0ZW0udXNlcl9pZCA9PT0gdXNlcklkKTsKICAgICAgaWYgKCF1KSByZXR1cm47CgogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1lZGl0LWlkJykudmFsdWUgPSB1LnVzZXJfaWQ7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWZ1bGxuYW1lJykudmFsdWUgPSB1LmZ1bGxfbmFtZTsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZW1haWwnKS52YWx1ZSA9IHUuZW1haWw7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLXJvbGUnKS52YWx1ZSA9IHUucm9sZTsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItc3RhdHVzJykudmFsdWUgPSB1LnN0YXR1czsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZGVwdCcpLnZhbHVlID0gdS5kZXBhcnRtZW50IHx8ICcnOwoKICAgICAgb3Blbk1vZGFsKCdtb2RhbC11c2VyJyk7CiAgICB9CgogICAgZnVuY3Rpb24gaGFuZGxlU2F2ZVVzZXIoZSkgewogICAgICBlLnByZXZlbnREZWZhdWx0KCk7CiAgICAgIGNvbnN0IHVzZXJEYXRhID0gewogICAgICAgIHVzZXJfaWQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWVkaXQtaWQnKS52YWx1ZSwKICAgICAgICBmdWxsX25hbWU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWZ1bGxuYW1lJykudmFsdWUsCiAgICAgICAgZW1haWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWVtYWlsJykudmFsdWUsCiAgICAgICAgcm9sZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItcm9sZScpLnZhbHVlLAogICAgICAgIHN0YXR1czogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItc3RhdHVzJykudmFsdWUsCiAgICAgICAgZGVwYXJ0bWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItZGVwdCcpLnZhbHVlCiAgICAgIH07CgogICAgICBzaG93TG9hZGVyKCJVcGRhdGluZyB1c2VyIGF1dGhvcml6YXRpb24gYW5kIHBlcm1pc3Npb25zLi4uIik7CiAgICAgIGdvb2dsZS5zY3JpcHQucnVuCiAgICAgICAgLndpdGhTdWNjZXNzSGFuZGxlcigocmVzKSA9PiB7CiAgICAgICAgICBoaWRlTG9hZGVyKCk7CiAgICAgICAgICBjbG9zZU1vZGFsKCdtb2RhbC11c2VyJyk7CiAgICAgICAgICBzaG93VG9hc3QoIlVzZXIgdXBkYXRlZCBzdWNjZXNzZnVsbHkhIiwgInN1Y2Nlc3MiKTsKICAgICAgICAgIHJlZnJlc2hBbGxEYXRhKCk7CiAgICAgICAgfSkKICAgICAgICAud2l0aEZhaWx1cmVIYW5kbGVyKGhhbmRsZVNlcnZlckVycm9yKQogICAgICAgIC5zYXZlVXNlcih1c2VyRGF0YSk7CiAgICB9CgogICAgLy8gPT09PT09PT09PT09PT09PT0gS1BJIERBU0hCT0FSRCA9PT09PT09PT09PT09PT09PQogICAgZnVuY3Rpb24gcmVuZGVyS1BJRGFzaGJvYXJkKGtwaSkgewogICAgICBpZiAoIWtwaSkgcmV0dXJuOwoKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2twaS1vdmVyZHVlJykuaW5uZXJUZXh0ID0ga3BpLm92ZXJkdWVfdGFza3MgfHwgMDsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2twaS1kdWUtd2VlaycpLmlubmVyVGV4dCA9IGtwaS5kdWVfdGhpc193ZWVrIHx8IDA7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdrcGktcmV2aWV3JykuaW5uZXJUZXh0ID0ga3BpLnJldmlld19yZXF1aXJlZCB8fCAwOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgna3BpLWNvbXBsZXRlZCcpLmlubmVyVGV4dCA9IGtwaS5jb21wbGV0ZWQgfHwgMDsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2twaS1jb21wbGV0ZWQtdG9kYXknKS5pbm5lclRleHQgPSBrcGkuY29tcGxldGVkX3RvZGF5IHx8IDA7CgogICAgICAvLyBQcmFjdGljZSBDYXRlZ29yeSBEaXN0cmlidXRpb24gQmFycwogICAgICBjb25zdCBjYXRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgna3BpLWNhdGVnb3J5LWJhcnMnKTsKICAgICAgY2F0Q29udGFpbmVyLmlubmVySFRNTCA9ICcnOwogICAgICBjb25zdCB0b3RhbCA9IGtwaS50b3RhbF90YXNrcyB8fCAxOwoKICAgICAgY29uc3QgY29sb3JzID0gewogICAgICAgICJEaXJlY3QgVGF4IjogImJnLWJsdWUtNjAwIiwKICAgICAgICAiSW5kaXJlY3QgVGF4IjogImJnLWluZGlnby02MDAiLAogICAgICAgICJDb3Jwb3JhdGUgLyBNQ0EiOiAiYmctcHVycGxlLTYwMCIsCiAgICAgICAgIkF1ZGl0ICYgQXNzdXJhbmNlIjogImJnLWVtZXJhbGQtNjAwIiwKICAgICAgICAiQWNjb3VudGluZyAmIEFkdmlzb3J5IjogImJnLWFtYmVyLTUwMCIsCiAgICAgICAgIk90aGVyIjogImJnLXNsYXRlLTQwMCIKICAgICAgfTsKCiAgICAgIE9iamVjdC5rZXlzKGtwaS5jYXRlZ29yeV9jb3VudHMpLmZvckVhY2goY2F0ID0+IHsKICAgICAgICBjb25zdCBjb3VudCA9IGtwaS5jYXRlZ29yeV9jb3VudHNbY2F0XSB8fCAwOwogICAgICAgIGNvbnN0IHBjdCA9IE1hdGgucm91bmQoKGNvdW50IC8gdG90YWwpICogMTAwKTsKICAgICAgICBjYXRDb250YWluZXIuaW5uZXJIVE1MICs9IGAKICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZsZXgganVzdGlmeS1iZXR3ZWVuIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXNsYXRlLTcwMCBtYi0xIj4KICAgICAgICAgICAgICA8c3Bhbj4ke2NhdH08L3NwYW4+CiAgICAgICAgICAgICAgPHNwYW4+JHtjb3VudH0gdGFza3MgKCR7cGN0fSUpPC9zcGFuPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0idy1mdWxsIGJnLXNsYXRlLTEwMCByb3VuZGVkLWZ1bGwgaC0yIG92ZXJmbG93LWhpZGRlbiI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iJHtjb2xvcnNbY2F0XSB8fCAnYmctYmx1ZS01MDAnfSBoLTIgcm91bmRlZC1mdWxsIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTUwMCIgc3R5bGU9IndpZHRoOiAke3BjdH0lIj48L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICBgOwogICAgICB9KTsKCiAgICAgIC8vIFN0YWZmIFBlcmZvcm1hbmNlIFRhYmxlCiAgICAgIGNvbnN0IHN0YWZmQm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdrcGktc3RhZmYtdGFibGUtYm9keScpOwogICAgICBzdGFmZkJvZHkuaW5uZXJIVE1MID0gJyc7CgogICAgICAoa3BpLnN0YWZmX3BlcmZvcm1hbmNlIHx8IFtdKS5mb3JFYWNoKHMgPT4gewogICAgICAgIHN0YWZmQm9keS5pbm5lckhUTUwgKz0gYAogICAgICAgICAgPHRyIGNsYXNzPSJob3ZlcjpiZy1zbGF0ZS01MCB0cmFuc2l0aW9uIj4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC0zIHB5LTIgZm9udC1tZWRpdW0gdGV4dC1zbGF0ZS04MDAiPiR7ZXNjYXBlSHRtbChzLmFzc2lnbmVlKX08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTMgcHktMiB0ZXh0LWNlbnRlciBmb250LWJvbGQgdGV4dC1zbGF0ZS03MDAiPiR7cy5wZW5kaW5nICsgcy5pbl9wcm9ncmVzc308L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTMgcHktMiB0ZXh0LWNlbnRlciB0ZXh0LXB1cnBsZS03MDAgZm9udC1zZW1pYm9sZCI+JHtzLnJldmlld19yZXF1aXJlZH08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTMgcHktMiB0ZXh0LWNlbnRlciBmb250LWJvbGQgJHtzLm92ZXJkdWUgPiAwID8gJ3RleHQtcmVkLTYwMCcgOiAndGV4dC1zbGF0ZS00MDAnfSI+JHtzLm92ZXJkdWV9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC0zIHB5LTIgdGV4dC1jZW50ZXIgdGV4dC1zbGF0ZS02MDAiPiR7cy5hdmdfdGF0X2RheXN9IGQ8L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTMgcHktMiB0ZXh0LWNlbnRlciI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB4LTIgcHktMC41IHJvdW5kZWQgZm9udC1ib2xkIHRleHQtWzEwcHhdICR7cy5hZGhlcmVuY2VfcmF0ZSA+PSA4MCA/ICdiZy1lbWVyYWxkLTEwMCB0ZXh0LWVtZXJhbGQtODAwJyA6ICdiZy1hbWJlci0xMDAgdGV4dC1hbWJlci04MDAnfSI+CiAgICAgICAgICAgICAgICAke3MuYWRoZXJlbmNlX3JhdGV9JQogICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgPC90ZD4KICAgICAgICAgIDwvdHI+CiAgICAgICAgYDsKICAgICAgfSk7CiAgICB9CgogICAgLy8gPT09PT09PT09PT09PT09PT0gQVVESVQgTE9HUyA9PT09PT09PT09PT09PT09PQogICAgZnVuY3Rpb24gcmVuZGVyQXVkaXRMb2dzKGxvZ3MpIHsKICAgICAgY29uc3QgdEJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9ncy10YWJsZS1ib2R5Jyk7CiAgICAgIHRCb2R5LmlubmVySFRNTCA9ICcnOwoKICAgICAgKGxvZ3MgfHwgW10pLmZvckVhY2gobCA9PiB7CiAgICAgICAgdEJvZHkuaW5uZXJIVE1MICs9IGAKICAgICAgICAgIDx0ciBjbGFzcz0iaG92ZXI6Ymctc2xhdGUtNTAgdGV4dC1bMTFweF0iPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMiBmb250LW1vbm8gdGV4dC1zbGF0ZS01MDAiPiR7bC50aW1lc3RhbXB9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTIgZm9udC1zZW1pYm9sZCB0ZXh0LWJsdWUtNzAwIj4ke2wudGFza19pZH08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMiB0ZXh0LXNsYXRlLTcwMCBmb250LW1lZGl1bSI+JHtlc2NhcGVIdG1sKGwudXNlcl9lbWFpbCl9PC90ZD4KICAgICAgICAgICAgPHRkIGNsYXNzPSJweC00IHB5LTIiPjxzcGFuIGNsYXNzPSJweC0yIHB5LTAuNSByb3VuZGVkIGJnLXNsYXRlLTEwMCBmb250LXNlbWlib2xkIHRleHQtWzEwcHhdIHRleHQtc2xhdGUtODAwIj4ke2wuYWN0aW9uX3R5cGV9PC9zcGFuPjwvdGQ+CiAgICAgICAgICAgIDx0ZCBjbGFzcz0icHgtNCBweS0yIHRleHQtc2xhdGUtNDAwIGZvbnQtbW9ubyI+JHtlc2NhcGVIdG1sKGwucHJldmlvdXNfdmFsdWUgfHwgJy0nKX08L3RkPgogICAgICAgICAgICA8dGQgY2xhc3M9InB4LTQgcHktMiB0ZXh0LXNsYXRlLTgwMCI+JHtlc2NhcGVIdG1sKGwubmV3X3ZhbHVlIHx8ICctJyl9PC90ZD4KICAgICAgICAgIDwvdHI+CiAgICAgICAgYDsKICAgICAgfSk7CiAgICB9CgogICAgLy8gPT09PT09PT09PT09PT09PT0gRFJPUERPV04gUE9QVUxBVE9SUyA9PT09PT09PT09PT09PT09PQogICAgZnVuY3Rpb24gcG9wdWxhdGVTZXJ2aWNlQ2F0ZWdvcmllcygpIHsKICAgICAgLy8gU2luZ2xlIFRhc2sKICAgICAgb25DYXRlZ29yeUNoYW5nZSgpOwogICAgICAvLyBCdWxrIFRhc2sKICAgICAgb25CdWxrQ2F0ZWdvcnlDaGFuZ2UoKTsKICAgIH0KCiAgICBmdW5jdGlvbiBwb3B1bGF0ZUNsaWVudERyb3Bkb3ducygpIHsKICAgICAgLy8gU2luZ2xlIGFzc2lnbiBkcm9wZG93bgogICAgICBjb25zdCBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXNzaWduLWNsaWVudC1pZCcpOwogICAgICBzZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9IiI+LS0gU2VsZWN0IENsaWVudCAoU2VhcmNoYWJsZSBieSBQQU4gLyBOYW1lKSAtLTwvb3B0aW9uPic7CgogICAgICBhbGxDbGllbnRzLmZvckVhY2goYyA9PiB7CiAgICAgICAgY29uc3QgbGFiZWwgPSBgJHtjLmNsaWVudF9sZWdhbF9uYW1lfSAke2MucGFuID8gJygnICsgYy5wYW4gKyAnKScgOiAnJ30gWyR7Yy5lbnRpdHlfdHlwZX1dYDsKICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IGA8b3B0aW9uIHZhbHVlPSIke2MuY2xpZW50X2lkfSIgZGF0YS1uYW1lPSIke2VzY2FwZUh0bWwoYy5jbGllbnRfbGVnYWxfbmFtZSl9Ij4ke2VzY2FwZUh0bWwobGFiZWwpfTwvb3B0aW9uPmA7CiAgICAgIH0pOwoKICAgICAgLy8gQnVsayBDaGVja2xpc3QKICAgICAgY29uc3QgYnVsa0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidWxrLWNsaWVudC1jaGVja2xpc3QnKTsKICAgICAgYnVsa0NvbnRhaW5lci5pbm5lckhUTUwgPSAnJzsKCiAgICAgIGFsbENsaWVudHMuZm9yRWFjaChjID0+IHsKICAgICAgICBidWxrQ29udGFpbmVyLmlubmVySFRNTCArPSBgCiAgICAgICAgICA8bGFiZWwgY2xhc3M9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHAtMiByb3VuZGVkIGhvdmVyOmJnLXNsYXRlLTUwIHRleHQteHMgdGV4dC1zbGF0ZS03MDAgY3Vyc29yLXBvaW50ZXIgYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAiPgogICAgICAgICAgICA8aW5wdXQgdHlwZT0iY2hlY2tib3giIHZhbHVlPSIke2MuY2xpZW50X2lkfSIgZGF0YS1uYW1lPSIke2VzY2FwZUh0bWwoYy5jbGllbnRfbGVnYWxfbmFtZSl9IiBvbmNoYW5nZT0idXBkYXRlQnVsa1NlbGVjdGVkQ291bnQoKSIgY2xhc3M9ImJ1bGstY2xpZW50LWNiIHRleHQtYmx1ZS02MDAgcm91bmRlZCI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0cnVuY2F0ZSIgdGl0bGU9IiR7ZXNjYXBlSHRtbChjLmNsaWVudF9sZWdhbF9uYW1lKX0iPiR7ZXNjYXBlSHRtbChjLmNsaWVudF9sZWdhbF9uYW1lKX08L3NwYW4+CiAgICAgICAgICA8L2xhYmVsPgogICAgICAgIGA7CiAgICAgIH0pOwogICAgfQoKICAgIGZ1bmN0aW9uIHBvcHVsYXRlVXNlckRyb3Bkb3ducygpIHsKICAgICAgLy8gU2luZ2xlIGFzc2lnbiB1c2VyIGRyb3Bkb3duCiAgICAgIGNvbnN0IHNlbGVjdEFzc2lnbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhc3NpZ24tdXNlci1pZCcpOwogICAgICBjb25zdCBzZWxlY3RSZWFzc2lnbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1yZWFzc2lnbi11c2VyJyk7CiAgICAgIGNvbnN0IHNlbGVjdEFsbEZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGwtZmlsdGVyLWFzc2lnbmVlJyk7CiAgICAgIGNvbnN0IHNlbGVjdFJlYXNzaWduRmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYXNzaWduLWZpbHRlci11c2VyJyk7CgogICAgICBzZWxlY3RBc3NpZ24uaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9IiI+LS0gU2VsZWN0IFRlYW0gTWVtYmVyIC0tPC9vcHRpb24+JzsKICAgICAgc2VsZWN0UmVhc3NpZ24uaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9IiI+LS0gU2VsZWN0IE5ldyBUZWFtIE1lbWJlciAtLTwvb3B0aW9uPic7CiAgICAgIHNlbGVjdEFsbEZpbHRlci5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT0iQWxsIj5BbGwgU3RhZmYgLyBBc3NpZ25lZXM8L29wdGlvbj4nOwogICAgICBzZWxlY3RSZWFzc2lnbkZpbHRlci5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT0iQWxsIj5BbGwgQ3VycmVudCBBc3NpZ25lZXM8L29wdGlvbj4nOwoKICAgICAgLy8gQnVsayBzdGFmZiBjaGVja2xpc3QKICAgICAgY29uc3QgYnVsa1N0YWZmQ29udCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidWxrLXN0YWZmLWNoZWNrbGlzdCcpOwogICAgICBidWxrU3RhZmZDb250LmlubmVySFRNTCA9ICcnOwoKICAgICAgYWxsVXNlcnMuZm9yRWFjaCh1ID0+IHsKICAgICAgICBjb25zdCBvcHRpb25IdG1sID0gYDxvcHRpb24gdmFsdWU9IiR7dS5lbWFpbH0iPiR7ZXNjYXBlSHRtbCh1LmZ1bGxfbmFtZSl9ICgke3Uucm9sZS5yZXBsYWNlKC9fL2csICcgJyl9KTwvb3B0aW9uPmA7CiAgICAgICAgc2VsZWN0QXNzaWduLmlubmVySFRNTCArPSBvcHRpb25IdG1sOwogICAgICAgIHNlbGVjdFJlYXNzaWduLmlubmVySFRNTCArPSBvcHRpb25IdG1sOwogICAgICAgIHNlbGVjdEFsbEZpbHRlci5pbm5lckhUTUwgKz0gYDxvcHRpb24gdmFsdWU9IiR7dS5lbWFpbH0iPiR7ZXNjYXBlSHRtbCh1LmZ1bGxfbmFtZSl9PC9vcHRpb24+YDsKICAgICAgICBzZWxlY3RSZWFzc2lnbkZpbHRlci5pbm5lckhUTUwgKz0gYDxvcHRpb24gdmFsdWU9IiR7dS5lbWFpbH0iPiR7ZXNjYXBlSHRtbCh1LmZ1bGxfbmFtZSl9PC9vcHRpb24+YDsKCiAgICAgICAgYnVsa1N0YWZmQ29udC5pbm5lckhUTUwgKz0gYAogICAgICAgICAgPGxhYmVsIGNsYXNzPSJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBwLTEuNSByb3VuZGVkIGhvdmVyOmJnLXNsYXRlLTUwIHRleHQteHMgdGV4dC1zbGF0ZS03MDAgY3Vyc29yLXBvaW50ZXIiPgogICAgICAgICAgICA8aW5wdXQgdHlwZT0iY2hlY2tib3giIHZhbHVlPSIke3UuZW1haWx9IiBjbGFzcz0iYnVsay1zdGFmZi1jYiB0ZXh0LWJsdWUtNjAwIHJvdW5kZWQiICR7dS5yb2xlID09PSAnU3RhZmYvQXJ0aWNsZV9UcmFpbmVlJyA/ICdjaGVja2VkJyA6ICcnfT4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InRydW5jYXRlIj4ke2VzY2FwZUh0bWwodS5mdWxsX25hbWUpfTwvc3Bhbj4KICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgYDsKICAgICAgfSk7CiAgICB9CgogICAgLy8gPT09PT09PT09PT09PT09PT0gTU9EQUwgJiBVSSBVVElMSVRJRVMgPT09PT09PT09PT09PT09PT0KICAgIGZ1bmN0aW9uIG9wZW5Nb2RhbChpZCkgewogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICB9CgogICAgZnVuY3Rpb24gY2xvc2VNb2RhbChpZCkgewogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgICB9CgogICAgZnVuY3Rpb24gc2hvd0xvYWRlcihtc2cpIHsKICAgICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dsb2JhbC1sb2FkZXInKTsKICAgICAgY29uc3QgdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkZXItbWVzc2FnZScpOwogICAgICBpZiAodGV4dCkgdGV4dC5pbm5lclRleHQgPSBtc2cgfHwgIkxvYWRpbmcuLi4iOwogICAgICBpZiAobG9hZGVyKSBsb2FkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICB9CgogICAgZnVuY3Rpb24gaGlkZUxvYWRlcigpIHsKICAgICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dsb2JhbC1sb2FkZXInKTsKICAgICAgaWYgKGxvYWRlcikgbG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgfQoKICAgIGZ1bmN0aW9uIHNob3dUb2FzdChtZXNzYWdlLCB0eXBlID0gJ2luZm8nKSB7CiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdC1jb250YWluZXInKTsKICAgICAgY29uc3QgdG9hc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTsKICAgICAgCiAgICAgIGNvbnN0IGNvbG9ycyA9IHsKICAgICAgICBzdWNjZXNzOiAnYmctZW1lcmFsZC02MDAgdGV4dC13aGl0ZScsCiAgICAgICAgZXJyb3I6ICdiZy1yZWQtNjAwIHRleHQtd2hpdGUnLAogICAgICAgIHdhcm5pbmc6ICdiZy1hbWJlci02MDAgdGV4dC13aGl0ZScsCiAgICAgICAgaW5mbzogJ2JnLXNsYXRlLTkwMCB0ZXh0LXdoaXRlJwogICAgICB9OwoKICAgICAgY29uc3QgaWNvbnMgPSB7CiAgICAgICAgc3VjY2VzczogJ2ZhLWNpcmNsZS1jaGVjaycsCiAgICAgICAgZXJyb3I6ICdmYS1jaXJjbGUtZXhjbGFtYXRpb24nLAogICAgICAgIHdhcm5pbmc6ICdmYS10cmlhbmdsZS1leGNsYW1hdGlvbicsCiAgICAgICAgaW5mbzogJ2ZhLWNpcmNsZS1pbmZvJwogICAgICB9OwoKICAgICAgdG9hc3QuY2xhc3NOYW1lID0gYCR7Y29sb3JzW3R5cGVdIHx8IGNvbG9ycy5pbmZvfSBweC00IHB5LTMgcm91bmRlZC1sZyBzaGFkb3ctbGcgdGV4dC14cyBmb250LXNlbWlib2xkIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yLjUgdHJhbnNpdGlvbiB0cmFuc2Zvcm0gZHVyYXRpb24tMzAwIHRyYW5zbGF0ZS15LTIgb3BhY2l0eS0wYDsKICAgICAgdG9hc3QuaW5uZXJIVE1MID0gYDxpIGNsYXNzPSJmYS1zb2xpZCAke2ljb25zW3R5cGVdIHx8IGljb25zLmluZm99Ij48L2k+IDxzcGFuPiR7ZXNjYXBlSHRtbChtZXNzYWdlKX08L3NwYW4+YDsKCiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0b2FzdCk7CgogICAgICAvLyBBbmltYXRlIGluCiAgICAgIHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgIHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ3RyYW5zbGF0ZS15LTInLCAnb3BhY2l0eS0wJyk7CiAgICAgIH0sIDEwKTsKCiAgICAgIC8vIEF1dG8gZGlzbWlzcwogICAgICBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICB0b2FzdC5jbGFzc0xpc3QuYWRkKCdvcGFjaXR5LTAnLCAndHJhbnNsYXRlLXktMicpOwogICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QucmVtb3ZlKCksIDMwMCk7CiAgICAgIH0sIDQwMDApOwogICAgfQoKICAgIGZ1bmN0aW9uIGhhbmRsZVNlcnZlckVycm9yKGVycikgewogICAgICBoaWRlTG9hZGVyKCk7CiAgICAgIGNvbnN0IG1zZyA9IChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTsKICAgICAgc2hvd1RvYXN0KCJTZXJ2ZXIgRXJyb3I6ICIgKyBtc2csICJlcnJvciIpOwogICAgICBjb25zb2xlLmVycm9yKCJBcHBzIFNjcmlwdCBFcnJvcjoiLCBlcnIpOwogICAgfQoKICAgIGZ1bmN0aW9uIHRvQmFzZTY0KGZpbGUpIHsKICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsKICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpOwogICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpOwogICAgICAgIHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKHJlYWRlci5yZXN1bHQpOwogICAgICAgIHJlYWRlci5vbmVycm9yID0gZXJyb3IgPT4gcmVqZWN0KGVycm9yKTsKICAgICAgfSk7CiAgICB9CgogICAgZnVuY3Rpb24gZXNjYXBlSHRtbCh0ZXh0KSB7CiAgICAgIGlmICghdGV4dCkgcmV0dXJuICcnOwogICAgICByZXR1cm4gU3RyaW5nKHRleHQpCiAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JykKICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpCiAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKQogICAgICAgIC5yZXBsYWNlKC8iL2csICcmcXVvdDsnKQogICAgICAgIC5yZXBsYWNlKC8nL2csICcmIzAzOTsnKTsKICAgIH0KICA8L3NjcmlwdD4KPC9ib2R5Pgo8L2h0bWw+Cg==";

function getEmbeddedPortalHtml() {
  const bytes = Utilities.base64Decode(EMBEDDED_PORTAL_HTML_B64);
  return Utilities.newBlob(bytes, 'text/html').getDataAsString('UTF-8');
}
