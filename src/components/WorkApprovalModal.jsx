import React, { useState, useEffect } from 'react';
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
  File,
  Receipt,
  TrendingUp,
  FileCheck2,
  Check,
  Clock
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
    'Reviewed work papers, calculations, and reconciliations. Found in order and approved for partner sign-off.'
  );

  // Transfer Form State
  const [nextDepartment, setNextDepartment] = useState('Statutory & Tax Audit');
  const [nextAssignee, setNextAssignee] = useState(staff[2]?.id || staff[0]?.id || '');
  const [transferReason, setTransferReason] = useState('');
  const [newFinishingDate, setNewFinishingDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );

  // Detect service line / department
  const initialServiceType = (() => {
    if (work.submissionDetails?.complianceData?.serviceType) {
      return work.submissionDetails.complianceData.serviceType;
    }
    const text = `${work.serviceLine || ''} ${work.department || ''} ${work.title || ''}`.toLowerCase();
    if (text.includes('gst') || text.includes('indirect tax')) return 'GST';
    if (text.includes('income tax') || text.includes('itr') || text.includes('direct tax') || text.includes('3cd') || text.includes('tds')) return 'IT';
    if (text.includes('roc') || text.includes('mca') || text.includes('corporate') || text.includes('aoc') || text.includes('mgt')) return 'ROC';
    return 'None';
  })();

  const [selectedService, setSelectedService] = useState(initialServiceType);

  // GST Compliance Data State for Final Approval
  const subGst = work.submissionDetails?.complianceData?.serviceType === 'GST' ? work.submissionDetails.complianceData : {};
  const [gstData, setGstData] = useState({
    type: subGst.type || 'GSTR-3B',
    period: subGst.period || 'October 2026',
    dueDate: subGst.dueDate || work.dueDate || work.finishingDate || '2026-11-20',
    turnover: subGst.turnover ?? '',
    salesTax: subGst.salesTax ?? '',
    itcAvailable: subGst.itcAvailable ?? '',
    netLiability: subGst.netLiability ?? '',
    arn: subGst.arn || '',
    status: 'Filed' // Default to Filed upon manager sign-off
  });

  // Auto-calculate Net GST Liability when Sales Tax or ITC changes
  useEffect(() => {
    if (gstData.salesTax !== '' || gstData.itcAvailable !== '') {
      const sales = Number(gstData.salesTax) || 0;
      const itc = Number(gstData.itcAvailable) || 0;
      const calculatedNet = Math.max(0, sales - itc);
      setGstData(prev => ({ ...prev, netLiability: calculatedNet }));
    }
  }, [gstData.salesTax, gstData.itcAvailable]);

  // Income Tax Compliance Data State for Final Approval
  const subIt = work.submissionDetails?.complianceData?.serviceType === 'IT' ? work.submissionDetails.complianceData : {};
  const [itData, setItData] = useState({
    formType: subIt.formType || 'ITR-3',
    ay: subIt.ay || 'AY 2026-27',
    dueDate: subIt.dueDate || work.dueDate || work.finishingDate || '2026-10-31',
    taxableIncome: subIt.taxableIncome ?? '',
    taxDue: subIt.taxDue ?? '',
    ackNo: subIt.ackNo || '',
    taxAuditRequired: subIt.taxAuditRequired ?? false,
    status: 'Filed' // Default to Filed upon manager sign-off
  });

  // ROC & MCA Compliance Data State for Final Approval
  const subRoc = work.submissionDetails?.complianceData?.serviceType === 'ROC' ? work.submissionDetails.complianceData : {};
  const [rocData, setRocData] = useState({
    formName: subRoc.formName || 'AOC-4',
    category: subRoc.category || 'Annual ROC Filing',
    dueDate: subRoc.dueDate || work.dueDate || work.finishingDate || '2026-10-30',
    srn: subRoc.srn || '',
    notes: subRoc.notes || '',
    status: 'Completed' // Default to Completed upon manager sign-off
  });

  const handleApprove = (e) => {
    e.preventDefault();

    let complianceData = null;
    if (selectedService === 'GST') {
      complianceData = {
        serviceType: 'GST',
        clientId: work.clientId,
        clientName: work.clientName,
        gstin: work.clientGstin || 'N/A',
        type: gstData.type,
        period: gstData.period,
        dueDate: gstData.dueDate,
        turnover: Number(gstData.turnover) || 0,
        salesTax: Number(gstData.salesTax) || 0,
        itcAvailable: Number(gstData.itcAvailable) || 0,
        netLiability: Number(gstData.netLiability) || 0,
        arn: gstData.arn.trim(),
        status: gstData.status,
        taskId: work.id
      };
    } else if (selectedService === 'IT') {
      complianceData = {
        serviceType: 'IT',
        clientId: work.clientId,
        clientName: work.clientName,
        pan: work.clientPan || 'N/A',
        formType: itData.formType,
        ay: itData.ay,
        dueDate: itData.dueDate,
        taxableIncome: Number(itData.taxableIncome) || 0,
        taxDue: Number(itData.taxDue) || 0,
        ackNo: itData.ackNo.trim(),
        taxAuditRequired: itData.taxAuditRequired,
        assignedTo: work.assignedToName || currentUser.name,
        status: itData.status,
        taskId: work.id
      };
    } else if (selectedService === 'ROC') {
      complianceData = {
        serviceType: 'ROC',
        clientId: work.clientId,
        clientName: work.clientName,
        formName: rocData.formName,
        category: rocData.category,
        dueDate: rocData.dueDate,
        assignedTo: work.assignedToName || currentUser.name,
        srn: rocData.srn.trim(),
        notes: rocData.notes.trim() || approvalRemarks.trim(),
        status: rocData.status,
        taskId: work.id
      };
    }

    const approvalData = {
      approvedAt: new Date().toISOString().split('T')[0],
      approvedBy: `${currentUser.name} (${currentUser.role})`,
      approvalRemarks: approvalRemarks.trim(),
      complianceData
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
                Audit submitted work, verify compliance figures (Turnover/ITC/Liabilities), and sign off.
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
                {work.clientGstin && <span> • GSTIN: <span className="font-mono text-cyan-400">{work.clientGstin}</span></span>}
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
              Article Assistant / Staff Completion Remarks:
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
            {/* COMPLIANCE SERVICE SELECTION & FIGURES VERIFICATION */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/50 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <label className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Verify Compliance Filing Details & Output Report</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-medium">Auto-syncs to GST / IT / ROC Registers</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { id: 'GST', label: 'GST Return' },
                  { id: 'IT', label: 'Income Tax (ITR)' },
                  { id: 'ROC', label: 'ROC / MCA' },
                  { id: 'None', label: 'No Statutory Filing' }
                ].map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedService(srv.id)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition font-bold text-[11px] ${
                      selectedService === srv.id
                        ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{srv.label}</span>
                  </button>
                ))}
              </div>

              {/* GST FINAL CONFIRMATION */}
              {selectedService === 'GST' && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> GST Turnover, ITC & Final Liability
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">GSTIN: {work.clientGstin || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Return Type</label>
                      <select
                        value={gstData.type}
                        onChange={(e) => setGstData({ ...gstData, type: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      >
                        <option value="GSTR-3B">GSTR-3B</option>
                        <option value="GSTR-1">GSTR-1</option>
                        <option value="CMP-08">CMP-08</option>
                        <option value="GSTR-9">GSTR-9</option>
                        <option value="GSTR-9C">GSTR-9C</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Period</label>
                      <input
                        type="text"
                        value={gstData.period}
                        onChange={(e) => setGstData({ ...gstData, period: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Due Date</label>
                      <input
                        type="date"
                        value={gstData.dueDate}
                        onChange={(e) => setGstData({ ...gstData, dueDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Turnover (₹)</label>
                      <input
                        type="number"
                        value={gstData.turnover}
                        onChange={(e) => setGstData({ ...gstData, turnover: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Output Tax (₹)</label>
                      <input
                        type="number"
                        value={gstData.salesTax}
                        onChange={(e) => setGstData({ ...gstData, salesTax: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">GST Input ITC (₹)</label>
                      <input
                        type="number"
                        value={gstData.itcAvailable}
                        onChange={(e) => setGstData({ ...gstData, itcAvailable: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-300 text-[10px] font-bold mb-0.5">Net Liability (₹)</label>
                      <input
                        type="number"
                        value={gstData.netLiability}
                        onChange={(e) => setGstData({ ...gstData, netLiability: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-amber-500/60 rounded-lg text-amber-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">ARN / Ack Number</label>
                      <input
                        type="text"
                        value={gstData.arn}
                        onChange={(e) => setGstData({ ...gstData, arn: e.target.value })}
                        placeholder="e.g. AA271026001234V"
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Final Register Status</label>
                      <select
                        value={gstData.status}
                        onChange={(e) => setGstData({ ...gstData, status: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold"
                      >
                        <option value="Filed">Filed (Signed Off)</option>
                        <option value="Client Approved">Client Approved</option>
                        <option value="Draft Prepared">Draft Prepared</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* INCOME TAX FINAL CONFIRMATION */}
              {selectedService === 'IT' && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-blue-300 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" /> Income Tax & ITR Figures
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">PAN: {work.clientPan || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Form / Return</label>
                      <select
                        value={itData.formType}
                        onChange={(e) => setItData({ ...itData, formType: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      >
                        <option value="ITR-1">ITR-1 (Sahaj)</option>
                        <option value="ITR-2">ITR-2</option>
                        <option value="ITR-3">ITR-3 (Business)</option>
                        <option value="ITR-4">ITR-4 (Sugam)</option>
                        <option value="ITR-5">ITR-5 (LLP/Firm)</option>
                        <option value="ITR-6">ITR-6 (Company)</option>
                        <option value="Form 3CD">Form 3CD (Tax Audit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">AY</label>
                      <input
                        type="text"
                        value={itData.ay}
                        onChange={(e) => setItData({ ...itData, ay: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Due Date</label>
                      <input
                        type="date"
                        value={itData.dueDate}
                        onChange={(e) => setItData({ ...itData, dueDate: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Taxable Income (₹)</label>
                      <input
                        type="number"
                        value={itData.taxableIncome}
                        onChange={(e) => setItData({ ...itData, taxableIncome: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Tax Payable / Refund (₹)</label>
                      <input
                        type="number"
                        value={itData.taxDue}
                        onChange={(e) => setItData({ ...itData, taxDue: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Ack / Token No</label>
                      <input
                        type="text"
                        value={itData.ackNo}
                        onChange={(e) => setItData({ ...itData, ackNo: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                      <input
                        type="checkbox"
                        checked={itData.taxAuditRequired}
                        onChange={(e) => setItData({ ...itData, taxAuditRequired: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-800 border-slate-700"
                      />
                      <span>Tax Audit (44AB)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">Status:</span>
                      <select
                        value={itData.status}
                        onChange={(e) => setItData({ ...itData, status: e.target.value })}
                        className="px-2 py-1 bg-slate-800 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold"
                      >
                        <option value="Filed">Filed (Completed)</option>
                        <option value="In Audit">In Audit</option>
                        <option value="Client Approved">Client Approved</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ROC FINAL CONFIRMATION */}
              {selectedService === 'ROC' && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Form Name</label>
                      <input
                        type="text"
                        value={rocData.formName}
                        onChange={(e) => setRocData({ ...rocData, formName: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">SRN / Challan</label>
                      <input
                        type="text"
                        value={rocData.srn}
                        onChange={(e) => setRocData({ ...rocData, srn: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Filing Status</label>
                      <select
                        value={rocData.status}
                        onChange={(e) => setRocData({ ...rocData, status: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold"
                      >
                        <option value="Completed">Completed / Filed</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Manager Approval Sign-Off Remarks <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows="2"
                required
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Manager audit notes, verification comments, partner authorization..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Work will be marked as <strong>COMPLETED</strong> and figures auto-updated in the corresponding <strong>Compliance Register</strong> for audit review.
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
                  <option value="Statutory & Tax Audit">Statutory & Tax Audit</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="GST Compliance">GST Compliance</option>
                  <option value="ROC & Corporate Laws">ROC & Corporate Laws</option>
                  <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
                  <option value="TDS & Payroll">TDS & Payroll</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign to Staff Member</label>
                <select
                  value={nextAssignee}
                  onChange={(e) => setNextAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation || s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Finishing Target</label>
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
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-950/50 flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Confirm Department Transfer</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
