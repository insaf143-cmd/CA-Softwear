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
  Sparkles,
  Building2,
  UploadCloud,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { clearAllDataAndStartFresh, addDeletedUserId, getDefaultTabsForRole } from '../utils/storage';
import { isFirebaseConfigured } from '../config/firebase';
import { registerWithFirebaseAuth, provisionStaffToFirebaseAuth } from '../services/firebaseAuthService';
import { deleteSingleUserFromFirebase } from '../services/firebaseService';

export const AVAILABLE_MODULE_TABS = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Firm overview, statistics, and shortcuts' },
  { id: 'tasks', label: 'Work Allocation & Tasks', desc: 'Job allocation, submissions, approvals' },
  { id: 'reports', label: 'Practice Reports', desc: 'Category-wise, staff performance, certificates' },
  { id: 'evidence', label: 'Evidence & Documents Vault', desc: 'Store bank statements, balance sheets, evidence' },
  { id: 'inwardOutward', label: 'Inward / Outward Register', desc: 'Material custody, books, DSC token register' },
  { id: 'clients', label: 'Client 360° Directory', desc: 'Client master, PAN, GSTIN, directors, portal passwords' },
  { id: 'gst', label: 'GST Compliance Module', desc: 'GSTR-1, 3B, 9 annual return tracking' },
  { id: 'it', label: 'Income Tax (ITR) Module', desc: 'ITR-1 to 7 e-filing tracker & tax calculator' },
  { id: 'roc', label: 'ROC & Statutory Audit', desc: 'MCA compliance, AOC-4, MGT-7, Form 3CD' },
  { id: 'billing', label: 'Billing & Fee Ledger', desc: 'Raise bills, track payments, partial payments' },
  { id: 'calendar', label: 'Compliance Calendar', desc: 'Statutory due dates calendar' },
  { id: 'users', label: 'Staff & Role Control', desc: 'Manage user credentials and tab access permissions' }
];

export { getDefaultTabsForRole };

export default function UserManagement({
  users,
  setUsers,
  currentUser,
  clients,
  onOpenFirmSettings
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserPass, setEditingUserPass] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPass, setShowPass] = useState({});
  const [syncingAuth, setSyncingAuth] = useState(false);
  const [clearingFresh, setClearingFresh] = useState(false);
  const [clearingStep, setClearingStep] = useState('');

  // Tab Access Control State
  const [editingUserTabs, setEditingUserTabs] = useState(null);
  const [selectedTabsForEdit, setSelectedTabsForEdit] = useState([]);

  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'NORMAL_USER',
    designation: 'Article Assistant',
    mobile: '',
    allocatedClientIds: [],
    allowedTabs: getDefaultTabsForRole('NORMAL_USER')
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

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own logged-in account!');
      return;
    }
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (
      !window.confirm(
        `⚠️ PERMANENTLY DELETE USER ACCOUNT?\n\nUser Name: "${target.name}"\nLogin ID: ${userId}\nRole: ${target.role}\n\nThis will completely delete this user from:\n✓ Local Staff Directory\n✓ Central LAN Database\n✓ Google Firebase Cloud Database\n\nThe deleted user will be permanently blocked from logging in.`
      )
    ) {
      return;
    }

    // 1. Mark as permanently deleted in storage blacklist so it can never resurrect
    addDeletedUserId(userId);

    // 2. Remove from React state & local storage
    const remaining = users.filter((u) => u.id !== userId);
    setUsers(remaining);

    // 3. Delete from Google Firebase Firestore
    if (isFirebaseConfigured) {
      try {
        await deleteSingleUserFromFirebase(userId);
        console.log(`[Firebase AutoSync] User ${userId} successfully deleted from cloud.`);
      } catch (err) {
        console.warn(`[Firebase AutoSync] Error deleting user ${userId}:`, err);
      }
    }

    alert(`User "${target.name}" (ID: ${userId}) deleted successfully.\n\nThey have been blocked and deleted across local, Central LAN, and Firebase Cloud.`);
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

    const finalAllowedTabs =
      newUser.allowedTabs && newUser.allowedTabs.length > 0
        ? newUser.allowedTabs
        : getDefaultTabsForRole(newUser.role);

    const created = {
      ...newUser,
      id: cleanId,
      name: newUser.name.trim(),
      email: newUser.email.trim() || `${cleanId.toLowerCase()}@cadesk.in`,
      password: newUser.password.trim(),
      designation: newUser.designation.trim() || 'Staff Member',
      status: 'Active',
      allowedTabs: finalAllowedTabs
    };

    setUsers([...users, created]);

    // Also register in Firebase Auth if connected
    if (isFirebaseConfigured && created.email && created.password) {
      registerWithFirebaseAuth(created.email, created.password, created.name).catch((err) => {
        console.warn('Firebase Auth user creation warning:', err);
      });
    }

    setShowAddModal(false);
    setNewUser({
      id: '',
      name: '',
      email: '',
      password: '',
      role: 'NORMAL_USER',
      designation: 'Article Assistant',
      mobile: '',
      allocatedClientIds: [],
      allowedTabs: getDefaultTabsForRole('NORMAL_USER')
    });

    alert(`User "${created.name}" created successfully!\n\nUser ID: ${created.id}\nPassword: ${created.password}\nRole: ${created.role}\nAllowed Modules: ${finalAllowedTabs.length} tabs${isFirebaseConfigured ? '\n\n✓ Account synced to Firebase Authentication!' : ''}`);
  };

  const handleSaveUserTabs = (e) => {
    e.preventDefault();
    if (!editingUserTabs) return;

    if (selectedTabsForEdit.length === 0) {
      alert('Please select at least 1 module tab for this user!');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === editingUserTabs.id) {
        return {
          ...u,
          allowedTabs: selectedTabsForEdit
        };
      }
      return u;
    });

    setUsers(updated);
    alert(`Tab access permissions updated for "${editingUserTabs.name}"!\n\nAllowed Modules: ${selectedTabsForEdit.length} tabs.`);
    setEditingUserTabs(null);
  };

  const handleSyncToFirebaseAuth = async () => {
    setSyncingAuth(true);
    try {
      const results = await provisionStaffToFirebaseAuth(users);
      alert(
        `Firebase Authentication Sync Complete!\n\n` +
        `• Created in Firebase: ${results.created}\n` +
        `• Already existed: ${results.alreadyExists}\n` +
        `• Errors/Failed: ${results.failed}\n\n` +
        `Open Firebase Console -> Authentication -> Users to see all staff!`
      );
    } catch (err) {
      alert(`Firebase Auth sync failed: ${err.message}`);
    } finally {
      setSyncingAuth(false);
    }
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
              disabled={clearingFresh}
              onClick={async () => {
                if (
                  !window.confirm(
                    '⚠️ ARE YOU SURE YOU WANT A 100% FRESH START?\n\nThis will completely purge all dummy clients, dummy tasks, and sample users.\n\n✓ Local browser cache will be wiped clean\n✓ Central Server LAN database will be wiped clean\n✓ Google Firebase Cloud database will be wiped clean\n\nYou will keep 1 Master Admin account:\nUser ID: ADMIN01\nPassword: admin\n\nProceed to launch fresh?'
                  )
                ) {
                  return;
                }
                setClearingFresh(true);
                setClearingStep('Initiating database wipe...');
                try {
                  await clearAllDataAndStartFresh((msg) => setClearingStep(msg));
                } catch (err) {
                  alert('Error during fresh launch: ' + err.message);
                  setClearingFresh(false);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition disabled:opacity-50"
              title="Wipe demo data across local, central server, and Firebase"
            >
              {clearingFresh ? (
                <>
                  <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
                  <span>{clearingStep || 'Wiping All Data...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Launch Fresh (Clear All Data)</span>
                </>
              )}
            </button>
          )}

          {/* Edit Company Profile Button */}
          {onOpenFirmSettings && (isSuperAdmin || isAdmin) && (
            <button
              type="button"
              onClick={onOpenFirmSettings}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
              title="Change Firm Name, Tagline, FRN, GSTIN, and Address"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Edit Company Profile</span>
            </button>
          )}

          {/* Sync Staff to Firebase Auth */}
          {isFirebaseConfigured && (isSuperAdmin || isAdmin) && (
            <button
              type="button"
              onClick={handleSyncToFirebaseAuth}
              disabled={syncingAuth}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
              title="Register and sync all staff to Firebase Authentication"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>{syncingAuth ? 'Syncing...' : 'Sync Staff to Firebase Auth'}</span>
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
        {/* Table Action Header */}
        <div className="p-4 bg-slate-850 bg-slate-800/80 border-b border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Firm Staff & User Accounts ({users.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Manage User IDs, passwords, roles, and Firebase Cloud Authentication access.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Sync to Firebase Auth Button */}
            <button
              type="button"
              onClick={handleSyncToFirebaseAuth}
              disabled={syncingAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-950/40 transition"
              title="Register and sync all staff to Firebase Authentication"
            >
              <UploadCloud className="w-4 h-4 text-slate-950" />
              <span>{syncingAuth ? 'Syncing...' : '⚡ Sync Staff to Firebase Auth'}</span>
            </button>

            {/* Create User Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create User</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-3.5">User ID & Name</th>
                <th className="p-3.5">Email & Mobile</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">System Password</th>
                <th className="p-3.5">Module Tab Access</th>
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
                    <button
                      onClick={() => {
                        setEditingUserTabs(u);
                        setSelectedTabsForEdit(u.allowedTabs || getDefaultTabsForRole(u.role));
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
                      title="Click to add or remove module tabs access for this user"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {u.allowedTabs ? `${u.allowedTabs.length} Tabs Allowed` : `${getDefaultTabsForRole(u.role).length} Tabs (Role Default)`}
                      </span>
                    </button>
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

              {/* Tab Access Permissions Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-200 font-semibold text-xs">
                    Allowed Module Tabs <span className="text-amber-400">*</span>
                  </label>
                  <div className="flex gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setNewUser({
                          ...newUser,
                          allowedTabs: AVAILABLE_MODULE_TABS.map((t) => t.id)
                        })
                      }
                      className="text-amber-400 hover:underline"
                    >
                      Allow All
                    </button>
                    <span className="text-slate-600">&bull;</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewUser({
                          ...newUser,
                          allowedTabs: getDefaultTabsForRole(newUser.role)
                        })
                      }
                      className="text-blue-400 hover:underline"
                    >
                      Role Default
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900/80 rounded-xl border border-slate-700">
                  {AVAILABLE_MODULE_TABS.map((tab) => {
                    const isChecked = (newUser.allowedTabs || []).includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer text-[11px] transition ${
                          isChecked
                            ? 'bg-blue-950/60 border-amber-400/40 text-amber-300 font-semibold'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const cur = newUser.allowedTabs || [];
                            const updated = isChecked
                              ? cur.filter((id) => id !== tab.id)
                              : [...cur, tab.id];
                            setNewUser({ ...newUser, allowedTabs: updated });
                          }}
                          className="rounded accent-amber-400"
                        />
                        <span className="truncate">{tab.label}</span>
                      </label>
                    );
                  })}
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition"
                >
                  Save User & Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tab Access Permissions Modal */}
      {editingUserTabs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#0e172f] border border-blue-800 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Module Tab Access & Permissions</h3>
                  <p className="text-xs text-blue-200/70">
                    User: <strong className="text-white">{editingUserTabs.name}</strong> (ID: <span className="font-mono text-amber-400">{editingUserTabs.id}</span> &bull; {editingUserTabs.role})
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingUserTabs(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select which navigation tabs this user is permitted to see and access. Unchecked tabs will be blocked and hidden from their navigation sidebar.
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setSelectedTabsForEdit(AVAILABLE_MODULE_TABS.map((t) => t.id))}
                className="px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 font-semibold"
              >
                + Allow All Tabs
              </button>
              <button
                type="button"
                onClick={() => setSelectedTabsForEdit(getDefaultTabsForRole(editingUserTabs.role))}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
              >
                ↺ Reset to Role Defaults
              </button>
              <button
                type="button"
                onClick={() => setSelectedTabsForEdit(['dashboard', 'tasks'])}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold"
              >
                Minimal (Tasks Only)
              </button>
            </div>

            {/* Tab Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1 pr-2">
              {AVAILABLE_MODULE_TABS.map((tab) => {
                const isChecked = selectedTabsForEdit.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition text-xs ${
                      isChecked
                        ? 'bg-blue-950/60 border-amber-400/50 text-white'
                        : 'bg-[#0a1128]/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedTabsForEdit(selectedTabsForEdit.filter((id) => id !== tab.id));
                        } else {
                          setSelectedTabsForEdit([...selectedTabsForEdit, tab.id]);
                        }
                      }}
                      className="mt-0.5 rounded accent-amber-400"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className={isChecked ? 'text-amber-300' : 'text-slate-300'}>{tab.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tab.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-blue-900/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                <strong className="text-amber-400">{selectedTabsForEdit.length}</strong> of {AVAILABLE_MODULE_TABS.length} Modules Allowed
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUserTabs(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserTabs}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Save Tab Permissions
                </button>
              </div>
            </div>
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
