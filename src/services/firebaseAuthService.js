import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

/**
 * Format Firebase Auth error codes into human-readable messages
 */
export const formatAuthErrorMessage = (error) => {
  if (!error) return 'An unknown authentication error occurred.';
  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid credentials. Please verify your email and password.';
    case 'auth/user-not-found':
      return 'No account found with this email in Firebase. Please check the email or create user in Firebase Console.';
    case 'auth/invalid-email':
      return 'The email address format is not valid.';
    case 'auth/email-already-in-use':
      return 'This email is already registered in Firebase Authentication.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long in Firebase.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Please go to Firebase Console -> Build -> Authentication -> Sign-in method -> Enable Email/Password.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to too many failed attempts. Try again later or reset password.';
    case 'auth/network-request-failed':
      return 'Network error connecting to Firebase. Check your internet connection.';
    default:
      return error.message || 'Authentication failed.';
  }
};

/**
 * Sign in using Firebase Authentication
 */
export const signInWithFirebaseAuth = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, error: 'Firebase is not configured or connected.' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { success: true, user: cred.user, error: null };
  } catch (err) {
    return {
      success: false,
      user: null,
      code: err.code,
      error: formatAuthErrorMessage(err)
    };
  }
};

/**
 * Register a new user in Firebase Authentication
 */
export const registerWithFirebaseAuth = async (email, password, displayName = '') => {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, error: 'Firebase is not configured or connected.' };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return { success: true, user: cred.user, error: null };
  } catch (err) {
    return {
      success: false,
      user: null,
      code: err.code,
      error: formatAuthErrorMessage(err)
    };
  }
};

/**
 * Sign out from Firebase Authentication
 */
export const signOutFromFirebaseAuth = async () => {
  if (!isFirebaseConfigured || !auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Error signing out of Firebase:', err);
  }
};

/**
 * Subscribe to Firebase Auth State Changes
 */
export const subscribeToFirebaseAuth = (callback) => {
  if (!isFirebaseConfigured || !auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

/**
 * Provision staff members to Firebase Authentication
 */
export const provisionStaffToFirebaseAuth = async (usersList) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please connect Firebase first.');
  }

  const results = {
    created: 0,
    alreadyExists: 0,
    failed: 0,
    details: []
  };

  for (const u of usersList) {
    if (!u.email) continue;
    // Default password fallback if empty or short
    const pwd = u.password && u.password.length >= 6 ? u.password : `${u.password || 'CaPass'}2026!`;

    try {
      const res = await registerWithFirebaseAuth(u.email, pwd, u.name);
      if (res.success) {
        results.created++;
        results.details.push({ email: u.email, status: 'Created in Firebase Auth' });
      } else if (res.code === 'auth/email-already-in-use') {
        results.alreadyExists++;
        results.details.push({ email: u.email, status: 'Already exists in Firebase Auth' });
      } else {
        results.failed++;
        results.details.push({ email: u.email, status: `Failed: ${res.error}` });
      }
    } catch (e) {
      results.failed++;
      results.details.push({ email: u.email, status: `Error: ${e.message}` });
    }
  }

  return results;
};
