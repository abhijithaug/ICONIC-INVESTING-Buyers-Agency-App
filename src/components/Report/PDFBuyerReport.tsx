import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Award,
  Calendar,
  User,
  MapPin,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Share2,
  Check,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  Info,
  Phone,
  Mail,
  Home,
  CheckSquare
} from 'lucide-react';
import { Property, ClientProfile, BPReportAnalysis, BuyerReportData, ReportPropertyEvaluation } from '../../types';

interface PDFBuyerReportProps {
  client: ClientProfile;
  clients: ClientProfile[];
  properties: Property[];
  bpAnalyses: BPReportAnalysis[];
  onSelectClient?: (client: ClientProfile) => void;
  onNavigate?: (section: string) => void;
}

export const PDFBuyerReport: React.FC<PDFBuyerReportProps> = ({
  client,
  clients = [],
  properties = [],
  bpAnalyses = [],
  onSelectClient,
  onNavigate
}) => {
  // Select initial recommended property (e.g. 42 Bunya Pine Circuit or first shortlisted property)
  const defaultRecommended = properties.find(p => p.id === 'prop-1') || properties[0];
  const [recommendedPropId, setRecommendedPropId] = useState<string>(defaultRecommended?.id || 'prop-1');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([
    'prop-1',
    'prop-2',
    'prop-3'
  ]);
  const [activeTab, setActiveTab] = useState<'preview' | 'customise'>('preview');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Editable report fields
  const [reportTitle, setReportTitle] = useState<string>('Property Acquisition Strategy & Shortlist Recommendation');
  const [advisorName, setAdvisorName] = useState<string>('Alastair Sterling');
  const [advisorRole, setAdvisorRole] = useState<string>('Senior Buyers Advocate & Head of Acquisitions');
  const [advisorLicense, setAdvisorLicense] = useState<string>('Qld Real Estate Agent Lic #4298104');
  const [customReasoning, setCustomReasoning] = useState<string>(
    `42 Bunya Pine Circuit represents the premier risk-adjusted acquisition in the Moreton Bay corridor. Priced at $785,000 ($35,000 under independent market valuation), the 680m² flat allotment features genuine 3.2m side access suitable for an ancillary granny flat addition to boost gross yield from 5.34% to ~7.8%. With a local rental vacancy rate of just 0.8% and immediate proximity to the Petrie University rail node, this asset satisfies all of Marcus & Elena's primary capital growth and yield criteria.`
  );

  // Default pros & cons mapping for properties
  const [propertyProsCons, setPropertyProsCons] = useState<Record<string, { pros: string[]; cons: string[] }>>({
    'prop-1': {
      pros: [
        'Large 680m² flat block with 3.2m wide vehicle side access for granny flat potential',
        'Off-market acquisition with motivated vendor selling prior to public marketing',
        'High 5.34% gross yield in a tight 0.8% vacancy rate rental market',
        'Sound 2008 brick veneer construction with 6.6kW solar system installed'
      ],
      cons: [
        'Minor subfloor bearer adjustment & shimming required (~$3,500)',
        'Switchboard requires safety switch (RCD) compliance upgrade before leasing (~$1,800)',
        'Original ensuite shower membrane requires resealing'
      ]
    },
    'prop-2': {
      pros: [
        'Outstanding 6.01% gross yield with positive weekly cashflow (+ $74/wk)',
        'Walk to local championship golf course and prestigious private Anglican college',
        'Low entry price point ($645k guide) maximizing borrowing capacity headroom'
      ],
      cons: [
        'Located in Greater Perth corridor (interstate management required)',
        'Smaller internal living footprint (195m²) compared to Kallangur property',
        'No direct side access for secondary dwelling construction'
      ]
    },
    'prop-3': {
      pros: [
        'Approved dual-occupancy configuration returning $950/wk ($49,400/yr)',
        '6.48% gross yield providing immediate positive cashflow (+ $115/wk)',
        'Walking distance (650m) to Strathpine Railway Station'
      ],
      cons: [
        'Higher purchase price ($835k guide) closer to upper client budget threshold',
        'Older 1994 build requires ongoing maintenance budget',
        'Higher council rates due to dual tenancy rating'
      ]
    },
    'prop-4': {
      pros: [
        'Affordable $690k price guide with solid 5.37% rental yield',
        'Spacious 650m² block in established high-demand northern Adelaide pocket',
        'Quiet cul-de-sac location with elevated district views'
      ],
      cons: [
        'Single garage only with limited off-street parking',
        'Older kitchen cabinetry requiring cosmetic refresh within 2-3 years'
      ]
    }
  });

  const recommendedProperty = properties.find(p => p.id === recommendedPropId) || defaultRecommended;

  // Stamp duty calculation helper by state
  const calculateStampDuty = (price: number, state: string) => {
    switch (state) {
      case 'QLD':
        if (price <= 540000) return price * 0.035;
        if (price <= 1000000) return 17325 + (price - 540000) * 0.045;
        return 38025 + (price - 1000000) * 0.0575;
      case 'WA':
        if (price <= 500000) return price * 0.038;
        return 19000 + (price - 500000) * 0.0515;
      case 'NSW':
        if (price <= 1000000) return price * 0.04;
        return 40490 + (price - 1000000) * 0.055;
      case 'VIC':
        return price * 0.055;
      case 'SA':
        return price * 0.048;
      default:
        return price * 0.04;
    }
  };

  const recPrice = recommendedProperty?.priceGuide || 785000;
  const recState = recommendedProperty?.state || 'QLD';
  const stampDutyAmount = Math.round(calculateStampDuty(recPrice, recState));
  const legalConveyancing = 1850;
  const buildingPestFee = 650;
  const mortgageRegFee = 395;
  const councilAdjustments = 750;
  const totalPurchaseCosts = stampDutyAmount + legalConveyancing + buildingPestFee + mortgageRegFee + councilAdjustments;
  const loanAmount80 = Math.round(recPrice * 0.8);
  const depositRequired20 = Math.round(recPrice * 0.2);
  const totalCashRequired = depositRequired20 + totalPurchaseCosts;

  // Building & pest analysis summary
  const selectedBP = bpAnalyses.find(b => b.propertyId === recommendedProperty?.id) || bpAnalyses[0];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const togglePropertyInShortlist = (propId: string) => {
    if (selectedPropertyIds.includes(propId)) {
      if (selectedPropertyIds.length > 1) {
        setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== propId));
      }
    } else {
      setSelectedPropertyIds([...selectedPropertyIds, propId]);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Control Toolbar (Screen Only) */}
      <div className="print:hidden bg-gradient-to-r from-[#1A3A5C] via-[#1E436A] to-[#0E2238] rounded-2xl p-6 text-white shadow-xl border border-[#B8960C]/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#B8960C] text-white tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                <FileText className="w-3.5 h-3.5" />
                Prompt 9 — PDF Buyer Report Generator
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-amber-200 border border-white/10">
                Iconic Investing Signature Layout
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white tracking-tight">
              Client Acquisition & Shortlist PDF Report
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl">
              Professional buyers agency report featuring client brief alignment, shortlisted property evaluations with pros & cons, recommended asset justification, building & pest breakdown, and complete acquisition cost projections.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Tabs */}
            <div className="bg-[#0E2238] p-1 rounded-xl border border-slate-700 flex items-center">
              <button
                id="btn-tab-preview"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-[#B8960C] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document Preview</span>
              </button>
              <button
                id="btn-tab-customise"
                onClick={() => setActiveTab('customise')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'customise'
                    ? 'bg-[#B8960C] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customise Report</span>
              </button>
            </div>

            {/* Print / Save as PDF Button */}
            <button
              id="btn-print-pdf-report"
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#B8960C] hover:bg-[#9E8009] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition transform active:scale-95 cursor-pointer border border-amber-300/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save to PDF</span>
            </button>

            {/* Share / Copy Button */}
            <button
              id="btn-copy-report-link"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border border-white/10"
              title="Copy link"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Client Switcher in Toolbar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Selected Client:</span>
            <select
              value={client.id}
              onChange={(e) => {
                const found = clients.find(c => c.id === e.target.value);
                if (found && onSelectClient) {
                  onSelectClient(found);
                }
              }}
              className="bg-[#0E2238] text-amber-200 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#B8960C] cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.primaryGoal})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span>Recommended Asset:</span>
            <select
              value={recommendedPropId}
              onChange={(e) => setRecommendedPropId(e.target.value)}
              className="bg-[#0E2238] text-white px-3 py-1.5 rounded-lg border border-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#B8960C] cursor-pointer"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.address}, {p.suburb} ({formatCurrency(p.priceGuide)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Customisation Panel (When Active) */}
      {activeTab === 'customise' && (
        <div className="print:hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Customise Report Content</h2>
              <p className="text-xs text-slate-500">Fine-tune the buyers agent recommendation, included properties, and financial breakdown before printing.</p>
            </div>
            <button
              onClick={() => setActiveTab('preview')}
              className="bg-[#1A3A5C] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#122b46] transition"
            >
              Done & Preview Document
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: General Report Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B8960C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Advisor Name</label>
                  <input
                    type="text"
                    value={advisorName}
                    onChange={(e) => setAdvisorName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B8960C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">License Details</label>
                  <input
                    type="text"
                    value={advisorLicense}
                    onChange={(e) => setAdvisorLicense(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B8960C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Senior Buyers Agent Recommendation Reasoning (Flagship Asset)
                </label>
                <textarea
                  rows={4}
                  value={customReasoning}
                  onChange={(e) => setCustomReasoning(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#B8960C] focus:outline-none"
                  placeholder="Explain why this property was selected as the #1 recommendation..."
                />
              </div>
            </div>

            {/* Right: Shortlist Property Toggle & Selection */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Included Shortlisted Properties ({selectedPropertyIds.length} Selected)
              </label>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {properties.map(p => {
                  const isSelected = selectedPropertyIds.includes(p.id);
                  const isRec = p.id === recommendedPropId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between ${
                        isSelected
                          ? isRec
                            ? 'bg-amber-50/50 border-[#B8960C]'
                            : 'bg-slate-50 border-slate-300'
                          : 'bg-white border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePropertyInShortlist(p.id)}
                          className="w-4 h-4 text-[#B8960C] rounded focus:ring-[#B8960C] cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{p.address}, {p.suburb}</span>
                            {isRec && (
                              <span className="text-[10px] bg-[#B8960C] text-white px-2 py-0.2 rounded-full font-bold">
                                Recommended #1
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {formatCurrency(p.priceGuide)} • {p.bedrooms}b {p.bathrooms}b • {p.grossYield}% yield
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRecommendedPropId(p.id)}
                        disabled={!isSelected}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          isRec
                            ? 'bg-[#B8960C] text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {isRec ? 'Current Rec' : 'Set as Rec'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. The Printable PDF Document Container (Iconic Investing Official Branding) */}
      <div
        id="iconic-pdf-document"
        className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none max-w-5xl mx-auto"
      >
        
        {/* =========================================================================
            REPORT HEADER & COVER BANNER (Iconic Investing Styling)
           ========================================================================= */}
        <div className="bg-gradient-to-r from-[#0E2238] via-[#1A3A5C] to-[#0E2238] text-white p-8 sm:p-10 relative overflow-hidden border-b-4 border-[#B8960C]">
          {/* Subtle gold watermark background emblem */}
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#B8960C]/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            
            {/* Left Brand & Title */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B8960C] to-[#9E8009] flex items-center justify-center shadow-lg border border-amber-200/30">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="font-serif-heading font-bold text-2xl tracking-widest text-white">
                    ICONIC <span className="text-[#B8960C]">INVESTING</span>
                  </div>
                  <div className="text-[11px] tracking-widest uppercase text-amber-200 font-semibold">
                    Exclusive Buyers Agency & Property Advisory
                  </div>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif-heading font-bold text-white tracking-tight mt-4">
                {reportTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Comprehensive acquisition brief, shortlisted asset due diligence, building & pest risk assessment, and total financial outlay projection.
              </p>
            </div>

            {/* Right Meta Stamp */}
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15 text-right sm:text-right shrink-0 space-y-1">
              <div className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">
                CONFIDENTIAL CLIENT DOSSIER
              </div>
              <div className="text-sm font-bold text-white">
                {client.fullName || client.name}
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                Date: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="text-[10px] text-slate-400">
                Ref: II-ACQ-{client.id.toUpperCase()}-2026
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            DOCUMENT BODY
           ========================================================================= */}
        <div className="p-8 sm:p-10 space-y-10 text-slate-800 bg-[#FDFBF7]/40">
          
          {/* 1. CLIENT NAME & BRIEF SECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#1A3A5C]/15 pb-2">
              <div className="w-6 h-6 rounded bg-[#1A3A5C] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-base sm:text-lg font-serif-heading font-bold text-[#1A3A5C] uppercase tracking-wider">
                Client Profile & Investment Strategy Brief
              </h2>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              
              {/* Top Client Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Primary Investor</span>
                  <span className="font-bold text-slate-900 text-sm">{client.fullName || client.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Acquisition Budget</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Investment Mandate</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs inline-block">
                    {client.primaryGoal}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Pre-Approval Status</span>
                  <span className="font-bold text-[#1A3A5C] font-mono text-xs">
                    {client.preApprovalStatus || 'Macquarie Verified ($950k)'}
                  </span>
                </div>
              </div>

              {/* Brief Strategy Summary */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Portfolio Strategy Rationale
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {client.strategyBrief?.executiveSummary || 
                    `Targeting high-growth 4-bedroom residential dwellings in infrastructure corridors with high owner-occupier ratios, sub-1.2% rental vacancy rates, and minimum 5.2% gross yields to ensure strong cashflow resilience and long-term capital compounding.`
                  }
                </p>
              </div>

              {/* Must-Haves & Dealbreakers Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Essential Must-Haves
                  </span>
                  <ul className="text-emerald-800 space-y-1 text-[11px]">
                    {(client.mustHaves || ['Double Garage', 'Side Access', 'High Yield >5.2%', 'Brick Construction']).map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-100">
                  <span className="font-bold text-rose-900 block mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Strict Dealbreakers (Excluded)
                  </span>
                  <ul className="text-rose-800 space-y-1 text-[11px]">
                    {(client.dealBreakers || ['Flood Prone Zone', 'Main Arterial Road', 'Asbestos Roof', 'High Body Corp']).map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </section>

          {/* 2. RECOMMENDED PROPERTY WITH REASONING (#1 FLAGSHIP) */}
          {recommendedProperty && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#1A3A5C]/15 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#B8960C] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-base sm:text-lg font-serif-heading font-bold text-[#1A3A5C] uppercase tracking-wider">
                    Primary Recommended Acquisition (#1 Priority)
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#B8960C] text-white tracking-wider uppercase shadow-xs flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Senior Advocate Pick
                </span>
              </div>

              <div className="bg-white rounded-2xl border-2 border-[#B8960C] shadow-md overflow-hidden">
                
                {/* Banner Strip */}
                <div className="bg-gradient-to-r from-[#1A3A5C] to-[#0E2238] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold block">
                      Recommended Asset Selection
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-serif-heading text-white">
                      {recommendedProperty.address}, {recommendedProperty.suburb} {recommendedProperty.state} {recommendedProperty.postcode}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-300 block">Purchase Price Guide</span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                      {formatCurrency(recommendedProperty.priceGuide)}
                    </span>
                  </div>
                </div>

                {/* Property Detail Showcase */}
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Image & Key Attributes */}
                    <div className="md:col-span-1 space-y-3">
                      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs h-44 bg-slate-100 relative">
                        <img
                          src={recommendedProperty.imageUrl}
                          alt={recommendedProperty.address}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {recommendedProperty.isOffMarket && (
                          <span className="absolute top-2 left-2 bg-[#0E2238] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                            OFF-MARKET EXCLUSIVE
                          </span>
                        )}
                      </div>

                      {/* Specs pills */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block text-[10px]">Bed / Bath</span>
                          <strong className="text-slate-800">{recommendedProperty.bedrooms}b / {recommendedProperty.bathrooms}b</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block text-[10px]">Land Size</span>
                          <strong className="text-slate-800">{recommendedProperty.landSizeM2} m²</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block text-[10px]">Gross Yield</span>
                          <strong className="text-emerald-700 font-mono">{recommendedProperty.grossYield}%</strong>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning Narrative & Value Drivers */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#1A3A5C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#B8960C]" />
                          Buyers Agent Strategic Justification & Reasoning
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/50">
                          {customReasoning}
                        </p>
                      </div>

                      {/* Key Value Add Points */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-1">Rental Cashflow & Yield</span>
                          <p className="text-slate-600 text-[11px]">
                            Estimated rent: <strong className="font-mono text-slate-900">${recommendedProperty.weeklyRentEst}/wk</strong>. High tenant demand corridor with 0.8% vacancy ensures minimal downtime.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-1">Capital Growth Drivers</span>
                          <p className="text-slate-600 text-[11px]">
                            Forecasted 3-Yr capital growth of <strong className="font-mono text-emerald-700">+{recommendedProperty.capitalGrowthForecast3Yr}% p.a.</strong> driven by university rail node and infrastructure spend.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>
          )}

          {/* 3. SHORTLISTED PROPERTIES WITH PROS & CONS */}
          <section className="space-y-4 page-break-before">
            <div className="flex items-center gap-2 border-b-2 border-[#1A3A5C]/15 pb-2">
              <div className="w-6 h-6 rounded bg-[#1A3A5C] text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="text-base sm:text-lg font-serif-heading font-bold text-[#1A3A5C] uppercase tracking-wider">
                Comprehensive Shortlisted Properties Evaluation (Pros & Cons)
              </h2>
            </div>

            <div className="space-y-4">
              {properties
                .filter(p => selectedPropertyIds.includes(p.id))
                .map((property, pIdx) => {
                  const isRec = property.id === recommendedPropId;
                  const prosCons = propertyProsCons[property.id] || {
                    pros: property.keyFeatures || ['Solid construction', 'Good rental demand'],
                    cons: ['Subject to market competition at auction', 'Cosmetic paint updates recommended']
                  };

                  return (
                    <div
                      key={property.id}
                      className={`bg-white rounded-xl border p-5 shadow-xs transition ${
                        isRec
                          ? 'border-[#B8960C] ring-1 ring-[#B8960C]/30 bg-amber-50/10'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Property Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1A3A5C]">Option {pIdx + 1}:</span>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900">
                              {property.address}, {property.suburb} {property.state} {property.postcode}
                            </h3>
                            {isRec && (
                              <span className="bg-[#B8960C] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {property.propertyType} • {property.bedrooms} Bed, {property.bathrooms} Bath, {property.carSpaces} Car • {property.landSizeM2} m² Block
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono sm:text-right">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Price Guide</span>
                            <strong className="text-slate-900 font-bold">{formatCurrency(property.priceGuide)}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Gross Yield</span>
                            <strong className="text-emerald-700 font-bold">{property.grossYield}%</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Rent / Wk</span>
                            <strong className="text-slate-800 font-bold">${property.weeklyRentEst}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Pros & Cons Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                        
                        {/* Pros */}
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/80">
                          <span className="font-bold text-emerald-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Investment Pros & Key Strengths
                          </span>
                          <ul className="space-y-1.5 text-emerald-950 text-[11px]">
                            {prosCons.pros.map((pro, proIdx) => (
                              <li key={proIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            Cons, Risks & Due Diligence Considerations
                          </span>
                          <ul className="space-y-1.5 text-slate-700 text-[11px]">
                            {prosCons.cons.map((con, conIdx) => (
                              <li key={conIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* 4. BUILDING & PEST INSPECTION SUMMARY */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#1A3A5C]/15 pb-2">
              <div className="w-6 h-6 rounded bg-[#1A3A5C] text-white flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h2 className="text-base sm:text-lg font-serif-heading font-bold text-[#1A3A5C] uppercase tracking-wider">
                Building & Pest Technical Assessment Summary
              </h2>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Inspection Subject Asset</span>
                  <strong className="text-slate-900 text-sm">{recommendedProperty?.address || '42 Bunya Pine Circuit'}, {recommendedProperty?.suburb}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Overall Risk Rating:</span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded text-xs">
                    {selectedBP?.overallRisk || 'MODERATE'} (Manageable Defects)
                  </span>
                </div>
              </div>

              {/* Inspector Findings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block">Structural Integrity</span>
                  <p className="text-slate-600 text-[11px]">
                    Subfloor timber packing requires supplemental pier shim leveling (~$2,800). No severe foundation movement.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block">Safety & Compliance</span>
                  <p className="text-slate-600 text-[11px]">
                    Mandatory switchboard safety switch (RCD) upgrade required before tenant occupancy (~$1,800).
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block">Termite & Moisture</span>
                  <p className="text-slate-600 text-[11px]">
                    No active termite activity detected. Perimeter chemical soil barrier renewal recommended (~$2,200).
                  </p>
                </div>
              </div>

              {/* Negotiation Strategy Note */}
              <div className="bg-[#1A3A5C]/5 p-3.5 rounded-xl border border-[#1A3A5C]/20 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#1A3A5C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A3A5C] text-xs block">
                    Buyers Agent Negotiation Action
                  </span>
                  <p className="text-slate-700 text-xs mt-0.5">
                    Total estimated rectification cost is approximately <strong>$6,800 - $8,500</strong>. We will leverage these documented inspection findings to negotiate a <strong>$12,000 - $15,000 contract price reduction</strong> or vendor repair clause prior to unconditional contract execution.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. ESTIMATED PURCHASE COSTS BREAKDOWN */}
          <section className="space-y-4 page-break-before">
            <div className="flex items-center gap-2 border-b-2 border-[#1A3A5C]/15 pb-2">
              <div className="w-6 h-6 rounded bg-[#1A3A5C] text-white flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h2 className="text-base sm:text-lg font-serif-heading font-bold text-[#1A3A5C] uppercase tracking-wider">
                Estimated Acquisition Costs & Total Capital Outlay
              </h2>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1A3A5C] text-white">
                    <th className="py-3 px-4 font-bold">Cost Component</th>
                    <th className="py-3 px-4 font-bold">Basis / Description</th>
                    <th className="py-3 px-4 font-bold text-right">Estimated Amount (AUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="bg-slate-50/70 font-semibold text-slate-900">
                    <td className="py-2.5 px-4">Agreed Purchase Price Guide</td>
                    <td className="py-2.5 px-4 text-slate-500 font-normal">{recommendedProperty?.address}, {recommendedProperty?.suburb} ({recState})</td>
                    <td className="py-2.5 px-4 text-right font-mono text-sm">{formatCurrency(recPrice)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">State Transfer / Stamp Duty</td>
                    <td className="py-2.5 px-4 text-slate-500">Standard Investor Duty for {recState} Revenue Office</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium">{formatCurrency(stampDutyAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Legal Conveyancing & Title Searches</td>
                    <td className="py-2.5 px-4 text-slate-500">Solicitor contract review, PEXA settlement, body corp / council searches</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium">{formatCurrency(legalConveyancing)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Building & Pest Diagnostics</td>
                    <td className="py-2.5 px-4 text-slate-500">Licensed independent structural and thermal imaging pest inspection</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium">{formatCurrency(buildingPestFee)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Mortgage Registration & Title Transfer</td>
                    <td className="py-2.5 px-4 text-slate-500">State titles registry lodging fee & mortgage registration fee</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium">{formatCurrency(mortgageRegFee)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-900">Council & Water Rates Adjustment</td>
                    <td className="py-2.5 px-4 text-slate-500">Pro-rata rate adjustments payable at settlement</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium">{formatCurrency(councilAdjustments)}</td>
                  </tr>
                  <tr className="bg-amber-50/80 font-bold text-amber-950 border-t-2 border-[#B8960C]">
                    <td className="py-3 px-4 text-sm">Total Acquisition Ancillary Costs</td>
                    <td className="py-3 px-4 text-xs font-normal text-amber-900">Government taxes, professional fees & adjustments</td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-[#B8960C]">{formatCurrency(totalPurchaseCosts)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Deposit & Mortgage Breakdown Card */}
              <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs space-y-1">
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Equity & Funding Structure</span>
                  <div className="flex flex-wrap gap-4 text-slate-200">
                    <span>20% Deposit: <strong className="text-white font-mono">{formatCurrency(depositRequired20)}</strong></span>
                    <span>80% Loan: <strong className="text-white font-mono">{formatCurrency(loanAmount80)}</strong></span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
                    Total Upfront Cash Required (Deposit + Costs)
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                    {formatCurrency(totalCashRequired)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. NEXT STEPS & STRATEGIC ROADMAP */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#1A3A5C]/15 pb-2">
              <div className="w-6 h-6 rounded bg-[#1A3A5C] text-white flex items-center justify-center font-bold text-xs">
                6
              </div>
              <h2 className="text-base sm:text-lg font-serif-heading font-bold text-[#1A3A5C] uppercase tracking-wider">
                Immediate Next Steps & Execution Roadmap
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-amber-300 flex items-center justify-center font-bold font-mono text-xs">
                  01
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Contract Offer Submission</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Prepare formal written contract offer of $775,000 subject to 14-day finance & 7-day B&P clause.
                </p>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded block w-fit">
                  Within 24 Hours
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-amber-300 flex items-center justify-center font-bold font-mono text-xs">
                  02
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Conveyancer Contract Review</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Send draft contract to conveyancing solicitor for special conditions and title easement verification.
                </p>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block w-fit">
                  Prior to Signing
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-amber-300 flex items-center justify-center font-bold font-mono text-xs">
                  03
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Formal Bank Valuation</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Broker instructs lender valuation to confirm unconditional loan approval with Macquarie Bank.
                </p>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block w-fit">
                  Days 1 - 7
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-amber-300 flex items-center justify-center font-bold font-mono text-xs">
                  04
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Pre-Settlement Inspection</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Buyers agent conducts final walk-through inspection prior to settlement key handover.
                </p>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block w-fit">
                  Settlement - 48 Hrs
                </span>
              </div>

            </div>
          </section>

          {/* =========================================================================
              REPORT FOOTER & SIGN-OFF BLOCK
             ========================================================================= */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-xs text-slate-500">
            <div>
              <div className="font-serif-heading font-bold text-slate-900 text-sm">
                {advisorName}
              </div>
              <div className="text-slate-600 text-xs">{advisorRole}</div>
              <div className="text-[11px] text-slate-400 font-mono">{advisorLicense}</div>
              <div className="mt-1 flex items-center gap-3 text-slate-600 text-[11px]">
                <span>Iconic Investing Pty Ltd</span>
                <span>•</span>
                <span>advisory@iconicinvesting.com.au</span>
                <span>•</span>
                <span>1300 ICONIC</span>
              </div>
            </div>

            <div className="sm:text-right text-[10px] text-slate-400 max-w-xs space-y-0.5">
              <p className="font-semibold text-slate-500">DISCLAIMER & COMPLIANCE</p>
              <p>
                This buyer report is prepared solely for {client.fullName || client.name}. Market forecasts and rental yield projections are based on independent data and past performance is not guarantee of future return.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
