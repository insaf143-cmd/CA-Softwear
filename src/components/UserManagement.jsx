import React, { useState } from 'react';
import {
  ShieldAlert,
  UserPlus,
  Users,
  Lock,
  Unlock,
  CheckCircle,
  Mail,
  Phone,
  X,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { clearAllDataAndStartFresh } from '../utils/storage';

export default function UserManagement({ users, setUsers, currentUser, clients }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserPass, setEditingUserPass] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPass, setShowPass] = useState({});

  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'NORMAL_USER',
    designation: 'Article Assistant',
    mobile: '',
    allocatedClientIds: []
  });

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN';

  const toggleShowPass = (userId) => {
    setShowPass((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleToggleBlockUser = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (targetUser.role === 'SUPER_ADMIN' && currentUser.id !== targetUser.id) {
      alert('Only Super Admin can modify another Super Admin!');
      return;
    }
    if (targetUser.role === 'ADMIN' && !isSuperAdmin) {
      alert('Only Super Admin can block or modify Admins!');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Blocked' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own logged-in account!');
      return;
    }
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (
      window.confirm(
        `Are you sure you want to permanently delete user "${target.name}" (ID: ${userId})?`
      )
    ) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPasswordVal.trim()) return;

    const updated = users.map((u) =>
      u.id === editingUserPass.id ? { ...u, password: newPasswordVal.trim() } : u
    );
    setUsers(updated);
    setEditingUserPass(null);
    setNewPasswordVal('');
    alert(`Password for ${editingUserPass.name} (ID: ${editingUserPass.id}) updated successfully!`);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();

    const cleanId = newUser.id.trim().toUpperCase();
    if (!cleanId) {
      alert('Please enter a unique User ID (Login ID).');
      return;
    }

    // Check if User ID already exists
    if (users.some((u) => u.id.toUpperCase() === cleanId)) {
      alert(`User ID "${cleanId}" is already taken! Please choose another unique User ID.`);
      return;
    }

    if (!newUser.name.trim()) {
      alert('Please enter Full Name.');
      return;
    }

    if (!newUser.password.trim()) {
      alert('Please set a Password for the user.');
      return;
    }

    const created = {
      ...newUser,
      id: cleanId,
      name: newUser.name.trim(),
      email: newUser.email.trim() || `${cleanId.toLowerCase()}@cadesk.in`,
      password: newUser.password.trim(),
      designation: newUser.designation.trim() || 'Staff Member',
      status: 'Active'
    };

    setUsers([...users, created]);
    setShowAddModal(false);
    setNewUser({
      id: '',
      name: '',
      email: '',
      password: '',
      role: 'NORMAL_USER',
      designation: 'Article Assistant',
      mobile: '',
      allocatedClientIds: []
    });

    alert(`User "${created.name}" created successfully!\n\nUser ID: ${created.id}\nPassword: ${created.password}\nRole: ${created.role}`);
  };

  const toggleClientAllocation = (clientId) => {
    setNewUser((prev) => {
      const exists = prev.allocatedClientIds.includes(clientId);
      if (exists) {
        return {
          ...prev,
          allocatedClientIds: prev.allocatedClientIds.filter((id) => id !== clientId)
        };
      } else {
        return {
          ...prev,
          allocatedClientIds: [...prev.allocatedClientIds, clientId]
        };
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-400" />
            User ID, Password & Access Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create firm users with custom User IDs and Passwords. Assign roles: Admin, Manager, or Article Assistant.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Start Fresh Button */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    '⚠️ ARE YOU SURE?\n\nThis will clear all dummy clients, dummy tasks, and sample users, giving you a 100% FRESH START with a clean database.\n\nYou will keep 1 Master Admin account:\nUser ID: ADMIN01\nPassword: admin\n\nProceed to launch fresh?'
                  )
                ) {
                  clearAllDataAndStartFresh();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition"
              title="Wipe demo data and start 100% clean"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Launch Fresh (Clear All Data)</span>
            </button>
          )}

          {/* Create User Button */}
          {(isSuperAdmin || isAdmin) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User (ID & Password)</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-3.5">User ID & Name</th>
                <th className="p-3.5">Email & Mobile</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">System Password</th>
                <th className="p-3.5">Allocated Clients</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        ID: {u.id}
                      </span>
                      {currentUser.id === u.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          Current Account
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-100 text-sm">{u.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{u.designation}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-xs text-slate-200">{u.email}</div>
                    <div className="text-[11px] text-slate-400">{u.mobile || '-'}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : u.role === 'ADMIN'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : u.role === 'MANAGER'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {u.role === 'SUPER_ADMIN'
                        ? 'Super Admin'
                        : u.role === 'ADMIN'
                        ? 'Admin'
                        : u.role === 'MANAGER'
                        ? 'Manager'
                        : 'User (Staff)'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {/* Password with Show/Hide Toggle */}
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-bold text-amber-300">
                        {showPass[u.id] ? u.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => toggleShowPass(u.id)}
                        className="text-slate-400 hover:text-amber-400 transition"
                        title="Show/Hide Password"
                      >
                        {showPass[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {(isSuperAdmin || (isAdmin && u.role === 'NORMAL_USER')) && (
                        <button
                          onClick={() => {
                            setEditingUserPass(u);
                            setNewPasswordVal(u.password);
                          }}
                          className="text-amber-400 hover:text-amber-300 text-[11px] underline ml-1"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {u.allocatedClientIds ? u.allocatedClientIds.length : 0} Files
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {currentUser.id !== u.id && (
                        <>
                          <button
                            onClick={() => handleToggleBlockUser(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              u.status === 'Active'
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                            }`}
                          >
                            {u.status === 'Active' ? 'Block' : 'Unblock'}
                          </button>

                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User & Password Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 md:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Create New User (Set User ID & Password)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* User ID & Password in first row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    User ID (Login Username) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.id}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        id: e.target.value.toUpperCase().replace(/\s+/g, '_')
                      })
                    }
                    placeholder="e.g. ROHAN, CA01, MGR1, STAFF10"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 uppercase"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Unique ID for user to log in.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Login Password <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="e.g. StaffPass@123"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Password given to this user.
                  </span>
                </div>
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Rohan Gupta"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                    placeholder="e.g. Senior Article Assistant"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* User Role */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  User Role & Permissions <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="NORMAL_USER">
                    Normal User / Article Staff (Restricted ONLY to allocated works)
                  </option>
                  <option value="MANAGER">
                    Manager (Reviews submitted work, approves, or transfers department)
                  </option>
                  {(isSuperAdmin || isAdmin) && (
                    <option value="ADMIN">
                      Admin (Can create/allocate work, view all reports, manage users)
                    </option>
                  )}
                  {isSuperAdmin && (
                    <option value="SUPER_ADMIN">
                      Super Admin (Managing Partner - Complete firm control)
                    </option>
                  )}
                </select>
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="rohan@cadesk.in"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={newUser.mobile}
                    onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Allocated Clients Selection (if any exist) */}
              {clients && clients.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Allocate Client Files to User:
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-800/60 rounded-xl border border-slate-700">
                    {clients.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
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
              )}

              {/* Submit Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-950/50 transition"
                >
                  Save User & Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {editingUserPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                Change Password for {editingUserPass.name} (ID: {editingUserPass.id})
              </h3>
              <button onClick={() => setEditingUserPass(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Password for User ID: <strong className="text-emerald-400 font-mono">{editingUserPass.id}</strong>
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUserPass(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-lg"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
