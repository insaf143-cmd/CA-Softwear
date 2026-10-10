import {
  Search,
  Plus,
  Calculator,
  RefreshCw,
  Database,
  ShieldCheck,
  Building2,
  UserCheck,
  ChevronDown,
  LogOut,
  Send,
  GitBranch
} from 'lucide-react';
import { isFirebaseConfigured } from '../config/firebase';

const GitHubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenNewClient,
  onOpenTaxCalc,
  onOpenFirebaseModal,
  onOpenGitHubModal,
  onResetData,
  users,
  currentUser,
  onSwitchUser,
  onLogout,
  activeTab,
  pendingReviewCount = 0
}) {
  const isManagerOrAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER';

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left Title / Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-100 leading-tight flex items-center gap-2">
            DigiCA Suite
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
              CA Practice OS
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
            <Building2 className="w-3 h-3 text-cyan-400" />
            M/s. Sharma & Associates, Chartered Accountants
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Clients, GSTIN, PAN, ITR, Tasks..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action Controls & User Role Switcher */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* GitHub Auto-Connect Pill */}
        <button
          onClick={onOpenGitHubModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          title="Connected GitHub: insaf143-cmd/CA-Softwear"
        >
          <GitHubIcon className="w-3.5 h-3.5 text-white" />
          <span className="hidden xl:inline">GitHub: insaf143-cmd</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Firebase DB Config Button */}
        <button
          onClick={onOpenFirebaseModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isFirebaseConfigured
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Firebase Cloud Database Settings"
        >
          <Database className={`w-3.5 h-3.5 ${isFirebaseConfigured ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="hidden xl:inline">
            {isFirebaseConfigured ? 'Firebase Active' : 'Firebase Sync'}
          </span>
        </button>

        {/* Manager Approvals Alert Pill */}
        {isManagerOrAdmin && pendingReviewCount > 0 && (
          <button
            onClick={() => onSwitchUser && (window.location.hash = '#tasks')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold animate-pulse"
            title={`${pendingReviewCount} works submitted for Manager approval`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{pendingReviewCount} Reviews</span>
          </button>
        )}

        {/* User Role Switcher */}
        <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selected = users.find((u) => u.id === e.target.value);
              if (selected) onSwitchUser(selected);
            }}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs pr-1 max-w-[120px] md:max-w-[150px] truncate"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                {u.name} ({u.role === 'SUPER_ADMIN' ? 'Admin' : u.role === 'MANAGER' ? 'Manager' : 'User'})
              </option>
            ))}
          </select>
        </div>

        {/* Tax Calculator Trigger */}
        <button
          onClick={onOpenTaxCalc}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          title="Income Tax Old vs New Regime Quick Calculator"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Tax Calc</span>
        </button>

        {/* Add Client Button (Only for Admin / Super Admin) */}
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
          <button
            onClick={onOpenNewClient}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client</span>
          </button>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
            title="Log Out & Switch User"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all CA firm data to default sample records?')) {
              onResetData();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition"
          title="Reset Demo Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
