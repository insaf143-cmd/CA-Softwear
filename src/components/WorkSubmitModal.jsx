import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon,
  Calculator,
  Building,
  Check,
  Percent,
  FileCheck2,
  TrendingUp,
  Receipt
} from 'lucide-react';

export default function WorkSubmitModal({ work, onClose, onSubmitWork, currentUser }) {
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [workingPaperNotes, setWorkingPaperNotes] = useState('');
  const [cloudDriveLink, setCloudDriveLink] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState(work.evidenceFiles || []);

  // Detect service line / department to automatically pick the right compliance tab
  const initialServiceType = (() => {
    const text = `${work.serviceLine || ''} ${work.department || ''} ${work.title || ''}`.toLowerCase();
    if (text.includes('gst') || text.includes('indirect tax')) return 'GST';
    if (text.includes('income tax') || text.includes('itr') || text.includes('direct tax') || text.includes('3cd') || text.includes('tds')) return 'IT';
    if (text.includes('roc') || text.includes('mca') || text.includes('corporate') || text.includes('aoc') || text.includes('mgt')) return 'ROC';
    return 'None';
  })();

  const [selectedService, setSelectedService] = useState(
    work.submissionDetails?.complianceData?.serviceType || initialServiceType
  );

  // GST Compliance Data State
  const [gstData, setGstData] = useState({
    type: work.submissionDetails?.complianceData?.type || 'GSTR-3B',
    period: work.submissionDetails?.complianceData?.period || 'October 2026',
    dueDate: work.submissionDetails?.complianceData?.dueDate || work.dueDate || work.finishingDate || '2026-11-20',
    turnover: work.submissionDetails?.complianceData?.turnover ?? '',
    salesTax: work.submissionDetails?.complianceData?.salesTax ?? '',
    itcAvailable: work.submissionDetails?.complianceData?.itcAvailable ?? '',
    netLiability: work.submissionDetails?.complianceData?.netLiability ?? '',
    arn: work.submissionDetails?.complianceData?.arn || '',
    status: work.submissionDetails?.complianceData?.status || 'Draft Prepared'
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

  // Income Tax Compliance Data State
  const [itData, setItData] = useState({
    formType: work.submissionDetails?.complianceData?.formType || 'ITR-3',
    ay: work.submissionDetails?.complianceData?.ay || 'AY 2026-27',
    dueDate: work.submissionDetails?.complianceData?.dueDate || work.dueDate || work.finishingDate || '2026-10-31',
    taxableIncome: work.submissionDetails?.complianceData?.taxableIncome ?? '',
    taxDue: work.submissionDetails?.complianceData?.taxDue ?? '',
    ackNo: work.submissionDetails?.complianceData?.ackNo || '',
    taxAuditRequired: work.submissionDetails?.complianceData?.taxAuditRequired || false,
    status: work.submissionDetails?.complianceData?.status || 'Draft Prepared'
  });

  // ROC & MCA Compliance Data State
  const [rocData, setRocData] = useState({
    formName: work.submissionDetails?.complianceData?.formName || 'AOC-4',
    category: work.submissionDetails?.complianceData?.category || 'Annual ROC Filing',
    dueDate: work.submissionDetails?.complianceData?.dueDate || work.dueDate || work.finishingDate || '2026-10-30',
    srn: work.submissionDetails?.complianceData?.srn || '',
    notes: work.submissionDetails?.complianceData?.notes || '',
    status: work.submissionDetails?.complianceData?.status || 'In Progress'
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
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
        assignedTo: currentUser.name,
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
        assignedTo: currentUser.name,
        srn: rocData.srn.trim(),
        notes: rocData.notes.trim() || completionRemarks.trim(),
        status: rocData.status,
        taskId: work.id
      };
    }

    const submissionData = {
      submittedAt: completionDate,
      submittedBy: currentUser.name,
      submittedById: currentUser.id,
      completionRemarks: completionRemarks.trim(),
      workingPaperNotes: workingPaperNotes.trim(),
      cloudDriveLink: cloudDriveLink.trim(),
      evidenceFiles: evidenceFiles,
      complianceData
    };

    onSubmitWork(work.id, submissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Submit Work & Compliance Data
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Handover completed assignment, enter filing figures (Turnover, ITC, Liability), and attach working papers.
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
            <span>Client: <strong className="text-slate-200">{work.clientName}</strong> {work.clientGstin ? `(GSTIN: ${work.clientGstin})` : work.clientPan ? `(PAN: ${work.clientPan})` : ''}</span>
            <span>Target Date: <strong className="text-amber-300">{work.finishingDate || work.dueDate}</strong></span>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* COMPLIANCE SERVICE SELECTION TABS */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>Select Service Line for Filing Report</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-medium">Updates GST / IT / ROC Registers</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { id: 'GST', label: 'GST Compliance', desc: 'GSTR-1, 3B, ITC, Turnover' },
                { id: 'IT', label: 'Income Tax', desc: 'ITR-1 to 7, Tax Audit 3CD' },
                { id: 'ROC', label: 'ROC & MCA', desc: 'AOC-4, MGT-7, DIR-3 KYC' },
                { id: 'None', label: 'Other / Audit', desc: 'Internal / Non-filing' }
              ].map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => setSelectedService(srv.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedService === srv.id
                      ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-[11px] flex items-center justify-between">
                    <span>{srv.label}</span>
                    {selectedService === srv.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">{srv.desc}</div>
                </button>
              ))}
            </div>

            {/* GST FIELDS INPUT */}
            {selectedService === 'GST' && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> GST Filing Figures & Liability Details
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Client GSTIN: {work.clientGstin || 'Unregistered'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Return Type</label>
                    <select
                      value={gstData.type}
                      onChange={(e) => setGstData({ ...gstData, type: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="GSTR-3B">GSTR-3B (Monthly Summary)</option>
                      <option value="GSTR-1">GSTR-1 (Outward Supplies)</option>
                      <option value="CMP-08">CMP-08 (Composition Scheme)</option>
                      <option value="GSTR-9">GSTR-9 (Annual Return)</option>
                      <option value="GSTR-9C">GSTR-9C (Reconciliation)</option>
                      <option value="IFF">IFF (QRMP Invoice Facility)</option>
                      <option value="GSTR-4">GSTR-4 (Annual Composition)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Return Period</label>
                    <input
                      type="text"
                      value={gstData.period}
                      onChange={(e) => setGstData({ ...gstData, period: e.target.value })}
                      placeholder="e.g. October 2026 / Q2 2026-27"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Statutory Due Date</label>
                    <input
                      type="date"
                      value={gstData.dueDate}
                      onChange={(e) => setGstData({ ...gstData, dueDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Turnover, Sales Tax, ITC, Net Liability */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Total Turnover (₹)</label>
                    <input
                      type="number"
                      value={gstData.turnover}
                      onChange={(e) => setGstData({ ...gstData, turnover: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Sales Tax / Output (₹)</label>
                    <input
                      type="number"
                      value={gstData.salesTax}
                      onChange={(e) => setGstData({ ...gstData, salesTax: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">GST Input (ITC) (₹)</label>
                    <input
                      type="number"
                      value={gstData.itcAvailable}
                      onChange={(e) => setGstData({ ...gstData, itcAvailable: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-bold mb-1">Net Liability (₹)</label>
                    <input
                      type="number"
                      value={gstData.netLiability}
                      onChange={(e) => setGstData({ ...gstData, netLiability: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-amber-500/50 rounded-lg text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">ARN / Challan Ref No</label>
                    <input
                      type="text"
                      value={gstData.arn}
                      onChange={(e) => setGstData({ ...gstData, arn: e.target.value })}
                      placeholder="e.g. AA271026001234V"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Filing Status</label>
                    <select
                      value={gstData.status}
                      onChange={(e) => setGstData({ ...gstData, status: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Draft Prepared">Draft Prepared (Pending Approval)</option>
                      <option value="Data Received">Data Received & Reconciled</option>
                      <option value="Client Approved">Client Approved</option>
                      <option value="Filed">Filed (Signed off)</option>
                      <option value="Data Pending">Data Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* INCOME TAX FIELDS INPUT */}
            {selectedService === 'IT' && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-blue-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4" /> Income Tax & Tax Audit Return Details
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Client PAN: {work.clientPan || 'N/A'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Form / Return Type</label>
                    <select
                      value={itData.formType}
                      onChange={(e) => setItData({ ...itData, formType: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="ITR-1">ITR-1 (Sahaj - Salary/1 House)</option>
                      <option value="ITR-2">ITR-2 (Capital Gains/Foreign)</option>
                      <option value="ITR-3">ITR-3 (Business & Profession)</option>
                      <option value="ITR-4">ITR-4 (Sugam - Presumptive 44AD/ADA)</option>
                      <option value="ITR-5">ITR-5 (LLP / Partnership Firm)</option>
                      <option value="ITR-6">ITR-6 (Private & Public Company)</option>
                      <option value="ITR-7">ITR-7 (Trust / Society)</option>
                      <option value="Form 3CD">Form 3CD (Tax Audit Report)</option>
                      <option value="26Q TDS">26Q (Non-Salary TDS Return)</option>
                      <option value="24Q TDS">24Q (Salary TDS Return)</option>
                      <option value="Advance Tax">Advance Tax Challan 280</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Assessment Year (AY)</label>
                    <select
                      value={itData.ay}
                      onChange={(e) => setItData({ ...itData, ay: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    >
                      <option value="AY 2026-27">AY 2026-27 (FY 2025-26)</option>
                      <option value="AY 2025-26">AY 2025-26 (FY 2024-25)</option>
                      <option value="AY 2024-25">AY 2024-25 (FY 2023-24)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Filing Due Date</label>
                    <input
                      type="date"
                      value={itData.dueDate}
                      onChange={(e) => setItData({ ...itData, dueDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Taxable Income (₹)</label>
                    <input
                      type="number"
                      value={itData.taxableIncome}
                      onChange={(e) => setItData({ ...itData, taxableIncome: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Tax Payable / Refund (₹)</label>
                    <input
                      type="number"
                      value={itData.taxDue}
                      onChange={(e) => setItData({ ...itData, taxDue: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Ack / E-filing Token No</label>
                    <input
                      type="text"
                      value={itData.ackNo}
                      onChange={(e) => setItData({ ...itData, ackNo: e.target.value })}
                      placeholder="e.g. 892716301290"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={itData.taxAuditRequired}
                      onChange={(e) => setItData({ ...itData, taxAuditRequired: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <span>Tax Audit under Section 44AB Applicable</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Status:</span>
                    <select
                      value={itData.status}
                      onChange={(e) => setItData({ ...itData, status: e.target.value })}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="Draft Prepared">Draft Prepared</option>
                      <option value="In Audit">In Audit</option>
                      <option value="Client Approved">Client Approved</option>
                      <option value="Filed">Filed</option>
                      <option value="Data Received">Data Received</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ROC & MCA FIELDS INPUT */}
            {selectedService === 'ROC' && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> ROC & MCA Statutory Compliance
                  </span>
                  <span className="text-[10px] text-slate-400">{work.clientName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Form / Filing Type</label>
                    <select
                      value={rocData.formName}
                      onChange={(e) => setRocData({ ...rocData, formName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="AOC-4">AOC-4 (Financial Statements)</option>
                      <option value="MGT-7">MGT-7 (Annual Return)</option>
                      <option value="DIR-3 KYC">DIR-3 KYC (Director Verification)</option>
                      <option value="LLP Form 11">LLP Form 11 (Annual Return)</option>
                      <option value="LLP Form 8">LLP Form 8 (Statement of Accounts)</option>
                      <option value="ADT-1">ADT-1 (Auditor Appointment)</option>
                      <option value="DPT-3">DPT-3 (Return of Deposits)</option>
                      <option value="PAS-3">PAS-3 (Allotment of Shares)</option>
                      <option value="MGT-14">MGT-14 (Board Resolutions)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={rocData.category}
                      onChange={(e) => setRocData({ ...rocData, category: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Annual ROC Filing">Annual ROC Filing</option>
                      <option value="Director Compliance">Director Compliance</option>
                      <option value="LLP Compliance">LLP Compliance</option>
                      <option value="Statutory Audit">Statutory Audit</option>
                      <option value="Company Secretarial">Company Secretarial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                    <input
                      type="date"
                      value={rocData.dueDate}
                      onChange={(e) => setRocData({ ...rocData, dueDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">SRN / Challan Number</label>
                    <input
                      type="text"
                      value={rocData.srn}
                      onChange={(e) => setRocData({ ...rocData, srn: e.target.value })}
                      placeholder="e.g. F12345678"
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Filing Status</label>
                    <select
                      value={rocData.status}
                      onChange={(e) => setRocData({ ...rocData, status: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-bold focus:outline-none focus:border-purple-500"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed / Filed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Work Completion Remarks & Summary <span className="text-purple-400">*</span>
            </label>
            <textarea
              rows="2"
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
              All submitted figures (Turnover, ITC, Liability) and evidence will automatically update the <strong>Compliance Registers</strong> and become available for Manager sign-off.
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
              <span>Submit with Compliance Figures</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
