import React, { useState, useEffect, useRef } from 'react';
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
import EvidenceVault from './components/EvidenceVault';
import InwardOutwardRegister from './components/InwardOutwardRegister';

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
  getEvidenceDocuments, saveEvidenceDocuments,
  getInwardOutwardRecords, saveInwardOutwardRecords,
  resetAllData
} from './utils/storage';

import {
  syncClientsToFirebase, subscribeToClientsFromFirebase,
  syncGSTWorkToFirebase, subscribeToGSTWorkFromFirebase,
  syncITWorkToFirebase, subscribeToITWorkFromFirebase,
  syncTasksToFirebase, subscribeToTasksFromFirebase,
  syncInvoicesToFirebase, subscribeToInvoicesFromFirebase
} from './services/firebaseService';

import {
  fetchCentralDatabase,
  saveCentralDatabase,
  checkDatabaseStatus
} from './services/apiService';

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

  // Evidence Documents State
  const [evidenceDocuments, setEvidenceDocumentsState] = useState(getEvidenceDocuments);

  // Inward & Outward Client Material Register State
  const [inwardOutwardRecords, setInwardOutwardRecordsState] = useState(getInwardOutwardRecords);

  const lastSyncedAtRef = useRef(0);

  // Broadcast change to central database file on host
  const syncToCentralServer = (changes = {}) => {
    const fullPayload = {
      users,
      clients,
      tasks,
      invoices,
      gstWork,
      itWork,
      rocWork,
      removedClients,
      firmProfile,
      evidenceDocuments,
      inwardOutwardRecords,
      ...changes
    };
    saveCentralDatabase(fullPayload).then((res) => {
      if (res && res.updatedAt) {
        lastSyncedAtRef.current = res.updatedAt;
      }
    });
  };

  const setFirmProfile = (profile) => {
    setFirmProfileState(profile);
    saveFirmProfile(profile);
    syncToCentralServer({ firmProfile: profile });
  };

  const setEvidenceDocuments = (docs) => {
    setEvidenceDocumentsState(docs);
    saveEvidenceDocuments(docs);
    syncToCentralServer({ evidenceDocuments: docs });
  };

  const setInwardOutwardRecords = (records) => {
    setInwardOutwardRecordsState(records);
    saveInwardOutwardRecords(records);
    syncToCentralServer({ inwardOutwardRecords: records });
  };

  // Sync to Storage and Central Server
  const setUsers = (data) => {
    setUsersState(data);
    saveUsers(data);
    syncToCentralServer({ users: data });
  };
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

  const setClients = (data) => {
    setClientsState(data);
    saveClients(data);
    syncClientsToFirebase(data);
    syncToCentralServer({ clients: data });
  };
  const setRemovedClients = (data) => {
    setRemovedClientsState(data);
    saveRemovedClients(data);
    syncToCentralServer({ removedClients: data });
  };
  const setGstWork = (data) => {
    setGstWorkState(data);
    saveGSTWork(data);
    syncGSTWorkToFirebase(data);
    syncToCentralServer({ gstWork: data });
  };
  const setItWork = (data) => {
    setItWorkState(data);
    saveITWork(data);
    syncITWorkToFirebase(data);
    syncToCentralServer({ itWork: data });
  };
  const setRocWork = (data) => {
    setRocWorkState(data);
    saveROCWork(data);
    syncToCentralServer({ rocWork: data });
  };
  const setTasks = (data) => {
    setTasksState(data);
    saveTasks(data);
    syncTasksToFirebase(data);
    syncToCentralServer({ tasks: data });
  };
  const setInvoices = (data) => {
    setInvoicesState(data);
    saveInvoices(data);
    syncInvoicesToFirebase(data);
    syncToCentralServer({ invoices: data });
  };

  // Central Database LAN Sync & Multi-User Polling
  useEffect(() => {
    let isMounted = true;

    async function initCentralDb() {
      const res = await fetchCentralDatabase();
      if (res && res.success && res.data && isMounted) {
        const db = res.data;
        if (db.users && db.users.length > 0) {
          setUsersState(db.users);
          saveUsers(db.users);
        }
        if (db.clients) {
          setClientsState(db.clients);
          saveClients(db.clients);
        }
        if (db.tasks) {
          setTasksState(db.tasks);
          saveTasks(db.tasks);
        }
        if (db.invoices) {
          setInvoicesState(db.invoices);
          saveInvoices(db.invoices);
        }
        if (db.gstWork) {
          setGstWorkState(db.gstWork);
          saveGSTWork(db.gstWork);
        }
        if (db.itWork) {
          setItWorkState(db.itWork);
          saveITWork(db.itWork);
        }
        if (db.rocWork) {
          setRocWorkState(db.rocWork);
          saveROCWork(db.rocWork);
        }
        if (db.firmProfile) {
          setFirmProfileState(db.firmProfile);
          saveFirmProfile(db.firmProfile);
        }
        if (db.evidenceDocuments) {
          setEvidenceDocumentsState(db.evidenceDocuments);
          saveEvidenceDocuments(db.evidenceDocuments);
        }
        if (db.inwardOutwardRecords) {
          setInwardOutwardRecordsState(db.inwardOutwardRecords);
          saveInwardOutwardRecords(db.inwardOutwardRecords);
        }
        lastSyncedAtRef.current = res.updatedAt || Date.now();
      }
    }

    initCentralDb();

    // Check for updates made by other users every 2.5 seconds
    const interval = setInterval(async () => {
      const status = await checkDatabaseStatus();
      if (status && status.connected && status.updatedAt > lastSyncedAtRef.current) {
        const res = await fetchCentralDatabase();
        if (res && res.success && res.data && isMounted) {
          const db = res.data;
          if (db.users) setUsersState(db.users);
          if (db.clients) setClientsState(db.clients);
          if (db.tasks) setTasksState(db.tasks);
          if (db.invoices) setInvoicesState(db.invoices);
          if (db.gstWork) setGstWorkState(db.gstWork);
          if (db.itWork) setItWorkState(db.itWork);
          if (db.rocWork) setRocWorkState(db.rocWork);
          if (db.firmProfile) setFirmProfileState(db.firmProfile);
          if (db.evidenceDocuments) setEvidenceDocumentsState(db.evidenceDocuments);
          if (db.inwardOutwardRecords) setInwardOutwardRecordsState(db.inwardOutwardRecords);
          lastSyncedAtRef.current = res.updatedAt;
        }
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    removedCount: removedClients.length,
    evidenceCount: evidenceDocuments.length,
    inwardCount: inwardOutwardRecords.filter(r => r.status === 'In Custody' || r.status === 'Under Audit').length
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
          {['tasks', 'dashboard', 'reports', 'evidence', 'inwardOutward', 'clients', 'gst', 'it', 'calendar', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap uppercase ${
                activeTab === tab ? 'bg-cyan-600 text-white font-extrabold shadow' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab === 'tasks' ? 'Work' : tab === 'evidence' ? 'Vault' : tab === 'inwardOutward' ? 'Register' : tab}
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

          {activeTab === 'evidence' && (
            <EvidenceVault
              evidenceDocuments={evidenceDocuments}
              setEvidenceDocuments={setEvidenceDocuments}
              clients={visibleClients}
              tasks={tasks}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'inwardOutward' && (
            <InwardOutwardRegister
              records={inwardOutwardRecords}
              setRecords={setInwardOutwardRecords}
              clients={visibleClients}
              staff={users}
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
