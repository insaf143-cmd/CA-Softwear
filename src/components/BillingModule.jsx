import React, { useState } from 'react';
import { Receipt, Plus, Search, Printer, CheckCircle, Clock, FileText, X } from 'lucide-react';

export default function BillingModule({ invoices, setInvoices, clients, firmProfile }) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInv, setNewInv] = useState({
    clientId: clients[0]?.id || '',
    services: 'Professional Fees for GST Returns & Tax Audit Services',
    amount: 25000,
    isIgst: false
  });

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === newInv.clientId);
    const amt = Number(newInv.amount);
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
      clientName: client ? client.name : 'Client',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      services: newInv.services,
      amount: amt,
      cgst,
      sgst,
      igst,
      totalAmount: total,
      status: 'Pending',
      paymentMode: '-'
    };

    setInvoices([created, ...invoices]);
    setShowInvoiceModal(false);
  };

  const toggleInvoiceStatus = (id) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id
          ? { ...inv, status: inv.status === 'Paid' ? 'Pending' : 'Paid', paymentMode: inv.status === 'Paid' ? '-' : 'UPI / Bank Transfer' }
          : inv
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-400" />
            CA Professional Fee Billing & GST Invoices
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Issue tax invoices with SAC code 998222, track fee receivables, and manage client ledgers.
          </p>
        </div>

        <button
          onClick={() => setShowInvoiceModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Fee Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Billed (FY 2026-27)</span>
          <div className="text-2xl font-extrabold text-white mt-1">₹{totalInvoiced.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Fees Collected</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹{totalPaid.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Outstanding Receivables</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">₹{totalPending.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Invoice No & Date</th>
              <th>Client Name</th>
              <th>Particulars of Professional Service</th>
              <th>Taxable Fees</th>
              <th>GST (18%)</th>
              <th>Total Invoice Value</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <div className="font-bold text-slate-100">{inv.id}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{inv.date}</div>
                </td>
                <td>
                  <div className="font-bold text-slate-200">{inv.clientName}</div>
                </td>
                <td>
                  <div className="text-xs text-slate-300 max-w-xs leading-tight">{inv.services}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">SAC: 998222</div>
                </td>
                <td>
                  <span className="text-xs font-mono text-slate-200">₹{inv.amount.toLocaleString('en-IN')}</span>
                </td>
                <td>
                  <span className="text-xs font-mono text-cyan-400">
                    ₹{(inv.totalAmount - inv.amount).toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleInvoiceStatus(inv.id)}
                    className={`badge cursor-pointer ${inv.status === 'Paid' ? 'badge-paid' : 'badge-pending'}`}
                    title="Click to toggle Payment Status"
                  >
                    {inv.status}
                  </button>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => setSelectedInvoiceForPrint(inv)}
                    className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10 border border-purple-500/20 text-xs font-semibold flex items-center gap-1 ml-auto"
                    title="Print / View CA Tax Invoice"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
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
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
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
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">GST Tax Type</label>
                  <select
                    value={newInv.isIgst ? 'IGST' : 'CGST_SGST'}
                    onChange={(e) => setNewInv({ ...newInv, isIgst: e.target.value === 'IGST' })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="CGST_SGST">Intra-State (9% CGST + 9% SGST)</option>
                    <option value="IGST">Inter-State (18% IGST)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base Fee:</span>
                  <span>₹{Number(newInv.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>GST (18%):</span>
                  <span>₹{(Number(newInv.amount) * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-700">
                  <span>Total Payable:</span>
                  <span>₹{(Number(newInv.amount) * 1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal Preview */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {firmProfile?.firmName ? firmProfile.firmName.toUpperCase() : 'M/s. SHARMA & ASSOCIATES'}
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  {firmProfile?.tagline ? firmProfile.tagline.toUpperCase() : 'CHARTERED ACCOUNTANTS'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  FRN: {firmProfile?.frn || '129988W'} | GSTIN: {firmProfile?.gstin || '27AAAAA1234F1Z1'}
                </p>
                <p className="text-[11px] text-slate-500">{firmProfile?.address || 'Suite 401, Nariman Point, Mumbai - 400021'}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase rounded">
                  TAX INVOICE
                </span>
                <p className="text-xs font-bold font-mono mt-2">{selectedInvoiceForPrint.id}</p>
                <p className="text-xs text-slate-600">Date: {selectedInvoiceForPrint.date}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="p-3 bg-slate-100 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-700 uppercase">Billed To Client:</span>
              <div className="font-bold text-sm text-slate-900">{selectedInvoiceForPrint.clientName}</div>
            </div>

            {/* Line items */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-600">
                  <th className="py-2">SAC Code</th>
                  <th className="py-2">Description of Professional Services</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-3 font-mono font-bold">998222</td>
                  <td className="py-3">{selectedInvoiceForPrint.services}</td>
                  <td className="py-3 text-right font-mono font-bold">
                    ₹{selectedInvoiceForPrint.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
                {selectedInvoiceForPrint.cgst > 0 && (
                  <>
                    <tr className="text-slate-600">
                      <td colSpan="2" className="py-1 text-right">CGST (9%):</td>
                      <td className="py-1 text-right font-mono">₹{selectedInvoiceForPrint.cgst.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="text-slate-600">
                      <td colSpan="2" className="py-1 text-right">SGST (9%):</td>
                      <td className="py-1 text-right font-mono">₹{selectedInvoiceForPrint.sgst.toLocaleString('en-IN')}</td>
                    </tr>
                  </>
                )}
                {selectedInvoiceForPrint.igst > 0 && (
                  <tr className="text-slate-600">
                    <td colSpan="2" className="py-1 text-right">IGST (18%):</td>
                    <td className="py-1 text-right font-mono">₹{selectedInvoiceForPrint.igst.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className="font-bold text-sm border-t-2 border-slate-900">
                  <td colSpan="2" className="py-3 text-right">Total Invoice Amount:</td>
                  <td className="py-3 text-right font-mono text-emerald-700">
                    ₹{selectedInvoiceForPrint.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Footer / Bank Info */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-600">
              <div>
                <p className="font-bold text-slate-800">Bank Transfer Details:</p>
                <p>Bank: HDFC Bank | A/C: 50200011223344 | IFSC: HDFC0000240</p>
                <p>UPI ID: cadesk@hdfcbank</p>
              </div>
              <div className="text-center">
                <div className="h-10 border-b border-slate-400 mb-1 w-32"></div>
                <p className="font-bold text-slate-800">For {firmProfile?.firmName || 'Sharma & Associates'}</p>
                <p className="text-[10px]">Partner ({firmProfile?.partnerName || 'CA Rajesh Sharma'})</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
