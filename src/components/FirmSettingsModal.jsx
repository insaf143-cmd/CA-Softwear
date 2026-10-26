import React, { useState } from 'react';
import {
  Building2,
  X,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_FIRM_PROFILE } from '../utils/storage';

export default function FirmSettingsModal({ firmProfile, onSaveFirmProfile, onClose }) {
  const [formData, setFormData] = useState({
    firmName: firmProfile?.firmName || DEFAULT_FIRM_PROFILE.firmName,
    tagline: firmProfile?.tagline || DEFAULT_FIRM_PROFILE.tagline,
    frn: firmProfile?.frn || DEFAULT_FIRM_PROFILE.frn,
    gstin: firmProfile?.gstin || DEFAULT_FIRM_PROFILE.gstin,
    address: firmProfile?.address || DEFAULT_FIRM_PROFILE.address,
    phone: firmProfile?.phone || DEFAULT_FIRM_PROFILE.phone,
    email: firmProfile?.email || DEFAULT_FIRM_PROFILE.email,
    partnerName: firmProfile?.partnerName || DEFAULT_FIRM_PROFILE.partnerName,
    driveFolderUrl: firmProfile?.driveFolderUrl || DEFAULT_FIRM_PROFILE.driveFolderUrl || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firmName.trim()) {
      alert('Company / Firm Name is required!');
      return;
    }
    onSaveFirmProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('Reset company / firm details to default sample values?')) {
      setFormData(DEFAULT_FIRM_PROFILE);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Company & Firm Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update firm name, letterhead header, FRN & statutory invoice credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Firm name and details successfully saved and updated!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Firm Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Company / CA Firm Name <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                placeholder="e.g. M/s. Insaf & Associates"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Subtitle / Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Professional Tagline / Suffix
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Chartered Accountants"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Firm Registration Number (FRN)
              </label>
              <input
                type="text"
                value={formData.frn}
                onChange={(e) => setFormData({ ...formData, frn: e.target.value })}
                placeholder="e.g. 129988W / 001234S"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* GSTIN & Managing Partner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Firm GSTIN
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="e.g. 27AAAAA1234F1Z1"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Managing Partner / Signatory Name
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  placeholder="e.g. CA Rajesh Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Office Address */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Registered Office Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Office suite, building, street, city and pin code"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Firm Google Drive / Cloud Audit Repository Folder */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Firm Master Google Drive / Cloud Storage Folder URL
            </label>
            <div className="relative">
              <ExternalLink className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={formData.driveFolderUrl}
                onChange={(e) => setFormData({ ...formData, driveFolderUrl: e.target.value })}
                placeholder="e.g. https://drive.google.com/drive/folders/1A2B3C... or D:\CA_Audit_Vault"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Root Google Drive folder or local network directory for firm-wide working papers, scans, and audit client files.
            </p>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Office Phone / Mobile
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Firm Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="office@cafirm.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Letterhead & Header Preview:</span>
            <div className="font-bold text-emerald-400 text-sm">
              {formData.firmName || 'Company Name'}
            </div>
            <div className="text-[11px] text-slate-400">
              {formData.tagline} • FRN: <span className="font-mono text-slate-200">{formData.frn || 'N/A'}</span> • GSTIN: <span className="font-mono text-slate-200">{formData.gstin || 'N/A'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Reset to Defaults
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Firm Details</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
