import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';

const COLLECTIONS = {
  CLIENTS: 'clients',
  GST: 'gst_work',
  IT: 'it_work',
  ROC: 'roc_work',
  TASKS: 'tasks',
  INVOICES: 'invoices',
  INWARD_OUTWARD: 'inward_outward',
  USERS: 'users',
  FIRM_PROFILE: 'firm_settings'
};

// --- CLIENTS FIREBASE SYNC ---
export const syncClientsToFirebase = async (clients) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const client of clients) {
      if (client.id) {
        await setDoc(doc(db, COLLECTIONS.CLIENTS, client.id), client, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing clients to Firestore:", err);
  }
};

export const subscribeToClientsFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.CLIENTS), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore Clients listener error:", err.message));
};

// --- GST WORK FIREBASE SYNC ---
export const syncGSTWorkToFirebase = async (gstWork) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const item of gstWork) {
      if (item.id) {
        await setDoc(doc(db, COLLECTIONS.GST, item.id), item, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing GST work to Firestore:", err);
  }
};

export const subscribeToGSTWorkFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.GST), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore GST listener error:", err.message));
};

// --- IT WORK FIREBASE SYNC ---
export const syncITWorkToFirebase = async (itWork) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const item of itWork) {
      if (item.id) {
        await setDoc(doc(db, COLLECTIONS.IT, item.id), item, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing IT work to Firestore:", err);
  }
};

export const subscribeToITWorkFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.IT), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore IT listener error:", err.message));
};

// --- TASKS FIREBASE SYNC ---
export const syncTasksToFirebase = async (tasks) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const task of tasks) {
      if (task.id) {
        await setDoc(doc(db, COLLECTIONS.TASKS, task.id), task, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing tasks to Firestore:", err);
  }
};

export const subscribeToTasksFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.TASKS), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore Tasks listener error:", err.message));
};

// --- INVOICES FIREBASE SYNC ---
export const syncInvoicesToFirebase = async (invoices) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const inv of invoices) {
      if (inv.id) {
        await setDoc(doc(db, COLLECTIONS.INVOICES, inv.id), inv, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing invoices to Firestore:", err);
  }
};

export const subscribeToInvoicesFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.INVOICES), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore Invoices listener error:", err.message));
};

// --- ROC & AUDIT WORK FIREBASE SYNC ---
export const syncROCWorkToFirebase = async (rocWork) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const item of rocWork) {
      if (item.id) {
        await setDoc(doc(db, COLLECTIONS.ROC, item.id), item, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing ROC work to Firestore:", err);
  }
};

export const subscribeToROCWorkFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.ROC), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore ROC listener error:", err.message));
};

// --- INWARD & OUTWARD REGISTER FIREBASE SYNC ---
export const syncInwardOutwardToFirebase = async (records) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const rec of records) {
      if (rec.id) {
        await setDoc(doc(db, COLLECTIONS.INWARD_OUTWARD, rec.id), rec, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing Inward/Outward records to Firestore:", err);
  }
};

export const subscribeToInwardOutwardFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.INWARD_OUTWARD), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore Inward/Outward listener error:", err.message));
};

// --- USERS & STAFF FIREBASE SYNC ---
export const syncUsersToFirebase = async (users) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const user of users) {
      if (user.id) {
        await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing Users to Firestore:", err);
  }
};

export const subscribeToUsersFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    if (list.length > 0) callback(list);
  }, (err) => console.warn("Firestore Users listener error:", err.message));
};

// --- FIRM PROFILE FIREBASE SYNC ---
export const syncFirmProfileToFirebase = async (profile) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, COLLECTIONS.FIRM_PROFILE, 'profile'), profile, { merge: true });
  } catch (err) {
    console.error("Error syncing Firm Profile to Firestore:", err);
  }
};

export const subscribeToFirmProfileFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(doc(db, COLLECTIONS.FIRM_PROFILE, 'profile'), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  }, (err) => console.warn("Firestore Firm Profile listener error:", err.message));
};

// --- ONE-TAP BULK UPLOAD OF LOCAL DATA TO FIREBASE ---
export const uploadAllDataToFirebase = async (fullData) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not connected. Please save your configuration first.");
  }
  const { clients, gstWork, itWork, rocWork, tasks, invoices, inwardOutwardRecords, users, firmProfile } = fullData;

  if (clients && clients.length) await syncClientsToFirebase(clients);
  if (gstWork && gstWork.length) await syncGSTWorkToFirebase(gstWork);
  if (itWork && itWork.length) await syncITWorkToFirebase(itWork);
  if (rocWork && rocWork.length) await syncROCWorkToFirebase(rocWork);
  if (tasks && tasks.length) await syncTasksToFirebase(tasks);
  if (invoices && invoices.length) await syncInvoicesToFirebase(invoices);
  if (inwardOutwardRecords && inwardOutwardRecords.length) await syncInwardOutwardToFirebase(inwardOutwardRecords);
  if (users && users.length) await syncUsersToFirebase(users);
  if (firmProfile) await syncFirmProfileToFirebase(firmProfile);

  return true;
};
