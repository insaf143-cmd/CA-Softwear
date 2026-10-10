import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  RotateCcw,
  Send,
  ArrowRightLeft,
  Search,
  Filter,
  Eye,
  Building,
  CheckCheck,
  AlertTriangle,
  History,
  Kanban,
  Table as TableIcon
} from 'lucide-react';

import WorkAllocationModal from './WorkAllocationModal';
import WorkSubmitModal from './WorkSubmitModal';
import WorkApprovalModal from './WorkApprovalModal';
import WorkDetailsModal from './WorkDetailsModal';

export default function TaskManager({
  tasks,
  setTasks,
  clients,
  staff,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Modal States
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [submittingWork, setSubmittingWork] = useState(null);
  const [reviewingWork, setReviewingWork] = useState(null);
  const [inspectingWork, setInspectingWork] = useState(null);

  const isNormalUser = currentUser.role === 'NORMAL_USER';
  const isManagerOrAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER';

  // 1. Filter tasks: Regular users ONLY see their allocated work
  const userVisibleTasks = isNormalUser
    ? tasks.filter(
        (t) =>
          t.assignedTo === currentUser.id ||
          t.assignedToName === currentUser.name ||
          (t.assignedStaff && t.assignedStaff === currentUser.id)
      )
    : tasks;

  // 2. Search & Filter
  const filteredTasks = userVisibleTasks.filter((t) => {
    const matchesSearch =
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientPan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Pending'
        ? t.status === 'Allocated' || t.status === 'Pending' || t.status === 'To Do'
        : statusFilter === 'In Progress'
        ? t.status === 'In Progress'
        : statusFilter === 'Submitted'
        ? t.status === 'Submitted for Approval' || t.status === 'Review'
        : statusFilter === 'Transferred'
        ? t.status === 'Transferred'
        : statusFilter === 'Completed'
        ? t.status === 'Completed'
        : true;

    const matchesDept =
      departmentFilter === 'All' ? true : t.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Works awaiting manager approval count
  const pendingApprovalWorks = tasks.filter(
    (t) => t.status === 'Submitted for Approval' || t.status === 'Review'
  );

  // --- ACTIONS ---

  // Admin Allocates New Work
  const handleAllocateWork = (newWork) => {
    setTasks([newWork, ...tasks]);
  };

  // User starts working on allocated task
  const handleStartWork = (workId) => {
    setTasks(
      tasks.map((t) =>
        t.id === workId ? { ...t, status: 'In Progress' } : t
      )
    );
  };

  // User submits finished work for manager approval
  const handleSubmitWork = (workId, submissionData) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === workId) {
          return {
            ...t,
            status: 'Submitted for Approval',
            submissionDetails: submissionData
          };
        }
        return t;
      })
    );
  };

  // Manager approves work -> marked Completed
  const handleApproveWork = (workId, approvalData) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === workId) {
          return {
            ...t,
            status: 'Completed',
            approvalDetails: approvalData
          };
        }
        return t;
      })
    );
  };

  // Manager rejects / does not approve -> transfers to next department
  const handleTransferWork = (workId, transferData) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === workId) {
          const currentHistory = t.transferHistory || [];
          return {
            ...t,
            department: transferData.nextDepartment,
            assignedTo: transferData.nextAssigneeId,
            assignedToName: transferData.nextAssigneeName,
            finishingDate: transferData.newFinishingDate,
            dueDate: transferData.newFinishingDate,
            status: 'Transferred',
            transferHistory: [...currentHistory, transferData.transferRecord]
          };
        }
        return t;
      })
    );
  };

  // Reopen or reverse task if necessary
  const handleReopenTask = (workId) => {
    setTasks(
      tasks.map((t) =>
        t.id === workId ? { ...t, status: 'In Progress' } : t
      )
    );
  };

  const columns = [
    { key: 'Allocated', title: 'Pending / Allocated', color: 'bg-amber-400' },
    { key: 'In Progress', title: 'Progressing (In Progress)', color: 'bg-blue-400' },
    { key: 'Submitted for Approval', title: 'Submitted to Manager', color: 'bg-purple-400' },
    { key: 'Transferred', title: 'Transferred Department', color: 'bg-orange-400' },
    { key: 'Completed', title: 'Approved & Completed', color: 'bg-emerald-400' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              {isNormalUser ? 'Staff Portal' : 'Admin & Manager Suite'}
            </span>
            <span className="text-xs text-slate-400">
              {isNormalUser ? 'Restricted to Allocated Files' : 'Full Practice Oversight'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            {isNormalUser ? 'My Allocated Works & Task Submission' : 'Work Allocation & Department Workflow Control'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isNormalUser
              ? 'You have access only to your assigned assignments. Mark in-progress, and submit for Manager sign-off when finished.'
              : 'Admin allocates work to staff; Manager reviews submitted work, approves as Completed, or transfers to the next department.'}
          </p>
        </div>

        {/* Allocate Button for Admin / Manager */}
        {isManagerOrAdmin && (
          <button
            onClick={() => setShowAllocateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate New Work</span>
          </button>
        )}
      </div>

      {/* Prominent Manager Review Queue Alert Banner (Visible to Manager & Admin) */}
      {isManagerOrAdmin && pendingApprovalWorks.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Manager Approval Queue:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white">
                  {pendingApprovalWorks.length} Work{pendingApprovalWorks.length > 1 ? 's' : ''} Awaiting Review
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Staff have submitted completed assignments with remarks. Review and Approve as Completed OR Transfer to next department.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Submitted')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition shrink-0"
          >
            Inspect Review Queue &rarr;
          </button>
        </div>
      )}

      {/* Filter and View Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search work, client, PAN, department..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            {['All', 'Pending', 'In Progress', 'Submitted', 'Transferred', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Department Filter Dropdown */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="GST Compliance">GST Compliance</option>
            <option value="Income Tax">Income Tax</option>
            <option value="Statutory & Tax Audit">Statutory & Tax Audit</option>
            <option value="ROC & Corporate Laws">ROC & Corporate Laws</option>
            <option value="TDS & Payroll">TDS & Payroll</option>
            <option value="Accounting & Bookkeeping">Accounting</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'kanban' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Detailed Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Work Render: Kanban OR Table */}
      {viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map((col) => {
            const colWorks = filteredTasks.filter((t) => {
              if (col.key === 'Allocated') {
                return t.status === 'Allocated' || t.status === 'Pending' || t.status === 'To Do';
              }
              if (col.key === 'In Progress') {
                return t.status === 'In Progress';
              }
              if (col.key === 'Submitted for Approval') {
                return t.status === 'Submitted for Approval' || t.status === 'Review';
              }
              if (col.key === 'Transferred') {
                return t.status === 'Transferred';
              }
              if (col.key === 'Completed') {
                return t.status === 'Completed';
              }
              return false;
            });

            return (
              <div
                key={col.key}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span>{col.title}</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold font-mono">
                    {colWorks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colWorks.map((t) => {
                    const isMyWork = t.assignedTo === currentUser.id;
                    const isCompleted = t.status === 'Completed';
                    const isSubmitted = t.status === 'Submitted for Approval' || t.status === 'Review';
                    const isTransferred = t.status === 'Transferred';
                    const isInProgress = t.status === 'In Progress';

                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 transition space-y-2.5 shadow-md relative group"
                      >
                        {/* Title & Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-100 leading-snug">
                            {t.title}
                          </h4>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                              t.priority === 'Urgent'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : t.priority === 'High'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        {/* Department Badge */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-2 py-0.5 rounded font-bold bg-slate-700/60 text-cyan-300 font-mono">
                            {t.department}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {t.statutorySection || t.fy || 'FY 25-26'}
                          </span>
                        </div>

                        {/* Client Info & Finishing Date */}
                        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold truncate max-w-[110px]" title={t.clientName}>
                            {t.clientName}
                          </span>
                          <span className="text-amber-300 flex items-center gap-1 font-mono text-[10px] font-bold">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            {t.finishingDate || t.dueDate}
                          </span>
                        </div>

                        {/* Assignee */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <User className="w-3 h-3 text-emerald-400" />
                            <strong className="text-slate-200">{t.assignedToName || t.assignedTo}</strong>
                          </span>
                          {t.transferHistory && t.transferHistory.length > 0 && (
                            <span className="text-amber-400 font-bold flex items-center gap-0.5" title="Transferred across departments">
                              <History className="w-3 h-3" /> {t.transferHistory.length}x
                            </span>
                          )}
                        </div>

                        {/* Action Buttons based on User & Status */}
                        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-1 text-[11px]">
                          <button
                            onClick={() => setInspectingWork(t)}
                            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                            title="View Full History & Details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {/* Normal user actions */}
                            {isNormalUser && (
                              <>
                                {(t.status === 'Allocated' || t.status === 'Pending' || t.status === 'To Do' || t.status === 'Transferred') && (
                                  <button
                                    onClick={() => handleStartWork(t.id)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition"
                                  >
                                    Start Work
                                  </button>
                                )}

                                {t.status === 'In Progress' && (
                                  <button
                                    onClick={() => setSubmittingWork(t)}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 flex items-center gap-1 transition"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Submit</span>
                                  </button>
                                )}

                                {isSubmitted && (
                                  <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Under Review
                                  </span>
                                )}

                                {isCompleted && (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                  </span>
                                )}
                              </>
                            )}

                            {/* Manager & Admin Actions */}
                            {isManagerOrAdmin && (
                              <>
                                {isSubmitted && (
                                  <button
                                    onClick={() => setReviewingWork(t)}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm flex items-center gap-1 transition"
                                  >
                                    <CheckCheck className="w-3 h-3" />
                                    <span>Review / Approve</span>
                                  </button>
                                )}

                                {!isSubmitted && !isCompleted && (
                                  <button
                                    onClick={() => setReviewingWork(t)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                                    title="Manager Action"
                                  >
                                    Manage
                                  </button>
                                )}

                                {isCompleted && (
                                  <button
                                    onClick={() => handleReopenTask(t.id)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 flex items-center gap-1 transition"
                                    title="Reopen completed work"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reopen</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colWorks.length === 0 && (
                    <div className="text-center py-10 text-slate-600 text-xs">
                      No assignments in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED TABLE VIEW */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3.5">Work Assignment & ID</th>
                  <th className="p-3.5">Client & PAN</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Target Finishing Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{t.title}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {t.id} • {t.statutorySection || t.category}
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
                      <div className="text-[10px] text-slate-500">Priority: {t.priority}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : t.status === 'Submitted for Approval' || t.status === 'Review'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : t.status === 'Transferred'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : t.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectingWork(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
                        >
                          Details
                        </button>

                        {/* Action buttons */}
                        {isNormalUser && t.status === 'In Progress' && (
                          <button
                            onClick={() => setSubmittingWork(t)}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Submit
                          </button>
                        )}

                        {isManagerOrAdmin && (t.status === 'Submitted for Approval' || t.status === 'Review') && (
                          <button
                            onClick={() => setReviewingWork(t)}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" /> Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showAllocateModal && (
        <WorkAllocationModal
          onClose={() => setShowAllocateModal(false)}
          onAllocateWork={handleAllocateWork}
          clients={clients}
          staff={staff}
          currentUser={currentUser}
        />
      )}

      {submittingWork && (
        <WorkSubmitModal
          work={submittingWork}
          onClose={() => setSubmittingWork(null)}
          onSubmitWork={handleSubmitWork}
          currentUser={currentUser}
        />
      )}

      {reviewingWork && (
        <WorkApprovalModal
          work={reviewingWork}
          onClose={() => setReviewingWork(null)}
          onApproveWork={handleApproveWork}
          onTransferWork={handleTransferWork}
          staff={staff}
          currentUser={currentUser}
        />
      )}

      {inspectingWork && (
        <WorkDetailsModal
          work={inspectingWork}
          onClose={() => setInspectingWork(null)}
        />
      )}
    </div>
  );
}
