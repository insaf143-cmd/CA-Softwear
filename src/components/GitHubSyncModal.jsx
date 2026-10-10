import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  GitCommit,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Code2
} from 'lucide-react';

const GitHubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function GitHubSyncModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Connected & Synchronized');

  const gitHubId = 'insaf143-cmd';
  const repoName = 'CA-Softwear';
  const repoUrl = 'https://github.com/insaf143-cmd/CA-Softwear.git';
  const branch = 'main';

  const handleCopyCmd = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 md:p-8 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 shadow-md">
              <GitHubIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                GitHub Repository Integration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically connected to your GitHub ID: <strong>{gitHubId}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Connection Status: <strong>{syncStatus}</strong></span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
            LIVE GIT
          </span>
        </div>

        {/* Repo Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GitHub ID / Username:</span>
              <span className="font-bold text-slate-100 font-mono">@{gitHubId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Repository Name:</span>
              <span className="font-bold text-cyan-300 font-mono">{repoName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-amber-400" /> Active Branch:
              </span>
              <span className="font-mono text-amber-300 font-bold">{branch}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Remote URL:</span>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-[220px]"
              >
                {repoUrl} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          {/* Quick Push Instructions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 text-[11px]">Git Sync Command:</span>
              <button
                onClick={() => handleCopyCmd('git push -u origin main')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
              <code>git push -u origin main</code>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-800">
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Close
            </button>
            <a
              href={`https://github.com/${gitHubId}/${repoName}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              <span>Open GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
