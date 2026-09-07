import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  Edit3, 
  UserX, 
  UserCheck, 
  Check, 
  Copy, 
  ExternalLink, 
  ChevronRight, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Lock, 
  DollarSign, 
  Building2, 
  FolderOpen, 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle2, 
  X, 
  Clock, 
  Briefcase, 
  ArrowUpDown,
  RefreshCw,
  RotateCcw,
  Layers,
  Sparkles,
  Award,
  Send,
  Link2,
  Cloud,
  FolderCheck,
  Folder,
  FolderTree,
  Loader2
} from 'lucide-react';
import { uploadClientDocumentToSupabase } from '../../services/supabaseStorage';
import { OneDriveFolderManagerModal } from '../Documents/OneDriveFolderManagerModal';
import { 
  DEFAULT_CLIENT_SUBFOLDERS, 
  createClientOneDriveFolders, 
  fetchClientOneDriveFolders,
  getOneDriveClientFolderPath,
  ONEDRIVE_DEFAULT_CONFIG,
  OneDriveClientFolderProvisionResult
} from '../../services/oneDriveClient';
import { 
  ClientProfile, 
  ClientDocument, 
  Property, 
  AuthUser, 
  AppSection, 
  DocumentCategory,
  InvestmentGoal,
  PropertyType,
  PreApprovalStatusType,
  ClientInvitation
} from '../../types';
import { getStoredAccounts } from '../../utils/auth';
import { UserAccount } from '../../data/mockAuth';
import { 
  getStoredInvitations, 
  createClientInvitation, 
  formatTimeRemaining, 
  resendClientInvitation 
} from '../../utils/invitations';
import { EmailInviteModal } from './EmailInviteModal';
import { SupabaseClientFilesSection } from '../Documents/SupabaseClientFilesSection';

interface AdminControlPanelProps {
  clients: ClientProfile[];
  documents: ClientDocument[];
  properties: Property[];
  currentUser: AuthUser;
  onNavigate: (section: AppSection, propertyId?: string) => void;
  onSelectClient: (client: ClientProfile) => void;
  onAddClient: (newClient: ClientProfile, tempPassword: string) => void;
  onUpdateClient: (updatedClient: ClientProfile, newPassword?: string) => void;
  onRevokeAccess: (clientId: string) => void;
  onRestoreAccess: (clientId: string) => void;
  onUploadDocument: (newDoc: ClientDocument) => void;
  onOpenInviteToken?: (token: string) => void;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  clients,
  documents,
  properties,
  currentUser,
  onNavigate,
  onSelectClient,
  onAddClient,
  onUpdateClient,
  onRevokeAccess,
  onRestoreAccess,
  onUploadDocument,
  onOpenInviteToken
}) => {
  // Non-admin guard: If user is not admin, redirect immediately to their dashboard
  useEffect(() => {
    if (currentUser.role !== 'admin') {
      onNavigate('dashboard');
    }
  }, [currentUser, onNavigate]);

  if (currentUser.role !== 'admin') {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600 mt-2">
          The Admin Control Panel is restricted to licensed Buyers Advocates and Administrators. Non-admin users cannot access this panel.
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-5 px-5 py-2.5 bg-[#1A3A5C] text-white text-xs font-bold rounded-xl hover:bg-[#0E2238] transition-colors"
        >
          Return to My Investor Dashboard
        </button>
      </div>
    );
  }

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'budget' | 'date'>('date');

  // Modals & Drawers State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isOneDriveFolderModalOpen, setIsOneDriveFolderModalOpen] = useState(false);
  const [revokeTargetClient, setRevokeTargetClient] = useState<ClientProfile | null>(null);

  // Selected client for Edit, Dossier, Upload, or OneDrive Folders
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<ClientProfile | null>(null);
  const [selectedClientForDossier, setSelectedClientForDossier] = useState<ClientProfile | null>(null);
  const [selectedClientForOneDrive, setSelectedClientForOneDrive] = useState<ClientProfile | null>(null);
  const [uploadTargetClientId, setUploadTargetClientId] = useState<string>(clients[0]?.id || '');
  const [adminSupabaseRefreshKey, setAdminSupabaseRefreshKey] = useState(0);

  // Client Invitations (48-hour secure token workflow)
  const [invitations, setInvitations] = useState<ClientInvitation[]>(() => getStoredInvitations());
  const [selectedInviteForModal, setSelectedInviteForModal] = useState<ClientInvitation | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const refreshInvitations = () => {
    setInvitations(getStoredInvitations());
  };

  const getInvitationForClient = (clientId: string, clientEmail: string): ClientInvitation | undefined => {
    return invitations.find(
      inv => inv.clientId === clientId || inv.clientEmail.toLowerCase() === clientEmail.toLowerCase()
    );
  };

  const handleOpenEmailInviteModal = (client: ClientProfile) => {
    let invite = getInvitationForClient(client.id, client.email);
    if (!invite) {
      invite = createClientInvitation({
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        invitedBy: currentUser.name,
        invitedByRole: currentUser.agencyTitle || 'Principal Buyers Advocate',
        customHours: 48
      });
      refreshInvitations();
    }
    setSelectedInviteForModal(invite);
    setIsEmailModalOpen(true);
  };

  const handleResend48hInvite = (client: ClientProfile) => {
    const fresh = resendClientInvitation(
      client.id,
      client.name,
      client.email,
      currentUser.name
    );
    refreshInvitations();
    setSelectedInviteForModal(fresh);
    setIsEmailModalOpen(true);
    showToast(
      'Fresh Invitation Dispatched',
      `48-hour activation link renewed for ${client.name} (${client.email}).`
    );
  };

  // Copy Feedback Notification
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'warn' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Sync stored accounts to know latest temporary passwords / status
  const storedAccounts = useMemo(() => {
    return getStoredAccounts();
  }, [clients]);

  const getAccountForClient = (client: ClientProfile): UserAccount | undefined => {
    return storedAccounts.find(
      a => a.clientId === client.id || a.email.toLowerCase() === client.email.toLowerCase()
    );
  };

  // KPI Calculations across all clients in the business
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.accessStatus !== 'revoked').length;
    const revokedClients = clients.filter(c => c.accessStatus === 'revoked').length;
    const totalPurchasingPower = clients.reduce((sum, c) => sum + (c.budgetMax || 0), 0);
    const totalDeposit = clients.reduce((sum, c) => sum + (c.depositAvailable || 0), 0);
    const verifiedPreApprovedCount = clients.filter(c => c.preApprovalStatus === 'Verified Pre-Approved').length;
    return {
      totalClients,
      activeClients,
      revokedClients,
      totalPurchasingPower,
      totalDeposit,
      verifiedPreApprovedCount
    };
  }, [clients]);

  // Filtered and Sorted Clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // Search term
      const query = searchTerm.toLowerCase().trim();
      const matchQuery = !query || 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        (c.targetSuburbs && c.targetSuburbs.some(s => s.toLowerCase().includes(query))) ||
        (c.primaryGoal && c.primaryGoal.toLowerCase().includes(query));

      // Status filter
      const isRevoked = c.accessStatus === 'revoked';
      const matchStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && !isRevoked) ||
        (statusFilter === 'revoked' && isRevoked);

      // Goal filter
      const matchGoal = goalFilter === 'all' || c.primaryGoal === goalFilter;

      return matchQuery && matchStatus && matchGoal;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'budget') return (b.budgetMax || 0) - (a.budgetMax || 0);
      return (b.createdDate || '').localeCompare(a.createdDate || '');
    });
  }, [clients, searchTerm, statusFilter, goalFilter, sortBy]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 max-w-md animate-slideUp">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900">{toastMessage.title}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">{toastMessage.desc}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E2238] via-[#1A3A5C] to-[#0E2238] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8960C]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8960C]/20 border border-[#B8960C]/40 text-[#D4AF37] text-xs font-bold tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Command Center
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Client Directory & Security Permissions
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Provision new investor credentials, audit active portfolios, upload confidential settlement documents, and govern agency access controls.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsOneDriveFolderModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold rounded-xl shadow-md transition-all border border-blue-400/30"
              title="Create & manage folders in Microsoft OneDrive"
            >
              <FolderTree className="w-4 h-4" />
              OneDrive Folders
            </button>
            <button
              onClick={() => {
                setUploadTargetClientId(clients[0]?.id || '');
                setIsUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              Upload Document
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B8960C] hover:bg-[#997B0A] text-white text-xs font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              + Add Client & Provision Login
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Clients</span>
            <Users className="w-4 h-4 text-[#1A3A5C]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalClients}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across agency mandates</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Logins</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{metrics.activeClients}</div>
          <div className="text-[11px] text-slate-500 mt-1">Authorized investor portals</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Revoked Access</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{metrics.revokedClients}</div>
          <div className="text-[11px] text-slate-500 mt-1">Blocked from signing in</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Combined Budget</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${(metrics.totalPurchasingPower / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total purchasing capacity</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pre-Approved</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{metrics.verifiedPreApprovedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Bank-verified funds</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Documents</span>
            <FolderOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Contracts, B&P & IDs</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, email, suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 focus:border-[#1A3A5C]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-[#1A3A5C] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({metrics.activeClients})
            </button>
            <button
              onClick={() => setStatusFilter('revoked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'revoked'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revoked ({metrics.revokedClients})
            </button>
          </div>

          {/* Goal Select */}
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20"
          >
            <option value="all">All Goals</option>
            <option value="Capital Growth">Capital Growth</option>
            <option value="High Cashflow Yield">High Yield Cashflow</option>
            <option value="Balanced (Growth + Yield)">Balanced</option>
            <option value="SMSF Super Fund">SMSF Super Fund</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20"
          >
            <option value="date">Sort: Newest First</option>
            <option value="budget">Sort: Highest Budget</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-[#1A3A5C] shadow-sm' : 'text-slate-500'
              }`}
              title="Table View"
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-white text-[#1A3A5C] shadow-sm' : 'text-slate-500'
              }`}
              title="Cards Grid"
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Clients List Display */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching clients found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or filter options to view other investor profiles.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); setGoalFilter('all'); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Client Investor</th>
                  <th className="py-3.5 px-4">Login & Password</th>
                  <th className="py-3.5 px-4">Budget & Deposit</th>
                  <th className="py-3.5 px-4">Pre-Approval</th>
                  <th className="py-3.5 px-4">Strategy Mandate</th>
                  <th className="py-3.5 px-4">Access Status</th>
                  <th className="py-3.5 px-4 text-center">Docs</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredClients.map((client) => {
                  const account = getAccountForClient(client);
                  const isRevoked = client.accessStatus === 'revoked' || account?.status === 'revoked';
                  const clientDocsCount = documents.filter(d => d.clientId === client.id).length;
                  const clientPropsCount = properties.filter(p => p.status === 'Shortlisted').length;
                  const tempPass = client.tempPassword || account?.tempPassword || account?.password || 'client123';

                  return (
                    <tr key={client.id} className={`hover:bg-slate-50/60 transition-colors ${isRevoked ? 'bg-rose-50/30' : ''}`}>
                      {/* Client Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isRevoked ? 'bg-rose-100 text-rose-700' : 'bg-[#1A3A5C]/10 text-[#1A3A5C]'
                          }`}>
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {client.name}
                              {client.smsfPurchase && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[9px] font-bold">
                                  SMSF
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{client.phone}</span>
                              <span>•</span>
                              <span>Agent: {client.assignedAgent || 'Damian Sterling'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Login Email & Temp Password */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">Pass:</span>
                            <code className="text-[11px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-bold border border-slate-200">
                              {tempPass}
                            </code>
                            <button
                              onClick={() => handleCopy(tempPass, `pass-${client.id}`)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                              title="Copy Temporary Password"
                            >
                              {copiedKey === `pass-${client.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Budget & Deposit */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Deposit: <span className="font-semibold text-slate-700">{formatCurrency(client.depositAvailable)}</span>
                        </div>
                      </td>

                      {/* Pre-Approval Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          client.preApprovalStatus === 'Verified Pre-Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : client.preApprovalStatus === 'In Progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            client.preApprovalStatus === 'Verified Pre-Approved' ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}></span>
                          {client.preApprovalStatus}
                        </span>
                        {client.preApprovalLender && (
                          <div className="text-[10px] text-slate-500 mt-1 font-medium truncate max-w-[130px]">
                            {client.preApprovalLender}
                          </div>
                        )}
                      </td>

                      {/* Strategy Mandate */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{client.primaryGoal}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {client.targetStates?.join(', ') || 'QLD, WA'}
                        </div>
                      </td>

                      {/* Access Status & Invitation Badge */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div>
                            {isRevoked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <UserX className="w-3 h-3 text-rose-600" />
                                Revoked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Active
                              </span>
                            )}
                          </div>

                          {/* 48h Invitation Status Pill */}
                          {(() => {
                            const invite = getInvitationForClient(client.id, client.email);
                            if (!invite) return null;
                            const time = formatTimeRemaining(invite.expiresAt);
                            if (invite.status === 'accepted') {
                              return (
                                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                  <span>✓ Password Set</span>
                                </div>
                              );
                            }
                            if (time.isExpired) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleResend48hInvite(client)}
                                  className="text-[10px] text-rose-700 font-bold hover:underline flex items-center gap-1"
                                  title="Click to re-issue fresh 48-hour invitation link"
                                >
                                  <span>⚠️ Expired (Re-send)</span>
                                </button>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => handleOpenEmailInviteModal(client)}
                                className="text-[10px] text-amber-800 font-medium hover:underline flex items-center gap-1"
                                title="Click to view email invitation and 48-hour link"
                              >
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                <span>{time.text}</span>
                              </button>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Documents Count */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedClientForDossier(client);
                            setIsDossierOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                          {clientDocsCount}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Email Invitation Preview */}
                          <button
                            onClick={() => handleOpenEmailInviteModal(client)}
                            className="p-1.5 text-slate-500 hover:text-[#B8960C] hover:bg-amber-50 rounded-lg transition-colors"
                            title="View Dispatched Email Invitation & 48h Link"
                          >
                            <Mail className="w-4 h-4 text-[#B8960C]" />
                          </button>

                          {/* View Dossier */}
                          <button
                            onClick={() => {
                              setSelectedClientForDossier(client);
                              setIsDossierOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#1A3A5C] hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Full Mandate & Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => {
                              setSelectedClientForEdit(client);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Client Profile & Credentials"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Upload Document to this Client */}
                          <button
                            onClick={() => {
                              setUploadTargetClientId(client.id);
                              setIsUploadModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Upload Document to Client Profile"
                          >
                            <Upload className="w-4 h-4" />
                          </button>

                          {/* OneDrive Folder Structure */}
                          <button
                            onClick={() => setSelectedClientForOneDrive(client)}
                            className="p-1.5 text-[#0078D4] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Inspect & Sync OneDrive Client Folders"
                          >
                            <Cloud className="w-4 h-4" />
                          </button>

                          {/* Revoke / Restore Access */}
                          {isRevoked ? (
                            <button
                              onClick={() => {
                                onRestoreAccess(client.id);
                                showToast('Access Restored', `${client.name} can now log into their client portal.`);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors"
                              title="Restore Investor Access"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => setRevokeTargetClient(client)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition-colors"
                              title="Revoke Portal Access"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const account = getAccountForClient(client);
            const isRevoked = client.accessStatus === 'revoked' || account?.status === 'revoked';
            const clientDocsCount = documents.filter(d => d.clientId === client.id).length;
            const tempPass = client.tempPassword || account?.tempPassword || account?.password || 'client123';

            return (
              <div 
                key={client.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  isRevoked ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar with Status and Goal */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {client.primaryGoal}
                    </span>
                    {isRevoked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <UserX className="w-3 h-3" />
                        Revoked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Investor Name & Initials */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isRevoked ? 'bg-rose-100 text-rose-700' : 'bg-[#1A3A5C]/10 text-[#1A3A5C]'
                    }`}>
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {client.email}
                      </div>
                    </div>
                  </div>

                  {/* Budget & Capacity Bar */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 mb-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Purchasing Capacity:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Pre-Approval:</span>
                      <span className="font-semibold text-emerald-700">{client.preApprovalStatus}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Temp Password:</span>
                      <div className="flex items-center gap-1">
                        <code className="font-mono text-xs font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {tempPass}
                        </code>
                        <button
                          onClick={() => handleCopy(tempPass, `card-pass-${client.id}`)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {copiedKey === `card-pass-${client.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Target Suburbs Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {client.targetSuburbs?.slice(0, 3).map((suburb, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {suburb}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedClientForDossier(client);
                        setIsDossierOpen(true);
                      }}
                      className="text-xs font-bold text-[#1A3A5C] hover:underline flex items-center gap-1"
                    >
                      Dossier ({clientDocsCount} docs)
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEmailInviteModal(client)}
                      className="p-1.5 text-slate-600 hover:text-[#B8960C] hover:bg-amber-50 rounded-lg transition-colors"
                      title="View Dispatched Email Invitation & 48h Link"
                    >
                      <Mail className="w-4 h-4 text-[#B8960C]" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClientForEdit(client);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setUploadTargetClientId(client.id);
                        setIsUploadModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Upload Document"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedClientForOneDrive(client)}
                      className="p-1.5 text-[#0078D4] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Inspect & Sync OneDrive Folders"
                    >
                      <Cloud className="w-4 h-4" />
                    </button>
                    {isRevoked ? (
                      <button
                        onClick={() => {
                          onRestoreAccess(client.id);
                          showToast('Access Restored', `${client.name} can now sign in.`);
                        }}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => setRevokeTargetClient(client)}
                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold rounded-lg"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ADD CLIENT & PROVISION LOGIN MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <AddClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newClient, tempPassword, sendEmailInvite) => {
            onAddClient(newClient, tempPassword);
            setIsAddModalOpen(false);

            if (sendEmailInvite !== false) {
              const invite = createClientInvitation({
                clientId: newClient.id,
                clientName: newClient.name,
                clientEmail: newClient.email,
                invitedBy: currentUser.name,
                invitedByRole: currentUser.agencyTitle || 'Principal Buyers Advocate',
                customHours: 48
              });
              refreshInvitations();
              setSelectedInviteForModal(invite);
              setIsEmailModalOpen(true);
              showToast(
                'Email Invitation Dispatched (48h)',
                `Invitation link sent to ${newClient.email}. Client can now set their own password.`
              );
            } else {
              showToast(
                'Investor Provisioned Successfully',
                `${newClient.name} is registered with login credentials (${newClient.email}).`
              );
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT CLIENT PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedClientForEdit && (
        <EditClientModal
          isOpen={isEditModalOpen}
          client={selectedClientForEdit}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClientForEdit(null);
          }}
          onSave={(updatedClient, newPassword) => {
            onUpdateClient(updatedClient, newPassword);
            setIsEditModalOpen(false);
            setSelectedClientForEdit(null);
            showToast('Profile Updated', `Investor profile for ${updatedClient.name} was updated successfully.`);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. UPLOAD DOCUMENT MODAL (TO ANY CLIENT) */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          clients={clients}
          initialClientId={uploadTargetClientId}
          currentUser={currentUser}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={(newDoc) => {
            onUploadDocument(newDoc);
            setIsUploadModalOpen(false);
            setAdminSupabaseRefreshKey(prev => prev + 1);
            showToast('Document Uploaded', `${newDoc.title} uploaded to ${newDoc.clientName}'s file.`);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. CLIENT DOSSIER & QUICK-INSPECT DRAWER */}
      {/* ========================================================================= */}
      {isDossierOpen && selectedClientForDossier && (
        <ClientDossierDrawer
          client={selectedClientForDossier}
          refreshTrigger={adminSupabaseRefreshKey}
          documents={documents.filter(d => d.clientId === selectedClientForDossier.id)}
          account={getAccountForClient(selectedClientForDossier)}
          invitation={getInvitationForClient(selectedClientForDossier.id, selectedClientForDossier.email)}
          onViewInvitationEmail={() => handleOpenEmailInviteModal(selectedClientForDossier)}
          onResendInvitation={() => handleResend48hInvite(selectedClientForDossier)}
          onOpenInviteToken={onOpenInviteToken}
          onClose={() => {
            setIsDossierOpen(false);
            setSelectedClientForDossier(null);
          }}
          onSwitchToClient={() => {
            onSelectClient(selectedClientForDossier);
            onNavigate('dashboard');
          }}
          onEditProfile={() => {
            setSelectedClientForEdit(selectedClientForDossier);
            setIsDossierOpen(false);
            setIsEditModalOpen(true);
          }}
          onUploadDoc={() => {
            setUploadTargetClientId(selectedClientForDossier.id);
            setIsDossierOpen(false);
            setIsUploadModalOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. EMAIL INVITATION & 48-HOUR TOKEN MODAL */}
      {/* ========================================================================= */}
      {isEmailModalOpen && selectedInviteForModal && (
        <EmailInviteModal
          isOpen={isEmailModalOpen}
          invitation={selectedInviteForModal}
          onClose={() => {
            setIsEmailModalOpen(false);
            setSelectedInviteForModal(null);
            refreshInvitations();
          }}
          onOpenInviteLink={(token) => {
            setIsEmailModalOpen(false);
            if (onOpenInviteToken) {
              onOpenInviteToken(token);
            }
          }}
          onInvitationUpdated={(updated) => {
            setSelectedInviteForModal(updated);
            refreshInvitations();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. REVOKE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {revokeTargetClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Revoke Client Portal Access?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Are you sure you want to revoke access for <strong className="text-slate-900">{revokeTargetClient.name}</strong> ({revokeTargetClient.email})?
              They will be immediately blocked from logging into their investor dashboard and viewing property shortlists.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setRevokeTargetClient(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRevokeAccess(revokeTargetClient.id);
                  showToast('Access Revoked', `Access for ${revokeTargetClient.name} has been revoked.`, 'warn');
                  setRevokeTargetClient(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MICROSOFT ONEDRIVE CLIENT FOLDERS INSPECTOR & PROVISIONER MODAL */}
      {/* ========================================================================= */}
      {selectedClientForOneDrive && (
        <OneDriveFoldersModal
          client={selectedClientForOneDrive}
          onClose={() => setSelectedClientForOneDrive(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. MICROSOFT ONEDRIVE HUB MANAGER */}
      {/* ========================================================================= */}
      <OneDriveFolderManagerModal
        isOpen={isOneDriveFolderModalOpen}
        onClose={() => setIsOneDriveFolderModalOpen(false)}
        clients={clients}
      />
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: MICROSOFT ONEDRIVE CLIENT FOLDERS INSPECTOR & PROVISIONER MODAL
// =============================================================================

interface OneDriveFoldersModalProps {
  client: ClientProfile | null;
  onClose: () => void;
}

const OneDriveFoldersModal: React.FC<OneDriveFoldersModalProps> = ({ client, onClose }) => {
  if (!client) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [folderResult, setFolderResult] = useState<OneDriveClientFolderProvisionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clientName = client.fullName || client.name;
  const folderPath = getOneDriveClientFolderPath(clientName);
  const endpoint = `POST https://graph.microsoft.com/v1.0/users/${ONEDRIVE_DEFAULT_CONFIG.userEmail}/drive/root:/${folderPath}:/children`;

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchClientOneDriveFolders(clientName)
      .then((res) => {
        if (active) {
          setFolderResult(res);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch OneDrive folders';
          setErrorMessage(msg);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [clientName]);

  const handleSyncFolders = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await createClientOneDriveFolders(clientName);
      setFolderResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sync OneDrive folders';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0078D4]/10 text-[#0078D4] flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Microsoft OneDrive Client Folders</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {folderResult?.mode === 'live' ? 'Live Azure Graph' : 'Simulated / Ready'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Client: <strong className="text-slate-800">{clientName}</strong> ({client.email})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Path Info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 uppercase tracking-wider">Azure Storage Path</span>
            <button
              type="button"
              onClick={() => copyToClipboard(folderPath, 'path')}
              className="text-[#0078D4] hover:underline font-bold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {copiedKey === 'path' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'path' ? 'Copied' : 'Copy Path'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 break-all">
            📁 {folderPath}
          </div>
        </div>

        {/* Microsoft Graph API Endpoint */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 uppercase tracking-wider">Graph API POST Endpoint</span>
            <button
              type="button"
              onClick={() => copyToClipboard(endpoint, 'endpoint')}
              className="text-[#0078D4] hover:underline font-bold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {copiedKey === 'endpoint' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'endpoint' ? 'Copied' : 'Copy Endpoint'}</span>
            </button>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 font-mono text-[10px] text-blue-900 break-all">
            {endpoint}
          </div>
        </div>

        {/* 6 Subfolders Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              6 Standard Subfolders
            </span>
            <span className="text-[#0078D4] font-semibold flex items-center gap-1">
              <FolderCheck className="w-3.5 h-3.5" />
              Auto-Provisioned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {DEFAULT_CLIENT_SUBFOLDERS.map((subfolderName) => {
              const subResult = folderResult?.subfoldersCreated?.find(s => s.name === subfolderName);
              return (
                <div 
                  key={subfolderName} 
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="w-4 h-4 text-[#0078D4] shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{subfolderName}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{subResult ? 'Verified' : 'Ready'}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Azure Account & Folder Info */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Microsoft Azure User:</span>
            <span className="font-mono font-bold text-slate-700">{ONEDRIVE_DEFAULT_CONFIG.userEmail}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Azure Tenant ID:</span>
            <span className="font-mono font-bold text-slate-700">{ONEDRIVE_DEFAULT_CONFIG.tenantId}</span>
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleSyncFolders}
            className="px-4 py-2 bg-[#0078D4] hover:bg-[#006cbd] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Provisioning Folders...' : 'Re-sync / Verify 6 Subfolders'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: ADD CLIENT & PROVISION CREDENTIALS MODAL
// =============================================================================

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: ClientProfile, tempPassword: string, sendEmailInvite: boolean) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+61 ');
  const [tempPassword, setTempPassword] = useState('Client2026!');
  const [showPassword, setShowPassword] = useState(true);
  const [sendEmailInvite, setSendEmailInvite] = useState(true);
  const [budgetMin, setBudgetMin] = useState(700000);
  const [budgetMax, setBudgetMax] = useState(950000);
  const [depositAvailable, setDepositAvailable] = useState(200000);
  const [preApprovalStatus, setPreApprovalStatus] = useState<PreApprovalStatusType>('Verified Pre-Approved');
  const [preApprovalLender, setPreApprovalLender] = useState('Macquarie Bank');
  const [preApprovalAmount, setPreApprovalAmount] = useState(980000);
  const [primaryGoal, setPrimaryGoal] = useState<InvestmentGoal>('Balanced (Growth + Yield)');
  const [targetStates, setTargetStates] = useState('QLD, WA');
  const [targetSuburbs, setTargetSuburbs] = useState('Moreton Bay, Mandurah, Rockingham');
  const [riskAppetite, setRiskAppetite] = useState<'Conservative' | 'Moderate' | 'Aggressive Growth'>('Moderate');
  const [smsfPurchase, setSmsfPurchase] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState('Damian Sterling');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#$';
    let res = 'Inv#';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(res);
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError('Please enter client name and email address.');
      return;
    }

    const newClientId = `client-${Date.now()}`;
    const newClient: ClientProfile = {
      id: newClientId,
      name: name.trim(),
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      loginEmail: email.trim().toLowerCase(),
      phone: phone.trim(),
      tempPassword: tempPassword.trim(),
      accessStatus: 'active',
      assignedAgent,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      depositAvailable: Number(depositAvailable),
      preApprovalStatus,
      preApprovalLender,
      preApprovalAmount: Number(preApprovalAmount),
      preApprovalExpiry: '2026-12-31',
      primaryGoal,
      targetStates: targetStates.split(',').map(s => s.trim()).filter(Boolean),
      targetSuburbs: targetSuburbs.split(',').map(s => s.trim()).filter(Boolean),
      preferredSuburbs: targetSuburbs.split(',').map(s => s.trim()).filter(Boolean),
      propertyTypes: ['Freestanding House', 'Townhouse'],
      riskAppetite,
      maxHoldPeriodYears: 10,
      smsfPurchase,
      renovationAppetite: 'Minor Cosmetic Ok',
      createdDate: new Date().toISOString().split('T')[0]
    };

    onSave(newClient, tempPassword, sendEmailInvite);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#B8960C]" />
              Provision New Investor Account
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add client investor profile and generate their portal credentials.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Section A: Credentials & Identity */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-[#B8960C]" />
              1. Investor Credentials & Contact
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Investor / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam & Chloe O'Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-[#1A3A5C]/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Login Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam.oconnor@investor.com.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-[#1A3A5C]/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-[#1A3A5C]/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">Temporary Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-[#1A3A5C] font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold pr-9 focus:ring-2 focus:ring-[#1A3A5C]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 48-Hour Token Email Invitation Highlight */}
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-700">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendEmailInvite}
                  onChange={(e) => setSendEmailInvite(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#B8960C] focus:ring-[#1A3A5C] border-slate-300"
                />
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#B8960C]" />
                    <span>Send Client Email Invitation with 48-Hour Password Setup Link</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-md font-bold">
                      Recommended
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    The system will immediately email <strong>{email || 'the client'}</strong> an invitation link with a secure, single-use token. The client can set their own confidential password upon clicking. The link automatically lapses after <strong>48 hours</strong>.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section B: Purchasing Power & Finance */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              2. Budget & Finance Capacity
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Min Budget ($)</label>
                <input
                  type="number"
                  step="10000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Budget ($)</label>
                <input
                  type="number"
                  step="10000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Available Deposit ($)</label>
                <input
                  type="number"
                  step="5000"
                  value={depositAvailable}
                  onChange={(e) => setDepositAvailable(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pre-Approval Status</label>
                <select
                  value={preApprovalStatus}
                  onChange={(e) => setPreApprovalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Verified Pre-Approved">Verified Pre-Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pre-Approved">Pre-Approved</option>
                  <option value="Cash Buyer">Cash Buyer</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Lender</label>
                <input
                  type="text"
                  placeholder="e.g. Macquarie, ANZ"
                  value={preApprovalLender}
                  onChange={(e) => setPreApprovalLender(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pre-Approval Limit ($)</label>
                <input
                  type="number"
                  value={preApprovalAmount}
                  onChange={(e) => setPreApprovalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section C: Mandate & Goal */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-[#1A3A5C]" />
              3. Investment Strategy & Agency Assignment
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Investment Goal</label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Balanced (Growth + Yield)">Balanced (Growth + Yield)</option>
                  <option value="Capital Growth">Capital Growth</option>
                  <option value="High Cashflow Yield">High Cashflow Yield</option>
                  <option value="Value-Add / Renovation">Value-Add / Renovation</option>
                  <option value="SMSF Super Fund">SMSF Super Fund</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Risk Appetite</label>
                <select
                  value={riskAppetite}
                  onChange={(e) => setRiskAppetite(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive Growth">Aggressive Growth</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target States (comma-separated)</label>
                <input
                  type="text"
                  value={targetStates}
                  onChange={(e) => setTargetStates(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Buyers Advocate</label>
                <select
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Damian Sterling">Damian Sterling (Principal)</option>
                  <option value="Kylie Chen">Kylie Chen (Senior Advocate)</option>
                  <option value="James Holloway">James Holloway (Acquisitions)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Suburbs & Hubs</label>
                <input
                  type="text"
                  value={targetSuburbs}
                  onChange={(e) => setTargetSuburbs(e.target.value)}
                  placeholder="e.g. Kallangur, Petrie, Baldivis, Rockingham"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsfPurchase}
                  onChange={(e) => setSmsfPurchase(e.target.checked)}
                  className="w-4 h-4 text-[#1A3A5C] rounded border-slate-300 focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-700">
                  SMSF Purchase (Self-Managed Superannuation Fund Entity Structure)
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Automated Microsoft OneDrive Folder Provisioning */}
          <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Cloud className="w-3.5 h-3.5 text-[#0078D4]" />
                4. Automated OneDrive Folder Provisioning
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0078D4] border border-blue-200">
                Microsoft Graph API
              </span>
            </div>

            <p className="text-[11px] text-blue-800 leading-relaxed">
              When this client is created, the system will automatically create their dedicated folder in OneDrive at:
            </p>
            <div className="p-2 bg-white rounded-lg border border-blue-200 font-mono text-[11px] text-blue-950 font-semibold truncate">
              Documents/Abhijith App Test/{name.trim() || '{Client Full Name}'}/
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-900 block mb-1">
                6 Standard Subfolders Created via Graph API:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                {DEFAULT_CLIENT_SUBFOLDERS.map((sub) => (
                  <div key={sub} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-blue-100 text-slate-700 font-medium">
                    <Folder className="w-3 h-3 text-[#0078D4] shrink-0" />
                    <span className="truncate">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[9px] font-mono text-blue-600/80 truncate pt-1 border-t border-blue-100">
              POST https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/{name.trim() || '{Client Full Name}'}:/children
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#B8960C] hover:bg-[#997B0A] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Provision Account & Save Mandate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: EDIT CLIENT PROFILE MODAL
// =============================================================================

interface EditClientModalProps {
  isOpen: boolean;
  client: ClientProfile;
  onClose: () => void;
  onSave: (updatedClient: ClientProfile, newPassword?: string) => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, client, onClose, onSave }) => {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone || '');
  const [newPassword, setNewPassword] = useState(client.tempPassword || 'client123');
  const [budgetMin, setBudgetMin] = useState(client.budgetMin);
  const [budgetMax, setBudgetMax] = useState(client.budgetMax);
  const [depositAvailable, setDepositAvailable] = useState(client.depositAvailable);
  const [preApprovalStatus, setPreApprovalStatus] = useState(client.preApprovalStatus);
  const [preApprovalLender, setPreApprovalLender] = useState(client.preApprovalLender || '');
  const [primaryGoal, setPrimaryGoal] = useState(client.primaryGoal);
  const [targetSuburbs, setTargetSuburbs] = useState(client.targetSuburbs?.join(', ') || '');
  const [assignedAgent, setAssignedAgent] = useState(client.assignedAgent || 'Damian Sterling');
  const [accessStatus, setAccessStatus] = useState(client.accessStatus || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ClientProfile = {
      ...client,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      loginEmail: email.trim().toLowerCase(),
      phone: phone.trim(),
      tempPassword: newPassword.trim(),
      accessStatus,
      assignedAgent,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      depositAvailable: Number(depositAvailable),
      preApprovalStatus,
      preApprovalLender,
      primaryGoal,
      targetSuburbs: targetSuburbs.split(',').map(s => s.trim()).filter(Boolean)
    };

    onSave(updated, newPassword.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-600" />
              Edit Investor Profile & Credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update {client.name}'s acquisition brief and login credentials.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Investor Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Login Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Portal Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Min Budget ($)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Budget ($)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pre-Approval Status</label>
              <select
                value={preApprovalStatus}
                onChange={(e) => setPreApprovalStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Verified Pre-Approved">Verified Pre-Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Pre-Approved">Pre-Approved</option>
                <option value="Cash Buyer">Cash Buyer</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Pre-Approval Lender</label>
              <input
                type="text"
                value={preApprovalLender}
                onChange={(e) => setPreApprovalLender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Access Authorization</label>
              <select
                value={accessStatus}
                onChange={(e) => setAccessStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
              >
                <option value="active">Active (Permit Portal Login)</option>
                <option value="revoked">Revoked (Block Portal Login)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Advocate</label>
              <input
                type="text"
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Suburbs</label>
              <input
                type="text"
                value={targetSuburbs}
                onChange={(e) => setTargetSuburbs(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1A3A5C] hover:bg-[#0E2238] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: UPLOAD DOCUMENT TO ANY CLIENT MODAL
// =============================================================================

interface UploadDocumentModalProps {
  isOpen: boolean;
  clients: ClientProfile[];
  initialClientId?: string;
  currentUser: AuthUser;
  onClose: () => void;
  onUpload: (newDoc: ClientDocument) => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  clients,
  initialClientId,
  currentUser,
  onClose,
  onUpload
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || clients[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Contracts');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [status, setStatus] = useState<'Verified' | 'Pending Review' | 'Under Review'>('Verified');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('Contract_Of_Sale_Signed.pdf');
  const [fileSize, setFileSize] = useState('3.8 MB');
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);
  const [uploadSuccessDetails, setUploadSuccessDetails] = useState<{ path: string; fileName: string } | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedRawFile(file);
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedClient) {
      return;
    }

    const clientFullName = selectedClient.fullName || selectedClient.name;
    const formattedFileName = selectedRawFile 
      ? selectedRawFile.name 
      : (fileName.includes('.') ? fileName : `${fileName}.pdf`);

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);
    setUploadSuccessMsg(false);

    try {
      let fileToUpload: File | Blob;
      if (selectedRawFile) {
        fileToUpload = selectedRawFile;
      } else {
        const textContent = `=====================================================
ICONIC INVESTING - CLIENT PROFILE DOCUMENT VAULT
Document Title: ${title.trim()}
File Name: ${formattedFileName}
Category: ${category}
Client: ${clientFullName}
Uploaded By: Advocate Admin (${currentUser.name || 'Damian Sterling'})
Date: ${new Date().toISOString()}
${propertyAddress ? `Associated Property: ${propertyAddress}\n` : ''}${notes ? `Notes: ${notes}\n` : ''}=====================================================
Certified in Iconic Investing Supabase Storage Vault (client-documents).
`;
        fileToUpload = new Blob([textContent], { type: 'application/pdf' });
      }

      const uploadResult = await uploadClientDocumentToSupabase({
        clientFullName,
        category,
        file: fileToUpload,
        customFileName: formattedFileName,
        onProgress: (p) => setUploadProgress(p)
      });

      if (!uploadResult.success) {
        setIsUploading(false);
        setUploadError(uploadResult.error || 'Failed to upload document to Supabase Storage.');
        return;
      }

      const newDoc: ClientDocument = {
        id: `doc-adm-${Date.now()}`,
        clientId: selectedClient.id,
        clientName: clientFullName,
        title: title.trim(),
        category,
        fileName: formattedFileName,
        fileSize,
        fileType: selectedRawFile?.type || 'PDF',
        uploadedBy: 'admin',
        uploadedByName: currentUser.name || 'Advocate Admin',
        uploadedAt: new Date().toISOString().split('T')[0],
        propertyAddress: propertyAddress.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
        downloadUrl: uploadResult.publicUrl || '#'
      };

      onUpload(newDoc);
      setIsUploading(false);
      setUploadProgress(100);
      setUploadSuccessDetails({
        path: uploadResult.path || `${clientFullName}/${category}/${formattedFileName}`,
        fileName: formattedFileName
      });
      setUploadSuccessMsg(true);

      setTimeout(() => {
        setUploadSuccessMsg(false);
        setUploadSuccessDetails(null);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('[AdminUploadModal] Upload error:', err);
      setIsUploading(false);
      setUploadError(err?.message || 'An unexpected error occurred during upload.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              Upload Document to Client File
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely append contracts, inspection reports, or finance letters to an investor profile.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Target Client Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Select Target Investor *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-[#1A3A5C]/20"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) {c.accessStatus === 'revoked' ? '[REVOKED]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Contract of Sale - 42 Bunya Pine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="Contracts">Contracts</option>
                <option value="Building & Pest Reports">Building & Pest Reports</option>
                <option value="Finance Documents">Finance Documents</option>
                <option value="Payment Receipts">Payment Receipts</option>
                <option value="ID Verification">ID Verification</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Linked Property Address</label>
              <input
                type="text"
                placeholder="e.g. 42 Bunya Pine Circuit, Kallangur"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Verification Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="Verified">Verified & Underwritten</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
          </div>

          {/* File Selector Dropzone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Document Attachment</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-amber-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="admin-doc-file-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="admin-doc-file-input" className="cursor-pointer">
                <FileText className="w-8 h-8 text-amber-600 mx-auto mb-1.5" />
                <div className="font-semibold text-slate-800 text-xs">
                  {selectedRawFile ? selectedRawFile.name : fileName} <span className="text-slate-400">({fileSize})</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Click to select file from desktop or drag & drop (PDF, DOCX, PNG)
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Internal Advocate Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Formal execution completed by vendor. Sent to conveyancer via PEXA workspace."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1A3A5C]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8960C]" />
                  Uploading to Supabase Storage (client-documents)...
                </span>
                <span className="font-mono text-slate-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1A3A5C] to-[#B8960C] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                Path: {selectedClient.fullName || selectedClient.name}/{category}/{selectedRawFile?.name || fileName}
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-rose-900">Upload Failed</div>
                <div className="text-[11px] text-rose-700 leading-relaxed">{uploadError}</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-emerald-900">Document Uploaded to Supabase!</div>
                <div className="text-[11px] text-emerald-700 font-normal">
                  Saved to bucket <code className="font-mono text-[10px] bg-emerald-100 px-1 py-0.5 rounded">client-documents</code>
                  {uploadSuccessDetails && (
                    <div className="font-mono text-[10px] text-emerald-800 mt-1 truncate">
                      {uploadSuccessDetails.path}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Uploading to Supabase...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Save to Client Vault</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: CLIENT DOSSIER & AUDIT DRAWER
// =============================================================================

interface ClientDossierDrawerProps {
  client: ClientProfile;
  documents: ClientDocument[];
  account?: UserAccount;
  invitation?: ClientInvitation;
  refreshTrigger?: number | string;
  onViewInvitationEmail?: () => void;
  onResendInvitation?: () => void;
  onOpenInviteToken?: (token: string) => void;
  onClose: () => void;
  onSwitchToClient: () => void;
  onEditProfile: () => void;
  onUploadDoc: () => void;
}

const ClientDossierDrawer: React.FC<ClientDossierDrawerProps> = ({
  client,
  documents,
  account,
  invitation,
  refreshTrigger,
  onViewInvitationEmail,
  onResendInvitation,
  onOpenInviteToken,
  onClose,
  onSwitchToClient,
  onEditProfile,
  onUploadDoc
}) => {
  const isRevoked = client.accessStatus === 'revoked' || account?.status === 'revoked';
  const tempPass = client.tempPassword || account?.tempPassword || account?.password || 'client123';
  const [copied, setCopied] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCopyCredentials = () => {
    const text = `Iconic Investing Client Portal Access
Investor: ${client.name}
Login Email: ${client.email}
Password: ${tempPass}
Status: ${isRevoked ? 'Revoked' : 'Active'}
Access URL: https://iconic-investing.com.au`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200">
        <div>
          {/* Drawer Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8960C]/20 border border-[#B8960C]/40 text-[#D4AF37] flex items-center justify-center font-bold text-base">
                {client.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  {client.name}
                  {isRevoked ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full">
                      Revoked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{client.email}</p>
              </div>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 text-xs text-slate-700">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onSwitchToClient}
                className="flex-1 py-2 px-3 bg-[#1A3A5C] hover:bg-[#0E2238] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Client Dashboard
              </button>
              <button
                onClick={onEditProfile}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={onUploadDoc}
                className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Add Doc
              </button>
            </div>

            {/* 48-Hour Email Invitation & Portal Setup Status */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#B8960C]" />
                  48-Hour Invitation & Password Setup
                </span>
                {invitation ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    invitation.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : formatTimeRemaining(invitation.expiresAt).isExpired
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {invitation.status === 'accepted'
                      ? '✓ Password Set'
                      : formatTimeRemaining(invitation.expiresAt).isExpired
                      ? '⚠️ Expired (>48h)'
                      : formatTimeRemaining(invitation.expiresAt).text}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">No invite record</span>
                )}
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {invitation?.status === 'accepted'
                  ? `Client accepted invitation and successfully configured their private portal password on ${new Date(invitation.acceptedAt || '').toLocaleDateString('en-AU')}.`
                  : 'Token-based email invitation with 48-hour expiration link. The client sets their own password when opening the link.'}
              </p>

              {invitation && (
                <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Single-Use Token:</span>
                    <code className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                      {invitation.token.slice(0, 16)}...
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Expires At (48 Hours):</span>
                    <span className="font-mono text-[10px] text-slate-700">
                      {new Date(invitation.expiresAt).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onViewInvitationEmail && (
                  <button
                    type="button"
                    onClick={onViewInvitationEmail}
                    className="px-3 py-1.5 bg-[#1A3A5C] hover:bg-[#254f7a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#B8960C]" />
                    <span>View Dispatched Email</span>
                  </button>
                )}

                {onResendInvitation && (
                  <button
                    type="button"
                    onClick={onResendInvitation}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Re-issue Fresh 48h Link</span>
                  </button>
                )}

                {invitation && onOpenInviteToken && invitation.status !== 'accepted' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInviteToken(invitation.token);
                    }}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                    <span>Simulate Client Set Password</span>
                  </button>
                )}
              </div>
            </div>

            {/* Login & Security Credentials Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#B8960C]" />
                  Investor Login Credentials
                </span>
                <button
                  onClick={handleCopyCredentials}
                  className="text-[11px] text-[#1A3A5C] font-bold hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied Brief' : 'Copy Credentials Brief'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email (Username)</span>
                  <span className="font-mono font-bold text-slate-800 truncate block">{client.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Temporary Password</span>
                  <code className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                    {tempPass}
                  </code>
                </div>
              </div>
            </div>

            {/* Financial Capacity */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
                Financial Mandate & Borrowing
              </h4>
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400">Budget Range</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Available Deposit</span>
                  <div className="font-bold text-slate-900 text-sm">{formatCurrency(client.depositAvailable)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Pre-Approval Status</span>
                  <div className="font-semibold text-emerald-700">{client.preApprovalStatus}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Lender</span>
                  <div className="font-semibold text-slate-800">{client.preApprovalLender || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Target Suburbs */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Target Suburbs & Corridors
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {client.targetSuburbs?.map((suburb, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    {suburb}
                  </span>
                ))}
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Documents on Record ({documents.length})
                </h4>
                <button
                  onClick={onUploadDoc}
                  className="text-[11px] font-bold text-amber-700 hover:underline"
                >
                  + Upload Document
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
                  No documents uploaded for this client yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{doc.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {doc.category} • {doc.fileSize} • {doc.uploadedAt}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Supabase Storage Files Vault (Prompt 3: Grouped by category subfolder with View & Delete) */}
            <div className="pt-2">
              <SupabaseClientFilesSection
                clientFullName={client.fullName || client.name}
                refreshTrigger={refreshTrigger}
                title="Supabase Storage Vault"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
