// Clean Production Default Data for TAXBAY CA Firm Practice Management

export const MASTER_ADMIN = {
  id: 'ADMIN01',
  name: 'Admin User',
  email: 'admin@cadesk.in',
  password: 'admin',
  role: 'SUPER_ADMIN',
  status: 'Active',
  designation: 'Managing Partner / Admin',
  mobile: '+91 99999 00000',
  allocatedClientIds: [],
  allowedTabs: [
    'dashboard',
    'tasks',
    'reports',
    'evidence',
    'inwardOutward',
    'clients',
    'gst',
    'it',
    'roc',
    'billing',
    'calendar',
    'users'
  ]
};

// Initial state for fresh installations & users (Zero dummy test data)
export const INITIAL_USERS = [MASTER_ADMIN];
export const INITIAL_STAFF = INITIAL_USERS;
export const INITIAL_CLIENTS = [];
export const INITIAL_REMOVED_CLIENTS = [];
export const INITIAL_GST_WORK = [];
export const INITIAL_IT_WORK = [];
export const INITIAL_ROC_WORK = [];
export const INITIAL_TASKS = [];
export const INITIAL_INVOICES = [];
export const INITIAL_INWARD_OUTWARD = [];

// Statutory Indian Compliance Deadlines (Used for Calendar & Due Dates)
export const COMPLIANCE_DEADLINES = [
  { date: '2026-08-07', title: 'TDS/TCS Deposit', detail: 'Deposit of TDS/TCS deducted in the month of July 2026 (Challan ITNS 281).', priority: 'High', authority: 'Income Tax' },
  { date: '2026-08-11', title: 'GSTR-1 Filing', detail: 'Filing of monthly GSTR-1 for outward supplies for July 2026.', priority: 'Urgent', authority: 'GST' },
  { date: '2026-08-13', title: 'IFF (QRMP Scheme)', detail: 'Invoice Furnishing Facility for QRMP taxpayers for July 2026.', priority: 'Medium', authority: 'GST' },
  { date: '2026-08-15', title: 'PF & ESI Monthly Return', detail: 'Payment of Provident Fund & ESI contributions for July 2026.', priority: 'Medium', authority: 'Labor Law' },
  { date: '2026-08-20', title: 'GSTR-3B Filing', detail: 'Filing of monthly summary return GSTR-3B for July 2026.', priority: 'Urgent', authority: 'GST' },
  { date: '2026-08-25', title: 'GST CMP-08 Payment', detail: 'Payment of tax under Composition scheme for July 2026.', priority: 'Low', authority: 'GST' },
  { date: '2026-09-15', title: 'Advance Tax 2nd Installment', detail: 'Payment of 2nd installment of Advance Tax (45%) for AY 2027-28.', priority: 'Urgent', authority: 'Income Tax' },
  { date: '2026-09-30', title: 'Tax Audit Report (3CD)', detail: 'Filing of Tax Audit Report u/s 44AB for FY 2025-26 (AY 2026-27).', priority: 'Critical', authority: 'Income Tax' },
  { date: '2026-09-30', title: 'DIR-3 KYC Annual filing', detail: 'Filing of DIR-3 KYC for all active Director Identification Numbers.', priority: 'High', authority: 'MCA / ROC' },
  { date: '2026-10-31', title: 'Corporate & Audit ITR Filing', detail: 'Filing of Income Tax Return for Tax Audit cases and Corporate Entities.', priority: 'Critical', authority: 'Income Tax' }
];
