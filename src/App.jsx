import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientManagement from './components/ClientManagement';
import ClientDetailModal from './components/ClientDetailModal';
import GSTModule from './components/GSTModule';
import ITModule from './components/ITModule';
import ROCAndAuditModule from './components/ROCAndAuditModule';
import TaskManager from './components/TaskManager';
import BillingModule from './components/BillingModule';
import ComplianceCalendar from './components/ComplianceCalendar';
import TaxCalculatorModal from './components/TaxCalculatorModal';
import QuickClientModal from './components/QuickClientModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import GitHubSyncModal from './components/GitHubSyncModal';
import UserManagement from './components/UserManagement';
import ClientRemovalTab from './components/ClientRemovalTab';
import ReportsModule from './components/ReportsModule';
import LoginScreen from './components/LoginScreen';
import FirmSettingsModal from './components/FirmSettingsModal';

import {
  getClients, saveClients,
  getRemovedClients, saveRemovedClients,
  getGSTWork, saveGSTWork,
  getITWork, saveITWork,
  getROCWork, saveROCWork,
  getTasks, saveTasks,
  getInvoices, saveInvoices,
  getUsers, saveUsers,
  getCurrentUser, saveCurrentUser,
  getIsLoggedIn, saveIsLoggedIn,
  getFirmProfile, saveFirmProfile,
  resetAllData
} from './utils/storage';

import {
  syncClientsToFirebase, subscribeToClientsFromFirebase,
  syncGSTWorkToFirebase, subscribeToGSTWorkFromFirebase,
  syncITWorkToFirebase, subscribeToITWorkFromFirebase,
  syncTasksToFirebase, subscribeToTasksFromFirebase,
  syncInvoicesToFirebase, subscribeToInvoicesFromFirebase
} from './services/firebaseService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');

  // Storage & RBAC States
  const [users, setUsersState] = useState(getUsers);
  const [currentUser, setCurrentUserState] = useState(getCurrentUser);

  const [clients, setClientsState] = useState(getClients);
  const [removedClients, setRemovedClientsState] = useState(getRemovedClients);
  const [gstWork, setGstWorkState] = useState(getGSTWork);
  const [itWork, setItWorkState] = useState(getITWork);
  const [rocWork, setRocWorkState] = useState(getROCWork);
  const [tasks, setTasksState] = useState(getTasks);
  const [invoices, setInvoicesState] = useState(getInvoices);

  // Modals State
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [showTaxCalcModal, setShowTaxCalcModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showFirmSettingsModal, setShowFirmSettingsModal] = useState(false);

  // Firm & Company Profile State
  const [firmProfile, setFirmProfileState] = useState(getFirmProfile);
  const setFirmProfile = (profile) => {
    setFirmProfileState(profile);
    saveFirmProfile(profile);
  };

  // Sync to Storage
  const setUsers = (data) => { setUsersState(data); saveUsers(data); };
  const handleSwitchUser = (user) => { setCurrentUserState(user); saveCurrentUser(user); };

  const handleLogin = (user) => {
    setCurrentUserState(user);
    saveCurrentUser(user);
    setIsLoggedIn(true);
    saveIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    saveIsLoggedIn(false);
  };

  const setClients = (data) => { setClientsState(data); saveClients(data); syncClientsToFirebase(data); };
  const setRemovedClients = (data) => { setRemovedClientsState(data); saveRemovedClients(data); };
  const setGstWork = (data) => { setGstWorkState(data); saveGSTWork(data); syncGSTWorkToFirebase(data); };
  const setItWork = (data) => { setItWorkState(data); saveITWork(data); syncITWorkToFirebase(data); };
  const setRocWork = (data) => { setRocWorkState(data); saveROCWork(data); };
  const setTasks = (data) => { setTasksState(data); saveTasks(data); syncTasksToFirebase(data); };
  const setInvoices = (data) => { setInvoicesState(data); saveInvoices(data); syncInvoicesToFirebase(data); };

  // Subscribe to Firebase Firestore if connected
  useEffect(() => {
    const unsubClients = subscribeToClientsFromFirebase((data) => setClientsState(data));
    const unsubGST = subscribeToGSTWorkFromFirebase((data) => setGstWorkState(data));
    const unsubIT = subscribeToITWorkFromFirebase((data) => setItWorkState(data));
    const unsubTasks = subscribeToTasksFromFirebase((data) => setTasksState(data));
    const unsubInvoices = subscribeToInvoicesFromFirebase((data) => setInvoicesState(data));

    return () => {
      if (unsubClients) unsubClients();
      if (unsubGST) unsubGST();
      if (unsubIT) unsubIT();
      if (unsubTasks) unsubTasks();
      if (unsubInvoices) unsubInvoices();
    };
  }, []);

  // Filter Data based on Role & Allocation
  const isNormalUser = currentUser?.role === 'NORMAL_USER';

  const visibleClients = isNormalUser
    ? clients.filter(c => c.assignedStaff === currentUser.id || (currentUser.allocatedClientIds && currentUser.allocatedClientIds.includes(c.id)))
    : clients;

  const visibleTasks = isNormalUser
    ? tasks.filter(t => t.assignedTo === currentUser.id || t.assignedToName === currentUser.name)
    : tasks;

  const visibleGstWork = isNormalUser
    ? gstWork.filter(g => visibleClients.some(c => c.id === g.clientId))
    : gstWork;

  const visibleItWork = isNormalUser
    ? itWork.filter(i => visibleClients.some(c => c.id === i.clientId))
    : itWork;

  const handleAddClient = (newClient) => {
    setClients([newClient, ...clients]);
  };

  const handleRemoveClient = (clientId, reason) => {
    const target = clients.find(c => c.id === clientId);
    if (!target) return;

    const removedItem = {
      ...target,
      reason: reason || 'Client requested removal',
      removedBy: currentUser.name,
      removedDate: new Date().toISOString().split('T')[0]
    };

    setClients(clients.filter(c => c.id !== clientId));
    setRemovedClients([removedItem, ...removedClients]);
  };

  const handleRestoreClient = (clientId) => {
    const target = removedClients.find(r => r.id === clientId);
    if (!target) return;

    const restored = { ...target };
    delete restored.reason;
    delete restored.removedBy;
    delete restored.removedDate;

    setRemovedClients(removedClients.filter(r => r.id !== clientId));
    setClients([restored, ...clients]);
  };

  const handlePermanentDeleteClient = (clientId) => {
    setRemovedClients(removedClients.filter(r => r.id !== clientId));
  };

  const pendingReviewCount = tasks.filter(
    t => t.status === 'Submitted for Approval' || t.status === 'Review'
  ).length;

  const counts = {
    clients: visibleClients.length,
    pendingGst: visibleGstWork.filter(g => g.status !== 'Filed').length,
    pendingIt: visibleItWork.filter(i => i.status !== 'Filed' && i.status !== 'Completed').length,
    openTasks: isNormalUser
      ? tasks.filter(t => (t.assignedTo === currentUser.id) && t.status !== 'Completed').length
      : tasks.filter(t => t.status !== 'Completed').length,
    pendingReviewCount,
    usersCount: users.length,
    removedCount: removedClients.length
  };

  // If user is not logged in, show dedicated Login Screen
  if (!isLoggedIn || !currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} firmProfile={firmProfile} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenNewClient={() => setShowNewClientModal(true)}
        onOpenTaxCalc={() => setShowTaxCalcModal(true)}
        onOpenFirebaseModal={() => setShowFirebaseModal(true)}
        onOpenGitHubModal={() => setShowGitHubModal(true)}
        onOpenFirmSettings={() => setShowFirmSettingsModal(true)}
        firmProfile={firmProfile}
        onResetData={resetAllData}
        users={users}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
          currentUser={currentUser}
        />

        {/* Mobile Navigation Pills */}
        <div className="md:hidden flex overflow-x-auto bg-slate-900 border-b border-slate-800 p-2 gap-2 fixed bottom-0 left-0 right-0 z-40">
          {['tasks', 'dashboard', 'reports', 'clients', 'gst', 'it', 'calendar', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap uppercase ${
                activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab === 'tasks' ? 'Work' : tab}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              clients={visibleClients}
              gstWork={visibleGstWork}
              itWork={visibleItWork}
              tasks={visibleTasks}
              invoices={invoices}
              setActiveTab={setActiveTab}
              onOpenNewClient={() => setShowNewClientModal(true)}
              onOpenTaxCalc={() => setShowTaxCalcModal(true)}
              firmProfile={firmProfile}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              setTasks={setTasks}
              clients={visibleClients}
              staff={users}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsModule
              users={users}
              tasks={tasks}
              setTasks={setTasks}
              gstWork={gstWork}
              itWork={itWork}
              rocWork={rocWork}
              clients={clients}
              currentUser={currentUser}
              firmProfile={firmProfile}
            />
          )}

          {activeTab === 'clients' && (
            <ClientManagement
              clients={visibleClients}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenClientDetail={(client) => setSelectedClientDetail(client)}
              onOpenNewClient={() => setShowNewClientModal(true)}
              onDeleteClient={handleRemoveClient}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'gst' && (
            <GSTModule
              gstWork={visibleGstWork}
              setGstWork={setGstWork}
              clients={visibleClients}
              firmProfile={firmProfile}
            />
          )}

          {activeTab === 'it' && (
            <ITModule
              itWork={visibleItWork}
              setItWork={setItWork}
              onOpenTaxCalc={() => setShowTaxCalcModal(true)}
            />
          )}

          {activeTab === 'roc' && (
            <ROCAndAuditModule
              rocWork={rocWork}
              setRocWork={setRocWork}
            />
          )}

          {activeTab === 'billing' && (
            <BillingModule
              invoices={invoices}
              setInvoices={setInvoices}
              clients={visibleClients}
              firmProfile={firmProfile}
            />
          )}

          {activeTab === 'calendar' && (
            <ComplianceCalendar />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
              clients={clients}
              onOpenFirmSettings={() => setShowFirmSettingsModal(true)}
            />
          )}

          {activeTab === 'removal' && (
            <ClientRemovalTab
              removedClients={removedClients}
              onRestoreClient={handleRestoreClient}
              onPermanentDeleteClient={handlePermanentDeleteClient}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedClientDetail && (
        <ClientDetailModal
          client={selectedClientDetail}
          onClose={() => setSelectedClientDetail(null)}
        />
      )}

      {showTaxCalcModal && (
        <TaxCalculatorModal
          onClose={() => setShowTaxCalcModal(false)}
        />
      )}

      {showNewClientModal && (
        <QuickClientModal
          onClose={() => setShowNewClientModal(false)}
          onAddClient={handleAddClient}
          staff={users}
        />
      )}

      {showFirebaseModal && (
        <FirebaseConfigModal
          onClose={() => setShowFirebaseModal(false)}
        />
      )}

      {showGitHubModal && (
        <GitHubSyncModal
          onClose={() => setShowGitHubModal(false)}
        />
      )}

      {showFirmSettingsModal && (
        <FirmSettingsModal
          firmProfile={firmProfile}
          onSaveFirmProfile={setFirmProfile}
          onClose={() => setShowFirmSettingsModal(false)}
        />
      )}
    </div>
  );
}
