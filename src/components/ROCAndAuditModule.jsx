import React, { useState } from 'react';
import { Building, Search, CheckCircle, Clock, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export default function ROCAndAuditModule({ rocWork, setRocWork }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = rocWork.filter((item) =>
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id, newStatus) => {
    const updated = rocWork.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    setRocWork(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-400" />
            ROC & MCA Compliances & Statutory Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track AOC-4, MGT-7, DIR-3 KYC, LLP Form 11, and Audit Milestone Checklists.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ROC Form or Company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Company / Client Name</th>
              <th>Form / Filing Type</th>
              <th>Category</th>
              <th>Due Date</th>
              <th>Assigned Staff</th>
              <th>Audit Notes / Remarks</th>
              <th>Filing Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400 text-xs">
                  No ROC / MCA filing records found.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-bold text-slate-100">{item.clientName}</div>
                  </td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-slate-700 font-bold">
                      {item.formName}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 font-medium">{item.category}</span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-amber-300">{item.dueDate}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-300">{item.assignedTo}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 italic">{item.notes}</span>
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        item.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'In Progress'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <option value="Pending" className="bg-slate-900 text-slate-200">Pending</option>
                      <option value="In Progress" className="bg-slate-900 text-slate-200">In Progress</option>
                      <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
