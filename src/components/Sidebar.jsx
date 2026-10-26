import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  FileText,
  Building,
  CheckSquare,
  Receipt,
  Calendar,
  Sparkles,
  Layers,
  UserCheck,
  Trash2,
  BarChart3,
  FolderArchive,
  FolderInput
} from 'lucide-react';
import { getDefaultTabsForRole } from '../utils/storage';

export default function Sidebar({ activeTab, setActiveTab, counts, currentUser, isDayMode = false }) {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN';
  const isManager = currentUser.role === 'MANAGER';
  const isNormalUser = currentUser.role === 'NORMAL_USER';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'tasks',
      label: isNormalUser ? 'My Allocated Work' : 'Work Allocation & Flow',
      icon: CheckSquare,
      badge:
        counts.pendingReviewCount && (isManager || isAdmin || isSuperAdmin)
          ? `${counts.pendingReviewCount} Reviews`
          : counts.openTasks
          ? `${counts.openTasks} Active`
          : null,
      badgeColor:
        counts.pendingReviewCount && (isManager || isAdmin || isSuperAdmin)
          ? 'bg-purple-500/20 text-purple-300 font-bold animate-pulse'
          : 'bg-amber-500/20 text-amber-300 font-medium',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'reports',
      label: 'Practice Reports',
      icon: BarChart3,
      badge: 'Live',
      badgeColor: 'bg-blue-500/20 text-blue-300',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
    },
    {
      id: 'evidence',
      label: 'Evidence & Documents',
      icon: FolderArchive,
      badge: counts.evidenceCount ? `${counts.evidenceCount} Files` : 'Vault',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'inwardOutward',
      label: 'Inward / Outward Register',
      icon: FolderInput,
      badge: counts.inwardCount ? `${counts.inwardCount} Custody` : null,
      badgeColor: 'bg-yellow-500/20 text-yellow-300',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'clients',
      label: isNormalUser ? 'My Client Files' : 'Client Vault',
      icon: Users,
      badge: counts.clients,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'gst',
      label: 'GST Compliance',
      icon: FileCheck,
      badge: counts.pendingGst ? `${counts.pendingGst} Pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'it',
      label: 'Income Tax (ITR)',
      icon: FileText,
      badge: counts.pendingIt ? `${counts.pendingIt} Pending` : null,
      badgeColor: 'bg-blue-500/20 text-blue-300',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'roc',
      label: 'ROC & Audit',
      icon: Building,
      badge: null,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
    },
    {
      id: 'billing',
      label: 'Billing & Fee Ledger',
      icon: Receipt,
      badge: null,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
    },
    {
      id: 'calendar',
      label: 'Compliance Calendar',
      icon: Calendar,
      badge: 'Aug 2026',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'users',
      label: 'Staff & Role Control',
      icon: UserCheck,
      badge: counts.usersCount ? `${counts.usersCount}` : null,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      id: 'removal',
      label: 'Client Removal Archive',
      icon: Trash2,
      badge: counts.removedCount ? `${counts.removedCount}` : null,
      badgeColor: 'bg-red-500/20 text-red-300',
      roles: ['SUPER_ADMIN', 'ADMIN']
    }
  ];

  // Tab Access Control:
  // Strict tab permissions: User can ONLY view tabs that are in their allowedTabs list
  const userAllowedTabs =
    Array.isArray(currentUser.allowedTabs) && currentUser.allowedTabs.length > 0
      ? currentUser.allowedTabs
      : getDefaultTabsForRole(currentUser.role);

  const visibleNavItems = navItems.filter((item) => {
    // 1. Role must allow this tab
    const roleAllowed = item.roles.includes(currentUser.role);
    if (!roleAllowed) return false;

    // 2. Tab MUST be explicitly permitted in userAllowedTabs
    return userAllowedTabs.includes(item.id);
  });

  return (
    <aside
      className={`w-64 border-r flex flex-col justify-between shrink-0 hidden md:flex transition-colors duration-200 ${
        isDayMode
          ? 'bg-slate-50 border-slate-200 text-slate-800'
          : 'bg-slate-900 border-slate-800 text-slate-200'
      }`}
    >
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span className={isDayMode ? 'text-slate-600 font-bold' : 'text-slate-400'}>TAXBAY Modules</span>
          </span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
              isSuperAdmin
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-extrabold'
                : isAdmin
                ? 'bg-blue-600/20 text-blue-500 border border-blue-500/30'
                : isManager
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-700/30 text-slate-400'
            }`}
          >
            {currentUser.role === 'SUPER_ADMIN'
              ? 'Super Admin'
              : currentUser.role === 'NORMAL_USER'
              ? 'Staff'
              : currentUser.role}
          </span>
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? isDayMode
                    ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-md shadow-blue-800/30 border border-amber-400/80 font-bold'
                    : 'bg-gradient-to-r from-blue-950/80 via-blue-900/60 to-slate-900 text-amber-300 border border-amber-400/50 shadow-lg shadow-blue-950/80 font-bold'
                  : isDayMode
                  ? 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/70 border border-transparent'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? isDayMode
                        ? 'text-amber-300'
                        : 'text-amber-400'
                      : isDayMode
                      ? 'text-blue-700'
                      : 'text-slate-400'
                  }`}
                />
                <span className={isActive ? 'font-bold tracking-tight' : ''}>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    item.badgeColor || (isDayMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Banner - Yellow & Blue Theme */}
      <div
        className={`p-3 m-3 rounded-xl border transition-colors ${
          isDayMode
            ? 'bg-gradient-to-br from-blue-50 to-amber-50/50 border-blue-200/80'
            : 'bg-gradient-to-br from-blue-950/50 to-slate-900 border-blue-900/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className={`text-xs font-bold ${isDayMode ? 'text-blue-950' : 'text-slate-200'}`}>TAXBAY Active</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-500 font-extrabold border border-amber-400/30">
            PRO
          </span>
        </div>
        <p className={`text-[11px] font-bold truncate ${isDayMode ? 'text-blue-900' : 'text-slate-100'}`}>
          {currentUser.name}
        </p>
        <p className={`text-[10px] truncate ${isDayMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {currentUser.designation} • {visibleNavItems.length} Tabs Allowed
        </p>
      </div>
    </aside>
  );
}
