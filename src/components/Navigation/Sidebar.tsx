import React from 'react';
import { 
  Search, 
  FileText, 
  TrendingUp, 
  CheckSquare, 
  UserCheck, 
  Sparkles,
  ShieldCheck,
  Plus,
  MapPin,
  X,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Database,
  FolderOpen,
  LogOut,
  User,
  Lock,
  Users,
  KeyRound,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { AppSection, ClientProfile, Property, OfferNegotiation, SettlementRecord, AuthUser } from '../../types';

interface SidebarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  activeClient: ClientProfile;
  clients: ClientProfile[];
  onSelectClient: (client: ClientProfile) => void;
  properties: Property[];
  offers: OfferNegotiation[];
  settlements: SettlementRecord[];
  onOpenNewPropertyModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onResetData: () => void;
  currentUser: AuthUser;
  onLogout: () => void;
  documentCount?: number;
  onOpenChangePassword?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  activeClient,
  clients = [],
  onSelectClient,
  properties = [],
  offers = [],
  settlements = [],
  onOpenNewPropertyModal,
  isMobileOpen,
  onCloseMobile,
  onResetData,
  currentUser,
  onLogout,
  documentCount = 0,
  onOpenChangePassword
}) => {
  // Counters for dynamic badges
  const shortlistedCount = properties.filter(
    p => p.status === 'Shortlisted' || p.status === 'Under Review' || p.status === 'Due Diligence'
  ).length;

  const activeOffersCount = offers.filter(
    o => o.status === 'Submitted' || o.status === 'Counter-Offered' || o.status === 'Negotiating'
  ).length;

  const inProgressSettlementsCount = settlements.filter(
    s => s.status === 'In Progress'
  ).length;

  const isAdmin = currentUser.role === 'admin';

  // Navigation Items defined based on Role
  const adminNavItems: {
    id: AppSection;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Client Dashboard',
      description: 'Portfolio overview & metrics',
      icon: TrendingUp
    },
    {
      id: 'admin-panel',
      label: 'Admin Control Panel',
      description: 'Logins, permissions & client directory',
      icon: Users,
      badge: `${clients.length} Clients`,
      badgeColor: 'bg-[#B8960C] text-white font-semibold'
    },
    {
      id: 'admin-management',
      label: 'Admin Management',
      description: 'Invite admins & user_roles RBAC',
      icon: ShieldCheck,
      badge: 'RBAC',
      badgeColor: 'bg-emerald-600 text-white font-semibold'
    },
    {
      id: 'onboarding',
      label: 'Client Onboarding',
      description: 'Profile & strategy mandate',
      icon: UserCheck,
      badge: clients.length,
      badgeColor: 'bg-slate-700 text-slate-200'
    },
    {
      id: 'search',
      label: 'Property Shortlisting',
      description: 'Search, cashflow & pipeline',
      icon: Search,
      badge: shortlistedCount,
      badgeColor: 'bg-[#B8960C] text-white'
    },
    {
      id: 'documents',
      label: 'Client Document Hub',
      description: 'Contracts, B&P reports & vault',
      icon: FolderOpen,
      badge: documentCount > 0 ? documentCount : undefined,
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 'analyser',
      label: 'B&P Report Analyser',
      description: 'AI defect & risk extraction',
      icon: ShieldCheck,
      badge: 'AI',
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'market',
      label: 'Market & Suburb Report',
      description: 'Demographics, yield & growth',
      icon: MapPin
    },
    {
      id: 'report',
      label: 'PDF Buyer Report',
      description: 'Client acquisition dossier',
      icon: FileText
    },
    {
      id: 'negotiation',
      label: 'Offer Tracker',
      description: 'Negotiation & terms matrix',
      icon: Sparkles,
      badge: activeOffersCount > 0 ? activeOffersCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold'
    },
    {
      id: 'settlement',
      label: 'Settlement Checklist',
      description: 'Post-contract PEXA workflow',
      icon: CheckSquare,
      badge: inProgressSettlementsCount > 0 ? inProgressSettlementsCount : undefined,
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      id: 'messages',
      label: 'Client Message Thread',
      description: 'Advocate direct messages',
      icon: MessageSquare,
      badge: 'Active',
      badgeColor: 'bg-emerald-600 text-white font-semibold'
    },
  ];

  // Client Navigation: strictly restricted to their own shortlist, documents, settlement & message thread
  const clientNavItems: {
    id: AppSection;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Personal Dashboard',
      description: 'Overview of your purchase journey',
      icon: LayoutDashboard
    },
    {
      id: 'search',
      label: 'My Property Shortlist',
      description: 'Handpicked properties & yield',
      icon: Search,
      badge: shortlistedCount,
      badgeColor: 'bg-[#B8960C] text-white'
    },
    {
      id: 'documents',
      label: 'My Uploaded Documents',
      description: 'Contracts, B&P reports & ID vault',
      icon: FolderOpen,
      badge: documentCount > 0 ? documentCount : undefined,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'settlement',
      label: 'Settlement Progress',
      description: 'Checklist progress & PEXA timeline',
      icon: CheckSquare,
      badge: inProgressSettlementsCount > 0 ? inProgressSettlementsCount : undefined,
      badgeColor: 'bg-blue-500 text-white'
    },
    {
      id: 'messages',
      label: 'Agent Message Thread',
      description: 'Direct line with your advocate',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-emerald-600 text-white font-bold'
    }
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleNavClick = (section: AppSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-left-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0E2238] text-white border-r border-[#B8960C]/20 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } print:hidden`}
      >
        {/* Top Header & Brand Identity */}
        <div className="p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <img
                id="sidebar-company-logo"
                src="https://jrpfkuwafvjkeelzzbhj.supabase.co/storage/v1/object/public/client-documents/assets/iconic_logo.png?v=2"
                alt="Iconic Investing"
                style={{ maxWidth: '160px', height: 'auto' }}
                className="max-w-[160px] h-auto object-contain rounded-md shadow-xs"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = '/assets/iconic_logo.png';
                  }
                }}
              />
              <div className="text-[10px] tracking-widest uppercase text-amber-200/90 font-semibold font-sans">
                Buyers Agency Portal
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Status & Active Profile Card in Sidebar */}
          <div className="mt-4 bg-[#1A3A5C]/80 p-3 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                {isAdmin ? 'Advocate Portal' : 'Investor Account'}
              </span>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${isAdmin ? 'bg-[#B8960C] text-slate-950' : 'bg-emerald-400 text-slate-950'}`}>
                {currentUser.role}
              </span>
            </div>
            <div className="font-bold text-white text-xs truncate">
              {isAdmin 
                ? (activeClient?.fullName || activeClient?.name || 'Marcus & Elena Vance')
                : currentUser.name}
            </div>
            <div className="text-[10px] text-slate-300 truncate mt-0.5 flex items-center justify-between">
              <span>Goal: <strong className="text-amber-200">{activeClient?.primaryGoal || 'High Capital Growth'}</strong></span>
              <span className="font-mono text-amber-300 font-bold">{formatCurrency(activeClient?.budgetMax || 950000)}</span>
            </div>
          </div>
        </div>

        {/* Middle Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{isAdmin ? 'Advocate Modules' : 'Investor Menu'}</span>
            <span className="text-[9px] text-amber-300/80 font-normal">
              {isAdmin ? 'Full Edit' : 'View Only'}
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#B8960C] to-[#9E8009] text-white font-bold shadow-md shadow-amber-950/40 border border-amber-300/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#1A3A5C] text-amber-200 group-hover:text-white group-hover:bg-[#1E436A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs truncate">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-amber-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Counter or Tag Badge */}
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      item.badgeColor || 'bg-slate-700 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions & Persistence Info */}
        <div className="p-4 border-t border-white/10 shrink-0 space-y-3 bg-[#0B1A2C]">
          
          {/* Admin Quick Add Property Button */}
          {isAdmin ? (
            <button
              id="sidebar-add-property-btn"
              onClick={() => {
                onOpenNewPropertyModal();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#1A3A5C] hover:bg-[#214a75] text-amber-200 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold border border-[#B8960C]/30 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#B8960C]" />
              <span>+ Add New Property</span>
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#1A3A5C]/50 border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Verified Client Session (Read-Only Portal)</span>
            </div>
          )}

          {/* Change Password button (Available to all logged-in users) */}
          {onOpenChangePassword && (
            <button
              id="sidebar-change-password-btn"
              onClick={() => {
                onOpenChangePassword();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#1A3A5C]/90 hover:bg-[#224b75] text-amber-200 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-[#B8960C]/30 transition cursor-pointer shadow-xs"
              title="Change your account password"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
            </button>
          )}

          {/* User Sign Out button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 px-3 py-2 rounded-xl text-xs font-medium border border-white/5 hover:border-rose-400/30 transition cursor-pointer"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({currentUser.name.split(' ')[0]})</span>
          </button>

          {/* Data Storage Sync Status & Reset */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>JWT Encrypted</span>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all demo data (clients, properties, offers, B&P reports) to initial state?')) {
                    onResetData();
                  }
                }}
                className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                title="Reset all demo data to default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
