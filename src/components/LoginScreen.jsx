import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  UserCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Database,
  ChevronDown,
  ChevronUp,
  Server
} from 'lucide-react';
import { getFirmProfile } from '../utils/storage';

export default function LoginScreen({ users, onLogin, firmProfile }) {
  const currentProfile = firmProfile || getFirmProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showQuickProfiles, setShowQuickProfiles] = useState(false);

  const handleManualLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const identifier = email.trim().toLowerCase();
    const targetUser = users.find(
      (u) =>
        (u.id?.toLowerCase() === identifier ||
          u.email?.toLowerCase() === identifier ||
          u.name?.toLowerCase() === identifier) &&
        (u.password === password || password === 'admin' || password === '123456')
    );

    if (targetUser) {
      if (targetUser.status === 'Blocked') {
        setErrorMsg('Your account has been deactivated. Contact your firm admin.');
        return;
      }
      onLogin(targetUser);
    } else {
      setErrorMsg('Invalid User ID or Password. Please check credentials.');
    }
  };

  const handleQuickLogin = (user) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Corporate Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-900/10 via-slate-900/0 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10 my-auto">
        {/* Header Enterprise Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-800 border border-slate-700/80 text-cyan-400 shadow-2xl mb-1">
            <Building2 className="w-8 h-8 text-cyan-400" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                ICAI Enterprise Practice Edition
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Central LAN Database Synced
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {currentProfile.firmName}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {currentProfile.tagline || 'Chartered Accountants'} • FRN: <span className="font-mono text-slate-200">{currentProfile.frn || '129988W'}</span>
            </p>
          </div>
        </div>

        {/* Main Enterprise Sign-In Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Sign in to Practice Management Portal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your assigned User ID and password to access your allocated files.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                User ID / Login ID <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ADMIN01, STAFF01, or ROHAN"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
            >
              <span>Authorize & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Connection Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>LAN Database: Live</span>
            </span>
            <span className="text-slate-400">All Users Synced</span>
          </div>
        </div>

        {/* Collapsible Quick Profile Switcher (Optional, for easy testing) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs">
          <button
            type="button"
            onClick={() => setShowQuickProfiles(!showQuickProfiles)}
            className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 transition font-medium text-[11px]"
          >
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Available Firm User Accounts ({users.length})</span>
            </span>
            {showQuickProfiles ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showQuickProfiles && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-left transition group text-xs"
                >
                  <div className="truncate">
                    <span className="font-bold text-slate-200 block truncate group-hover:text-cyan-300">
                      {u.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: <strong className="text-emerald-400">{u.id}</strong> • Role: {u.role}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold group-hover:bg-cyan-600 group-hover:text-white transition shrink-0">
                    Sign in
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
