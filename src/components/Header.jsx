import React from 'react';
import { Search, Plus, Calculator, RefreshCw, Bell, ShieldCheck, UserCheck, Building2 } from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenNewClient,
  onOpenTaxCalc,
  onResetData,
  activeTab
}) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left Title / Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 leading-tight flex items-center gap-2">
            DigiCA Suite
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
              CA Practice OS
            </span>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1">
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

      {/* Action Controls & Utilities */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Tax Calculator Trigger */}
        <button
          onClick={onOpenTaxCalc}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          title="Income Tax Old vs New Regime Quick Calculator"
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span className="hidden lg:inline">Tax Calc</span>
        </button>

        {/* Add Client Button */}
        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </button>

        {/* Today's Date Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{currentDate}</span>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all CA firm data to default sample records?')) {
              onResetData();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
          title="Reset Demo Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
