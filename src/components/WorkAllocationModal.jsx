import React, { useState } from 'react';
import {
  CheckSquare,
  X,
  Building,
  Calendar,
  User,
  AlertCircle,
  FileText,
  Clock,
  DollarSign,
  Tag,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function WorkAllocationModal({
  onClose,
  onAllocateWork,
  clients,
  staff,
  currentUser
}) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0] || {};

  const [formData, setFormData] = useState({
    title: '',
    department: 'GST Compliance',
    assignedTo: staff[2]?.id || staff[0]?.id || '',
    finishingDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 'High',
    fy: '2025-26',
    ay: '2026-27',
    statutorySection: 'Section 39 / Rule 61 (GSTR-3B)',
    workDetails: '',
    initialRemarks: '',
    estimatedHours: '6 hrs',
    feeQuote: '₹10,000'
  });

  const departmentSections = {
    'GST Compliance': 'Section 39 / Rule 61 (GSTR-3B & GSTR-1)',
    'Income Tax': 'Section 139(1) / 142(1) ITR',
    'Statutory & Tax Audit': 'Section 44AB / Form 3CD & 3CA',
    'ROC & Corporate Laws': 'Companies Act 2013 / AOC-4 & MGT-7',
    'TDS & Payroll': 'Section 200(3) / Form 24Q & 26Q',
    'Accounting & Bookkeeping': 'Schedule III Financial Statements'
  };

  const handleDepartmentChange = (dept) => {
    setFormData((prev) => ({
      ...prev,
      department: dept,
      statutorySection: departmentSections[dept] || ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a Work Title / Nature of Assignment');
      return;
    }

    const assignee = staff.find((s) => s.id === formData.assignedTo) || { name: 'Staff Member' };

    const newWorkItem = {
      id: `CA-WRK-${Date.now().toString().slice(-4)}`,
      title: formData.title.trim(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientPan: selectedClient.pan || 'N/A',
      clientGstin: selectedClient.gstin || 'N/A',
      department: formData.department,
      category: formData.department.includes('GST') ? 'GST' : formData.department.includes('Income Tax') ? 'Income Tax' : 'Audit',
      assignedTo: formData.assignedTo,
      assignedToName: assignee.name,
      allocatedBy: `${currentUser.name} (${currentUser.role})`,
      allocatedDate: new Date().toISOString().split('T')[0],
      finishingDate: formData.finishingDate,
      dueDate: formData.finishingDate,
      priority: formData.priority,
      status: 'Allocated', // Initial status: Allocated (Pending)
      fy: formData.fy,
      ay: formData.ay,
      statutorySection: formData.statutorySection,
      workDetails: formData.workDetails || 'Standard compliance and verification required.',
      initialRemarks: formData.initialRemarks || 'Allocated per annual engagement mandate.',
      estimatedHours: formData.estimatedHours || '4 hrs',
      feeQuote: formData.feeQuote || '₹5,000',
      transferHistory: []
    };

    onAllocateWork(newWorkItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Allocate New Work Assignment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Delegate CA firm assignment to article assistant or specialist with target finishing date.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Allocation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Work Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Work Title / Nature of Assignment <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. GSTR-3B July 2026 Return Preparation & 2B Reconciliation"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Client Selection & Auto Client Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Select Client <span className="text-emerald-400">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.pan})
                  </option>
                ))}
              </select>
            </div>

            {/* Client Info Pill */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-center text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">PAN:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedClient.pan || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GSTIN:</span>
                <span className="font-mono text-cyan-400 font-bold truncate max-w-[150px]">{selectedClient.gstin || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Department & Statutory Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Department / Service Line</label>
              <select
                value={formData.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="GST Compliance">GST Compliance</option>
                <option value="Income Tax">Income Tax & Direct Tax</option>
                <option value="Statutory & Tax Audit">Statutory & Tax Audit (3CD)</option>
                <option value="ROC & Corporate Laws">ROC & Corporate Laws (MCA)</option>
                <option value="TDS & Payroll">TDS & Payroll Withholding</option>
                <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Statutory Section / Form</label>
              <input
                type="text"
                value={formData.statutorySection}
                onChange={(e) => setFormData({ ...formData, statutorySection: e.target.value })}
                placeholder="e.g. Section 44AB / Form 3CD"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Allocate Staff & Target Finishing Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Allocate to User / Staff <span className="text-emerald-400">*</span>
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role === 'NORMAL_USER' ? s.designation : s.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Finishing Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.finishingDate}
                onChange={(e) => setFormData({ ...formData, finishingDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="Urgent">Urgent (Immediate Deadline)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Financial Year & Fee Quote */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Financial Year (FY)</label>
              <input
                type="text"
                value={formData.fy}
                onChange={(e) => setFormData({ ...formData, fy: e.target.value })}
                placeholder="2025-26"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Hours</label>
              <input
                type="text"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="e.g. 6 hrs"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Agreed Fee Quote</label>
              <input
                type="text"
                value={formData.feeQuote}
                onChange={(e) => setFormData({ ...formData, feeQuote: e.target.value })}
                placeholder="e.g. ₹15,000"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>
          </div>

          {/* Work Details & Scope */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Work Detail & Scope of Instructions
            </label>
            <textarea
              rows="3"
              value={formData.workDetails}
              onChange={(e) => setFormData({ ...formData, workDetails: e.target.value })}
              placeholder="Detailed instructions for the allocated staff: e.g. verify GSTR-2B with purchase register, calculate 40A(3) disallowances, prepare computation sheet..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Initial Remarks */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Allocation Remarks / Special Instructions
            </label>
            <input
              type="text"
              value={formData.initialRemarks}
              onChange={(e) => setFormData({ ...formData, initialRemarks: e.target.value })}
              placeholder="e.g. Client requested priority completion before board meeting on 15th."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <span className="text-[11px] text-slate-500">
              Allocated work will be restricted to assigned user's dashboard.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Allocate Work</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
