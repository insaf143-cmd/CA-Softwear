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
  resetAllData,
  getDeletedUserIds,
  getDefaultTabsForRole
} from './utils/storage';

import {
  syncClientsToFirebase, subscribeToClientsFromFirebase,
  saveSingleClientToFirebase, deleteSingleClientFromFirebase,
  syncGSTWorkToFirebase, subscribeToGSTWorkFromFirebase,
  syncITWorkToFirebase, subscribeToITWorkFromFirebase,
  syncTasksToFirebase, subscribeToTasksFromFirebase,
  saveSingleTaskToFirebase, deleteSingleTaskFromFirebase,
  syncInvoicesToFirebase, subscribeToInvoicesFromFirebase,
  syncROCWorkToFirebase, subscribeToROCWorkFromFirebase,
  syncInwardOutwardToFirebase, subscribeToInwardOutwardFromFirebase,
  saveSingleInwardToFirebase, deleteSingleInwardFromFirebase,
  syncUsersToFirebase, subscribeToUsersFromFirebase,
  syncFirmProfileToFirebase, subscribeToFirmProfileFromFirebase,
  uploadAllDataToFirebase, mergeListsById
} from './services/firebaseService';
import { isFirebaseConfigured } from './config/firebase';

import {
  fetchCentralDatabase,
  saveCentralDatabase,
  checkDatabaseStatus
} from './services/apiService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');

  // Day / Night Mode State
  const [isDayMode, setIsDayMode] = useState(() => {
    try {
      return localStorage.getItem('taxbay_day_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDayMode = () => {
    setIsDayMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('taxbay_day_mode', String(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  // PWA Deferred Prompt Listener for PC Installation
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  // Storage & RBAC States
  const [users, setUsersState] = useState(getUsers);
  const [currentUser, setCurrentUserState] = useState(getCurrentUser);

  // Tab Access Guard: Enforce strict allowedTabs permissions per user
  useEffect(() => {
    if (currentUser) {
      const userTabs =
        Array.isArray(currentUser.allowedTabs) && currentUser.allowedTabs.length > 0
          ? currentUser.allowedTabs
          : getDefaultTabsForRole(currentUser.role);

      if (!userTabs.includes(activeTab)) {
        setActiveTab(userTabs[0] || 'tasks');
      }
    }
  }, [currentUser, activeTab]);

  // Synchronize currentUser whenever users state is modified (e.g. Tab Access edited, user deleted)
  useEffect(() => {
    if (currentUser && Array.isArray(users)) {
      const matching = users.find((u) => u.id === currentUser.id);
      if (matching) {
        const tabsDiff = JSON.stringify(matching.allowedTabs) !== JSON.stringify(currentUser.allowedTabs);
        const roleDiff = matching.role !== currentUser.role;
        const statusDiff = matching.status !== currentUser.status;
        if (tabsDiff || roleDiff || statusDiff) {
          setCurrentUserState(matching);
          saveCurrentUser(matching);
        }
      } else {
        // If logged-in account was removed by Admin, force immediate logout
        handleLogout();
      }
    }
  }, [users]);

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
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

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

  const setFirmProfile = (dataOrUpdater) => {
    setFirmProfileState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveFirmProfile(next);
      syncFirmProfileToFirebase(next);
      syncToCentralServer({ firmProfile: next });
      return next;
    });
  };

  const setEvidenceDocuments = (dataOrUpdater) => {
    setEvidenceDocumentsState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveEvidenceDocuments(next);
      syncToCentralServer({ evidenceDocuments: next });
      return next;
    });
  };

  const setInwardOutwardRecords = (dataOrUpdater) => {
    setInwardOutwardRecordsState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveInwardOutwardRecords(next);
      syncInwardOutwardToFirebase(next);
      syncToCentralServer({ inwardOutwardRecords: next });
      return next;
    });
  };

  // Sync to Storage and Central Server
  const setUsers = (dataOrUpdater) => {
    setUsersState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveUsers(next);
      syncUsersToFirebase(next);
      syncToCentralServer({ users: next });
      if (currentUser) {
        const matchingCurrent = next.find((u) => u.id === currentUser.id);
        if (matchingCurrent) {
          setCurrentUserState(matchingCurrent);
          saveCurrentUser(matchingCurrent);
        }
      }
      return next;
    });
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

  const setClients = (dataOrUpdater) => {
    setClientsState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveClients(next);
      syncClientsToFirebase(next);
      syncToCentralServer({ clients: next });
      return next;
    });
  };
  const setRemovedClients = (dataOrUpdater) => {
    setRemovedClientsState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveRemovedClients(next);
      syncToCentralServer({ removedClients: next });
      return next;
    });
  };
  const setGstWork = (dataOrUpdater) => {
    setGstWorkState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveGSTWork(next);
      syncGSTWorkToFirebase(next);
      syncToCentralServer({ gstWork: next });
      return next;
    });
  };
  const setItWork = (dataOrUpdater) => {
    setItWorkState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveITWork(next);
      syncITWorkToFirebase(next);
      syncToCentralServer({ itWork: next });
      return next;
    });
  };
  const setRocWork = (dataOrUpdater) => {
    setRocWorkState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveROCWork(next);
      syncROCWorkToFirebase(next);
      syncToCentralServer({ rocWork: next });
      return next;
    });
  };
  const setTasks = (dataOrUpdater) => {
    setTasksState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveTasks(next);
      syncTasksToFirebase(next);
      syncToCentralServer({ tasks: next });
      return next;
    });
  };
  const setInvoices = (dataOrUpdater) => {
    setInvoicesState((prev) => {
      const next = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      saveInvoices(next);
      syncInvoicesToFirebase(next);
      syncToCentralServer({ invoices: next });
      return next;
    });
  };

  // Central Database LAN Sync & Multi-User Polling (Safe Merging)
  useEffect(() => {
    let isMounted = true;

    async function initCentralDb() {
      const res = await fetchCentralDatabase();
      if (res && res.success && res.data && isMounted) {
        const db = res.data;
        const isFresh = localStorage.getItem('taxbay_fresh_initialized') === 'true';

        if (db.users && Array.isArray(db.users)) {
          const deleted = getDeletedUserIds();
          const cleanUsers = db.users.filter((u) => u && u.id && !deleted.includes(u.id.toUpperCase()));
          if (cleanUsers.length > 0) {
            setUsersState((prev) => {
              const merged = mergeListsById(prev, cleanUsers).filter((u) => u && u.id && !deleted.includes(u.id.toUpperCase()));
              saveUsers(merged);
              return merged;
            });
          }
        }

        if (Array.isArray(db.clients)) {
          if (isFresh && db.clients.length === 0) {
            setClientsState([]);
            saveClients([]);
          } else if (db.clients.length > 0) {
            setClientsState((prev) => {
              const merged = mergeListsById(prev, db.clients);
              saveClients(merged);
              return merged;
            });
          }
        }

        if (Array.isArray(db.tasks)) {
          if (isFresh && db.tasks.length === 0) {
            setTasksState([]);
            saveTasks([]);
          } else if (db.tasks.length > 0) {
            setTasksState((prev) => {
              const merged = mergeListsById(prev, db.tasks);
              saveTasks(merged);
              return merged;
            });
          }
        }

        if (Array.isArray(db.inwardOutwardRecords)) {
          if (isFresh && db.inwardOutwardRecords.length === 0) {
            setInwardOutwardRecordsState([]);
            saveInwardOutwardRecords([]);
          } else if (db.inwardOutwardRecords.length > 0) {
            setInwardOutwardRecordsState((prev) => {
              const merged = mergeListsById(prev, db.inwardOutwardRecords);
              saveInwardOutwardRecords(merged);
              return merged;
            });
          }
        }

        if (Array.isArray(db.invoices)) {
          if (isFresh && db.invoices.length === 0) {
            setInvoicesState([]);
            saveInvoices([]);
          } else if (db.invoices.length > 0) {
            setInvoicesState((prev) => mergeListsById(prev, db.invoices));
          }
        }

        if (Array.isArray(db.gstWork)) {
          if (isFresh && db.gstWork.length === 0) {
            setGstWorkState([]);
            saveGSTWork([]);
          } else if (db.gstWork.length > 0) {
            setGstWorkState((prev) => mergeListsById(prev, db.gstWork));
          }
        }

        if (Array.isArray(db.itWork)) {
          if (isFresh && db.itWork.length === 0) {
            setItWorkState([]);
            saveITWork([]);
          } else if (db.itWork.length > 0) {
            setItWorkState((prev) => mergeListsById(prev, db.itWork));
          }
        }

        if (Array.isArray(db.rocWork)) {
          if (isFresh && db.rocWork.length === 0) {
            setRocWorkState([]);
            saveROCWork([]);
          } else if (db.rocWork.length > 0) {
            setRocWorkState((prev) => mergeListsById(prev, db.rocWork));
          }
        }

        if (db.firmProfile && db.firmProfile.firmName) {
          setFirmProfileState(db.firmProfile);
          saveFirmProfile(db.firmProfile);
        }
        if (db.evidenceDocuments) {
          if (isFresh && db.evidenceDocuments.length === 0) {
            setEvidenceDocumentsState([]);
            saveEvidenceDocuments([]);
          } else {
            setEvidenceDocumentsState(db.evidenceDocuments);
            saveEvidenceDocuments(db.evidenceDocuments);
          }
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
          if (db.users && Array.isArray(db.users)) {
            const deleted = getDeletedUserIds();
            const cleanUsers = db.users.filter((u) => u && u.id && !deleted.includes(u.id.toUpperCase()));
            setUsersState((prev) => mergeListsById(prev, cleanUsers).filter((u) => u && u.id && !deleted.includes(u.id.toUpperCase())));
          }
          if (db.clients) setClientsState((prev) => mergeListsById(prev, db.clients));
          if (db.tasks) setTasksState((prev) => mergeListsById(prev, db.tasks));
          if (db.inwardOutwardRecords) setInwardOutwardRecordsState((prev) => mergeListsById(prev, db.inwardOutwardRecords));
          if (db.invoices) setInvoicesState((prev) => mergeListsById(prev, db.invoices));
          if (db.gstWork) setGstWorkState((prev) => mergeListsById(prev, db.gstWork));
          if (db.itWork) setItWorkState((prev) => mergeListsById(prev, db.itWork));
          if (db.rocWork) setRocWorkState((prev) => mergeListsById(prev, db.rocWork));
          if (db.firmProfile && db.firmProfile.firmName) setFirmProfileState(db.firmProfile);
          if (db.evidenceDocuments) setEvidenceDocumentsState(db.evidenceDocuments);
          lastSyncedAtRef.current = res.updatedAt;
        }
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Subscribe to Firebase Firestore if connected (Real-Time Cloud Synchronization)
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubClients = subscribeToClientsFromFirebase((cloudClients) => {
      if (Array.isArray(cloudClients)) {
        setClientsState(cloudClients);
        saveClients(cloudClients);
      }
    });

    const unsubTasks = subscribeToTasksFromFirebase((cloudTasks) => {
      if (Array.isArray(cloudTasks)) {
        setTasksState(cloudTasks);
        saveTasks(cloudTasks);
      }
    });

    const unsubInward = subscribeToInwardOutwardFromFirebase((cloudInward) => {
      if (Array.isArray(cloudInward)) {
        setInwardOutwardRecordsState(cloudInward);
        saveInwardOutwardRecords(cloudInward);
      }
    });

    const unsubGST = subscribeToGSTWorkFromFirebase((cloudGST) => {
      if (Array.isArray(cloudGST)) {
        setGstWorkState(cloudGST);
        saveGSTWork(cloudGST);
      }
    });

    const unsubIT = subscribeToITWorkFromFirebase((cloudIT) => {
      if (Array.isArray(cloudIT)) {
        setItWorkState(cloudIT);
        saveITWork(cloudIT);
      }
    });

    const unsubROC = subscribeToROCWorkFromFirebase((cloudROC) => {
      if (Array.isArray(cloudROC)) {
        setRocWorkState(cloudROC);
        saveROCWork(cloudROC);
      }
    });

    const unsubInvoices = subscribeToInvoicesFromFirebase((cloudInvoices) => {
      if (Array.isArray(cloudInvoices)) {
        setInvoicesState(cloudInvoices);
        saveInvoices(cloudInvoices);
      }
    });

    const unsubUsers = subscribeToUsersFromFirebase((cloudUsers) => {
      if (cloudUsers && Array.isArray(cloudUsers)) {
        const deleted = getDeletedUserIds();
        const cleanUsers = cloudUsers
          .filter((u) => u && u.id && !deleted.includes(u.id.toUpperCase()) && !['U1', 'U2', 'U3', 'U4', 'U5'].includes(u.id));
        setUsersState(cleanUsers);
        saveUsers(cleanUsers);
      }
    });

    const unsubProfile = subscribeToFirmProfileFromFirebase((cloudProfile) => {
      if (cloudProfile && cloudProfile.firmName) {
        setFirmProfileState(cloudProfile);
        saveFirmProfile(cloudProfile);
      }
    });

    return () => {
      if (unsubClients) unsubClients();
      if (unsubGST) unsubGST();
      if (unsubIT) unsubIT();
      if (unsubTasks) unsubTasks();
      if (unsubInvoices) unsubInvoices();
      if (unsubROC) unsubROC();
      if (unsubInward) unsubInward();
      if (unsubUsers) unsubUsers();
      if (unsubProfile) unsubProfile();
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
    setClients((prev) => {
      const merged = [newClient, ...prev.filter(c => c.id !== newClient.id)];
      saveSingleClientToFirebase(newClient);
      return merged;
    });
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

    setRemovedClients((prev) => [removedItem, ...prev]);
    setClients((prev) => prev.filter(c => c.id !== clientId));
    deleteSingleClientFromFirebase(clientId);
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
    return (
      <LoginScreen
        users={users}
        onLogin={handleLogin}
        firmProfile={firmProfile}
        isDayMode={isDayMode}
      />
    );
  }

  // Filter mobile navigation tabs by user role and allowedTabs
  const allMobileTabs = [
    { id: 'tasks', label: 'Work', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'reports', label: 'Reports', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { id: 'evidence', label: 'Vault', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'inwardOutward', label: 'Register', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'clients', label: 'Clients', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'gst', label: 'GST', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'it', label: 'ITR', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'roc', label: 'ROC', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { id: 'billing', label: 'Billing', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { id: 'calendar', label: 'Calendar', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'NORMAL_USER'] },
    { id: 'users', label: 'Staff', roles: ['SUPER_ADMIN', 'ADMIN'] }
  ].filter((t) => {
    if (!t.roles.includes(currentUser.role)) return false;
    const userTabs =
      Array.isArray(currentUser.allowedTabs) && currentUser.allowedTabs.length > 0
        ? currentUser.allowedTabs
        : getDefaultTabsForRole(currentUser.role);
    return userTabs.includes(t.id);
  });

  return (
    <div
      className={`${
        isDayMode ? 'day-mode bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
      } min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500 selection:text-white`}
    >
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
        isDayMode={isDayMode}
        toggleDayMode={toggleDayMode}
        deferredInstallPrompt={deferredInstallPrompt}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
          currentUser={currentUser}
          isDayMode={isDayMode}
        />

        {/* Mobile Navigation Pills */}
        <div
          className={`md:hidden flex overflow-x-auto border-t p-2 gap-2 fixed bottom-0 left-0 right-0 z-40 ${
            isDayMode ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-900 border-slate-800'
          }`}
        >
          {allMobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap uppercase transition-all ${
                activeTab === tab.id
                  ? isDayMode
                    ? 'bg-blue-700 text-white font-extrabold shadow border border-amber-400'
                    : 'bg-blue-900 text-amber-300 font-extrabold shadow border border-amber-400/50'
                  : isDayMode
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main ref={mainContentRef} className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full pb-20 md:pb-6">
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
              firmProfile={firmProfile}
              onOpenFirmSettings={() => setShowFirmSettingsModal(true)}
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
          currentData={{
            clients,
            gstWork,
            itWork,
            rocWork,
            tasks,
            invoices,
            inwardOutwardRecords,
            users,
            firmProfile
          }}
          onUploadAll={uploadAllDataToFirebase}
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
