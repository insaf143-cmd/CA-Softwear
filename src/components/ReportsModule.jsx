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
  Link as LinkIcon
} from 'lucide-react';

export default function ReportsModule({
  users,
  tasks,
  setTasks,
  gstWork,
  itWork,
  rocWork,
  clients,
  currentUser,
  firmProfile
}) {
  const [activeReportTab, setActiveReportTab] = useState('worksStatus'); // 'worksStatus' | 'userWise'
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Evidence Modal State
  const [managingEvidenceWork, setManagingEvidenceWork] = useState(null);
  const [newCloudLink, setNewCloudLink] = useState('');

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

  // Filtered Works for the Report Table
  const filteredWorks = tasks.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientPan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase());

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

    return matchesSearch && matchesStatus && matchesDept && matchesStaff;
  });

  // User-Wise Performance List
  const userPerformanceList = users.map((u) => {
    const assigned = tasks.filter(
      (t) => t.assignedTo === u.id || t.assignedToName === u.name
    );
    const completed = assigned.filter((t) => t.status === 'Completed');
    const progressing = assigned.filter((t) => t.status === 'In Progress');
    const pending = assigned.filter(
      (t) => t.status === 'Allocated' || t.status === 'Pending' || t.status === 'To Do'
    );
    const transferred = assigned.filter((t) => t.status === 'Transferred');

    const total = assigned.length;
    const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    const allocatedClients = clients.filter(
      (c) =>
        c.assignedStaff === u.id ||
        (u.allocatedClientIds && u.allocatedClientIds.includes(c.id))
    );

    return {
      user: u,
      total,
      completed: completed.length,
      progressing: progressing.length,
      pending: pending.length,
      transferred: transferred.length,
      rate,
      clientsCount: allocatedClients.length
    };
  });

  // Handle uploading evidence to a report item
  const handleUploadEvidenceFiles = (e) => {
    if (!managingEvidenceWork || !e.target.files) return;
    const files = Array.from(e.target.files);

    const newFileObjects = [];
    let processedCount = 0;

    files.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 8MB. Please use a smaller file or Google Drive link.`);
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
              const combined = [...current, ...newFileObjects];
              return { ...t, evidenceFiles: combined };
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
      'Work ID',
      'Title',
      'Client Name',
      'PAN',
      'Department',
      'Assigned Staff',
      'Finishing Date',
      'Status',
      'Evidence Files Count',
      'Remarks'
    ];

    const rows = filteredWorks.map((t) => {
      const remark =
        t.status === 'Completed'
          ? t.approvalDetails?.approvalRemarks || 'Approved'
          : t.status === 'Submitted for Approval'
          ? t.submissionDetails?.completionRemarks || 'Submitted for Review'
          : t.status === 'Transferred'
          ? t.transferHistory?.[0]?.reason || 'Transferred to Department'
          : t.initialRemarks || 'Allocated';

      const evidenceCount = (t.evidenceFiles?.length || 0) + (t.submissionDetails?.evidenceFiles?.length || 0);

      return [
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.clientName.replace(/"/g, '""')}"`,
        `"${t.clientPan || 'N/A'}"`,
        `"${t.department}"`,
        `"${t.assignedToName || t.assignedTo}"`,
        `"${t.finishingDate || t.dueDate}"`,
        `"${t.status}"`,
        `"${evidenceCount} files"`,
        `"${remark.replace(/"/g, '""')}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CA_Firm_Work_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Management Intelligence
            </span>
            <span className="text-xs text-slate-400">{firmProfile?.firmName || 'Sharma & Associates CA'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            CA Work & Statutory Compliance Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit completed works, pending works, progressing works, upload evidence proofs, and monitor staff turnaround.
          </p>
        </div>

        {/* Export / Print Buttons */}
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Completed, Pending, Progressing, Transferred */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Card 1: Total Works */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Total Allocated Works
          </span>
          <div className="text-2xl font-black text-white mt-1.5">{tasks.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Firm-wide assignments</div>
        </div>

        {/* Card 2: Completed Works */}
        <div
          onClick={() => {
            setActiveReportTab('worksStatus');
            setStatusFilter('Completed');
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
          <div className="text-[10px] text-emerald-500 mt-0.5">Approved by Manager</div>
        </div>

        {/* Card 3: Progressing Works */}
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

        {/* Card 4: Pending Works */}
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
          <div className="text-[10px] text-amber-400/80 mt-0.5">Allocated, awaiting start</div>
        </div>

        {/* Card 5: Review / Transferred */}
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
            {transferredWorks.length} Transferred Dept
          </div>
        </div>
      </div>

      {/* Main Report Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveReportTab('worksStatus')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'worksStatus'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Work Status Audit Report (Completed / Pending / Progressing)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('userWise')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeReportTab === 'userWise'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Staff & Article Assistant Performance Report</span>
        </button>
      </div>

      {/* REPORT TAB 1: WORK STATUS AUDIT REPORT */}
      {activeReportTab === 'worksStatus' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search report by work title, client, PAN, staff..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Pills */}
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

              {/* Department Dropdown */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="GST Compliance">GST Compliance</option>
                <option value="Income Tax">Income Tax</option>
                <option value="Statutory & Tax Audit">Statutory & Tax Audit</option>
                <option value="ROC & Corporate Laws">ROC & Corporate Laws</option>
                <option value="TDS & Payroll">TDS & Payroll</option>
                <option value="Accounting & Bookkeeping">Accounting</option>
              </select>

              {/* Staff Member Dropdown */}
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-none"
              >
                <option value="All">All Staff Members</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
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
                    <th className="p-3.5">Work Title & ID</th>
                    <th className="p-3.5">Client & PAN</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Assigned Staff</th>
                    <th className="p-3.5">Target Finishing Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Evidence & Attachments</th>
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
                          <div className="font-bold text-slate-100">{t.title}</div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            {t.id} • {t.statutorySection || t.fy || 'FY 25-26'}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">{t.clientName}</div>
                          <div className="font-mono text-[10px] text-emerald-400">{t.clientPan || 'N/A'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                            {t.department}
                          </span>
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
                        {/* Evidence Upload & Download Action */}
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
                            title="Upload or Download Evidence Files"
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

            {/* Table Footer Summary */}
            <div className="p-3.5 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredWorks.length} of {tasks.length} firm assignments</span>
              <span className="font-mono text-emerald-400 font-bold">
                {completedWorks.length} Completed ({completionRate}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TAB 2: USER-WISE WORK ALLOCATION & PERFORMANCE */}
      {activeReportTab === 'userWise' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Staff Member & Designation</th>
                    <th className="p-3.5">Allocated Clients</th>
                    <th className="p-3.5">Total Works</th>
                    <th className="p-3.5">Completed Works</th>
                    <th className="p-3.5">Progressing Works</th>
                    <th className="p-3.5">Pending Works</th>
                    <th className="p-3.5">Transferred Dept</th>
                    <th className="p-3.5">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {userPerformanceList.map((item) => (
                    <tr key={item.user.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{item.user.name}</div>
                        <div className="text-[11px] text-slate-400">{item.user.designation}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-xs font-semibold text-slate-200">
                          {item.clientsCount} Files
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-200">
                        {item.total}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {item.completed}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-blue-400">
                        {item.progressing}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-400">
                        {item.pending}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-orange-400">
                        {item.transferred}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${item.rate}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-emerald-300 w-10">
                            {item.rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EVIDENCE UPLOAD & DOWNLOAD MODAL */}
      {managingEvidenceWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
            {/* Header */}
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
                    Upload proofs, download attached files, and link Google Drive working folders.
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

            {/* Target Work Assignment Header */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <div className="font-bold text-slate-200">{managingEvidenceWork.title}</div>
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
                          {f.size} • Uploaded {f.uploadedAt || 'Recently'} by {f.uploadedBy || 'Staff'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownloadFile(f)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleRemoveEvidence(f.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition"
                        title="Delete file"
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

            {/* Cloud Drive Link Section */}
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

            {/* Footer */}
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
