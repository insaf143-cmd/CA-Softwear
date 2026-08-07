import React, { useState } from 'react';
import { Database, X, CheckCircle, ShieldCheck, ExternalLink, Key } from 'lucide-react';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';

export default function FirebaseConfigModal({ onClose }) {
  const [config, setConfig] = useState({
    apiKey: firebaseConfig.apiKey !== "YOUR_API_KEY" ? firebaseConfig.apiKey : "",
    authDomain: firebaseConfig.authDomain !== "your-app.firebaseapp.com" ? firebaseConfig.authDomain : "",
    projectId: firebaseConfig.projectId !== "your-app-id" ? firebaseConfig.projectId : "",
    storageBucket: firebaseConfig.storageBucket !== "your-app.appspot.com" ? firebaseConfig.storageBucket : "",
    messagingSenderId: firebaseConfig.messagingSenderId !== "123456789" ? firebaseConfig.messagingSenderId : "",
    appId: firebaseConfig.appId !== "1:123456789:web:abcdef" ? firebaseConfig.appId : ""
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('digica_firebase_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              Connect Firebase Cloud Database (Firestore)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sync CA firm clients, GST returns, ITRs, and invoices to your Firebase Cloud Firestore.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          isFirebaseConfigured
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Status: <strong>{isFirebaseConfigured ? 'Connected to Firebase Firestore' : 'Using Local Offline Storage (Paste Firebase Config below to connect)'}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Firebase API Key (apiKey)</label>
            <input
              type="text"
              required
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="AIzaSyA..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project ID (projectId)</label>
              <input
                type="text"
                required
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                placeholder="my-ca-firm-app"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Auth Domain</label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                placeholder="my-ca-firm-app.firebaseapp.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Messaging Sender ID</label>
              <input
                type="text"
                value={config.messagingSenderId}
                onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                placeholder="109988112233"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">App ID (appId)</label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                placeholder="1:109988112233:web:abc123def456"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400">
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              Get credentials from Firebase Console <ExternalLink className="w-3 h-3" />
            </a>

            {savedSuccess && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saved & Reloading...
              </span>
            )}
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg"
            >
              Connect & Sync Firebase DB
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
