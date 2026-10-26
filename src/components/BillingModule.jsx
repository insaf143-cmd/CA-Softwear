import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  CheckCircle,
  Clock,
  FileText,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowRight,
  History
} from 'lucide-react';

export default function BillingModule({ invoices, setInvoices, clients = [], firmProfile }) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [recordingPaymentInvoice, setRecordingPaymentInvoice] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Partially Paid' | 'Paid'
  const [searchQuery, setSearchQuery] = useState('');

  // New Invoice Form
  const [newInv, setNewInv] = useState({
    clientId: clients[0]?.id || '',
    services: 'Professional Fees for GST Returns & Tax Audit Services',
    amount: 25000,
    isIgst: false
  });

  // Payment Recording Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'UPI / GPay / PhonePe',
    refNo: '',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  // Financial Computations
  const computedInvoices = invoices.map((inv) => {
    const total = Number(inv.totalAmount || 0);
    let paid = Number(inv.paidAmount ?? (inv.status === 'Paid' ? total : 0));
    const balance = Math.max(0, total - paid);
    let derivedStatus = inv.status;
    if (paid >= total && total > 0) derivedStatus = 'Paid';
    else if (paid > 0 && balance > 0) derivedStatus = 'Partially Paid';
    else if (paid === 0) derivedStatus = 'Pending';

    return {
      ...inv,
      totalAmount: total,
      paidAmount: paid,
      balanceAmount: balance,
      status: derivedStatus,
      paymentMode: inv.paymentMode || (derivedStatus === 'Paid' ? 'Bank Transfer' : '-')
    };
  });

  const totalInvoiced = computedInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCollected = computedInvoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalReceivable = computedInvoices.reduce((acc, curr) => acc + curr.balanceAmount, 0);

  const pendingCount = computedInvoices.filter((i) => i.status === 'Pending').length;
  const partialCount = computedInvoices.filter((i) => i.status === 'Partially Paid').length;
  const paidCount = computedInvoices.filter((i) => i.status === 'Paid').length;

  // Filtered List
  const filteredInvoices = computedInvoices.filter((inv) => {
    const matchesFilter =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Pending'
        ? inv.status === 'Pending'
        : statusFilter === 'Partially Paid'
        ? inv.status === 'Partially Paid'
        : inv.status === 'Paid';

    const matchesSearch =
      inv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.services?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.paymentMode?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === newInv.clientId);
    const amt = Number(newInv.amount || 0);
    let cgst = 0, sgst = 0, igst = 0;

    if (newInv.isIgst) {
      igst = amt * 0.18;
    } else {
      cgst = amt * 0.09;
      sgst = amt * 0.09;
    }
    const total = amt + cgst + sgst + igst;

    const created = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: newInv.clientId,
      clientName: client ? client.name : (clients[0]?.name || 'Client'),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      services: newInv.services,
      amount: amt,
      cgst,
      sgst,
      igst,
      totalAmount: total,
      paidAmount: 0,
      balanceAmount: total,
      status: 'Pending',
      paymentMode: '-',
      paymentHistory: []
    };

    setInvoices([created, ...invoices]);
    setShowInvoiceModal(false);
  };

  const handleOpenPaymentModal = (invoice) => {
    setRecordingPaymentInvoice(invoice);
    setPaymentForm({
      amount: invoice.balanceAmount,
      paymentMode: 'UPI / GPay / PhonePe',
      refNo: '',
      date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!recordingPaymentInvoice) return;

    const payAmt = Number(paymentForm.amount || 0);
    if (payAmt <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }

    const currentPaid = Number(recordingPaymentInvoice.paidAmount || 0);
    const totalAmt = Number(recordingPaymentInvoice.totalAmount || 0);
    const newPaid = Math.min(totalAmt, currentPaid + payAmt);
    const newBalance = Math.max(0, totalAmt - newPaid);

    let newStatus = 'Pending';
    if (newBalance === 0) newStatus = 'Paid';
    else if (newPaid > 0) newStatus = 'Partially Paid';

    const paymentRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      date: paymentForm.date,
      amount: payAmt,
      mode: paymentForm.paymentMode,
      refNo: paymentForm.refNo.trim() || 'N/A',
      remarks: paymentForm.remarks.trim() || 'Fee payment'
    };

    const history = recordingPaymentInvoice.paymentHistory || [];

    const updated = invoices.map((inv) => {
      if (inv.id === recordingPaymentInvoice.id) {
        return {
          ...inv,
          paidAmount: newPaid,
          balanceAmount: newBalance,
          status: newStatus,
          paymentMode: paymentForm.paymentMode,
          paymentHistory: [...history, paymentRecord]
        };
      }
      return inv;
    });

    setInvoices(updated);
    setRecordingPaymentInvoice(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0e172f]/90 p-5 rounded-2xl border border-blue-900/60 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            <span>CA Fee Ledger & Professional Invoices</span>
          </h2>
          <p className="text-xs text-blue-200/70 mt-1">
            Track fee receivables, record full or partial payments, select payment modes, and issue tax invoices (SAC 998222).
          </p>
        </div>

        <button
          onClick={() => setShowInvoiceModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Raise Fee Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e172f] border border-blue-900/50 shadow-lg">
          <span className="text-xs font-semibold text-blue-300">Total Billed Fees</span>
          <div className="text-2xl font-black text-white mt-1">₹{totalInvoiced.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-blue-400/80 mt-0.5">{invoices.length} Invoices Issued</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e172f] border border-emerald-500/30 shadow-lg">
          <span className="text-xs font-semibold text-emerald-300">Fees Collected</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{totalCollected.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-500/80 mt-0.5">{paidCount} Fully Paid &bull; {partialCount} Partial</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e172f] border border-amber-500/30 shadow-lg">
          <span className="text-xs font-semibold text-amber-300">Outstanding Receivables</span>
          <div className="text-2xl font-black text-amber-400 mt-1">₹{totalReceivable.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">{pendingCount} Unpaid &bull; Balance Due</div>
        </div>
      </div>

      {/* Filter Buttons & Search Controls */}
      <div className="p-3 bg-[#0e172f] rounded-2xl border border-blue-900/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
        {/* Payment Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0a1128] rounded-xl border border-blue-950 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'All'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Invoices ({computedInvoices.length})
          </button>

          <button
            onClick={() => setStatusFilter('Pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'Pending'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>Pending Payment ({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('Partially Paid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'Partially Paid'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Partially Paid ({partialCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('Paid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'Paid'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paid Payment ({paidCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, invoice #, mode..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a1128] border border-blue-900/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#0e172f] rounded-2xl border border-blue-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0a1128] text-[11px] uppercase font-bold text-slate-400 border-b border-blue-900/60">
              <tr>
                <th className="p-3.5">Invoice # & Date</th>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5">Services Rendered</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Paid Amount</th>
                <th className="p-3.5">Balance Due</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/40">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-500 text-xs">
                    No fee invoices match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-950/40 transition">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-amber-400">{inv.id}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{inv.date}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-100">
                      {inv.clientName}
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="line-clamp-2 text-slate-200">{inv.services}</div>
                      <div className="text-[10px] text-blue-400/80 font-mono mt-0.5">SAC: 998222</div>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-white">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      ₹{inv.paidAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 font-mono font-bold">
                      {inv.balanceAmount > 0 ? (
                        <span className="text-amber-400">₹{inv.balanceAmount.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-slate-500">Nil</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#0a1128] text-blue-300 border border-blue-900">
                        {inv.paymentMode}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : inv.status === 'Partially Paid'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {inv.status === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                        {inv.status === 'Partially Paid' && <CreditCard className="w-3 h-3" />}
                        {inv.status === 'Pending' && <Clock className="w-3 h-3" />}
                        <span>{inv.status}</span>
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-sm flex items-center gap-1"
                            title="Record Full or Partial Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Collect Fee</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/70 text-blue-200 border border-blue-800 text-xs font-semibold transition flex items-center gap-1"
                          title="Print / View CA Tax Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment / Partial Payment Modal */}
      {recordingPaymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#0e172f] border border-blue-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Fee Collection / Payment</h3>
                  <p className="text-xs text-blue-200/70">
                    Invoice: <span className="font-mono text-amber-400">{recordingPaymentInvoice.id}</span> &bull; {recordingPaymentInvoice.clientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecordingPaymentInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview Pill */}
            <div className="p-3.5 rounded-2xl bg-[#0a1128] border border-blue-900 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[11px] text-slate-400">Total Bill</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  ₹{recordingPaymentInvoice.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-emerald-400">Already Paid</span>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  ₹{recordingPaymentInvoice.paidAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-amber-400">Balance Due</span>
                <div className="font-mono font-black text-amber-400 mt-0.5">
                  ₹{recordingPaymentInvoice.balanceAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              {/* Payment Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-200 font-semibold">Payment Amount to Collect (₹) *</label>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, amount: recordingPaymentInvoice.balanceAmount })}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
                  >
                    Pay Full Balance (₹{recordingPaymentInvoice.balanceAmount.toLocaleString('en-IN')})
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max={recordingPaymentInvoice.balanceAmount}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder={`Max ₹${recordingPaymentInvoice.balanceAmount}`}
                  className="w-full px-3.5 py-2.5 bg-[#0a1128] border border-blue-800 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Mode of Payment */}
              <div>
                <label className="block text-slate-200 font-semibold mb-1">Mode of Payment *</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="UPI / GPay / PhonePe">UPI / Google Pay / PhonePe / Paytm</option>
                  <option value="NEFT / RTGS / Net Banking">NEFT / RTGS / IMPS Bank Transfer</option>
                  <option value="Cash">Cash Receipt</option>
                  <option value="Bank Cheque">Bank Cheque</option>
                  <option value="Demand Draft">Demand Draft (DD)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card (POS)</option>
                </select>
              </div>

              {/* Reference Number & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    UTR / Cheque / Transaction Ref No
                  </label>
                  <input
                    type="text"
                    value={paymentForm.refNo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, refNo: e.target.value })}
                    placeholder="e.g. UTR-99881122 or Chq #001248"
                    className="w-full px-3 py-2 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ledger Notes / Remarks</label>
                <input
                  type="text"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="e.g. Received part payment via UPI against GSTR-3B audit fees"
                  className="w-full px-3 py-2 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-blue-900/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRecordingPaymentInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Confirm & Update Fee Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e172f] border border-blue-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                Generate CA Professional Fee Invoice
              </h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Client</label>
                <select
                  value={newInv.clientId}
                  onChange={(e) => setNewInv({ ...newInv, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.pan || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Particulars of Services Rendered</label>
                <input
                  type="text"
                  required
                  value={newInv.services}
                  onChange={(e) => setNewInv({ ...newInv, services: e.target.value })}
                  placeholder="e.g. Professional Fees for Statutory Audit FY 2025-26"
                  className="w-full px-3 py-2 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Taxable Professional Fees (₹)</label>
                  <input
                    type="number"
                    required
                    value={newInv.amount}
                    onChange={(e) => setNewInv({ ...newInv, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">GST Tax Type</label>
                  <select
                    value={newInv.isIgst ? 'IGST' : 'CGST_SGST'}
                    onChange={(e) => setNewInv({ ...newInv, isIgst: e.target.value === 'IGST' })}
                    className="w-full px-3 py-2 bg-[#0a1128] border border-blue-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="CGST_SGST">Intra-State (9% CGST + 9% SGST)</option>
                    <option value="IGST">Inter-State (18% IGST)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0a1128] border border-blue-900 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base Fee:</span>
                  <span>₹{Number(newInv.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>GST (18%):</span>
                  <span>₹{(Number(newInv.amount) * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-400 pt-1 border-t border-blue-900">
                  <span>Total Payable:</span>
                  <span>₹{(Number(newInv.amount) * 1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">
                  {firmProfile?.firmName || 'M/s. SK ASSOCIATES'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold">
                  {firmProfile?.tagline || 'Chartered Accountants'} &bull; FRN: {firmProfile?.frn || '129988W'}
                </p>
                <p className="text-[11px] text-slate-500">{firmProfile?.address || 'Main Office Road, City'}</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="text-slate-400 hover:text-slate-700 print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Billed To:</span>
                <div className="font-bold text-sm text-slate-900 mt-1">{selectedInvoiceForPrint.clientName}</div>
                <div className="text-slate-600 font-mono text-[11px] mt-0.5">ID: {selectedInvoiceForPrint.clientId}</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Invoice Details:</span>
                <div className="font-mono font-bold text-sm text-blue-900 mt-1">{selectedInvoiceForPrint.id}</div>
                <div className="text-slate-600 text-[11px]">Date: {selectedInvoiceForPrint.date}</div>
                <div className="text-slate-600 text-[11px]">Due Date: {selectedInvoiceForPrint.dueDate}</div>
              </div>
            </div>

            {/* Service & Tax Details */}
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3 text-left">Description of Professional Service</th>
                  <th className="p-3 text-center">SAC Code</th>
                  <th className="p-3 text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{selectedInvoiceForPrint.services}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Statutory verification, documentation & compliance fees.</div>
                  </td>
                  <td className="p-3 text-center font-mono text-slate-600">998222</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    ₹{selectedInvoiceForPrint.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 border-t pt-2 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Value:</span>
                  <span>₹{selectedInvoiceForPrint.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span>₹{(selectedInvoiceForPrint.totalAmount - selectedInvoiceForPrint.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-blue-900 border-t pt-1.5">
                  <span>Total Amount:</span>
                  <span>₹{selectedInvoiceForPrint.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Paid Amount:</span>
                  <span>₹{(selectedInvoiceForPrint.paidAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-red-700 font-black border-t pt-1">
                  <span>Balance Due:</span>
                  <span>₹{(selectedInvoiceForPrint.balanceAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px] pt-1">
                  <span>Payment Mode:</span>
                  <span className="font-semibold text-slate-900">{selectedInvoiceForPrint.paymentMode}</span>
                </div>
              </div>
            </div>

            {/* Payment History if exists */}
            {selectedInvoiceForPrint.paymentHistory && selectedInvoiceForPrint.paymentHistory.length > 0 && (
              <div className="border-t pt-3 text-xs">
                <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1.5">
                  Payment Collection History:
                </span>
                <div className="space-y-1">
                  {selectedInvoiceForPrint.paymentHistory.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded">
                      <span>{p.date} &bull; {p.mode} ({p.refNo})</span>
                      <span className="font-mono font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Payment terms: Strictly payable within 15 days of presentation.</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 print:hidden flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
