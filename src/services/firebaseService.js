import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

export const COLLECTIONS = {
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

/**
 * Intelligent Merger: Merges incoming cloud list with existing local list by item ID.
 * Preserves local items that haven't synced yet, and updates existing items with cloud changes.
 */
export const mergeListsById = (localList = [], cloudList = []) => {
  if (!Array.isArray(localList)) localList = [];
  if (!Array.isArray(cloudList)) cloudList = [];
  
  if (cloudList.length === 0) return localList;
  if (localList.length === 0) return cloudList;

  const map = new Map();
  // 1. Put local items in map
  for (const item of localList) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  // 2. Merge cloud items (cloud wins for shared fields, but local fields preserved)
  for (const item of cloudList) {
    if (item && item.id) {
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : item);
    }
  }

  return Array.from(map.values());
};

// ==========================================
// 1. CLIENTS FIREBASE OPERATIONS
// ==========================================
export const saveSingleClientToFirebase = async (client) => {
  if (!isFirebaseConfigured || !db || !client || !client.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.CLIENTS, client.id), client, { merge: true });
    console.log(`[Firebase AutoSync] Client saved to cloud: ${client.id} (${client.name})`);
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving client ${client.id}:`, err.message);
  }
};

export const deleteSingleClientFromFirebase = async (clientId) => {
  if (!isFirebaseConfigured || !db || !clientId) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CLIENTS, clientId));
    console.log(`[Firebase AutoSync] Client deleted from cloud: ${clientId}`);
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error deleting client ${clientId}:`, err.message);
  }
};

export const syncClientsToFirebase = async (clients) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(clients)) return;
  try {
    const promises = clients.filter(c => c && c.id).map(c => 
      setDoc(doc(db, COLLECTIONS.CLIENTS, c.id), c, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing clients list:", err.message);
  }
};

export const subscribeToClientsFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.CLIENTS), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore Clients listener error:", err.message));
};

// ==========================================
// 2. TASKS & WORK ALLOCATION FIREBASE OPERATIONS
// ==========================================
export const saveSingleTaskToFirebase = async (task) => {
  if (!isFirebaseConfigured || !db || !task || !task.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.TASKS, task.id), task, { merge: true });
    console.log(`[Firebase AutoSync] Task saved to cloud: ${task.id} (${task.title})`);
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving task ${task.id}:`, err.message);
  }
};

export const deleteSingleTaskFromFirebase = async (taskId) => {
  if (!isFirebaseConfigured || !db || !taskId) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
    console.log(`[Firebase AutoSync] Task deleted from cloud: ${taskId}`);
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error deleting task ${taskId}:`, err.message);
  }
};

export const syncTasksToFirebase = async (tasks) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(tasks)) return;
  try {
    const promises = tasks.filter(t => t && t.id).map(t => 
      setDoc(doc(db, COLLECTIONS.TASKS, t.id), t, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing tasks list:", err.message);
  }
};

export const subscribeToTasksFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.TASKS), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore Tasks listener error:", err.message));
};

// ==========================================
// 3. INWARD / OUTWARD MATERIAL REGISTER OPERATIONS
// ==========================================
export const saveSingleInwardToFirebase = async (record) => {
  if (!isFirebaseConfigured || !db || !record || !record.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.INWARD_OUTWARD, record.id), record, { merge: true });
    console.log(`[Firebase AutoSync] Inward/Outward material saved to cloud: ${record.id} (${record.clientName})`);
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving inward record ${record.id}:`, err.message);
  }
};

export const deleteSingleInwardFromFirebase = async (recordId) => {
  if (!isFirebaseConfigured || !db || !recordId) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.INWARD_OUTWARD, recordId));
    console.log(`[Firebase AutoSync] Inward record deleted from cloud: ${recordId}`);
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error deleting inward record ${recordId}:`, err.message);
  }
};

export const syncInwardOutwardToFirebase = async (records) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(records)) return;
  try {
    const promises = records.filter(r => r && r.id).map(r => 
      setDoc(doc(db, COLLECTIONS.INWARD_OUTWARD, r.id), r, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing Inward/Outward records list:", err.message);
  }
};

export const subscribeToInwardOutwardFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.INWARD_OUTWARD), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore Inward/Outward listener error:", err.message));
};

// ==========================================
// 4. GST COMPLIANCE OPERATIONS
// ==========================================
export const saveSingleGSTWorkToFirebase = async (item) => {
  if (!isFirebaseConfigured || !db || !item || !item.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.GST, item.id), item, { merge: true });
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving GST work ${item.id}:`, err.message);
  }
};

export const syncGSTWorkToFirebase = async (gstWork) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(gstWork)) return;
  try {
    const promises = gstWork.filter(g => g && g.id).map(g => 
      setDoc(doc(db, COLLECTIONS.GST, g.id), g, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing GST work:", err.message);
  }
};

export const subscribeToGSTWorkFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.GST), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore GST listener error:", err.message));
};

// ==========================================
// 5. IT COMPLIANCE OPERATIONS
// ==========================================
export const saveSingleITWorkToFirebase = async (item) => {
  if (!isFirebaseConfigured || !db || !item || !item.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.IT, item.id), item, { merge: true });
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving IT work ${item.id}:`, err.message);
  }
};

export const syncITWorkToFirebase = async (itWork) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(itWork)) return;
  try {
    const promises = itWork.filter(i => i && i.id).map(i => 
      setDoc(doc(db, COLLECTIONS.IT, i.id), i, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing IT work:", err.message);
  }
};

export const subscribeToITWorkFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.IT), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore IT listener error:", err.message));
};

// ==========================================
// 6. INVOICES & BILLING OPERATIONS
// ==========================================
export const saveSingleInvoiceToFirebase = async (inv) => {
  if (!isFirebaseConfigured || !db || !inv || !inv.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.INVOICES, inv.id), inv, { merge: true });
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving invoice ${inv.id}:`, err.message);
  }
};

export const syncInvoicesToFirebase = async (invoices) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(invoices)) return;
  try {
    const promises = invoices.filter(inv => inv && inv.id).map(inv => 
      setDoc(doc(db, COLLECTIONS.INVOICES, inv.id), inv, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing invoices:", err.message);
  }
};

export const subscribeToInvoicesFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.INVOICES), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore Invoices listener error:", err.message));
};

// ==========================================
// 7. ROC & AUDIT WORK OPERATIONS
// ==========================================
export const saveSingleROCWorkToFirebase = async (item) => {
  if (!isFirebaseConfigured || !db || !item || !item.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.ROC, item.id), item, { merge: true });
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving ROC work ${item.id}:`, err.message);
  }
};

export const syncROCWorkToFirebase = async (rocWork) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(rocWork)) return;
  try {
    const promises = rocWork.filter(r => r && r.id).map(r => 
      setDoc(doc(db, COLLECTIONS.ROC, r.id), r, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing ROC work:", err.message);
  }
};

export const subscribeToROCWorkFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.ROC), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore ROC listener error:", err.message));
};

// ==========================================
// 8. USERS & STAFF OPERATIONS
// ==========================================
export const saveSingleUserToFirebase = async (user) => {
  if (!isFirebaseConfigured || !db || !user || !user.id) return;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
  } catch (err) {
    console.warn(`[Firebase AutoSync] Error saving user ${user.id}:`, err.message);
  }
};

export const syncUsersToFirebase = async (users) => {
  if (!isFirebaseConfigured || !db || !Array.isArray(users)) return;
  try {
    const promises = users.filter(u => u && u.id).map(u => 
      setDoc(doc(db, COLLECTIONS.USERS, u.id), u, { merge: true })
    );
    await Promise.all(promises);
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing Users:", err.message);
  }
};

export const subscribeToUsersFromFirebase = (callback) => {
  if (!isFirebaseConfigured || !db) return null;
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data());
    callback(list);
  }, (err) => console.warn("Firestore Users listener error:", err.message));
};

// ==========================================
// 9. FIRM PROFILE OPERATIONS
// ==========================================
export const syncFirmProfileToFirebase = async (profile) => {
  if (!isFirebaseConfigured || !db || !profile) return;
  try {
    await setDoc(doc(db, COLLECTIONS.FIRM_PROFILE, 'profile'), profile, { merge: true });
  } catch (err) {
    console.warn("[Firebase AutoSync] Error syncing Firm Profile:", err.message);
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

// ==========================================
// 10. ONE-TAP BULK UPLOAD OF LOCAL DATA TO FIREBASE
// ==========================================
export const uploadAllDataToFirebase = async (fullData) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not connected. Please save your configuration first.");
  }

  // 1. First test write permission to ensure rules are published
  try {
    await setDoc(doc(db, '_connection_test', 'status'), { connectedAt: Date.now(), client: 'CA Practice Suite' });
  } catch (err) {
    if (err.code === 'permission-denied' || (err.message && err.message.includes('permission'))) {
      throw new Error("PERMISSION DENIED: Your Firebase Security Rules are blocking writes. Please click the 'Rules' tab in Firebase Console and set 'allow read, write: if true;' then click 'Publish'.");
    }
    throw new Error(`Firebase connection test failed: ${err.message}`);
  }

  const { clients, gstWork, itWork, rocWork, tasks, invoices, inwardOutwardRecords, users, firmProfile } = fullData;

  let totalUploaded = 0;

  if (clients && clients.length) {
    for (const c of clients) {
      if (c.id) {
        await setDoc(doc(db, COLLECTIONS.CLIENTS, c.id), c, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (tasks && tasks.length) {
    for (const t of tasks) {
      if (t.id) {
        await setDoc(doc(db, COLLECTIONS.TASKS, t.id), t, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (gstWork && gstWork.length) {
    for (const g of gstWork) {
      if (g.id) {
        await setDoc(doc(db, COLLECTIONS.GST, g.id), g, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (itWork && itWork.length) {
    for (const i of itWork) {
      if (i.id) {
        await setDoc(doc(db, COLLECTIONS.IT, i.id), i, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (rocWork && rocWork.length) {
    for (const r of rocWork) {
      if (r.id) {
        await setDoc(doc(db, COLLECTIONS.ROC, r.id), r, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (invoices && invoices.length) {
    for (const inv of invoices) {
      if (inv.id) {
        await setDoc(doc(db, COLLECTIONS.INVOICES, inv.id), inv, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (inwardOutwardRecords && inwardOutwardRecords.length) {
    for (const rec of inwardOutwardRecords) {
      if (rec.id) {
        await setDoc(doc(db, COLLECTIONS.INWARD_OUTWARD, rec.id), rec, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (users && users.length) {
    for (const u of users) {
      if (u.id) {
        await setDoc(doc(db, COLLECTIONS.USERS, u.id), u, { merge: true });
        totalUploaded++;
      }
    }
  }

  if (firmProfile) {
    await setDoc(doc(db, COLLECTIONS.FIRM_PROFILE, 'profile'), firmProfile, { merge: true });
    totalUploaded++;
  }

  return { success: true, count: totalUploaded };
};
