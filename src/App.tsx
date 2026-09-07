import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { TopBar } from './components/Navigation/TopBar';
import { ClientDashboard } from './components/Dashboard/ClientDashboard';
import { ClientOnboarding } from './components/Onboarding/ClientOnboarding';
import { PropertySearch } from './components/Search/PropertySearch';
import { SuburbResearch } from './components/Market/SuburbResearch';
import { ReportAnalyser } from './components/Analyser/ReportAnalyser';
import { PDFBuyerReport } from './components/Report/PDFBuyerReport';
import { OfferTracker } from './components/Negotiation/OfferTracker';
import { SettlementChecklist } from './components/Settlement/SettlementChecklist';
import { PropertyDetailModal } from './components/Modals/PropertyDetailModal';
import { CashflowModal } from './components/Modals/CashflowModal';
import { NewPropertyModal } from './components/Modals/NewPropertyModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { SetPasswordScreen } from './components/Auth/SetPasswordScreen';
import { ClientDocumentHub } from './components/Documents/ClientDocumentHub';
import { OneDriveFolderManagerModal } from './components/Documents/OneDriveFolderManagerModal';
import { AdminControlPanel } from './components/Admin/AdminControlPanel';
import { ClientAgentMessaging } from './components/Messages/ClientAgentMessaging';
import { Cloud, CheckCircle2, X, FolderCheck } from 'lucide-react';
import { createClientOneDriveFolders, DEFAULT_CLIENT_SUBFOLDERS } from './services/oneDriveClient';
import { supabase, testSupabaseConnection } from './services/supabaseClient';
import { createClientSupabaseFolders } from './services/supabaseStorage';
import { 
  MOCK_CLIENTS, 
  MOCK_PROPERTIES, 
  MOCK_BP_ANALYSES, 
  MOCK_OFFERS, 
  MOCK_SETTLEMENTS 
} from './data/mockData';
import { INITIAL_DOCUMENTS } from './data/mockDocuments';
import { INITIAL_MESSAGES, ADVOCATES } from './data/mockMessages';
import { 
  ClientProfile, 
  Property, 
  BPReportAnalysis, 
  OfferNegotiation, 
  SettlementRecord, 
  AppSection,
  AuthUser,
  ClientDocument,
  AgentMessage
} from './types';
import { 
  getStoredToken, 
  getStoredUser, 
  clearAuthSession, 
  verifyCurrentSession,
  storeAuthSession,
  registerOrUpdateClientAccount,
  setClientAccountStatus
} from './utils/auth';

// Persistent Storage Keys
const STORAGE_KEYS = {
  CLIENTS: 'iconic_investing_clients_v2',
  ACTIVE_CLIENT_ID: 'iconic_investing_active_client_id_v2',
  PROPERTIES: 'iconic_investing_properties_v2',
  BP_ANALYSES: 'iconic_investing_bp_analyses_v2',
  OFFERS: 'iconic_investing_offers_v2',
  SETTLEMENTS: 'iconic_investing_settlements_v2',
  SECTION: 'iconic_investing_current_section_v2',
  DOCUMENTS: 'iconic_investing_documents_v2',
  MESSAGES: 'iconic_investing_messages_v2'
};

// Safe localStorage loader helper
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn(`Could not load key ${key} from storage:`, err);
  }
  return fallback;
}

export default function App() {
  // 0. Authentication & Session State (JWT-based)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [authToken, setAuthToken] = useState<string | null>(() => getStoredToken());
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(false);

  // 0b. Token-based Invitation State (intercept ?token=... or #token=...)
  const [activeInviteToken, setActiveInviteToken] = useState<string | null>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token') || searchParams.get('inviteToken') || searchParams.get('invite');
      if (urlToken) return urlToken;

      const hash = window.location.hash;
      if (hash && hash.includes('token=')) {
        const hashMatch = hash.match(/token=([A-Za-z0-9_-]+)/);
        if (hashMatch && hashMatch[1]) return hashMatch[1];
      }
    } catch (e) {
      console.warn('Could not parse token from URL:', e);
    }
    return null;
  });

  // Listen to browser URL changes (e.g. hash or popstate)
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get('token') || searchParams.get('inviteToken') || searchParams.get('invite');
        if (urlToken) {
          setActiveInviteToken(urlToken);
          return;
        }

        const hash = window.location.hash;
        if (hash && hash.includes('token=')) {
          const hashMatch = hash.match(/token=([A-Za-z0-9_-]+)/);
          if (hashMatch && hashMatch[1]) {
            setActiveInviteToken(hashMatch[1]);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // 1. Navigation & Client State with persistence
  const [currentSection, setCurrentSection] = useState<AppSection>(() => 
    loadFromStorage<AppSection>(STORAGE_KEYS.SECTION, 'dashboard')
  );
  
  const [clients, setClients] = useState<ClientProfile[]>(() => 
    loadFromStorage<ClientProfile[]>(STORAGE_KEYS.CLIENTS, MOCK_CLIENTS)
  );

  const [activeClientId, setActiveClientId] = useState<string>(() => {
    const savedId = loadFromStorage<string>(STORAGE_KEYS.ACTIVE_CLIENT_ID, MOCK_CLIENTS[0].id);
    return savedId;
  });

  // 2. Core Data Stores with persistence
  const [properties, setProperties] = useState<Property[]>(() => 
    loadFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, MOCK_PROPERTIES)
  );

  const [documents, setDocuments] = useState<ClientDocument[]>(() => 
    loadFromStorage<ClientDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS)
  );

  const [messages, setMessages] = useState<AgentMessage[]>(() => 
    loadFromStorage<AgentMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES)
  );

  const [bpAnalyses, setBpAnalyses] = useState<BPReportAnalysis[]>(() => 
    loadFromStorage<BPReportAnalysis[]>(STORAGE_KEYS.BP_ANALYSES, MOCK_BP_ANALYSES)
  );

  const [offers, setOffers] = useState<OfferNegotiation[]>(() => 
    loadFromStorage<OfferNegotiation[]>(STORAGE_KEYS.OFFERS, MOCK_OFFERS)
  );

  const [settlements, setSettlements] = useState<SettlementRecord[]>(() => 
    loadFromStorage<SettlementRecord[]>(STORAGE_KEYS.SETTLEMENTS, MOCK_SETTLEMENTS)
  );

  // 3. UI State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);

  // Modals state
  const [detailModalProperty, setDetailModalProperty] = useState<Property | null>(null);
  const [cashflowModalProperty, setCashflowModalProperty] = useState<Property | null>(null);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState<boolean>(false);
  const [isOneDriveFolderModalOpen, setIsOneDriveFolderModalOpen] = useState<boolean>(false);

  // Real-time Microsoft Graph OneDrive automated folder creation toast
  const [oneDriveToast, setOneDriveToast] = useState<{
    title: string;
    clientName: string;
    folderPath: string;
    endpoint: string;
    subfolders: string[];
    mode: 'live' | 'simulated';
  } | null>(null);

  // Verify JWT session on initial mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setIsVerifyingSession(true);
      verifyCurrentSession()
        .then((user) => {
          if (user) {
            setCurrentUser(user);
          } else {
            // Invalid or expired JWT
            clearAuthSession();
            setCurrentUser(null);
            setAuthToken(null);
          }
        })
        .catch(() => {
          // Token verification error
        })
        .finally(() => {
          setIsVerifyingSession(false);
        });
    }
  }, []);

  // Supabase Storage connection test on page load
  useEffect(() => {
    testSupabaseConnection().then((status) => {
      if (status.connected) {
        console.log('[App] Supabase Storage connected successfully on page load:', status.url);
      } else {
        console.warn('[App] Supabase connection status on page load:', status.message);
      }
    });
  }, []);

  // Automatic state synchronisation to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) { console.error(e); }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CLIENT_ID, JSON.stringify(activeClientId));
    } catch (e) { console.error(e); }
  }, [activeClientId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) { console.error(e); }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (e) { console.error(e); }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) { console.error(e); }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BP_ANALYSES, JSON.stringify(bpAnalyses));
    } catch (e) { console.error(e); }
  }, [bpAnalyses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    } catch (e) { console.error(e); }
  }, [offers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
    } catch (e) { console.error(e); }
  }, [settlements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SECTION, JSON.stringify(currentSection));
    } catch (e) { console.error(e); }
  }, [currentSection]);

  // Determine active client profile strictly based on role
  const activeClient = useMemo(() => {
    if (currentUser?.role === 'client') {
      // Find matching client profile
      const matched = clients.find(c => 
        c.id === currentUser.clientId || 
        c.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (matched) return matched;
    }
    return clients.find(c => c.id === activeClientId) || clients[0] || MOCK_CLIENTS[0];
  }, [currentUser, clients, activeClientId]);

  // Client Role Security Enforcement: Redirect if client attempts to access an admin-only section
  useEffect(() => {
    if (currentUser?.role === 'client') {
      const allowedClientSections: AppSection[] = ['dashboard', 'search', 'documents', 'settlement', 'messages'];
      if (!allowedClientSections.includes(currentSection)) {
        setCurrentSection('dashboard');
      }
    }
  }, [currentUser, currentSection]);

  // Properties visible to the user:
  // - Admin: see all properties in database
  // - Client: strictly see their own properties (or curated portfolio items)
  const visibleProperties = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return properties;
    }
    const targetClientId = currentUser?.clientId || activeClient.id;
    // Client view: Curated property shortlist strictly for this client
    return properties.filter(p => 
      (!p.clientId || p.clientId === targetClientId) &&
      (p.status === 'Shortlisted' || 
       p.status === 'Under Review' || 
       p.status === 'Due Diligence' || 
       p.status === 'Under Contract' ||
       p.status === 'Offer Made')
    );
  }, [currentUser, activeClient, properties]);

  // Settlements visible to the user:
  // - Admin: see all settlements
  // - Client: strictly see their own settlement records
  const visibleSettlements = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return settlements;
    }
    const targetClientId = currentUser?.clientId || activeClient.id;
    return settlements.filter(s => !s.clientId || s.clientId === targetClientId);
  }, [currentUser, activeClient, settlements]);

  // Documents visible to the user:
  // - Admin: see all documents
  // - Client: strictly see their own documents
  const visibleDocuments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
      return documents;
    }
    const targetClientId = currentUser.clientId || activeClient.id;
    return documents.filter(d => d.clientId === targetClientId);
  }, [currentUser, activeClient, documents]);

  // Count documents visible to current user
  const userVisibleDocumentCount = useMemo(() => {
    return visibleDocuments.length;
  }, [visibleDocuments]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    storeAuthSession(token, user);
    
    // Auto-align active client profile
    if (user.role === 'client' && user.clientId) {
      setActiveClientId(user.clientId);
      setCurrentSection('dashboard');
    } else {
      setCurrentSection('dashboard');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setAuthToken(null);
    setCurrentSection('dashboard');
  };

  // Navigation Handler with optional propertyId focus
  const handleNavigate = (section: AppSection, propertyId?: string) => {
    // Prevent client from navigating to admin sections
    if (currentUser?.role === 'client') {
      const allowedClientSections: AppSection[] = ['dashboard', 'search', 'documents', 'settlement', 'messages'];
      if (!allowedClientSections.includes(section)) {
        console.warn(`Unauthorized access attempt by non-admin to "${section}". Redirecting to dashboard.`);
        section = 'dashboard';
      }
    }
    setCurrentSection(section);
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle task completion in settlement
  const handleToggleTask = (settlementId: string, taskId: string) => {
    setSettlements(prev => prev.map(s => {
      if (s.id !== settlementId) return s;
      return {
        ...s,
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      };
    }));
  };

  // Send message between client and advocate with automated responses
  const handleSendMessage = (text: string, propertyRef?: Property, attachmentName?: string) => {
    if (!currentUser) return;
    const isClient = currentUser.role === 'client';
    const effectiveClientId = isClient ? (currentUser.clientId || activeClient.id) : activeClient.id;

    const newMsg: AgentMessage = {
      id: `msg-${Date.now()}`,
      clientId: effectiveClientId,
      sender: isClient ? 'client' : 'agent',
      senderName: currentUser.name,
      senderRole: isClient ? 'Investor Client' : 'Buyers Advocate',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'sent',
      propertyRef: propertyRef ? {
        id: propertyRef.id,
        address: propertyRef.address,
        suburb: `${propertyRef.suburb} ${propertyRef.state}`,
        priceGuide: propertyRef.priceGuide,
        imageUrl: propertyRef.imageUrl
      } : undefined,
      attachment: attachmentName ? {
        name: attachmentName,
        type: 'Document',
        size: '1.4 MB'
      } : undefined
    };

    setMessages(prev => [...prev, newMsg]);

    // If client sent a message, generate an advocate reply after a brief realistic pause
    if (isClient) {
      setTimeout(() => {
        const advocateName = activeClient.assignedAgent || 'Damian Sterling';
        const adv = ADVOCATES[advocateName] || ADVOCATES['Damian Sterling'];
        
        let replyText = `Thanks for reaching out, ${currentUser.name.split(' ')[0]}! I've reviewed your note and our acquisitions desk is on it. Let me verify the details and update you shortly.`;
        
        const lower = text.toLowerCase();
        if (lower.includes('contract') || lower.includes('clause') || lower.includes('solicitor') || lower.includes('legal')) {
          replyText = `I have dispatched the contract terms directly to Jessica at Apex Legal Conveyancing. She will review the vendor special conditions and finance clauses before we sign off.`;
        } else if (lower.includes('price') || lower.includes('offer') || lower.includes('negotiate') || lower.includes('anchor')) {
          replyText = `Based on comparable sales in the suburb over the past 90 days, an entry anchor offer with a 5-day expiry gives us strong leverage. I will prepare the formal written submission.`;
        } else if (lower.includes('inspection') || lower.includes('pest') || lower.includes('defect') || lower.includes('b&p')) {
          replyText = `The independent Building & Pest inspection has been scheduled. I will attend in person to inspect the roof cavity and subfloor moisture readings, and upload the report to your vault.`;
        } else if (lower.includes('settlement') || lower.includes('pexa') || lower.includes('keys')) {
          replyText = `All settlement milestones are tracking on time in PEXA. We will schedule our final pre-settlement walk-through 48 hours prior to funds disbursement.`;
        } else if (propertyRef) {
          replyText = `Great question on ${propertyRef.address}! This asset has strong appeal with a gross yield of ${propertyRef.grossYield}% and is positioned outside flood hazard zones. I will request the vendor disclosure pack immediately.`;
        }

        const replyMsg: AgentMessage = {
          id: `msg-${Date.now() + 1}`,
          clientId: effectiveClientId,
          sender: 'agent',
          senderName: adv.name,
          senderRole: adv.role,
          senderAvatar: adv.avatarUrl,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          status: 'delivered'
        };

        setMessages(prev => [...prev, replyMsg]);
      }, 1200);
    }
  };

  // Security guard: auto-redirect non-admins if on an admin-only section
  useEffect(() => {
    if (currentUser?.role === 'client') {
      const allowedClientSections: AppSection[] = ['dashboard', 'search', 'documents', 'settlement'];
      if (!allowedClientSections.includes(currentSection)) {
        setCurrentSection('dashboard');
      }
    }
  }, [currentUser, currentSection]);

  // Admin: Add New Client & Provision Portal Credentials + Auto-Create OneDrive Folders
  const handleAdminAddClient = async (newClient: ClientProfile, tempPassword: string) => {
    setClients(prev => [newClient, ...prev]);
    setActiveClientId(newClient.id);

    // Register user account in auth repository
    registerOrUpdateClientAccount({
      clientId: newClient.id,
      name: newClient.name,
      email: newClient.email,
      password: tempPassword,
      phone: newClient.phone,
      status: 'active'
    });

    // Auto-create folder in OneDrive: Documents/Abhijith App Test/{Client Full Name}/
    // Subfolders: Contracts, Building & Pest Reports, Finance Documents, Payment Receipts, ID Verification, Other
    // POST https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/{clientName}:/children
    const clientFullName = newClient.fullName || newClient.name;

    // Auto-create Supabase Storage folder structure with .keep placeholder files:
    // {Client Full Name}/Contracts/.keep, etc.
    createClientSupabaseFolders(clientFullName).catch(err => {
      console.warn('[Supabase Storage Auto-Create Warning]', err);
    });

    try {
      console.log(`[OneDrive Auto-Create] Provisioning folders for: ${clientFullName}`);
      const result = await createClientOneDriveFolders(clientFullName);
      setOneDriveToast({
        title: "OneDrive Client Folders Auto-Created",
        clientName: clientFullName,
        folderPath: `Documents/Abhijith App Test/${clientFullName}/`,
        endpoint: `POST https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/${clientFullName}:/children`,
        subfolders: result.subfoldersCreated.map(s => s.name),
        mode: result.mode
      });
      setTimeout(() => setOneDriveToast(null), 8000);
    } catch (err: any) {
      console.warn('[OneDrive Auto-Create Warning]', err.message);
    }
  };

  // Admin: Update Client Profile & Optional Password
  const handleAdminUpdateClient = (updatedClient: ClientProfile, newPassword?: string) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    registerOrUpdateClientAccount({
      clientId: updatedClient.id,
      name: updatedClient.name,
      email: updatedClient.email,
      password: newPassword || updatedClient.tempPassword || 'client123',
      phone: updatedClient.phone,
      status: updatedClient.accessStatus || 'active'
    });
  };

  // Admin: Revoke Client Portal Access
  const handleRevokeClientAccess = (clientId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, accessStatus: 'revoked' } : c));
    setClientAccountStatus(clientId, 'revoked');

    // Notify backend server
    const target = clients.find(c => c.id === clientId);
    if (target?.email) {
      fetch('/api/admin/clients/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target.email, revoke: true })
      }).catch(err => console.warn('Could not sync revocation with backend:', err));
    }
  };

  // Admin: Restore Client Portal Access
  const handleRestoreClientAccess = (clientId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, accessStatus: 'active' } : c));
    setClientAccountStatus(clientId, 'active');

    // Notify backend server
    const target = clients.find(c => c.id === clientId);
    if (target?.email) {
      fetch('/api/admin/clients/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target.email, revoke: false })
      }).catch(err => console.warn('Could not sync restoration with backend:', err));
    }
  };

  // Client Update Handler (Admin only)
  const handleUpdateClient = (updatedClient: ClientProfile) => {
    setClients(prev => {
      const exists = prev.some(c => c.id === updatedClient.id);
      if (exists) {
        return prev.map(c => c.id === updatedClient.id ? updatedClient : c);
      }
      const clientFullName = updatedClient.fullName || updatedClient.name;
      createClientSupabaseFolders(clientFullName).catch(err => {
        console.warn('[Supabase Storage Auto-Create Warning]', err);
      });
      return [updatedClient, ...prev];
    });
    setActiveClientId(updatedClient.id);
  };

  // Add New Client Handler (Admin only - from Onboarding wizard) + Auto-Create OneDrive Folders
  const handleSaveNewClient = async (newClient: ClientProfile) => {
    setClients(prev => [newClient, ...prev]);
    setActiveClientId(newClient.id);

    const clientFullName = newClient.fullName || newClient.name;

    // Auto-create Supabase Storage folder structure with .keep placeholder files:
    // {Client Full Name}/Contracts/.keep, etc.
    createClientSupabaseFolders(clientFullName).catch(err => {
      console.warn('[Supabase Storage Auto-Create Warning]', err);
    });

    try {
      console.log(`[OneDrive Auto-Create] Provisioning folders for: ${clientFullName}`);
      const result = await createClientOneDriveFolders(clientFullName);
      setOneDriveToast({
        title: "OneDrive Client Folders Auto-Created",
        clientName: clientFullName,
        folderPath: `Documents/Abhijith App Test/${clientFullName}/`,
        endpoint: `POST https://graph.microsoft.com/v1.0/users/augustine_a@iconicinvesting.com.au/drive/root:/Documents/Abhijith App Test/${clientFullName}:/children`,
        subfolders: result.subfoldersCreated.map(s => s.name),
        mode: result.mode
      });
      setTimeout(() => setOneDriveToast(null), 8000);
    } catch (err: any) {
      console.warn('[OneDrive Auto-Create Warning]', err.message);
    }
  };

  // Property Update Handler
  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  // Add Property Handler (Admin only)
  const handleAddProperty = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
  };

  // Document Vault Handlers
  const handleAddDocument = (newDoc: ClientDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleUpdateDocument = (updatedDoc: ClientDocument) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // BP Analysis Save Handler
  const handleSaveAnalysis = (analysis: BPReportAnalysis) => {
    setBpAnalyses(prev => {
      const exists = prev.some(a => a.id === analysis.id);
      if (exists) {
        return prev.map(a => a.id === analysis.id ? analysis : a);
      }
      return [analysis, ...prev];
    });
  };

  // Offer Update Handler
  const handleUpdateOffer = (updatedOffer: OfferNegotiation) => {
    setOffers(prev => prev.map(o => o.id === updatedOffer.id ? updatedOffer : o));
  };

  // Settlement Handover Trigger (when offer accepted)
  const handleAcceptOfferToSettlement = (offer: OfferNegotiation) => {
    setProperties(prev => prev.map(p => {
      if (p.id === offer.propertyId) {
        return {
          ...p,
          status: 'Under Contract'
        };
      }
      return p;
    }));

    const agreedPrice = offer.finalAgreedPrice || offer.currentOfferPrice;
    const existing = settlements.find(s => s.propertyId === offer.propertyId || s.id === offer.propertyId);
    let targetSettlementId = existing ? existing.id : `set-${Date.now()}`;

    if (!existing) {
      const newSettlement: SettlementRecord = {
        id: targetSettlementId,
        propertyId: offer.propertyId,
        propertyAddress: offer.propertyAddress,
        propertyImage: offer.propertyImage || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
        purchasePrice: agreedPrice,
        depositPaid: offer.depositAmount || Math.round(agreedPrice * 0.1),
        balanceDueAtSettlement: agreedPrice - (offer.depositAmount || Math.round(agreedPrice * 0.1)),
        contractDate: new Date().toISOString().split('T')[0],
        settlementDate: offer.settlementDate || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysRemaining: offer.settlementDays || 45,
        status: 'In Progress',
        conveyancer: {
          name: 'Sarah Thornton',
          firm: 'Beacon Legal & Conveyancing',
          phone: '(07) 3881 9200',
          email: 'sthornton@beaconlegal.com.au'
        },
        mortgageBroker: {
          name: 'David Hayes',
          firm: 'Apex Wealth Lending',
          phone: '0412 889 001',
          email: 'david@apexlending.com.au'
        },
        propertyManager: {
          name: 'Kylie Campbell',
          agency: 'Iconic Asset Management',
          phone: '0488 776 543',
          email: 'kylie@iconicasset.com.au'
        },
        tasks: [
          {
            id: `st-init-1`,
            title: 'Solicitor Engaged & Contract Reviewed',
            description: 'Conveyancer instructed for title searches, council encumbrances, and contract review.',
            section: 'pre-exchange',
            sectionName: 'Pre-Exchange',
            dueDate: 'Day 1',
            completed: true,
            assignee: 'Conveyancer'
          },
          {
            id: `st-init-2`,
            title: 'Pest & Building Inspection Completed',
            description: 'AS 4349.1 licensed building and timber pest inspection report executed.',
            section: 'pre-exchange',
            sectionName: 'Pre-Exchange',
            dueDate: 'Day 5',
            completed: true,
            assignee: 'Building Inspector'
          },
          {
            id: `st-init-3`,
            title: 'Finance Approved (Formal Bank Loan Offer)',
            description: 'Valuation satisfied and unconditional formal loan approval letter received.',
            section: 'pre-exchange',
            sectionName: 'Pre-Exchange',
            dueDate: 'Day 14',
            completed: true,
            assignee: 'Mortgage Broker'
          },
          {
            id: `st-init-4`,
            title: 'Deposit Paid into Agency Trust Account',
            description: 'Deposit transfer receipt issued and verified by conveyancer.',
            section: 'exchange',
            sectionName: 'Exchange',
            dueDate: 'Day 15',
            completed: true,
            assignee: 'Buyers Agent'
          },
          {
            id: `st-init-5`,
            title: 'Contracts Signed & Exchanged',
            description: 'Counterpart contracts executed, dated, and exchanged between solicitors.',
            section: 'exchange',
            sectionName: 'Exchange',
            dueDate: 'Day 15',
            completed: true,
            assignee: 'Conveyancer'
          },
          {
            id: `st-init-6`,
            title: 'Cooling-Off Period Noted & Tracked',
            description: 'Statutory cooling-off timeline monitored until contract becomes fully binding.',
            section: 'exchange',
            sectionName: 'Exchange',
            dueDate: 'Day 20',
            completed: true,
            assignee: 'Conveyancer'
          },
          {
            id: `st-init-7`,
            title: 'Final Pre-Settlement Inspection Booked',
            description: 'Physical walk-through scheduled 2-3 days before settlement to inspect fixtures and vacant possession.',
            section: 'pre-settlement',
            sectionName: 'Pre-Settlement',
            dueDate: 'Day 42',
            completed: false,
            assignee: 'Buyers Agent'
          },
          {
            id: `st-init-8`,
            title: 'Utilities Transferred & Insurance Arranged',
            description: 'Electricity, water meter readings, and Certificate of Currency policy submitted.',
            section: 'pre-settlement',
            sectionName: 'Pre-Settlement',
            dueDate: 'Day 43',
            completed: false,
            assignee: 'Client'
          },
          {
            id: `st-init-9`,
            title: 'Funds Transferred via PEXA',
            description: 'PEXA digital settlement executed and balance funds disbursed to vendor.',
            section: 'settlement-day',
            sectionName: 'Settlement Day',
            dueDate: 'Day 45',
            completed: false,
            assignee: 'Conveyancer'
          },
          {
            id: `st-init-10`,
            title: 'Keys Received & Title Confirmed',
            description: 'Keys collected from selling agent and electronic certificate of title registered.',
            section: 'settlement-day',
            sectionName: 'Settlement Day',
            dueDate: 'Day 45',
            completed: false,
            assignee: 'Buyers Agent'
          }
        ]
      };
      setSettlements(prev => [newSettlement, ...prev]);
    }
    setCurrentSection('settlement');
  };

  // Reset to initial mock datasets (Admin function)
  const handleResetData = () => {
    localStorage.clear();
    setClients(MOCK_CLIENTS);
    setActiveClientId(MOCK_CLIENTS[0].id);
    setProperties(MOCK_PROPERTIES);
    setDocuments(INITIAL_DOCUMENTS);
    setMessages(INITIAL_MESSAGES);
    setBpAnalyses(MOCK_BP_ANALYSES);
    setOffers(MOCK_OFFERS);
    setSettlements(MOCK_SETTLEMENTS);
    setCurrentSection('dashboard');
  };

  // If an invitation token is active (from URL link or manual trigger), render SetPasswordScreen
  if (activeInviteToken) {
    return (
      <SetPasswordScreen
        token={activeInviteToken}
        onSuccess={(user, token) => {
          setActiveInviteToken(null);
          try {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (e) {}
          handleLoginSuccess(user, token);
        }}
        onCancelToLogin={() => {
          setActiveInviteToken(null);
          try {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (e) {}
        }}
        onResendNewToken={(newInvite) => {
          setActiveInviteToken(newInvite.token);
        }}
      />
    );
  }

  // If user is not authenticated, display Role-Based Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onOpenInviteToken={(token) => setActiveInviteToken(token)}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans antialiased selection:bg-[#B8960C]/20 selection:text-[#1A3A5C]">
      
      {/* 1. LEFT SIDEBAR NAVIGATION (Role-specific menus) */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={handleNavigate}
        activeClient={activeClient}
        clients={clients}
        onSelectClient={(client) => {
          if (isAdmin) {
            setActiveClientId(client.id);
          }
        }}
        properties={visibleProperties}
        offers={offers}
        settlements={visibleSettlements}
        onOpenNewPropertyModal={() => setIsNewPropertyModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onResetData={handleResetData}
        currentUser={currentUser}
        onLogout={handleLogout}
        documentCount={userVisibleDocumentCount}
      />

      {/* 2. MAIN APP SHELL (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        
        {/* Top Bar with Role Badge, Active Investor Profile, and Sign Out */}
        <TopBar
          currentSection={currentSection}
          onSelectSection={handleNavigate}
          activeClient={activeClient}
          clients={clients}
          onSelectClient={(client) => {
            if (isAdmin) {
              setActiveClientId(client.id);
            }
          }}
          properties={visibleProperties}
          onOpenNewPropertyModal={() => setIsNewPropertyModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenOneDriveFolderManager={() => setIsOneDriveFolderModalOpen(true)}
        />

        {/* Dynamic Section Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          
          {/* Section 1: Dashboard (Client Personal Portal or Admin Portfolio Overview) */}
          {currentSection === 'dashboard' && (
            <ClientDashboard
              client={activeClient}
              currentUser={currentUser}
              properties={visibleProperties || []}
              bpAnalyses={bpAnalyses || []}
              offers={offers || []}
              settlements={visibleSettlements || []}
              documents={visibleDocuments}
              messages={messages}
              onNavigate={handleNavigate}
              onOpenPropertyDetail={setDetailModalProperty}
              onOpenNewPropertyModal={isAdmin ? () => setIsNewPropertyModalOpen(true) : undefined}
              onSendMessage={handleSendMessage}
              onAddDocument={handleAddDocument}
              onToggleTask={handleToggleTask}
            />
          )}

          {/* Section: Admin Control Panel & Permissions (Admin Only) */}
          {currentSection === 'admin-panel' && isAdmin && (
            <AdminControlPanel
              clients={clients}
              documents={documents}
              properties={properties}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onSelectClient={(c) => {
                setActiveClientId(c.id);
              }}
              onAddClient={handleAdminAddClient}
              onUpdateClient={handleAdminUpdateClient}
              onRevokeAccess={handleRevokeClientAccess}
              onRestoreAccess={handleRestoreClientAccess}
              onUploadDocument={handleAddDocument}
              onOpenInviteToken={(token) => setActiveInviteToken(token)}
            />
          )}

          {/* Section 2: Client Onboarding (Admin Only - Profile & Investment Mandate) */}
          {currentSection === 'onboarding' && isAdmin && (
            <ClientOnboarding
              activeClient={activeClient}
              clients={clients}
              onUpdateClient={handleUpdateClient}
              onSaveNewClient={handleSaveNewClient}
              onSelectClient={(c) => setActiveClientId(c.id)}
              onNavigate={handleNavigate}
            />
          )}

          {/* Section 3: Property Shortlisting & Pipeline (Curated for Client, Full for Admin) */}
          {currentSection === 'search' && (
            <PropertySearch
              properties={visibleProperties}
              activeClient={activeClient}
              clients={clients}
              currentUser={currentUser}
              onUpdateProperty={handleUpdateProperty}
              onOpenDetailModal={setDetailModalProperty}
              onOpenCashflowModal={setCashflowModalProperty}
              onOpenNewPropertyModal={() => setIsNewPropertyModalOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {/* Section: Client Document Vault (Contracts, B&P reports, certificates) */}
          {currentSection === 'documents' && (
            <ClientDocumentHub
              documents={documents}
              activeClient={activeClient}
              clients={clients}
              currentUser={currentUser}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onUpdateDocument={handleUpdateDocument}
            />
          )}

          {/* Section 4: Market & Suburb Research (Admin Only) */}
          {currentSection === 'market' && isAdmin && (
            <SuburbResearch
              client={activeClient}
              initialSuburb={activeClient.targetSuburbs?.[0] || 'Kallangur'}
              initialState={activeClient.targetStates?.[0] || 'QLD'}
              onNavigateToSearch={(suburbName) => {
                setCurrentSection('search');
              }}
            />
          )}

          {/* Section 5: Building & Pest Report Analyser (Admin Only) */}
          {currentSection === 'analyser' && isAdmin && (
            <ReportAnalyser
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              bpAnalyses={bpAnalyses}
              onSaveAnalysis={handleSaveAnalysis}
              onNavigate={handleNavigate}
            />
          )}

          {/* Section 6: PDF Buyer Report Generator (Admin Only) */}
          {currentSection === 'report' && isAdmin && (
            <PDFBuyerReport
              client={activeClient}
              clients={clients}
              properties={properties}
              bpAnalyses={bpAnalyses}
              onSelectClient={(c) => setActiveClientId(c.id)}
              onNavigate={handleNavigate}
            />
          )}

          {/* Section 7: Offer Tracker & Negotiation Matrix (Admin Only) */}
          {currentSection === 'negotiation' && isAdmin && (
            <OfferTracker
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              offers={offers}
              onUpdateOffer={handleUpdateOffer}
              onNavigate={handleNavigate}
              onAcceptOfferToSettlement={handleAcceptOfferToSettlement}
            />
          )}

          {/* Section 8: Settlement Checklist (Both Admin & Client) */}
          {currentSection === 'settlement' && (
            <SettlementChecklist
              settlements={visibleSettlements}
              selectedSettlementId={selectedPropertyId}
              onUpdateSettlement={(updated) => {
                if (isAdmin) {
                  setSettlements(prev => prev.map(s => s.id === updated.id ? updated : s));
                }
              }}
              onNavigate={handleNavigate}
            />
          )}

          {/* Section 9: Dedicated Client-Agent Messaging Thread */}
          {currentSection === 'messages' && (
            <ClientAgentMessaging
              client={activeClient}
              messages={messages}
              properties={visibleProperties}
              onSendMessage={handleSendMessage}
              onNavigate={handleNavigate}
              onOpenPropertyDetail={setDetailModalProperty}
            />
          )}

        </main>

        {/* Global Modals */}
        <PropertyDetailModal
          property={detailModalProperty}
          activeClient={activeClient}
          onClose={() => setDetailModalProperty(null)}
          onNavigate={handleNavigate}
        />

        <CashflowModal
          property={cashflowModalProperty}
          onClose={() => setCashflowModalProperty(null)}
        />

        {isAdmin && (
          <NewPropertyModal
            isOpen={isNewPropertyModalOpen}
            onClose={() => setIsNewPropertyModalOpen(false)}
            onAddProperty={handleAddProperty}
          />
        )}

        <OneDriveFolderManagerModal
          isOpen={isOneDriveFolderModalOpen}
          onClose={() => setIsOneDriveFolderModalOpen(false)}
          clients={clients}
        />

        {/* OneDrive Automated Folder Creation Toast */}
        {oneDriveToast && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 border border-blue-500/40 animate-slideUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0078D4] text-white flex items-center justify-center shrink-0 shadow-md">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{oneDriveToast.title}</span>
                  </h4>
                  <button 
                    onClick={() => setOneDriveToast(null)}
                    className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-blue-300 font-mono mt-1 truncate" title={oneDriveToast.folderPath}>
                  📁 {oneDriveToast.folderPath}
                </p>
                
                <div className="mt-2.5 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300 font-medium">Auto-Created 6 Subfolders:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <FolderCheck className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {oneDriveToast.subfolders.map((sub) => (
                      <span key={sub} className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 text-blue-200 rounded border border-blue-700/40">
                        {sub}
                      </span>
                    ))}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate pt-1 border-t border-slate-700/50" title={oneDriveToast.endpoint}>
                    {oneDriveToast.endpoint}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Institutional Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold text-[10px]">
                II
              </div>
              <span className="font-bold text-slate-800 font-serif-heading">ICONIC INVESTING</span>
              <span>• Australia's Premier Buyers Agency Intelligence Platform</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                JWT Secure Session ({currentUser.role.toUpperCase()})
              </span>
              <span>AS 4349.1 Compliant</span>
              <span>PEXA Integrated</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}

