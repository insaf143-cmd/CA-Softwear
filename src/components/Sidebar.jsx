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
  BarChart3
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts, currentUser }) {
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
          : 'bg-emerald-500/20 text-emerald-300',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER']
    },
    {
      id: 'reports',
      label: 'Practice Reports',
      icon: BarChart3,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
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

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Modules</span>
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
              isSuperAdmin
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : isAdmin
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : isManager
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {currentUser.role === 'SUPER_ADMIN'
              ? 'Admin'
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Active Account</span>
        </div>
        <p className="text-[11px] font-bold text-slate-100">{currentUser.name}</p>
        <p className="text-[10px] text-slate-400 truncate">{currentUser.designation}</p>
      </div>
    </aside>
  );
}
