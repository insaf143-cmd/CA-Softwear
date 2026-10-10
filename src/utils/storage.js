import {
  INITIAL_CLIENTS,
  INITIAL_GST_WORK,
  INITIAL_IT_WORK,
  INITIAL_ROC_WORK,
  INITIAL_TASKS,
  INITIAL_INVOICES,
  INITIAL_USERS,
  INITIAL_REMOVED_CLIENTS
} from '../data/mockData';

const KEYS = {
  CLIENTS: 'digica_clients',
  REMOVED_CLIENTS: 'digica_removed_clients',
  GST: 'digica_gst_work',
  IT: 'digica_it_work',
  ROC: 'digica_roc_work',
  TASKS: 'digica_tasks',
  INVOICES: 'digica_invoices',
  USERS: 'digica_users',
  CURRENT_USER: 'digica_current_user'
};

const getItem = (key, initialValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
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
  // Migrate only if legacy tasks exist without department field
  if (tasks.length > 0 && !tasks[0].department) {
    saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  }
  return tasks;
};
export const saveTasks = (data) => setItem(KEYS.TASKS, data);

export const getInvoices = () => getItem(KEYS.INVOICES, INITIAL_INVOICES);
export const saveInvoices = (data) => setItem(KEYS.INVOICES, data);

export const getUsers = () => {
  const users = getItem(KEYS.USERS, INITIAL_USERS);
  if (!users || users.length === 0) return [INITIAL_USERS[0]];
  // Ensure U2 has role MANAGER if loaded from old cache
  const updatedUsers = users.map(u => {
    if (u.id === 'U2' && u.role === 'ADMIN') {
      return { ...u, role: 'MANAGER' };
    }
    return u;
  });
  return updatedUsers;
};
export const saveUsers = (data) => setItem(KEYS.USERS, data);

export const getCurrentUser = () => getItem(KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default Super Admin
export const saveCurrentUser = (user) => setItem(KEYS.CURRENT_USER, user);

export const getIsLoggedIn = () => {
  const saved = localStorage.getItem('digica_logged_in');
  return saved !== null ? JSON.parse(saved) : true;
};
export const saveIsLoggedIn = (val) => {
  localStorage.setItem('digica_logged_in', JSON.stringify(val));
};

export const clearAllDataAndStartFresh = () => {
  const masterAdmin = {
    id: 'ADMIN01',
    name: 'Admin User',
    email: 'admin@cadesk.in',
    password: 'admin',
    role: 'SUPER_ADMIN',
    status: 'Active',
    designation: 'Managing Partner / Admin',
    mobile: '+91 99999 00000',
    allocatedClientIds: []
  };

  localStorage.setItem(KEYS.CLIENTS, JSON.stringify([]));
  localStorage.setItem(KEYS.REMOVED_CLIENTS, JSON.stringify([]));
  localStorage.setItem(KEYS.GST, JSON.stringify([]));
  localStorage.setItem(KEYS.IT, JSON.stringify([]));
  localStorage.setItem(KEYS.ROC, JSON.stringify([]));
  localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
  localStorage.setItem(KEYS.INVOICES, JSON.stringify([]));
  localStorage.setItem(KEYS.USERS, JSON.stringify([masterAdmin]));
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(masterAdmin));
  localStorage.setItem('digica_logged_in', JSON.stringify(true));
  window.location.reload();
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
  localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  localStorage.setItem('digica_logged_in', JSON.stringify(true));
  window.location.reload();
};
