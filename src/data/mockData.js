// Comprehensive Mock Data for CA Firm Practice Management

export const INITIAL_USERS = [
  {
    id: 'U1',
    name: 'CA Rajesh Sharma',
    email: 'rajesh@cadesk.in',
    password: 'SuperAdminPass#2026',
    role: 'SUPER_ADMIN',
    status: 'Active',
    designation: 'Managing Partner',
    mobile: '+91 98230 11223',
    allocatedClientIds: ['CL001', 'CL002', 'CL003', 'CL004', 'CL005']
  },
  {
    id: 'U2',
    name: 'CA Ananya Verma',
    email: 'ananya@cadesk.in',
    password: 'AdminPass#2026',
    role: 'MANAGER',
    status: 'Active',
    designation: 'Audit & Tax Manager',
    mobile: '+91 97112 44556',
    allocatedClientIds: ['CL001', 'CL002', 'CL004']
  },
  {
    id: 'U3',
    name: 'Rohan Gupta',
    email: 'rohan.art@cadesk.in',
    password: 'RohanPass#2026',
    role: 'NORMAL_USER',
    status: 'Active',
    designation: 'Senior Article Assistant',
    mobile: '+91 98765 12345',
    allocatedClientIds: ['CL003', 'CL002']
  },
  {
    id: 'U4',
    name: 'Priya Nair',
    email: 'priya@cadesk.in',
    password: 'PriyaPass#2026',
    role: 'NORMAL_USER',
    status: 'Active',
    designation: 'GST Specialist',
    mobile: '+91 99887 66554',
    allocatedClientIds: ['CL001', 'CL002']
  },
  {
    id: 'U5',
    name: 'Amit Singh',
    email: 'amit.art@cadesk.in',
    password: 'AmitPass#2026',
    role: 'NORMAL_USER',
    status: 'Active',
    designation: 'Article Trainee',
    mobile: '+91 91234 56789',
    allocatedClientIds: ['CL005']
  }
];

export const INITIAL_STAFF = INITIAL_USERS;

export const INITIAL_CLIENTS = [
  {
    id: 'CL001',
    name: 'Apex Infotech Private Limited',
    tradeName: 'Apex Infotech',
    constitution: 'Private Limited Company',
    pan: 'AAACA1234F',
    gstin: '27AAACA1234F1Z5',
    tan: 'MUMB12345E',
    cin: 'U72200MH2018PTC309876',
    email: 'accounts@apexinfotech.com',
    phone: '+91 98200 55443',
    authorizedPerson: 'Vikram Mehta (Director)',
    address: '402, Pinnacle Business Park, Andheri East, Mumbai, MH - 400069',
    assignedStaff: 'U2',
    category: 'Corporate',
    turnover: '₹14.5 Cr',
    bankDetails: { bank: 'HDFC Bank', acNo: '50200034112299', ifsc: 'HDFC0000240', branch: 'Andheri East' },
    portalCredentials: {
      gstUser: 'APEX_GST_27',
      gstPass: 'ApexGST@2026',
      itUser: 'AAACA1234F',
      itPass: 'ApexTax#2026',
      mcaUser: 'vikram.mehta',
      mcaPass: 'VikramMCA$99'
    },
    directors: [
      { name: 'Vikram Mehta', din: '08123456', mobile: '+91 98200 55443', pan: 'ABCPM1234K' },
      { name: 'Sunita Mehta', din: '08123457', mobile: '+91 98200 55444', pan: 'ABCPM5678L' }
    ]
  },
  {
    id: 'CL002',
    name: 'Mahavir Textiles & Traders',
    tradeName: 'Mahavir Textiles',
    constitution: 'Partnership Firm',
    pan: 'AABFM9876Q',
    gstin: '24AABFM9876Q1Z9',
    tan: 'AHMD98765F',
    cin: 'N/A',
    email: 'info@mahavirtextiles.in',
    phone: '+91 94260 88990',
    authorizedPerson: 'Babulal Shah (Partner)',
    address: '12, Ring Road Cloth Market, Surat, GJ - 395002',
    assignedStaff: 'U4',
    category: 'GST & Tax Audit',
    turnover: '₹4.8 Cr',
    bankDetails: { bank: 'ICICI Bank', acNo: '001205011988', ifsc: 'ICIC0000012', branch: 'Ring Road Surat' },
    portalCredentials: {
      gstUser: 'MAHAVIR_TX',
      gstPass: 'MhvrTextile@26',
      itUser: 'AABFM9876Q',
      itPass: 'MahavirIT#2026'
    },
    directors: [
      { name: 'Babulal Shah', din: 'N/A', mobile: '+91 94260 88990', pan: 'AFXPS1122M' },
      { name: 'Jitendra Shah', din: 'N/A', mobile: '+91 94260 88991', pan: 'AFXPS3344N' }
    ]
  },
  {
    id: 'CL003',
    name: 'Dr. Ramesh Chandra (Individual)',
    tradeName: 'Chandra Multi-Specialty Clinic',
    constitution: 'Individual / Proprietorship',
    pan: 'ABCPC5544R',
    gstin: '07ABCPC5544R1ZD',
    tan: 'DELC44332G',
    cin: 'N/A',
    email: 'dr.ramesh.chandra@gmail.com',
    phone: '+91 98110 33221',
    authorizedPerson: 'Dr. Ramesh Chandra',
    address: 'B-14, Green Park Main, New Delhi - 110016',
    assignedStaff: 'U3',
    category: 'Individual ITR',
    turnover: '₹85 Lakhs',
    bankDetails: { bank: 'State Bank of India', acNo: '30998811223', ifsc: 'SBIN0000625', branch: 'Green Park' },
    portalCredentials: {
      gstUser: 'DR_RAMESH_CLINIC',
      gstPass: 'DocRamesh#2026',
      itUser: 'ABCPC5544R',
      itPass: 'DocTax@2026'
    },
    directors: []
  },
  {
    id: 'CL004',
    name: 'Skyline Builders & Developers LLP',
    tradeName: 'Skyline Developers',
    constitution: 'Limited Liability Partnership (LLP)',
    pan: 'AAAFF7788P',
    gstin: '29AAAFF7788P1ZK',
    tan: 'BLRS77665H',
    cin: 'AAB-9988 (LLPIN)',
    email: 'accounts@skylinedevelopers.com',
    phone: '+91 98450 66778',
    authorizedPerson: 'Karan Malhotra (Designated Partner)',
    address: '101, Indiranagar 100ft Road, Bengaluru, KA - 560038',
    assignedStaff: 'U1',
    category: 'Audit & Corporate',
    turnover: '₹22.0 Cr',
    bankDetails: { bank: 'Axis Bank', acNo: '918020055443322', ifsc: 'UTIB0000140', branch: 'Indiranagar' },
    portalCredentials: {
      gstUser: 'SKYLINE_BLR',
      gstPass: 'SkylineGST$26',
      itUser: 'AAAFF7788P',
      itPass: 'SkylineITR#26',
      mcaUser: 'karan.skyline',
      mcaPass: 'KaranLLP!2026'
    },
    directors: [
      { name: 'Karan Malhotra', din: '07554433', mobile: '+91 98450 66778', pan: 'AIMPM8877K' },
      { name: 'Ritu Malhotra', din: '07554434', mobile: '+91 98450 66779', pan: 'AIMPR4433L' }
    ]
  },
  {
    id: 'CL005',
    name: 'GreenEarth Healthcare Foundation (Trust)',
    tradeName: 'GreenEarth Trust',
    constitution: 'Trust / NGO (12A/80G)',
    pan: 'AAATG3322K',
    gstin: '27AAATG3322K1Z3',
    tan: 'MUMG33221I',
    cin: 'N/A',
    email: 'finance@greenearthtrust.org',
    phone: '+91 97690 12121',
    authorizedPerson: 'Anjali Deshmukh (Managing Trustee)',
    address: 'Plot 45, Sector 15, Vashi, Navi Mumbai, MH - 400703',
    assignedStaff: 'U5',
    category: 'Trust & Exempt Entity',
    turnover: '₹1.2 Cr',
    bankDetails: { bank: 'Bank of Baroda', acNo: '0421010008899', ifsc: 'BARB0VASHIX', branch: 'Vashi Navi Mumbai' },
    portalCredentials: {
      gstUser: 'GREENEARTH_TRUST',
      gstPass: 'EarthTrust#26',
      itUser: 'AAATG3322K',
      itPass: 'TrustTax@2026'
    },
    directors: []
  }
];

export const INITIAL_REMOVED_CLIENTS = [
  {
    id: 'CL009-OLD',
    name: 'Star Logistics & Freight Forwarders',
    tradeName: 'Star Logistics',
    constitution: 'Partnership Firm',
    pan: 'AAAFS4455K',
    gstin: '27AAAFS4455K1Z8',
    tan: 'MUMS44332L',
    email: 'contact@starlogistics.com',
    removedBy: 'CA Rajesh Sharma',
    removedDate: '2026-08-01',
    reason: 'Client closed operations in July 2026'
  }
];

export const INITIAL_GST_WORK = [
  { id: 'GST-101', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', gstin: '27AAACA1234F1Z5', period: 'July 2026', type: 'GSTR-3B', dueDate: '2026-08-20', status: 'Draft Prepared', salesTax: 450000, itcAvailable: 320000, netLiability: 130000, assignedTo: 'U4', notes: 'GSTR-2B reconciled with Purchase Register.' },
  { id: 'GST-102', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', gstin: '27AAACA1234F1Z5', period: 'July 2026', type: 'GSTR-1', dueDate: '2026-08-11', status: 'Filed', salesTax: 450000, itcAvailable: 0, netLiability: 450000, assignedTo: 'U4', notes: 'Filed successfully ARN: AA270726112233G.' },
  { id: 'GST-103', clientId: 'CL002', clientName: 'Mahavir Textiles & Traders', gstin: '24AABFM9876Q1Z9', period: 'July 2026', type: 'GSTR-3B', dueDate: '2026-08-20', status: 'Data Received', salesTax: 280000, itcAvailable: 210000, netLiability: 70000, assignedTo: 'U4', notes: 'Waiting for July bank statement for verification.' },
  { id: 'GST-104', clientId: 'CL002', clientName: 'Mahavir Textiles & Traders', gstin: '24AABFM9876Q1Z9', period: 'July 2026', type: 'GSTR-1', dueDate: '2026-08-11', status: 'Data Pending', salesTax: 0, itcAvailable: 0, netLiability: 0, assignedTo: 'U3', notes: 'Client requested 2 days delay for sales register.' },
  { id: 'GST-105', clientId: 'CL003', clientName: 'Dr. Ramesh Chandra', gstin: '07ABCPC5544R1ZD', period: 'Q1 (Apr-Jun 2026)', type: 'CMP-08 (Composition)', dueDate: '2026-07-18', status: 'Filed', salesTax: 12000, itcAvailable: 0, netLiability: 12000, assignedTo: 'U3', notes: 'Challan paid and CMP-08 filed.' },
  { id: 'GST-106', clientId: 'CL004', clientName: 'Skyline Builders & Developers LLP', gstin: '29AAAFF7788P1ZK', period: 'July 2026', type: 'GSTR-3B', dueDate: '2026-08-20', status: 'Client Approved', salesTax: 890000, itcAvailable: 610000, netLiability: 280000, assignedTo: 'U2', notes: 'OTP requested from Director Karan Malhotra.' },
  { id: 'GST-107', clientId: 'CL005', clientName: 'GreenEarth Healthcare Foundation', gstin: '27AAATG3322K1Z3', period: 'FY 2025-26', type: 'GSTR-9 (Annual)', dueDate: '2026-12-31', status: 'In Audit', salesTax: 0, itcAvailable: 0, netLiability: 0, assignedTo: 'U1', notes: 'Exempt supply reconciliation under process.' }
];

export const INITIAL_IT_WORK = [
  { id: 'IT-201', clientId: 'CL003', clientName: 'Dr. Ramesh Chandra', pan: 'ABCPC5544R', ay: 'AY 2026-27', formType: 'ITR-3 (Business/Profession)', dueDate: '2026-07-31', status: 'Filed', taxableIncome: 2450000, taxDue: 415000, refund: 0, ackNo: '887965412300', assignedTo: 'U3', taxAuditRequired: false },
  { id: 'IT-202', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', pan: 'AAACA1234F', ay: 'AY 2026-27', formType: 'ITR-6 (Corporate)', dueDate: '2026-10-31', status: 'Draft Prepared', taxableIncome: 18500000, taxDue: 4625000, refund: 0, ackNo: '-', assignedTo: 'U2', taxAuditRequired: true },
  { id: 'IT-203', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', pan: 'AAACA1234F', ay: 'AY 2026-27', formType: 'Form 3CA/3CD (Tax Audit)', dueDate: '2026-09-30', status: 'In Audit', taxableIncome: 0, taxDue: 0, refund: 0, ackNo: '-', assignedTo: 'U1', taxAuditRequired: true },
  { id: 'IT-204', clientId: 'CL002', clientName: 'Mahavir Textiles & Traders', pan: 'AABFM9876Q', ay: 'AY 2026-27', formType: 'Form 3CB/3CD (Tax Audit)', dueDate: '2026-09-30', status: 'Data Received', taxableIncome: 4200000, taxDue: 1260000, refund: 0, ackNo: '-', assignedTo: 'U2', taxAuditRequired: true },
  { id: 'IT-205', clientId: 'CL004', clientName: 'Skyline Builders & Developers LLP', pan: 'AAAFF7788P', ay: 'AY 2026-27', formType: 'ITR-5 (LLP)', dueDate: '2026-10-31', status: 'Data Pending', taxableIncome: 28000000, taxDue: 8400000, refund: 0, ackNo: '-', assignedTo: 'U2', taxAuditRequired: true },
  { id: 'IT-206', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', pan: 'AAACA1234F', ay: 'Q1 (Apr-Jun 2026)', formType: 'TDS 26Q (Non-Salary)', dueDate: '2026-07-31', status: 'Filed', taxableIncome: 1200000, taxDue: 120000, refund: 0, ackNo: 'TDS-26Q-99881', assignedTo: 'U4', taxAuditRequired: false }
];

export const INITIAL_ROC_WORK = [
  { id: 'ROC-301', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', formName: 'DIR-3 KYC', category: 'Director KYC', dueDate: '2026-09-30', status: 'Completed', assignedTo: 'U3', notes: 'Completed for both directors Vikram Mehta and Sunita Mehta.' },
  { id: 'ROC-302', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', formName: 'AOC-4 (Financial Statements)', category: 'Annual Filing', dueDate: '2026-10-30', status: 'In Progress', assignedTo: 'U2', notes: 'Awaiting balance sheet signoff.' },
  { id: 'ROC-303', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', formName: 'MGT-7 (Annual Return)', category: 'Annual Filing', dueDate: '2026-11-29', status: 'Pending', assignedTo: 'U2', notes: 'To be filed post AGM.' },
  { id: 'ROC-304', clientId: 'CL004', clientName: 'Skyline Builders LLP', formName: 'Form 11 (Annual Return LLP)', category: 'LLP Annual', dueDate: '2026-05-30', status: 'Completed', assignedTo: 'U1', notes: 'Filed with SRN R88771122.' }
];

export const INITIAL_TASKS = [
  {
    id: 'CA-WRK-101',
    title: 'GSTR-3B July 2026 Filing & ITC Reconciliation',
    clientId: 'CL001',
    clientName: 'Apex Infotech Private Limited',
    clientPan: 'AAACA1234F',
    clientGstin: '27AAACA1234F1Z5',
    department: 'GST Compliance',
    category: 'GST',
    assignedTo: 'U4',
    assignedToName: 'Priya Nair',
    allocatedBy: 'CA Rajesh Sharma (Managing Partner)',
    allocatedDate: '2026-08-01',
    dueDate: '2026-08-18',
    finishingDate: '2026-08-18',
    priority: 'High',
    status: 'In Progress',
    fy: '2025-26',
    ay: '2026-27',
    statutorySection: 'Section 39 / Rule 61 (GSTR-3B)',
    workDetails: 'Reconcile Purchase Register with GSTR-2B before draft generation. Verify ITC mismatch exceeding 5%. Prepare summary of tax payment challans.',
    initialRemarks: 'Ensure client approves draft tax liability before 19th Aug.',
    estimatedHours: '6 hrs',
    feeQuote: '₹12,500'
  },
  {
    id: 'CA-WRK-102',
    title: 'Form 3CD Tax Audit Report Verification & Annexures',
    clientId: 'CL002',
    clientName: 'Mahavir Textiles & Traders',
    clientPan: 'AABFM9876Q',
    clientGstin: '24AABFM9876Q1Z9',
    department: 'Statutory & Tax Audit',
    category: 'Tax Audit',
    assignedTo: 'U3',
    assignedToName: 'Rohan Gupta',
    allocatedBy: 'CA Rajesh Sharma (Managing Partner)',
    allocatedDate: '2026-08-02',
    dueDate: '2026-08-25',
    finishingDate: '2026-08-25',
    priority: 'Urgent',
    status: 'Submitted for Approval',
    fy: '2025-26',
    ay: '2026-27',
    statutorySection: 'Section 44AB Form 3CD',
    workDetails: 'Verify inadmissible personal expenses & disallowance u/s 40A(3), 43B statutory dues, and depreciation schedule.',
    initialRemarks: 'Check GST 2B vs purchase ledgers for input tax discrepancies.',
    estimatedHours: '14 hrs',
    feeQuote: '₹45,000',
    submissionDetails: {
      submittedAt: '2026-08-08',
      submittedBy: 'Rohan Gupta',
      completionRemarks: 'Clauses 1 to 32 verified against ledger vouchers. Working papers attached in audit file. Disallowance of ₹18,400 noted under Clause 21(a). Ready for Manager review.'
    }
  },
  {
    id: 'CA-WRK-103',
    title: 'Direct Tax Advance Tax Q2 Computation & Working Papers',
    clientId: 'CL004',
    clientName: 'Skyline Builders & Developers LLP',
    clientPan: 'AAAFF7788P',
    clientGstin: '29AAAFF7788P1ZK',
    department: 'Income Tax',
    category: 'Income Tax',
    assignedTo: 'U3',
    assignedToName: 'Rohan Gupta',
    allocatedBy: 'CA Rajesh Sharma (Managing Partner)',
    allocatedDate: '2026-08-01',
    dueDate: '2026-09-10',
    finishingDate: '2026-09-10',
    priority: 'Medium',
    status: 'Transferred',
    fy: '2025-26',
    ay: '2026-27',
    statutorySection: 'Section 208-211 Advance Tax',
    workDetails: 'Estimate turnover based on real estate project milestone billings. Calculate second installment of 45% Advance Tax due 15th Sept.',
    initialRemarks: 'Initial allocation to GST team revealed turnover mismatch with P&L.',
    estimatedHours: '8 hrs',
    feeQuote: '₹20,000',
    transferHistory: [
      {
        transferDate: '2026-08-05',
        fromDepartment: 'GST Compliance',
        toDepartment: 'Income Tax',
        fromUser: 'Priya Nair',
        toUser: 'Rohan Gupta',
        managerName: 'CA Ananya Verma',
        reason: 'GST turnover reconciled. Revenue differs from profit calculation; transferred to Direct Tax department for advance tax estimation.'
      }
    ]
  },
  {
    id: 'CA-WRK-104',
    title: 'DIR-3 KYC Mobile & Email OTP Verification for Directors',
    clientId: 'CL004',
    clientName: 'Skyline Builders & Developers LLP',
    clientPan: 'AAAFF7788P',
    clientGstin: '29AAAFF7788P1ZK',
    department: 'ROC & Corporate Laws',
    category: 'ROC',
    assignedTo: 'U5',
    assignedToName: 'Amit Singh',
    allocatedBy: 'CA Rajesh Sharma (Managing Partner)',
    allocatedDate: '2026-08-06',
    dueDate: '2026-09-20',
    finishingDate: '2026-09-20',
    priority: 'Low',
    status: 'Allocated',
    fy: '2025-26',
    ay: '2026-27',
    statutorySection: 'Rule 12A Companies Rules 2014',
    workDetails: 'Coordinate with Karan Malhotra for OTP validation on MCA portal. Download challan zero fee and verify DIN status.',
    initialRemarks: 'Verify DIN status on MCA portal before initiating OTP.',
    estimatedHours: '2 hrs',
    feeQuote: '₹3,000'
  },
  {
    id: 'CA-WRK-105',
    title: 'ITR-3 Individual Business Return Filing AY 2026-27',
    clientId: 'CL003',
    clientName: 'Dr. Ramesh Chandra',
    clientPan: 'ABCPC5544R',
    clientGstin: '07ABCPC5544R1ZD',
    department: 'Income Tax',
    category: 'Income Tax',
    assignedTo: 'U3',
    assignedToName: 'Rohan Gupta',
    allocatedBy: 'CA Rajesh Sharma (Managing Partner)',
    allocatedDate: '2026-07-20',
    dueDate: '2026-07-28',
    finishingDate: '2026-07-28',
    priority: 'High',
    status: 'Completed',
    fy: '2025-26',
    ay: '2026-27',
    statutorySection: 'Section 139(1) ITR-3',
    workDetails: 'Medical clinic receipts, depreciation on medical equipment, and 80D mediclaim deductions verified against AIS/TIS.',
    initialRemarks: 'Complete before 31st July non-audit due date.',
    estimatedHours: '5 hrs',
    feeQuote: '₹15,000',
    submissionDetails: {
      submittedAt: '2026-07-25',
      submittedBy: 'Rohan Gupta',
      completionRemarks: 'Return drafted, computation verified with 26AS/AIS, challan generated and verified with Dr. Chandra.'
    },
    approvalDetails: {
      approvedAt: '2026-07-28',
      approvedBy: 'CA Ananya Verma (Manager)',
      approvalRemarks: 'Reviewed clinic profit ratio and advance tax credits against 26AS. Approved for e-filing. Filed successfully.'
    }
  },
  {
    id: 'CA-WRK-106',
    title: 'Statutory Audit Foreign Remittances & 15CA/CB Verification',
    clientId: 'CL001',
    clientName: 'Apex Infotech Private Limited',
    clientPan: 'AAACA1234F',
    clientGstin: '27AAACA1234F1Z5',
    department: 'Statutory & Tax Audit',
    category: 'Tax Audit',
    assignedTo: 'U4',
    assignedToName: 'Priya Nair',
    allocatedBy: 'CA Rajesh Sharma (Managing Partner)',
    allocatedDate: '2026-08-04',
    dueDate: '2026-08-30',
    finishingDate: '2026-08-30',
    priority: 'High',
    status: 'Transferred',
    fy: '2025-26',
    ay: '2026-27',
    statutorySection: 'Section 195 / Rule 37BB',
    workDetails: 'Cross-check foreign software license remittances with Form 15CA/15CB certificates and DTAA rates.',
    initialRemarks: 'Reconcile 15CA with bank outward swift advices.',
    estimatedHours: '10 hrs',
    feeQuote: '₹30,000',
    transferHistory: [
      {
        transferDate: '2026-08-07',
        fromDepartment: 'Income Tax',
        toDepartment: 'Statutory & Tax Audit',
        fromUser: 'Rohan Gupta',
        toUser: 'Priya Nair',
        managerName: 'CA Rajesh Sharma',
        reason: '15CB documentation review required audit team verification for withholding tax rate.'
      }
    ]
  }
];

export const INITIAL_INVOICES = [
  { id: 'INV-2026-041', clientId: 'CL001', clientName: 'Apex Infotech Pvt Ltd', date: '2026-07-15', dueDate: '2026-07-30', services: 'Professional Fees for Statutory Audit FY 2025-26 & GSTR-1/3B Filings Q1', amount: 85000, cgst: 7650, sgst: 7650, totalAmount: 100300, status: 'Paid', paymentMode: 'NEFT Bank Transfer' },
  { id: 'INV-2026-042', clientId: 'CL002', clientName: 'Mahavir Textiles & Traders', date: '2026-08-01', dueDate: '2026-08-15', services: 'Professional Fees for Tax Audit FY 2025-26 (Advance 50%)', amount: 45000, cgst: 4050, sgst: 4050, totalAmount: 53100, status: 'Pending', paymentMode: '-' },
  { id: 'INV-2026-043', clientId: 'CL003', clientName: 'Dr. Ramesh Chandra', date: '2026-07-28', dueDate: '2026-08-05', services: 'ITR-3 Preparation and Return Filing Fees AY 2026-27', amount: 15000, cgst: 1350, sgst: 1350, totalAmount: 17700, status: 'Paid', paymentMode: 'UPI' },
  { id: 'INV-2026-044', clientId: 'CL004', clientName: 'Skyline Builders & Developers LLP', date: '2026-08-05', dueDate: '2026-08-20', services: 'Retainership Fees for GST & ROC Compliance (Month of July 2026)', amount: 30000, igst: 5400, totalAmount: 35400, status: 'Pending', paymentMode: '-' }
];

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
