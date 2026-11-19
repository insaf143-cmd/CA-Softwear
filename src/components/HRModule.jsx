import React, { useState, useMemo } from 'react';
import {
  Users2,
  UserCheck,
  UserPlus,
  Search,
  Filter,
  FileSpreadsheet,
  Award,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  Building,
  GraduationCap,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Lock,
  HeartPulse,
  Sparkles,
  BarChart3,
  CheckSquare
} from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';
import { getDefaultTabsForRole } from '../utils/storage';
import { saveSingleUserToFirebase, deleteSingleUserFromFirebase } from '../services/firebaseService';
import { registerWithFirebaseAuth } from '../services/firebaseAuthService';
import { isFirebaseConfigured } from '../config/firebase';

export default function HRModule({
  users = [],
  setUsers,
  tasks = [],
  clients = [],
  currentUser,
  firmProfile
}) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'performanceReport' | 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'On Leave' | 'Resigned'

  // Modal State for Adding / Editing Staff
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdmin = currentUser?.role === 'ADMIN';
  const canManageHR = isSuperAdmin || isAdmin || currentUser?.role === 'MANAGER';

  // Compute Task Workload & Efficiency for each staff member
  const staffMetrics = useMemo(() => {
    return users.map((user) => {
      const userTasks = tasks.filter(
        (t) => t.assignedTo === user.id || t.assignedToName === user.name
      );
      const activeTasks = userTasks.filter(
        (t) => t.status === 'Allocated' || t.status === 'In Progress'
      ).length;
      const reviewTasks = userTasks.filter(
        (t) => t.status === 'Submitted for Approval' || t.status === 'Review'
      ).length;
      const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;
      const totalTasks = userTasks.length;
      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

      return {
        ...user,
        activeTasks,
        reviewTasks,
        completedTasks,
        totalTasks,
        completionRate
      };
    });
  }, [users, tasks]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffMetrics.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q)) ||
        (s.qualification && s.qualification.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (departmentFilter !== 'All' && s.department !== departmentFilter) return false;

      const currentStatus = s.workStatus || (s.status === 'Blocked' ? 'Blocked' : 'Active');
      if (statusFilter !== 'All' && currentStatus !== statusFilter) return false;

      return true;
    });
  }, [staffMetrics, searchTerm, departmentFilter, statusFilter]);

  // Overall Firm HR Statistics
  const totalStaffCount = users.length;
  const activeStaffCount = users.filter(
    (u) => (u.workStatus || 'Active') === 'Active' && u.status !== 'Blocked'
  ).length;
  const onLeaveCount = users.filter((u) => u.workStatus === 'On Leave').length;
  const resignedCount = users.filter((u) => u.workStatus === 'Resigned').length;
  const totalFirmPayroll = users.reduce((sum, u) => sum + (Number(u.stipend || u.salary) || 0), 0);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setShowStaffModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setShowStaffModal(true);
  };

  // Save Staff (Add or Update)
  const handleSaveStaff = (savedUser) => {
    if (editingStaff) {
      const updated = users.map((u) => (u.id === savedUser.id ? savedUser : u));
      setUsers(updated);
      saveSingleUserToFirebase(savedUser);
      alert(`Staff profile for "${savedUser.name}" updated successfully.`);
    } else {
      setUsers([...users, savedUser]);
      saveSingleUserToFirebase(savedUser);

      // Register with Firebase Auth if configured
      if (isFirebaseConfigured && savedUser.email && savedUser.password) {
        registerWithFirebaseAuth(savedUser.email, savedUser.password, savedUser.name).catch((err) => {
          console.warn('Firebase Auth user registration warning:', err);
        });
      }
      alert(`Staff member "${savedUser.name}" registered successfully!`);
    }
    setShowStaffModal(false);
  };

  // Export Comprehensive HR Report to Excel
  const handleExportHRReport = () => {
    if (staffMetrics.length === 0) {
      alert('No staff records found to export.');
      return;
    }

    const headers = [
      'Employee Code / ID',
      'Staff Full Name',
      'Role in Firm',
      'Designation',
      'Department',
      'Qualification',
      'Date of Joining (DOJ)',
      'Engagement Status',
      'Mobile Number',
      'Official Email',
      'Emergency Contact',
      'Blood Group',
      'Monthly Stipend / Salary (₹)',
      'Bank Account No',
      'Bank IFSC',
      'Active Tasks Underway',
      'Tasks Submitted for Review',
      'Completed Tasks',
      'Total Work Orders',
      'Completion Rate (%)'
    ];

    const rows = staffMetrics.map((s) => [
      s.id,
      s.name,
      s.role,
      s.designation || 'Staff',
      s.department || 'General Practice',
      s.qualification || 'N/A',
      s.doj || 'N/A',
      s.workStatus || (s.status === 'Blocked' ? 'Blocked' : 'Active'),
      s.mobile || '',
      s.email || '',
      s.emergencyContact || '',
      s.bloodGroup || '',
      s.stipend || s.salary || 0,
      s.bankAccount || '',
      s.bankIfsc || '',
      s.activeTasks,
      s.reviewTasks,
      s.completedTasks,
      s.totalTasks,
      `${s.completionRate}%`
    ]);

    const filename = `CA_HR_Staff_Performance_Report_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(headers, rows, filename);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
              Human Resources & Practice Staff
            </span>
            <span className="text-xs text-slate-400">
              {firmProfile?.firmName || 'Chartered Accountants'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users2 className="w-6 h-6 text-emerald-400" />
            <span>Staff HR Management & Performance Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage staff profiles, qualifications, stipends/salaries, dates of joining, performance metrics, and generate HR reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export HR Report to Excel */}
          <button
            onClick={handleExportHRReport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs shadow-md transition"
            title="Export Comprehensive Staff HR Report to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export HR Report</span>
          </button>

          {/* Add Staff Member */}
          {canManageHR && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Staff Strength</span>
            <Users2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{totalStaffCount}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            {activeStaffCount} Active &bull; {onLeaveCount} On Leave
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Work Orders</span>
            <CheckSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {tasks.filter((t) => t.status !== 'Completed').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Distributed across {activeStaffCount} staff
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Completed Works</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {tasks.filter((t) => t.status === 'Completed').length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Approved & Filed</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Monthly Stipend / Payroll</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300 mt-1">
            ₹{totalFirmPayroll.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Monthly firm commitment</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Staff Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('performanceReport')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'performanceReport'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Workload & Performance Report</span>
          </button>
        </div>

        {/* Search & Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Direct Taxation">Direct Taxation</option>
            <option value="Indirect Taxation (GST)">Indirect Taxation (GST)</option>
            <option value="Audit & Assurance">Audit & Assurance</option>
            <option value="ROC & Corporate Laws">ROC & Corporate Laws</option>
            <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Working</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned / Relieved</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff, code, qualification..."
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: STAFF DIRECTORY (Cards & Table) */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
              No staff members found matching the selected filters.
            </div>
          ) : (
            filteredStaff.map((staffMember) => {
              const isResigned = staffMember.workStatus === 'Resigned';
              const isOnLeave = staffMember.workStatus === 'On Leave';

              return (
                <div
                  key={staffMember.id}
                  className={`p-5 rounded-2xl border transition shadow-lg flex flex-col justify-between ${
                    isResigned
                      ? 'bg-slate-900/60 border-slate-800 opacity-75'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-950/40">
                          {staffMember.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{staffMember.name}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                              {staffMember.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-emerald-400" />
                            <span>{staffMember.designation || 'Article Trainee'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isResigned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                          Resigned
                        </span>
                      ) : isOnLeave ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          On Leave
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Meta Details */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 text-xs mb-4">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-blue-400" />
                          Department:
                        </span>
                        <span className="font-semibold text-slate-200">
                          {staffMember.department || 'General Practice'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                          Qualification:
                        </span>
                        <span className="font-semibold text-slate-200">
                          {staffMember.qualification || 'Semi-Qualified'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          Joined:
                        </span>
                        <span className="font-semibold text-slate-200 font-mono text-[11px]">
                          {staffMember.doj || 'Active Batch'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                          Stipend / Salary:
                        </span>
                        <span className="font-bold text-amber-400">
                          ₹{Number(staffMember.stipend || staffMember.salary || 0).toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>

                    {/* Contact Pills */}
                    <div className="space-y-1 text-xs text-slate-400 mb-4">
                      {staffMember.mobile && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{staffMember.mobile}</span>
                        </div>
                      )}
                      {staffMember.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{staffMember.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Stats & Edit Action */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400">Workload:</span>
                      <span className="font-bold text-emerald-400">{staffMember.activeTasks} Active</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="font-bold text-slate-300">{staffMember.completedTasks} Done</span>
                    </div>

                    {canManageHR && (
                      <button
                        onClick={() => handleOpenEditModal(staffMember)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                        title="Edit HR Profile & Stipend"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: WORKLOAD & PERFORMANCE HR REPORT TABLE */}
      {activeTab === 'performanceReport' && (
        <div className="ca-table-container">
          <table className="ca-table">
            <thead>
              <tr>
                <th>Employee Code & Name</th>
                <th>Designation & Department</th>
                <th>Qualification</th>
                <th>Date of Joining</th>
                <th>Status</th>
                <th>Active Works</th>
                <th>Submitted / Review</th>
                <th>Completed Works</th>
                <th>Completion Rate</th>
                <th>Monthly Stipend</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-10 text-slate-500 text-xs">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{staffMember.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {staffMember.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{staffMember.email}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-200">
                        {staffMember.designation || 'Article Trainee'}
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        {staffMember.department || 'General Practice'}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {staffMember.qualification || 'Semi-Qualified'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-300">
                        {staffMember.doj || 'Active Batch'}
                      </span>
                    </td>
                    <td>
                      {staffMember.workStatus === 'Resigned' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          Resigned
                        </span>
                      ) : staffMember.workStatus === 'On Leave' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          On Leave
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {staffMember.activeTasks}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-purple-400 font-mono">
                        {staffMember.reviewTasks}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {staffMember.completedTasks}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${staffMember.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-200 font-mono">
                          {staffMember.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-teal-300 font-mono">
                        ₹{Number(staffMember.stipend || staffMember.salary || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="text-right">
                      {canManageHR && (
                        <button
                          onClick={() => handleOpenEditModal(staffMember)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF MEMBER */}
      {showStaffModal && (
        <StaffHRModal
          onClose={() => setShowStaffModal(false)}
          onSave={handleSaveStaff}
          initialData={editingStaff}
          existingUsers={users}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  );
}

// Sub-Component: Add or Edit Staff Member Modal with Full HR Fields
function StaffHRModal({ onClose, onSave, initialData = null, existingUsers = [], isSuperAdmin }) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: initialData?.password || 'Pass@2026',
    role: initialData?.role || 'NORMAL_USER',
    designation: initialData?.designation || 'Article Trainee',
    department: initialData?.department || 'Direct Taxation',
    qualification: initialData?.qualification || 'CA Final / Semi-Qualified',
    doj: initialData?.doj || new Date().toISOString().split('T')[0],
    mobile: initialData?.mobile || '',
    emergencyContact: initialData?.emergencyContact || '',
    bloodGroup: initialData?.bloodGroup || 'B+',
    workStatus: initialData?.workStatus || 'Active',
    stipend: initialData?.stipend || initialData?.salary || '15000',
    bankAccount: initialData?.bankAccount || '',
    bankIfsc: initialData?.bankIfsc || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanId = (formData.id || '').trim().toUpperCase();
    if (!cleanId) {
      alert('Please enter a unique Employee Code / Login ID.');
      return;
    }

    if (!isEdit && existingUsers.some((u) => u.id.toUpperCase() === cleanId)) {
      alert(`Employee ID "${cleanId}" is already registered. Please choose another.`);
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter Staff Member Full Name.');
      return;
    }

    const finalAllowedTabs =
      initialData?.allowedTabs && initialData.allowedTabs.length > 0
        ? initialData.allowedTabs
        : getDefaultTabsForRole(formData.role);

    const savedStaff = {
      ...(initialData || {}),
      ...formData,
      id: cleanId,
      name: formData.name.trim(),
      email: formData.email.trim() || `${cleanId.toLowerCase()}@cadesk.in`,
      password: formData.password.trim(),
      status: formData.workStatus === 'Resigned' ? 'Blocked' : 'Active',
      allowedTabs: finalAllowedTabs
    };

    onSave(savedStaff);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl my-8 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEdit ? `Edit Staff Profile & HR Record (${formData.id})` : 'Register New Staff Member'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure professional qualifications, department, stipend, and login credentials.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 text-xs">
          {/* Section 1: Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Employee Code / Login ID *
              </label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                placeholder="e.g. FAZIL / EMP-101"
                className={`w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold uppercase focus:outline-none ${
                  isEdit ? 'opacity-70 cursor-not-allowed' : 'focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. CA Mohammed Fazil"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Section 2: Designation, Department, Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Audit Senior / Article Trainee"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              >
                <option value="Direct Taxation">Direct Taxation</option>
                <option value="Indirect Taxation (GST)">Indirect Taxation (GST)</option>
                <option value="Audit & Assurance">Audit & Assurance</option>
                <option value="ROC & Corporate Laws">ROC & Corporate Laws</option>
                <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
                <option value="Administration & Operations">Administration</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={!isSuperAdmin && formData.role === 'SUPER_ADMIN'}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-bold focus:outline-none"
              >
                <option value="NORMAL_USER">Staff / Article Assistant</option>
                <option value="MANAGER">Manager / Audit Supervisor</option>
                <option value="ADMIN">Firm Administrator</option>
                {isSuperAdmin && <option value="SUPER_ADMIN">Managing Partner (Super Admin)</option>}
              </select>
            </div>
          </div>

          {/* Section 3: Qualification, Date of Joining, Work Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. FCA, ACA, CA Inter, B.Com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date of Joining (DOJ)</label>
              <input
                type="date"
                value={formData.doj}
                onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">HR Status</label>
              <select
                value={formData.workStatus}
                onChange={(e) => setFormData({ ...formData, workStatus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              >
                <option value="Active">Active Working</option>
                <option value="On Leave">On Leave / Exam Study</option>
                <option value="Resigned">Resigned / Relieved</option>
              </select>
            </div>
          </div>

          {/* Section 4: Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@cadesk.in"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="+91 99999 11111 (Parent / Spouse)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Payroll & Stipend */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-3">
            <span className="font-bold text-teal-400 block uppercase tracking-wider text-[11px] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Payroll & Bank Remittance Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-0.5">Monthly Stipend / Salary (₹)</label>
                <input
                  type="number"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="15000"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-teal-300 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Bank Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="e.g. 5010022998811"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Bank IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0000240"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono uppercase focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Login Password */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3">
            <div>
              <label className="text-slate-300 font-bold block">Portal Login Password</label>
              <p className="text-[11px] text-slate-500">
                Staff member will authenticate using their Employee ID ({formData.id || 'CODE'}) and this password.
              </p>
            </div>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="e.g. Pass@2026"
              className="w-48 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-950/40"
            >
              {isEdit ? 'Update HR Record' : 'Register Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
