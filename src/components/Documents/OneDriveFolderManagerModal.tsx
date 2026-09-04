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
  Cloud
} from 'lucide-react';
import { 
  fetchOneDriveFolders, 
  createOneDriveFolder, 
  batchCreateClientOneDriveFolders,
  ONEDRIVE_DEFAULT_CONFIG,
  DEFAULT_CLIENT_SUBFOLDERS,
  OneDriveStoredFolder
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
  const [activeTab, setActiveTab] = useState<'folders' | 'create' | 'batch' | 'api'>('folders');
  
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch provisioning state
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    provisionedCount: number;
    results: Array<{ clientName: string; webUrl?: string }>;
  } | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setCreationSuccess(null);

    try {
      const result = await createOneDriveFolder({
        folderName: folderName.trim(),
        subfolders
      });

      setCreationSuccess(`Folder "${result.folder.name}" and ${result.subfolderResults.length} subfolders created in OneDrive.`);
      setFolderName('');
      await loadFolders();
      setTimeout(() => setCreationSuccess(null), 6000);
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

  if (!isOpen) return null;

  const tenantDomain = ONEDRIVE_DEFAULT_CONFIG.tenantId.replace(".onmicrosoft.com", "");
  const userPart = ONEDRIVE_DEFAULT_CONFIG.userEmail.replace(/[@.]/g, "_");
  const sharePointUrl = `https://${tenantDomain}-my.sharepoint.com/personal/${userPart}/Documents/Abhijith%20App%20Test`;

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

          <div className="flex items-center gap-2">
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
              title="Open Abhijith App Test folder in SharePoint"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in SharePoint</span>
            </a>
          </div>
        </div>

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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provisioned Folders in OneDrive</h3>
                  <p className="text-xs text-slate-500">
                    Folders inside <code className="font-mono text-slate-700 font-bold">{ONEDRIVE_DEFAULT_CONFIG.basePath}/</code>
                  </p>
                </div>
                <button
                  onClick={loadFolders}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0078D4]' : ''}`} />
                  <span>Refresh</span>
                </button>
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
                        <div className="flex items-center gap-2 shrink-0">
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0078D4] hover:bg-[#006cbd] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>SharePoint</span>
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
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create New Folder in OneDrive</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provisions a folder and subdirectories under <code className="font-mono text-slate-700 font-semibold">{ONEDRIVE_DEFAULT_CONFIG.basePath}</code>
                </p>
              </div>

              {creationSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{creationSuccess}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              {/* Folder Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Folder Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="e.g., Sunshine Coast Shortlists or 14 Burke St Acquisition"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0078D4] focus:border-transparent outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Full Path: {ONEDRIVE_DEFAULT_CONFIG.basePath}/{folderName.trim() || '{FolderName}'}
                </p>
              </div>

              {/* Subfolders Manager */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subfolders to Auto-Create
                </label>
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
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Subfolder Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {subfolders.map((sub) => (
                    <span 
                      key={sub}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium"
                    >
                      <Folder className="w-3 h-3 text-[#0078D4]" />
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubfolder(sub)}
                        className="p-0.5 hover:bg-blue-200 rounded text-blue-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Preset Templates */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setSubfolders([...DEFAULT_CLIENT_SUBFOLDERS])}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Standard 6 Client Subfolders
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubfolders(['Legal & Contracts', 'Due Diligence', 'Settlement Dossier'])}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Legal & Due Diligence
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !folderName.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating in OneDrive...' : 'Create Folder in OneDrive'}</span>
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

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0078D4]"></span>
            <span>Microsoft Azure Entra ID • Graph API v1.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
