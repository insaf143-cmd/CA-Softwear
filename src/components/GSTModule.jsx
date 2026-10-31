import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Calculator,
  Plus,
  Trash2,
  Edit2,
  X,
  TrendingUp,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

export default function GSTModule({ gstWork = [], setGstWork, clients = [], firmProfile }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.name || '',
    gstin: clients[0]?.gstin || '',
    type: 'GSTR-3B',
    period: 'October 2026',
    dueDate: '2026-11-20',
    turnover: '',
    salesTax: '',
    itcAvailable: '',
    netLiability: '',
    status: 'Filed',
    arn: ''
  });

  // Auto-calculate Net Liability = Sales Tax - ITC Available
  useEffect(() => {
    if (formData.salesTax !== '' || formData.itcAvailable !== '') {
      const sales = Number(formData.salesTax) || 0;
      const itc = Number(formData.itcAvailable) || 0;
      const net = Math.max(0, sales - itc);
      setFormData(prev => ({ ...prev, netLiability: net }));
    }
  }, [formData.salesTax, formData.itcAvailable]);

  // Handle Client select change
  const handleClientSelect = (clientId) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        clientId: found.id,
        clientName: found.name,
        gstin: found.gstin || ''
      }));
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      gstin: clients[0]?.gstin || '',
      type: 'GSTR-3B',
      period: 'October 2026',
      dueDate: '2026-11-20',
      turnover: '',
      salesTax: '',
      itcAvailable: '',
      netLiability: '',
      status: 'Filed',
      arn: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      clientId: item.clientId || '',
      clientName: item.clientName || '',
      gstin: item.gstin || '',
      type: item.type || 'GSTR-3B',
      period: item.period || '',
      dueDate: item.dueDate || '',
      turnover: item.turnover ?? '',
      salesTax: item.salesTax ?? '',
      itcAvailable: item.itcAvailable ?? '',
      netLiability: item.netLiability ?? '',
      status: item.status || 'Filed',
      arn: item.arn || ''
    });
    setShowAddModal(true);
  };

  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      alert('Please enter or select a client name.');
      return;
    }

    const newRecord = {
      id: editingItem ? editingItem.id : `GST-${Date.now().toString().slice(-6)}`,
      clientId: formData.clientId || 'CL01',
      clientName: formData.clientName.trim(),
      gstin: formData.gstin.trim() || 'Unregistered',
      type: formData.type,
      period: formData.period.trim(),
      dueDate: formData.dueDate,
      turnover: Number(formData.turnover) || 0,
      salesTax: Number(formData.salesTax) || 0,
      itcAvailable: Number(formData.itcAvailable) || 0,
      netLiability: Number(formData.netLiability) || 0,
      status: formData.status,
      arn: formData.arn.trim(),
      taskId: editingItem?.taskId || null
    };

    if (editingItem) {
      setGstWork((prev) => prev.map((g) => (g.id === editingItem.id ? newRecord : g)));
    } else {
      setGstWork((prev) => [newRecord, ...prev]);
    }

    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this GST return record?')) {
      setGstWork((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const filteredData = (gstWork || []).filter((item) => {
    const matchesSearch =
      item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.period?.toLowerCase().includes(searchTerm.toLowerCase());

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
    const text = `Dear Client (${item.clientName}), GST return ${item.type} for ${item.period} is currently marked as '${item.status}'. Net GST Payable: ₹${Number(item.netLiability || 0).toLocaleString('en-IN')}. Due date is ${item.dueDate}. - ${senderFirm}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
              Indirect Tax Register
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            GST Compliance & Return Control Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track GSTR-1, GSTR-3B, CMP-08, and GSTR-9 filings, ITC availability, sales turnover, and net tax liabilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            {gstWork.filter(g => g.status === 'Filed').length} / {gstWork.length} Returns Filed
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add GST Return Entry</span>
          </button>
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
            placeholder="Search GSTIN, Client, Period..."
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
                <td colSpan="9" className="text-center py-12 text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileSpreadsheet className="w-8 h-8 text-slate-500 opacity-50" />
                    <span className="font-medium text-slate-300">No GST return records match the filter criteria.</span>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                    >
                      + Add First GST Record
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
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
                    <span className="text-xs font-mono text-slate-200">
                      ₹{Number(item.salesTax || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-emerald-400">
                      ₹{Number(item.itcAvailable || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ₹{Number(item.netLiability || 0).toLocaleString('en-IN')}
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSendWhatsAppAlert(item)}
                        className="px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 text-[11px] font-semibold inline-flex items-center gap-1 transition"
                        title="Send WhatsApp Client Reminder"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Notify</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                        title="Edit Entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT GST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? 'Edit GST Return Record' : 'Add New GST Return Entry'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Log return type, turnover, output tax, input tax credit, and net liability.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4 text-xs">
              {/* Client Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Registered Client
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Existing Client or Type Below --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.gstin ? `(${c.gstin})` : `(${c.pan || c.id})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Client / Trade Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Acme Enterprises"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AAAAA1234F1Z1"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Return Type, Period, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Return Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GSTR-3B">GSTR-3B (Monthly Summary)</option>
                    <option value="GSTR-1">GSTR-1 (Outward Supplies)</option>
                    <option value="CMP-08">CMP-08 (Composition)</option>
                    <option value="GSTR-9">GSTR-9 (Annual Return)</option>
                    <option value="GSTR-9C">GSTR-9C (Reconciliation)</option>
                    <option value="IFF">IFF (QRMP Facility)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Period / Month</label>
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Turnover, Output Tax, ITC Available, Net Liability */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Turnover (₹)</label>
                  <input
                    type="number"
                    value={formData.turnover}
                    onChange={(e) => setFormData({ ...formData, turnover: e.target.value })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Sales Tax (₹)</label>
                  <input
                    type="number"
                    value={formData.salesTax}
                    onChange={(e) => setFormData({ ...formData, salesTax: e.target.value })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">GST Input ITC (₹)</label>
                  <input
                    type="number"
                    value={formData.itcAvailable}
                    onChange={(e) => setFormData({ ...formData, itcAvailable: e.target.value })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-amber-300 text-[10px] uppercase font-bold mb-1">Net Liability (₹)</label>
                  <input
                    type="number"
                    value={formData.netLiability}
                    onChange={(e) => setFormData({ ...formData, netLiability: e.target.value })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-amber-500/60 rounded-lg text-amber-300 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* ARN & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Filing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Filed">Filed (Signed off)</option>
                    <option value="Client Approved">Client Approved</option>
                    <option value="Draft Prepared">Draft Prepared</option>
                    <option value="Data Received">Data Received</option>
                    <option value="Data Pending">Data Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ARN / Acknowledgment Number
                  </label>
                  <input
                    type="text"
                    value={formData.arn}
                    onChange={(e) => setFormData({ ...formData, arn: e.target.value })}
                    placeholder="e.g. AA271026001234V"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Confirm & Save Return'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
