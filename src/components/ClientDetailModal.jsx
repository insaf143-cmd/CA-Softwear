import React, { useState } from 'react';
import {
  X,
  Building2,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  CreditCard,
  UserCheck,
  FileText,
  Lock,
  Phone,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';

export default function ClientDetailModal({ client, onClose }) {
  const [showPass, setShowPass] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  if (!client) return null;

  const toggleShowPass = (field) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{client.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {client.constitution}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Category: <strong>{client.category}</strong></span> • 
                <span>Turnover: <strong>{client.turnover}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Basic Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500">PAN Number</span>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                {client.pan}
                <button onClick={() => handleCopy(client.pan, 'pan')} className="text-slate-400 hover:text-slate-200">
                  {copiedKey === 'pan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500">GSTIN</span>
              <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5 flex items-center gap-1.5">
                {client.gstin}
                <button onClick={() => handleCopy(client.gstin, 'gstin')} className="text-slate-400 hover:text-slate-200">
                  {copiedKey === 'gstin' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500">TAN Number</span>
              <div className="text-sm font-mono font-semibold text-slate-200 mt-0.5">
                {client.tan || 'N/A'}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500">CIN / LLPIN</span>
              <div className="text-xs font-mono text-slate-300 mt-0.5 truncate">
                {client.cin || 'N/A'}
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Contact Details
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Authorized Contact:</span>
                  <span className="font-semibold text-slate-200">{client.authorizedPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Phone:</span>
                  <span className="font-semibold text-slate-200">{client.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="font-semibold text-slate-200">{client.email}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Registered Address & Bank
              </h4>
              <div className="text-xs space-y-1.5">
                <p className="text-slate-300">{client.address}</p>
                {client.bankDetails && (
                  <div className="pt-2 border-t border-slate-700/60 font-mono text-[11px] text-slate-400">
                    Bank: <strong className="text-slate-200">{client.bankDetails.bank}</strong> | A/C: <strong className="text-slate-200">{client.bankDetails.acNo}</strong> | IFSC: <strong className="text-slate-200">{client.bankDetails.ifsc}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Portal Passwords Vault */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 space-y-3">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Government Portals Credentials Locker
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* GST Portal Creds */}
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70">
                <div className="text-[11px] font-bold text-slate-400 uppercase">GST Portal Login</div>
                <div className="text-xs font-mono font-semibold text-slate-200 mt-1">
                  User: {client.portalCredentials?.gstUser || 'N/A'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono mt-1 pt-1 border-t border-slate-700/50">
                  <span className="text-slate-400">
                    Pass: {showPass.gst ? client.portalCredentials?.gstPass : '••••••••'}
                  </span>
                  <button
                    onClick={() => toggleShowPass('gst')}
                    className="text-slate-400 hover:text-amber-400"
                  >
                    {showPass.gst ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Income Tax Portal Creds */}
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Income Tax e-Filing</div>
                <div className="text-xs font-mono font-semibold text-slate-200 mt-1">
                  User: {client.portalCredentials?.itUser || 'N/A'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono mt-1 pt-1 border-t border-slate-700/50">
                  <span className="text-slate-400">
                    Pass: {showPass.it ? client.portalCredentials?.itPass : '••••••••'}
                  </span>
                  <button
                    onClick={() => toggleShowPass('it')}
                    className="text-slate-400 hover:text-amber-400"
                  >
                    {showPass.it ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* MCA Portal Creds */}
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70">
                <div className="text-[11px] font-bold text-slate-400 uppercase">MCA V3 / TRACES</div>
                <div className="text-xs font-mono font-semibold text-slate-200 mt-1">
                  User: {client.portalCredentials?.mcaUser || 'N/A'}
                </div>
                <div className="flex items-center justify-between text-xs font-mono mt-1 pt-1 border-t border-slate-700/50">
                  <span className="text-slate-400">
                    Pass: {showPass.mca ? (client.portalCredentials?.mcaPass || 'N/A') : '••••••••'}
                  </span>
                  {client.portalCredentials?.mcaPass && (
                    <button
                      onClick={() => toggleShowPass('mca')}
                      className="text-slate-400 hover:text-amber-400"
                    >
                      {showPass.mca ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Directors / Partners */}
          {client.directors && client.directors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Directors & Designated Partners ({client.directors.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {client.directors.map((dir, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                    <div className="font-bold text-slate-100">{dir.name}</div>
                    <div className="text-slate-400 mt-0.5">DIN: <span className="font-mono text-slate-200">{dir.din}</span></div>
                    <div className="text-slate-400">PAN: <span className="font-mono text-emerald-400">{dir.pan}</span> | Mobile: {dir.mobile}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
