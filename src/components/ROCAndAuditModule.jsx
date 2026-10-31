import React, { useState } from 'react';
import {
  Building,
  Search,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

export default function ROCAndAuditModule({ rocWork = [], setRocWork, clients = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.name || '',
    formName: 'AOC-4',
    category: 'Annual ROC Filing',
    dueDate: '2026-10-30',
    assignedTo: 'Corporate Laws Team',
    notes: '',
    srn: '',
    status: 'Completed'
  });

  const handleClientSelect = (clientId) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        clientId: found.id,
        clientName: found.name
      }));
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      formName: 'AOC-4',
      category: 'Annual ROC Filing',
      dueDate: '2026-10-30',
      assignedTo: 'Corporate Laws Team',
      notes: '',
      srn: '',
      status: 'Completed'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      clientId: item.clientId || '',
      clientName: item.clientName || '',
      formName: item.formName || 'AOC-4',
      category: item.category || 'Annual ROC Filing',
      dueDate: item.dueDate || '',
      assignedTo: item.assignedTo || 'Corporate Laws Team',
      notes: item.notes || '',
      srn: item.srn || '',
      status: item.status || 'Completed'
    });
    setShowAddModal(true);
  };

  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      alert('Please enter or select a company / client name.');
      return;
    }

    const newRecord = {
      id: editingItem ? editingItem.id : `ROC-${Date.now().toString().slice(-6)}`,
      clientId: formData.clientId || 'CL01',
      clientName: formData.clientName.trim(),
      formName: formData.formName.trim(),
      category: formData.category,
      dueDate: formData.dueDate,
      assignedTo: formData.assignedTo.trim() || 'Corporate Laws Team',
      notes: formData.notes.trim() || 'Statutory filing completed.',
      srn: formData.srn.trim(),
      status: formData.status,
      taskId: editingItem?.taskId || null
    };

    if (editingItem) {
      setRocWork((prev) => prev.map((r) => (r.id === editingItem.id ? newRecord : r)));
    } else {
      setRocWork((prev) => [newRecord, ...prev]);
    }

    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this ROC / MCA record?')) {
      setRocWork((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filteredData = (rocWork || []).filter((item) =>
    item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.formName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id, newStatus) => {
    const updated = rocWork.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    setRocWork(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase tracking-wider">
              MCA & Corporate Law Register
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-400" />
            ROC & MCA Compliances & Statutory Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track AOC-4, MGT-7, DIR-3 KYC, LLP Form 11, and Audit Milestone Checklists.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add ROC / MCA Filing Entry</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ROC Form, Company, Category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Company / Client Name</th>
              <th>Form / Filing Type</th>
              <th>Category</th>
              <th>Due Date</th>
              <th>Assigned Staff</th>
              <th>Audit Notes / Remarks</th>
              <th>Filing Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Building className="w-8 h-8 text-slate-500 opacity-50" />
                    <span className="font-medium text-slate-300">No ROC / MCA filing records found.</span>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                    >
                      + Add First ROC Filing Record
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td>
                    <div className="font-bold text-slate-100">{item.clientName}</div>
                    {item.srn && <div className="text-[10px] font-mono text-purple-400 mt-0.5">SRN: {item.srn}</div>}
                  </td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-slate-700 font-bold">
                      {item.formName}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 font-medium">{item.category}</span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-amber-300">{item.dueDate}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-300">{item.assignedTo}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 italic line-clamp-1">{item.notes}</span>
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        item.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'In Progress'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <option value="Pending" className="bg-slate-900 text-slate-200">Pending</option>
                      <option value="In Progress" className="bg-slate-900 text-slate-200">In Progress</option>
                      <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
                    </select>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition"
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

      {/* ADD / EDIT ROC MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItem ? 'Edit ROC / MCA Filing Record' : 'Add New ROC / MCA Filing Entry'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Log AOC-4, MGT-7, DIR-3 KYC, LLP compliance, due date, and SRN number.
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
                  Select Registered Company / Client
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose Existing Client or Type Below --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Company / Entity Name <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Apex Infotech Private Limited"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Form Name, Category, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Form / Filing</label>
                  <select
                    value={formData.formName}
                    onChange={(e) => setFormData({ ...formData, formName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="AOC-4">AOC-4 (Financial Statements)</option>
                    <option value="MGT-7">MGT-7 (Annual Return)</option>
                    <option value="DIR-3 KYC">DIR-3 KYC (Director KYC)</option>
                    <option value="LLP Form 11">LLP Form 11 (Annual Return)</option>
                    <option value="LLP Form 8">LLP Form 8 (Statement of Accounts)</option>
                    <option value="ADT-1">ADT-1 (Auditor Appointment)</option>
                    <option value="DPT-3">DPT-3 (Return of Deposits)</option>
                    <option value="PAS-3">PAS-3 (Allotment of Shares)</option>
                    <option value="MGT-14">MGT-14 (Board Resolutions)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Annual ROC Filing">Annual ROC Filing</option>
                    <option value="Director Compliance">Director Compliance</option>
                    <option value="LLP Compliance">LLP Compliance</option>
                    <option value="Statutory Audit">Statutory Audit</option>
                    <option value="Company Secretarial">Company Secretarial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SRN / Challan No</label>
                  <input
                    type="text"
                    value={formData.srn}
                    onChange={(e) => setFormData({ ...formData, srn: e.target.value })}
                    placeholder="e.g. F98765432"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Staff</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="e.g. Corporate Law Team"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Filing Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Completed">Completed / Filed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Audit Notes / Remarks
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Board meeting approved on 25th Aug, filed without additional fees..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-950/50 transition flex items-center gap-1.5"
                >
                  <Building className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Confirm & Save Filing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
