import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  Plus, 
  Check, 
  Star, 
  Eye, 
  Calculator,
  ArrowUpDown,
  Layers,
  ChevronRight,
  ShieldAlert,
  Clock,
  Bed,
  Bath,
  Car,
  Maximize2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Tag,
  Share2,
  Calendar,
  UserCheck,
  Award,
  Target
} from 'lucide-react';
import { Property, PropertyType, PropertyStatus, ShortlistTier, AppSection, ClientProfile, AuthUser } from '../../types';

interface PropertySearchProps {
  properties: Property[];
  activeClient?: ClientProfile;
  clients?: ClientProfile[];
  currentUser?: AuthUser;
  onUpdateProperty: (property: Property) => void;
  onOpenDetailModal: (property: Property) => void;
  onOpenCashflowModal: (property: Property) => void;
  onOpenNewPropertyModal: () => void;
  onNavigate: (section: AppSection, propertyId?: string) => void;
}

// Status Badges Config
export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Shortlisted': {
    label: 'Shortlisted',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: Star
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: Clock
  },
  'Offer Made': {
    label: 'Offer Made',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: Sparkles
  },
  'Passed': {
    label: 'Passed',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-300',
    icon: XCircle
  },
  'Due Diligence': {
    label: 'Due Diligence',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    icon: FileText
  },
  'Offer Active': {
    label: 'Offer Active',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: Sparkles
  },
  'Under Contract': {
    label: 'Under Contract',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-300',
    icon: CheckCircle2
  },
  'Discovered': {
    label: 'Discovered',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: HelpCircle
  },
  'Settled': {
    label: 'Settled',
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: CheckCircle2
  },
  'Archived': {
    label: 'Archived',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-200',
    icon: XCircle
  }
};

export const PropertySearch: React.FC<PropertySearchProps> = ({
  properties = [],
  activeClient,
  clients = [],
  currentUser,
  onUpdateProperty,
  onOpenDetailModal,
  onOpenCashflowModal,
  onOpenNewPropertyModal,
  onNavigate
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [filterOnlyClientBudget, setFilterOnlyClientBudget] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 2500000 });
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'suburb' | 'status' | 'yield' | 'score' | 'dom'>('price_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Note edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentNoteText, setCurrentNoteText] = useState<string>('');

  const safeProperties = properties || [];

  // Extract distinct suburbs for filtering
  const uniqueSuburbs = useMemo(() => {
    const subs = Array.from(new Set(safeProperties.map(p => p.suburb).filter(Boolean)));
    return subs.sort();
  }, [safeProperties]);

  // Handle note edit save
  const handleSaveNote = (prop: Property) => {
    onUpdateProperty({
      ...prop,
      notes: currentNoteText
    });
    setEditingNoteId(null);
  };

  // Handle status quick toggle
  const handleStatusChange = (prop: Property, newStatus: PropertyStatus) => {
    onUpdateProperty({
      ...prop,
      status: newStatus
    });
  };

  // Client budget helper
  const clientMaxBudget = activeClient?.budgetMax || 950000;
  const clientTargetSuburbs = activeClient?.targetSuburbs || activeClient?.preferredSuburbs || [];

  // Filter properties
  const filteredProperties = useMemo(() => {
    return safeProperties.filter((p) => {
      if (!p) return false;

      // Text search matching address, suburb, or notes
      const matchesSearch = 
        (p.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.suburb || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.postcode || '').includes(searchTerm);

      // Suburb filter
      const matchesSuburb = selectedSuburb === 'ALL' || p.suburb.toLowerCase() === selectedSuburb.toLowerCase();

      // Status filter
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      // Type filter
      const matchesType = selectedType === 'ALL' || p.propertyType === selectedType;

      // Price filter
      const matchesPrice = p.priceGuide >= priceRange.min && p.priceGuide <= priceRange.max;

      // Optional: Client budget filter
      const matchesClientBudget = !filterOnlyClientBudget || p.priceGuide <= clientMaxBudget;

      return matchesSearch && matchesSuburb && matchesStatus && matchesType && matchesPrice && matchesClientBudget;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.priceGuide - b.priceGuide;
        case 'price_desc':
          return b.priceGuide - a.priceGuide;
        case 'suburb':
          return a.suburb.localeCompare(b.suburb);
        case 'yield':
          return b.grossYield - a.grossYield;
        case 'score':
          return (b.desirabilityScore || 0) - (a.desirabilityScore || 0);
        case 'dom':
          return (a.daysOnMarket || 0) - (b.daysOnMarket || 0);
        default:
          return 0;
      }
    });
  }, [safeProperties, searchTerm, selectedSuburb, selectedStatus, selectedType, priceRange, sortBy, filterOnlyClientBudget, clientMaxBudget]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper to check if property is a target suburb match
  const isTargetSuburb = (suburb: string) => {
    if (!clientTargetSuburbs || clientTargetSuburbs.length === 0) return false;
    return clientTargetSuburbs.some(s => 
      s.toLowerCase().includes(suburb.toLowerCase()) || suburb.toLowerCase().includes(s.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & CLIENT LINKAGE BANNER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading tracking-tight">
                {isAdmin ? 'Property Shortlisting & Deal Pipeline' : 'My Curated Property Shortlist'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                {isAdmin 
                  ? 'Off-market sourcing, cashflow underwriting, and AS 4349.1 defect screening' 
                  : 'Handpicked investment assets vetted exclusively for your portfolio criteria'}
              </p>
            </div>
          </div>

          {/* Active Client Mandate Link Pill */}
          {activeClient && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1A3A5C]/10 border border-[#1A3A5C]/20 text-[#1A3A5C] font-medium">
                <UserCheck className="w-3.5 h-3.5 text-[#B8960C]" />
                <span>{isAdmin ? 'Underwriting for:' : 'Client Mandate:'} <strong>{activeClient.fullName || activeClient.name}</strong></span>
                <span className="text-slate-400">|</span>
                <span className="text-[#B8960C] font-mono font-bold">Max Budget: {formatCurrency(activeClient.budgetMax)}</span>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  id="search-view-client-profile-btn"
                  onClick={() => onNavigate('onboarding')}
                  className="text-xs font-bold text-[#B8960C] hover:text-[#9E8009] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>View Client Profile & Mandate</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Add New Property (Admin Only) */}
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="search-add-property-btn"
              onClick={onOpenNewPropertyModal}
              className="flex items-center gap-2 bg-[#B8960C] hover:bg-[#9E8009] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-amber-950/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add New Property</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. ADVANCED FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        
        {/* Row 1: Search text + Suburb filter + Status filter + Type filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search by Text */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search address, suburb, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]"
            />
          </div>

          {/* Suburb Filter */}
          <div>
            <select
              value={selectedSuburb}
              onChange={(e) => setSelectedSuburb(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A5C] cursor-pointer"
            >
              <option value="ALL">All Suburbs ({safeProperties.length})</option>
              {uniqueSuburbs.map((sub) => (
                <option key={sub} value={sub}>
                  {sub} {isTargetSuburb(sub) ? '🎯 (Target)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A5C] cursor-pointer"
            >
              <option value="ALL">All Status Badges</option>
              <option value="Shortlisted">⭐️ Shortlisted</option>
              <option value="Under Review">⏱️ Under Review</option>
              <option value="Due Diligence">📋 Due Diligence</option>
              <option value="Offer Made">✨ Offer Made</option>
              <option value="Under Contract">🤝 Under Contract</option>
              <option value="Settled">🎉 Settled</option>
              <option value="Passed">🚫 Passed</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3A5C] cursor-pointer"
            >
              <option value="ALL">All Property Types</option>
              <option value="Freestanding House">Freestanding House</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Duplex / Dual Key">Duplex / Dual Key</option>
              <option value="House & Land">House & Land</option>
              <option value="Commercial / Industrial">Commercial / Industrial</option>
            </select>
          </div>

        </div>

        {/* Row 2: Sort + View Toggle + Client Budget Quick Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-[#1A3A5C] cursor-pointer"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="yield">Gross Yield: High to Low</option>
              <option value="score">Desirability Score</option>
              <option value="dom">Days on Market</option>
              <option value="suburb">Suburb Name</option>
            </select>

            {/* Quick Match Client Budget Checkbox Toggle */}
            {activeClient && (
              <button
                type="button"
                onClick={() => setFilterOnlyClientBudget(!filterOnlyClientBudget)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  filterOnlyClientBudget
                    ? 'bg-[#1A3A5C] text-white border-[#1A3A5C]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-[#B8960C]" />
                <span>Only within {activeClient.name.split(' ')[0]}&apos;s Budget (≤ {formatCurrency(activeClient.budgetMax)})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Showing <strong>{filteredProperties.length}</strong> properties
            </span>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#1A3A5C]' : 'text-slate-500'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-[#1A3A5C]' : 'text-slate-500'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NO RESULTS EMPTY STATE */}
      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-[#B8960C] flex items-center justify-center mx-auto text-xl font-bold">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching properties found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria, clearing the suburb filter, or switching the status badge from &quot;{selectedStatus}&quot; back to &quot;All&quot;.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSuburb('ALL');
              setSelectedStatus('ALL');
              setSelectedType('ALL');
              setFilterOnlyClientBudget(false);
            }}
            className="px-4 py-2 bg-[#1A3A5C] text-white text-xs font-semibold rounded-xl hover:bg-[#254f7a] transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* VIEW: GRID / CARD MODE */}
      {viewMode === 'grid' && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const statusStyle = STATUS_CONFIG[property.status] || STATUS_CONFIG['Shortlisted'];
            const StatusIcon = statusStyle.icon;
            const isEditingThisNote = editingNoteId === property.id;
            const isWithinBudget = property.priceGuide <= clientMaxBudget;
            const budgetDelta = property.priceGuide - clientMaxBudget;
            const matchesSuburb = isTargetSuburb(property.suburb);

            return (
              <div
                key={property.id}
                id={`property-card-${property.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-[#B8960C]/60 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Property Image Header with Asking Price & Badges */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={property.imageUrl}
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Left Badges: Status & Off-market */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {/* Interactive Status Badge with Dropdown Indicator */}
                      <div className="relative">
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusChange(property, e.target.value as PropertyStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-md border cursor-pointer appearance-none pr-6 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          title="Click to update status"
                        >
                          <option value="Shortlisted">⭐️ Shortlisted</option>
                          <option value="Under Review">⏱️ Under Review</option>
                          <option value="Offer Made">✨ Offer Made</option>
                          <option value="Passed">🚫 Passed</option>
                          <option value="Due Diligence">📋 Due Diligence</option>
                          <option value="Under Contract">🤝 Under Contract</option>
                          <option value="Discovered">🔍 Discovered</option>
                        </select>
                        <ChevronRight className="w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none opacity-60" />
                      </div>

                      {property.isOffMarket && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#B8960C] text-white text-[10px] font-bold tracking-wider uppercase shadow-md w-max">
                          OFF-MARKET
                        </span>
                      )}
                    </div>

                    {/* Right Badges: Days on Market & Score */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
                      {/* Days on Market */}
                      <div className="bg-slate-900/85 text-white backdrop-blur px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow">
                        <Clock className="w-3 h-3 text-[#B8960C]" />
                        <span>{property.daysOnMarket || 12}d on market</span>
                      </div>

                      {/* Score */}
                      <div className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-lg text-xs font-bold text-slate-900 shadow font-mono">
                        <span className="text-[#B8960C]">★</span> {property.desirabilityScore || 88}/100
                      </div>
                    </div>

                    {/* Bottom Image Overlay: Price Guide */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3 pt-6 flex items-baseline justify-between text-white">
                      <div>
                        <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Guide Price</div>
                        <div className="text-lg font-bold font-mono text-amber-300">
                          ${property.priceGuide.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-emerald-300 font-medium uppercase">Gross Yield</div>
                        <div className="text-sm font-bold font-mono text-emerald-400">
                          {property.grossYield}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Card Content */}
                  <div className="p-4 space-y-3">
                    
                    {/* Address & Suburb */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm font-serif-heading line-clamp-1 group-hover:text-[#1A3A5C] transition">
                        {property.address}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#B8960C] shrink-0" />
                        <span>{property.suburb}, {property.state} {property.postcode}</span>
                      </div>
                    </div>

                    {/* PROMINENT CLIENT MATCHING BADGE */}
                    {activeClient && (
                      <div 
                        onClick={() => onNavigate('onboarding')}
                        className="bg-slate-50 hover:bg-amber-50/70 p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 transition cursor-pointer space-y-1 group/client"
                        title="Click to view/edit this client profile"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-[#1A3A5C]" />
                            <span>Client: <strong>{activeClient.fullName || activeClient.name}</strong></span>
                          </span>
                          <span className="text-[#B8960C] group-hover/client:translate-x-0.5 transition font-bold text-[10px] flex items-center">
                            Brief <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {isWithinBudget ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Within Budget
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                              +${(budgetDelta / 1000).toFixed(0)}k above target
                            </span>
                          )}

                          {matchesSuburb && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold flex items-center gap-0.5">
                              <Target className="w-2.5 h-2.5 text-[#B8960C]" /> Target Suburb
                            </span>
                          )}

                          <span className="text-slate-400 text-[9px] ml-auto">
                            Goal: {activeClient.primaryGoal}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Property Specs Grid: Beds / Baths / Cars / Land Size */}
                    <div className="grid grid-cols-4 gap-1.5 py-2 bg-slate-50 rounded-xl px-2 border border-slate-100 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-slate-700 text-xs font-bold">
                          <Bed className="w-3.5 h-3.5 text-[#1A3A5C]" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Beds</span>
                      </div>

                      <div className="flex flex-col items-center justify-center border-l border-slate-200">
                        <div className="flex items-center gap-1 text-slate-700 text-xs font-bold">
                          <Bath className="w-3.5 h-3.5 text-[#1A3A5C]" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Baths</span>
                      </div>

                      <div className="flex flex-col items-center justify-center border-l border-slate-200">
                        <div className="flex items-center gap-1 text-slate-700 text-xs font-bold">
                          <Car className="w-3.5 h-3.5 text-[#1A3A5C]" />
                          <span>{property.carSpaces}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Cars</span>
                      </div>

                      <div className="flex flex-col items-center justify-center border-l border-slate-200">
                        <div className="flex items-center gap-1 text-slate-800 text-xs font-bold">
                          <Maximize2 className="w-3 h-3 text-[#B8960C]" />
                          <span>{property.landSizeM2}m²</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Land</span>
                      </div>
                    </div>

                    {/* Notes Section (Editable buyers agency remarks) */}
                    <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#B8960C]" />
                          <span>Buyers Agent Notes</span>
                        </span>
                        {!isEditingThisNote ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(property.id);
                              setCurrentNoteText(property.notes || '');
                            }}
                            className="text-[#1A3A5C] hover:text-[#B8960C] font-semibold text-[10px] flex items-center gap-0.5 cursor-pointer"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSaveNote(property)}
                            className="text-emerald-700 hover:text-emerald-900 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>Save Note</span>
                          </button>
                        )}
                      </div>

                      {isEditingThisNote ? (
                        <div className="space-y-1.5">
                          <textarea
                            value={currentNoteText}
                            onChange={(e) => setCurrentNoteText(e.target.value)}
                            rows={2}
                            placeholder="Add evaluation comments, vendor motivation, or renovation notes..."
                            className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#B8960C]"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="text-[10px] px-2 py-0.5 text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNote(property)}
                              className="text-[10px] px-2 py-0.5 bg-[#1A3A5C] text-white rounded font-medium"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 line-clamp-2 italic leading-relaxed">
                          &quot;{property.notes || 'No remarks recorded yet. Click edit to log buyer insights.'}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenCashflowModal(property)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#B8960C]" />
                      <span>Cashflow ROI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDetailModal(property)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1A3A5C]" />
                      <span>Property Details</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('analyser', property.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1A3A5C] hover:bg-[#254f7a] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-300" />
                      <span>B&P Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('negotiation', property.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#B8960C] hover:bg-[#9E8009] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit Offer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TABLE MODE */}
      {viewMode === 'table' && filteredProperties.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A3A5C] text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Property & Address</th>
                <th className="p-3.5">Client Fit</th>
                <th className="p-3.5">Asking Price</th>
                <th className="p-3.5">Property Type</th>
                <th className="p-3.5">Specs (Bed/Bath/Car/Land)</th>
                <th className="p-3.5">Days on Market</th>
                <th className="p-3.5">Status Badge</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.map((p) => {
                const statusStyle = STATUS_CONFIG[p.status] || STATUS_CONFIG['Shortlisted'];
                const isWithinBudget = p.priceGuide <= clientMaxBudget;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs">{p.address}</div>
                      <div className="text-[11px] text-slate-500">{p.suburb}, {p.state} {p.postcode}</div>
                    </td>
                    <td className="p-3.5">
                      {activeClient && (
                        <button
                          type="button"
                          onClick={() => onNavigate('onboarding')}
                          className="text-left group cursor-pointer"
                        >
                          <div className="font-bold text-[#1A3A5C] group-hover:text-[#B8960C] flex items-center gap-1 text-[11px]">
                            <UserCheck className="w-3 h-3 text-[#B8960C]" />
                            <span>{activeClient.fullName || activeClient.name}</span>
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-700">
                            {isWithinBudget ? '✅ Fits Budget' : `⚠️ +$${((p.priceGuide - clientMaxBudget)/1000).toFixed(0)}k`}
                          </div>
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-slate-900 text-sm">
                      ${p.priceGuide.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {p.propertyType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-mono">
                      {p.bedrooms}b • {p.bathrooms}ba • {p.carSpaces}c • {p.landSizeM2}m²
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B8960C]" />
                        {p.daysOnMarket || 12} days
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p, e.target.value as PropertyStatus)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        <option value="Shortlisted">⭐️ Shortlisted</option>
                        <option value="Under Review">⏱️ Under Review</option>
                        <option value="Offer Made">✨ Offer Made</option>
                        <option value="Passed">🚫 Passed</option>
                        <option value="Due Diligence">📋 Due Diligence</option>
                        <option value="Under Contract">🤝 Under Contract</option>
                        <option value="Discovered">🔍 Discovered</option>
                      </select>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[11px] text-slate-600 italic">
                      &quot;{p.notes || 'No notes'}&quot;
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => onOpenDetailModal(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onNavigate('analyser', p.id)}
                        className="px-2.5 py-1 bg-[#1A3A5C] text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        B&P
                      </button>
                      <button
                        onClick={() => onNavigate('negotiation', p.id)}
                        className="px-2.5 py-1 bg-[#B8960C] text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        Offer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
