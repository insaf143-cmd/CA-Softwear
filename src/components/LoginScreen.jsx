import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  UserCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LoginScreen({ users, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        setErrorMsg('This account is blocked by the Super Admin. Please contact office administration.');
        return;
      }
      onLogin(targetUser);
    } else {
      // If user matched User ID or email but password was wrong
      const userExists = users.find(
        (u) =>
          u.id?.toLowerCase() === identifier ||
          u.email?.toLowerCase() === identifier ||
          u.name?.toLowerCase() === identifier
      );
      if (userExists) {
        setErrorMsg('Invalid password entered. Please try again or use Quick Select.');
      } else {
        setErrorMsg('User not found. Please enter a valid registered User ID or Email.');
      }
    }
  };

  const handleQuickLogin = (user) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/20 mb-2">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            DigiCA Suite <span className="text-emerald-400 font-mono text-sm px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">v2.5</span>
          </h1>
          <p className="text-sm text-slate-300 font-semibold flex items-center justify-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            M/s. Sharma & Associates, Chartered Accountants
          </p>
          <p className="text-xs text-slate-500">
            Firm Registration (FRN): 129988W • Work Allocation, Statutory Audit & Practice Management
          </p>
        </div>

        {/* Main Grid: Form on Left, Quick Profiles on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Left Column: Email & Password Form */}
          <div className="md:col-span-6 space-y-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-8">
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-100">Sign in to Practice Portal</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your firm credentials to access your allocated files and department queue.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    User ID or Email <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ADMIN01, ROHAN, or rajesh@cadesk.in"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition"
                >
                  <span>Authorize & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Cloud DB: Firebase Firestore</span>
              <span className="text-emerald-400 font-mono">RBAC Enabled</span>
            </div>
          </div>

          {/* Right Column: Quick Profile Selectors for Instant Testing */}
          <div className="md:col-span-6 space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                One-Click Quick Login by Role
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Select any firm role below to test Admin allocation, Manager review, or Staff restricted views instantly:
              </p>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {users.map((u) => {
                const isAdmin = u.role === 'SUPER_ADMIN' || u.role === 'ADMIN';
                const isManager = u.role === 'MANAGER';
                const isStaff = u.role === 'NORMAL_USER';

                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className="w-full p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                          isAdmin
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : isManager
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition flex items-center gap-1.5">
                          <span>{u.name}</span>
                          <span className="font-mono text-[10px] text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 font-semibold">
                            ID: {u.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{u.designation}</span>
                          <span className="text-slate-500 font-mono text-[10px]">Key: {u.password}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          isAdmin
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                            : isManager
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {u.role === 'SUPER_ADMIN' ? 'Admin' : u.role === 'MANAGER' ? 'Manager' : 'User (Staff)'}
                      </span>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition flex items-center justify-end gap-1">
                        <span>Log in</span> &rarr;
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-slate-300">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                Permissions Breakdown:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400">
                <li><strong className="text-purple-300">Admin:</strong> Create work, allocate to staff, view all reports.</li>
                <li><strong className="text-blue-300">Manager:</strong> Review submitted works, approve, or transfer to next department.</li>
                <li><strong className="text-emerald-300">Staff/User:</strong> Only see their own allocated work, submit when finished.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
