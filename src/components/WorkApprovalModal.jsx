import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRightLeft,
  X,
  FileCheck,
  User,
  Building,
  Calendar,
  AlertTriangle,
  History,
  ShieldAlert,
  Send,
  Paperclip,
  Download,
  ExternalLink,
  File
} from 'lucide-react';

export default function WorkApprovalModal({
  work,
  onClose,
  onApproveWork,
  onTransferWork,
  staff,
  currentUser
}) {
  const [activeAction, setActiveAction] = useState('approve'); // 'approve' | 'transfer'

  const handleDownloadFile = (f) => {
    const a = document.createElement('a');
    a.href = f.dataUrl;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Approval Form State
  const [approvalRemarks, setApprovalRemarks] = useState(
    'Reviewed work papers and reconciliations. Found in order and approved for partner sign-off.'
  );

  // Transfer Form State
  const [nextDepartment, setNextDepartment] = useState('Statutory & Tax Audit');
  const [nextAssignee, setNextAssignee] = useState(staff[2]?.id || staff[0]?.id || '');
  const [transferReason, setTransferReason] = useState('');
  const [newFinishingDate, setNewFinishingDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );

  const handleApprove = (e) => {
    e.preventDefault();
    const approvalData = {
      approvedAt: new Date().toISOString().split('T')[0],
      approvedBy: `${currentUser.name} (${currentUser.role})`,
      approvalRemarks: approvalRemarks.trim()
    };
    onApproveWork(work.id, approvalData);
    onClose();
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferReason.trim()) {
      alert('Please specify why this work is not approved and the reason for department transfer.');
      return;
    }

    const targetUser = staff.find((s) => s.id === nextAssignee) || { name: 'New Staff Member' };

    const transferData = {
      nextDepartment,
      nextAssigneeId: nextAssignee,
      nextAssigneeName: targetUser.name,
      newFinishingDate,
      transferRecord: {
        transferDate: new Date().toISOString().split('T')[0],
        fromDepartment: work.department,
        toDepartment: nextDepartment,
        fromUser: work.assignedToName || work.assignedTo,
        toUser: targetUser.name,
        managerName: currentUser.name,
        reason: transferReason.trim()
      }
    };

    onTransferWork(work.id, transferData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Manager Review & Approval Decision
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit submitted work. Approve as Completed OR Transfer to next department for further verification.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Work Overview Card */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-slate-100 text-sm">{work.title}</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Client: <strong className="text-slate-200">{work.clientName}</strong> • PAN: <span className="font-mono text-emerald-400">{work.clientPan || 'N/A'}</span>
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded font-bold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
              {work.department}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-[11px]">
            <div>
              <span className="text-slate-500">Submitted By:</span>
              <div className="text-slate-200 font-semibold">{work.submissionDetails?.submittedBy || work.assignedToName}</div>
            </div>
            <div>
              <span className="text-slate-500">Submission Date:</span>
              <div className="text-amber-300 font-mono font-semibold">{work.submissionDetails?.submittedAt || 'Today'}</div>
            </div>
            <div>
              <span className="text-slate-500">Finishing Target:</span>
              <div className="text-slate-200 font-mono">{work.finishingDate || work.dueDate}</div>
            </div>
          </div>

          {/* User Completion Remarks Box */}
          <div className="mt-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200">
            <span className="font-bold text-purple-300 block mb-1">
              Article Assistant / User Completion Remarks:
            </span>
            <p className="text-xs leading-relaxed italic">
              "{work.submissionDetails?.completionRemarks || work.notes || 'Work completed per instructions and submitted for sign-off.'}"
            </p>
          </div>

          {/* Attached Evidence Files */}
          {((work.submissionDetails?.evidenceFiles?.length || 0) + (work.evidenceFiles?.length || 0) > 0 ||
            work.submissionDetails?.cloudDriveLink ||
            work.cloudDriveLink) && (
            <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" /> Attached Evidence Documents & Working Papers:
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {[...(work.evidenceFiles || []), ...(work.submissionDetails?.evidenceFiles || [])].map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 font-medium truncate max-w-[200px]" title={f.name}>
                        {f.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({f.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(f)}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>

              {(work.submissionDetails?.cloudDriveLink || work.cloudDriveLink) && (
                <div className="pt-1 border-t border-slate-800">
                  <a
                    href={work.submissionDetails?.cloudDriveLink || work.cloudDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Open Working Papers Cloud Drive Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Previous Transfer History (if any) */}
          {work.transferHistory && work.transferHistory.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Department Transfer History ({work.transferHistory.length} previous transfers):
              </span>
              {work.transferHistory.map((tr, idx) => (
                <div key={idx} className="pl-4 border-l border-amber-500/40 text-[10px] text-slate-300">
                  <span>{tr.transferDate}: {tr.fromDepartment} &rarr; {tr.toDepartment} (By {tr.managerName}). Reason: {tr.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Choice Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-800 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveAction('approve')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeAction === 'approve'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>1. Approve Work (Mark Completed)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('transfer')}
            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeAction === 'transfer'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-300" />
            <span>2. Not Approved &rarr; Transfer Department</span>
          </button>
        </div>

        {/* Action Form 1: Approve as Completed */}
        {activeAction === 'approve' && (
          <form onSubmit={handleApprove} className="space-y-4 text-xs animate-fade-in">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Manager Approval Sign-Off Remarks <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows="3"
                required
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Manager audit notes, verification comments, partner authorization..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Work will be marked as <strong>COMPLETED</strong> with approval timestamp ({new Date().toISOString().split('T')[0]}) and recorded in firm performance reports.
              </span>
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Mark Completed</span>
              </button>
            </div>
          </form>
        )}

        {/* Action Form 2: Not Approved -> Transfer Department */}
        {activeAction === 'transfer' && (
          <form onSubmit={handleTransfer} className="space-y-4 text-xs animate-fade-in">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Not Approved:</strong> Transfer this assignment to the next department or specialist for further verification until fully signed off and marked completed.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reason for Non-Approval & Department Transfer Instructions <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows="3"
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Explain why work was not approved and what the next department needs to do: e.g. GST turnover does not reconcile with P&L ledgers. Transferring to Statutory Audit department for voucher verification..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transfer to Next Department</label>
                <select
                  value={nextDepartment}
                  onChange={(e) => setNextDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                >
                  <option value="Statutory & Tax Audit">Statutory & Tax Audit (3CD)</option>
                  <option value="Income Tax">Income Tax & Direct Tax</option>
                  <option value="GST Compliance">GST Compliance</option>
                  <option value="ROC & Corporate Laws">ROC & Corporate Laws (MCA)</option>
                  <option value="TDS & Payroll">TDS & Payroll Withholding</option>
                  <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Next Assignee Staff</label>
                <select
                  value={nextAssignee}
                  onChange={(e) => setNextAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role === 'NORMAL_USER' ? s.designation : s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Finishing Date</label>
                <input
                  type="date"
                  required
                  value={newFinishingDate}
                  onChange={(e) => setNewFinishingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                />
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white font-bold shadow-lg shadow-amber-950/50 flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transfer to Next Department</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
