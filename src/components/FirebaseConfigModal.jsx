import React, { useState } from 'react';
import { Database, X, CheckCircle, ShieldCheck, ExternalLink, Key, UploadCloud, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';

export default function FirebaseConfigModal({ onClose, currentData, onUploadAll }) {
  const [config, setConfig] = useState({
    apiKey: firebaseConfig.apiKey !== "YOUR_API_KEY" ? firebaseConfig.apiKey : "",
    authDomain: firebaseConfig.authDomain !== "your-app.firebaseapp.com" ? firebaseConfig.authDomain : "",
    projectId: firebaseConfig.projectId !== "your-app-id" ? firebaseConfig.projectId : "",
    storageBucket: firebaseConfig.storageBucket !== "your-app.appspot.com" ? firebaseConfig.storageBucket : "",
    messagingSenderId: firebaseConfig.messagingSenderId !== "123456789" ? firebaseConfig.messagingSenderId : "",
    appId: firebaseConfig.appId !== "1:123456789:web:abcdef" ? firebaseConfig.appId : ""
  });

  const [rawSnippet, setRawSnippet] = useState('');
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Auto-parse full Firebase snippet (const firebaseConfig = { ... })
  const handleParseSnippet = () => {
    if (!rawSnippet.trim()) return;

    try {
      const extracted = { ...config };
      
      const apiKeyMatch = rawSnippet.match(/apiKey:\s*["']([^"']+)["']/i);
      const authDomainMatch = rawSnippet.match(/authDomain:\s*["']([^"']+)["']/i);
      const projectIdMatch = rawSnippet.match(/projectId:\s*["']([^"']+)["']/i);
      const storageBucketMatch = rawSnippet.match(/storageBucket:\s*["']([^"']+)["']/i);
      const messagingSenderIdMatch = rawSnippet.match(/messagingSenderId:\s*["']([^"']+)["']/i);
      const appIdMatch = rawSnippet.match(/appId:\s*["']([^"']+)["']/i);

      if (apiKeyMatch) extracted.apiKey = apiKeyMatch[1];
      if (authDomainMatch) extracted.authDomain = authDomainMatch[1];
      if (projectIdMatch) extracted.projectId = projectIdMatch[1];
      if (storageBucketMatch) extracted.storageBucket = storageBucketMatch[1];
      if (messagingSenderIdMatch) extracted.messagingSenderId = messagingSenderIdMatch[1];
      if (appIdMatch) extracted.appId = appIdMatch[1];

      // Also try JSON parse if provided as JSON
      if (!apiKeyMatch && rawSnippet.includes('{')) {
        try {
          const parsedJson = JSON.parse(rawSnippet);
          if (parsedJson.apiKey) extracted.apiKey = parsedJson.apiKey;
          if (parsedJson.authDomain) extracted.authDomain = parsedJson.authDomain;
          if (parsedJson.projectId) extracted.projectId = parsedJson.projectId;
          if (parsedJson.storageBucket) extracted.storageBucket = parsedJson.storageBucket;
          if (parsedJson.messagingSenderId) extracted.messagingSenderId = parsedJson.messagingSenderId;
          if (parsedJson.appId) extracted.appId = parsedJson.appId;
        } catch (_) {}
      }

      setConfig(extracted);
      setShowRawPaste(false);
      setRawSnippet('');
      alert('Firebase config keys parsed and auto-filled successfully!');
    } catch (err) {
      alert('Could not auto-parse snippet. Please check formatting or fill fields manually.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) {
      alert('Please fill at least the API Key and Project ID.');
      return;
    }
    localStorage.setItem('digica_firebase_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect Firebase and revert to local storage?')) {
      localStorage.removeItem('digica_firebase_config');
      window.location.reload();
    }
  };

  const handleBulkUpload = async () => {
    if (!onUploadAll || !currentData) return;
    setUploading(true);
    setUploadMsg('Uploading all firm records to Firebase Firestore...');
    try {
      await onUploadAll(currentData);
      setUploadMsg('Upload Complete! All clients, tasks, and records are synced to Firebase.');
    } catch (err) {
      setUploadMsg('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              Connect Firebase Cloud Database (Firestore)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sync CA firm clients, GST compliance, ITRs, tasks, and audit logs to Google Firebase.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
          isFirebaseConfigured
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>
              Connection Status:{' '}
              <strong className="font-semibold">
                {isFirebaseConfigured
                  ? 'Connected to Google Firebase Cloud'
                  : 'Disconnected (Running on Local Offline Database)'}
              </strong>
            </span>
          </div>
          {isFirebaseConfigured && (
            <button
              onClick={handleDisconnect}
              className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-semibold transition"
            >
              Disconnect Cloud
            </button>
          )}
        </div>

        {/* Bulk Data Upload Option (If Connected) */}
        {isFirebaseConfigured && (
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  Initial Cloud Sync (Upload All Local Data to Firebase)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Populate your Firebase Firestore collections with all currently stored clients, works, and invoices.
                </p>
              </div>
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={uploading}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md disabled:opacity-50 transition shrink-0"
              >
                {uploading ? 'Uploading...' : 'Upload Data to Firebase'}
              </button>
            </div>
            {uploadMsg && (
              <div className="text-[11px] font-mono text-emerald-400 pt-1">
                {uploadMsg}
              </div>
            )}
          </div>
        )}

        {/* Quick Paste Snippet Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Firebase Credentials</span>
          <button
            type="button"
            onClick={() => setShowRawPaste(!showRawPaste)}
            className="text-xs text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{showRawPaste ? 'Hide Paste Box' : '1-Click Paste Full Firebase Object'}</span>
          </button>
        </div>

        {showRawPaste && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 block">
              Paste the entire <code className="text-amber-400">const firebaseConfig = &#123; ... &#125;;</code> snippet from Firebase Console:
            </label>
            <textarea
              rows={4}
              value={rawSnippet}
              onChange={(e) => setRawSnippet(e.target.value)}
              placeholder={'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "my-app.firebaseapp.com",\n  projectId: "my-app",\n  ...\n};'}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleParseSnippet}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Auto-Fill All Fields
            </button>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Firebase API Key (<span className="font-mono text-amber-400">apiKey</span>) *
            </label>
            <input
              type="text"
              required
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value.trim() })}
              placeholder="AIzaSyA..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Project ID (<span className="font-mono text-amber-400">projectId</span>) *
              </label>
              <input
                type="text"
                required
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value.trim() })}
                placeholder="my-ca-firm-12345"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Auth Domain (<span className="font-mono text-amber-400">authDomain</span>)
              </label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value.trim() })}
                placeholder="my-ca-firm-12345.firebaseapp.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Storage Bucket (<span className="font-mono text-amber-400">storageBucket</span>)
              </label>
              <input
                type="text"
                value={config.storageBucket}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value.trim() })}
                placeholder="my-ca-firm-12345.firebasestorage.app"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                App ID (<span className="font-mono text-amber-400">appId</span>)
              </label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value.trim() })}
                placeholder="1:123456789:web:abcdef"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-400">
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Open Firebase Console <ExternalLink className="w-3 h-3" />
            </a>

            {savedSuccess && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Configuration Saved! Reloading app...
              </span>
            )}
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg transition"
            >
              Save & Connect Firebase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
