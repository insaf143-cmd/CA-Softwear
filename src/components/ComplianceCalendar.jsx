import React from 'react';
import { Calendar, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { COMPLIANCE_DEADLINES } from '../data/mockData';

export default function ComplianceCalendar() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            Statutory Compliance Calendar & Due Date Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Built-in Indian statutory due dates for GST, Income Tax ITR, Tax Audit (3CD), TDS deposit, MCA ROC, and Labor Laws.
          </p>
        </div>
      </div>

      {/* Calendar Timeline List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPLIANCE_DEADLINES.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex items-start gap-4"
          >
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 border border-slate-700 shrink-0 min-w-[70px]">
              <span className="text-[10px] font-bold uppercase text-amber-400">
                {new Date(item.date).toLocaleDateString('en-IN', { month: 'short' })}
              </span>
              <span className="text-xl font-extrabold text-white">
                {new Date(item.date).getDate()}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(item.date).getFullYear()}
              </span>
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  item.priority === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  item.priority === 'Urgent' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {item.authority}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
