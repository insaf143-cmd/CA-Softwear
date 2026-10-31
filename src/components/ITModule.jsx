import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calculator,
  ShieldAlert,
  CheckCircle,
  FileCheck2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

export default function ITModule({ itWork = [], setItWork, onOpenTaxCalc, clients = [] }) {
  const [ayFilter, setAyFilter] = useState('AY 2026-27');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.name || '',
    pan: clients[0]?.pan || '',
    formType: 'ITR-3',
    ay: 'AY 2026-27',
    dueDate: '2026-10-31',
    taxableIncome: '',
    taxDue: '',
    ackNo: '',
    assignedTo: 'Tax Team',
    taxAuditRequired: false,
    status: 'Filed'
  });

  const handleClientSelect = (clientId) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        clientId: found.id,
        clientName: found.name,
        pan: found.pan || ''
      }));
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      pan: clients[0]?.pan || '',
      formType: 'ITR-3',
      ay: 'AY 2026-27',
      dueDate: '2026-10-31',
      taxableIncome: '',
      taxDue: '',
      ackNo: '',
      assignedTo: 'Tax Team',
      taxAuditRequired: false,
      status: 'Filed'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      clientId: item.clientId || '',
      clientName: item.clientName || '',
      pan: item.pan || '',
      formType: item.formType || 'ITR-3',
      ay: item.ay || 'AY 2026-27',
      dueDate: item.dueDate || '',
      taxableIncome: item.taxableIncome ?? '',
      taxDue: item.taxDue ?? '',
      ackNo: item.ackNo || '',
      assignedTo: item.assignedTo || 'Tax Team',
      taxAuditRequired: Boolean(item.taxAuditRequired),
      status: item.status || 'Filed'
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
      id: editingItem ? editingItem.id : `IT-${Date.now().toString().slice(-6)}`,
      clientId: formData.clientId || 'CL01',
      clientName: formData.clientName.trim(),
      pan: formData.pan.trim().toUpperCase() || 'N/A',
      formType: formData.formType,
      ay: formData.ay,
      dueDate: formData.dueDate,
      taxableIncome: Number(formData.taxableIncome) || 0,
      taxDue: Number(formData.taxDue) || 0,
      ackNo: formData.ackNo.trim() || 'Pending',
      assignedTo: formData.assignedTo.trim() || 'Tax Team',
      taxAuditRequired: Boolean(formData.taxAuditRequired),
      status: formData.status,
      taskId: editingItem?.taskId || null
    };

    if (editingItem) {
      setItWork((prev) => prev.map((i) => (i.id === editingItem.id ? newRecord : i)));
    } else {
      setItWork((prev) => [newRecord, ...prev]);
    }

    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this Income Tax record?')) {
      setItWork((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const filteredData = (itWork || []).filter((item) => {
    const matchesSearch =
      item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesAY = !ayFilter || item.ay === ayFilter || item.ay?.includes(ayFilter);

    return matchesSearch && matchesStatus && matchesAY;
  });

  const handleStatusChange = (id, newStatus) => {
    const updated = itWork.map((i) => (i.id === id ? { ...i, status: newStatus } : i));
    setItWork(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
              Direct Tax & Statutory Audit
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Income Tax (ITR) & Tax Audit Control Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track ITR-1 to 7 returns, Tax Audit reports (Form 3CD), TDS returns (24Q/26Q), and Advance Tax.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTaxCalc}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>Tax Estimator</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-950/40 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income Tax Entry</span>
          </button>
        </div>
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
            placeholder="Search PAN, Client, Form..."
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
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-500 opacity-50" />
                    <span className="font-medium text-slate-300">No Income Tax return records found matching filters.</span>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                    >
                      + Add First Income Tax Record
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
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
                      ₹{item.taxableIncome ? Number(item.taxableIncome).toLocaleString('en-IN') : '0'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{item.taxDue ? Number(item.taxDue).toLocaleString('en-IN') : '0'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-400">{item.ackNo || 'Pending'}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-300">{item.assignedTo || 'Unassigned'}</span>
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
                      <option value="Client Approved" className="bg-slate-900 text-slate-200">Client Approved</option>
                      <option value="Filed" className="bg-slate-900 text-slate-200">Filed</option>
                    </select>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
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

      {/* ADD / EDIT INCOME TAX MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? 'Edit Income Tax Record' : 'Add New Income Tax / ITR Entry'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Log ITR form type, assessment year, taxable income, and e-filing token number.
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
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Registered Client
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Existing Client or Type Below --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.pan ? `(${c.pan})` : `(${c.id})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Client Name / Assessee <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Form Type, AY, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Form / Return</label>
                  <select
                    value={formData.formType}
                    onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ITR-1">ITR-1 (Sahaj)</option>
                    <option value="ITR-2">ITR-2</option>
                    <option value="ITR-3">ITR-3 (Business & Profession)</option>
                    <option value="ITR-4">ITR-4 (Sugam - 44AD/ADA)</option>
                    <option value="ITR-5">ITR-5 (LLP / Firm)</option>
                    <option value="ITR-6">ITR-6 (Company)</option>
                    <option value="ITR-7">ITR-7 (Trust / Society)</option>
                    <option value="Form 3CD">Form 3CD (Tax Audit Report)</option>
                    <option value="26Q TDS">26Q (TDS Other than Salary)</option>
                    <option value="24Q TDS">24Q (Salary TDS)</option>
                    <option value="Advance Tax">Advance Tax Challan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assessment Year (AY)</label>
                  <select
                    value={formData.ay}
                    onChange={(e) => setFormData({ ...formData, ay: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="AY 2026-27">AY 2026-27</option>
                    <option value="AY 2025-26">AY 2025-26</option>
                    <option value="AY 2024-25">AY 2024-25</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Taxable Income, Tax Due, Token */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Taxable Income (₹)</label>
                  <input
                    type="number"
                    value={formData.taxableIncome}
                    onChange={(e) => setFormData({ ...formData, taxableIncome: e.target.value })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Tax Payable / Refund (₹)</label>
                  <input
                    type="number"
                    value={formData.taxDue}
                    onChange={(e) => setFormData({ ...formData, taxDue: e.target.value })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Ack / Token Number</label>
                  <input
                    type="text"
                    value={formData.ackNo}
                    onChange={(e) => setFormData({ ...formData, ackNo: e.target.value })}
                    placeholder="e.g. 892716301290"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assigned Staff / Auditor
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="e.g. CA Rajesh / Direct Tax Team"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Filing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Filed">Filed (Signed off)</option>
                    <option value="Client Approved">Client Approved</option>
                    <option value="In Audit">In Audit</option>
                    <option value="Draft Prepared">Draft Prepared</option>
                    <option value="Data Received">Data Received</option>
                    <option value="Data Pending">Data Pending</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={formData.taxAuditRequired}
                  onChange={(e) => setFormData({ ...formData, taxAuditRequired: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
                />
                <span className="font-medium">Mandatory Tax Audit under Section 44AB Applicable</span>
              </label>

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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-950/50 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
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
