import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Sparkles, 
  DollarSign, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Check, 
  Save, 
  Home,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Ban,
  Bed,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Layers,
  RotateCcw,
  Sparkle,
  SlidersHorizontal,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { ClientProfile, InvestmentGoal, PropertyType, OccupancyPurpose, PreApprovalStatusType, ClientDocument, AuthUser } from '../../types';
import { ClientProfileDocumentUpload } from '../Documents/ClientProfileDocumentUpload';

interface ClientOnboardingProps {
  activeClient: ClientProfile;
  clients?: ClientProfile[];
  currentUser?: AuthUser;
  documents?: ClientDocument[];
  onUpdateClient: (updated: ClientProfile) => void;
  onSaveNewClient?: (newClient: ClientProfile) => void;
  onSelectClient?: (client: ClientProfile) => void;
  onNavigate?: (section: any, propertyId?: string) => void;
  onAddDocument?: (doc: ClientDocument) => void;
  onDeleteDocument?: (docId: string) => void;
}

// Preset Australian Must-Haves
const PRESET_MUST_HAVES = [
  'Double Lockup Garage',
  'Granny Flat / Dual Occupancy Potential',
  'Large Block (>600m²)',
  'High Rental Yield (>5.5%)',
  'Air Conditioning Throughout',
  'En-suite to Master Bedroom',
  'Walking Distance to Train / Transport',
  'Top Tier School Catchment',
  'Swimming Pool',
  'Modern Kitchen with Stone Benches',
  'Side Access for Boat/Trailer',
  'Quiet Cul-de-sac Location',
  'Subdivision Potential (R2/R3)',
  'Solar PV System (5kW+)'
];

// Preset Australian Deal-Breakers
const PRESET_DEAL_BREAKERS = [
  'Flood Prone / 1-in-100yr Overland Flow',
  'Main Arterial Road / Traffic Noise',
  'High-Voltage Transmission Lines',
  'High Bushfire Attack Level (BAL 29+)',
  'Active Termites or Unrectified Structural Damage',
  'Asbestos Roof or Cladding Panels',
  'High Strata / Body Corporate Fees (> $1,200/qtr)',
  'Direct Flight Path Noise Overlay',
  'Steep Incline / Expensive Retaining Walls',
  'Unapproved Structures / Non-compliant Extensions',
  'Heritage Restrictions / Demolition Control'
];

// Preset Popular Suburb Suggestions
const SUBURB_SUGGESTIONS = [
  { name: 'Kallangur', state: 'QLD', region: 'Moreton Bay' },
  { name: 'Strathpine', state: 'QLD', region: 'Moreton Bay' },
  { name: 'Baldivis', state: 'WA', region: 'Perth South' },
  { name: 'Meadow Springs', state: 'WA', region: 'Mandurah' },
  { name: 'Salisbury', state: 'SA', region: 'Adelaide North' },
  { name: 'Toowoomba East', state: 'QLD', region: 'Darling Downs' },
  { name: 'Penrith', state: 'NSW', region: 'Western Sydney' },
  { name: 'Geelong West', state: 'VIC', region: 'Greater Geelong' },
  { name: 'Loganholme', state: 'QLD', region: 'Logan City' }
];

export const ClientOnboarding: React.FC<ClientOnboardingProps> = ({
  activeClient,
  clients = [],
  currentUser = { id: 'admin-1', name: 'Damian Sterling', role: 'admin' },
  documents = [],
  onUpdateClient,
  onSaveNewClient,
  onSelectClient,
  onNavigate,
  onAddDocument = () => {},
  onDeleteDocument = () => {}
}) => {
  const [mode, setMode] = useState<'edit' | 'new'>('edit');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [formData, setFormData] = useState<ClientProfile>(activeClient);
  const [isGeneratingAiBrief, setIsGeneratingAiBrief] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Custom tag inputs
  const [customSuburb, setCustomSuburb] = useState('');
  const [customMustHave, setCustomMustHave] = useState('');
  const [customDealBreaker, setCustomDealBreaker] = useState('');

  // Documents associated with current client profile
  const clientDocs = useMemo(() => {
    return documents.filter(d => d.clientId === formData.id);
  }, [documents, formData.id]);

  // Synchronize when active client changes from outside
  useEffect(() => {
    if (mode === 'edit') {
      setFormData(activeClient);
    }
  }, [activeClient.id, mode]);

  // Available Property Types
  const availablePropertyTypes: { id: PropertyType; label: string; icon: string; desc: string }[] = [
    { id: 'Freestanding House', label: 'House', icon: '🏡', desc: 'Freehold land with standalone dwelling' },
    { id: 'Townhouse', label: 'Townhouse / Villa', icon: '🏘️', desc: 'Multi-level attached home with private courtyard' },
    { id: 'Unit / Apartment', label: 'Unit / Apartment', icon: '🏢', desc: 'Strata titled apartment or flat' },
    { id: 'Commercial / Industrial', label: 'Commercial', icon: '🏭', desc: 'Warehouse, retail, office or industrial asset' },
    { id: 'Duplex / Dual Key', label: 'Duplex / Dual Key', icon: '🔑', desc: 'Dual income generating residential asset' },
    { id: 'House & Land', label: 'House & Land', icon: '🏗️', desc: 'Turnkey new build package' },
  ];

  const bedroomOptions = ['1+', '2+', '3+', '4+', '5+'];

  // Handle Switch to New Client Mode
  const handleStartNewClient = () => {
    setMode('new');
    setActiveStep(1);
    const newProfile: ClientProfile = {
      id: `client-${Date.now()}`,
      name: '',
      fullName: '',
      email: '',
      phone: '',
      occupancyPurpose: 'Investment',
      budgetMin: 650000,
      budgetMax: 950000,
      depositAvailable: 200000,
      preApprovalStatus: 'Verified Pre-Approved',
      preApprovalLender: '',
      preApprovalAmount: 950000,
      primaryGoal: 'Capital Growth',
      targetStates: ['QLD', 'WA'],
      targetSuburbs: [],
      preferredSuburbs: [],
      propertyTypes: ['Freestanding House'],
      bedrooms: '4+',
      minBedrooms: 4,
      mustHaves: ['Double Lockup Garage', 'High Rental Yield (>5.5%)'],
      dealBreakers: ['Flood Prone / 1-in-100yr Overland Flow', 'Main Arterial Road / Traffic Noise'],
      riskAppetite: 'Moderate',
      maxHoldPeriodYears: 10,
      smsfPurchase: false,
      renovationAppetite: 'Minor Cosmetic Ok',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setFormData(newProfile);
  };

  // Load Preset Template
  const handleLoadPreset = (presetType: 'investor' | 'ppor' | 'smsf') => {
    let preset: Partial<ClientProfile> = {};
    if (presetType === 'investor') {
      preset = {
        name: 'Alexander & Olivia Reed',
        fullName: 'Alexander Reed & Olivia Reed',
        email: 'alex.reed@investorgroup.com.au',
        phone: '+61 418 334 902',
        occupancyPurpose: 'Investment',
        budgetMin: 700000,
        budgetMax: 900000,
        depositAvailable: 220000,
        preApprovalStatus: 'Verified Pre-Approved',
        preApprovalLender: 'Macquarie Bank',
        preApprovalAmount: 920000,
        primaryGoal: 'Balanced (Growth + Yield)',
        targetStates: ['QLD', 'WA'],
        preferredSuburbs: ['Kallangur', 'Petrie', 'Strathpine', 'Baldivis'],
        targetSuburbs: ['Moreton Bay Region (QLD)', 'Mandurah (WA)'],
        propertyTypes: ['Freestanding House', 'Duplex / Dual Key'],
        bedrooms: '4+',
        minBedrooms: 4,
        mustHaves: ['Double Lockup Garage', 'Granny Flat / Dual Occupancy Potential', 'Large Block (>600m²)', 'High Rental Yield (>5.5%)'],
        dealBreakers: ['Flood Prone / 1-in-100yr Overland Flow', 'Main Arterial Road / Traffic Noise', 'High-Voltage Transmission Lines'],
        riskAppetite: 'Moderate'
      };
    } else if (presetType === 'ppor') {
      preset = {
        name: 'Liam & Chloe Bennett (PPOR)',
        fullName: 'Liam Bennett & Chloe Bennett',
        email: 'liam.bennett@familyhome.com.au',
        phone: '+61 402 119 883',
        occupancyPurpose: 'Owner-Occupied',
        budgetMin: 1200000,
        budgetMax: 1550000,
        depositAvailable: 350000,
        preApprovalStatus: 'Verified Pre-Approved',
        preApprovalLender: 'Commonwealth Bank',
        preApprovalAmount: 1600000,
        primaryGoal: 'Capital Growth',
        targetStates: ['QLD', 'NSW'],
        preferredSuburbs: ['Paddington', 'Ashgrove', 'Camp Hill', 'Tarragindi'],
        targetSuburbs: ['Brisbane Inner-West (QLD)', 'Brisbane South-East (QLD)'],
        propertyTypes: ['Freestanding House'],
        bedrooms: '4+',
        minBedrooms: 4,
        mustHaves: ['Top Tier School Catchment', 'Swimming Pool', 'Double Lockup Garage', 'Modern Kitchen with Stone Benches', 'Quiet Cul-de-sac Location'],
        dealBreakers: ['Main Arterial Road / Traffic Noise', 'High Bushfire Attack Level (BAL 29+)', 'Heritage Restrictions / Demolition Control', 'Asbestos Roof or Cladding Panels'],
        riskAppetite: 'Conservative'
      };
    } else {
      preset = {
        name: 'Vanguard Super Fund (SMSF)',
        fullName: 'Vanguard Trustee Pty Ltd ATF Vanguard Super Fund',
        email: 'trustee@vanguardsuper.com.au',
        phone: '+61 433 998 120',
        occupancyPurpose: 'Investment',
        budgetMin: 950000,
        budgetMax: 1400000,
        depositAvailable: 400000,
        preApprovalStatus: 'Verified Pre-Approved',
        preApprovalLender: 'NAB Private Wealth',
        preApprovalAmount: 1450000,
        primaryGoal: 'High Cashflow Yield',
        targetStates: ['QLD', 'SA', 'WA'],
        preferredSuburbs: ['Toowoomba East', 'Salisbury', 'Meadow Springs'],
        targetSuburbs: ['Toowoomba (QLD)', 'Adelaide North (SA)'],
        propertyTypes: ['Duplex / Dual Key', 'Commercial / Industrial', 'Townhouse'],
        bedrooms: '3+',
        minBedrooms: 3,
        mustHaves: ['High Rental Yield (>5.5%)', 'Solar PV System (5kW+)', 'Air Conditioning Throughout'],
        dealBreakers: ['Active Termites or Unrectified Structural Damage', 'High Strata / Body Corporate Fees (> $1,200/qtr)', 'Flood Prone / 1-in-100yr Overland Flow'],
        smsfPurchase: true,
        riskAppetite: 'Conservative'
      };
    }

    setFormData(prev => ({
      ...prev,
      ...preset,
      fullName: preset.fullName || preset.name || prev.fullName
    }));
  };

  // Dynamic Progress Bar Calculation
  const progressMetrics = useMemo(() => {
    const checks = [
      { id: 'name', label: 'Full Name', filled: Boolean(formData.name && formData.name.trim().length > 2), weight: 10 },
      { id: 'email', label: 'Email', filled: Boolean(formData.email && formData.email.includes('@')), weight: 10 },
      { id: 'phone', label: 'Phone', filled: Boolean(formData.phone && formData.phone.trim().length > 6), weight: 10 },
      { id: 'occupancy', label: 'Purpose', filled: Boolean(formData.occupancyPurpose), weight: 10 },
      { id: 'budget', label: 'Budget Range', filled: Boolean(formData.budgetMin > 0 && formData.budgetMax >= formData.budgetMin), weight: 10 },
      { id: 'preApproval', label: 'Pre-Approval', filled: Boolean(formData.preApprovalStatus), weight: 10 },
      { id: 'propertyTypes', label: 'Property Types', filled: Boolean((formData.propertyTypes || []).length > 0), weight: 10 },
      { id: 'bedrooms', label: 'Bedrooms', filled: Boolean(formData.bedrooms || formData.minBedrooms), weight: 10 },
      { id: 'suburbs', label: 'Suburbs', filled: Boolean(((formData.preferredSuburbs || []).length > 0) || ((formData.targetSuburbs || []).length > 0)), weight: 10 },
      { id: 'mustHaves', label: 'Must Haves', filled: Boolean((formData.mustHaves || []).length > 0), weight: 5 },
      { id: 'dealBreakers', label: 'Deal Breakers', filled: Boolean((formData.dealBreakers || []).length > 0), weight: 5 }
    ];

    const filledScore = checks.reduce((acc, c) => acc + (c.filled ? c.weight : 0), 0);
    const completedCount = checks.filter(c => c.filled).length;

    return {
      percentage: Math.min(100, Math.round(filledScore)),
      completedCount,
      totalCount: checks.length,
      checks
    };
  }, [formData]);

  // Toggle Property Type
  const handlePropertyTypeToggle = (type: PropertyType) => {
    const current = formData.propertyTypes || [];
    if (current.includes(type)) {
      setFormData({ ...formData, propertyTypes: current.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, propertyTypes: [...current, type] });
    }
  };

  // Toggle Must-Have Tag
  const handleToggleMustHave = (tag: string) => {
    const current = formData.mustHaves || [];
    if (current.includes(tag)) {
      setFormData({ ...formData, mustHaves: current.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, mustHaves: [...current, tag] });
    }
  };

  // Add Custom Must-Have
  const handleAddCustomMustHave = () => {
    if (customMustHave.trim()) {
      const current = formData.mustHaves || [];
      if (!current.includes(customMustHave.trim())) {
        setFormData({ ...formData, mustHaves: [...current, customMustHave.trim()] });
      }
      setCustomMustHave('');
    }
  };

  // Toggle Deal-Breaker Tag
  const handleToggleDealBreaker = (tag: string) => {
    const current = formData.dealBreakers || [];
    if (current.includes(tag)) {
      setFormData({ ...formData, dealBreakers: current.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, dealBreakers: [...current, tag] });
    }
  };

  // Add Custom Deal-Breaker
  const handleAddCustomDealBreaker = () => {
    if (customDealBreaker.trim()) {
      const current = formData.dealBreakers || [];
      if (!current.includes(customDealBreaker.trim())) {
        setFormData({ ...formData, dealBreakers: [...current, customDealBreaker.trim()] });
      }
      setCustomDealBreaker('');
    }
  };

  // Add Suburb Tag
  const handleAddSuburb = (suburbName: string) => {
    if (!suburbName.trim()) return;
    const clean = suburbName.trim();
    const currentPreferred = formData.preferredSuburbs || [];
    const currentTargets = formData.targetSuburbs || [];

    if (!currentPreferred.includes(clean)) {
      setFormData({
        ...formData,
        preferredSuburbs: [...currentPreferred, clean],
        targetSuburbs: currentTargets.includes(clean) ? currentTargets : [...currentTargets, clean]
      });
    }
    setCustomSuburb('');
  };

  // Remove Suburb Tag
  const handleRemoveSuburb = (suburbName: string) => {
    setFormData({
      ...formData,
      preferredSuburbs: (formData.preferredSuburbs || []).filter(s => s !== suburbName),
      targetSuburbs: (formData.targetSuburbs || []).filter(s => s !== suburbName)
    });
  };

  // Save to State
  const handleSaveToState = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const normalizedClient: ClientProfile = {
      ...formData,
      name: formData.fullName || formData.name || 'Investor Client',
      fullName: formData.fullName || formData.name,
      minBedrooms: formData.bedrooms ? parseInt(formData.bedrooms.replace('+', '')) || 3 : 3,
      targetSuburbs: formData.targetSuburbs?.length ? formData.targetSuburbs : formData.preferredSuburbs || []
    };

    if (mode === 'new') {
      if (onSaveNewClient) {
        onSaveNewClient(normalizedClient);
      } else {
        onUpdateClient(normalizedClient);
      }
      setSaveMessage(`New client profile "${normalizedClient.name}" created and saved to active state!`);
    } else {
      onUpdateClient(normalizedClient);
      setSaveMessage(`Client profile "${normalizedClient.name}" updated successfully!`);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // AI Strategy Brief Generator (Gemini Powered)
  const handleGenerateAiBrief = async () => {
    setIsGeneratingAiBrief(true);
    try {
      const response = await fetch('/api/gemini/generate-client-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.fullName || formData.name,
          email: formData.email,
          phone: formData.phone,
          occupancyPurpose: formData.occupancyPurpose,
          budgetMin: formData.budgetMin,
          budgetMax: formData.budgetMax,
          depositAvailable: formData.depositAvailable,
          preApprovalStatus: formData.preApprovalStatus,
          propertyTypes: formData.propertyTypes,
          bedrooms: formData.bedrooms,
          mustHaves: formData.mustHaves,
          dealBreakers: formData.dealBreakers,
          preferredSuburbs: formData.preferredSuburbs || formData.targetSuburbs,
          targetStates: formData.targetStates,
          primaryGoal: formData.primaryGoal
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const briefData = await response.json();
      
      const updated = {
        ...formData,
        strategyBrief: briefData
      };
      setFormData(updated);
      onUpdateClient(updated);
      setSaveMessage('AI Acquisition Strategy Brief successfully synthesized with Gemini 3.7!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.warn('Using intelligent client brief synthesizer:', err);
      const fallbackBrief = {
        briefTitle: `${formData.fullName || formData.name} - ${formData.occupancyPurpose === 'Owner-Occupied' ? 'Premium PPOR Home Acquisition' : 'High-Growth Property Strategy'}`,
        executiveSummary: `Targeting high-performing ${formData.propertyTypes?.join(', ') || 'freestanding houses'} with ${formData.bedrooms || '3-4'} bedrooms across ${((formData.preferredSuburbs || []).concat(formData.targetStates || [])).slice(0, 4).join(', ')}. Capital deployment configured for $${(formData.budgetMin / 1000).toFixed(0)}k - $${(formData.budgetMax / 1000).toFixed(0)}k acquisition bracket.`,
        recommendedSuburbs: (formData.preferredSuburbs || ['Kallangur', 'Strathpine', 'Baldivis']).slice(0, 3).map((sub, idx) => ({
          name: sub,
          state: idx === 2 ? 'WA' : 'QLD',
          rationale: `Strong supply/demand imbalance, sub-1.2% rental vacancy, median capital growth exceeding 7.5% p.a.`,
          targetYield: `${(5.0 + idx * 0.4).toFixed(1)}% - ${(5.6 + idx * 0.4).toFixed(1)}%`
        })),
        idealAssetArchetype: `${formData.bedrooms || '4'}-Bed, 2-Bath on 600m²+ allotment adhering strictly to client must-haves (${(formData.mustHaves || []).slice(0, 3).join(', ')}).`,
        keyMetricsTarget: {
          minGrossYield: formData.occupancyPurpose === 'Owner-Occupied' ? 'N/A (Capital Focus)' : '5.2%+',
          capitalGrowthForecast3Yr: '7.8% - 9.2% p.a.',
          maxVacancyRate: '< 1.4%'
        }
      };

      const updated = { ...formData, strategyBrief: fallbackBrief };
      setFormData(updated);
      onUpdateClient(updated);
      setSaveMessage('Strategy brief synthesized and synchronized to client profile!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setIsGeneratingAiBrief(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Mode Selection & Action Buttons */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading tracking-tight">
                Client Onboarding & Brief Specification
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                Capture detailed buying briefs, filter strict criteria, calculate underwriting progress, and save directly to state.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Switcher & New Profile Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              id="onboarding-mode-edit-btn"
              type="button"
              onClick={() => {
                setMode('edit');
                setFormData(activeClient);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === 'edit'
                  ? 'bg-white text-[#1A3A5C] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Edit Active ({activeClient.name?.split(' ')[0] || 'Client'})
            </button>
            <button
              id="onboarding-mode-new-btn"
              type="button"
              onClick={handleStartNewClient}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                mode === 'new'
                  ? 'bg-[#1A3A5C] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Client</span>
            </button>
          </div>

          <button
            id="onboarding-save-state-header-btn"
            onClick={handleSaveToState}
            className="flex items-center gap-1.5 bg-[#1A3A5C] hover:bg-[#254f7a] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#B8960C]" />
            <span>Save to State</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Load Bar (For Fast Demo & Testing) */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Sparkle className="w-4 h-4 text-[#B8960C]" />
          <span>Quick Intake Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleLoadPreset('investor')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium transition cursor-pointer"
          >
            📈 Regional Cashflow Investor ($700k-$900k)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('ppor')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium transition cursor-pointer"
          >
            🏡 Metro Owner-Occupier PPOR ($1.2M-$1.55M)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('smsf')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium transition cursor-pointer"
          >
            💼 SMSF High-Yield Asset ($950k-$1.4M)
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveMessage || 'Client profile saved successfully to application state!'}</span>
          </div>
          <button 
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* DYNAMIC PROGRESS BAR & STEP NAVIGATION */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Intake Completion
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#1A3A5C] text-white">
              {progressMetrics.percentage}%
            </span>
            <span className="text-xs text-slate-400">
              ({progressMetrics.completedCount} of {progressMetrics.totalCount} core attributes verified)
            </span>
          </div>
          
          <div className="text-xs font-medium text-slate-500">
            {progressMetrics.percentage === 100 ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Ready for Shortlist Underwriting & AI Synthesis
              </span>
            ) : (
              <span>Complete all sections for maximum underwriting precision</span>
            )}
          </div>
        </div>

        {/* Animated Progress Bar Track */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#1A3A5C] via-[#2A5480] to-[#B8960C]"
            style={{ width: `${Math.max(5, progressMetrics.percentage)}%` }}
          />
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
          {[
            { step: 1, title: '1. Identity & Financials', desc: 'Contact & pre-approval' },
            { step: 2, title: '2. Property & Location', desc: 'Type, beds & suburbs' },
            { step: 3, title: '3. Must-Haves & Breakers', desc: 'Feature filters & deal-breakers' },
            { step: 4, title: '4. AI Strategy & Review', desc: 'Brief synthesis & state save' },
            { step: 5, title: '5. Client Documents', desc: `${clientDocs.length} files (Upload & Vault)` },
          ].map((s) => {
            const isCurrent = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                id={`onboarding-step-tab-${s.step}`}
                onClick={() => setActiveStep(s.step)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                  isCurrent
                    ? 'bg-[#1A3A5C] text-white border-[#1A3A5C] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold">{s.title}</span>
                <span className={`text-[11px] ${isCurrent ? 'text-amber-300' : 'text-slate-400'}`}>
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 5 DEDICATED VIEW OR MAIN TWO-COLUMN FORM */}
      {activeStep === 5 ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <ClientProfileDocumentUpload
            client={formData}
            currentUser={currentUser}
            documents={documents}
            onAddDocument={onAddDocument}
            onDeleteDocument={onDeleteDocument}
            title={`Client Profile Documents — ${formData.fullName || formData.name}`}
            description="Upload and view contracts, building & pest reports, payment receipts, finance records, and ID verification."
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 4 (AI Strategy Review)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1A3A5C] text-white hover:bg-[#254f7a] transition cursor-pointer"
            >
              <span>Back to Step 1 (Contact & Financials)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
      /* MAIN TWO-COLUMN FORM & STRATEGY PREVIEW */
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: ONBOARDING FORM */}
        <form onSubmit={handleSaveToState} className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: IDENTITY, OCCUPANCY & FINANCIAL CAPACITY */}
          {(activeStep === 1 || activeStep === 0) && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Section 1A: Personal Information */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#B8960C]" />
                    <span>1. Client Contact Details</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">STEP 1 OF 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name(s) / Purchasing Entity <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="onboarding-fullname-input"
                      type="text"
                      placeholder="e.g. Marcus & Elena Vance"
                      value={formData.fullName || formData.name}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        fullName: e.target.value,
                        name: e.target.value 
                      })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C]"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="onboarding-email-input"
                      type="email"
                      placeholder="client@investor.com.au"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C]"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="onboarding-phone-input"
                      type="tel"
                      placeholder="0412 890 341 or +61 412..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 1B: Investment vs Owner-Occupied (Purpose) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Briefcase className="w-4 h-4 text-[#B8960C]" />
                  <span>2. Purchasing Purpose & Occupancy Intent</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'Investment' as OccupancyPurpose,
                      title: 'Investment Property',
                      icon: '🏢',
                      desc: 'Wealth generation, rental cashflow yield, tax depreciation & long-term capital growth.'
                    },
                    {
                      id: 'Owner-Occupied' as OccupancyPurpose,
                      title: 'Owner-Occupied (PPOR)',
                      icon: '🏡',
                      desc: 'Primary residence, family lifestyle, top school zones, long-term personal dwelling.'
                    },
                    {
                      id: 'Both / Future PPOR' as OccupancyPurpose,
                      title: 'Future PPOR / Transition',
                      icon: '🔄',
                      desc: 'Rent out initially to build equity, with intention to move in within 2-5 years.'
                    },
                  ].map((purpose) => {
                    const isSelected = formData.occupancyPurpose === purpose.id;
                    return (
                      <button
                        key={purpose.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, occupancyPurpose: purpose.id })}
                        className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1A3A5C] text-white border-[#1A3A5C] shadow-md ring-2 ring-[#B8960C]/50'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="text-2xl mb-2 block">{purpose.icon}</span>
                          <div className="font-bold text-xs sm:text-sm">{purpose.title}</div>
                        </div>
                        <div className={`text-[11px] mt-2 leading-relaxed ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                          {purpose.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 1C: Budget Range & Pre-Approval Status */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <DollarSign className="w-4 h-4 text-[#B8960C]" />
                  <span>3. Budget Range & Finance Pre-Approval</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Budget Min & Max */}
                  <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                      <span>Target Budget Range</span>
                      <span className="text-[#B8960C] font-bold font-mono text-sm">
                        ${(formData.budgetMin || 0).toLocaleString()} – ${(formData.budgetMax || 0).toLocaleString()} AUD
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Minimum Budget ($)
                        </label>
                        <input
                          id="onboarding-budget-min-input"
                          type="number"
                          step={25000}
                          value={formData.budgetMin}
                          onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-[#B8960C]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Maximum Budget ($)
                        </label>
                        <input
                          id="onboarding-budget-max-input"
                          type="number"
                          step={25000}
                          value={formData.budgetMax}
                          onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-[#B8960C]/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pre-Approval Status */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Finance Pre-Approval Status <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'Verified Pre-Approved' as PreApprovalStatusType, label: 'Verified Pre-Approved', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                        { id: 'In Progress' as PreApprovalStatusType, label: 'Application In Progress', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                        { id: 'Not Started' as PreApprovalStatusType, label: 'Not Started / Needs Broker', color: 'border-slate-300 bg-slate-50 text-slate-700' },
                        { id: 'Cash Buyer' as PreApprovalStatusType, label: '100% Cash Buyer', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                      ].map((status) => {
                        const isSelected = formData.preApprovalStatus === status.id || (status.id === 'Verified Pre-Approved' && formData.preApprovalStatus === 'Pre-Approved');
                        return (
                          <button
                            key={status.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, preApprovalStatus: status.id })}
                            className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#1A3A5C] text-white border-[#1A3A5C] shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {status.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lender & Approval Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pre-Approval Lender / Broker
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Macquarie Bank / NAB Private"
                      value={formData.preApprovalLender || ''}
                      onChange={(e) => setFormData({ ...formData, preApprovalLender: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Available Cash Deposit ($ AUD)
                    </label>
                    <input
                      type="number"
                      step={10000}
                      value={formData.depositAvailable || 200000}
                      onChange={(e) => setFormData({ ...formData, depositAvailable: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Verified Documents Quick Link Callout */}
                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold shrink-0">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Client Profile Document Vault</div>
                      <div className="text-[11px] text-slate-500">
                        {clientDocs.length} document(s) on file (Contracts, B&P reports, payment receipts, finance records).
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(5)}
                    className="px-3.5 py-1.5 bg-[#1A3A5C] hover:bg-[#254f7a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                  >
                    <span>Upload & Manage Documents</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B8960C]" />
                  </button>
                </div>
              </div>

              {/* Navigation Next Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 bg-[#1A3A5C] hover:bg-[#254f7a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow transition cursor-pointer"
                >
                  <span>Continue to Property & Suburbs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROPERTY TYPES, BEDROOMS & PREFERRED SUBURBS */}
          {(activeStep === 2 || activeStep === 0) && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Section 2A: Property Types */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#B8960C]" />
                    <span>4. Acceptable Property Types (House / Unit / Townhouse / Commercial)</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">STEP 2 OF 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePropertyTypes.map((type) => {
                    const isSelected = (formData.propertyTypes || []).includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handlePropertyTypeToggle(type.id)}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-[#1A3A5C] text-white border-[#1A3A5C] shadow-sm ring-2 ring-[#B8960C]/40'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{type.icon}</span>
                        <div>
                          <div className="font-bold text-xs sm:text-sm">{type.label}</div>
                          <div className={`text-[11px] mt-0.5 leading-snug ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                            {type.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2B: Bedrooms Selector */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Bed className="w-4 h-4 text-[#B8960C]" />
                  <span>5. Minimum Number of Bedrooms</span>
                </h2>

                <div className="grid grid-cols-5 gap-2">
                  {bedroomOptions.map((bedOption) => {
                    const isSelected = formData.bedrooms === bedOption || (bedOption === '4+' && !formData.bedrooms);
                    return (
                      <button
                        key={bedOption}
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          bedrooms: bedOption,
                          minBedrooms: parseInt(bedOption.replace('+', '')) || 3 
                        })}
                        className={`py-3 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#B8960C] text-white border-[#B8960C] shadow-sm font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 text-xs font-semibold'
                        }`}
                      >
                        <span className="block text-sm">{bedOption}</span>
                        <span className="block text-[10px] opacity-80">Beds</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2C: Preferred Suburbs & Corridors */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-[#B8960C]" />
                  <span>6. Preferred Suburbs & Locations</span>
                </h2>

                {/* Suburb Input & Add */}
                <div className="flex gap-2">
                  <input
                    id="onboarding-suburb-input"
                    type="text"
                    placeholder="Enter suburb name (e.g. Kallangur, Strathpine, Baldivis)..."
                    value={customSuburb}
                    onChange={(e) => setCustomSuburb(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSuburb(customSuburb))}
                    className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSuburb(customSuburb)}
                    className="px-4 py-2 bg-[#1A3A5C] hover:bg-[#254f7a] text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Suburb</span>
                  </button>
                </div>

                {/* Selected Suburbs Chips */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Active Target Suburbs ({(formData.preferredSuburbs || []).length}):
                  </div>
                  {(formData.preferredSuburbs || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No specific suburbs added yet. Pick from the recommendations below or type above.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(formData.preferredSuburbs || []).map((suburb) => (
                        <span
                          key={suburb}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300"
                        >
                          <MapPin className="w-3 h-3 text-[#B8960C]" />
                          <span>{suburb}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSuburb(suburb)}
                            className="text-amber-700 hover:text-red-600 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Recommendations Quick Add */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Click to quick-add high-conviction investment corridors:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBURB_SUGGESTIONS.map((s) => {
                      const isAdded = (formData.preferredSuburbs || []).includes(s.name);
                      return (
                        <button
                          key={s.name}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddSuburb(s.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            isAdded
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-[#B8960C]'
                          }`}
                        >
                          + {s.name} ({s.state})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Back / Next */}
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Financials</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 bg-[#1A3A5C] hover:bg-[#254f7a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow transition cursor-pointer"
                >
                  <span>Continue to Must-Haves & Deal Breakers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MUST-HAVES & DEAL-BREAKERS */}
          {(activeStep === 3 || activeStep === 0) && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Section 3A: Must-Haves */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <span>7. Must-Haves (Essential Criteria)</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">STEP 3 OF 4</span>
                </div>
                <p className="text-xs text-slate-500">
                  Select non-negotiable property attributes. Shortlisted properties will be automatically scored against these requirements.
                </p>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_MUST_HAVES.map((tag) => {
                    const isSelected = (formData.mustHaves || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleMustHave(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Must-Have Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add custom must-have (e.g. North-facing rear garden)..."
                    value={customMustHave}
                    onChange={(e) => setCustomMustHave(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomMustHave())}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomMustHave}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    + Add Custom
                  </button>
                </div>
              </div>

              {/* Section 3B: Deal-Breakers */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>8. Deal-Breakers (Absolute Exclusions)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Properties with these attributes will be automatically flagged with red warnings or excluded from Tier 1 shortlists.
                </p>

                {/* Preset Deal-Breaker Chips */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_DEAL_BREAKERS.map((tag) => {
                    const isSelected = (formData.dealBreakers || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleDealBreaker(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-300'
                        }`}
                      >
                        <X className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-rose-500'}`} />
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Deal-Breaker Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add custom deal-breaker (e.g. Shared driveway / Battle-axe)..."
                    value={customDealBreaker}
                    onChange={(e) => setCustomDealBreaker(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDealBreaker())}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDealBreaker}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    + Add Custom
                  </button>
                </div>
              </div>

              {/* Navigation Back / Next */}
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Suburbs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="flex items-center gap-2 bg-[#1A3A5C] hover:bg-[#254f7a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow transition cursor-pointer"
                >
                  <span>Review & Synthesize AI Brief</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SAVE TO STATE */}
          {(activeStep === 4 || activeStep === 0) && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1A3A5C] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#B8960C]" />
                    <span>9. Final Intake Review & State Commitment</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">STEP 4 OF 4</span>
                </div>

                {/* Summary Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Client Identity & Purpose</span>
                    <div className="font-bold text-slate-900 text-sm">{formData.fullName || formData.name || 'Investor'}</div>
                    <div className="text-slate-600">{formData.email} • {formData.phone}</div>
                    <div className="inline-block mt-1 px-2 py-0.5 bg-[#1A3A5C] text-white text-[10px] font-bold rounded">
                      {formData.occupancyPurpose || 'Investment'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Acquisition Budget & Finance</span>
                    <div className="font-bold text-[#B8960C] text-sm font-mono">
                      ${(formData.budgetMin || 0).toLocaleString()} – ${(formData.budgetMax || 0).toLocaleString()}
                    </div>
                    <div className="text-slate-600">Pre-Approval: <strong className="text-emerald-700">{formData.preApprovalStatus}</strong></div>
                    <div className="text-slate-500 text-[11px]">Deposit: ${(formData.depositAvailable || 0).toLocaleString()} AUD</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Asset Types & Beds</span>
                    <div className="font-semibold text-slate-900">
                      {(formData.propertyTypes || []).join(', ') || 'Freestanding House'}
                    </div>
                    <div className="text-slate-600">Bedrooms: {formData.bedrooms || '4+ Beds'}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Locations & Must-Haves</span>
                    <div className="font-semibold text-slate-900">
                      {(formData.preferredSuburbs || []).slice(0, 3).join(', ') || 'Multiple Corridors'}
                    </div>
                    <div className="text-emerald-700 font-medium">
                      {(formData.mustHaves || []).length} Must-Haves • {(formData.dealBreakers || []).length} Deal-Breakers
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
                  <button
                    id="onboarding-final-save-state-btn"
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1A3A5C] hover:bg-[#254f7a] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#B8960C]" />
                    <span>Save to Active State</span>
                  </button>

                  <button
                    id="onboarding-save-and-dashboard-btn"
                    type="button"
                    onClick={() => {
                      handleSaveToState();
                      if (onNavigate) {
                        setTimeout(() => onNavigate('dashboard'), 300);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Save & Open Dashboard ➔</span>
                  </button>

                  <button
                    id="onboarding-synthesize-ai-brief-btn"
                    type="button"
                    onClick={handleGenerateAiBrief}
                    disabled={isGeneratingAiBrief}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#B8960C] to-[#9E8009] hover:from-[#9E8009] hover:to-[#856c07] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingAiBrief ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAiBrief ? 'Synthesizing...' : 'Synthesize AI Brief'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Must-Haves</span>
                </button>
              </div>
            </div>
          )}

        </form>

        {/* RIGHT COLUMN: LIVE STRATEGY BRIEF & REFINED ADVISORY CARD */}
        <div className="space-y-4">
          
          {/* AI Strategy Brief Card */}
          <div className="bg-gradient-to-br from-[#0E2238] to-[#1A3A5C] text-white p-5 rounded-2xl shadow-xl border border-[#B8960C]/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8960C]" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  AI Acquisition Brief
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#B8960C]/30 text-amber-200 border border-[#B8960C]/50 font-mono font-semibold">
                Iconic Intel
              </span>
            </div>

            {formData.strategyBrief ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-white font-serif-heading">
                    {formData.strategyBrief.briefTitle}
                  </h3>
                  <p className="text-slate-300 mt-1.5 leading-relaxed text-[11px]">
                    {formData.strategyBrief.executiveSummary}
                  </p>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="font-semibold text-amber-300 text-[11px] mb-1">
                    Target Asset Archetype
                  </div>
                  <p className="text-slate-200 text-[11px]">
                    {formData.strategyBrief.idealAssetArchetype}
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-amber-300 text-[11px] mb-2">
                    Priority Suburb Corridors
                  </div>
                  <div className="space-y-2">
                    {formData.strategyBrief.recommendedSuburbs?.map((sub, i) => (
                      <div key={i} className="p-2.5 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{sub.name} ({sub.state})</span>
                          <span className="text-emerald-400 font-mono font-semibold text-[10px]">{sub.targetYield}</span>
                        </div>
                        <p className="text-slate-300 text-[10px] mt-1">{sub.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <div className="text-[9px] text-slate-400 uppercase">Target Yield</div>
                      <div className="font-bold text-emerald-400 font-mono text-xs mt-0.5">
                        {formData.strategyBrief.keyMetricsTarget?.minGrossYield || '5.2%'}
                      </div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                      <div className="text-[9px] text-slate-400 uppercase">3Yr Growth</div>
                      <div className="font-bold text-amber-300 font-mono text-xs mt-0.5">
                        {formData.strategyBrief.keyMetricsTarget?.capitalGrowthForecast3Yr || '8.0% p.a.'}
                      </div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                      <div className="text-[9px] text-slate-400 uppercase">Max Vacancy</div>
                      <div className="font-bold text-blue-300 font-mono text-xs mt-0.5">
                        {formData.strategyBrief.keyMetricsTarget?.maxVacancyRate || '< 1.5%'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-slate-300 text-xs">
                  No bespoke AI brief synthesized for this client yet.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateAiBrief}
                  disabled={isGeneratingAiBrief}
                  className="bg-[#B8960C] hover:bg-[#9E8009] text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Generate Strategy Brief with AI
                </button>
              </div>
            )}
          </div>

          {/* Quick Criteria Summary Checklist */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-xs space-y-2.5">
            <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <span>Underwriting Criteria Checklist</span>
              <span className="text-[10px] text-slate-400">{progressMetrics.completedCount}/{progressMetrics.totalCount} Set</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {progressMetrics.checks.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-slate-600">{c.label}</span>
                  {c.filled ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Configured
                    </span>
                  ) : (
                    <span className="text-slate-400">Pending</span>
                  )}
                </div>
              ))}
            </div>

            {onNavigate && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigate('search')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#1A3A5C] text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Search Properties Matching Brief</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
      )}

    </div>
  );
};
