import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Calculator
} from 'lucide-react';

export default function GSTModule({ gstWork, setGstWork, clients, firmProfile }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = gstWork.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesType = filterType === 'All' || item.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (id, newStatus) => {
    const updated = gstWork.map((g) => (g.id === id ? { ...g, status: newStatus } : g));
    setGstWork(updated);
  };

  const handleSendWhatsAppAlert = (item) => {
    const senderFirm = firmProfile?.firmName || 'M/s Sharma & Associates CAs';
    const text = `Dear Client (${item.clientName}), GST return ${item.type} for ${item.period} is currently marked as '${item.status}'. Net GST Payable: ₹${item.netLiability.toLocaleString('en-IN')}. Due date is ${item.dueDate}. - ${senderFirm}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            GST Compliance & Return Control Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track GSTR-1, GSTR-3B, CMP-08, and GSTR-9 annual return filings with ITC reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            {gstWork.filter(g => g.status === 'Filed').length} / {gstWork.length} Returns Filed
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Data Pending', 'Data Received', 'Draft Prepared', 'Client Approved', 'Filed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search GSTIN or Client..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* GST Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Client Name & GSTIN</th>
              <th>Return Type</th>
              <th>Period</th>
              <th>Due Date</th>
              <th>Sales Tax</th>
              <th>ITC Available</th>
              <th>Net Liability</th>
              <th>Filing Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-slate-400 text-xs">
                  No GST return records match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-bold text-slate-100">{item.clientName}</div>
                    <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{item.gstin}</div>
                  </td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">
                      {item.type}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 font-medium">{item.period}</span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-amber-300">{item.dueDate}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-200">₹{item.salesTax.toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-emerald-400">₹{item.itcAvailable.toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ₹{item.netLiability.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        item.status === 'Filed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'Draft Prepared' || item.status === 'Client Approved'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <option value="Data Pending" className="bg-slate-900 text-slate-200">Data Pending</option>
                      <option value="Data Received" className="bg-slate-900 text-slate-200">Data Received</option>
                      <option value="Draft Prepared" className="bg-slate-900 text-slate-200">Draft Prepared</option>
                      <option value="Client Approved" className="bg-slate-900 text-slate-200">Client Approved</option>
                      <option value="Filed" className="bg-slate-900 text-slate-200">Filed</option>
                    </select>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleSendWhatsAppAlert(item)}
                      className="px-2.5 py-1.2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 text-[11px] font-semibold inline-flex items-center gap-1 transition"
                      title="Send WhatsApp Client Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Notify</span>
                    </button>
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
