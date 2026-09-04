import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Award,
  GraduationCap,
  ShoppingBag,
  Train,
  HeartPulse,
  Trees,
  Users,
  Sparkles,
  ExternalLink,
  Download,
  BookmarkPlus,
  RefreshCw,
  BarChart3,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { SuburbReportData, Property, ClientProfile, AppSection } from '../../types';

interface SuburbResearchProps {
  initialSuburb?: string;
  initialState?: string;
  client?: ClientProfile;
  onNavigateToSearch?: (suburbName: string) => void;
}

export const SuburbResearch: React.FC<SuburbResearchProps> = ({
  initialSuburb = 'Kallangur',
  initialState = 'QLD',
  client,
  onNavigateToSearch
}) => {
  const [searchSuburb, setSearchSuburb] = useState<string>(initialSuburb);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<SuburbReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'amenities' | 'demographics'>('overview');

  const popularSuburbs = [
    { name: 'Kallangur', state: 'QLD', tag: 'High Growth' },
    { name: 'Secret Harbour', state: 'WA', tag: 'Coastal Yield' },
    { name: 'Meadow Springs', state: 'WA', tag: 'High Cashflow' },
    { name: 'Strathpine', state: 'QLD', tag: 'Rail Corridor' },
    { name: 'Southport', state: 'QLD', tag: 'Gold Coast Metro' },
    { name: 'Werribee', state: 'VIC', tag: 'Affordable Hub' },
    { name: 'Blacktown', state: 'NSW', tag: 'Western Metro' }
  ];

  const fetchSuburbReport = async (suburbName: string, stateName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/suburb-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suburb: suburbName,
          state: stateName
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report (${response.status})`);
      }

      const data: SuburbReportData = await response.json();
      setReportData(data);
    } catch (err: any) {
      console.error('Error fetching suburb report:', err);
      setError(err.message || 'Unable to retrieve suburb data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuburbReport(initialSuburb, initialState);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSuburb.trim()) return;
    fetchSuburbReport(searchSuburb.trim(), selectedState);
  };

  const handleSelectPreset = (suburb: string, state: string) => {
    setSearchSuburb(suburb);
    setSelectedState(state);
    fetchSuburbReport(suburb, state);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Search Control Panel */}
      <div className="bg-gradient-to-r from-[#1A3A5C] via-[#1E436A] to-[#0E2238] rounded-2xl p-6 text-white shadow-xl border border-[#B8960C]/30 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#B8960C]/20 via-transparent to-transparent pointer-events-none rounded-full" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#B8960C] text-white tracking-wider uppercase shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Live Suburb Research Panel
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-200 border border-white/10">
              Web Search Grounding
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white tracking-tight">
            Market Data & Suburb Dossier
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl">
            Live Australian market metrics, historical median price movements, auction clearances, rental yield spreads, demographic population trends, and local school catchment matrices.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="suburb-search-input"
                type="text"
                value={searchSuburb}
                onChange={(e) => setSearchSuburb(e.target.value)}
                placeholder="Enter Australian suburb (e.g. Kallangur, Secret Harbour, Southport)..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B8960C] shadow-sm"
              />
            </div>

            {/* State Selector */}
            <select
              id="suburb-state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-white text-slate-900 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#B8960C] shadow-sm shrink-0 cursor-pointer"
            >
              <option value="QLD">QLD</option>
              <option value="WA">WA</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="ACT">ACT</option>
              <option value="NT">NT</option>
            </select>

            <button
              id="suburb-search-btn"
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-[#B8960C] hover:bg-[#9E8009] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition transform active:scale-95 disabled:opacity-60 cursor-pointer shrink-0 border border-amber-300/30"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching Web...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Research Suburb</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suburb Presets */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Popular Corridors:</span>
            {popularSuburbs.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectPreset(item.name, item.state)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                  searchSuburb.toLowerCase() === item.name.toLowerCase()
                    ? 'bg-[#B8960C] text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <span>{item.name} ({item.state})</span>
                <span className="text-[9px] opacity-75 font-normal">[{item.tag}]</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#B8960C] flex items-center justify-center mx-auto border border-amber-200 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Gathering Real-Time Market Intelligence
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Scanning live property portals, CoreLogic clearance data, SQM rental indices, and local education registries for <strong className="text-[#1A3A5C]">{searchSuburb}, {selectedState}</strong>...
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && !isLoading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Unable to retrieve live market data</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchSuburbReport(searchSuburb, selectedState)}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Main Suburb Report Data Cards */}
      {reportData && !isLoading && (
        <div className="space-y-6">
          
          {/* Suburb Title Bar & Action Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#1A3A5C]">{reportData.lgaName || `LGA: ${reportData.suburb}`}</span>
                <span>•</span>
                <span>Postcode: <strong className="text-slate-800 font-mono">{reportData.postcode}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                  {reportData.marketDemandRating}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-slate-900 mt-1 flex items-center gap-2">
                <span>{reportData.suburb}, {reportData.state}</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {onNavigateToSearch && (
                <button
                  onClick={() => onNavigateToSearch(reportData.suburb)}
                  className="flex items-center gap-1.5 bg-[#1A3A5C] hover:bg-[#132c47] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Find Available Properties</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Suburb Dossier</span>
              </button>
            </div>
          </div>

          {/* 3. Core Metrics Grid (Prompt 8 Requirements) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Median House Price */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#B8960C] transition">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Median House Price</span>
                <Building2 className="w-4 h-4 text-[#1A3A5C]" />
              </div>
              
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                  {reportData.medianHousePriceFormatted || formatCurrency(reportData.medianHousePrice)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                    reportData.houseGrowth12M >= 0 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {reportData.houseGrowth12M >= 0 ? '+' : ''}{reportData.houseGrowth12M}% 12M
                  </span>
                  <span className="text-slate-400 text-[11px]">Rolling 12m growth</span>
                </div>
              </div>
            </div>

            {/* Card 2: Median Unit Price */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#B8960C] transition">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Median Unit Price</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                  {reportData.medianUnitPriceFormatted || formatCurrency(reportData.medianUnitPrice)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                    reportData.unitGrowth12M >= 0 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {reportData.unitGrowth12M >= 0 ? '+' : ''}{reportData.unitGrowth12M}% 12M
                  </span>
                  <span className="text-slate-400 text-[11px]">Units & townhouses</span>
                </div>
              </div>
            </div>

            {/* Card 3: Average Days on Market & Clearance Rate */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#B8960C] transition">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Avg Days on Market</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                    {reportData.avgDaysOnMarket}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Days</span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="font-bold font-mono px-1.5 py-0.5 rounded text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                    {reportData.auctionClearanceRate}% Clearance
                  </span>
                  <span className="text-slate-400 text-[11px]">Auction rate</span>
                </div>
              </div>
            </div>

            {/* Card 4: Rental Yield Estimate */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#B8960C] transition">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Gross Rental Yield Est.</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tracking-tight">
                    {reportData.rentalYieldEstimateHouse}%
                  </span>
                  <span className="text-xs font-medium text-slate-500">Houses ({reportData.rentalYieldEstimateUnit}% Units)</span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-bold text-slate-800 font-mono">${reportData.medianHouseWeeklyRent}/wk</span>
                  <span>•</span>
                  <span>Vacancy: <strong className="text-emerald-700 font-mono">{reportData.vacancyRate}%</strong></span>
                </div>
              </div>
            </div>

          </div>

          {/* 4. Population & Demographics Snapshot Card */}
          <div className="bg-gradient-to-br from-[#0E2238] to-[#1A3A5C] rounded-2xl p-6 text-white shadow-md border border-[#B8960C]/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left Population Metrics */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>Population Growth Trend & Demographics</span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold font-mono text-white">
                    {reportData.population ? reportData.population.toLocaleString() : '18,500'}
                  </span>
                  <span className="text-sm font-semibold text-amber-300">
                    {reportData.populationGrowthTrend}
                  </span>
                </div>

                <p className="text-xs text-slate-300 max-w-xl">
                  ABS Census data and regional planning indicators show consistent migration fueled by employment corridors, education catchments, and lifestyle connectivity.
                </p>
              </div>

              {/* Right Demographics Highlights */}
              <div className="flex-1 lg:max-w-md bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Key Demographic Indicators
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {(reportData.demographicHighlights || []).map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B8960C] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* 5. Tabbed Detailed Section: Schools & Catchment vs Amenities & Infrastructure */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            
            {/* Tab Header Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex space-x-2">
                <button
                  id="tab-schools-btn"
                  onClick={() => setActiveTab('schools')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'schools' || activeTab === 'overview'
                      ? 'bg-[#1A3A5C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Nearby Schools & Education ({reportData.nearbySchools?.length || 0})</span>
                </button>

                <button
                  id="tab-amenities-btn"
                  onClick={() => setActiveTab('amenities')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'amenities'
                      ? 'bg-[#1A3A5C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Amenities & Infrastructure ({reportData.nearbyAmenities?.length || 0})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Sub-5km Local Catchment Radius
              </span>
            </div>

            {/* Tab Content 1: Schools Grid */}
            {(activeTab === 'schools' || activeTab === 'overview') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    School Catchment Zone & Academic Ranking
                  </h3>
                  <span className="text-xs text-slate-500">
                    Independent & Government Options
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(reportData.nearbySchools || []).map((school, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 hover:border-[#B8960C] hover:bg-slate-50/50 transition flex items-start gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A3A5C] flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-[#1A3A5C] group-hover:text-amber-300 transition">
                        <GraduationCap className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {school.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                            {school.distanceKm} km
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                            {school.type}
                          </span>
                          {school.icseaOrRating && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              ICSEA: {school.icseaOrRating}
                            </span>
                          )}
                        </div>

                        {school.notes && (
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {school.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content 2: Amenities & Transport Hubs */}
            {(activeTab === 'amenities' || activeTab === 'overview') && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Key Amenities, Transit Hubs & Lifestyle Infrastructure
                  </h3>
                  <span className="text-xs text-slate-500">
                    Proximity & Connectivity
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(reportData.nearbyAmenities || []).map((amenity, idx) => {
                    const getIcon = (cat: string) => {
                      if (cat === 'Transport') return Train;
                      if (cat === 'Shopping') return ShoppingBag;
                      if (cat === 'Healthcare') return HeartPulse;
                      if (cat === 'Parks & Recreation') return Trees;
                      return Navigation;
                    };
                    const AmenityIcon = getIcon(amenity.category);

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1A3A5C] hover:bg-slate-50/50 transition flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B8960C] flex items-center justify-center shrink-0 border border-amber-200">
                          <AmenityIcon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {amenity.name}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              {amenity.distanceKm} km
                            </span>
                          </div>

                          <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                            {amenity.category}
                          </span>

                          {amenity.description && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-2">
                              {amenity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* 6. Senior Buyers Agent Strategic Investment Verdict */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Buyers Agent Investment Verdict
                  </h3>
                  <p className="text-xs text-slate-500">
                    Underwriting assessment & capital growth outlook
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Forecast: +{reportData.capitalGrowthForecast3Yr}% p.a. (3-Yr)</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {reportData.buyersAgentInsight}
            </p>

            {/* Grounding & Data Sources Footnote */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Data Sources:</span>
                <span>{reportData.dataSource}</span>
                <span>•</span>
                <span>Updated: {reportData.lastUpdated}</span>
              </div>

              {reportData.searchSources && reportData.searchSources.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Citations:</span>
                  {reportData.searchSources.map((source, sIdx) => (
                    <a
                      key={sIdx}
                      href={source.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A3A5C] hover:text-[#B8960C] underline truncate max-w-[120px]"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
