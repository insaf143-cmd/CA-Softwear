import React, { useState } from 'react';
import {
  FolderInput,
  FolderOutput,
  Package,
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Send,
  Building,
  Phone,
  ShieldCheck,
  X,
  ArrowRightLeft,
  Key,
  BookOpen,
  Receipt,
  FileCheck
} from 'lucide-react';
import { saveSingleInwardToFirebase } from '../services/firebaseService';

export default function InwardOutwardRegister({
  records = [],
  setRecords,
  clients = [],
  staff = [],
  currentUser,
  firmProfile
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'inward' | 'outward'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [outwardingRecord, setOutwardingRecord] = useState(null);
  const [printingRecord, setPrintingRecord] = useState(null);
  const [printType, setPrintType] = useState('inward'); // 'inward' | 'outward'

  // New Inward Form State
  const generateInwardId = () => {
    const year = new Date().getFullYear();
    const count = records.filter(r => r.id?.startsWith(`INW-${year}`)).length + 1;
    return `INW-${year}-${String(count).padStart(3, '0')}`;
  };

  const [inwardForm, setInwardForm] = useState({
    id: generateInwardId(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    clientId: '',
    clientName: '',
    category: 'Books & Registers',
    description: '',
    quantity: '1 File / Bundle',
    handedBy: '',
    handedByPhone: '',
    receivedBy: currentUser?.name || 'Authorized Staff',
    rackLocation: 'Main Records Rack - Shelf A',
    status: 'In Custody',
    remarks: ''
  });

  // Outward Form State
  const generateOutwardId = () => {
    const year = new Date().getFullYear();
    const count = records.filter(r => r.outwardDetails?.outwardId?.startsWith(`OUT-${year}`)).length + 1;
    return `OUT-${year}-${String(count).padStart(3, '0')}`;
  };

  const [outwardForm, setOutwardForm] = useState({
    outwardId: generateOutwardId(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mode: 'Hand Delivery',
    courierDetails: '',
    dispatchedBy: currentUser?.name || 'Authorized Staff',
    receivedByClient: '',
    clientPhone: '',
    acknowledgmentRemarks: 'Materials verified and handed over in intact condition'
  });

  // Category Options
  const categories = [
    'Books & Registers',
    'Bills & Vouchers',
    'DSC Token',
    'Bank Passbooks & Cheques',
    'Property & Title Deeds',
    'Statutory Audit Schedules',
    'Confidential Assessment Files',
    'Other Material'
  ];

  // Filtering records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rackLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.handedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.outwardDetails?.outwardId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.outwardDetails?.receivedByClient?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : r.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'All' ? true : r.category === categoryFilter;

    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'inward'
        ? r.status === 'In Custody' || r.status === 'Under Audit'
        : r.status === 'Returned';

    return matchesSearch && matchesStatus && matchesCategory && matchesTab;
  });

  // Stats
  const totalCount = records.length;
  const inCustodyCount = records.filter((r) => r.status === 'In Custody').length;
  const underAuditCount = records.filter((r) => r.status === 'Under Audit').length;
  const returnedCount = records.filter((r) => r.status === 'Returned').length;

  // Handle Client Selection in Inward Modal
  const handleClientChange = (clientId) => {
    if (!clientId) {
      setInwardForm(prev => ({
        ...prev,
        clientId: ''
      }));
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setInwardForm(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
        handedBy: client.authorizedPerson || client.contactPerson || client.name,
        handedByPhone: client.phone || ''
      }));
    }
  };

  // Submit Inward Entry
  const handleSaveInward = (e) => {
    e.preventDefault();
    const cleanClientName = (inwardForm.clientName || '').trim();
    const cleanDesc = (inwardForm.description || '').trim();

    if (!cleanClientName || !cleanDesc) {
      alert('Please fill Client Name and Material Description.');
      return;
    }

    const year = new Date().getFullYear();
    const uniqueSeq = Date.now().toString().slice(-4);
    const finalId = inwardForm.id && inwardForm.id.trim() 
      ? inwardForm.id.trim() 
      : `INW-${year}-${uniqueSeq}`;

    const newRecord = {
      ...inwardForm,
      id: finalId,
      clientName: cleanClientName,
      description: cleanDesc,
      type: 'Inward',
      status: 'In Custody',
      outwardDetails: null
    };

    const updated = [newRecord, ...records.filter((r) => r.id !== newRecord.id)];
    setRecords(updated);
    saveSingleInwardToFirebase(newRecord);
    setShowInwardModal(false);

    // Reset Form for next inward
    const nextSeq = Math.floor(101 + Math.random() * 898);
    setInwardForm({
      id: `INW-${year}-${nextSeq}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientId: '',
      clientName: '',
      category: 'Books & Registers',
      description: '',
      quantity: '1 File / Bundle',
      handedBy: '',
      handedByPhone: '',
      receivedBy: currentUser?.name || 'Authorized Staff',
      rackLocation: 'Main Records Rack - Shelf A',
      status: 'In Custody',
      remarks: ''
    });
  };

  // Submit Outward / Return Entry
  const handleSaveOutward = (e) => {
    e.preventDefault();
    if (!outwardingRecord) return;

    if (!outwardForm.receivedByClient) {
      alert('Please enter who acknowledged and received the material.');
      return;
    }

    const updated = records.map((r) => {
      if (r.id === outwardingRecord.id) {
        return {
          ...r,
          status: 'Returned',
          outwardDetails: {
            ...outwardForm
          }
        };
      }
      return r;
    });

    setRecords(updated);
    const completedRecord = updated.find(r => r.id === outwardingRecord.id);
    if (completedRecord) {
      saveSingleInwardToFirebase(completedRecord);
    }
    setOutwardingRecord(null);

    // Prompt to print delivery challan
    if (window.confirm('Material returned successfully! Would you like to print the Outward Delivery Challan?')) {
      handleOpenPrint(completedRecord, 'outward');
    }
  };

  // Open Outward Modal
  const handleOpenOutwardModal = (record) => {
    setOutwardingRecord(record);
    setOutwardForm({
      outwardId: generateOutwardId(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'Hand Delivery',
      courierDetails: '',
      dispatchedBy: currentUser?.name || 'Authorized Staff',
      receivedByClient: record.handedBy || record.clientName,
      clientPhone: record.handedByPhone || '',
      acknowledgmentRemarks: 'Materials inspected, verified and handed back safely'
    });
  };

  // Toggle Audit Status
  const handleToggleStatus = (record) => {
    const nextStatus = record.status === 'In Custody' ? 'Under Audit' : 'In Custody';
    const updated = records.map((r) => {
      if (r.id === record.id) {
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setRecords(updated);
  };

  // Print Handlers
  const handleOpenPrint = (record, type = 'inward') => {
    setPrintingRecord(record);
    setPrintType(type);
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'Inward No',
      'Inward Date',
      'Client Name',
      'Client ID',
      'Category',
      'Description',
      'Quantity',
      'Handed By (Client)',
      'Phone',
      'Received By (Staff)',
      'Storage Location',
      'Current Status',
      'Outward No',
      'Outward Date',
      'Dispatch Mode',
      'Received By Client Representative'
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${r.clientName.replace(/"/g, '""')}"`,
      `"${r.clientId || 'N/A'}"`,
      `"${r.category}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${r.quantity}"`,
      `"${r.handedBy}"`,
      `"${r.handedByPhone || '-'}"`,
      `"${r.receivedBy}"`,
      `"${r.rackLocation}"`,
      `"${r.status}"`,
      `"${r.outwardDetails?.outwardId || '-'}"`,
      `"${r.outwardDetails?.date || '-'}"`,
      `"${r.outwardDetails?.mode || '-'}"`,
      `"${r.outwardDetails?.receivedByClient || '-'}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CA_Material_Register_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FolderInput className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Inward & Outward Register
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical Client Material, Books of Accounts, Vouchers, and DSC Token Custody Register
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Register</span>
          </button>

          <button
            onClick={() => {
              setInwardForm({
                ...inwardForm,
                id: generateInwardId()
              });
              setShowInwardModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/30 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ New Material Inward Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Entries Logged</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">All physical assets tracked</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('inward');
            setStatusFilter('In Custody');
          }}
          className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">In Office Custody</span>
            <FolderInput className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1.5">{inCustodyCount}</div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">Stored in firm racks/safe</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('inward');
            setStatusFilter('Under Audit');
          }}
          className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300">Under Active Audit</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1.5">{underAuditCount}</div>
          <div className="text-[11px] text-blue-400/80 mt-0.5">With staff for verification</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('outward');
            setStatusFilter('Returned');
          }}
          className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Returned to Client</span>
            <FolderOutput className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1.5">{returnedCount}</div>
          <div className="text-[11px] text-emerald-500 mt-0.5">Dispatched with acknowledgment</div>
        </div>
      </div>

      {/* Tabs & Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('all');
                setStatusFilter('All');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Materials ({records.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('inward');
                setStatusFilter('All');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'inward'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderInput className="w-3.5 h-3.5 text-amber-400" />
              <span>Inward / In Custody ({inCustodyCount + underAuditCount})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('outward');
                setStatusFilter('All');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'outward'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderOutput className="w-3.5 h-3.5 text-emerald-400" />
              <span>Outward / Dispatched ({returnedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, inward #, description, rack location..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="In Custody">In Custody</option>
              <option value="Under Audit">Under Audit</option>
              <option value="Returned">Returned to Client</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 ml-auto font-mono">
            Showing {filteredRecords.length} of {records.length} records
          </span>
        </div>
      </div>

      {/* Main Material Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Inward Ref #</th>
                <th className="py-3 px-4">Client Name & ID</th>
                <th className="py-3 px-4">Material / Category</th>
                <th className="py-3 px-4">Quantity & Details</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4">Received By / From</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No material records match your current filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isReturned = r.status === 'Returned';
                  const isUnderAudit = r.status === 'Under Audit';

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Inward Ref & Date */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                          <FolderInput className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{r.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{r.date}</span>
                          {r.time && <span className="text-slate-500">({r.time})</span>}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-slate-200">
                          {r.clientName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {r.clientId ? `ID: ${r.clientId}` : 'Direct Inward'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 align-top">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {r.category === 'DSC Token' ? (
                            <Key className="w-3 h-3 text-cyan-400" />
                          ) : r.category === 'Books & Registers' ? (
                            <BookOpen className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Receipt className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>{r.category}</span>
                        </span>
                      </td>

                      {/* Description & Qty */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <p className="text-slate-200 line-clamp-2">{r.description}</p>
                        <div className="text-[10px] text-amber-400/90 font-mono font-medium mt-1">
                          Qty: {r.quantity}
                        </div>
                        {r.remarks && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            Note: {r.remarks}
                          </div>
                        )}
                      </td>

                      {/* Storage Location */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="font-medium text-[11px]">{r.rackLocation}</span>
                        </div>
                        {isReturned && (
                          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Vacated (Returned)</span>
                          </div>
                        )}
                      </td>

                      {/* Received By / Handed By */}
                      <td className="py-3 px-4 align-top">
                        <div className="text-slate-300 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>Recv: {r.receivedBy}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          From: {r.handedBy} {r.handedByPhone ? `(${r.handedByPhone})` : ''}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isReturned
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isUnderAudit
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isReturned ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isUnderAudit ? (
                            <FileCheck className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{r.status}</span>
                        </span>

                        {isReturned && r.outwardDetails && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            {r.outwardDetails.outwardId} on {r.outwardDetails.date}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Toggle Audit status */}
                          {!isReturned && (
                            <button
                              onClick={() => handleToggleStatus(r)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition"
                              title={isUnderAudit ? 'Mark Back to Storage' : 'Mark Under Active Audit'}
                            >
                              {isUnderAudit ? 'To Storage' : 'Under Audit'}
                            </button>
                          )}

                          {/* Print Inward Receipt */}
                          <button
                            onClick={() => handleOpenPrint(r, 'inward')}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition"
                            title="Print Inward Acknowledgment Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Outward / Return Button */}
                          {!isReturned ? (
                            <button
                              onClick={() => handleOpenOutwardModal(r)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] shadow transition"
                              title="Return / Outward to Client"
                            >
                              <Send className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenPrint(r, 'outward')}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-semibold border border-slate-700 transition"
                              title="Print Outward Delivery Challan"
                            >
                              <FolderOutput className="w-3 h-3" />
                              <span>Challan</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: NEW INWARD ENTRY MODAL                          */}
      {/* ========================================================= */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <FolderInput className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">
                    New Material Inward Register Entry
                  </h3>
                  <p className="text-xs text-slate-400">
                    Log physical books, documents, or DSC tokens received from client
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInwardModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInward} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Inward ID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Inward Ref #
                  </label>
                  <input
                    type="text"
                    value={inwardForm.id}
                    onChange={(e) => setInwardForm({ ...inwardForm, id: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={inwardForm.date}
                    onChange={(e) => setInwardForm({ ...inwardForm, date: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={inwardForm.time}
                    onChange={(e) => setInwardForm({ ...inwardForm, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Select Existing Client
                  </label>
                  <select
                    value={inwardForm.clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Or enter name manually below --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.pan ? `(${c.pan})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={inwardForm.clientName}
                    onChange={(e) => setInwardForm({ ...inwardForm, clientName: e.target.value })}
                    required
                    placeholder="e.g. Apex Infotech Private Limited"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              {/* Category & Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Material Category
                  </label>
                  <select
                    value={inwardForm.category}
                    onChange={(e) => setInwardForm({ ...inwardForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Quantity / Packaging
                  </label>
                  <input
                    type="text"
                    value={inwardForm.quantity}
                    onChange={(e) => setInwardForm({ ...inwardForm, quantity: e.target.value })}
                    placeholder="e.g. 2 Box Files / 1 USB Token"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Material Description / Details *
                </label>
                <textarea
                  rows={2}
                  value={inwardForm.description}
                  onChange={(e) => setInwardForm({ ...inwardForm, description: e.target.value })}
                  required
                  placeholder="Detailed list of documents, assessment years, ledger names, token serial numbers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Handed By & Received By */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Handed By (Client Contact)
                  </label>
                  <input
                    type="text"
                    value={inwardForm.handedBy}
                    onChange={(e) => setInwardForm({ ...inwardForm, handedBy: e.target.value })}
                    placeholder="Person name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={inwardForm.handedByPhone}
                    onChange={(e) => setInwardForm({ ...inwardForm, handedByPhone: e.target.value })}
                    placeholder="+91 98xxx xxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Received By Staff
                  </label>
                  <select
                    value={inwardForm.receivedBy}
                    onChange={(e) => setInwardForm({ ...inwardForm, receivedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.designation || s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rack Location & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Physical Storage Location (Shelf / Almirah)
                  </label>
                  <input
                    type="text"
                    value={inwardForm.rackLocation}
                    onChange={(e) => setInwardForm({ ...inwardForm, rackLocation: e.target.value })}
                    placeholder="e.g. Almirah 2 / Shelf C / Safe Vault"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Condition / Special Remarks
                  </label>
                  <input
                    type="text"
                    value={inwardForm.remarks}
                    onChange={(e) => setInwardForm({ ...inwardForm, remarks: e.target.value })}
                    placeholder="e.g. Received in sealed bag, original copies"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInwardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition"
                >
                  Save Inward Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: OUTWARD / DISPATCH RETURN MODAL                  */}
      {/* ========================================================= */}
      {outwardingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FolderOutput className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">
                    Record Material Outward / Return
                  </h3>
                  <p className="text-xs text-slate-400">
                    Handing back documents or tokens to client with acknowledgment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOutwardingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inward Reference Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 font-mono">
                  Inward Ref: {outwardingRecord.id}
                </span>
                <span className="text-slate-400">
                  Received on {outwardingRecord.date}
                </span>
              </div>
              <div className="font-semibold text-slate-200 text-xs">
                {outwardingRecord.clientName}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {outwardingRecord.description} ({outwardingRecord.quantity})
              </p>
            </div>

            <form onSubmit={handleSaveOutward} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Outward ID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Outward Ref #
                  </label>
                  <input
                    type="text"
                    value={outwardForm.outwardId}
                    onChange={(e) => setOutwardForm({ ...outwardForm, outwardId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Dispatch Date
                  </label>
                  <input
                    type="date"
                    value={outwardForm.date}
                    onChange={(e) => setOutwardForm({ ...outwardForm, date: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Mode of Dispatch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Mode of Return
                  </label>
                  <select
                    value={outwardForm.mode}
                    onChange={(e) => setOutwardForm({ ...outwardForm, mode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hand Delivery">Hand Delivery / Client Collected</option>
                    <option value="Professional Courier">Professional Courier</option>
                    <option value="Speed Post">Speed Post / Registered Post</option>
                    <option value="Office Messenger">Office Messenger Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Courier Waybill / Docket No
                  </label>
                  <input
                    type="text"
                    value={outwardForm.courierDetails}
                    onChange={(e) => setOutwardForm({ ...outwardForm, courierDetails: e.target.value })}
                    placeholder="Leave blank if Hand Delivery"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Received By Client Representative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Acknowledged & Received By *
                  </label>
                  <input
                    type="text"
                    value={outwardForm.receivedByClient}
                    onChange={(e) => setOutwardForm({ ...outwardForm, receivedByClient: e.target.value })}
                    required
                    placeholder="Client rep name / Proprietor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Recipient Phone
                  </label>
                  <input
                    type="text"
                    value={outwardForm.clientPhone}
                    onChange={(e) => setOutwardForm({ ...outwardForm, clientPhone: e.target.value })}
                    placeholder="+91 98xxx xxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Handed Over By Staff */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Dispatched / Handed By Staff
                </label>
                <select
                  value={outwardForm.dispatchedBy}
                  onChange={(e) => setOutwardForm({ ...outwardForm, dispatchedBy: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.designation || s.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Acknowledgment Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Acknowledgment Remarks
                </label>
                <textarea
                  rows={2}
                  value={outwardForm.acknowledgmentRemarks}
                  onChange={(e) => setOutwardForm({ ...outwardForm, acknowledgmentRemarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOutwardingRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition"
                >
                  Confirm Return & Outward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PRINTABLE DELIVERY CHALLAN / INWARD ACKNOWLEDGMENT */}
      {/* ========================================================= */}
      {printingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-8 space-y-6 print:p-0 print:m-0 print:shadow-none">
            {/* Top Bar for Screen */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Print Preview: {printType === 'inward' ? 'Inward Acknowledgment' : 'Outward Delivery Challan'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPrintingRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Layout for Print */}
            <div className="space-y-6 font-sans">
              {/* Firm Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <h2 className="text-xl font-black text-slate-950 tracking-wide uppercase">
                  {firmProfile?.firmName || 'M/s. Sharma & Associates'}
                </h2>
                <p className="text-xs font-bold text-slate-600 tracking-wider">
                  CHARTERED ACCOUNTANTS &bull; FRN: {firmProfile?.frn || '129988W'} &bull; GSTIN: {firmProfile?.gstin || '27AAAAA1234F1Z1'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {firmProfile?.address || 'Suite 401, Nariman Point, Mumbai - 400021'} &bull; Tel: {firmProfile?.phone || '+91 98765 43210'} &bull; Email: {firmProfile?.email || 'contact@sharma-ca.com'}
                </p>
              </div>

              {/* Title Badge */}
              <div className="text-center">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-100 border border-slate-300 text-slate-900">
                  {printType === 'inward'
                    ? 'CLIENT MATERIAL INWARD ACKNOWLEDGMENT RECEIPT'
                    : 'MATERIAL OUTWARD DELIVERY CHALLAN & GATEPASS'}
                </span>
              </div>

              {/* Reference & Date Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Reference Number</div>
                  <div className="font-mono font-black text-slate-900 text-sm">
                    {printType === 'inward'
                      ? printingRecord.id
                      : printingRecord.outwardDetails?.outwardId || `OUT-${printingRecord.id}`}
                  </div>
                  {printType === 'outward' && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      (Against Inward Ref: {printingRecord.id})
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Document Date & Time</div>
                  <div className="font-bold text-slate-900">
                    {printType === 'inward'
                      ? `${printingRecord.date} ${printingRecord.time || ''}`
                      : `${printingRecord.outwardDetails?.date || printingRecord.date} ${printingRecord.outwardDetails?.time || ''}`}
                  </div>
                </div>
              </div>

              {/* Client & Custody Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Client Details
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {printingRecord.clientName}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    Client ID: {printingRecord.clientId || 'N/A'}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-1">
                    Contact Person: <span className="font-semibold">{printingRecord.handedBy}</span>
                  </div>
                  {printingRecord.handedByPhone && (
                    <div className="text-slate-600 text-[11px]">
                      Phone: {printingRecord.handedByPhone}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Custody & Location
                  </div>
                  <div className="text-slate-800 text-[11px]">
                    Material Category: <span className="font-bold">{printingRecord.category}</span>
                  </div>
                  <div className="text-slate-800 text-[11px] mt-1">
                    Storage Rack: <span className="font-mono font-semibold">{printingRecord.rackLocation}</span>
                  </div>
                  <div className="text-slate-800 text-[11px] mt-1">
                    Handled by Staff: <span className="font-bold">{printType === 'inward' ? printingRecord.receivedBy : (printingRecord.outwardDetails?.dispatchedBy || printingRecord.receivedBy)}</span>
                  </div>
                  {printType === 'outward' && (
                    <div className="text-slate-800 text-[11px] mt-1">
                      Dispatch Mode: <span className="font-bold">{printingRecord.outwardDetails?.mode || 'Hand Delivery'}</span>
                      {printingRecord.outwardDetails?.courierDetails && ` (${printingRecord.outwardDetails.courierDetails})`}
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Material Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3 w-12 text-center">Sr.</th>
                      <th className="py-2.5 px-3">Description of Books / Documents / Assets</th>
                      <th className="py-2.5 px-3 w-28 text-center">Quantity</th>
                      <th className="py-2.5 px-3 w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3 text-center font-mono">1</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{printingRecord.category}</div>
                        <p className="text-slate-600 mt-0.5">{printingRecord.description}</p>
                        {printingRecord.remarks && (
                          <div className="text-[10px] text-slate-500 italic mt-1">
                            Remarks: {printingRecord.remarks}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold font-mono">
                        {printingRecord.quantity}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[11px] text-slate-800">
                          {printType === 'inward' ? 'Received in Safe Custody' : 'Returned / Delivered'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legal Custody Terms */}
              <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                <div className="font-bold text-slate-700 uppercase">Custody Terms & Conditions:</div>
                <p>
                  1. The above materials/documents/tokens are held by M/s. {firmProfile?.firmName || 'Sharma & Associates'} strictly for professional Chartered Accountancy, audit, or statutory compliance purposes.
                </p>
                <p>
                  2. All original documents and digital tokens must be checked and verified by the client or authorized representative upon handover.
                </p>
                <p>
                  3. This acknowledgment slip serves as valid receipt of physical custody under professional standards of ICAI.
                </p>
              </div>

              {/* Signatures Block */}
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="text-center space-y-8">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {printType === 'inward'
                        ? printingRecord.handedBy
                        : printingRecord.outwardDetails?.receivedByClient || printingRecord.handedBy}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Client / Authorized Representative Signature
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-8">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      For {firmProfile?.firmName || 'M/s. Sharma & Associates'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Authorized Auditor / Staff Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
