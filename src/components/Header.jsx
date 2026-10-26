import React, { useState } from 'react';
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
  GitBranch,
  Edit3,
  Sun,
  Moon,
  Laptop,
  ExternalLink,
  Copy,
  Check,
  Download,
  Share2
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
  onOpenFirmSettings,
  firmProfile,
  onResetData,
  users,
  currentUser,
  onSwitchUser,
  onLogout,
  activeTab,
  pendingReviewCount = 0,
  isDayMode = false,
  toggleDayMode,
  deferredInstallPrompt = null
}) {
  const [showPermanentLinkModal, setShowPermanentLinkModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const PERMANENT_CLOUD_URL = 'https://ca-softwear-lt6s.vercel.app/';
  const LOCAL_OFFLINE_URL = 'http://localhost:5173/';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(PERMANENT_CLOUD_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInstallPWA = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        alert('TAXBAY App installed successfully to your PC!');
      }
    } else {
      // Trigger download of windows shortcut batch file
      const batContent = `@echo off\r\necho Creating TAXBAY Desktop Shortcut...\r\npowershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%USERPROFILE%\\Desktop\\TAXBAY Suite.lnk');$s.TargetPath='https://ca-softwear-lt6s.vercel.app/';$s.IconLocation='shell32.dll,14';$s.Save()"\r\necho Done! TAXBAY shortcut has been placed on your Desktop.\r\npause`;
      const blob = new Blob([batContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Install_TAXBAY_On_PC.bat';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Downloaded "Install_TAXBAY_On_PC.bat"!\n\nRun this file once or click "Install TAXBAY" in your browser top bar (Address bar install icon) to add TAXBAY directly to your PC desktop.');
    }
  };

  const isManagerOrAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER';

  return (
    <header
      className={`h-16 backdrop-blur-md sticky top-0 z-30 px-3 md:px-6 flex items-center justify-between gap-3 transition-colors duration-200 border-b ${
        isDayMode
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
          : 'bg-slate-900/95 border-slate-800 text-slate-100'
      }`}
    >
      {/* Left Title / TAXBAY Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-900/30 shrink-0 border border-amber-300/40">
          <ShieldCheck className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-black tracking-tight leading-tight flex items-center gap-2">
            <span className={isDayMode ? 'text-blue-900' : 'text-white'}>TAXBAY</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 font-extrabold uppercase tracking-wider">
              Suite
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Live DB
            </span>
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className={`text-xs hidden sm:flex items-center gap-1 font-semibold truncate max-w-[220px] md:max-w-xs ${
              isDayMode ? 'text-slate-600' : 'text-slate-300'
            }`}>
              <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{firmProfile?.firmName || 'M/s. Sharma & Associates'}</span>
              <span className="text-slate-400 font-normal hidden lg:inline">, {firmProfile?.tagline || 'Chartered Accountants'}</span>
            </p>
            {isManagerOrAdmin && onOpenFirmSettings && (
              <button
                type="button"
                onClick={onOpenFirmSettings}
                title="Edit Company / Firm Name & Details"
                className={`p-1 rounded-md transition-colors flex items-center gap-1 text-[11px] ${
                  isDayMode
                    ? 'text-slate-500 hover:text-blue-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xl:inline text-[11px] text-amber-500 font-medium">Edit Firm</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Clients, GSTIN, PAN, ITR, Tasks..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isDayMode
                ? 'bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400'
                : 'bg-slate-800/80 border border-slate-700 text-slate-200 placeholder-slate-400'
            }`}
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

      {/* Action Controls & Utilities */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Day / Night Mode Toggle */}
        <button
          onClick={toggleDayMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
            isDayMode
              ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 shadow-sm'
              : 'bg-blue-950/60 text-blue-300 border-blue-800 hover:bg-blue-900/60'
          }`}
          title={isDayMode ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)'}
        >
          {isDayMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">Day</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-300 fill-blue-300" />
              <span className="hidden sm:inline">Night</span>
            </>
          )}
        </button>

        {/* Permanent Link & PC Install Button */}
        <button
          onClick={() => setShowPermanentLinkModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
            isDayMode
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Open Permanent Link & Install App on PC"
        >
          <Laptop className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Permanent Link</span>
        </button>

        {/* GitHub Auto-Connect Pill */}
        <button
          onClick={onOpenGitHubModal}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isDayMode
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Connected GitHub: insaf143-cmd/CA-Softwear"
        >
          <GitHubIcon className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline">GitHub</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Firebase DB Config Button */}
        <button
          onClick={onOpenFirebaseModal}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isFirebaseConfigured
              ? 'bg-amber-500/15 text-amber-500 border-amber-500/40 hover:bg-amber-500/25'
              : isDayMode
              ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Firebase Cloud Database Settings"
        >
          <Database className={`w-3.5 h-3.5 ${isFirebaseConfigured ? 'text-amber-500' : 'text-slate-400'}`} />
          <span className="hidden 2xl:inline">
            {isFirebaseConfigured ? 'Firebase Active' : 'Firebase Sync'}
          </span>
        </button>

        {/* Manager Approvals Alert Pill */}
        {isManagerOrAdmin && pendingReviewCount > 0 && (
          <button
            onClick={() => onSwitchUser && (window.location.hash = '#tasks')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-bold animate-pulse"
            title={`${pendingReviewCount} works submitted for Manager approval`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{pendingReviewCount} Reviews</span>
          </button>
        )}

        {/* User Role Switcher */}
        <div
          className={`relative flex items-center border rounded-xl px-2 py-1 text-xs ${
            isDayMode
              ? 'bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-slate-800 border-slate-700 text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-500 mr-1.5 shrink-0" />
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selected = users.find((u) => u.id === e.target.value);
              if (selected) onSwitchUser(selected);
            }}
            className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs pr-1 max-w-[110px] md:max-w-[140px] truncate"
          >
            {users.map((u) => (
              <option
                key={u.id}
                value={u.id}
                className={isDayMode ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-200'}
              >
                {u.name} ({u.role === 'SUPER_ADMIN' ? 'Admin' : u.role === 'MANAGER' ? 'Mgr' : 'Staff'})
              </option>
            ))}
          </select>
        </div>

        {/* Tax Calculator Trigger */}
        <button
          onClick={onOpenTaxCalc}
          className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isDayMode
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Income Tax Old vs New Regime Quick Calculator"
        >
          <Calculator className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden md:inline">Tax Calc</span>
        </button>

        {/* Add Client Button (Admin & Manager) */}
        {isManagerOrAdmin && (
          <button
            onClick={onOpenNewClient}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition border border-amber-400/40"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>New Client</span>
          </button>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className={`p-1.5 rounded-xl transition ${
              isDayMode
                ? 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
                : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
            }`}
            title="Log Out & Switch User"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Permanent Link & PC Installation Modal */}
      {showPermanentLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
              isDayMode
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-amber-500 flex items-center justify-center text-white">
                  <Laptop className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black">TAXBAY Permanent Link & PC Installation</h3>
                  <p className="text-xs text-slate-400">Access from anywhere or install as a PC Desktop App</p>
                </div>
              </div>
              <button
                onClick={() => setShowPermanentLinkModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* Cloud Permanent Link */}
              <div
                className={`p-4 rounded-xl border ${
                  isDayMode ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/30 border-blue-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    Permanent Cloud Link (Any Browser / Mobile)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    Active 24/7
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    readOnly
                    value={PERMANENT_CLOUD_URL}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono font-bold select-all ${
                      isDayMode ? 'bg-white border border-slate-300 text-blue-900' : 'bg-slate-800 text-amber-300 border border-slate-700'
                    }`}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shrink-0 shadow-md"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <a
                    href={PERMANENT_CLOUD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 transition shrink-0"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4 font-bold" />
                  </a>
                </div>
              </div>

              {/* Local Offline Network Link */}
              <div
                className={`p-4 rounded-xl border ${
                  isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Localhost / Offline Mode Link
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    Offline
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    readOnly
                    value={LOCAL_OFFLINE_URL}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono select-all ${
                      isDayMode ? 'bg-white border border-slate-300 text-slate-800' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  />
                  <a
                    href={LOCAL_OFFLINE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Local</span>
                  </a>
                </div>
              </div>

              {/* PC Installation Facility */}
              <div
                className={`p-4 rounded-xl border ${
                  isDayMode ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
                }`}
              >
                <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-amber-500" />
                  Direct PC Installation Facility
                </h4>
                <p className={`text-xs mt-1 mb-3 ${isDayMode ? 'text-slate-600' : 'text-slate-300'}`}>
                  Install TAXBAY as a standalone Windows desktop software. You can launch it directly from your Desktop or Taskbar without opening a browser first.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleInstallPWA}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition border border-amber-400/50"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Install TAXBAY App on PC</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Tip: On Chrome or Edge, click the (⊞ Install) icon at the right edge of the address bar to install TAXBAY directly to your Windows start menu and desktop!');
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition ${
                      isDayMode
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Installation Guide
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowPermanentLinkModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
