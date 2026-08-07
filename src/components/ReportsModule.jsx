import React, { useState } from 'react';
import { BarChart3, Clock, CheckCircle2, AlertTriangle, Users, FileText, FileCheck } from 'lucide-react';

export default function ReportsModule({ users, tasks, gstWork, itWork, rocWork, clients }) {
  const [selectedReportTab, setSelectedReportTab] = useState('userWise');

  // Compute User-Wise Metrics
  const userPerformanceList = users.map((u) => {
    const assignedTasks = tasks.filter(t => t.assignedTo === u.id || t.assignedToName === u.name);
    const completedTasks = assignedTasks.filter(t => t.status === 'Completed');
    const pendingTasks = assignedTasks.filter(t => t.status !== 'Completed');

    const totalCount = assignedTasks.length;
    const completedCount = completedTasks.length;
    const pendingCount = pendingTasks.length;

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const allocatedClients = clients.filter(c => c.assignedStaff === u.id || (u.allocatedClientIds && u.allocatedClientIds.includes(c.id)));

    return {
      user: u,
      allocatedClientsCount: allocatedClients.length,
      totalCount,
      completedCount,
      pendingCount,
      completionRate
    };
  });

  const pendingGst = gstWork.filter(g => g.status !== 'Filed');
  const pendingIt = itWork.filter(i => i.status !== 'Filed' && i.status !== 'Completed');
  const pendingRoc = rocWork.filter(r => r.status !== 'Completed');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            User Performance & Pending Work Analytics Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Executive reports for Admin & Super Admin to audit article assistant workload, task completion rates, and pending return deadlines.
          </p>
        </div>

        {/* Report Selector Pills */}
        <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
          <button
            onClick={() => setSelectedReportTab('userWise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedReportTab === 'userWise'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User-Wise Performance Report
          </button>

          <button
            onClick={() => setSelectedReportTab('pendingWork')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedReportTab === 'pendingWork'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Statutory Work Report
          </button>
        </div>
      </div>

      {selectedReportTab === 'userWise' ? (
        /* User-Wise Work Allocation & Completion Report */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Total Active Staff / Articles</span>
              <div className="text-2xl font-extrabold text-white mt-1">{users.length} Members</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Average Staff Completion Rate</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {Math.round(
                  userPerformanceList.reduce((acc, curr) => acc + curr.completionRate, 0) / (users.length || 1)
                )}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Total Open Tasks Delegated</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {tasks.filter(t => t.status !== 'Completed').length} Pending Tasks
              </div>
            </div>
          </div>

          <div className="ca-table-container">
            <table className="ca-table">
              <thead>
                <tr>
                  <th>Staff Member & Role</th>
                  <th>Allocated Clients</th>
                  <th>Total Delegated Tasks</th>
                  <th>Completed Tasks</th>
                  <th>Pending Tasks</th>
                  <th>Completion Progress</th>
                </tr>
              </thead>
              <tbody>
                {userPerformanceList.map((item) => (
                  <tr key={item.user.id}>
                    <td>
                      <div className="font-bold text-slate-100">{item.user.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.user.designation}</div>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-slate-200">
                        {item.allocatedClientsCount} Files Allocated
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono font-bold text-slate-200">{item.totalCount}</span>
                    </td>
                    <td>
                      <span className="text-xs font-mono font-bold text-emerald-400">{item.completedCount}</span>
                    </td>
                    <td>
                      <span className="text-xs font-mono font-bold text-amber-400">{item.pendingCount}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300 w-10">
                          {item.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Pending Work Report */
        <div className="space-y-6">
          {/* Pending GST Returns */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-400" />
              Pending GST Returns ({pendingGst.length})
            </h3>
            <div className="ca-table-container">
              <table className="ca-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>GSTIN</th>
                    <th>Period & Form</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingGst.map((g) => (
                    <tr key={g.id}>
                      <td className="font-bold text-slate-100">{g.clientName}</td>
                      <td className="font-mono text-xs text-cyan-400">{g.gstin}</td>
                      <td className="text-xs">{g.period} ({g.type})</td>
                      <td className="text-xs font-semibold text-amber-300">{g.dueDate}</td>
                      <td><span className="badge badge-pending">{g.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending ITR & Audits */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-blue-300 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Pending Income Tax Returns & Tax Audits ({pendingIt.length})
            </h3>
            <div className="ca-table-container">
              <table className="ca-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>PAN</th>
                    <th>Form Type</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingIt.map((i) => (
                    <tr key={i.id}>
                      <td className="font-bold text-slate-100">{i.clientName}</td>
                      <td className="font-mono text-xs text-emerald-400">{i.pan}</td>
                      <td className="text-xs">{i.formType}</td>
                      <td className="text-xs font-semibold text-amber-300">{i.dueDate}</td>
                      <td><span className="badge badge-pending">{i.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
