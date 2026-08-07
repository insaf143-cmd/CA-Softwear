import React, { useState } from 'react';
import { ShieldAlert, UserPlus, Users, Lock, Unlock, CheckCircle, Mail, Phone, X, ShieldCheck } from 'lucide-react';

export default function UserManagement({ users, setUsers, currentUser, clients }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'NORMAL_USER',
    designation: 'Article Trainee',
    mobile: '',
    allocatedClientIds: []
  });

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN';

  const handleToggleBlockUser = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    // Permissions check
    if (targetUser.role === 'SUPER_ADMIN' && currentUser.id !== targetUser.id) {
      alert('Only Super Admin can modify another Super Admin!');
      return;
    }
    if (targetUser.role === 'ADMIN' && !isSuperAdmin) {
      alert('Only Super Admin can block or modify Admins!');
      return;
    }

    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Blocked' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const created = {
      ...newUser,
      id: `U${users.length + 1}`,
      status: 'Active'
    };
    setUsers([...users, created]);
    setShowAddModal(false);
    setNewUser({
      name: '',
      email: '',
      role: 'NORMAL_USER',
      designation: 'Article Trainee',
      mobile: '',
      allocatedClientIds: []
    });
  };

  const toggleClientAllocation = (clientId) => {
    setNewUser((prev) => {
      const exists = prev.allocatedClientIds.includes(clientId);
      if (exists) {
        return { ...prev, allocatedClientIds: prev.allocatedClientIds.filter(id => id !== clientId) };
      } else {
        return { ...prev, allocatedClientIds: [...prev.allocatedClientIds, clientId] };
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            User Management & Role Control Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin & Admin control to create team members, assign client permissions, and block/unblock accounts.
          </p>
        </div>

        {(isSuperAdmin || isAdmin) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/50 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="ca-table-container">
        <table className="ca-table">
          <thead>
            <tr>
              <th>User Name & Designation</th>
              <th>Email & Mobile</th>
              <th>User Role</th>
              <th>Account Status</th>
              <th>Allocated Clients Count</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    {u.name}
                    {currentUser.id === u.id && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{u.designation}</div>
                </td>
                <td>
                  <div className="text-xs text-slate-200">{u.email}</div>
                  <div className="text-[11px] text-slate-400">{u.mobile}</div>
                </td>
                <td>
                  <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase ${
                    u.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                    u.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'Normal User (Article)'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.status === 'Active' ? 'badge-filed' : 'badge-urgent'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {u.allocatedClientIds ? u.allocatedClientIds.length : 0} Clients Allocated
                  </span>
                </td>
                <td className="text-right">
                  {currentUser.id !== u.id && (
                    <button
                      onClick={() => handleToggleBlockUser(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition ${
                        u.status === 'Active'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                      }`}
                      title={u.status === 'Active' ? 'Block User Account' : 'Unblock User Account'}
                    >
                      {u.status === 'Active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{u.status === 'Active' ? 'Block Access' : 'Unblock Access'}</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                Add New Staff Member / User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Neha Sharma"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                    placeholder="e.g. Article Trainee / Tax Assistant"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="neha@cadesk.in"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={newUser.mobile}
                    onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">User Role Permission</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                >
                  <option value="NORMAL_USER">Normal User (Article Assistant - Restricted to allocated files)</option>
                  {isSuperAdmin && <option value="ADMIN">Admin (Can assign work & create users)</option>}
                  {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin (Full system control)</option>}
                </select>
              </div>

              {/* Allocated Clients Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Allocate Clients to User (Select files user can access):
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-800/60 rounded-xl border border-slate-700">
                  {clients.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={newUser.allocatedClientIds.includes(c.id)}
                        onChange={() => toggleClientAllocation(c.id)}
                        className="rounded accent-emerald-500"
                      />
                      <span>{c.name} ({c.pan})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-lg"
                >
                  Create & Allocate User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
