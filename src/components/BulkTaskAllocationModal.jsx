import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers,
  X,
  Calendar,
  User,
  Clock,
  CheckSquare,
  Building,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  AlertCircle,
  Briefcase
} from 'lucide-react';

export default function BulkTaskAllocationModal({
  onClose,
  onBulkAllocate,
  clients = [],
  staff = [],
  currentUser = {}
}) {
  // 1. Task Template & Schedule Configuration
  const [templateType, setTemplateType] = useState('gst_monthly');
  const [schedulePeriod, setSchedulePeriod] = useState('November 2026');
  const [dueDate, setDueDate] = useState('2026-11-20');
  const [priority, setPriority] = useState('High');
  const [department, setDepartment] = useState('GST Compliance');
  const [serviceLine, setServiceLine] = useState('Indirect Taxation (GST)');
  const [taskTitle, setTaskTitle] = useState('Monthly GST Filing (GSTR-1 & GSTR-3B)');
  const [statutorySection, setStatutorySection] = useState('Section 39 / Rule 61 (GSTR-3B)');
  const [workDetails, setWorkDetails] = useState(
    'Verify purchase registers with GSTR-2B, calculate outward tax liability, prepare monthly return summary and submit for manager approval.'
  );
  const [estimatedHours, setEstimatedHours] = useState('4 hrs');
  const [feeQuote, setFeeQuote] = useState('₹5,000');

  // 2. Staff Assignment Mode: 'designated' (each client's assigned staff) OR 'single' (one specific staff)
  const [assignmentMode, setAssignmentMode] = useState('designated');
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || 'ADMIN01');

  // 3. Client Filter & Selection
  const [clientSearch, setClientSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('Active'); // 'Active' | 'GST' | 'Corporate' | 'All'

  // Only consider active / non-resigned clients by default
  const activeClients = useMemo(() => {
    return clients.filter((c) => c && c.status !== 'Resigned' && c.status !== 'Hidden');
  }, [clients]);

  // Pre-select all active clients on open
  const [selectedClientIds, setSelectedClientIds] = useState(() => {
    return activeClients.map((c) => c.id);
  });

  // Template switch presets
  const handleTemplateChange = (type) => {
    setTemplateType(type);
    const today = new Date();
    const curYear = today.getFullYear();

    switch (type) {
      case 'gst_monthly':
        setDepartment('GST Compliance');
        setServiceLine('Indirect Taxation (GST)');
        setTaskTitle(`Monthly GST Compliance & Filing - ${schedulePeriod}`);
        setStatutorySection('Section 37 & 39 CGST Act (GSTR-1 & 3B)');
        setDueDate('2026-11-20');
        setWorkDetails(
          'Reconcile books with GSTR-2B ITC, compile sales tax liability, draft GSTR-1 & 3B returns and submit for approval.'
        );
        setEstimatedHours('4 hrs');
        setFeeQuote('₹5,000');
        setPriority('Urgent');
        // Auto-select clients with GSTIN
        setSelectedClientIds(activeClients.filter((c) => c.gstin && c.gstin !== 'N/A').map((c) => c.id));
        break;

      case 'internal_audit':
        setDepartment('Statutory & Tax Audit');
        setServiceLine('Audit & Assurance');
        setTaskTitle(`Monthly Internal Audit & Bookkeeping Review - ${schedulePeriod}`);
        setStatutorySection('Internal Audit Standards / Section 138');
        setDueDate('2026-11-25');
        setWorkDetails(
          'Conduct comprehensive audit of bank vouchers, purchase bills, debtor ledger aging, petty cash, and internal controls.'
        );
        setEstimatedHours('12 hrs');
        setFeeQuote('₹25,000');
        setPriority('High');
        // Auto-select corporate & partnership clients
        setSelectedClientIds(
          activeClients
            .filter((c) => !c.constitution?.includes('Individual') || c.category === 'Corporate')
            .map((c) => c.id)
        );
        break;

      case 'income_tax':
        setDepartment('Income Tax');
        setServiceLine('Direct Taxation & ITR');
        setTaskTitle(`Income Tax Return Filing & Data Computation - ${schedulePeriod}`);
        setStatutorySection('Section 139(1) Income Tax Act, 1961');
        setDueDate('2026-11-30');
        setWorkDetails(
          'Collate AIS/TIS, Form 26AS, bank statements, interest certificates, compute total taxable income and finalize ITR computation.'
        );
        setEstimatedHours('8 hrs');
        setFeeQuote('₹10,000');
        setPriority('High');
        setSelectedClientIds(activeClients.map((c) => c.id));
        break;

      case 'tds_monthly':
        setDepartment('TDS & Payroll');
        setServiceLine('Direct Taxation & ITR');
        setTaskTitle(`TDS Deposit & Monthly Challan Verification - ${schedulePeriod}`);
        setStatutorySection('Section 200 / Challan ITNS 281');
        setDueDate('2026-11-07');
        setWorkDetails(
          'Calculate tax deducted at source under sections 194C, 194J, 194I, 194Q. Generate payment challan and verify payment acknowledgment.'
        );
        setEstimatedHours('3 hrs');
        setFeeQuote('₹3,500');
        setPriority('Urgent');
        setSelectedClientIds(activeClients.map((c) => c.id));
        break;

      case 'roc_annual':
        setDepartment('ROC & Corporate Laws');
        setServiceLine('Corporate Law & ROC');
        setTaskTitle(`ROC Annual Statutory Compliance & MGT-7/AOC-4 Schedule`);
        setStatutorySection('Section 92 & 137 Companies Act 2013');
        setDueDate('2026-11-30');
        setWorkDetails(
          'Prepare financial statements for MCA e-filing, compile AOC-4, MGT-7, Board Report, and verify active DIN director KYC.'
        );
        setEstimatedHours('10 hrs');
        setFeeQuote('₹15,000');
        setPriority('Medium');
        setSelectedClientIds(
          activeClients
            .filter((c) => c.constitution?.includes('Private Limited') || c.constitution?.includes('LLP') || c.constitution?.includes('Company'))
            .map((c) => c.id)
        );
        break;

      case 'bookkeeping':
        setDepartment('Accounting & Bookkeeping');
        setServiceLine('Accounting & Bookkeeping');
        setTaskTitle(`Monthly Bookkeeping & Bank Reconciliation - ${schedulePeriod}`);
        setStatutorySection('Section 128 Books of Account');
        setDueDate('2026-11-15');
        setWorkDetails(
          'Post bank statements, verify sales invoices, vendor ledger scrutiny, and generate monthly trial balance & P&L report.'
        );
        setEstimatedHours('6 hrs');
        setFeeQuote('₹7,500');
        setPriority('Medium');
        setSelectedClientIds(activeClients.map((c) => c.id));
        break;

      default:
        break;
    }
  };

  // Filter clients inside the checklist
  const visibleClients = useMemo(() => {
    return activeClients.filter((c) => {
      const q = clientSearch.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        (c.pan && c.pan.toLowerCase().includes(q)) ||
        (c.gstin && c.gstin.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (clientTypeFilter === 'GST') return c.gstin && c.gstin !== 'N/A' && c.gstin.length > 5;
      if (clientTypeFilter === 'Corporate')
        return (
          c.constitution?.includes('Private Limited') ||
          c.constitution?.includes('LLP') ||
          c.constitution?.includes('Company')
        );
      return true;
    });
  }, [activeClients, clientSearch, clientTypeFilter]);

  // Selection toggles
  const handleToggleClient = (clientId) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = visibleClients.map((c) => c.id);
    setSelectedClientIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleDeselectAll = () => {
    setSelectedClientIds([]);
  };

  // Execution: Generate tasks
  const handleExecuteBulkAllocation = (e) => {
    e.preventDefault();

    if (selectedClientIds.length === 0) {
      alert('Please select at least 1 client for bulk allocation.');
      return;
    }

    if (!taskTitle.trim()) {
      alert('Please enter a task title.');
      return;
    }

    const timestamp = Date.now();
    const createdTasks = [];

    selectedClientIds.forEach((clientId, idx) => {
      const client = clients.find((c) => c.id === clientId) || { id: clientId, name: clientId };

      // Determine assigned staff
      let assignedStaffId = selectedStaffId;
      let assignedStaffName = staff.find((s) => s.id === selectedStaffId)?.name || 'Designated Staff';

      if (assignmentMode === 'designated' && client.assignedStaff) {
        const staffObj = staff.find((s) => s.id === client.assignedStaff || s.name === client.assignedStaff);
        if (staffObj) {
          assignedStaffId = staffObj.id;
          assignedStaffName = staffObj.name;
        } else {
          assignedStaffId = client.assignedStaff;
          assignedStaffName = client.assignedStaff;
        }
      }

      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const jobNumber = `JOB-${new Date().getFullYear()}-${idx + 101}-${randomSuffix}`;
      const taskId = `CA-WRK-${timestamp}-${idx + 1}`;

      const newTask = {
        id: taskId,
        jobNumber,
        title: `${taskTitle} - ${client.name}`,
        clientName: client.name,
        clientId: client.id,
        clientPan: client.pan || 'N/A',
        clientGstin: client.gstin || 'N/A',
        serviceLine,
        department,
        assignedTo: assignedStaffId,
        assignedToName: assignedStaffName,
        allocatedBy: currentUser?.name || 'Managing Partner',
        allocatedById: currentUser?.id || 'ADMIN01',
        allocationDate: new Date().toISOString().split('T')[0],
        allocatedDate: new Date().toISOString().split('T')[0],
        dueDate,
        finishingDate: dueDate,
        priority,
        status: 'Allocated',
        schedulePeriod,
        fy: '2025-26',
        ay: '2026-27',
        statutorySection,
        workDetails,
        estimatedHours,
        feeQuote,
        isBulkAllocated: true,
        createdAt: timestamp + idx
      };

      createdTasks.push(newTask);
    });

    onBulkAllocate(createdTasks);
    onClose();
  };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/50">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-white">Bulk Task & Schedule Allocation</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mass Scheduler
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Allocate monthly audit schedules, GST filing batches, or ITR campaigns across multiple clients at once.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleExecuteBulkAllocation} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Preset Template Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1. Choose Compliance / Audit Schedule Template:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'gst_monthly', label: 'GST Monthly', sub: 'GSTR-1 & 3B' },
                { id: 'internal_audit', label: 'Internal Audit', sub: 'Monthly Audit' },
                { id: 'income_tax', label: 'Income Tax', sub: 'ITR Campaign' },
                { id: 'tds_monthly', label: 'TDS / TCS', sub: 'Deposit & Return' },
                { id: 'roc_annual', label: 'ROC & MCA', sub: 'AOC-4 / MGT-7' },
                { id: 'bookkeeping', label: 'Bookkeeping', sub: 'Accounts Final' }
              ].map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    templateType === tpl.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold block">{tpl.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{tpl.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Period, Due Date, and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Target Period / Month
              </label>
              <input
                type="text"
                value={schedulePeriod}
                onChange={(e) => setSchedulePeriod(e.target.value)}
                placeholder="e.g. November 2026 / Q3 FY 2026-27"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Task Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Urgent">Urgent (Immediate statutory deadline)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Task Details Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Task Title Prefix
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Will be appended with each client name (e.g. &quot;{taskTitle} - [Client Name]&quot;)
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Statutory Section / Authority
              </label>
              <input
                type="text"
                value={statutorySection}
                onChange={(e) => setStatutorySection(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Instructions & Standard Audit Scope
            </label>
            <textarea
              value={workDetails}
              onChange={(e) => setWorkDetails(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Instructions to staff..."
            />
          </div>

          {/* 3. Staff Assignment Mode */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              2. Staff Assignment Rule:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  assignmentMode === 'designated'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="assignmentMode"
                  value="designated"
                  checked={assignmentMode === 'designated'}
                  onChange={() => setAssignmentMode('designated')}
                  className="mt-0.5 accent-blue-500"
                />
                <div>
                  <span className="text-xs font-bold block">Auto-Assign to Designated Staff</span>
                  <span className="text-[11px] text-slate-400">
                    Each client has a designated staff member. Allocates each task automatically to that client&apos;s staff!
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  assignmentMode === 'single'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="assignmentMode"
                  value="single"
                  checked={assignmentMode === 'single'}
                  onChange={() => setAssignmentMode('single')}
                  className="mt-0.5 accent-blue-500"
                />
                <div className="w-full">
                  <span className="text-xs font-bold block">Assign All to One Staff Member</span>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => {
                      setSelectedStaffId(e.target.value);
                      setAssignmentMode('single');
                    }}
                    className="mt-1.5 w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.designation || s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Client Multi-Select Checklist */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                3. Select Clients ({selectedClientIds.length} of {activeClients.length} Selected):
              </label>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20"
                >
                  Select All Visible
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Filter client list by name, PAN, GSTIN..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs shrink-0">
                {['Active', 'GST', 'Corporate', 'All'].map((flt) => (
                  <button
                    type="button"
                    key={flt}
                    onClick={() => setClientTypeFilter(flt)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      clientTypeFilter === flt
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Checklist Container */}
            <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/80 p-1">
              {visibleClients.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching clients found for current filter.
                </div>
              ) : (
                visibleClients.map((c) => {
                  const isChecked = selectedClientIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isChecked ? 'bg-emerald-500/10 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleClient(c.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-2">
                            <span>{c.name}</span>
                            <span className="text-[10px] font-normal text-slate-400 font-mono">
                              ({c.id})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-emerald-400">PAN: {c.pan || 'N/A'}</span>
                            {c.gstin && c.gstin !== 'N/A' && (
                              <span className="font-mono text-slate-400">GST: {c.gstin}</span>
                            )}
                            <span className="text-slate-500">&bull; {c.constitution || 'Entity'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          Staff: {c.assignedStaff || 'Unassigned'}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Preview & Submit */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-800/50 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Ready to Allocate {selectedClientIds.length} Task{selectedClientIds.length > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-slate-400">
                  Target Due Date: <strong>{dueDate}</strong> &bull; Period: <strong>{schedulePeriod}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedClientIds.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
              >
                <Layers className="w-4 h-4" />
                <span>Execute Bulk Allocation ({selectedClientIds.length})</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
