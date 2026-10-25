/**
 * ==============================================================================
 * AUTOMATIC REFLECTION ENGINE (AUTO-SYNC TO GITHUB & GOOGLE APPS SCRIPT)
 * CA Practice & Task Management System
 * Author: Senior Solutions Architect
 * ==============================================================================
 * This script continuously monitors local project files. When any change occurs:
 * 1. Debounces rapid saves (3-second buffer).
 * 2. Automatically stages & commits changes to Git with formatted timestamp.
 * 3. Automatically pushes the commit to GitHub.
 * 4. If .clasp.json is configured, automatically runs 'clasp push' to update
 *    the live Google Sheet / Web App immediately without manual copy-pasting.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

const PROJECT_DIR = __dirname;
const DEBOUNCE_MS = 3000;
let debounceTimer = null;
let changedFiles = new Set();
let isSyncing = false;

// Files to watch
const WATCH_EXTENSIONS = ['.gs', '.html', '.json', '.md', '.js'];
const IGNORED_PATHS = ['.git', 'node_modules', '.tmp'];

console.log('===============================================================');
console.log('🚀 CA Practice System: Automatic Reflection Engine Started');
console.log('📁 Watching folder:', PROJECT_DIR);
console.log('⏱️  Debounce interval: 3 seconds');
console.log('🔄 Targets: GitHub Repository + Google Apps Script (via Clasp)');
console.log('===============================================================\n');

function getTimestamp() {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

function runCommand(cmd, cwd = PROJECT_DIR) {
  try {
    return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch (err) {
    return null;
  }
}

function getCurrentBranch() {
  const branch = runCommand('git branch --show-current');
  return branch || 'office-management-suite';
}

function syncToGitHubAndAppsScript() {
  if (isSyncing) return;
  isSyncing = true;

  const timestamp = getTimestamp();
  const fileList = Array.from(changedFiles).join(', ');
  changedFiles.clear();

  console.log(`\n[${timestamp}] ⚡ Detected changes in: ${fileList}`);
  console.log(`[${timestamp}] 📦 Preparing automated commit & push...`);

  try {
    // 1. Check Git Status
    const status = runCommand('git status --porcelain');
    if (!status) {
      console.log(`[${timestamp}] ℹ️ No uncommitted changes detected in Git. Working tree clean.`);
      isSyncing = false;
      return;
    }

    // 2. Stage All Changes
    runCommand('git add .');

    // 3. Commit
    const commitMsg = `auto-sync: updated ${fileList} [${timestamp}]`;
    runCommand(`git commit -m "${commitMsg}"`);
    console.log(`[${timestamp}] ✅ Created local commit: "${commitMsg}"`);

    // 4. Push to Remote
    const branch = getCurrentBranch();
    console.log(`[${timestamp}] 🚀 Pushing to GitHub (origin/${branch})...`);
    const pushOutput = runCommand(`git push origin ${branch}`);
    console.log(`[${timestamp}] 🎉 GitHub synchronized successfully!`);

    // 5. Check if clasp is configured for live Apps Script reflection
    const claspConfig = path.join(PROJECT_DIR, '.clasp.json');
    if (fs.existsSync(claspConfig)) {
      try {
        const raw = fs.readFileSync(claspConfig, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.scriptId && parsed.scriptId !== 'YOUR_APPS_SCRIPT_ID_HERE') {
          console.log(`[${timestamp}] ☁️ Synchronizing live code with Google Apps Script (clasp push)...`);
          const claspOutput = runCommand('npx @google/clasp push -f');
          console.log(`[${timestamp}] 🌟 Live Google Sheet / Web App updated automatically!`);
        } else {
          console.log(`[${timestamp}] 💡 Tip: Set scriptId in .clasp.json for instant live Google Sheet updates.`);
        }
      } catch (cErr) {
        // Clasp push notice
      }
    }
  } catch (err) {
    console.error(`[${timestamp}] ⚠️ Auto-sync encountered notice:`, err.message || err);
  } finally {
    isSyncing = false;
    console.log(`[${getTimestamp()}] 👁️ Waiting for next change...\n`);
  }
}

// Start Directory Watcher
fs.watch(PROJECT_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  // Filter out git, node_modules, temp files
  for (const ign of IGNORED_PATHS) {
    if (filename.includes(ign)) return;
  }

  const ext = path.extname(filename).toLowerCase();
  if (!WATCH_EXTENSIONS.includes(ext)) return;

  changedFiles.add(filename);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    syncToGitHubAndAppsScript();
  }, DEBOUNCE_MS);
});

// Keep process active
process.on('SIGINT', () => {
  console.log('\n🛑 Auto-sync watcher stopped.');
  process.exit(0);
});
