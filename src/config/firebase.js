import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Default Verified Firebase Cloud Configuration for CA Practice Suite
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDHeUVxylxDHA7UL4Pi-Dcogs2C-yMUsVs",
  authDomain: "office-suit-2.firebaseapp.com",
  projectId: "office-suit-2",
  storageBucket: "office-suit-2.firebasestorage.app",
  messagingSenderId: "151843663933",
  appId: "1:151843663933:web:490883ecb7e739a724fa54"
};

const getFirebaseConfig = () => {
  const savedConfig = localStorage.getItem('digica_firebase_config');
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      if (parsed.apiKey && parsed.projectId && parsed.apiKey !== "YOUR_API_KEY") {
        return parsed;
      }
    } catch (e) {
      console.error("Invalid saved Firebase config:", e);
    }
  }

  // Use environment variables if set, otherwise default to office-suit-2
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId
  };
};

export const firebaseConfig = getFirebaseConfig();

let app = null;
let db = null;
let auth = null;
let isFirebaseConfigured = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "your-app-id") {
    const apps = getApps();
    app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully with Firestore DB and Auth for project:", firebaseConfig.projectId);
  }
} catch (error) {
  console.warn("Firebase initialization skipped (missing credentials):", error.message);
}

export { app, db, auth, isFirebaseConfigured };
