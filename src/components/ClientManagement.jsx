import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Building,
  User,
  ShieldCheck,
  Eye,
  Key,
  Trash2,
  ExternalLink,
  Briefcase
} from 'lucide-react';

export default function ClientManagement({
  clients,
  searchTerm,
  setSearchTerm,
  onOpenClientDetail,
  onOpenNewClient,
  onDeleteClient
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Corporate') return matchesSearch && (c.constitution.includes('Private Limited') || c.constitution.includes('LLP'));
    if (selectedCategory === 'Firms') return matchesSearch && (c.constitution.includes('Partnership') || c.constitution.includes('Individual'));
    if (selectedCategory === 'Trusts') return matchesSearch && c.constitution.includes('Trust');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Client 360° Directory & Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centralized database of Indian tax entities, login credentials, GSTINs, PANs, and directors.
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Corporate', 'Firms', 'Trusts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {cat === 'All' ? `All Clients (${clients.length})` : cat}
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Client Name, PAN, GSTIN..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Clients Data Grid / Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Client Name & Trade Name</th>
              <th>Constitution / Type</th>
              <th>PAN & GSTIN</th>
              <th>Contact Info</th>
              <th>Turnover</th>
              <th>Assigned Staff</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400 text-xs">
                  No client records found matching "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="font-bold text-slate-100">{client.name}</div>
                    {client.tradeName && client.tradeName !== client.name && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3 text-emerald-400" />
                        {client.tradeName}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 font-medium">
                      {client.constitution}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs font-mono font-bold text-emerald-400">PAN: {client.pan}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">GST: {client.gstin}</div>
                  </td>
                  <td>
                    <div className="text-xs text-slate-200">{client.phone}</div>
                    <div className="text-[11px] text-slate-400">{client.email}</div>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-slate-200">{client.turnover}</span>
                  </td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {client.assignedStaff || 'Unassigned'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenClientDetail(client)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                        title="View Full Client 360 File"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>360 Card</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete client ${client.name}?`)) {
                            onDeleteClient(client.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
}
