import React, { useState } from 'react';
import {
  Send,
  X,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Paperclip,
  UploadCloud,
  File,
  Download,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';

export default function WorkSubmitModal({ work, onClose, onSubmitWork, currentUser }) {
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [workingPaperNotes, setWorkingPaperNotes] = useState('');
  const [cloudDriveLink, setCloudDriveLink] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState(work.evidenceFiles || []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      // Limit file size to 8MB for smooth client-side storage
      if (file.size > 8 * 1024 * 1024) {
        alert(`File "${file.name}" is larger than 8MB. Please choose a smaller file or paste a Google Drive link.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileObj = {
          id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: currentUser.name
        };
        setEvidenceFiles((prev) => [...prev, fileObj]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEvidenceFile = (fileId) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDownloadFile = (f) => {
    const a = document.createElement('a');
    a.href = f.dataUrl;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
      workingPaperNotes: workingPaperNotes.trim(),
      cloudDriveLink: cloudDriveLink.trim(),
      evidenceFiles: evidenceFiles
    };

    onSubmitWork(work.id, submissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
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
                Handover completed assignment with working papers & audit evidence proofs.
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
          {/* Remarks */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Work Completion Remarks & Summary <span className="text-purple-400">*</span>
            </label>
            <textarea
              rows="3"
              required
              value={completionRemarks}
              onChange={(e) => setCompletionRemarks(e.target.value)}
              placeholder="Detail what was completed: e.g. Reconciled purchase register with 2B, drafted 3CD clauses 1 to 32, verified 26AS TDS..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
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

          {/* Evidence Upload Section */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/70">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <Paperclip className="w-4 h-4 text-emerald-400" />
                <span>Upload Audit Evidence & Working Papers</span>
              </label>
              <span className="text-[10px] text-slate-400">PDF, Excel, Images, CSV</span>
            </div>

            {/* File Input Box */}
            <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 transition text-center">
              <UploadCloud className="w-6 h-6 text-emerald-400 mb-1" />
              <span className="text-xs text-slate-300 font-semibold">
                Click to browse evidence files (e.g. Bank Statement, 2B, Challan, 3CD Draft)
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Files are attached directly to this report
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.csv,.zip"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* List of Uploaded Evidence Files */}
            {evidenceFiles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-emerald-400 block">
                  Attached Evidence ({evidenceFiles.length} file{evidenceFiles.length > 1 ? 's' : ''}):
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {evidenceFiles.map((f) => (
                    <div
                      key={f.id}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <File className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-200 font-medium truncate max-w-[200px]" title={f.name}>
                          {f.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({f.size})</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(f)}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition"
                          title="Download Evidence"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEvidenceFile(f.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                          title="Remove File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cloud Drive Link */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or Cloud Drive Evidence Link (Google Drive / OneDrive / Dropbox)</span>
            </label>
            <input
              type="url"
              value={cloudDriveLink}
              onChange={(e) => setCloudDriveLink(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              All uploaded evidence files will be visible in the <strong>Reports Module</strong> and to the <strong>Manager</strong> for review and sign-off.
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
              <span>Submit with Evidence</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
