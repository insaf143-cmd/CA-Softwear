import React from 'react';
import {
  Users,
  FileCheck,
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Plus,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function Dashboard({
  clients,
  gstWork,
  itWork,
  tasks,
  invoices,
  setActiveTab,
  onOpenNewClient,
  onOpenTaxCalc
}) {
  const pendingGstCount = gstWork.filter(g => g.status !== 'Filed').length;
  const filedGstCount = gstWork.filter(g => g.status === 'Filed').length;

  const pendingItCount = itWork.filter(i => i.status !== 'Filed' && i.status !== 'Completed').length;
  const filedItCount = itWork.filter(i => i.status === 'Filed' || i.status === 'Completed').length;

  const openTasks = tasks.filter(t => t.status !== 'Completed');
  const urgentTasks = openTasks.filter(t => t.priority === 'Urgent' || t.priority === 'High');

  const pendingInvoices = invoices.filter(i => i.status === 'Pending');
  const pendingFeesTotal = pendingInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const complianceHealthScore = Math.round(
    ((filedGstCount + filedItCount) / (gstWork.length + itWork.length || 1)) * 100
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-700/70 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CA Firm Command Hub
            </span>
            <span className="text-xs text-slate-400">AY 2026-27 / FY 2025-26</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Work Control & Statutory Compliance Status
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Monitor client GST returns, Income Tax ITRs, Tax Audits, MCA filings, and article staff assignments in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
          <button
            onClick={onOpenTaxCalc}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            <span>Tax Estimator</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clients */}
        <div
          onClick={() => setActiveTab('clients')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Active Clients</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{clients.length}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">100% Active</span> • Corporate & Individuals
            </div>
          </div>
        </div>

        {/* Card 2: Pending GST */}
        <div
          onClick={() => setActiveTab('gst')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">GST Filings Pending</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-400">{pendingGstCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{filedGstCount} Filed</span> • July 2026 Return
            </div>
          </div>
        </div>

        {/* Card 3: Pending ITR */}
        <div
          onClick={() => setActiveTab('it')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Income Tax & Audits</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-400">{pendingItCount}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-slate-300 font-semibold">{itWork.length} Total</span> • AY 2026-27 ITR / 3CD
            </div>
          </div>
        </div>

        {/* Card 4: Outstanding Fees */}
        <div
          onClick={() => setActiveTab('billing')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Outstanding Fees</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-purple-300">
              ₹{pendingFeesTotal.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-amber-400 font-semibold">{pendingInvoices.length} Invoices</span> Pending Collection
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Upcoming Due Date Ticker */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-300">Upcoming Statutory Deadline:</span>{' '}
            <span className="text-slate-200">
              GSTR-1 Due Date is <strong>11th Aug 2026</strong> & GSTR-3B Due Date is <strong>20th Aug 2026</strong>. Tax Audit Form 3CD due date is 30th Sept 2026.
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('calendar')}
          className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline shrink-0 flex items-center gap-1"
        >
          View Calendar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Compliance Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* GST Filing Status Section */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  GST Returns Overview (July 2026)
                </h3>
                <p className="text-xs text-slate-400">Monthly/Quarterly GST Filing Progress</p>
              </div>
              <button
                onClick={() => setActiveTab('gst')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Go to GST Module <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {gstWork.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{item.clientName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        {item.gstin}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>Return: <strong>{item.type}</strong></span>
                      <span>Period: <strong>{item.period}</strong></span>
                      <span>Due: <strong className="text-amber-300">{item.dueDate}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`badge ${
                        item.status === 'Filed'
                          ? 'badge-filed'
                          : item.status === 'Draft Prepared' || item.status === 'Client Approved'
                          ? 'badge-draft'
                          : 'badge-pending'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Tax & Tax Audit Section */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Income Tax Returns & Tax Audits (AY 2026-27)
                </h3>
                <p className="text-xs text-slate-400">ITR-1 to 7 and Form 3CD Compliance Tracking</p>
              </div>
              <button
                onClick={() => setActiveTab('it')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Go to IT Module <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {itWork.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{item.clientName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        {item.pan}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>Form: <strong>{item.formType}</strong></span>
                      <span>Assigned: <strong>{item.assignedTo}</strong></span>
                      <span>Tax Due: <strong className="text-emerald-400">₹{item.taxDue ? item.taxDue.toLocaleString('en-IN') : '0'}</strong></span>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      item.status === 'Filed' || item.status === 'Completed'
                        ? 'badge-filed'
                        : item.status === 'In Audit' || item.status === 'Draft Prepared'
                        ? 'badge-draft'
                        : 'badge-pending'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Staff Tasks & Reminders */}
        <div className="space-y-6">
          {/* Urgent Staff Tasks */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Urgent Tasks ({urgentTasks.length})
              </h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {urgentTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{t.title}</span>
                    <span className="badge badge-urgent">{t.priority}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t.clientName} • Due: {t.dueDate}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                    <span>Category: {t.category}</span>
                    <span className="text-emerald-400 font-medium">Assigned: {t.assignedTo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Practice Info */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              CA Firm System Info
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Firm Registration (FRN):</span>
                <span className="font-mono text-slate-200 font-semibold">129988W</span>
              </div>
              <div className="flex justify-between">
                <span>Active Articles & Staff:</span>
                <span className="font-mono text-emerald-400 font-semibold">5 Members</span>
              </div>
              <div className="flex justify-between">
                <span>GST Portal Integration:</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>
              <div className="flex justify-between">
                <span>Income Tax Portal e-Filing:</span>
                <span className="text-emerald-400 font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
