import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calculator,
  ShieldAlert,
  CheckCircle,
  FileCheck2,
  Clock
} from 'lucide-react';

export default function ITModule({ itWork, setItWork, onOpenTaxCalc }) {
  const [ayFilter, setAyFilter] = useState('AY 2026-27');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = itWork.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesAY = item.ay === ayFilter || item.ay.includes(ayFilter);

    return matchesSearch && matchesStatus && matchesAY;
  });

  const handleStatusChange = (id, newStatus) => {
    const updated = itWork.map((i) => (i.id === id ? { ...i, status: newStatus } : i));
    setItWork(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Income Tax (ITR) & Tax Audit Control Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track ITR-1 to 7 returns, Tax Audit reports (Form 3CD), TDS returns (24Q/26Q), and Advance Tax.
          </p>
        </div>

        <button
          onClick={onOpenTaxCalc}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-950/50 transition"
        >
          <Calculator className="w-4 h-4" />
          <span>Launch Old vs New Tax Estimator</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* AY Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {['AY 2026-27', 'AY 2025-26'].map((ay) => (
              <button
                key={ay}
                onClick={() => setAyFilter(ay)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  ayFilter === ay
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ay}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['All', 'Data Pending', 'Data Received', 'In Audit', 'Draft Prepared', 'Filed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PAN or Client..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* IT Returns Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Client Name & PAN</th>
              <th>Form / Return Type</th>
              <th>Due Date</th>
              <th>Taxable Income</th>
              <th>Tax Payable / Refund</th>
              <th>Ack / Token No</th>
              <th>Assigned Staff</th>
              <th>Filing Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-slate-400 text-xs">
                  No Income Tax return records found matching filters.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-bold text-slate-100">{item.clientName}</div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{item.pan}</div>
                  </td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-blue-300 border border-slate-700 font-bold">
                      {item.formType}
                    </span>
                    {item.taxAuditRequired && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        Tax Audit (44AB)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-amber-300">{item.dueDate}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-200">
                      ₹{item.taxableIncome ? item.taxableIncome.toLocaleString('en-IN') : '0'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{item.taxDue ? item.taxDue.toLocaleString('en-IN') : '0'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-400">{item.ackNo}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-300">{item.assignedTo}</span>
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        item.status === 'Filed' || item.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'In Audit' || item.status === 'Draft Prepared'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <option value="Data Pending" className="bg-slate-900 text-slate-200">Data Pending</option>
                      <option value="Data Received" className="bg-slate-900 text-slate-200">Data Received</option>
                      <option value="In Audit" className="bg-slate-900 text-slate-200">In Audit</option>
                      <option value="Draft Prepared" className="bg-slate-900 text-slate-200">Draft Prepared</option>
                      <option value="Filed" className="bg-slate-900 text-slate-200">Filed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
