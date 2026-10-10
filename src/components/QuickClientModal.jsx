import React, { useState } from 'react';
import { UserPlus, X, ShieldCheck, Key, Building2 } from 'lucide-react';

export default function QuickClientModal({ onClose, onAddClient, staff }) {
  const [form, setForm] = useState({
    clientId: `CL-${Math.floor(1001 + Math.random() * 8999)}`,
    name: '',
    tradeName: '',
    constitution: 'Private Limited Company',
    pan: '',
    gstin: '',
    tan: '',
    email: '',
    phone: '',
    authorizedPerson: '',
    address: '',
    category: 'Corporate',
    turnover: '₹1.0 Cr',
    assignedStaff: staff[0]?.id || 'S1',
    gstUser: '',
    gstPass: '',
    itUser: '',
    itPass: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = form.clientId.trim().toUpperCase() || `CL-${Math.floor(100 + Math.random() * 900)}`;
    const newClient = {
      id: cleanId,
      name: form.name,
      tradeName: form.tradeName || form.name,
      constitution: form.constitution,
      pan: form.pan.toUpperCase(),
      gstin: form.gstin.toUpperCase(),
      tan: form.tan.toUpperCase(),
      cin: 'Pending Registration',
      email: form.email,
      phone: form.phone,
      authorizedPerson: form.authorizedPerson || form.name,
      address: form.address,
      assignedStaff: form.assignedStaff,
      category: form.category,
      turnover: form.turnover,
      bankDetails: { bank: 'HDFC Bank', acNo: '001299881122', ifsc: 'HDFC0000240', branch: 'Main Branch' },
      portalCredentials: {
        gstUser: form.gstUser || `${form.pan}_GST`,
        gstPass: form.gstPass || 'GstPass#2026',
        itUser: form.pan.toUpperCase(),
        itPass: form.itPass || 'ItPass#2026'
      },
      directors: []
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            Register New CA Firm Client
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Client ID (Unique Code) */}
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
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value.toUpperCase() })}
                placeholder="e.g. CL-1001"
                className="w-36 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 uppercase text-xs"
              />
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
            </div>
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg"
            >
              Save Client Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
