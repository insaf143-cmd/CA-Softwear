import React from 'react';
import {
  FileText,
  X,
  Building,
  User,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  ShieldCheck,
  Tag,
  Paperclip,
  Download,
  ExternalLink,
  File,
  Trash2
} from 'lucide-react';

export default function WorkDetailsModal({ work, onClose, onDeleteTask, isManagerOrAdmin }) {
  if (!work) return null;

  const isCompleted = work.status === 'Completed';
  const isSubmitted = work.status === 'Submitted for Approval';
  const isTransferred = work.status === 'Transferred';
  const isInProgress = work.status === 'In Progress';
  const isAllocated = work.status === 'Allocated' || work.status === 'Pending' || work.status === 'To Do';

  const allEvidenceFiles = [
    ...(work.evidenceFiles || []),
    ...(work.submissionDetails?.evidenceFiles || [])
  ];

  const cloudLink =
    work.cloudDriveLink ||
    work.submissionDetails?.cloudDriveLink ||
    work.submissionDetails?.evidenceLink;

  const handleDownloadFile = (fileObj) => {
    if (!fileObj.dataUrl) {
      alert('File content not available for download.');
      return;
    }
    const link = document.createElement('a');
    link.href = fileObj.dataUrl;
    link.download = fileObj.name || 'evidence-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs text-cyan-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {work.jobNumber ? `Job #${work.jobNumber}` : work.id}
              </span>
              {work.serviceLine && (
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {work.serviceLine}
                </span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : isSubmitted
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : isTransferred
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : isInProgress
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {work.status}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                {work.department}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{work.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lifecycle Stepper */}
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Allocated</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${!isAllocated ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`flex items-center gap-1.5 ${!isAllocated ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>2. In Progress</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${isSubmitted || isCompleted || isTransferred ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`flex items-center gap-1.5 ${isSubmitted || isCompleted || isTransferred ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>3. Manager Review</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`flex items-center gap-1.5 ${isCompleted ? 'text-emerald-400' : isTransferred ? 'text-amber-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isTransferred ? 'Transferred' : '4. Completed'}</span>
            </div>
          </div>
        </div>

        {/* Client & Statutory Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Client</span>
            <div className="font-bold text-slate-200 truncate">{work.clientName}</div>
            <div className="font-mono text-[10px] text-emerald-400">{work.clientPan || 'N/A'}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Assigned User</span>
            <div className="font-bold text-slate-200 truncate">{work.assignedToName || work.assignedTo}</div>
            <div className="text-[10px] text-slate-400">Allocated by: {work.allocatedBy || 'Admin'}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Target Finishing Date</span>
            <div className="font-mono font-bold text-amber-300">{work.finishingDate || work.dueDate}</div>
            <div className="text-[10px] text-slate-400">Allocated: {work.allocatedDate || 'Recent'}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Statutory Form / FY</span>
            <div className="font-bold text-slate-200">{work.statutorySection || work.category || 'Compliance'}</div>
            <div className="font-mono text-[10px] text-slate-400">FY: {work.fy || '2025-26'}</div>
          </div>
        </div>

        {/* Detailed Work Scope */}
        <div className="space-y-1.5 text-xs">
          <span className="font-bold text-slate-300">Detailed Scope & Instructions:</span>
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 leading-relaxed">
            {work.workDetails || work.description || 'Standard verification required.'}
          </div>
        </div>

        {/* User Completion Remarks (if submitted) */}
        {work.submissionDetails && (
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Staff Completion Remarks (Submitted {work.submissionDetails.submittedAt}):
            </span>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 italic leading-relaxed">
              "{work.submissionDetails.completionRemarks}"
            </div>
          </div>
        )}

        {/* Manager Approval Notes (if completed) */}
        {work.approvalDetails && (
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Manager Approval Sign-Off ({work.approvalDetails.approvedAt} by {work.approvalDetails.approvedBy}):
            </span>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 italic leading-relaxed">
              "{work.approvalDetails.approvalRemarks}"
            </div>
          </div>
        )}

        {/* Attached Evidence Files & Documents */}
        {(allEvidenceFiles.length > 0 || cloudLink) && (
          <div className="space-y-2 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4" /> Attached Evidence Documents & Working Papers ({allEvidenceFiles.length}):
            </span>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              {allEvidenceFiles.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {allEvidenceFiles.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <File className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-slate-200 font-medium truncate max-w-[220px]" title={f.name}>
                          {f.name}
                        </span>
                        {f.size && <span className="text-[10px] text-slate-400 font-mono">({f.size})</span>}
                        {f.uploadedBy && (
                          <span className="text-[10px] text-slate-500">by {f.uploadedBy}</span>
                        )}
                      </div>
                      {f.dataUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(f)}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-[11px] flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {cloudLink && (
                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cloud Drive Storage:</span>
                  <a
                    href={cloudLink.startsWith('http') ? cloudLink : `https://${cloudLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline font-medium truncate max-w-xs"
                  >
                    <span>Open Drive Link</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Department Transfer History Timeline */}
        {work.transferHistory && work.transferHistory.length > 0 && (
          <div className="space-y-2 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Department Transfer Audit Trail ({work.transferHistory.length} transfers):
            </span>
            <div className="space-y-2">
              {work.transferHistory.map((tr, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-amber-200">
                    <span className="flex items-center gap-1">
                      <span>{tr.fromDepartment}</span> &rarr; <span className="text-white">{tr.toDepartment}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{tr.transferDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Transferred from <strong>{tr.fromUser}</strong> to <strong>{tr.toUser}</strong> by Manager <strong>{tr.managerName}</strong>
                  </div>
                  <div className="text-[11px] text-amber-300/90 italic">
                    Reason: "{tr.reason}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-800">
          <div>
            {isManagerOrAdmin && onDeleteTask && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteTask(work.id, work.title);
                }}
                className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                title="Delete this task permanently"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Task</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
