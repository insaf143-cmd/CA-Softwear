import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCheck,
  FolderArchive,
  User,
  Calendar,
  Building,
  Paperclip,
  ExternalLink,
  Plus,
  X,
  FileCode,
  Tag,
  Share2,
  Copy,
  Check,
  Cloud,
  HardDrive,
  FolderOpen,
  Link2,
  Globe,
  Settings,
  HelpCircle,
  Info
} from 'lucide-react';

export default function EvidenceVault({
  evidenceDocuments = [],
  setEvidenceDocuments,
  clients = [],
  tasks = [],
  currentUser,
  firmProfile = {},
  onOpenFirmSettings
}) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState('cloudLink'); // 'cloudLink' or 'fileUpload'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [storageTypeFilter, setStorageTypeFilter] = useState('All');
  const [copiedDocId, setCopiedDocId] = useState(null);
  const [showHelpBanner, setShowHelpBanner] = useState(true);

  // Form State: Cloud / Google Drive Link
  const [cloudUrl, setCloudUrl] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [cloudType, setCloudType] = useState('Google Drive');

  // Form State: Direct File Upload
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Common Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Audit Working Paper');
  const [documentRemarks, setDocumentRemarks] = useState('');
  const [fyYear, setFyYear] = useState('2025-26');

  // Handle direct file selection
  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const validFiles = [];
    files.forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 15MB limit. Please upload a smaller file or link a Google Drive folder.`);
        return;
      }
      validFiles.push(file);
    });

    setUploadedFiles(validFiles);
  };

  // Submit and save evidence (Handles both Cloud Links and File Uploads)
  const handleSaveEvidence = async (e) => {
    e.preventDefault();

    const targetClient = clients.find((c) => c.id === selectedClientId);
    const targetTask = tasks.find((t) => t.id === selectedTaskId);

    // MODE 1: CLOUD LINK / GOOGLE DRIVE / NETWORK LOCATION
    if (importMode === 'cloudLink') {
      if (!cloudUrl.trim()) {
        alert('Please enter a valid Google Drive URL, Cloud Link, or Network Path.');
        return;
      }
      if (!docTitle.trim()) {
        alert('Please provide a document or folder title.');
        return;
      }

      const docId = `EVID-CLOUD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newDoc = {
        id: docId,
        fileName: docTitle.trim(),
        isCloudLink: true,
        cloudUrl: cloudUrl.trim(),
        cloudType: cloudType,
        fileSize: cloudType === 'Local Network / PC Folder Path' ? 'Local Path' : cloudType,
        fileType: 'cloud-link',
        dataUrl: null,
        category: selectedCategory,
        clientId: selectedClientId || 'General',
        clientName: targetClient ? targetClient.name : 'General / Firm Internal',
        taskId: selectedTaskId || '',
        taskTitle: targetTask ? targetTask.title : 'General Firm Compliance',
        remarks: documentRemarks.trim() || `Linked to ${cloudType} repository.`,
        fy: fyYear,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        uploadedBy: currentUser ? currentUser.name : 'Firm User',
        uploadedById: currentUser ? currentUser.id : 'U_USER'
      };

      const updated = [...(evidenceDocuments || []), newDoc];
      setEvidenceDocuments(updated);

      setShowImportModal(false);
      resetForm();
      alert(`Successfully linked "${newDoc.fileName}" to ${cloudType}!`);
      return;
    }

    // MODE 2: DIRECT LOCAL FILE UPLOAD
    if (uploadedFiles.length === 0) {
      alert('Please select at least one document to import.');
      return;
    }

    setIsUploading(true);

    const newDocs = [];
    for (const file of uploadedFiles) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      const docId = `EVID-FILE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      newDocs.push({
        id: docId,
        fileName: file.name,
        isCloudLink: false,
        cloudUrl: null,
        cloudType: null,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        fileType: file.type || 'application/octet-stream',
        dataUrl,
        category: selectedCategory,
        clientId: selectedClientId || 'General',
        clientName: targetClient ? targetClient.name : 'General / Firm Internal',
        taskId: selectedTaskId || '',
        taskTitle: targetTask ? targetTask.title : 'General Firm Compliance',
        remarks: documentRemarks.trim() || 'Uploaded direct file as audit evidence.',
        fy: fyYear,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        uploadedBy: currentUser ? currentUser.name : 'Firm User',
        uploadedById: currentUser ? currentUser.id : 'U_USER'
      });
    }

    const updated = [...(evidenceDocuments || []), ...newDocs];
    setEvidenceDocuments(updated);

    setIsUploading(false);
    setShowImportModal(false);
    resetForm();
    alert(`Successfully imported ${newDocs.length} evidence document(s)!`);
  };

  const resetForm = () => {
    setCloudUrl('');
    setDocTitle('');
    setCloudType('Google Drive');
    setUploadedFiles([]);
    setDocumentRemarks('');
    setSelectedClientId('');
    setSelectedTaskId('');
  };

  // Open Cloud Link Handler
  const handleOpenLink = (url) => {
    if (!url) return;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Local or network path
      navigator.clipboard.writeText(url);
      alert(`Local network path copied to clipboard:\n${url}\n\nPaste it into your Windows File Explorer.`);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = (doc) => {
    const textToCopy = doc.cloudUrl || doc.fileName;
    navigator.clipboard.writeText(textToCopy);
    setCopiedDocId(doc.id);
    setTimeout(() => {
      setCopiedDocId(null);
    }, 2000);
  };

  // Download direct file handler
  const handleDownload = (doc) => {
    if (!doc.dataUrl) {
      if (doc.cloudUrl) {
        handleOpenLink(doc.cloudUrl);
        return;
      }
      alert('File content not available for download.');
      return;
    }
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.fileName || 'evidence-document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete handler
  const handleDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this evidence record?')) {
      const updated = evidenceDocuments.filter((d) => d.id !== docId);
      setEvidenceDocuments(updated);
    }
  };

  // Filtered documents
  const filteredDocuments = (evidenceDocuments || []).filter((doc) => {
    const matchesSearch =
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.cloudUrl && doc.cloudUrl.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'All' ? true : doc.category === categoryFilter;

    const matchesClient =
      clientFilter === 'All' ? true : doc.clientId === clientFilter;

    const matchesStorage =
      storageTypeFilter === 'All'
        ? true
        : storageTypeFilter === 'cloud'
        ? doc.isCloudLink
        : !doc.isCloudLink;

    return matchesSearch && matchesCategory && matchesClient && matchesStorage;
  });

  // Icon helper based on type
  const getDocIcon = (doc) => {
    if (doc.isCloudLink) {
      if (doc.cloudType === 'Google Drive' || doc.cloudType === 'Google Sheets / Docs') {
        return <Cloud className="w-5 h-5 text-cyan-400" />;
      }
      if (doc.cloudType === 'OneDrive / SharePoint') {
        return <Cloud className="w-5 h-5 text-blue-400" />;
      }
      if (doc.cloudType === 'Local Network / PC Folder Path') {
        return <HardDrive className="w-5 h-5 text-purple-400" />;
      }
      return <ExternalLink className="w-5 h-5 text-amber-400" />;
    }

    const lowerName = (doc.fileName || '').toLowerCase();
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (lowerName.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
      return <Paperclip className="w-5 h-5 text-cyan-400" />;
    }
    return <FileCheck className="w-5 h-5 text-blue-400" />;
  };

  const cloudCount = (evidenceDocuments || []).filter((d) => d.isCloudLink).length;
  const directCount = (evidenceDocuments || []).filter((d) => !d.isCloudLink).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
              Audit Working Papers & Cloud Vault
            </span>
            <span className="text-xs text-slate-400">Google Drive & Multi-User Repository</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
            <FolderArchive className="w-7 h-7 text-cyan-400" />
            Evidence & Document Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Store, organize, and link statutory proofs, Google Drive audit folders, bank statements, tax challans, and verification working papers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Master Firm Google Drive Button */}
          {firmProfile?.driveFolderUrl ? (
            <button
              onClick={() => handleOpenLink(firmProfile.driveFolderUrl)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-md transition hover:scale-[1.02]"
              title="Open the firm's master Google Drive audit folder in a new tab"
            >
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>Firm Google Drive ↗</span>
            </button>
          ) : (
            <button
              onClick={onOpenFirmSettings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition"
              title="Configure Firm Master Google Drive in Settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Set Master Drive</span>
            </button>
          )}

          {/* Import / Link Evidence Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Link / Import Evidence</span>
          </button>
        </div>
      </div>

      {/* Explanatory Info Card: Where Evidences are Saved & Google Drive Guide */}
      {showHelpBanner && (
        <div className="relative p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 border border-cyan-800/40 shadow-lg">
          <button
            onClick={() => setShowHelpBanner(false)}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            title="Dismiss info banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 shrink-0 border border-cyan-500/30 mt-0.5">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                Where are evidence documents saved? Can I use Google Drive?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-300">Yes! You can link Google Drive, OneDrive, Dropbox, or any Local Network Folder.</span> TAXBAY gives you two flexible ways to manage audit evidence:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" />
                    <span>Option 1: Google Drive & Cloud Links (Recommended)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Store heavy audit files, multi-gigabyte Tally backups, and client folders in your Google Drive or office server. Paste the folder/file link into TAXBAY. Your team gets 1-click instant access with <span className="text-emerald-400 font-semibold">zero file size limits</span>.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" />
                    <span>Option 2: Direct Local Uploads</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Directly upload individual statutory receipts, tax challans, or verification sheets (up to 15MB) into TAXBAY's synchronized local database for quick offline viewing and downloading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block font-semibold uppercase">Total Evidences</span>
          <div className="text-2xl font-extrabold text-white mt-1">{(evidenceDocuments || []).length}</div>
          <span className="text-[10px] text-cyan-400 font-medium">Ready for Statutory Review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block font-semibold uppercase">Google Drive & Cloud Links</span>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">{cloudCount}</div>
          <span className="text-[10px] text-cyan-400/80 font-medium">Unlimited Cloud Storage</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block font-semibold uppercase">Direct Stored Files</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{directCount}</div>
          <span className="text-[10px] text-emerald-400/80 font-medium">Synchronized in App</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block font-semibold uppercase">Audit Working Papers</span>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">
            {(evidenceDocuments || []).filter((d) => d.category === 'Audit Working Paper').length}
          </div>
          <span className="text-[10px] text-purple-400/80 font-medium">Statutory Verification</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, client, work, Drive link, or staff user..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center text-xs">
          {/* Storage Type Filter */}
          <select
            value={storageTypeFilter}
            onChange={(e) => setStorageTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="All">All Storage Locations</option>
            <option value="cloud">☁️ Google Drive & Cloud Links</option>
            <option value="file">📁 Direct Local Files</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Audit Working Paper">Audit Working Paper</option>
            <option value="Bank Statement / Financials">Bank Statement / Financials</option>
            <option value="Tax Challan / Proof of Payment">Tax Challan / Proof of Payment</option>
            <option value="Statutory Return Acknowledgement">Statutory Return Ack</option>
            <option value="Invoice / Bill Proof">Invoice / Bill Proof</option>
            <option value="ROC / Board Resolution">ROC / Board Resolution</option>
            <option value="General Evidence">General Evidence</option>
          </select>

          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-medium max-w-xs truncate"
          >
            <option value="All">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocuments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-200">No Evidence Documents Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'All' || storageTypeFilter !== 'All'
              ? 'No documents match your current filter parameters.'
              : 'Link your client Google Drive folders, audit working papers, bank statements, or tax challans to get started.'}
          </p>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
          >
            Link / Import First Document
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Document / File</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Associated Work</th>
                  <th className="py-3 px-4">Uploaded / Linked By</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                          {getDocIcon(doc)}
                        </div>
                        <div className="truncate max-w-[220px]">
                          <span className="font-bold text-slate-100 block truncate" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            FY {doc.fy}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Storage Location Badge */}
                    <td className="py-3 px-4">
                      {doc.isCloudLink ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            <Cloud className="w-3 h-3 text-cyan-400" />
                            <span>{doc.cloudType || 'Google Drive'}</span>
                          </span>
                          {doc.cloudUrl && (
                            <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[140px]" title={doc.cloudUrl}>
                              {doc.cloudUrl}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <HardDrive className="w-3 h-3 text-emerald-400" />
                          <span>Direct File ({doc.fileSize})</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 truncate max-w-[150px]">
                        {doc.clientName}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{doc.clientId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-slate-800 text-cyan-300 border border-slate-700 whitespace-nowrap">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 truncate max-w-[180px]" title={doc.taskTitle}>
                        {doc.taskTitle}
                      </div>
                      {doc.remarks && (
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px] italic">
                          "{doc.remarks}"
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.uploadedBy}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {doc.uploadedAt}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.isCloudLink ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenLink(doc.cloudUrl)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-cyan-900/30"
                              title="Open in Google Drive / Cloud"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open ↗</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyLink(doc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Copy URL / Path to Clipboard"
                            >
                              {copiedDocId === doc.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-xs flex items-center gap-1"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete Evidence"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import / Link Document Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Evidence to Vault</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Link Google Drive repositories or upload direct compliance files.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  resetForm();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => setImportMode('cloudLink')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition ${
                  importMode === 'cloudLink'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>Link Google Drive / Cloud (Recommended)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('fileUpload')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition ${
                  importMode === 'fileUpload'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Direct Local File Upload</span>
              </button>
            </div>

            <form onSubmit={handleSaveEvidence} className="space-y-4 text-xs">
              {/* MODE 1: CLOUD / GOOGLE DRIVE / LOCATION */}
              {importMode === 'cloudLink' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-800/40 border border-cyan-500/20">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Document or Folder Title <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="e.g. FY 2024-25 Statutory Audit Working Papers & Ledgers"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-semibold mb-1">
                        Google Drive URL or Folder Location <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative">
                        <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                        <input
                          type="text"
                          required
                          value={cloudUrl}
                          onChange={(e) => setCloudUrl(e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/... or D:\Audit\ClientA"
                          className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Storage Type
                      </label>
                      <select
                        value={cloudType}
                        onChange={(e) => setCloudType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                      >
                        <option value="Google Drive">Google Drive</option>
                        <option value="Google Sheets / Docs">Google Sheets / Docs</option>
                        <option value="OneDrive / SharePoint">OneDrive / SharePoint</option>
                        <option value="Dropbox">Dropbox</option>
                        <option value="Local Network / PC Folder Path">Local / Network Path</option>
                        <option value="Other Web Link">Other Web Link</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-cyan-300/90 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/30">
                    💡 <strong>Pro-Tip for CA Firms:</strong> Keeps all audit files securely in your Google Drive or Office Server. Anyone with access can click <strong>Open ↗</strong> directly from TAXBAY with no storage limits.
                  </p>
                </div>
              )}

              {/* MODE 2: DIRECT LOCAL FILE DROP */}
              {importMode === 'fileUpload' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Select Document(s) to Import <span className="text-cyan-400">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center bg-slate-800/40 transition">
                    <input
                      type="file"
                      multiple
                      required={importMode === 'fileUpload'}
                      onChange={handleFileChange}
                      className="hidden"
                      id="evidence-file-input"
                    />
                    <label
                      htmlFor="evidence-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-8 h-8 text-cyan-400" />
                      <span className="font-bold text-slate-200">
                        Click to Browse or Drag & Drop Documents
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Supports PDF, Excel (.xlsx, .xls), Word (.docx), Scans & Images (Max 15MB each)
                      </span>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
                      <span className="font-bold text-cyan-300 block">
                        Selected {uploadedFiles.length} file(s) for import:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-slate-300 max-h-24 overflow-y-auto">
                        {uploadedFiles.map((f, i) => (
                          <li key={i} className="truncate">
                            {f.name} ({(f.size / 1024).toFixed(1)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Client & Work Tagging */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Link to Client <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.pan || c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Link to Allocated Work / Task
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 font-medium truncate"
                  >
                    <option value="">General (No Specific Task)</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & FY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Evidence Category <span className="text-cyan-400">*</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="Audit Working Paper">Audit Working Paper</option>
                    <option value="Bank Statement / Financials">Bank Statement / Financials</option>
                    <option value="Tax Challan / Proof of Payment">Tax Challan / Proof of Payment</option>
                    <option value="Statutory Return Acknowledgement">Statutory Return Ack</option>
                    <option value="Invoice / Bill Proof">Invoice / Bill Proof</option>
                    <option value="ROC / Board Resolution">ROC / Board Resolution</option>
                    <option value="General Evidence">General Evidence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Financial Year (FY)
                  </label>
                  <select
                    value={fyYear}
                    onChange={(e) => setFyYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 font-medium font-mono"
                  >
                    <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
                    <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
                    <option value="2023-24">FY 2023-24 (AY 2024-25)</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Auditor Remarks / Working Notes
                </label>
                <textarea
                  rows="2"
                  value={documentRemarks}
                  onChange={(e) => setDocumentRemarks(e.target.value)}
                  placeholder="e.g. Verified with 26AS, bank statements reconciliation attached..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-900/50"
                >
                  {importMode === 'cloudLink' ? (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>Link Google Drive / Cloud to Vault</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>{isUploading ? 'Importing...' : 'Save File to Vault'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
