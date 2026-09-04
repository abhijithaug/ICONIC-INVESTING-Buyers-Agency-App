import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  FileText, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Plus,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  DollarSign,
  TrendingUp,
  Tag,
  Key,
  Layers,
  ChevronRight,
  Filter,
  Flame,
  FileCheck,
  Award,
  Wallet,
  CheckSquare,
  UserCheck,
  Target,
  Check,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { 
  AppSection, 
  ClientProfile, 
  Property, 
  OfferNegotiation, 
  SettlementRecord, 
  BPReportAnalysis,
  AuthUser,
  ClientDocument,
  AgentMessage
} from '../../types';
import { PersonalClientDashboard } from './PersonalClientDashboard';

interface ClientDashboardProps {
  client: ClientProfile;
  properties: Property[];
  offers: OfferNegotiation[];
  settlements: SettlementRecord[];
  bpAnalyses: BPReportAnalysis[];
  onNavigate: (section: AppSection, targetId?: string) => void;
  onOpenPropertyDetail: (property: Property) => void;
  onOpenNewPropertyModal?: () => void;
  currentUser?: AuthUser;
  documents?: ClientDocument[];
  messages?: AgentMessage[];
  onSendMessage?: (text: string, propertyRef?: Property, attachmentName?: string) => void;
  onAddDocument?: (doc: ClientDocument) => void;
  onToggleTask?: (settlementId: string, taskId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  properties = [],
  offers = [],
  settlements = [],
  bpAnalyses = [],
  onNavigate,
  onOpenPropertyDetail,
  onOpenNewPropertyModal,
  currentUser,
  documents = [],
  messages = [],
  onSendMessage,
  onAddDocument,
  onToggleTask
}) => {
  const safeProperties = properties || [];
  const safeOffers = offers || [];
  const safeSettlements = settlements || [];
  const safeBpAnalyses = bpAnalyses || [];

  // Safe fallback for client
  const safeClient: ClientProfile = client || {
    id: 'c1',
    name: 'Marcus & Elena Vance',
    fullName: 'Marcus Vance & Elena Vance',
    email: 'marcus.vance@investorreach.com.au',
    phone: '+61 412 890 341',
    occupancyPurpose: 'Investment',
    budgetMin: 650000,
    budgetMax: 950000,
    depositAvailable: 220000,
    preApprovalStatus: 'Verified Pre-Approved',
    preApprovalLender: 'Macquarie Bank',
    preApprovalAmount: 950000,
    primaryGoal: 'Capital Growth',
    targetStates: ['QLD', 'WA'],
    targetSuburbs: ['Kallangur', 'Secret Harbour', 'Petrie', 'Meadow Springs'],
    preferredSuburbs: ['Kallangur', 'Secret Harbour', 'Petrie', 'Meadow Springs'],
    propertyTypes: ['Freestanding House', 'Townhouse'],
    bedrooms: '4+',
    mustHaves: ['Double Lockup Garage', 'Granny Flat / Dual Occupancy Potential', 'Large Block (>600m²)', 'High Rental Yield (>5.5%)'],
    dealBreakers: ['Flood Prone / 1-in-100yr Overland Flow', 'Main Arterial Road / Traffic Noise', 'High-Voltage Transmission Lines'],
    riskAppetite: 'Moderate',
    maxHoldPeriodYears: 10,
    smsfPurchase: false,
    renovationAppetite: 'Minor Cosmetic Ok',
    createdDate: '2026-08-01'
  };

  // CLIENT PORTAL VIEW: If logged in as client, strictly render their personal dashboard
  if (currentUser?.role === 'client') {
    return (
      <PersonalClientDashboard
        client={safeClient}
        currentUser={currentUser}
        properties={safeProperties}
        documents={documents}
        settlements={safeSettlements}
        messages={messages}
        onNavigate={onNavigate}
        onOpenPropertyDetail={onOpenPropertyDetail}
        onSendMessage={onSendMessage || (() => {})}
        onAddDocument={onAddDocument || (() => {})}
        onToggleTask={onToggleTask}
      />
    );
  }

  // Property Categorization counts
  const shortlistedProps = safeProperties.filter(p => p && (p.status === 'Shortlisted' || p.shortlistTier));
  const underReviewProps = safeProperties.filter(p => p && (p.status === 'Under Review' || p.status === 'Due Diligence' || p.status === 'Discovered'));
  const offersMadeProps = safeProperties.filter(p => p && (p.status === 'Offer Made' || p.status === 'Offer Active' || p.status === 'Under Contract'));
  const purchasedProps = safeProperties.filter(p => p && (p.status === 'Settled' || p.settlementId));

  // Properties within client's budget
  const matchingBudgetProps = safeProperties.filter(p => p.priceGuide <= safeClient.budgetMax);

  // Active Settlements list with calculated days remaining
  const activeSettlementsList = safeSettlements.map(s => {
    const today = new Date();
    const targetDate = new Date(s.targetSettlementDate);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      ...s,
      daysRemaining: diffDays > 0 ? diffDays : 0,
      completedTasksCount: (s.tasks || []).filter(t => t.completed).length,
      totalTasksCount: (s.tasks || []).length || 1
    };
  });

  // Upcoming Tasks Calculation with Due Dates
  const upcomingTasks = [
    {
      id: 'task-1',
      title: 'Sign Form 6 & Conveyancer Instruction Authority',
      dueDate: '2026-09-03',
      section: 'Pre-Exchange',
      assignee: 'Conveyancer',
      priority: 'HIGH',
      status: 'Pending',
      propertyRef: '42 Bunya Pine Cir, Kallangur'
    },
    {
      id: 'task-2',
      title: 'Review AS 4349.1 Building & Timber Pest Defect Matrix',
      dueDate: '2026-09-04',
      section: 'Due Diligence',
      assignee: 'Buyers Agent',
      priority: 'CRITICAL',
      status: 'Pending',
      propertyRef: '18 Sanctuary Way, Meadow Springs'
    },
    {
      id: 'task-3',
      title: 'Lock In Counter-Anchor Submission at $772,500',
      dueDate: '2026-09-05',
      section: 'Negotiation',
      assignee: 'Buyers Agent',
      priority: 'HIGH',
      status: 'Pending',
      propertyRef: '42 Bunya Pine Cir, Kallangur'
    },
    {
      id: 'task-4',
      title: 'Certificate of Currency & Landlord Insurance Policy',
      dueDate: '2026-09-20',
      section: 'Pre-Settlement',
      assignee: 'Client',
      priority: 'MEDIUM',
      status: 'Pending',
      propertyRef: '12 Marina Boulevard, Secret Harbour'
    },
    {
      id: 'task-5',
      title: 'Conduct Final Pre-Settlement Walkthrough Inspection',
      dueDate: '2026-09-22',
      section: 'Pre-Settlement',
      assignee: 'Buyers Agent',
      priority: 'MEDIUM',
      status: 'Pending',
      propertyRef: '12 Marina Boulevard, Secret Harbour'
    },
    {
      id: 'task-6',
      title: 'PEXA Financial Settlement Execution & Key Handover',
      dueDate: '2026-09-25',
      section: 'Settlement Day',
      assignee: 'Conveyancer',
      priority: 'CRITICAL',
      status: 'Pending',
      propertyRef: '12 Marina Boulevard, Secret Harbour'
    }
  ];

  // Recent Activity Feed
  const recentActivities = [
    {
      id: 'act-1',
      type: 'negotiation',
      title: 'Vendor Counter-Offer Received',
      description: 'Vendor countered at $785,000 for 42 Bunya Pine Cir. AI Advisor calculated counter-anchor at $772,500.',
      time: '18 mins ago',
      icon: TrendingUp,
      color: 'text-[#B8960C] bg-amber-50 border-amber-200',
      linkSection: 'negotiation' as AppSection
    },
    {
      id: 'act-2',
      type: 'report',
      title: 'B&P Report AI Diagnostic Completed',
      description: 'Extracted $18,000 in repair items; generated $3,500 vendor credit special condition clause.',
      time: '2 hours ago',
      icon: ShieldCheck,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      linkSection: 'analyser' as AppSection
    },
    {
      id: 'act-3',
      type: 'settlement',
      title: 'Finance Approved for Secret Harbour Asset',
      description: 'Macquarie Bank formal unconditional approval received ($705,000 purchase price).',
      time: '1 day ago',
      icon: CheckSquare,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      linkSection: 'settlement' as AppSection
    },
    {
      id: 'act-4',
      type: 'shortlist',
      title: 'New Off-Market Asset Shortlisted',
      description: '18 Sanctuary Way added to Tier 1 Priority watchlist with 6.01% gross yield.',
      time: '2 days ago',
      icon: Building2,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      linkSection: 'search' as AppSection
    },
    {
      id: 'act-5',
      type: 'brief',
      title: 'Client Acquisition Strategy Brief Generated',
      description: `Investment parameters locked: $${(safeClient.budgetMin/1000).toFixed(0)}k-$${(safeClient.budgetMax/1000).toFixed(0)}k budget with focus on ${safeClient.primaryGoal}.`,
      time: '3 days ago',
      icon: FileCheck,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
      linkSection: 'onboarding' as AppSection
    }
  ];

  const formatCurrency = (val?: number) => {
    if (!val) return '$0';
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER HERO: Client Name & Budget with Navy & Gold Branding */}
      <div className="bg-gradient-to-r from-[#1A3A5C] via-[#1E436A] to-[#0E2238] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-[#B8960C]/30 relative overflow-hidden">
        {/* Subtle Gold Ambient Gradient */}
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#B8960C]/25 via-transparent to-transparent pointer-events-none rounded-full" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#B8960C] text-white tracking-wider uppercase shadow-xs">
                Active Buyer Mandate
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-200 border border-white/10">
                Client ID: #{safeClient.id.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{safeClient.preApprovalStatus || 'Verified Pre-Approved'} ({safeClient.preApprovalLender || 'Major Bank'})</span>
              </span>
              {safeClient.smsfPurchase && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  SMSF Compliant
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B8960C] to-[#9E8009] text-white font-bold flex items-center justify-center text-lg shadow-lg border border-amber-300/40">
                {(safeClient.fullName || safeClient.name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white tracking-tight">
                  {safeClient.fullName || safeClient.name || 'Investor Client'}
                </h1>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span>{safeClient.email}</span>
                  <span>•</span>
                  <span>{safeClient.phone}</span>
                </p>
              </div>
            </div>

            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
              <span>Goal: <strong className="text-amber-300 font-semibold">{safeClient.primaryGoal}</strong></span>
              <span className="text-slate-400">•</span>
              <span>Target States: <strong className="text-amber-200 font-semibold">{(safeClient.targetStates || []).join(', ') || 'QLD, WA'}</strong></span>
              <span className="text-slate-400">•</span>
              <span>Deposit: <strong className="text-emerald-300 font-semibold">{formatCurrency(safeClient.depositAvailable)}</strong></span>
            </p>
          </div>

          {/* Budget Display Card & Quick Access Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            
            {/* Budget Card */}
            <div className="bg-[#0E2238]/90 backdrop-blur-md border border-[#B8960C]/40 p-4 rounded-xl shadow-lg min-w-[210px]">
              <div className="flex items-center justify-between gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Acquisition Budget</span>
                <Wallet className="w-3.5 h-3.5 text-[#B8960C]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono tracking-tight">
                {formatCurrency(safeClient.budgetMin)} - {formatCurrency(safeClient.budgetMax)}
              </div>
              <div className="text-[11px] text-slate-300 flex items-center justify-between mt-1">
                <span>Max Capacity:</span>
                <span className="font-semibold text-white">{formatCurrency(safeClient.preApprovalAmount || safeClient.budgetMax)}</span>
              </div>
            </div>

            {/* Quick Access Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                id="dashboard-edit-client-brief-btn"
                onClick={() => onNavigate('onboarding')}
                className="flex items-center justify-center gap-2 bg-[#1A3A5C] hover:bg-[#254f7a] text-amber-200 hover:text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer whitespace-nowrap border border-[#B8960C]/40"
              >
                <UserCheck className="w-4 h-4 text-[#B8960C]" />
                <span>Edit Client Brief</span>
              </button>

              <button
                id="dashboard-generate-pdf-report-btn"
                onClick={() => onNavigate('report')}
                className="flex items-center justify-center gap-2 bg-[#B8960C] hover:bg-[#9E8009] text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer whitespace-nowrap border border-amber-300/30"
              >
                <FileText className="w-4 h-4" />
                <span>PDF Buyer Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CLIENT MANDATE & CRITERIA STRATEGY SNAPSHOT */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#B8960C] flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Investment Mandate & Brief Parameters
              </h2>
              <p className="text-xs text-slate-500">
                Parameters auto-applied to property underwriting, yield calculations, and B&P defect scoring
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('onboarding')}
            className="text-xs font-bold text-[#1A3A5C] hover:text-[#B8960C] flex items-center gap-1 cursor-pointer"
          >
            <span>Update Mandate in Onboarding</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Col 1: Preferred Locations & Asset Types */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Target Locations & Assets</span>
            <div className="space-y-1 text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B8960C] shrink-0" />
                <span className="font-semibold text-slate-900">
                  {((safeClient.targetSuburbs || safeClient.preferredSuburbs || []).length > 0)
                    ? (safeClient.targetSuburbs || safeClient.preferredSuburbs || []).join(', ')
                    : 'Kallangur, Secret Harbour, Petrie'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#1A3A5C] shrink-0" />
                <span>Types: <strong>{(safeClient.propertyTypes || []).join(', ') || 'Freestanding House, Townhouse'}</strong></span>
              </div>
              <div className="text-[11px] text-slate-500">
                Min Bedrooms: <strong>{safeClient.bedrooms || '3+'} Bedrooms</strong>
              </div>
            </div>
          </div>

          {/* Col 2: Must-Haves */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Must-Have Inclusions</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(safeClient.mustHaves || ['Double Lockup Garage', 'Large Block (>600m²)', 'Granny Flat Potential']).map((item, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Col 3: Deal-Breakers */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Non-Negotiable Deal-Breakers</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(safeClient.dealBreakers || ['Flood Prone / 1-in-100yr Flow', 'Main Arterial Road Noise']).map((item, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-semibold">
                  {item}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. SUMMARY OF PROPERTIES: Shortlisted / Under Review / Offers Made / Purchased */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1A3A5C]" />
            <span>Property Pipeline Summary</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {safeProperties.length} Total Properties Tracked ({matchingBudgetProps.length} within ${formatCurrency(safeClient.budgetMax)} budget)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Shortlisted */}
          <div 
            onClick={() => onNavigate('search')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#1A3A5C] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A3A5C] flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                Stage 1
              </span>
            </div>
            
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-[#1A3A5C] transition">
                {shortlistedProps.length}
              </div>
              <h3 className="font-bold text-sm text-slate-800 mt-0.5">Shortlisted</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tier 1 priority & watchlist assets matched to client brief.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#1A3A5C] font-semibold">
              <span>View Shortlist</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Under Review */}
          <div 
            onClick={() => onNavigate('analyser')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#B8960C] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wide">
                Stage 2
              </span>
            </div>
            
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-purple-700 transition">
                {underReviewProps.length}
              </div>
              <h3 className="font-bold text-sm text-slate-800 mt-0.5">Under Review</h3>
              <p className="text-xs text-slate-500 mt-1">
                Active B&P defect diagnostics, strata checks & feasibility.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
              <span>Review B&P Analyses</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Offers Made */}
          <div 
            onClick={() => onNavigate('negotiation')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#B8960C] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#B8960C] flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wide">
                Stage 3
              </span>
            </div>
            
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-[#B8960C] transition">
                {offersMadeProps.length || safeOffers.length}
              </div>
              <h3 className="font-bold text-sm text-slate-800 mt-0.5">Offers Made</h3>
              <p className="text-xs text-slate-500 mt-1">
                Active submissions, vendor counter-offers & contract rounds.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#B8960C] font-semibold">
              <span>Open Offer Tracker</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Purchased */}
          <div 
            onClick={() => onNavigate('settlement')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                Stage 4
              </span>
            </div>
            
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-emerald-700 transition">
                {purchasedProps.length || safeSettlements.length}
              </div>
              <h3 className="font-bold text-sm text-slate-800 mt-0.5">Purchased</h3>
              <p className="text-xs text-slate-500 mt-1">
                Contracts exchanged, in PEXA conveyancing or settled.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span>View Settlement Hub</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>
      </div>

      {/* 4. ACTIVE SETTLEMENTS CALLOUT BANNER (If Deals Won) */}
      {activeSettlementsList.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900 to-[#1A3A5C] rounded-2xl p-5 text-white shadow-md border border-emerald-400/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                  🏆 Deal Won & In Settlement
                </span>
                <span className="text-emerald-200 text-xs font-semibold">
                  {activeSettlementsList.length} Active Conveyancing File(s)
                </span>
              </div>
              <h3 className="text-lg font-bold font-serif-heading">
                {activeSettlementsList[0].propertyAddress}
              </h3>
              <p className="text-xs text-slate-200">
                Agreed Price: <strong className="text-amber-300 font-mono">${activeSettlementsList[0].purchasePrice.toLocaleString()}</strong> • Settlement: <strong className="text-white">{activeSettlementsList[0].targetSettlementDate}</strong> ({activeSettlementsList[0].daysRemaining} days remaining)
              </p>
            </div>

            <button
              type="button"
              id="dashboard-active-settlement-btn"
              onClick={() => onNavigate('settlement', activeSettlementsList[0].id)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Open Settlement Checklist</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. MAIN DASHBOARD CONTENT: Upcoming Tasks & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: UPCOMING TASKS WITH DUE DATES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Upcoming Tasks & Milestones
              </h2>
            </div>
            <button
              onClick={() => onNavigate('settlement')}
              className="text-xs font-semibold text-[#1A3A5C] hover:text-[#B8960C] flex items-center gap-1 transition cursor-pointer"
            >
              <span>View Full Checklist</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tasks List Container */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 divide-y divide-slate-100">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      task.priority === 'HIGH' ? 'bg-amber-100 text-amber-900' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {task.section}
                    </span>
                  </div>
                  
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {task.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="text-slate-700 font-medium">Assigned: {task.assignee}</span>
                    <span>•</span>
                    <span className="truncate text-slate-500">{task.propertyRef}</span>
                  </div>
                </div>

                {/* Due Date & Action */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-[#B8960C]" />
                    <span>{task.dueDate}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Due Date</span>
                </div>
              </div>
            ))}
          </div>

          {/* Highlighted Shortlisted Deals Quick Carousel */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1A3A5C]" />
                <span>Client-Matched Properties</span>
              </h3>
              <button
                onClick={() => onNavigate('search')}
                className="text-xs font-semibold text-[#1A3A5C] hover:text-[#B8960C] flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All ({safeProperties.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safeProperties.slice(0, 2).map((property) => (
                <div
                  key={property.id}
                  onClick={() => onOpenPropertyDetail(property)}
                  className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:border-[#B8960C] transition cursor-pointer flex gap-3 group"
                >
                  <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                    <img
                      src={property.imageUrl}
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {property.isOffMarket && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-[#B8960C] text-white text-[9px] font-bold">
                        OFF-MKT
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-[#1A3A5C]">
                        {property.address}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {property.suburb}, {property.state}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-slate-900 font-mono">
                        ${property.priceGuide.toLocaleString()}
                      </span>
                      <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">
                        {property.grossYield}% Yield
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: RECENT ACTIVITY FEED */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Activity Feed
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-time sync</span>
          </div>

          {/* Activity Cards List */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  onClick={() => onNavigate(act.linkSection)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-[#B8960C]/40 hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${act.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1A3A5C] transition">
                          {act.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {act.time}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Suburb Heatmap Snapshot / Strategic Notes */}
          <div className="bg-gradient-to-br from-[#1A3A5C] to-[#0E2238] rounded-2xl p-5 text-white shadow-md border border-[#B8960C]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Buyers Agent Strategy Summary</span>
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Client profile focuses on <strong className="text-white">{safeClient.primaryGoal}</strong> with a strict budget ceiling of <strong className="text-amber-300">{formatCurrency(safeClient.budgetMax)}</strong>. Currently capitalizing on high yields and low vacancy rates in Southeast QLD and coastal WA corridors.
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <button
                onClick={() => onNavigate('market')}
                className="text-amber-300 hover:text-white font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-[#B8960C]" />
                <span>Explore Suburb Research Dossiers</span>
              </button>
              <button
                onClick={() => onNavigate('onboarding')}
                className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>Edit Brief</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
