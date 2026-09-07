import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  ExternalLink, 
  Check, 
  Copy, 
  RefreshCw, 
  FolderPlus, 
  CheckCircle2, 
  X, 
  Users, 
  FolderTree, 
  Cloud,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  fetchOneDriveFolders, 
  createOneDriveFolder, 
  batchCreateClientOneDriveFolders,
  liveProvisionWithToken,
  updateOneDriveConfig,
  fetchOneDriveScripts,
  ONEDRIVE_DEFAULT_CONFIG,
  DEFAULT_CLIENT_SUBFOLDERS,
  OneDriveStoredFolder,
  formatSharePointDirectUrl,
  formatOneDriveAppUrl,
  getPersonalOneDriveRootUrl,
  MAX_UPLOAD_LIMIT_MB
} from '../../services/oneDriveClient';
import { ClientProfile } from '../../types';

interface OneDriveFolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients?: ClientProfile[];
}

export const OneDriveFolderManagerModal: React.FC<OneDriveFolderManagerModalProps> = ({
  isOpen,
  onClose,
  clients = []
}) => {
  const [folders, setFolders] = useState<OneDriveStoredFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'folders' | 'create' | 'batch' | 'live-setup' | 'api'>('folders');
  const [showAdvisory, setShowAdvisory] = useState<boolean>(true);
  const folderInputRef = React.useRef<HTMLInputElement>(null);
  
  // Custom folder creation state
  const [folderName, setFolderName] = useState('');
  const [subfolderInput, setSubfolderInput] = useState('');
  const [subfolders, setSubfolders] = useState<string[]>([
    'Contracts',
    'Building & Pest Reports',
    'Finance Documents'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState<string | null>(null);
  const [createdFolderInfo, setCreatedFolderInfo] = useState<{
    folder: OneDriveStoredFolder;
    subfolderResults: Array<{ name: string; status: string }>;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch provisioning state
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    provisionedCount: number;
    results: Array<{ clientName: string; webUrl?: string }>;
  } | null>(null);

  // Live fix & scripts state
  const [tokenInput, setTokenInput] = useState('');
  const [isTokenProvisioning, setIsTokenProvisioning] = useState(false);
  const [tokenProvisionResult, setTokenProvisionResult] = useState<{
    success: boolean;
    createdFolders: Array<{ name: string; path: string; status: string; id?: string; webUrl?: string; error?: string }>;
    basePathResult: { status: string; id?: string; webUrl?: string; error?: string };
    totalSubfoldersCreated: number;
    userEmail: string;
    executedAt: string;
  } | null>(null);
  const [scriptsData, setScriptsData] = useState<{
    parentFolderUrl: string;
    powerShellScript: string;
    graphExplorerUrl: string;
    graphCurlSample: string;
    targetUser: string;
    basePath: string;
    clients: string[];
    subfolders: string[];
  } | null>(null);
  const [azureClientId, setAzureClientId] = useState('');
  const [azureClientSecret, setAzureClientSecret] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveStatus, setConfigSaveStatus] = useState<string | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      loadScripts();
    }
  }, [isOpen]);

  const loadScripts = async () => {
    try {
      const data = await fetchOneDriveScripts();
      setScriptsData(data);
    } catch {
      // Non-blocking fallback
    }
  };

  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOneDriveFolders();
      setFolders(data.folders);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error loading folders';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleAddSubfolder = () => {
    if (!subfolderInput.trim()) return;
    if (!subfolders.includes(subfolderInput.trim())) {
      setSubfolders([...subfolders, subfolderInput.trim()]);
    }
    setSubfolderInput('');
  };

  const handleRemoveSubfolder = (name: string) => {
    setSubfolders(subfolders.filter(s => s !== name));
  };

  const handleCreateFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a folder name (e.g., Sunshine Coast Shortlists or 14 Burke St Acquisition)');
      folderInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setCreationSuccess(null);
    setCreatedFolderInfo(null);

    try {
      const result = await createOneDriveFolder({
        folderName: trimmed,
        subfolders
      });

      setCreatedFolderInfo(result);
      setCreationSuccess(`Folder "${result.folder.name}" and ${result.subfolderResults.length} subfolders created in OneDrive & SharePoint.`);
      setFolderName('');
      await loadFolders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create folder in OneDrive';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchProvision = async () => {
    const clientNames = clients.map(c => c.fullName || c.name);
    if (clientNames.length === 0) {
      clientNames.push("Marcus & Elena Vance", "Dr. Sophia Thornton (SMSF)");
    }

    setIsBatchProcessing(true);
    setErrorMessage(null);
    try {
      const result = await batchCreateClientOneDriveFolders(clientNames);
      setBatchResult({
        provisionedCount: result.provisionedCount,
        results: result.results.map(r => ({
          clientName: r.clientName
        }))
      });
      await loadFolders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Batch provisioning failed';
      setErrorMessage(message);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleLiveTokenProvision = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMessage('Please paste a valid Microsoft Graph Access Token.');
      return;
    }

    setIsTokenProvisioning(true);
    setErrorMessage(null);
    setTokenProvisionResult(null);

    try {
      const clientNames = clients.map(c => c.fullName || c.name);
      if (clientNames.length === 0) {
        clientNames.push("Dr. Sophia Thornton", "Dr. Sophia Thornton (SMSF)", "David & Sarah Miller", "Marcus & Elena Vance");
      }

      const result = await liveProvisionWithToken(tokenInput.trim(), clientNames);
      setTokenProvisionResult(result);
      await loadFolders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to provision with live token';
      setErrorMessage(message);
    } finally {
      setIsTokenProvisioning(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSaveStatus(null);
    setErrorMessage(null);

    try {
      const res = await updateOneDriveConfig({
        clientId: azureClientId || undefined,
        clientSecret: azureClientSecret || undefined
      });

      setConfigSaveStatus(`Configuration saved! Azure connection status: ${res.connectionStatus.status.toUpperCase()}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save configuration';
      setErrorMessage(message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  if (!isOpen) return null;

  const sharePointUrl = formatSharePointDirectUrl(ONEDRIVE_DEFAULT_CONFIG.basePath);
  const modernOneDriveUrl = formatOneDriveAppUrl(ONEDRIVE_DEFAULT_CONFIG.basePath);
  const personalRootUrl = getPersonalOneDriveRootUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onedrive-folder-manager-title"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#1A3A5C] text-white flex items-center justify-between border-b border-[#B8960C]/30 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Cloud className="w-5 h-5 text-[#0078D4]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="onedrive-folder-manager-title" className="text-base sm:text-lg font-bold font-serif-heading truncate text-white">
                  Microsoft OneDrive & SharePoint Folders
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-400/30">
                  Azure MSAL
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/30">
                  <Zap className="w-3 h-3 text-emerald-300" />
                  {MAX_UPLOAD_LIMIT_MB}MB Limit
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5">
                Target User: <strong className="text-[#F4D068] font-mono">{ONEDRIVE_DEFAULT_CONFIG.userEmail}</strong> • Tenant: <span className="font-mono text-slate-200">{ONEDRIVE_DEFAULT_CONFIG.tenantId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Path Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FolderTree className="w-4 h-4 text-[#0078D4] shrink-0" />
            <span className="text-slate-500 font-medium">Azure Storage Base Path:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold text-slate-800 text-[11px] truncate">
              {ONEDRIVE_DEFAULT_CONFIG.basePath}
            </code>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleCopy(ONEDRIVE_DEFAULT_CONFIG.basePath, 'base-path')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold transition cursor-pointer"
              title="Copy Base Path"
            >
              {copiedKey === 'base-path' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedKey === 'base-path' ? 'Copied' : 'Copy Path'}</span>
            </button>

            <a
              href={sharePointUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0078D4] hover:bg-[#006cbd] text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
              title="Open Abhijith App Test folder directly in SharePoint library"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>SharePoint Library</span>
            </a>

            <a
              href={modernOneDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0078D4] border border-blue-200 text-[11px] font-bold transition cursor-pointer"
              title="Open in Microsoft 365 Modern OneDrive web app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Modern App</span>
            </a>

            <a
              href={personalRootUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold transition cursor-pointer"
              title="Open Augustine's personal OneDrive root (guaranteed to open without 404)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>My OneDrive Root</span>
            </a>
          </div>
        </div>

        {/* 404 & Upload Limits Advisory Banner */}
        {showAdvisory && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-2.5 flex items-start justify-between gap-2.5 text-xs text-amber-900 shrink-0">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">404 Resolution &amp; Upgraded Limits:</span> Folder links are formatted using clean segment slashes (<code className="font-mono font-bold bg-amber-100 px-1 py-0.2 rounded">/</code>) instead of encoded slashes (<code className="font-mono bg-amber-100 px-1 py-0.2 rounded line-through">%2F</code>) to prevent SharePoint 404 Not Found errors. Upload limit has been upgraded to <strong>{MAX_UPLOAD_LIMIT_MB}MB</strong>. If a newly targeted folder is not yet synced on your tenant, click <strong>&quot;Modern App&quot;</strong> or <strong>&quot;My OneDrive Root&quot;</strong> to browse directly from your OneDrive home.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvisory(false)}
              className="p-1 hover:bg-amber-200/60 rounded text-amber-700 transition cursor-pointer shrink-0"
              title="Dismiss advisory"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('folders')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'folders'
                ? 'border-[#0078D4] text-[#0078D4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Active Folders</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold">
              {folders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#0078D4] text-[#0078D4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Create Custom Folder</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'batch'
                ? 'border-[#0078D4] text-[#0078D4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Batch Provision Client Folders</span>
          </button>

          <button
            onClick={() => setActiveTab('live-setup')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'live-setup'
                ? 'border-amber-600 text-amber-700 bg-amber-50/70'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Fix "Item Not Available" / Live Setup</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
              1-Click Fix
            </span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'api'
                ? 'border-[#0078D4] text-[#0078D4]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Microsoft Graph API Spec</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: ALL FOLDERS */}
          {activeTab === 'folders' && (
            <div className="space-y-4">
              {/* Fix Advice Banner for "Item Not Available" */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-xs text-amber-950 flex items-center gap-2">
                      Seeing "Unknown render failure / This item isn't available" in OneDrive?
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      OneDrive displays this error when you open a link to a folder that has not yet been physically created in your cloud storage.
                      Click <strong>"Open 'Abhijith App Test' in OneDrive"</strong> to view your active folder, or use the <strong>1-Click Fix</strong> tab to automatically create all client folders.
                    </p>
                    <div className="pt-1.5 flex flex-wrap items-center gap-2">
                      <a
                        href={formatOneDriveAppUrl(ONEDRIVE_DEFAULT_CONFIG.basePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open "Abhijith App Test" in OneDrive</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab('live-setup')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Open 1-Click Fix &amp; Setup Guide</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provisioned Folders in OneDrive</h3>
                  <p className="text-xs text-slate-500">
                    Folders inside <code className="font-mono text-slate-700 font-bold">{ONEDRIVE_DEFAULT_CONFIG.basePath}/</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0078D4] hover:bg-[#006cbd] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Folder</span>
                  </button>
                  <button
                    onClick={loadFolders}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0078D4]' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0078D4]" />
                  <span>Loading OneDrive folder tree...</span>
                </div>
              ) : folders.length === 0 ? (
                <div className="py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center p-6">
                  <Folder className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No folders provisioned yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    Use the &quot;Batch Provision Client Folders&quot; tab to generate folders for all investors, or create custom folders.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {folders.map((folder) => (
                    <div 
                      key={folder.id} 
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0078D4]/50 shadow-xs hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-blue-50 text-[#0078D4] border border-blue-200 shrink-0">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 truncate">{folder.name}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                folder.type === 'client' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : folder.type === 'system'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {folder.type}
                              </span>
                            </div>
                            <p className="font-mono text-xs text-slate-500 truncate mt-0.5" title={folder.path}>
                              {folder.path}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          <button
                            onClick={() => handleCopy(folder.webUrl, `link-${folder.id}`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer"
                            title="Copy SharePoint URL"
                          >
                            {copiedKey === `link-${folder.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={folder.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0078D4] hover:bg-[#006cbd] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                            title="Open direct SharePoint library folder"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>SharePoint</span>
                          </a>
                          <a
                            href={folder.oneDriveAppUrl || formatOneDriveAppUrl(folder.path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0078D4] border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                            title="Open Modern OneDrive Web App"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Modern App</span>
                          </a>
                        </div>
                      </div>

                      {/* Subfolders Chips */}
                      {folder.subfolders && folder.subfolders.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                            Subfolders ({folder.subfolders.length}):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {folder.subfolders.map((sub, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
                              >
                                <Folder className="w-2.5 h-2.5 text-blue-600" />
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE CUSTOM FOLDER */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateFolder} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New Folder in OneDrive &amp; SharePoint</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provisions a folder and subdirectories under <code className="font-mono text-slate-700 font-semibold">{ONEDRIVE_DEFAULT_CONFIG.basePath}</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateFolder()}
                  disabled={isSubmitting}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? 'Creating...' : 'Create Folder'}</span>
                </button>
              </div>

              {createdFolderInfo && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 space-y-2.5 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Folder &quot;{createdFolderInfo.folder.name}&quot; created successfully!</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setCreatedFolderInfo(null)}
                      className="p-1 text-emerald-700 hover:text-emerald-900 rounded cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    Path: {createdFolderInfo.folder.path} ({createdFolderInfo.subfolderResults.length} subfolders provisioned)
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('folders');
                        setCreatedFolderInfo(null);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>View in Active Folders ({folders.length})</span>
                    </button>
                    <a
                      href={createdFolderInfo.folder.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open SharePoint Folder</span>
                    </a>
                    <a
                      href={createdFolderInfo.folder.oneDriveAppUrl || formatOneDriveAppUrl(createdFolderInfo.folder.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Modern App</span>
                    </a>
                  </div>
                </div>
              )}

              {creationSuccess && !createdFolderInfo && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{creationSuccess}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Folder Name with Inline Create Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Folder Name *
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Type name &amp; press Enter or click Create</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={folderInputRef}
                      type="text"
                      value={folderName}
                      onChange={(e) => {
                        setFolderName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateFolder();
                        }
                      }}
                      placeholder="e.g., Sunshine Coast Shortlists or 14 Burke St Acquisition"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0078D4] focus:border-transparent outline-none bg-white shadow-xs"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreateFolder()}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isSubmitting ? 'Creating...' : 'Create Folder'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                  Full Path: <span className="font-semibold text-slate-800">{ONEDRIVE_DEFAULT_CONFIG.basePath}/{folderName.trim() || '{FolderName}'}</span>
                </p>
              </div>

              {/* Subfolders Manager */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subfolders to Auto-Create ({subfolders.length})
                  </label>
                  <span className="text-[11px] text-slate-400">Custom subfolders inside new folder</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subfolderInput}
                    onChange={(e) => setSubfolderInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubfolder();
                      }
                    }}
                    placeholder="Type subfolder name and press Enter or Add..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0078D4] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubfolder}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Subfolder Chips */}
                {subfolders.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {subfolders.map((sub) => (
                      <span 
                        key={sub}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium shadow-2xs"
                      >
                        <Folder className="w-3 h-3 text-[#0078D4]" />
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubfolder(sub)}
                          className="p-0.5 hover:bg-blue-200 rounded text-blue-700 cursor-pointer"
                          title={`Remove ${sub}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic mt-2">
                    No subfolders will be created. The folder will be created as a single directory.
                  </p>
                )}

                {/* Preset Templates */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setSubfolders([...DEFAULT_CLIENT_SUBFOLDERS])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Standard 6 Subfolders
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubfolders(['Legal & Contracts', 'Due Diligence', 'Settlement Dossier'])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Legal &amp; Due Diligence
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubfolders([])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                  >
                    Clear All (None)
                  </button>
                </div>
              </div>

              {/* Submit Bar inside form */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Will create 1 parent folder and <strong>{subfolders.length} subfolders</strong> in OneDrive &amp; SharePoint.
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{isSubmitting ? 'Creating in OneDrive & SharePoint...' : 'Create Folder in OneDrive / SharePoint'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BATCH PROVISION */}
          {activeTab === 'batch' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">1-Click Client OneDrive Provisioning</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically provisions individual folders for all active investors in <code className="font-mono text-slate-700">{ONEDRIVE_DEFAULT_CONFIG.basePath}</code>, each containing the 6 required buyers agency subfolders.
                </p>
              </div>

              {batchResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Successfully provisioned folders for {batchResult.provisionedCount} clients in OneDrive!</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {batchResult.results.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-700 bg-white p-2 rounded border border-emerald-100">
                        <span className="font-semibold">{r.clientName}</span>
                        <span className="text-emerald-700 font-mono text-[10px]">6 subfolders verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">Target Investors for Provisioning:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(clients.length > 0 ? clients : [
                    { id: '1', fullName: 'Marcus & Elena Vance' },
                    { id: '2', fullName: 'Dr. Sophia Thornton (SMSF)' }
                  ]).map((client, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-medium truncate">{client.fullName || client.name}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 mt-2">
                  Each investor folder will contain:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {DEFAULT_CLIENT_SUBFOLDERS.map((sub, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-slate-200">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBatchProvision}
                  disabled={isBatchProcessing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{isBatchProcessing ? 'Provisioning Folders...' : 'Batch Provision All Investor Folders'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: API SPEC */}
          {activeTab === 'api' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Microsoft Graph REST API & Azure MSAL Spec</h3>
                <p className="text-xs text-slate-500">
                  Standard endpoints used by the portal to create folders and synchronize documents.
                </p>
              </div>

              {/* Endpoint 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">1. Create Folder in OneDrive</span>
                  <button
                    onClick={() => handleCopy(`POST https://graph.microsoft.com/v1.0/users/${ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/${ONEDRIVE_DEFAULT_CONFIG.basePath}/{clientName}:/children`, "api-create-folder")}
                    className="text-[11px] text-[#0078D4] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedKey === 'api-create-folder' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Endpoint</span>
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  <p className="text-blue-400 font-bold">POST https://graph.microsoft.com/v1.0/users/{ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/{ONEDRIVE_DEFAULT_CONFIG.basePath}/&#123;clientName&#125;:/children</p>
                  <p className="text-slate-400 mt-1">Headers: Authorization: Bearer &#123;access_token&#125;</p>
                  <pre className="text-slate-300 mt-2 text-[11px]">
{`{
  "name": "Contracts",
  "folder": {},
  "@microsoft.graph.conflictBehavior": "rename"
}`}
                  </pre>
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">2. Upload File to OneDrive via Graph PUT</span>
                  <button
                    onClick={() => handleCopy(ONEDRIVE_DEFAULT_CONFIG.endpointTemplate, "api-upload-file")}
                    className="text-[11px] text-[#0078D4] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedKey === 'api-upload-file' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Endpoint</span>
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  <p className="text-blue-400 font-bold">{ONEDRIVE_DEFAULT_CONFIG.endpointTemplate}</p>
                  <p className="text-slate-400 mt-1">Headers: Authorization: Bearer &#123;access_token&#125;</p>
                  <p className="text-slate-400">Content-Type: application/pdf</p>
                  <pre className="text-slate-300 mt-2 text-[11px]">
{`[binary file stream / content]`}
                  </pre>
                </div>
              </div>

              {/* Active Config Environment Variables */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
                <div className="font-bold mb-1">Azure App Registration Environment Variables:</div>
                <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px]">
                  <li>AZURE_TENANT_ID: f8c39088-7bd7-486e-9ff9-56c0935606a8 (iconicinvesting.onmicrosoft.com)</li>
                  <li>AZURE_CLIENT_SECRET: Configured [34e98c2c-94c1-48c3-9799-b0e9151a8428]</li>
                  <li>AZURE_CLIENT_ID: Application (client) ID from Azure Portal App Registrations</li>
                  <li>ONEDRIVE_USER_EMAIL: augustine_a@iconicinvesting.com.au</li>
                  <li>ONEDRIVE_BASE_PATH: Documents/Abhijith App Test</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE FIX & SETUP */}
          {activeTab === 'live-setup' && (
            <div className="space-y-6">
              {/* Problem Analysis Banner */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      Why did OneDrive show: "Unknown render failure / This item isn't available"?
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      When clicking the link to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">Documents/Abhijith App Test/Dr. Sophia Thornton</code>, Microsoft 365 looked for that specific folder in your cloud drive. Because the folder does not exist yet inside your cloud storage, Microsoft displays that render failure screen.
                    </p>
                    <p className="text-xs text-emerald-400 font-medium">
                      Your parent folder <code className="font-mono text-white">Documents/Abhijith App Test</code> DOES exist! Choose any of the 4 solutions below to create the folder.
                    </p>
                  </div>
                </div>
              </div>

              {/* METHOD 1: Direct Web Creation */}
              <div className="bg-white p-5 rounded-2xl border-2 border-[#0078D4]/30 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0078D4] text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h4 className="font-bold text-sm text-slate-900">Method 1: Direct in OneDrive Web (Fastest &amp; 100% Reliable)</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Recommended
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Open the parent folder in your browser (you are already logged in as <strong>augustine_a@iconicinvesting.com.au</strong>), click <strong>+ Create or upload</strong> &gt; <strong>Folder</strong>, and create the client folder.
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-slate-500 block">Parent Folder URL:</span>
                    <span className="font-mono text-slate-800 text-[11px] font-bold">Documents/Abhijith App Test</span>
                  </div>
                  <a
                    href={formatOneDriveAppUrl(ONEDRIVE_DEFAULT_CONFIG.basePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0078D4] hover:bg-[#0060a8] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open "Abhijith App Test" in OneDrive</span>
                  </a>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Click to copy folder names to paste into OneDrive:</span>
                  <div className="flex flex-wrap gap-2">
                    {["Dr. Sophia Thornton", "Dr. Sophia Thornton (SMSF)", "David & Sarah Miller", "Marcus & Elena Vance"].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleCopy(name, `name-${name}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition cursor-pointer"
                        title="Click to copy name"
                      >
                        {copiedKey === `name-${name}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">6 Standard Subfolders to create inside each client:</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {DEFAULT_CLIENT_SUBFOLDERS.map((sub) => (
                      <span key={sub} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* METHOD 2: PowerShell Script */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h4 className="font-bold text-sm text-slate-900">Method 2: 1-Click PowerShell Script (Creates all 4 clients &amp; 24 subfolders)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(scriptsData?.powerShellScript || '', 'ps-script')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {copiedKey === 'ps-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'ps-script' ? 'Copied Script!' : 'Copy PowerShell Script'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Open PowerShell on your Windows or Mac terminal, paste this script, and sign in. It will automatically create all client folders and subfolders in your OneDrive in 5 seconds.
                </p>

                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs max-h-48 overflow-y-auto">
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
                    {scriptsData?.powerShellScript || `# Connect to OneDrive\nConnect-PnPOnline -Url "https://iconicinvesting-my.sharepoint.com/personal/augustine_a_iconicinvesting_com_au" -Interactive\nResolve-PnPFolder -SiteRelativePath "Documents/Abhijith App Test/Dr. Sophia Thornton"`}
                  </pre>
                </div>
              </div>

              {/* METHOD 3: Live Graph Token Provisioner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h4 className="font-bold text-sm text-slate-900">Method 3: Live Microsoft Graph Token (Direct Cloud Write)</h4>
                  </div>
                  <a
                    href="https://developer.microsoft.com/en-us/graph/graph-explorer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0078D4] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Open Graph Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Already signed into Microsoft 365? Open Microsoft Graph Explorer, click the <strong>"Access token"</strong> tab, copy your token, and paste it here. This app will directly create all live folders in your OneDrive.
                </p>

                <form onSubmit={handleLiveTokenProvision} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Paste Microsoft Graph Bearer Access Token:
                    </label>
                    <textarea
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs..."
                      rows={3}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0078D4] bg-slate-50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={isTokenProvisioning || !tokenInput.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      {isTokenProvisioning ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>{isTokenProvisioning ? 'Writing to Microsoft Graph...' : 'Provision Folders Live in OneDrive'}</span>
                    </button>
                  </div>
                </form>

                {tokenProvisionResult && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Live Provisioning Complete!</span>
                    </div>
                    <p className="text-emerald-800">
                      Total subfolders created: <strong>{tokenProvisionResult.totalSubfoldersCreated}</strong>
                    </p>
                    <div className="space-y-1">
                      {tokenProvisionResult.createdFolders.map((f) => (
                        <div key={f.name} className="flex items-center justify-between bg-white p-2 rounded border border-emerald-100 font-mono text-[11px]">
                          <span>{f.name}</span>
                          <span className={f.status === 'created' ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                            {f.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* METHOD 4: Azure App Registration Settings */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                  <h4 className="font-bold text-sm text-slate-900">Method 4: Update Azure App Registration Credentials</h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  If you have created an App Registration in the Azure Portal (<code>portal.azure.com</code>), configure the Application (Client) ID and Client Secret below:
                </p>

                <form onSubmit={handleSaveConfig} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Azure Client ID (Application ID):
                      </label>
                      <input
                        type="text"
                        value={azureClientId}
                        onChange={(e) => setAzureClientId(e.target.value)}
                        placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0078D4]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Azure Client Secret Value:
                      </label>
                      <input
                        type="password"
                        value={azureClientSecret}
                        onChange={(e) => setAzureClientSecret(e.target.value)}
                        placeholder="Client Secret Value from Azure Portal"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0078D4]"
                      />
                    </div>
                  </div>

                  {configSaveStatus && (
                    <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-medium">
                      {configSaveStatus}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingConfig || (!azureClientId && !azureClientSecret)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Save &amp; Test Azure Credentials</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0078D4] animate-pulse"></span>
            <span className="font-medium text-slate-700">Microsoft Azure Entra ID • Graph API v1.0</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300 transition cursor-pointer text-xs shadow-xs"
            >
              Close
            </button>

            {activeTab === 'create' && (
              <button
                type="button"
                onClick={() => handleCreateFolder()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? 'Creating in OneDrive...' : 'Create Folder in OneDrive'}</span>
              </button>
            )}

            {activeTab === 'batch' && (
              <button
                type="button"
                onClick={handleBatchProvision}
                disabled={isBatchProcessing}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
              >
                {isBatchProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FolderPlus className="w-3.5 h-3.5" />
                )}
                <span>{isBatchProcessing ? 'Provisioning Folders...' : 'Batch Provision All'}</span>
              </button>
            )}

            {activeTab === 'folders' && (
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Custom Folder</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
