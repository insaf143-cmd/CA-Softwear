import {
  INITIAL_CLIENTS,
  INITIAL_GST_WORK,
  INITIAL_IT_WORK,
  INITIAL_ROC_WORK,
  INITIAL_TASKS,
  INITIAL_INVOICES,
  INITIAL_STAFF
} from '../data/mockData';

const KEYS = {
  CLIENTS: 'digica_clients',
  GST: 'digica_gst_work',
  IT: 'digica_it_work',
  ROC: 'digica_roc_work',
  TASKS: 'digica_tasks',
  INVOICES: 'digica_invoices',
  STAFF: 'digica_staff'
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

export const getGSTWork = () => getItem(KEYS.GST, INITIAL_GST_WORK);
export const saveGSTWork = (data) => setItem(KEYS.GST, data);

export const getITWork = () => getItem(KEYS.IT, INITIAL_IT_WORK);
export const saveITWork = (data) => setItem(KEYS.IT, data);

export const getROCWork = () => getItem(KEYS.ROC, INITIAL_ROC_WORK);
export const saveROCWork = (data) => setItem(KEYS.ROC, data);

export const getTasks = () => getItem(KEYS.TASKS, INITIAL_TASKS);
export const saveTasks = (data) => setItem(KEYS.TASKS, data);

export const getInvoices = () => getItem(KEYS.INVOICES, INITIAL_INVOICES);
export const saveInvoices = (data) => setItem(KEYS.INVOICES, data);

export const getStaff = () => getItem(KEYS.STAFF, INITIAL_STAFF);

export const resetAllData = () => {
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  localStorage.setItem(KEYS.GST, JSON.stringify(INITIAL_GST_WORK));
  localStorage.setItem(KEYS.IT, JSON.stringify(INITIAL_IT_WORK));
  localStorage.setItem(KEYS.ROC, JSON.stringify(INITIAL_ROC_WORK));
  localStorage.setItem(KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
  window.location.reload();
};
