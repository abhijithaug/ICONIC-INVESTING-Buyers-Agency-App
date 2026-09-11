import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  User, 
  DollarSign, 
  ChevronDown, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Search, 
  ShieldCheck, 
  FileText, 
  TrendingUp,
  Award,
  Wallet,
  LogOut,
  FolderOpen,
  Folder,
  KeyRound
} from 'lucide-react';
import { AppSection, ClientProfile, Property, AuthUser } from '../../types';

interface TopBarProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  activeClient: ClientProfile;
  clients: ClientProfile[];
  onSelectClient: (client: ClientProfile) => void;
  properties: Property[];
  onOpenNewPropertyModal: () => void;
  onToggleMobileSidebar: () => void;
  currentUser: AuthUser;
  onLogout: () => void;
  onOpenOneDriveFolderManager?: () => void;
  onOpenChangePassword?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentSection,
  onSelectSection,
  activeClient,
  clients = [],
  onSelectClient,
  properties = [],
  onOpenNewPropertyModal,
  onToggleMobileSidebar,
  currentUser,
  onLogout,
  onOpenOneDriveFolderManager,
  onOpenChangePassword
}) => {
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === 'admin';

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setClientDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const sectionTitles: Record<AppSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: isAdmin ? 'Client Acquisition Dashboard' : 'Personal Client Dashboard',
      subtitle: isAdmin ? 'Real-time pipeline & portfolio underwriting metrics' : 'Overview of your property shortlist, uploaded documents, settlement & advocate messages'
    },
    'admin-panel': {
      title: 'Admin Control Panel & Client Permissions',
      subtitle: 'Manage client logins, credentials, documents & access rights'
    },
    'admin-management': {
      title: 'Admin Management & Team Privileges',
      subtitle: 'Invite new administrators, manage user_roles & access control'
    },
    onboarding: {
      title: 'Client Brief & Investment Mandate',
      subtitle: 'Risk appetite, target criteria & buying strategy'
    },
    search: {
      title: isAdmin ? 'Property Shortlisting & Deal Pipeline' : 'My Curated Property Shortlist',
      subtitle: isAdmin ? 'Cashflow modelling, off-market assets & yields' : 'Handpicked investment assets vetted by your buyers advocate'
    },
    documents: {
      title: isAdmin ? 'Client Document Vault & Audits' : 'My Uploaded Documents & Contracts',
      subtitle: isAdmin ? 'Executed contracts, B&P reports, and uploaded certificates' : 'Official contracts of sale, verified B&P reports & ID verification'
    },
    market: {
      title: 'Market & Suburb Research Engine',
      subtitle: 'Live demographic, growth & rental data'
    },
    analyser: {
      title: 'Building & Pest Report Analyser',
      subtitle: 'AI defect extraction & negotiation credits'
    },
    report: {
      title: 'PDF Buyer Report Generator',
      subtitle: 'Iconic Investing official client acquisition dossier'
    },
    negotiation: {
      title: 'Offer Tracker & Negotiation Matrix',
      subtitle: 'Price anchors, terms & seller leverage tactics'
    },
    settlement: {
      title: isAdmin ? 'Settlement & Post-Contract Checklist' : 'My Settlement Checklist Progress',
      subtitle: isAdmin ? 'Milestones, conveyancer coordination & PEXA timeline' : 'Live PEXA workflow, upcoming conveyancing tasks & settlement countdown'
    },
    messages: {
      title: isAdmin ? 'Client Communication Stream' : 'Message Thread with Your Buyers Advocate',
      subtitle: isAdmin ? 'Direct advisory message stream with client' : 'Direct advisory line with your licensed buyers advocate'
    }
  };

  const currentInfo = sectionTitles[currentSection] || {
    title: 'Iconic Investing Client App',
    subtitle: 'Real estate investment advisory'
  };

  const safeClient = activeClient || clients[0] || {
    id: 'c1',
    name: currentUser.name || 'Marcus & Elena Vance',
    budgetMin: 750000,
    budgetMax: 950000,
    primaryGoal: 'High Capital Growth'
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1A3A5C] text-white shadow-lg border-b border-[#B8960C]/30 print:hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Mobile Menu Trigger & Section Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Menu */}
            <button
              id="topbar-mobile-menu-btn"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl bg-[#0E2238] hover:bg-[#122b46] text-amber-200 hover:text-white border border-slate-700 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current Section Title Display */}
            <div className="hidden sm:block truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold font-serif-heading text-white tracking-tight leading-tight truncate">
                  {currentInfo.title}
                </h1>
                
                {/* ROLE BADGE in Top Bar */}
                {isAdmin ? (
                  <span
                    id="topbar-role-badge-admin"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#B8960C] to-[#9E8009] text-slate-950 font-extrabold text-[10px] tracking-wider shadow-sm border border-amber-300/40 uppercase"
                  >
                    <ShieldCheck className="w-3 h-3 text-slate-950 stroke-[2.5]" />
                    <span>ADMIN • ADVOCATE</span>
                  </span>
                ) : (
                  <span
                    id="topbar-role-badge-client"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-[10px] tracking-wider shadow-sm border border-emerald-300/40 uppercase"
                  >
                    <User className="w-3 h-3 text-white stroke-[2.5]" />
                    <span>CLIENT • INVESTOR</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 truncate hidden md:block">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right Area: Role Badge (Mobile), Active Client Card, Admin Action, and Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile-only compact role pill */}
            <div className="sm:hidden">
              {isAdmin ? (
                <span className="px-2 py-0.5 rounded bg-[#B8960C] text-slate-950 font-bold text-[10px]">
                  ADMIN
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px]">
                  CLIENT
                </span>
              )}
            </div>

            {/* 1. Active Client Card (with switcher for Admin, view-only for Client) */}
            <div className="bg-gradient-to-r from-[#0E2238] to-[#122b46] px-3 py-1.5 rounded-xl border border-[#B8960C]/40 shadow-inner flex items-center gap-2.5">
              
              {/* Client Avatar / Initial */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#B8960C] to-[#9E8009] flex items-center justify-center text-white font-bold text-[11px] shadow-xs border border-amber-300/30 shrink-0">
                {(safeClient.fullName || safeClient.name).slice(0, 2).toUpperCase()}
              </div>

              {/* Client Name & Total Budget Text */}
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[150px]">
                    {isAdmin ? (safeClient.fullName || safeClient.name) : currentUser.name}
                  </span>
                  <span className="hidden xl:inline-flex text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30">
                    {safeClient.primaryGoal}
                  </span>
                </div>

                {/* Total Budget Prominent Value */}
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-slate-300 font-medium">Budget:</span>
                  <span className="font-mono font-bold text-[#F4D068] tracking-tight">
                    {formatCurrency(safeClient.budgetMax || 950000)}
                  </span>
                </div>
              </div>

              {/* Client Dropdown Trigger - ONLY SHOWN TO ADMIN! */}
              {isAdmin ? (
                <div className="relative pl-1" ref={dropdownRef}>
                  <button
                    id="topbar-client-dropdown-trigger"
                    onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
                    title="Switch Active Investor (Admin Only)"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${clientDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {clientDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#0E2238] rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 border-b border-slate-700/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                        <span>Switch Active Investor</span>
                        <span className="text-amber-300">{clients.length} Profiles</span>
                      </div>

                      <div className="max-h-60 overflow-y-auto py-1">
                        {clients.map((c) => {
                          const isSelected = c.id === safeClient.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                onSelectClient(c);
                                setClientDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#1A3A5C] text-amber-200 font-bold border-l-2 border-[#B8960C]'
                                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="truncate">
                                <div className="truncate">{c.fullName || c.name}</div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                  Budget: {formatCurrency(c.budgetMax)} • {c.primaryGoal}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 mt-1 border-t border-slate-700/80 px-2">
                        <button
                          onClick={() => {
                            setClientDropdownOpen(false);
                            onSelectSection('onboarding');
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-amber-300 hover:text-white bg-[#1A3A5C] hover:bg-[#234b75] rounded-lg font-semibold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ New Client Onboarding</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* In Client view: small verified lock icon indicating private locked dossier */
                <span className="text-emerald-400 text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-medium border border-emerald-500/30">
                  Private
                </span>
              )}

            </div>

            {/* OneDrive Folders in Abhijith App Test */}
            {onOpenOneDriveFolderManager && (
              <button
                type="button"
                onClick={onOpenOneDriveFolderManager}
                className="flex items-center gap-1.5 bg-[#0078D4] hover:bg-[#006cbd] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-blue-950/20 transition transform active:scale-95 cursor-pointer border border-blue-400/30 whitespace-nowrap"
                title="Create & Manage Folders in Documents/Abhijith App Test on OneDrive & SharePoint"
              >
                <Folder className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abhijith App Test Folders</span>
                <span className="sm:hidden">Folders</span>
              </button>
            )}

            {/* 2. Admin Action: Add Property Button (Hidden from Client) */}
            {isAdmin && (
              <button
                id="topbar-add-property-btn"
                onClick={onOpenNewPropertyModal}
                className="hidden md:flex items-center gap-1.5 bg-[#B8960C] hover:bg-[#9E8009] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-amber-950/30 transition transform active:scale-95 cursor-pointer border border-amber-300/30 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Property</span>
              </button>
            )}

            {/* Change Password Button in TopBar (Available to all logged-in users) */}
            {onOpenChangePassword && (
              <button
                id="topbar-change-password-btn"
                type="button"
                onClick={onOpenChangePassword}
                className="flex items-center gap-1.5 bg-[#1A3A5C] hover:bg-[#234b75] text-amber-200 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-[#B8960C]/40 shadow-xs transition transform active:scale-95 cursor-pointer whitespace-nowrap"
                title="Change your account password"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Change Password</span>
              </button>
            )}

            {/* Profile Menu Dropdown (Available to all logged-in users) */}
            <div className="relative" ref={profileMenuRef}>
              <button
                id="topbar-profile-menu-trigger"
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 transition cursor-pointer"
                title="Profile Menu & Account Security"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#B8960C] to-[#806708] flex items-center justify-center text-white font-bold text-[10px] shadow-xs">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0E2238] rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                  <div className="px-3.5 py-2 border-b border-slate-700/80">
                    <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1A3A5C] text-amber-300 border border-amber-400/30">
                      {currentUser.role === 'admin' ? 'Buyers Advocate (Admin)' : 'Investor Client'}
                    </span>
                  </div>

                  <div className="py-1">
                    {onOpenChangePassword && (
                      <button
                        id="topbar-profile-change-password-option"
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onOpenChangePassword();
                        }}
                        className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-slate-200 hover:bg-[#1A3A5C] hover:text-amber-200 transition cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-white">Change Password</div>
                          <div className="text-[10px] text-slate-400">Update Supabase login credentials</div>
                        </div>
                      </button>
                    )}

                    <button
                      id="topbar-profile-logout-option"
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. User Sign Out Button */}
            <button
              id="topbar-signout-btn"
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-white/10 hover:border-rose-400/40 transition cursor-pointer"
              title={`Sign out (${currentUser.email})`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

