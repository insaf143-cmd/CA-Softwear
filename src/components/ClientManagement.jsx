import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Building,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Key,
  Trash2,
  ExternalLink,
  Briefcase,
  Edit3,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

export default function ClientManagement({
  clients = [],
  searchTerm,
  setSearchTerm,
  onOpenClientDetail,
  onOpenNewClient,
  onOpenEditClient,
  onToggleHideClient,
  onDeleteClient,
  currentUser
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusView, setStatusView] = useState('Active'); // 'Active' | 'Resigned' | 'All'

  const canAddOrDelete =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER';

  // Count statistics
  const activeCount = clients.filter((c) => c.status !== 'Resigned' && c.status !== 'Hidden').length;
  const resignedCount = clients.filter((c) => c.status === 'Resigned' || c.status === 'Hidden').length;

  const filteredClients = clients.filter((c) => {
    // 1. Status Filter: Active vs Resigned vs All
    const isResigned = c.status === 'Resigned' || c.status === 'Hidden';
    if (statusView === 'Active' && isResigned) return false;
    if (statusView === 'Resigned' && !isResigned) return false;

    // 2. Search Filter
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(s) ||
      (c.pan && c.pan.toLowerCase().includes(s)) ||
      (c.gstin && c.gstin.toLowerCase().includes(s)) ||
      (c.tradeName && c.tradeName.toLowerCase().includes(s)) ||
      (c.id && c.id.toLowerCase().includes(s));

    if (!matchesSearch) return false;

    // 3. Category Filter
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Corporate')
      return c.constitution && (c.constitution.includes('Private Limited') || c.constitution.includes('LLP') || c.constitution.includes('Company'));
    if (selectedCategory === 'Firms')
      return c.constitution && (c.constitution.includes('Partnership') || c.constitution.includes('Individual') || c.constitution.includes('Proprietorship'));
    if (selectedCategory === 'Trusts')
      return c.constitution && (c.constitution.includes('Trust') || c.constitution.includes('Society') || c.constitution.includes('NGO'));
    return true;
  });

  // Export Client Directory to Excel
  const handleExportClients = () => {
    if (filteredClients.length === 0) {
      alert('No clients found to export.');
      return;
    }

    const headers = [
      'Client ID',
      'Client Legal Entity Name',
      'Trade Name',
      'Constitution',
      'PAN Number',
      'GSTIN',
      'TAN',
      'Contact Person',
      'Phone / Mobile',
      'Email Address',
      'Business Address',
      'Category',
      'Turnover',
      'Assigned Staff',
      'Engagement Status',
      'GST Portal User',
      'IT Portal User'
    ];

    const rows = filteredClients.map((c) => [
      c.id,
      c.name,
      c.tradeName || c.name,
      c.constitution || 'N/A',
      c.pan || 'N/A',
      c.gstin || 'N/A',
      c.tan || 'N/A',
      c.authorizedPerson || c.name,
      c.phone || '',
      c.email || '',
      c.address || '',
      c.category || 'General',
      c.turnover || '',
      c.assignedStaff || 'Unassigned',
      c.status || 'Active',
      c.portalCredentials?.gstUser || '',
      c.portalCredentials?.itUser || ''
    ]);

    const filename = `CA_Client_Vault_${statusView}_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(headers, rows, filename);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Client Vault
            </span>
            <span className="text-xs text-slate-400">
              {activeCount} Active &bull; {resignedCount} Resigned / Hidden
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            {currentUser.role === 'NORMAL_USER' ? 'My Allocated Client Files' : 'Client 360° Directory & Vault'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.role === 'NORMAL_USER'
              ? 'Files allocated to you by your CA Admin.'
              : 'Centralized database of Indian tax entities, login credentials, GSTINs, PANs, and directors.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export to Excel */}
          <button
            onClick={handleExportClients}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs shadow-md transition"
            title="Export Client Vault to Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          {/* Register New Client */}
          {canAddOrDelete && (
            <button
              onClick={onOpenNewClient}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Status Toggle & Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status View Pills */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setStatusView('Active')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                statusView === 'Active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active ({activeCount})</span>
            </button>

            <button
              onClick={() => setStatusView('Resigned')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                statusView === 'Resigned'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Resigned / Hidden ({resignedCount})</span>
            </button>

            <button
              onClick={() => setStatusView('All')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusView === 'All'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All ({clients.length})</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['All', 'Corporate', 'Firms', 'Trusts'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Local Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Client Name, PAN, GSTIN, ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Clients Data Grid / Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Client Name & ID</th>
              <th>Status</th>
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
                <td colSpan="8" className="text-center py-10 text-slate-400 text-xs">
                  {statusView === 'Resigned'
                    ? 'No clients have been marked as Resigned / Hidden.'
                    : 'No client records found matching filter/allocation rules.'}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const isResigned = client.status === 'Resigned' || client.status === 'Hidden';

                return (
                  <tr key={client.id} className={isResigned ? 'opacity-80 bg-amber-950/10' : ''}>
                    <td>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{client.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {client.id}
                        </span>
                      </div>
                      {client.tradeName && client.tradeName !== client.name && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-emerald-400" />
                          {client.tradeName}
                        </div>
                      )}
                    </td>
                    <td>
                      {isResigned ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 w-fit">
                          <EyeOff className="w-3 h-3" />
                          <span>Resigned</span>
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
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
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 360 Card */}
                        <button
                          onClick={() => onOpenClientDetail(client)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                          title="View Full Client 360 File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>360</span>
                        </button>

                        {/* Edit Client */}
                        {canAddOrDelete && onOpenEditClient && (
                          <button
                            onClick={() => onOpenEditClient(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-700/50 transition"
                            title="Edit Client Master & Credentials"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Hide / Resigned Toggle */}
                        {canAddOrDelete && onToggleHideClient && (
                          <button
                            onClick={() => onToggleHideClient(client.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              isResigned
                                ? 'text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800 border-slate-700/50'
                            }`}
                            title={
                              isResigned
                                ? 'Restore Client to Active Service'
                                : 'Hide / Mark Client as Resigned'
                            }
                          >
                            {isResigned ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Archive */}
                        {canAddOrDelete && (
                          <button
                            onClick={() => {
                              const reason = window.prompt(
                                `Move client "${client.name}" to archive list? Enter reason:`,
                                'Client requested closure'
                              );
                              if (reason !== null) {
                                onDeleteClient(client.id, reason);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                            title="Move Client to Permanent Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
  );
}
