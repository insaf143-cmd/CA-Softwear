import React from 'react';
import { Trash2, RefreshCw, AlertTriangle, ShieldCheck, Briefcase } from 'lucide-react';

export default function ClientRemovalTab({
  removedClients,
  onRestoreClient,
  onPermanentDeleteClient,
  currentUser
}) {
  const canModify = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-400" />
            Removed & Archived Clients Locker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recycle Bin archive of deleted client profiles. Super Admin & Admin can restore clients back to active status or purge permanently.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-300">
          {removedClients.length} Archived Clients
        </div>
      </div>

      {/* Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Client Name & PAN</th>
              <th>Trade Name</th>
              <th>Removal Reason</th>
              <th>Removed By</th>
              <th>Removal Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {removedClients.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                  No removed or archived client records found in recycle bin.
                </td>
              </tr>
            ) : (
              removedClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="font-bold text-slate-100">{client.name}</div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">PAN: {client.pan}</div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{client.tradeName || client.name}</span>
                  </td>
                  <td>
                    <span className="text-xs text-amber-300 italic">
                      "{client.reason || 'Requested by client / Operation closed'}"
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-slate-300">
                      {client.removedBy || 'Admin'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-400">
                      {client.removedDate || new Date().toISOString().split('T')[0]}
                    </span>
                  </td>
                  <td className="text-right">
                    {canModify && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRestoreClient(client.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                          title="Restore Client to Active Vault"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete ${client.name}? This cannot be undone!`)) {
                              onPermanentDeleteClient(client.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
