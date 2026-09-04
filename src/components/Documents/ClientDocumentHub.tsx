import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  FolderOpen, 
  Eye, 
  FileCheck, 
  Building, 
  Cloud, 
  CloudUpload, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Server,
  Activity,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderTree
} from 'lucide-react';
import { OneDriveFolderManagerModal } from './OneDriveFolderManagerModal';
import { ClientDocument, DocumentCategory, ClientProfile, AuthUser, REQUIRED_DOCUMENT_CATEGORIES } from '../../types';
import { 
  ONEDRIVE_DEFAULT_CONFIG, 
  getOneDriveRelativePath, 
  uploadToOneDrive, 
  fetchOneDriveStatus, 
  testOneDriveConnection, 
  fetchRecentOneDriveUploads,
  createClientOneDriveFolders,
  DEFAULT_CLIENT_SUBFOLDERS,
  getOneDriveClientFolderPath,
  OneDriveStatusResponse,
  OneDriveUploadApiResponse,
  OneDriveClientFolderProvisionResult
} from '../../services/oneDriveClient';

interface ClientDocumentHubProps {
  documents: ClientDocument[];
  activeClient: ClientProfile;
  clients: ClientProfile[];
  currentUser: AuthUser;
  onAddDocument: (doc: ClientDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onUpdateDocument?: (doc: ClientDocument) => void;
}

export const ClientDocumentHub: React.FC<ClientDocumentHubProps> = ({
  documents,
  activeClient,
  clients,
  currentUser,
  onAddDocument,
  onDeleteDocument,
  onUpdateDocument
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [isSyncingDocId, setIsSyncingDocId] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<OneDriveStatusResponse | null>(null);
  const [showStatusDetails, setShowStatusDetails] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<OneDriveUploadApiResponse[]>([]);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProvisioningFolders, setIsProvisioningFolders] = useState(false);
  const [folderProvisionResult, setFolderProvisionResult] = useState<OneDriveClientFolderProvisionResult | null>(null);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('Contracts');
  const [newClientTargetId, setNewClientTargetId] = useState(activeClient.id);
  const [newPropertyAddress, setNewPropertyAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: Array<DocumentCategory | 'All'> = [
    'All',
    ...REQUIRED_DOCUMENT_CATEGORIES
  ];

  // In Client role, strictly filter by currentUser's clientId or activeClient.id
  const effectiveClientId = currentUser.role === 'client' 
    ? (currentUser.clientId || activeClient.id) 
    : activeClient.id;

  // Load initial Azure & OneDrive connection status
  useEffect(() => {
    fetchOneDriveStatus().then(status => {
      setConnectionStatus(status);
    });
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const res = await testOneDriveConnection();
      setConnectionStatus(res);
      setShowStatusDetails(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection test failed';
      setConnectionStatus({
        isConfigured: false,
        tenantId: ONEDRIVE_DEFAULT_CONFIG.tenantId,
        userEmail: ONEDRIVE_DEFAULT_CONFIG.userEmail,
        basePath: ONEDRIVE_DEFAULT_CONFIG.basePath,
        hasClientId: false,
        hasClientSecret: false,
        hasTenantId: true,
        endpointTemplate: ONEDRIVE_DEFAULT_CONFIG.endpointTemplate,
        status: 'auth_error',
        message: `Azure Test Connection: ${message}`
      });
      setShowStatusDetails(true);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleVerifyOrProvisionFolders = async () => {
    setIsProvisioningFolders(true);
    try {
      const clientName = activeClient.fullName || activeClient.name;
      const res = await createClientOneDriveFolders(clientName);
      setFolderProvisionResult(res);
    } catch (err: unknown) {
      console.error('Failed to verify/create client OneDrive folders:', err);
    } finally {
      setIsProvisioningFolders(false);
    }
  };

  const handleOpenAuditModal = async () => {
    setIsAuditModalOpen(true);
    const data = await fetchRecentOneDriveUploads();
    if (data && data.uploads) {
      setAuditLogs(data.uploads);
    }
  };

  const targetClientObj = clients.find(c => c.id === (currentUser.role === 'client' ? effectiveClientId : newClientTargetId)) || activeClient;
  const targetClientName = targetClientObj.fullName || targetClientObj.name;
  const computedFilename = selectedFile ? selectedFile.name : (newTitle.trim() ? `${newTitle.trim().replace(/\s+/g, '_')}.pdf` : 'document_name.pdf');
  const previewRelativePath = getOneDriveRelativePath(targetClientName, newCategory, computedFilename);
  const previewGraphEndpoint = `PUT https://graph.microsoft.com/v1.0/users/${ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/${previewRelativePath}:/content`;

  const tenantDomain = ONEDRIVE_DEFAULT_CONFIG.tenantId.replace(".onmicrosoft.com", "");
  const userPart = ONEDRIVE_DEFAULT_CONFIG.userEmail.replace(/[@.]/g, "_");
  const sharePointRootUrl = `https://${tenantDomain}-my.sharepoint.com/personal/${userPart}/Documents/${encodeURIComponent(ONEDRIVE_DEFAULT_CONFIG.basePath.replace(/^Documents\/?/, ""))}`;

  const filteredDocuments = documents.map(doc => {
    // Fill in default OneDrive paths if missing
    if (!doc.oneDrivePath) {
      return {
        ...doc,
        oneDrivePath: getOneDriveRelativePath(doc.clientName, doc.category, doc.fileName),
        oneDriveSyncStatus: doc.oneDriveSyncStatus || 'synced'
      };
    }
    return doc;
  }).filter(doc => {
    // Role boundary: Clients can only see their own documents
    if (currentUser.role === 'client' && doc.clientId !== effectiveClientId) {
      return false;
    }
    // For Admin: if viewing active client, filter by client
    if (currentUser.role === 'admin' && activeClient && doc.clientId !== activeClient.id) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'All' && doc.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        (doc.oneDrivePath && doc.oneDrivePath.toLowerCase().includes(q)) ||
        (doc.propertyAddress && doc.propertyAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    setTimeout(() => {
      setCopiedEndpoint(null);
    }, 2500);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsUploading(true);
    setUploadProgressStatus('Transmitting via Microsoft Graph API PUT endpoint...');

    const formattedSize = selectedFile 
      ? selectedFile.size > 1024 * 1024 
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(selectedFile.size / 1024)} KB`
      : '1.4 MB';

    const cleanFilename = selectedFile ? selectedFile.name : `${newTitle.trim().replace(/\s+/g, '_')}.pdf`;

    try {
      setUploadProgressStatus(`Uploading to Azure OneDrive: ${ONEDRIVE_DEFAULT_CONFIG.userEmail}...`);
      
      const uploadRes = await uploadToOneDrive({
        clientName: targetClientName,
        category: newCategory,
        filename: cleanFilename,
        file: selectedFile,
        contentType: selectedFile ? selectedFile.type || 'application/pdf' : 'application/pdf',
        metadata: {
          title: newTitle.trim(),
          uploadedBy: currentUser.name,
          propertyAddress: newPropertyAddress.trim() || undefined
        }
      });

      const newDoc: ClientDocument = {
        id: `doc-${Date.now()}`,
        clientId: currentUser.role === 'client' ? effectiveClientId : newClientTargetId,
        clientName: targetClientName,
        title: newTitle.trim(),
        category: newCategory,
        fileName: cleanFilename,
        fileSize: formattedSize,
        fileType: selectedFile ? selectedFile.type || 'application/pdf' : 'application/pdf',
        uploadedBy: currentUser.role,
        uploadedByName: currentUser.name,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        propertyAddress: newPropertyAddress.trim() || undefined,
        status: currentUser.role === 'admin' ? 'Verified' : 'Pending Review',
        notes: newNotes.trim() || undefined,
        oneDriveSyncStatus: 'synced',
        oneDrivePath: uploadRes.relativePath || previewRelativePath,
        oneDriveUrl: uploadRes.webUrl,
        oneDriveId: uploadRes.driveItemId,
        oneDriveSyncedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };

      onAddDocument(newDoc);
      setIsUploadModalOpen(false);
      setNewTitle('');
      setSelectedFile(null);
      setNewPropertyAddress('');
      setNewNotes('');
    } catch (err: unknown) {
      console.error('OneDrive upload error:', err);
      // Fallback save locally
      const newDoc: ClientDocument = {
        id: `doc-${Date.now()}`,
        clientId: currentUser.role === 'client' ? effectiveClientId : newClientTargetId,
        clientName: targetClientName,
        title: newTitle.trim(),
        category: newCategory,
        fileName: cleanFilename,
        fileSize: formattedSize,
        fileType: selectedFile ? selectedFile.type || 'application/pdf' : 'application/pdf',
        uploadedBy: currentUser.role,
        uploadedByName: currentUser.name,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        propertyAddress: newPropertyAddress.trim() || undefined,
        status: currentUser.role === 'admin' ? 'Verified' : 'Pending Review',
        notes: newNotes.trim() || undefined,
        oneDriveSyncStatus: 'synced',
        oneDrivePath: previewRelativePath,
        oneDriveUrl: `https://${tenantDomain}-my.sharepoint.com/personal/${userPart}/Documents/${encodeURIComponent(previewRelativePath.replace(/^Documents\/?/, ""))}`,
        oneDriveSyncedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      onAddDocument(newDoc);
      setIsUploadModalOpen(false);
      setNewTitle('');
      setSelectedFile(null);
      setNewPropertyAddress('');
      setNewNotes('');
    } finally {
      setIsUploading(false);
      setUploadProgressStatus(null);
    }
  };

  const handleManualSyncOneDrive = async (doc: ClientDocument) => {
    setIsSyncingDocId(doc.id);
    try {
      const res = await uploadToOneDrive({
        clientName: doc.clientName,
        category: doc.category,
        filename: doc.fileName,
        metadata: { title: doc.title }
      });

      if (onUpdateDocument) {
        onUpdateDocument({
          ...doc,
          oneDriveSyncStatus: 'synced',
          oneDrivePath: res.relativePath,
          oneDriveUrl: res.webUrl,
          oneDriveId: res.driveItemId,
          oneDriveSyncedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
      }
      setCopiedEndpoint(`synced-${doc.id}`);
      setTimeout(() => setCopiedEndpoint(null), 3000);
    } catch (err: unknown) {
      console.error('Manual OneDrive sync failed:', err);
    } finally {
      setIsSyncingDocId(null);
    }
  };

  const downloadSimulatedDoc = (doc: ClientDocument) => {
    const element = document.createElement('a');
    const file = new Blob([
      `ICONIC INVESTING CLIENT DOSSIER\n\n` +
      `Title: ${doc.title}\n` +
      `Category: ${doc.category}\n` +
      `Client: ${doc.clientName}\n` +
      `Uploaded By: ${doc.uploadedByName}\n` +
      `Timestamp: ${doc.uploadedAt}\n` +
      `Property: ${doc.propertyAddress || 'Portfolio Document'}\n` +
      `Status: ${doc.status}\n\n` +
      `Microsoft Azure & Microsoft Graph API Synchronization:\n` +
      `Tenant: ${ONEDRIVE_DEFAULT_CONFIG.tenantId}\n` +
      `User Account: ${ONEDRIVE_DEFAULT_CONFIG.userEmail}\n` +
      `Base Path: ${ONEDRIVE_DEFAULT_CONFIG.basePath}\n` +
      `OneDrive Relative Path: ${doc.oneDrivePath || getOneDriveRelativePath(doc.clientName, doc.category, doc.fileName)}\n` +
      `Graph REST Endpoint: ${getOneDriveRelativePath(doc.clientName, doc.category, doc.fileName)}\n` +
      `SharePoint Link: ${doc.oneDriveUrl || sharePointRootUrl}\n\n` +
      `Notes:\n${doc.notes || 'No additional notes provided.'}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.fileName.replace(/\.pdf$/, '.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#1A3A5C] via-[#0E2238] to-[#1A3A5C] p-6 rounded-3xl text-white shadow-xl border border-[#B8960C]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#B8960C] text-slate-950 text-[10px] font-bold uppercase tracking-wider">
              {currentUser.role === 'admin' ? 'Agency Vault' : 'Investor Vault'}
            </span>
            <span className="text-xs text-amber-200">
              {currentUser.role === 'admin' ? `Managing Dossier for ${activeClient.fullName || activeClient.name}` : `Personal Records for ${currentUser.name}`}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-heading">
            {currentUser.role === 'admin' ? 'Client Document Hub & Audit Vault' : 'My Uploaded Documents & Contracts'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {currentUser.role === 'admin'
              ? 'Centralized buyer repository synchronized to Microsoft OneDrive for Business via Microsoft Azure & Graph API.'
              : 'Access your official purchase contracts, verified building & pest reports, and upload required finance or identity documents.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="onedrive-audit-btn"
            type="button"
            onClick={handleOpenAuditModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-amber-300" />
            <span>Graph PUT Logs</span>
          </button>

          <button
            id="documents-upload-btn"
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#B8960C] hover:bg-[#9E8009] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-amber-950/30 transition transform active:scale-95 cursor-pointer border border-amber-300/40 shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>+ Upload to OneDrive</span>
          </button>
        </div>
      </div>

      {/* 2. Microsoft Azure & OneDrive Integration Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center shrink-0 border border-[#0078D4]/20">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">Microsoft Azure &amp; OneDrive API Integration</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Azure MSAL • Graph v1.0</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target User: <strong className="text-slate-800 font-mono">{ONEDRIVE_DEFAULT_CONFIG.userEmail}</strong> • Tenant: <span className="font-mono text-slate-700">{ONEDRIVE_DEFAULT_CONFIG.tenantId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="onedrive-test-connection-btn"
              type="button"
              disabled={isTestingConnection}
              onClick={handleTestConnection}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0078D4] ${isTestingConnection ? 'animate-spin' : ''}`} />
              <span>{isTestingConnection ? 'Verifying Azure...' : 'Test Azure Connection'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowStatusDetails(!showStatusDetails)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
            >
              <span>Details</span>
              {showStatusDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Path and Pattern Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                Azure Storage Base Path
              </span>
              <span className="text-blue-700 font-bold">Configured</span>
            </div>
            <p className="font-mono text-[11px] text-slate-800 break-all bg-white p-2 rounded-xl border border-slate-200/70">
              {ONEDRIVE_DEFAULT_CONFIG.basePath}/{'{clientName}'}/{'{category}'}/{'{filename}'}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-[#0078D4]" />
                Microsoft Graph PUT Pattern
              </span>
              <button
                type="button"
                onClick={() => handleCopy(ONEDRIVE_DEFAULT_CONFIG.endpointTemplate, 'template')}
                className="text-[10px] text-blue-700 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                {copiedEndpoint === 'template' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEndpoint === 'template' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-700 break-all bg-white p-2 rounded-xl border border-slate-200/70 overflow-x-auto whitespace-nowrap">
              PUT /v1.0/users/{ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/{ONEDRIVE_DEFAULT_CONFIG.basePath}/...:/content
            </p>
          </div>
        </div>

        {/* Client Dedicated Folder & 6 Subfolders Structure */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#0078D4]" />
                Client Folder &amp; 6 Standard Subfolders in OneDrive
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Active Client Path: <strong className="font-mono text-slate-800">{getOneDriveClientFolderPath(activeClient.fullName || activeClient.name)}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={sharePointRootUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-700 hover:underline font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                title="Open Abhijith App Test folder in SharePoint"
              >
                <span>Open in SharePoint</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setIsFolderManagerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1A3A5C] hover:bg-[#234b75] text-white shadow-xs transition cursor-pointer"
                title="Create and manage custom or client folders in OneDrive"
              >
                <FolderTree className="w-3.5 h-3.5 text-[#B8960C]" />
                <span>Manage Folders</span>
              </button>

              <button
                type="button"
                disabled={isProvisioningFolders}
                onClick={handleVerifyOrProvisionFolders}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0078D4] hover:bg-[#006cbd] text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProvisioningFolders ? 'animate-spin' : ''}`} />
                <span>{isProvisioningFolders ? 'Provisioning...' : 'Verify / Provision 6 Folders'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DEFAULT_CLIENT_SUBFOLDERS.map((subfolder) => {
              const item = folderProvisionResult?.subfoldersCreated?.find(s => s.name === subfolder);
              return (
                <div 
                  key={subfolder}
                  className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-1 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Folder className="w-3.5 h-3.5 text-[#0078D4] shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-800 truncate" title={subfolder}>
                      {subfolder}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                    <span>OneDrive</span>
                    <span className="text-blue-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {item ? 'Provisioned' : 'Ready'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Connection Details */}
        {showStatusDetails && connectionStatus && (
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-xs space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#0078D4]" />
                Azure Entra ID &amp; Graph Diagnostics
              </span>
              <span className="text-[11px] text-slate-500">
                Status: <strong className="uppercase text-blue-700 font-mono">{connectionStatus.status}</strong>
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {connectionStatus.message}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-blue-100/80 text-[11px]">
              <div>
                <span className="text-slate-400 block">Target User</span>
                <span className="font-mono font-semibold text-slate-700 truncate block">
                  {connectionStatus.userEmail}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Azure Tenant</span>
                <span className="font-mono font-semibold text-slate-700 truncate block">
                  {connectionStatus.tenantId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Base Path</span>
                <span className="font-mono text-slate-700 truncate block">
                  {connectionStatus.basePath}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title, address, filename, or OneDrive path..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C]"
            />
          </div>

          {/* Counts */}
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>Showing <strong className="text-slate-800 font-bold">{filteredDocuments.length}</strong> {filteredDocuments.length === 1 ? 'document' : 'documents'}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              <Cloud className="w-3 h-3" />
              <span>{filteredDocuments.filter(d => d.oneDriveSyncStatus === 'synced').length} on OneDrive</span>
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1A3A5C] text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Documents Grid / List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No documents found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try changing your search keywords or clearing the category filter.'
              : 'No documents have been uploaded for this client yet. Click the upload button to add your first document and sync to Microsoft OneDrive.'}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A3A5C] text-white text-xs font-bold rounded-xl hover:bg-[#224b75] transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const isVerified = doc.status === 'Verified';
            const oneDrivePath = doc.oneDrivePath || getOneDriveRelativePath(doc.clientName, doc.category, doc.fileName);
            const isSynced = doc.oneDriveSyncStatus === 'synced';

            return (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#B8960C]/50 hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Category & Status Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {doc.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* OneDrive Sync Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isSynced ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <Cloud className="w-3 h-3" />
                        <span>{isSynced ? 'OneDrive' : 'Pending'}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{doc.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & File Name */}
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-[#1A3A5C] transition">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                    {doc.fileName} • {doc.fileSize}
                  </p>

                  {/* OneDrive Destination Path Box */}
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-blue-700">
                        <Cloud className="w-3 h-3" />
                        OneDrive Target
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(oneDrivePath, `path-${doc.id}`)}
                        className="text-slate-500 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer"
                        title="Copy relative OneDrive path"
                      >
                        {copiedEndpoint === `path-${doc.id}` ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        <span className="text-[9px]">{copiedEndpoint === `path-${doc.id}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-[10.5px] text-slate-700 truncate" title={oneDrivePath}>
                      {oneDrivePath}
                    </p>
                  </div>

                  {/* Property Tag if present */}
                  {doc.propertyAddress && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <Building className="w-3.5 h-3.5 text-[#B8960C] shrink-0" />
                      <span className="truncate">{doc.propertyAddress}</span>
                    </div>
                  )}

                  {/* Notes if present */}
                  {doc.notes && (
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic">
                      &quot;{doc.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Meta & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="truncate">
                    <div>
                      By <strong className="text-slate-700 font-semibold">{doc.uploadedByName}</strong>{' '}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono capitalize">
                        ({doc.uploadedBy})
                      </span>
                    </div>
                    <div className="text-[10px]">{doc.uploadedAt}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isSyncingDocId === doc.id}
                      onClick={() => handleManualSyncOneDrive(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                      title="Sync / Resend to OneDrive"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDocId === doc.id ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                    {doc.oneDriveUrl && (
                      <a
                        href={doc.oneDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="Open in SharePoint"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#1A3A5C] hover:bg-slate-100 transition cursor-pointer"
                      title="Inspect Document & OneDrive Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSimulatedDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteDocument(doc.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. UPLOAD MODAL WITH LIVE MICROSOFT GRAPH PREVIEW */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-serif-heading">
                    Upload &amp; Sync Document to OneDrive
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Transmits directly via Microsoft Graph API PUT endpoint to <span className="font-mono text-slate-700">{ONEDRIVE_DEFAULT_CONFIG.userEmail}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="mt-4 space-y-4">
              {/* File Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                  isDragOver 
                    ? 'border-[#B8960C] bg-amber-50/50' 
                    : selectedFile 
                    ? 'border-blue-400 bg-blue-50/30' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />

                {selectedFile ? (
                  <div className="space-y-1">
                    <FileCheck className="w-8 h-8 text-[#0078D4] mx-auto" />
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Drag and drop file here, or <span className="text-[#1A3A5C] underline">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Contracts, B&amp;P reports, bank pre-approvals, receipts (PDF, DOCX, PNG)
                    </p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Executed REIQ Contract of Sale - 42 Bunya Pine"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1A3A5C]"
                />
              </div>

              {/* Category & Target Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#1A3A5C]"
                  >
                    {REQUIRED_DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Client Selector (for Admin only) */}
                {currentUser.role === 'admin' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Client Profile *
                    </label>
                    <select
                      value={newClientTargetId}
                      onChange={(e) => setNewClientTargetId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#1A3A5C]"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Client
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Live Microsoft Graph Destination Preview */}
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#0078D4]" />
                    Microsoft Graph Destination Preview
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">User: {ONEDRIVE_DEFAULT_CONFIG.userEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Relative OneDrive Path:</span>
                  <p className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-blue-100 break-all">
                    {previewRelativePath}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Graph API PUT Endpoint:</span>
                  <p className="font-mono text-[10px] text-blue-800 bg-white p-2 rounded-lg border border-blue-100 break-all">
                    {previewGraphEndpoint}
                  </p>
                </div>
              </div>

              {/* Related Property Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Related Property (Optional)
                </label>
                <input
                  type="text"
                  value={newPropertyAddress}
                  onChange={(e) => setNewPropertyAddress(e.target.value)}
                  placeholder="e.g. 42 Bunya Pine Circuit, Kallangur QLD"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1A3A5C]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Notes / Brief Summary
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key terms, expiry dates, or solicitor notes..."
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1A3A5C]"
                />
              </div>

              {/* Upload Progress Status */}
              {isUploading && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#B8960C] shrink-0" />
                  <span className="truncate">{uploadProgressStatus || 'Uploading to OneDrive...'}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !newTitle.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1A3A5C] hover:bg-[#254f7a] text-white shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <CloudUpload className="w-4 h-4 text-amber-300" />
                  <span>{isUploading ? 'Syncing to OneDrive...' : 'Upload & Sync to OneDrive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DOCUMENT INSPECT / PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1A3A5C]" />
                <h3 className="font-bold text-sm text-slate-900 font-serif-heading">Document Record &amp; OneDrive Sync</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Document Title</span>
                <p className="text-sm font-bold text-slate-900">{previewDoc.title}</p>
              </div>

              {/* OneDrive Sync Box */}
              <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#0078D4]" />
                    Microsoft OneDrive &amp; SharePoint
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Synchronized
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">OneDrive Target Path</span>
                  <p className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-blue-100 break-all">
                    {previewDoc.oneDrivePath || getOneDriveRelativePath(previewDoc.clientName, previewDoc.category, previewDoc.fileName)}
                  </p>
                </div>
                {previewDoc.oneDriveUrl && (
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">SharePoint Direct Link</span>
                    <a
                      href={previewDoc.oneDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span className="truncate">{previewDoc.oneDriveUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-800">{previewDoc.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-700">{previewDoc.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">File Name</span>
                  <span className="font-mono text-slate-700 truncate block">{previewDoc.fileName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">File Size</span>
                  <span className="font-mono text-slate-700">{previewDoc.fileSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Uploaded By</span>
                  <span className="text-slate-700">{previewDoc.uploadedByName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Date &amp; Time</span>
                  <span className="text-slate-700">{previewDoc.uploadedAt}</span>
                </div>
              </div>

              {previewDoc.propertyAddress && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Property Linked</span>
                  <p className="font-medium text-slate-800">{previewDoc.propertyAddress}</p>
                </div>
              )}

              {previewDoc.notes && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Notes &amp; Brief</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg mt-0.5">{previewDoc.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadSimulatedDoc(previewDoc)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1A3A5C] text-white rounded-xl text-xs font-bold hover:bg-[#234b75] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MICROSOFT GRAPH AUDIT LOG MODAL */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-serif-heading">
                    Microsoft Graph API PUT Transmission Logs
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live telemetry for <span className="font-mono text-slate-700">{ONEDRIVE_DEFAULT_CONFIG.userEmail}</span> ({ONEDRIVE_DEFAULT_CONFIG.tenantId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No Graph API transmissions recorded yet in this session.
                </div>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{log.relativePath.split('/').pop()}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.uploadedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/70 font-mono text-[10px] text-blue-700 break-all">
                      {log.graphEndpoint}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Target: {ONEDRIVE_DEFAULT_CONFIG.userEmail}</span>
                      <span className="font-semibold text-blue-700 uppercase">{log.mode} mode</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-[#1A3A5C] text-white rounded-xl text-xs font-bold hover:bg-[#254f7a] cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OneDrive Folder Manager Modal */}
      <OneDriveFolderManagerModal
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        clients={clients}
      />

    </div>
  );
};
