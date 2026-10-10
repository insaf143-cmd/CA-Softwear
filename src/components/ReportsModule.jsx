import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
  FileCheck,
  Download,
  Printer,
  Search,
  Filter,
  ArrowRightLeft,
  Calendar,
  Building,
  User,
  CheckCheck,
  TrendingUp,
  Briefcase,
  Paperclip,
  UploadCloud,
  File,
  X,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  FolderCheck,
  Award,
  Grid,
  Layers,
  Check,
  Eye,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function ReportsModule({
  users = [],
  tasks = [],
  setTasks,
  gstWork = [],
  itWork = [],
  rocWork = [],
  clients = [],
  currentUser,
  firmProfile
}) {
  // activeReportTab: 'worksStatus' | 'completedHistory' | 'staffPerformance' | 'matrixReport'
  const [activeReportTab, setActiveReportTab] = useState('worksStatus');

  // Filter States for Tab 1
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [serviceLineFilter, setServiceLineFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab 3: Selected Staff for Performance & History
  const [selectedStaffId, setSelectedStaffId] = useState(users[0]?.id || 'U1');

  // Evidence Modal State
  const [managingEvidenceWork, setManagingEvidenceWork] = useState(null);
  const [newCloudLink, setNewCloudLink] = useState('');

  // Print Preview Modals
  const [printableJobModal, setPrintableJobModal] = useState(null); // Individual completion sheet
  const [showPrintCompletedRegister, setShowPrintCompletedRegister] = useState(false);
  const [showPrintStaffAppraisal, setShowPrintStaffAppraisal] = useState(false);
  const [showPrintMatrix, setShowPrintMatrix] = useState(false);

  // Core Service Lines
  const serviceLines = [
    'Audit & Assurance',
    'Direct Taxation & ITR',
    'Indirect Taxation (GST)',
    'Corporate Law & ROC',
    'Accounting & Bookkeeping',
    'Advisory & Project Finance'
  ];

  // Core Departments
  const departments = [
    'Statutory & Tax Audit',
    'Income Tax',
    'GST Compliance',
    'ROC & Corporate Laws',
    'Accounting & Bookkeeping',
    'TDS & Payroll'
  ];

  // Work Status Computations
  const completedWorks = tasks.filter((t) => t.status === 'Completed');
  const progressingWorks = tasks.filter((t) => t.status === 'In Progress');
  const pendingWorks = tasks.filter(
    (t) => t.status === 'Allocated' || t.status === 'Pending' || t.status === 'To Do'
  );
  const transferredWorks = tasks.filter((t) => t.status === 'Transferred');
  const reviewWorks = tasks.filter(
    (t) => t.status === 'Submitted for Approval' || t.status === 'Review'
  );

  const totalWorksCount = tasks.length || 1;
  const completionRate = Math.round((completedWorks.length / totalWorksCount) * 100);
  const progressingRate = Math.round((progressingWorks.length / totalWorksCount) * 100);
  const pendingRate = Math.round((pendingWorks.length / totalWorksCount) * 100);

  // Filtered Works for Tab 1
  const filteredWorks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.title?.toLowerCase().includes(q) ||
      t.clientName?.toLowerCase().includes(q) ||
      t.clientPan?.toLowerCase().includes(q) ||
      t.jobNumber?.toLowerCase().includes(q) ||
      t.assignedToName?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Completed'
        ? t.status === 'Completed'
        : statusFilter === 'Progressing'
        ? t.status === 'In Progress'
        : statusFilter === 'Pending'
        ? t.status === 'Allocated' || t.status === 'Pending' || t.status === 'To Do'
        : statusFilter === 'Transferred'
        ? t.status === 'Transferred'
        : statusFilter === 'Review'
        ? t.status === 'Submitted for Approval' || t.status === 'Review'
        : true;

    const matchesDept =
      departmentFilter === 'All' ? true : t.department === departmentFilter;

    const matchesStaff =
      staffFilter === 'All'
        ? true
        : t.assignedTo === staffFilter || t.assignedToName === staffFilter;

    const matchesService =
      serviceLineFilter === 'All' ? true : t.serviceLine === serviceLineFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesStaff && matchesService;
  });

  // Selected Staff Details & Chronological History for Tab 3
  const activeStaffMember = users.find((u) => u.id === selectedStaffId) || users[0] || {};
  const staffTasksChronological = tasks
    .filter((t) => t.assignedTo === activeStaffMember.id || t.assignedToName === activeStaffMember.name)
    .sort((a, b) => new Date(b.allocatedDate || 0) - new Date(a.allocatedDate || 0));

  const staffCompleted = staffTasksChronological.filter((t) => t.status === 'Completed');
  const staffInProgress = staffTasksChronological.filter((t) => t.status === 'In Progress');
  const staffPending = staffTasksChronological.filter(
    (t) => t.status === 'Allocated' || t.status === 'Pending' || t.status === 'To Do'
  );
  const staffRate =
    staffTasksChronological.length > 0
      ? Math.round((staffCompleted.length / staffTasksChronological.length) * 100)
      : 0;

  // Department × Category Matrix Computations for Tab 4
  const matrixData = departments.map((dept) => {
    const row = { department: dept, cells: {}, totalCount: 0, completedCount: 0, totalFee: 0 };
    serviceLines.forEach((sLine) => {
      const matching = tasks.filter((t) => {
        const matchesDept = t.department === dept;
        const matchesSLine =
          t.serviceLine === sLine ||
          (t.category && sLine.toLowerCase().includes(t.category.toLowerCase()));
        return matchesDept && matchesSLine;
      });

      const count = matching.length;
      const comp = matching.filter((t) => t.status === 'Completed').length;
      const fee = matching.reduce((sum, t) => {
        const num = parseFloat(String(t.feeQuote || '0').replace(/[^0-9.-]+/g, '')) || 0;
        return sum + num;
      }, 0);

      row.cells[sLine] = { count, completed: comp, fee };
      row.totalCount += count;
      row.completedCount += comp;
      row.totalFee += fee;
    });
    return row;
  });

  // Evidence file handler
  const handleUploadEvidenceFiles = (e) => {
    if (!managingEvidenceWork || !e.target.files) return;
    const files = Array.from(e.target.files);
    const newFileObjects = [];
    let processedCount = 0;

    files.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 8MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const fileObj = {
          id: `EVID-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: currentUser ? currentUser.name : 'Auditor'
        };
        newFileObjects.push(fileObj);
        processedCount++;
        if (processedCount === files.length && setTasks) {
          const updatedTasks = tasks.map((t) => {
            if (t.id === managingEvidenceWork.id) {
              const current = t.evidenceFiles || [];
              return { ...t, evidenceFiles: [...current, ...newFileObjects] };
            }
            return t;
          });
          setTasks(updatedTasks);
          const target = updatedTasks.find((t) => t.id === managingEvidenceWork.id);
          if (target) setManagingEvidenceWork(target);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveCloudLink = () => {
    if (!managingEvidenceWork || !setTasks) return;
    const updatedTasks = tasks.map((t) => {
      if (t.id === managingEvidenceWork.id) {
        return { ...t, cloudDriveLink: newCloudLink.trim() };
      }
      return t;
    });
    setTasks(updatedTasks);
    const target = updatedTasks.find((t) => t.id === managingEvidenceWork.id);
    if (target) setManagingEvidenceWork(target);
    setNewCloudLink('');
    alert('Cloud link saved successfully!');
  };

  const handleRemoveEvidence = (fileId) => {
    if (!managingEvidenceWork || !setTasks) return;
    const updatedTasks = tasks.map((t) => {
      if (t.id === managingEvidenceWork.id) {
        const current = t.evidenceFiles || [];
        return { ...t, evidenceFiles: current.filter((f) => f.id !== fileId) };
      }
      return t;
    });
    setTasks(updatedTasks);
    const target = updatedTasks.find((t) => t.id === managingEvidenceWork.id);
    if (target) setManagingEvidenceWork(target);
  };

  const handleDownloadFile = (f) => {
    const a = document.createElement('a');
    a.href = f.dataUrl;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = [
      'Job Number',
      'Work ID',
      'Title',
      'Client Name',
      'Client ID',
      'PAN',
      'Service Line',
      'Department',
      'Assigned Staff',
      'Finishing Date',
      'Status',
      'Evidence Count',
      'Remarks'
    ];

    const rows = filteredWorks.map((t) => {
      const remark =
        t.status === 'Completed'
          ? t.approvalDetails?.approvalRemarks || 'Approved'
          : t.status === 'Submitted for Approval'
          ? t.submissionDetails?.completionRemarks || 'Submitted for Review'
          : t.status === 'Transferred'
          ? t.transferHistory?.[0]?.reason || 'Transferred'
          : t.initialRemarks || 'Allocated';

      const evidenceCount = (t.evidenceFiles?.length || 0) + (t.submissionDetails?.evidenceFiles?.length || 0);

      return [
        `"${t.jobNumber || '-'}"`,
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.clientName.replace(/"/g, '""')}"`,
        `"${t.clientId || '-'}"`,
        `"${t.clientPan || 'N/A'}"`,
        `"${t.serviceLine || 'Audit & Assurance'}"`,
        `"${t.department}"`,
        `"${t.assignedToName || t.assignedTo}"`,
        `"${t.finishingDate || t.dueDate}"`,
        `"${t.status}"`,
        `"${evidenceCount} files"`,
        `"${remark.replace(/"/g, '""')}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CA_Practice_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black uppercase">
              ICAI Practice Management
            </span>
            <span className="text-xs text-slate-400 font-semibold">{firmProfile?.firmName || 'M/s. Sharma & Associates'}</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Audit, Compliance & Work Intelligence Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Completed work history & prints, staff performance appraisals, and Department × Category matrix reports.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            title="Download CSV for Excel"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            title="Print Full Page"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Completed, Pending, Progressing, Transferred */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Total Allocated Works
          </span>
          <div className="text-2xl font-black text-white mt-1.5">{tasks.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Firm assignments</div>
        </div>

        <div
          onClick={() => {
            setActiveReportTab('completedHistory');
          }}
          className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition group"
        >
          <span className="text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Works
            </span>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-500/20">
              {completionRate}%
            </span>
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1.5">
            {completedWorks.length}
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5">Click for Print & History</div>
        </div>

        <div
          onClick={() => {
            setActiveReportTab('worksStatus');
            setStatusFilter('Progressing');
          }}
          className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition group"
        >
          <span className="text-[11px] font-semibold text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Progressing Works
            </span>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-500/20">
              {progressingRate}%
            </span>
          </span>
          <div className="text-2xl font-black text-blue-400 mt-1.5">
            {progressingWorks.length}
          </div>
          <div className="text-[10px] text-blue-400/80 mt-0.5">Active under execution</div>
        </div>

        <div
          onClick={() => {
            setActiveReportTab('worksStatus');
            setStatusFilter('Pending');
          }}
          className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition group"
        >
          <span className="text-[11px] font-semibold text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Works
            </span>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-500/20">
              {pendingRate}%
            </span>
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1.5">
            {pendingWorks.length}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Awaiting start</div>
        </div>

        <div
          onClick={() => {
            setActiveReportTab('worksStatus');
            setStatusFilter('Review');
          }}
          className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/60 cursor-pointer transition group"
        >
          <span className="text-[11px] font-semibold text-purple-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5 text-purple-400" /> Manager Review
            </span>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-purple-500/20">
              {reviewWorks.length}
            </span>
          </span>
          <div className="text-2xl font-black text-purple-300 mt-1.5">
            {reviewWorks.length}
          </div>
          <div className="text-[10px] text-purple-400/80 mt-0.5">
            {transferredWorks.length} Transferred
          </div>
        </div>
      </div>

      {/* 4 Interactive Report Module Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
        <button
          onClick={() => setActiveReportTab('worksStatus')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'worksStatus'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">1. Work Status Matrix</span>
        </button>

        <button
          onClick={() => setActiveReportTab('completedHistory')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'completedHistory'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FolderCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="truncate">2. Completed Work History & Print</span>
        </button>

        <button
          onClick={() => setActiveReportTab('staffPerformance')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'staffPerformance'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Award className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="truncate">3. Staff Performance & History</span>
        </button>

        <button
          onClick={() => setActiveReportTab('matrixReport')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'matrixReport'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Grid className="w-4 h-4 shrink-0 text-cyan-400" />
          <span className="truncate">4. Dept × Category Matrix</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORK STATUS AUDIT REPORT (Completed / Pending / Progressing)       */}
      {/* ========================================================================= */}
      {activeReportTab === 'worksStatus' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job #, title, client, PAN, staff..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                {['All', 'Completed', 'Progressing', 'Pending', 'Transferred', 'Review'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        statusFilter === st
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st === 'Review' ? 'Under Review' : st}
                    </button>
                  )
                )}
              </div>

              {/* Service Line Dropdown */}
              <select
                value={serviceLineFilter}
                onChange={(e) => setServiceLineFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-none text-xs"
              >
                <option value="All">All Service Lines</option>
                {serviceLines.map((sl) => (
                  <option key={sl} value={sl}>
                    {sl}
                  </option>
                ))}
              </select>

              {/* Department Dropdown */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-none text-xs"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Job Ref & Title</th>
                    <th className="p-3.5">Client & ID</th>
                    <th className="p-3.5">Service Line & Dept</th>
                    <th className="p-3.5">Assigned Staff</th>
                    <th className="p-3.5">Finishing Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Evidence Files</th>
                    <th className="p-3.5">Remarks / Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredWorks.map((t) => {
                    const isCompleted = t.status === 'Completed';
                    const isSubmitted = t.status === 'Submitted for Approval' || t.status === 'Review';
                    const isTransferred = t.status === 'Transferred';
                    const isInProgress = t.status === 'In Progress';

                    const remark =
                      isCompleted
                        ? t.approvalDetails?.approvalRemarks || 'Manager approved and verified.'
                        : isSubmitted
                        ? t.submissionDetails?.completionRemarks || 'Submitted for manager approval.'
                        : isTransferred
                        ? t.transferHistory?.[t.transferHistory.length - 1]?.reason || 'Transferred across departments by Manager.'
                        : t.workDetails || t.initialRemarks || 'Allocated per work mandate.';

                    const allEvidence = [
                      ...(t.evidenceFiles || []),
                      ...(t.submissionDetails?.evidenceFiles || [])
                    ];

                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {t.jobNumber && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {t.jobNumber}
                              </span>
                            )}
                            <span className="font-bold text-slate-100">{t.title}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            {t.id} &bull; {t.statutorySection || t.fy || 'FY 25-26'}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">{t.clientName}</div>
                          <div className="font-mono text-[10px] text-emerald-400">
                            {t.clientId ? `ID: ${t.clientId}` : t.clientPan || 'N/A'}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-[11px] font-bold text-cyan-300">
                            {t.serviceLine || 'Audit & Assurance'}
                          </div>
                          <span className="text-[10px] text-slate-400">{t.department}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200">{t.assignedToName || t.assignedTo}</div>
                          <div className="text-[10px] text-slate-500">Allocated by: {t.allocatedBy || 'Admin'}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-amber-300">{t.finishingDate || t.dueDate}</div>
                          <div className="text-[10px] text-slate-500">{t.priority} Priority</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isSubmitted
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : isTransferred
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : isInProgress
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isSubmitted ? 'Under Review' : t.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => {
                              setManagingEvidenceWork(t);
                              setNewCloudLink(t.cloudDriveLink || t.submissionDetails?.cloudDriveLink || '');
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition ${
                              allEvidence.length > 0 || t.cloudDriveLink
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {allEvidence.length > 0
                                ? `${allEvidence.length} File${allEvidence.length > 1 ? 's' : ''}`
                                : '+ Upload Evidence'}
                            </span>
                          </button>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic" title={remark}>
                            "{remark}"
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredWorks.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                        No work records found matching the selected report filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3.5 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredWorks.length} of {tasks.length} firm assignments</span>
              <span className="font-mono text-emerald-400 font-bold">
                {completedWorks.length} Completed ({completionRate}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPLETED WORK HISTORY & PRINT                                    */}
      {/* ========================================================================= */}
      {activeReportTab === 'completedHistory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Completed Work Audit History Register</span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Archived logs of all works approved and signed off by Firm Partners/Managers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintCompletedRegister(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Completed Works Register</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Job Number & Title</th>
                    <th className="p-3.5">Client & ID</th>
                    <th className="p-3.5">Service Line</th>
                    <th className="p-3.5">Staff & Manager</th>
                    <th className="p-3.5">Allocated & Target Date</th>
                    <th className="p-3.5">Approved On</th>
                    <th className="p-3.5">Approval Remarks</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {completedWorks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-10 text-center text-slate-500 text-xs">
                        No works marked as completed yet.
                      </td>
                    </tr>
                  ) : (
                    completedWorks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <div className="font-mono font-black text-emerald-400">
                            {t.jobNumber || t.id}
                          </div>
                          <div className="font-bold text-slate-100 text-xs mt-0.5">
                            {t.title}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">{t.clientName}</div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {t.clientId ? `ID: ${t.clientId}` : t.clientPan || 'N/A'}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                            {t.serviceLine || 'Audit & Assurance'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-200 font-medium">{t.assignedToName || t.assignedTo}</div>
                          <div className="text-[10px] text-slate-500">
                            Approved by: {t.approvalDetails?.approvedBy || t.allocatedBy || 'Manager'}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <div className="text-slate-400">Alloc: {t.allocatedDate || '2026-08-01'}</div>
                          <div className="text-amber-300">Target: {t.finishingDate || t.dueDate}</div>
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          {t.approvalDetails?.approvedAt?.split('T')[0] || t.finishingDate || '2026-08-10'}
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <p className="text-[11px] text-slate-300 italic line-clamp-2">
                            "{t.approvalDetails?.approvalRemarks || 'Verified and marked completed successfully.'}"
                          </p>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setPrintableJobModal(t)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-slate-700 transition ml-auto"
                            title="Print Work Completion Certificate"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Completion Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STAFF WORK PERFORMANCE WINDOW & CHRONOLOGICAL HISTORY              */}
      {/* ========================================================================= */}
      {activeReportTab === 'staffPerformance' && (
        <div className="space-y-4">
          {/* Staff Selector Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Staff Member / Article Assistant
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="mt-0.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.designation || u.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowPrintStaffAppraisal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition self-end sm:self-center"
            >
              <Printer className="w-4 h-4" />
              <span>Print Staff Appraisal & Work History</span>
            </button>
          </div>

          {/* Active Staff Profile Card & KPI Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Staff Member</span>
              <div className="text-base font-black text-white mt-1">{activeStaffMember.name}</div>
              <div className="text-xs text-amber-400 font-semibold">{activeStaffMember.designation}</div>
              <div className="text-[11px] text-slate-400 mt-2">
                ID: <span className="font-mono text-slate-200">{activeStaffMember.id}</span> &bull; {activeStaffMember.role}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Work Volume</span>
              <div className="text-2xl font-black text-white mt-1">{staffTasksChronological.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Lifetime allocated assignments</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase text-emerald-400">Completed On-Time</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{staffCompleted.length}</div>
              <div className="text-[11px] text-emerald-300/80 mt-1">{staffRate}% On-Time Completion Rate</div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
              <span className="text-[10px] font-bold uppercase text-blue-400">In Progress / Pending</span>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {staffInProgress.length + staffPending.length}
              </div>
              <div className="text-[11px] text-blue-300/80 mt-1">
                {staffInProgress.length} active, {staffPending.length} pending
              </div>
            </div>
          </div>

          {/* Chronological Work History Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Chronological Work History — {activeStaffMember.name}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {staffTasksChronological.length} Assignments
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Job #</th>
                    <th className="p-3">Work Title</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Service Line</th>
                    <th className="p-3">Allocated Date</th>
                    <th className="p-3">Target Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Manager Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staffTasksChronological.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                        No work history recorded for this staff member.
                      </td>
                    </tr>
                  ) : (
                    staffTasksChronological.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {t.jobNumber || t.id}
                        </td>
                        <td className="p-3 font-semibold text-slate-100">{t.title}</td>
                        <td className="p-3 text-slate-300">{t.clientName}</td>
                        <td className="p-3 text-cyan-300 font-medium">{t.serviceLine || t.department}</td>
                        <td className="p-3 font-mono text-slate-400">{t.allocatedDate || '-'}</td>
                        <td className="p-3 font-mono text-amber-300">{t.finishingDate || t.dueDate}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : t.status === 'In Progress'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs text-slate-400 italic line-clamp-1">
                          {t.approvalDetails?.approvalRemarks || t.workDetails || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CATEGORY-WISE & DEPARTMENT-WISE MATRIX REPORT                      */}
      {/* ========================================================================= */}
      {activeReportTab === 'matrixReport' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
                <Grid className="w-5 h-5" />
                <span>Department × Category Cross-Analysis Matrix</span>
              </div>
              <p className="text-xs text-cyan-300/80 mt-0.5">
                Workload allocation & fee distribution matrix across Firm Practice Departments and Service Lines.
              </p>
            </div>
            <button
              onClick={() => setShowPrintMatrix(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Matrix Report</span>
            </button>
          </div>

          {/* Cross Analysis Matrix Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <th className="p-3.5 border-r border-slate-800 min-w-[180px]">
                      Firm Department
                    </th>
                    {serviceLines.map((sl) => (
                      <th key={sl} className="p-3 text-center border-r border-slate-800/60 min-w-[130px]">
                        {sl}
                      </th>
                    ))}
                    <th className="p-3.5 text-center font-black text-emerald-400">
                      Total Dept Load
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {matrixData.map((row) => (
                    <tr key={row.department} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-200 border-r border-slate-800 bg-slate-950/40">
                        {row.department}
                      </td>
                      {serviceLines.map((sl) => {
                        const cell = row.cells[sl];
                        const hasJobs = cell.count > 0;
                        return (
                          <td
                            key={sl}
                            className={`p-3 text-center border-r border-slate-800/60 ${
                              hasJobs ? 'bg-slate-800/30' : ''
                            }`}
                          >
                            {hasJobs ? (
                              <div>
                                <div className="font-black text-white text-xs">
                                  {cell.completed}/{cell.count}{' '}
                                  <span className="text-[10px] font-normal text-emerald-400">Done</span>
                                </div>
                                {cell.fee > 0 && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    ₹{cell.fee.toLocaleString('en-IN')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3.5 text-center font-black text-emerald-400 bg-slate-950/40">
                        {row.completedCount} / {row.totalCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT MODAL 1: INDIVIDUAL WORK COMPLETION CERTIFICATE / SLIP             */}
      {/* ========================================================================= */}
      {printableJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-8 space-y-6 print:p-0 print:m-0 print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Print Preview: Work Completion Certificate
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setPrintableJobModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="space-y-6 font-sans">
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <h2 className="text-xl font-black text-slate-950 tracking-wide uppercase">
                  {firmProfile?.firmName || 'M/s. Sharma & Associates'}
                </h2>
                <p className="text-xs font-bold text-slate-600 tracking-wider">
                  CHARTERED ACCOUNTANTS &bull; FRN: {firmProfile?.frn || '129988W'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {firmProfile?.address || 'Suite 401, Nariman Point, Mumbai - 400021'} &bull; Tel: {firmProfile?.phone || '+91 98765 43210'}
                </p>
              </div>

              <div className="text-center">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-300">
                  WORK COMPLETION & VERIFICATION CERTIFICATE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Job / Docket Ref #</div>
                  <div className="font-mono font-black text-slate-900 text-sm">
                    {printableJobModal.jobNumber || printableJobModal.id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Completion Date</div>
                  <div className="font-bold text-slate-900">
                    {printableJobModal.approvalDetails?.approvedAt?.split('T')[0] || printableJobModal.finishingDate}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Client Name:</span>
                  <div className="font-black text-slate-900 text-sm">{printableJobModal.clientName}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-500 font-bold text-[10px]">Client ID:</span>
                    <div className="font-semibold text-slate-900">{printableJobModal.clientId || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold text-[10px]">Client PAN:</span>
                    <div className="font-mono font-semibold text-slate-900">{printableJobModal.clientPan || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold text-[10px]">Service Line:</span>
                    <div className="font-semibold text-slate-900">{printableJobModal.serviceLine || 'Audit'}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="text-slate-500 uppercase font-bold text-[10px]">Assignment Details</div>
                <div className="font-bold text-slate-900">{printableJobModal.title}</div>
                <p className="text-slate-600 text-[11px]">{printableJobModal.workDetails}</p>
                <div className="pt-2 border-t border-slate-100 text-slate-800">
                  <strong>Partner / Manager Approval Remarks: </strong>
                  <span>{printableJobModal.approvalDetails?.approvalRemarks || 'Certified and signed off.'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="text-center space-y-8">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{printableJobModal.assignedToName || 'Auditor'}</div>
                    <div className="text-[10px] text-slate-500">Prepared By (Staff / Article)</div>
                  </div>
                </div>
                <div className="text-center space-y-8">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{firmProfile?.partnerName || 'Managing Partner'}</div>
                    <div className="text-[10px] text-slate-500">For {firmProfile?.firmName || 'M/s. Sharma & Associates'} (Chartered Accountants)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT MODAL 2: PRINT COMPLETED WORK HISTORY REGISTER                      */}
      {/* ========================================================================= */}
      {showPrintCompletedRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-8 space-y-6 print:p-0 print:m-0 print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Print Preview: Completed Works Register
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintCompletedRegister(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 font-sans">
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <h2 className="text-xl font-black text-slate-950 uppercase">
                  {firmProfile?.firmName || 'M/s. Sharma & Associates'}
                </h2>
                <p className="text-xs font-bold text-slate-600">
                  CHARTERED ACCOUNTANTS &bull; REGISTER OF COMPLETED WORK ASSIGNMENTS
                </p>
                <p className="text-[10px] text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Job #</th>
                    <th className="p-2">Client Name</th>
                    <th className="p-2">Service Line</th>
                    <th className="p-2">Assigned Staff</th>
                    <th className="p-2">Completion Date</th>
                    <th className="p-2">Approval Sign-off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedWorks.map((t) => (
                    <tr key={t.id}>
                      <td className="p-2 font-mono font-bold">{t.jobNumber || t.id}</td>
                      <td className="p-2 font-semibold">{t.clientName}</td>
                      <td className="p-2">{t.serviceLine || 'Audit'}</td>
                      <td className="p-2">{t.assignedToName || t.assignedTo}</td>
                      <td className="p-2 font-mono">{t.approvalDetails?.approvedAt?.split('T')[0] || t.finishingDate}</td>
                      <td className="p-2 text-[10px] text-slate-600">{t.approvalDetails?.approvalRemarks || 'Approved'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between pt-8 text-xs border-t border-slate-200">
                <div>Total Completed Jobs: <strong>{completedWorks.length}</strong></div>
                <div className="text-right">Authorized Signatory: <strong>{firmProfile?.partnerName || 'Managing Partner'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT MODAL 3: PRINT STAFF APPRAISAL & WORK HISTORY                      */}
      {/* ========================================================================= */}
      {showPrintStaffAppraisal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-8 space-y-6 print:p-0 print:m-0 print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Print Preview: Staff Appraisal & Performance History
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Appraisal</span>
                </button>
                <button
                  onClick={() => setShowPrintStaffAppraisal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 font-sans">
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <h2 className="text-xl font-black text-slate-950 uppercase">
                  {firmProfile?.firmName || 'M/s. Sharma & Associates'}
                </h2>
                <p className="text-xs font-bold text-slate-600">
                  STAFF WORK APPRAISAL & HISTORICAL PERFORMANCE RECORD
                </p>
                <p className="text-[10px] text-slate-500">Evaluation as on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Staff Member</div>
                  <div className="font-bold text-slate-900 text-sm">{activeStaffMember.name}</div>
                  <div className="text-slate-600">{activeStaffMember.designation} &bull; ID: {activeStaffMember.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Efficiency Score</div>
                  <div className="font-black text-emerald-700 text-xl">{staffRate}%</div>
                  <div className="text-slate-600">{staffCompleted.length} Completed / {staffTasksChronological.length} Total</div>
                </div>
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Chronological Assignment Log
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Job #</th>
                    <th className="p-2">Client</th>
                    <th className="p-2">Assignment</th>
                    <th className="p-2">Target Date</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffTasksChronological.map((t) => (
                    <tr key={t.id}>
                      <td className="p-2 font-mono font-bold">{t.jobNumber || t.id}</td>
                      <td className="p-2 font-medium">{t.clientName}</td>
                      <td className="p-2">{t.title}</td>
                      <td className="p-2 font-mono">{t.finishingDate}</td>
                      <td className="p-2 font-bold">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 pt-10">
                <div className="text-center">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div className="text-[10px] text-slate-500 mt-1">Staff / Article Signature</div>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div className="text-[10px] text-slate-500 mt-1">Partner / Reviewer Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT MODAL 4: PRINT DEPARTMENT × CATEGORY MATRIX REPORT                 */}
      {/* ========================================================================= */}
      {showPrintMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-8 space-y-6 print:p-0 print:m-0 print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Print Preview: Department × Category Matrix Report
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Matrix</span>
                </button>
                <button
                  onClick={() => setShowPrintMatrix(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 font-sans">
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <h2 className="text-xl font-black text-slate-950 uppercase">
                  {firmProfile?.firmName || 'M/s. Sharma & Associates'}
                </h2>
                <p className="text-xs font-bold text-slate-600">
                  DEPARTMENT &times; SERVICE LINE CROSS-TABULATION MATRIX
                </p>
                <p className="text-[10px] text-slate-500">As on {new Date().toLocaleDateString()}</p>
              </div>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[10px] uppercase">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Department</th>
                    {serviceLines.map((sl) => (
                      <th key={sl} className="p-2 border-r border-slate-300 text-center">{sl}</th>
                    ))}
                    <th className="p-2 text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {matrixData.map((row) => (
                    <tr key={row.department}>
                      <td className="p-2 font-bold border-r border-slate-300">{row.department}</td>
                      {serviceLines.map((sl) => (
                        <td key={sl} className="p-2 border-r border-slate-300 text-center">
                          {row.cells[sl].count > 0 ? `${row.cells[sl].completed}/${row.cells[sl].count}` : '-'}
                        </td>
                      ))}
                      <td className="p-2 font-bold text-center">{row.completedCount}/{row.totalCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 text-right text-xs">
                <div>For {firmProfile?.firmName || 'M/s. Sharma & Associates'}</div>
                <div className="font-bold mt-8">{firmProfile?.partnerName || 'Managing Partner'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVIDENCE UPLOAD & DOWNLOAD MODAL                                         */}
      {/* ========================================================================= */}
      {managingEvidenceWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Audit Evidence & Working Paper Attachments
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload proofs, download attached files, and link Google Drive folders.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManagingEvidenceWork(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <div className="font-bold text-slate-200">
                {managingEvidenceWork.jobNumber && (
                  <span className="font-mono text-emerald-400 mr-1.5">[{managingEvidenceWork.jobNumber}]</span>
                )}
                {managingEvidenceWork.title}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Client: <strong className="text-slate-300">{managingEvidenceWork.clientName}</strong></span>
                <span>PAN: <strong className="font-mono text-emerald-400">{managingEvidenceWork.clientPan}</strong></span>
              </div>
            </div>

            {/* Existing Uploaded Evidence Files */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-200 block">
                Attached Evidence Files (
                {(managingEvidenceWork.evidenceFiles?.length || 0) +
                  (managingEvidenceWork.submissionDetails?.evidenceFiles?.length || 0)}
                ):
              </label>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {[
                  ...(managingEvidenceWork.evidenceFiles || []),
                  ...(managingEvidenceWork.submissionDetails?.evidenceFiles || [])
                ].map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="font-medium text-slate-200 truncate max-w-[220px]" title={f.name}>
                          {f.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {f.size} &bull; Uploaded {f.uploadedAt || 'Recently'} by {f.uploadedBy || 'Staff'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownloadFile(f)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleRemoveEvidence(f.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {(managingEvidenceWork.evidenceFiles?.length || 0) +
                  (managingEvidenceWork.submissionDetails?.evidenceFiles?.length || 0) === 0 && (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-center text-slate-500 text-xs">
                    No evidence files uploaded yet. Upload below.
                  </div>
                )}
              </div>
            </div>

            {/* Upload New Files */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Upload New Evidence Files directly to this Report</span>
              </label>

              <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition text-center">
                <UploadCloud className="w-7 h-7 text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-slate-200">
                  Click here to browse PDF, Excel, Word, or Scanned Images
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Files are saved directly to this CA assignment record
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.csv,.zip"
                  onChange={handleUploadEvidenceFiles}
                  className="hidden"
                />
              </label>
            </div>

            {/* Cloud Drive Link */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Drive / Cloud Folder Link</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={newCloudLink}
                  onChange={(e) => setNewCloudLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleSaveCloudLink}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shrink-0"
                >
                  Save Link
                </button>
              </div>

              {managingEvidenceWork.cloudDriveLink && (
                <div className="pt-1">
                  <a
                    href={managingEvidenceWork.cloudDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Open Linked Working Papers Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setManagingEvidenceWork(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
