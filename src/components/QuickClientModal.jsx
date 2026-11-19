import React, { useState } from 'react';
import { UserPlus, X, ShieldCheck, Key, Building2, Edit3, EyeOff } from 'lucide-react';

export default function QuickClientModal({ onClose, onAddClient, staff, initialClient = null }) {
  const isEdit = Boolean(initialClient);

  const [form, setForm] = useState({
    clientId: initialClient?.id || `CL-${Math.floor(1001 + Math.random() * 8999)}`,
    name: initialClient?.name || '',
    tradeName: initialClient?.tradeName || '',
    constitution: initialClient?.constitution || 'Private Limited Company',
    pan: initialClient?.pan || '',
    gstin: initialClient?.gstin || '',
    tan: initialClient?.tan || '',
    email: initialClient?.email || '',
    phone: initialClient?.phone || '',
    authorizedPerson: initialClient?.authorizedPerson || '',
    address: initialClient?.address || '',
    category: initialClient?.category || 'Corporate',
    turnover: initialClient?.turnover || '₹1.0 Cr',
    assignedStaff: initialClient?.assignedStaff || staff[0]?.id || 'ADMIN01',
    status: initialClient?.status || 'Active',
    gstUser: initialClient?.portalCredentials?.gstUser || '',
    gstPass: initialClient?.portalCredentials?.gstPass || '',
    itUser: initialClient?.portalCredentials?.itUser || '',
    itPass: initialClient?.portalCredentials?.itPass || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = (form.clientId || '').trim().toUpperCase() || (initialClient?.id || `CL-${Math.floor(1001 + Math.random() * 8999)}`);
    const cleanName = (form.name || '').trim();
    if (!cleanName) {
      alert('Please enter Client / Legal Entity Name.');
      return;
    }

    const cleanPan = (form.pan || '').trim().toUpperCase() || 'PENDING';
    const cleanGstin = (form.gstin || '').trim().toUpperCase();
    const cleanTan = (form.tan || '').trim().toUpperCase();

    const savedClient = {
      ...(initialClient || {}),
      id: cleanId,
      name: cleanName,
      tradeName: (form.tradeName || '').trim() || cleanName,
      constitution: form.constitution || 'Private Limited Company',
      pan: cleanPan,
      gstin: cleanGstin || 'N/A',
      tan: cleanTan || 'N/A',
      cin: initialClient?.cin || 'Pending Registration',
      email: form.email || '',
      phone: form.phone || '',
      authorizedPerson: form.authorizedPerson || cleanName,
      address: form.address || '',
      assignedStaff: form.assignedStaff || staff[0]?.id || 'ADMIN01',
      category: form.category || 'Corporate',
      turnover: form.turnover || '₹1.0 Cr',
      status: form.status || 'Active',
      bankDetails: initialClient?.bankDetails || { bank: 'HDFC Bank', acNo: '001299881122', ifsc: 'HDFC0000240', branch: 'Main Branch' },
      portalCredentials: {
        ...(initialClient?.portalCredentials || {}),
        gstUser: form.gstUser || `${cleanPan}_GST`,
        gstPass: form.gstPass || 'GstPass#2026',
        itUser: form.itUser || cleanPan,
        itPass: form.itPass || 'ItPass#2026'
      },
      directors: initialClient?.directors || []
    };

    onAddClient(savedClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit3 className="w-5 h-5 text-amber-400" /> : <UserPlus className="w-5 h-5 text-emerald-400" />}
            {isEdit ? `Edit Client Master File (${form.clientId})` : 'Register New CA Firm Client'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Client ID and Status Section */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-0.5">
                Client ID (Unique Master Code) <span className="text-emerald-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Generated identifier used for file allocation, statutory tracking, and documents.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                disabled={isEdit}
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value.toUpperCase() })}
                placeholder="e.g. CL-1001"
                className={`w-36 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold focus:outline-none uppercase text-xs ${
                  isEdit ? 'opacity-70 cursor-not-allowed' : 'focus:border-emerald-500'
                }`}
              />
              {!isEdit && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      clientId: `CL-${Math.floor(1001 + Math.random() * 8999)}`
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 shrink-0"
                  title="Generate another sequential Client ID"
                >
                  Auto Generate
                </button>
              )}
            </div>
          </div>

          {/* Client Status (Active vs Resigned/Hidden) */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-slate-200 font-bold block">Client Engagement Status</label>
              <p className="text-[11px] text-slate-400">
                Marking a client as Resigned hides them from active daily views while preserving all historical records.
              </p>
            </div>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs focus:outline-none ${
                form.status === 'Active'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <option value="Active" className="bg-slate-900 text-emerald-300">Active Client (In Service)</option>
              <option value="Resigned" className="bg-slate-900 text-amber-300">Resigned / Discontinued (Hidden)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Client / Legal Entity Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Zenith Tech Solutions Pvt Ltd"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Trade Name (If different)</label>
              <input
                type="text"
                value={form.tradeName}
                onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                placeholder="e.g. Zenith Tech"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Constitution / Type</label>
              <select
                value={form.constitution}
                onChange={(e) => setForm({ ...form, constitution: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="Partnership Firm">Partnership Firm</option>
                <option value="Limited Liability Partnership (LLP)">LLP</option>
                <option value="Individual / Proprietorship">Individual / Proprietorship</option>
                <option value="Trust / NGO (12A/80G)">Trust / NGO</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">PAN Number *</label>
              <input
                type="text"
                required
                maxLength="10"
                value={form.pan}
                onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">GSTIN Number</label>
              <input
                type="text"
                maxLength="15"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                placeholder="27ABCDE1234F1Z5"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-cyan-400 font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Authorized Contact Person</label>
              <input
                type="text"
                value={form.authorizedPerson}
                onChange={(e) => setForm({ ...form, authorizedPerson: e.target.value })}
                placeholder="e.g. Rahul Sharma (Director)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98200 11223"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="accounts@client.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Registered Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Building, Street, City, State - Pincode"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
            />
          </div>

          {/* Portal Credentials Section */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> Initial Portal Login Passwords
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-0.5">GST Portal Password</label>
                <input
                  type="text"
                  value={form.gstPass}
                  onChange={(e) => setForm({ ...form, gstPass: e.target.value })}
                  placeholder="e.g. GstClient#2026"
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Income Tax Portal Password</label>
                <input
                  type="text"
                  value={form.itPass}
                  onChange={(e) => setForm({ ...form, itPass: e.target.value })}
                  placeholder="e.g. TaxClient#2026"
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg transition"
            >
              {isEdit ? 'Update Client File' : 'Save Client Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
