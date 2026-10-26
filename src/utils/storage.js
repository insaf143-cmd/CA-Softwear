import {
  INITIAL_CLIENTS,
  INITIAL_GST_WORK,
  INITIAL_IT_WORK,
  INITIAL_ROC_WORK,
  INITIAL_TASKS,
  INITIAL_INVOICES,
  INITIAL_USERS,
  INITIAL_REMOVED_CLIENTS,
  INITIAL_INWARD_OUTWARD
} from '../data/mockData';
import { saveCentralDatabase } from '../services/apiService';
import { clearAllFirebaseData } from '../services/firebaseService';

const KEYS = {
  CLIENTS: 'digica_clients',
  REMOVED_CLIENTS: 'digica_removed_clients',
  GST: 'digica_gst_work',
  IT: 'digica_it_work',
  ROC: 'digica_roc_work',
  TASKS: 'digica_tasks',
  INVOICES: 'digica_invoices',
  USERS: 'digica_users',
  CURRENT_USER: 'digica_current_user',
  EVIDENCE_DOCS: 'digica_evidence_docs',
  INWARD_OUTWARD: 'digica_inward_outward'
};

const getItem = (key, initialValue) => {
  try {
    const isFresh = localStorage.getItem('taxbay_fresh_initialized') === 'true';
    const saved = localStorage.getItem(key);
    if (!saved) {
      if (isFresh) {
        if (key === KEYS.USERS) return [INITIAL_USERS[0]];
        return [];
      }
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return initialValue;
  }
};

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

export const getClients = () => getItem(KEYS.CLIENTS, INITIAL_CLIENTS);
export const saveClients = (data) => setItem(KEYS.CLIENTS, data);

export const getRemovedClients = () => getItem(KEYS.REMOVED_CLIENTS, INITIAL_REMOVED_CLIENTS);
export const saveRemovedClients = (data) => setItem(KEYS.REMOVED_CLIENTS, data);

export const getGSTWork = () => getItem(KEYS.GST, INITIAL_GST_WORK);
export const saveGSTWork = (data) => setItem(KEYS.GST, data);

export const getITWork = () => getItem(KEYS.IT, INITIAL_IT_WORK);
export const saveITWork = (data) => setItem(KEYS.IT, data);

export const getROCWork = () => getItem(KEYS.ROC, INITIAL_ROC_WORK);
export const saveROCWork = (data) => setItem(KEYS.ROC, data);

export const getTasks = () => {
  const tasks = getItem(KEYS.TASKS, INITIAL_TASKS);
  if (!tasks) return [];
  return tasks;
};
export const saveTasks = (data) => setItem(KEYS.TASKS, data);

export const getInvoices = () => getItem(KEYS.INVOICES, INITIAL_INVOICES);
export const saveInvoices = (data) => setItem(KEYS.INVOICES, data);

export const getEvidenceDocuments = () => getItem(KEYS.EVIDENCE_DOCS, []);
export const saveEvidenceDocuments = (data) => setItem(KEYS.EVIDENCE_DOCS, data);

export const getInwardOutwardRecords = () => getItem(KEYS.INWARD_OUTWARD, INITIAL_INWARD_OUTWARD);
export const saveInwardOutwardRecords = (data) => setItem(KEYS.INWARD_OUTWARD, data);

export const getDefaultTabsForRole = (role) => {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return [
      'dashboard', 'tasks', 'reports', 'evidence', 'inwardOutward',
      'clients', 'gst', 'it', 'roc', 'billing', 'calendar', 'users'
    ];
  }
  if (role === 'MANAGER') {
    return [
      'dashboard', 'tasks', 'reports', 'evidence', 'inwardOutward',
      'clients', 'gst', 'it', 'roc', 'billing', 'calendar'
    ];
  }
  // NORMAL_USER (Staff)
  return [
    'dashboard', 'tasks', 'evidence', 'inwardOutward',
    'clients', 'gst', 'it', 'calendar'
  ];
};

export const getDeletedUserIds = () => {
  try {
    return JSON.parse(localStorage.getItem('taxbay_deleted_users') || '[]');
  } catch {
    return [];
  }
};

export const addDeletedUserId = (userId) => {
  if (!userId) return;
  const current = getDeletedUserIds();
  const clean = userId.trim().toUpperCase();
  if (!current.includes(clean)) {
    localStorage.setItem('taxbay_deleted_users', JSON.stringify([...current, clean]));
  }
};

export const getUsers = () => {
  const users = getItem(KEYS.USERS, INITIAL_USERS);
  if (!users || users.length === 0) return [INITIAL_USERS[0]];
  const deleted = getDeletedUserIds();

  return users
    .filter((u) => u && u.id && !deleted.includes(u.id.toUpperCase()))
    .map((u) => ({
      ...u,
      allowedTabs: Array.isArray(u.allowedTabs) && u.allowedTabs.length > 0
        ? u.allowedTabs
        : getDefaultTabsForRole(u.role)
    }));
};
export const saveUsers = (data) => setItem(KEYS.USERS, data);

export const getCurrentUser = () => {
  // If not logged in this session, return null so login window shows
  if (!getIsLoggedIn()) return null;
  const saved = localStorage.getItem(KEYS.CURRENT_USER);
  if (!saved) return null;
  try {
    const user = JSON.parse(saved);
    if (!user || !user.id) return null;
    const deleted = getDeletedUserIds();
    if (deleted.includes(user.id.toUpperCase())) return null;

    return {
      ...user,
      allowedTabs: Array.isArray(user.allowedTabs) && user.allowedTabs.length > 0
        ? user.allowedTabs
        : getDefaultTabsForRole(user.role)
    };
  } catch {
    return null;
  }
};
export const saveCurrentUser = (user) => {
  if (user) {
    setItem(KEYS.CURRENT_USER, user);
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

export const getIsLoggedIn = () => {
  // Opening the link in a browser tab/session ALWAYS prompts for login credentials
  try {
    const isSessionActive = sessionStorage.getItem('taxbay_session_active');
    if (!isSessionActive) {
      return false;
    }
  } catch {
    // fallback if sessionStorage unavailable
  }
  const saved = localStorage.getItem('digica_logged_in');
  return saved !== null ? JSON.parse(saved) : false;
};
export const saveIsLoggedIn = (val) => {
  try {
    if (val) {
      sessionStorage.setItem('taxbay_session_active', 'true');
    } else {
      sessionStorage.removeItem('taxbay_session_active');
    }
  } catch {
    // ignore
  }
  localStorage.setItem('digica_logged_in', JSON.stringify(val));
};

export const clearAllDataAndStartFresh = async (onProgress) => {
  const masterAdmin = {
    id: 'ADMIN01',
    name: 'Admin User',
    email: 'admin@cadesk.in',
    password: 'admin',
    role: 'SUPER_ADMIN',
    status: 'Active',
    designation: 'Managing Partner / Admin',
    mobile: '+91 99999 00000',
    allocatedClientIds: [],
    allowedTabs: [
      'dashboard',
      'tasks',
      'reports',
      'evidence',
      'inwardOutward',
      'clients',
      'gst',
      'it',
      'roc',
      'billing',
      'calendar',
      'users'
    ]
  };

  if (onProgress) onProgress('1/3: Clearing local browser cache...');
  localStorage.setItem('taxbay_fresh_initialized', 'true');
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify([]));
  localStorage.setItem(KEYS.REMOVED_CLIENTS, JSON.stringify([]));
  localStorage.setItem(KEYS.GST, JSON.stringify([]));
  localStorage.setItem(KEYS.IT, JSON.stringify([]));
  localStorage.setItem(KEYS.ROC, JSON.stringify([]));
  localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
  localStorage.setItem(KEYS.INVOICES, JSON.stringify([]));
  localStorage.setItem(KEYS.EVIDENCE_DOCS, JSON.stringify([]));
  localStorage.setItem(KEYS.INWARD_OUTWARD, JSON.stringify([]));
  localStorage.setItem(KEYS.USERS, JSON.stringify([masterAdmin]));
  localStorage.removeItem(KEYS.CURRENT_USER);
  localStorage.setItem('digica_logged_in', JSON.stringify(false));
  try {
    sessionStorage.removeItem('taxbay_session_active');
  } catch {}

  if (onProgress) onProgress('2/3: Resetting Central Server LAN Database...');
  try {
    await saveCentralDatabase({
      isFresh: true,
      users: [masterAdmin],
      clients: [],
      removedClients: [],
      gstWork: [],
      itWork: [],
      rocWork: [],
      tasks: [],
      invoices: [],
      evidenceDocuments: [],
      inwardOutwardRecords: []
    });
  } catch (err) {
    console.warn('Central database wipe warning:', err);
  }

  if (onProgress) onProgress('3/3: Purging Firebase Cloud Collections...');
  try {
    await clearAllFirebaseData(masterAdmin);
  } catch (err) {
    console.warn('Firebase cloud purge warning:', err);
  }

  if (onProgress) onProgress('Complete! Reloading with 100% clean database...');
  setTimeout(() => {
    window.location.reload();
  }, 1200);
};

export const DEFAULT_FIRM_PROFILE = {
  firmName: 'M/s. Sharma & Associates',
  tagline: 'Chartered Accountants',
  frn: '129988W',
  gstin: '27AAAAA1234F1Z1',
  address: 'Suite 401, Nariman Point, Mumbai - 400021',
  phone: '+91 98765 43210',
  email: 'contact@sharma-ca.com',
  partnerName: 'CA Rajesh Sharma'
};

export const getFirmProfile = () => getItem('digica_firm_profile', DEFAULT_FIRM_PROFILE);
export const saveFirmProfile = (profile) => setItem('digica_firm_profile', profile);

export const resetAllData = () => {
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  localStorage.setItem(KEYS.REMOVED_CLIENTS, JSON.stringify(INITIAL_REMOVED_CLIENTS));
  localStorage.setItem(KEYS.GST, JSON.stringify(INITIAL_GST_WORK));
  localStorage.setItem(KEYS.IT, JSON.stringify(INITIAL_IT_WORK));
  localStorage.setItem(KEYS.ROC, JSON.stringify(INITIAL_ROC_WORK));
  localStorage.setItem(KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(KEYS.INWARD_OUTWARD, JSON.stringify(INITIAL_INWARD_OUTWARD));
  localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  localStorage.setItem('digica_logged_in', JSON.stringify(true));
  window.location.reload();
};
