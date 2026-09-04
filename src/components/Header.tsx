import React from 'react';
import { 
  Building2, 
  Search, 
  FileText, 
  TrendingUp, 
  CheckSquare, 
  UserCheck, 
  Sparkles,
  ChevronDown,
  PhoneCall,
  ShieldCheck,
  Plus,
  MapPin,
  BarChart3
} from 'lucide-react';
import { AppSection, ClientProfile, Property } from '../types';

interface HeaderProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  clients: ClientProfile[];
  activeClient: ClientProfile;
  onSelectClient: (client: ClientProfile) => void;
  properties: Property[];
  onOpenNewPropertyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onSelectSection,
  clients = [],
  activeClient,
  onSelectClient,
  properties = [],
  onOpenNewPropertyModal
}) => {
  const [clientDropdownOpen, setClientDropdownOpen] = React.useState(false);

  const safeProperties = properties || [];
  const safeClients = clients || [];
  const currentClient = activeClient || safeClients[0] || {
    id: 'c1',
    name: 'Investor Client',
    budgetMax: 1000000,
    primaryGoal: 'High Capital Growth'
  };

  const shortlistedCount = safeProperties.filter(p => p && (p.status === 'Shortlisted' || p.status === 'Under Review' || p.status === 'Due Diligence')).length;
  const underContractCount = safeProperties.filter(p => p && (p.status === 'Under Contract' || p.status === 'Offer Active' || p.status === 'Offer Made')).length;

  const navItems: { id: AppSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Client Dashboard', icon: TrendingUp },
    { id: 'onboarding', label: 'Client Onboarding', icon: UserCheck },
    { id: 'search', label: 'Property Search', icon: Search },
    { id: 'market', label: 'Market & Suburb Report', icon: MapPin },
    { id: 'analyser', label: 'B&P Report Analyser', icon: ShieldCheck },
    { id: 'report', label: 'PDF Buyer Report', icon: FileText },
    { id: 'negotiation', label: 'Offer & Negotiation', icon: Sparkles },
    { id: 'settlement', label: 'Settlement Checklist', icon: CheckSquare },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1A3A5C] text-white shadow-xl border-b border-[#B8960C]/30">
      {/* Top Banner / Agency Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-white/10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#B8960C] to-[#9E8009] flex items-center justify-center shadow-md border border-[#F7F1D8]/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-heading font-bold text-xl tracking-wider text-white">
                  ICONIC <span className="text-[#B8960C]">INVESTING</span>
                </span>
                <span className="hidden md:inline-flex text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#B8960C]/20 text-[#F7F1D8] border border-[#B8960C]/40">
                  Buyers Agency Portal
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Exclusive Real Estate Advisory & Property Portfolio Acquisitions
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Active Client Selector Dropdown */}
            <div className="relative">
              <button
                id="header-client-selector-btn"
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                className="flex items-center gap-2 bg-[#0E2238] hover:bg-[#142e4c] text-white px-3 py-1.5 rounded-lg border border-slate-700 transition text-sm text-left"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div className="hidden sm:block">
                  <div className="text-[11px] text-slate-400 font-medium leading-none">Active Investor</div>
                  <div className="text-xs font-semibold text-amber-200 truncate max-w-[140px]">{currentClient.name}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {clientDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Active Client
                  </div>
                  {safeClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectClient(c);
                        setClientDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-start gap-2.5 transition ${
                        c.id === currentClient.id ? 'bg-amber-50/70 border-l-4 border-[#B8960C]' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">Budget: ${(c.budgetMax / 1000).toFixed(0)}k • {c.primaryGoal}</p>
                      </div>
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSelectSection('onboarding');
                        setClientDropdownOpen(false);
                      }}
                      className="w-full text-center text-xs font-semibold text-[#1A3A5C] hover:text-[#B8960C] py-1 transition"
                    >
                      + Onboard New Investor
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Property Button */}
            <button
              id="header-add-property-btn"
              onClick={onOpenNewPropertyModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#B8960C] to-[#9E8009] hover:from-[#9E8009] hover:to-[#856c07] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Property</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#B8960C] text-white shadow-md font-semibold'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-300/80'}`} />
                <span>{item.label}</span>
                {item.id === 'search' && shortlistedCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white text-[#B8960C]' : 'bg-[#B8960C] text-white'}`}>
                    {shortlistedCount}
                  </span>
                )}
                {item.id === 'settlement' && underContractCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                    {underContractCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
