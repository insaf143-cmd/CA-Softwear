import React, { useState } from 'react';
import { Send, X, CheckCircle2, FileText, Calendar, User, AlertCircle } from 'lucide-react';

export default function WorkSubmitModal({ work, onClose, onSubmitWork, currentUser }) {
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [workingPaperNotes, setWorkingPaperNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!completionRemarks.trim()) {
      alert('Please enter your completion remarks for the Manager to review.');
      return;
    }

    const submissionData = {
      submittedAt: completionDate,
      submittedBy: currentUser.name,
      submittedById: currentUser.id,
      completionRemarks: completionRemarks.trim(),
      workingPaperNotes: workingPaperNotes.trim()
    };

    onSubmitWork(work.id, submissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 md:p-8 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Submit Work for Manager Approval
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Handover completed assignment to Audit/Tax Manager for review and sign-off.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Work Summary Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">{work.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {work.department}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Client: <strong className="text-slate-300">{work.clientName}</strong></span>
            <span>Target Date: <strong className="text-amber-300">{work.finishingDate || work.dueDate}</strong></span>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Work Completion Remarks & Summary <span className="text-purple-400">*</span>
            </label>
            <textarea
              rows="4"
              required
              value={completionRemarks}
              onChange={(e) => setCompletionRemarks(e.target.value)}
              placeholder="Detail what was completed: e.g. Reconciled purchase register with 2B, drafted 3CD clauses 1 to 32, matched 26AS with computation, prepared challan..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Completion Date</label>
              <input
                type="date"
                required
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Submitted By</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-slate-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Working Papers / File References (Optional)
            </label>
            <input
              type="text"
              value={workingPaperNotes}
              onChange={(e) => setWorkingPaperNotes(e.target.value)}
              placeholder="e.g. Audit Binder Vol-2 / Google Drive Folder #402"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Once submitted, this work will appear in the <strong>Manager's Approval Queue</strong>. If approved, it will be marked Completed. If not approved, the Manager may transfer it to another department.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-950/50 flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
