import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
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
  INVOICES: 'invoices'
};

// --- CLIENTS FIREBASE SYNC ---
export const syncClientsToFirebase = async (clients) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const client of clients) {
      await setDoc(doc(db, COLLECTIONS.CLIENTS, client.id), client, { merge: true });
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
  });
};

// --- GST WORK FIREBASE SYNC ---
export const syncGSTWorkToFirebase = async (gstWork) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const item of gstWork) {
      await setDoc(doc(db, COLLECTIONS.GST, item.id), item, { merge: true });
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
  });
};

// --- IT WORK FIREBASE SYNC ---
export const syncITWorkToFirebase = async (itWork) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const item of itWork) {
      await setDoc(doc(db, COLLECTIONS.IT, item.id), item, { merge: true });
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
  });
};

// --- TASKS FIREBASE SYNC ---
export const syncTasksToFirebase = async (tasks) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const task of tasks) {
      await setDoc(doc(db, COLLECTIONS.TASKS, task.id), task, { merge: true });
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
  });
};

// --- INVOICES FIREBASE SYNC ---
export const syncInvoicesToFirebase = async (invoices) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const inv of invoices) {
      await setDoc(doc(db, COLLECTIONS.INVOICES, inv.id), inv, { merge: true });
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
  });
};
