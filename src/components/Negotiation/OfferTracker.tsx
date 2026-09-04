import React, { useState } from 'react';
import { 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle, 
  Send, 
  Copy, 
  History, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  User,
  Check,
  Plus,
  Calendar,
  Layers,
  Scale,
  Building,
  AlertTriangle,
  RotateCcw,
  Trophy,
  Ban,
  Filter,
  CheckSquare,
  Square,
  ChevronRight,
  ExternalLink,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Property, 
  OfferNegotiation, 
  OfferOutcome, 
  OfferStatus, 
  NegotiationStep, 
  OfferConditions,
  AppSection 
} from '../../types';

interface OfferTrackerProps {
  properties: Property[];
  selectedPropertyId?: string;
  offers: OfferNegotiation[];
  onUpdateOffer: (offer: OfferNegotiation) => void;
  onNavigate: (section: AppSection, propertyId?: string) => void;
  onAcceptOfferToSettlement: (offer: OfferNegotiation) => void;
}

export const OfferTracker: React.FC<OfferTrackerProps> = ({
  properties,
  selectedPropertyId,
  offers,
  onUpdateOffer,
  onNavigate,
  onAcceptOfferToSettlement
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(() => {
    if (selectedPropertyId) {
      const match = offers.find(o => o.propertyId === selectedPropertyId);
      if (match) return match.id;
    }
    return offers.length > 0 ? offers[0].id : '';
  });

  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'Under Negotiation' | 'Won' | 'Lost' | 'Withdrawn'>('ALL');

  const activeOffer = offers.find(o => o.id === selectedOfferId) || offers[0];
  const activeProperty = properties.find(p => p.id === activeOffer?.propertyId) || properties[0];

  // Counter-offer form states
  const [counterAmount, setCounterAmount] = useState<number>(
    activeOffer ? (activeOffer.vendorCounterOffer || activeOffer.currentOfferPrice + 5000) : 772500
  );
  const [counterDate, setCounterDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [counterParty, setCounterParty] = useState<'Buyer (Buyers Agent)' | 'Vendor / Selling Agent' | 'Legal / Conveyancer'>(
    'Buyer (Buyers Agent)'
  );
  const [counterTitle, setCounterTitle] = useState<string>('Revised Counter-Offer Position');
  const [counterTerms, setCounterTerms] = useState<string>('10% deposit, standard settlement terms');
  const [counterConditions, setCounterConditions] = useState<string>('Finance: 14 Days | B&P: 7 Days');
  const [counterNotes, setCounterNotes] = useState<string>('');

  // Modals & UI helpers
  const [isGeneratingAdvisor, setIsGeneratingAdvisor] = useState<boolean>(false);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [copiedTimeline, setCopiedTimeline] = useState<boolean>(false);
  const [showNewOfferModal, setShowNewOfferModal] = useState<boolean>(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState<boolean>(false);
  const [targetOutcome, setTargetOutcome] = useState<OfferOutcome>('Won');
  const [outcomeAgreedPrice, setOutcomeAgreedPrice] = useState<number>(activeOffer?.currentOfferPrice || 705000);
  const [outcomeNotesInput, setOutcomeNotesInput] = useState<string>('');

  // New Deal Form State
  const [newDealPropertyId, setNewDealPropertyId] = useState<string>(properties[0]?.id || '');
  const [newDealListPrice, setNewDealListPrice] = useState<number>(properties[0]?.priceGuide || 750000);
  const [newDealInitialOffer, setNewDealInitialOffer] = useState<number>(730000);
  const [newDealOfferDate, setNewDealOfferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDealSettlementDate, setNewDealSettlementDate] = useState<string>('2026-10-15');
  const [newDealDeposit, setNewDealDeposit] = useState<number>(73000);
  const [newDealFinance, setNewDealFinance] = useState<boolean>(true);
  const [newDealFinanceDays, setNewDealFinanceDays] = useState<number>(14);
  const [newDealBP, setNewDealBP] = useState<boolean>(true);
  const [newDealBPDays, setNewDealBPDays] = useState<number>(7);
  const [newDealSpecialConditions, setNewDealSpecialConditions] = useState<string>(
    'Subject to satisfactory finance approval within 14 days\nSubject to AS 4349.1 building & pest inspection satisfied within 7 days'
  );

  // Sync external property selection
  React.useEffect(() => {
    if (selectedPropertyId) {
      const match = offers.find(o => o.propertyId === selectedPropertyId);
      if (match) {
        setSelectedOfferId(match.id);
      }
    }
  }, [selectedPropertyId, offers]);

  // Sync counter amount default when active offer changes
  React.useEffect(() => {
    if (activeOffer) {
      setCounterAmount(
        activeOffer.vendorCounterOffer 
          ? Math.round((activeOffer.currentOfferPrice + activeOffer.vendorCounterOffer) / 2)
          : activeOffer.currentOfferPrice + 5000
      );
      setOutcomeAgreedPrice(activeOffer.vendorCounterOffer || activeOffer.currentOfferPrice);
    }
  }, [activeOffer]);

  // Filtered offers list
  const filteredOffers = offers.filter(o => {
    if (outcomeFilter === 'ALL') return true;
    return o.outcome === outcomeFilter;
  });

  // Analytics Metrics
  const totalOffersCount = offers.length;
  const wonOffers = offers.filter(o => o.outcome === 'Won');
  const lostOffers = offers.filter(o => o.outcome === 'Lost');
  const withdrawnOffers = offers.filter(o => o.outcome === 'Withdrawn');
  const activeOffers = offers.filter(o => o.outcome === 'Under Negotiation');

  const winRate = totalOffersCount > 0 
    ? Math.round((wonOffers.length / (totalOffersCount - activeOffers.length || 1)) * 100) 
    : 0;

  const totalWonValue = wonOffers.reduce((acc, o) => acc + (o.finalAgreedPrice || o.currentOfferPrice), 0);
  
  const totalDiscountsSecured = wonOffers.reduce((acc, o) => {
    const list = o.listPrice || o.listedPrice || 0;
    const final = o.finalAgreedPrice || o.currentOfferPrice || 0;
    return acc + Math.max(0, list - final);
  }, 0);

  const handleGenerateAdvisor = async () => {
    if (!activeOffer) return;
    setIsGeneratingAdvisor(true);

    try {
      const response = await fetch('/api/gemini/negotiation-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: {
            address: activeOffer.propertyAddress,
            listedPrice: activeOffer.listPrice || activeOffer.listedPrice,
            agentName: activeOffer.sellingAgentName,
            counterOfferPrice: counterAmount
          },
          currentOffer: activeOffer.currentOfferPrice,
          counterOffer: activeOffer.vendorCounterOffer || activeOffer.vendorCounterPrice,
          vendorMotivation: activeOffer.vendorMotivation,
          stage: activeOffer.status,
          daysOnMarket: 21
        })
      });

      if (!response.ok) throw new Error('Advisor API failed');
      const adviceData = await response.json();

      const updatedOffer: OfferNegotiation = {
        ...activeOffer,
        aiAdvice: adviceData
      };
      onUpdateOffer(updatedOffer);
      if (adviceData.recommendedCounter) {
        setCounterAmount(adviceData.recommendedCounter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAdvisor(false);
    }
  };

  const handleAddTimelineStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOffer) return;

    const nextStepNum = (activeOffer.timeline?.length || 0) + 1;
    const newStep: NegotiationStep = {
      id: `step-${Date.now()}`,
      stepNumber: nextStepNum,
      date: counterDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      party: counterParty,
      title: counterTitle || (counterParty.includes('Buyer') ? 'Buyer Counter-Offer' : 'Vendor Counter-Offer'),
      amount: counterAmount,
      terms: counterTerms || `${activeOffer.depositPercent}% deposit, ${activeOffer.settlementDays} days settlement.`,
      conditions: counterConditions,
      notes: counterNotes || 'Transmitted written communication to selling agent.',
      statusBadge: counterParty.includes('Buyer') ? 'Counter-Offer' : 'Vendor Response'
    };

    const newHistoryItem = {
      id: `h-${Date.now()}`,
      timestamp: `${counterDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      party: counterParty.includes('Buyer') ? 'Buyer (Buyers Agent)' as const : 'Vendor / Selling Agent' as const,
      amount: counterAmount,
      terms: counterTerms,
      notes: counterNotes
    };

    const updated: OfferNegotiation = {
      ...activeOffer,
      currentOfferPrice: counterParty.includes('Buyer') ? counterAmount : activeOffer.currentOfferPrice,
      vendorCounterOffer: counterParty.includes('Vendor') ? counterAmount : activeOffer.vendorCounterOffer,
      status: counterParty.includes('Buyer') ? 'Offer Submitted' : 'Under Counter-Offer',
      timeline: [...(activeOffer.timeline || []), newStep],
      history: [...(activeOffer.history || []), newHistoryItem]
    };

    onUpdateOffer(updated);
    setCounterNotes('');
  };

  const handleOpenOutcomeModal = (outcome: OfferOutcome) => {
    setTargetOutcome(outcome);
    if (outcome === 'Won') {
      setOutcomeAgreedPrice(activeOffer?.vendorCounterOffer || activeOffer?.currentOfferPrice || 705000);
      setOutcomeNotesInput('Contracts exchanged and deposit transferred to selling agency trust account.');
    } else if (outcome === 'Lost') {
      setOutcomeNotesInput('Vendor accepted competing buyer offer above our disciplined valuation ceiling.');
    } else if (outcome === 'Withdrawn') {
      setOutcomeNotesInput('Offer withdrawn by buyers agency following building & pest defect findings.');
    }
    setShowOutcomeModal(true);
  };

  const handleConfirmOutcome = () => {
    if (!activeOffer) return;

    if (targetOutcome === 'Won') {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    const nextStepNum = (activeOffer.timeline?.length || 0) + 1;
    const outcomeStep: NegotiationStep = {
      id: `step-outcome-${Date.now()}`,
      stepNumber: nextStepNum,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      party: targetOutcome === 'Won' 
        ? 'Legal / Conveyancer' 
        : targetOutcome === 'Lost' 
          ? 'Vendor / Selling Agent' 
          : 'Buyer (Buyers Agent)',
      title: targetOutcome === 'Won' 
        ? `Deal Formally Won at $${outcomeAgreedPrice.toLocaleString()} 🏆` 
        : targetOutcome === 'Lost' 
          ? 'Negotiation Concluded — Outbid (Lost) ❌' 
          : 'Offer Formally Withdrawn by Agency 🛡️',
      amount: targetOutcome === 'Won' ? outcomeAgreedPrice : activeOffer.currentOfferPrice,
      terms: targetOutcome === 'Won' ? 'Contracts executed; proceeding to settlement.' : 'File closed.',
      conditions: targetOutcome === 'Won' ? 'All conditions agreed.' : 'Negotiation terminated.',
      notes: outcomeNotesInput,
      statusBadge: targetOutcome === 'Won' ? 'Won 🏆' : targetOutcome === 'Lost' ? 'Lost ❌' : 'Withdrawn 🛡️'
    };

    const updated: OfferNegotiation = {
      ...activeOffer,
      outcome: targetOutcome,
      finalAgreedPrice: targetOutcome === 'Won' ? outcomeAgreedPrice : undefined,
      currentOfferPrice: targetOutcome === 'Won' ? outcomeAgreedPrice : activeOffer.currentOfferPrice,
      status: targetOutcome === 'Won' ? 'Accepted' : targetOutcome === 'Lost' ? 'Offer Rejected' : 'Draft',
      outcomeNotes: outcomeNotesInput,
      timeline: [...(activeOffer.timeline || []), outcomeStep]
    };

    onUpdateOffer(updated);
    setShowOutcomeModal(false);

    if (targetOutcome === 'Won') {
      onAcceptOfferToSettlement(updated);
    }
  };

  const handleCreateNewDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find(p => p.id === newDealPropertyId) || properties[0];

    const conditionsArray = newDealSpecialConditions
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newOffer: OfferNegotiation = {
      id: `neg-${Date.now()}`,
      propertyId: prop.id,
      propertyAddress: prop.address,
      propertyImage: prop.imageUrl,
      listPrice: newDealListPrice,
      listedPrice: newDealListPrice,
      initialOffer: newDealInitialOffer,
      initialOfferDate: newDealOfferDate,
      vendorCounterOffer: undefined,
      finalAgreedPrice: undefined,
      currentOfferPrice: newDealInitialOffer,
      outcome: 'Under Negotiation',
      status: 'Offer Submitted',
      offerConditions: {
        finance: newDealFinance,
        financeDays: newDealFinanceDays,
        financeDueDate: new Date(Date.now() + newDealFinanceDays * 86400000).toISOString().split('T')[0],
        buildingAndPest: newDealBP,
        bpDays: newDealBPDays,
        bpDueDate: new Date(Date.now() + newDealBPDays * 86400000).toISOString().split('T')[0],
        specialConditions: conditionsArray,
        customNotes: 'New deal opened by buyers agency.'
      },
      settlementDate: newDealSettlementDate,
      settlementDays: 30,
      depositAmount: newDealDeposit,
      depositPercent: Math.round((newDealDeposit / newDealInitialOffer) * 100) || 10,
      financeDays: newDealFinanceDays,
      bpDays: newDealBPDays,
      specialConditions: conditionsArray,
      vendorMotivation: prop.vendorMotivation || 'Motivated vendor seeking fast completion.',
      sellingAgentName: prop.agentName || 'Selling Agent',
      sellingAgentPhone: prop.agentPhone || '+61 400 000 000',
      sellingAgentEmail: prop.agentEmail || 'agent@realestate.com.au',
      timeline: [
        {
          id: `step-${Date.now()}`,
          stepNumber: 1,
          date: newDealOfferDate,
          time: '10:00 AM',
          party: 'Buyer (Buyers Agent)',
          title: `Initial Written Offer of $${newDealInitialOffer.toLocaleString()} Submitted`,
          amount: newDealInitialOffer,
          terms: `$${newDealDeposit.toLocaleString()} deposit, settlement on ${newDealSettlementDate}`,
          conditions: `Finance: ${newDealFinanceDays}d | B&P: ${newDealBPDays}d`,
          notes: 'Opening formal position transmitted to selling agent.',
          statusBadge: 'Submitted'
        }
      ],
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: `${newDealOfferDate} 10:00`,
          party: 'Buyer (Buyers Agent)',
          amount: newDealInitialOffer,
          terms: `Deposit $${newDealDeposit.toLocaleString()}`,
          notes: 'Initial opening offer'
        }
      ]
    };

    onUpdateOffer(newOffer);
    setSelectedOfferId(newOffer.id);
    setShowNewOfferModal(false);
  };

  const handleCopyTimeline = () => {
    if (!activeOffer || !activeOffer.timeline) return;
    const text = `NEGOTIATION TIMELINE - ${activeOffer.propertyAddress}\n` +
      `List Price: $${activeOffer.listPrice?.toLocaleString()} | Initial Offer: $${activeOffer.initialOffer?.toLocaleString()}\n` +
      `Current Status: ${activeOffer.outcome} | Settlement Date: ${activeOffer.settlementDate}\n\n` +
      activeOffer.timeline.map(s => 
        `Step ${s.stepNumber} [${s.date} ${s.time || ''}] - ${s.party}:\n` +
        `• ${s.title}\n` +
        (s.amount ? `• Amount: $${s.amount.toLocaleString()} AUD\n` : '') +
        (s.terms ? `• Terms: ${s.terms}\n` : '') +
        (s.notes ? `• Notes: "${s.notes}"\n` : '')
      ).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedTimeline(true);
    setTimeout(() => setCopiedTimeline(false), 2500);
  };

  const handleCopyAgentMessage = () => {
    if (activeOffer?.aiAdvice?.draftMessageToAgent) {
      navigator.clipboard.writeText(activeOffer.aiAdvice.draftMessageToAgent);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    }
  };

  const getOutcomeBadge = (outcome: OfferOutcome) => {
    switch (outcome) {
      case 'Won':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-emerald-700" />
            <span>WON (SECURED)</span>
          </span>
        );
      case 'Lost':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>LOST (OUTBID)</span>
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5 shadow-xs">
            <Ban className="w-3.5 h-3.5 text-slate-600" />
            <span>WITHDRAWN</span>
          </span>
        );
      case 'Under Negotiation':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-xs animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>UNDER NEGOTIATION</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading flex items-center gap-2">
                <span>Offer & Negotiation Tracker</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-200 uppercase tracking-wider">
                  Live Portfolio Tracker
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl">
            Track multi-round bidding wars, vendor counter-offers, formal offer conditions (Finance / Building & Pest), deposit escrow, and historical negotiation timelines with date-stamped milestones.
          </p>
        </div>

        {/* New Offer Button */}
        <div className="flex items-center gap-3">
          <button
            id="offer-new-deal-modal-btn"
            onClick={() => setShowNewOfferModal(true)}
            className="px-4 py-2.5 bg-[#1A3A5C] hover:bg-[#234d7a] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#B8960C]" />
            <span>Log New Offer Deal</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Deals</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">{activeOffers.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>In active rounds</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deals Won / Secured</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-0.5">{wonOffers.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Win Rate: {winRate}%</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Discounts Extracted</span>
          <div className="text-2xl font-bold text-[#1A3A5C] font-mono mt-0.5">
            ${(totalDiscountsSecured / 1000).toFixed(0)}k AUD
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#B8960C]" />
            <span>Below vendor guide price</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lost / Capital Protected</span>
          <div className="text-2xl font-bold text-slate-700 font-mono mt-0.5">
            {lostOffers.length + withdrawnOffers.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Disciplined yield stops</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Deals Selector Grid */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#B8960C]" />
            <span className="font-bold text-xs sm:text-sm text-slate-900">Portfolio Deal Filter:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'Under Negotiation', 'Won', 'Lost', 'Withdrawn'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setOutcomeFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  outcomeFilter === tab
                    ? 'bg-[#1A3A5C] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL' ? `All Deals (${offers.length})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Selector Cards Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredOffers.map(offer => {
            const isSelected = offer.id === activeOffer?.id;
            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'border-[#B8960C] bg-amber-50/40 shadow-sm ring-2 ring-[#B8960C]/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Settlement: {offer.settlementDate}
                    </span>
                    {getOutcomeBadge(offer.outcome)}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {offer.propertyAddress}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">List Guide:</span>
                    <span className="font-bold font-mono text-slate-800">
                      ${((offer.listPrice || offer.listedPrice || 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {offer.outcome === 'Won' ? 'Agreed Price:' : 'Last Offer:'}
                    </span>
                    <span className={`font-bold font-mono ${
                      offer.outcome === 'Won' ? 'text-emerald-700' : 'text-blue-800'
                    }`}>
                      ${((offer.finalAgreedPrice || offer.currentOfferPrice) / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeOffer ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Cols: Deal Specification & Mandatory Fields */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* WON DEAL ACTIVE CONVEYANCING BANNER */}
            {activeOffer.outcome === 'Won' && (
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#1A3A5C] text-white p-5 rounded-2xl shadow-lg border border-emerald-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Trophy className="w-3 h-3" />
                      <span>Deal Formally Won</span>
                    </span>
                    <span className="text-emerald-200 text-xs font-semibold">
                      Contracts Exchanged
                    </span>
                  </div>
                  <h3 className="font-bold text-sm font-serif-heading text-white">
                    Settlement Checklist & Conveyancing Triggered
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Agreed Price: <strong className="text-amber-300 font-mono">${(activeOffer.finalAgreedPrice || activeOffer.currentOfferPrice).toLocaleString()}</strong> • Target Settlement: <strong className="text-white">{activeOffer.settlementDate}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  id="offer-won-banner-go-to-settlement-btn"
                  onClick={() => onAcceptOfferToSettlement(activeOffer)}
                  className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Open Settlement Checklist ➔</span>
                </button>
              </div>
            )}

            {/* HERO DEAL OVERVIEW CARD */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              
              {/* Header with Title & Outcome Controller */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Target Deal Record
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif-heading">
                    {activeOffer.propertyAddress}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {getOutcomeBadge(activeOffer.outcome)}
                </div>
              </div>

              {/* MANDATORY FIELDS GRID: List Price, Initial Offer, Vendor Counter, Agreed Price, Deposit, Settlement */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                
                {/* 1. List Price */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    1. List Guide Price
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono mt-1">
                    ${(activeOffer.listPrice || activeOffer.listedPrice || 0).toLocaleString()} AUD
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Vendor Asking Price</span>
                </div>

                {/* 2. Initial Offer */}
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider block">
                    2. Initial Offer
                  </span>
                  <div className="text-base font-bold text-blue-900 font-mono mt-1">
                    ${activeOffer.initialOffer.toLocaleString()} AUD
                  </div>
                  <span className="text-[10px] text-blue-700 mt-0.5 block">
                    Submitted: {activeOffer.initialOfferDate}
                  </span>
                </div>

                {/* 3. Vendor Counter-Offer */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
                    3. Vendor Counter-Offer
                  </span>
                  <div className="text-base font-bold text-amber-950 font-mono mt-1">
                    {activeOffer.vendorCounterOffer || activeOffer.vendorCounterPrice ? (
                      `$${(activeOffer.vendorCounterOffer || activeOffer.vendorCounterPrice)?.toLocaleString()} AUD`
                    ) : (
                      <span className="text-slate-400 font-normal">Pending / Rejected</span>
                    )}
                  </div>
                  <span className="text-[10px] text-amber-700 mt-0.5 block">Vendor Position</span>
                </div>

                {/* 4. Final Agreed Price */}
                <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-950 font-bold uppercase tracking-wider block">
                    4. Final Agreed Price
                  </span>
                  <div className="text-base font-bold text-emerald-800 font-mono mt-1">
                    {activeOffer.finalAgreedPrice ? (
                      `$${activeOffer.finalAgreedPrice.toLocaleString()} AUD`
                    ) : activeOffer.outcome === 'Won' ? (
                      `$${activeOffer.currentOfferPrice.toLocaleString()} AUD`
                    ) : (
                      <span className="text-slate-400 font-normal">Pending Agreement</span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">
                    {activeOffer.finalAgreedPrice ? 'Contract Exchanged' : 'In Negotiation'}
                  </span>
                </div>

                {/* 5. Deposit Amount */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    5. Deposit Amount
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono mt-1">
                    ${activeOffer.depositAmount.toLocaleString()} AUD
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {activeOffer.depositPercent}% in Trust Escrow
                  </span>
                </div>

                {/* 6. Settlement Date */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    6. Settlement Date
                  </span>
                  <div className="text-base font-bold text-[#1A3A5C] font-mono mt-1">
                    {activeOffer.settlementDate}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {activeOffer.settlementDays} Days Terms
                  </span>
                </div>
              </div>

              {/* OFFER CONDITIONS CARD: Finance, Building & Pest, Special Clauses */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#B8960C]" />
                    <span>Offer Conditions (Finance / Building & Pest / Special Clauses)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Protective Due Diligence Clauses</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Finance Condition */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                        <span>Finance Approval Condition</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeOffer.offerConditions?.finance 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {activeOffer.offerConditions?.finance ? 'Included' : 'Waived'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Duration: <span className="font-bold font-mono">{activeOffer.offerConditions?.financeDays || 14} Days</span>
                      {activeOffer.offerConditions?.financeDueDate && (
                        <span> (Due: {activeOffer.offerConditions.financeDueDate})</span>
                      )}
                    </p>
                  </div>

                  {/* Building & Pest Condition */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-amber-600" />
                        <span>Building & Pest Condition</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeOffer.offerConditions?.buildingAndPest 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {activeOffer.offerConditions?.buildingAndPest ? 'AS 4349.1 Included' : 'Waived'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Duration: <span className="font-bold font-mono">{activeOffer.offerConditions?.bpDays || 7} Days</span>
                      {activeOffer.offerConditions?.bpDueDate && (
                        <span> (Due: {activeOffer.offerConditions.bpDueDate})</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Special Conditions List */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Special Conditions & Annexure Terms:
                  </span>
                  <ul className="space-y-1">
                    {(activeOffer.offerConditions?.specialConditions || activeOffer.specialConditions || []).map((cond, idx) => (
                      <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8960C] shrink-0 mt-0.5" />
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                  {activeOffer.offerConditions?.customNotes && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                      &quot;{activeOffer.offerConditions.customNotes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Vendor & Agent Context Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-800">Selling Agent:</span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    {activeOffer.sellingAgentName} ({activeOffer.sellingAgentPhone}) • {activeOffer.sellingAgentEmail}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Vendor Motivation: </span>
                  {activeOffer.vendorMotivation}
                </div>
                {activeOffer.outcomeNotes && (
                  <div className="pt-1 text-[11px] font-medium text-slate-700 bg-amber-50/70 p-2 rounded border border-amber-200/60">
                    <span className="font-bold text-slate-900">Outcome Log: </span>
                    {activeOffer.outcomeNotes}
                  </div>
                )}
              </div>

              {/* OUTCOME ACTION BUTTONS (Won / Lost / Withdrawn / Push to Settlement) */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  id="offer-mark-won-btn"
                  onClick={() => handleOpenOutcomeModal('Won')}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Mark Deal Won 🏆</span>
                </button>

                <button
                  id="offer-mark-lost-btn"
                  onClick={() => handleOpenOutcomeModal('Lost')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Mark Lost ❌</span>
                </button>

                <button
                  id="offer-mark-withdrawn-btn"
                  onClick={() => handleOpenOutcomeModal('Withdrawn')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>Withdraw 🛡️</span>
                </button>

                {activeOffer.outcome === 'Won' && (
                  <button
                    id="offer-push-to-settlement-btn"
                    onClick={() => onNavigate('settlement', activeOffer.propertyId)}
                    className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#244c77] text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <span>View Deal in Settlement Checklist Tracker</span>
                    <ArrowRight className="w-4 h-4 text-[#B8960C]" />
                  </button>
                )}
              </div>
            </div>

            {/* STEPPED NEGOTIATION TIMELINE WITH DATES */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#B8960C]" />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 font-serif-heading">
                      Stepped Negotiation Timeline with Dates
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chronological progression of every offer round, vendor response, and legal milestone.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyTimeline}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedTimeline ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Timeline!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Timeline</span>
                    </>
                  )}
                </button>
              </div>

              {/* Visual Vertical Stepped Timeline */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {(activeOffer.timeline || []).map((step) => {
                  const isBuyer = step.party.includes('Buyer');
                  const isVendor = step.party.includes('Vendor');
                  const isLegal = step.party.includes('Legal');

                  return (
                    <div key={step.id} className="relative pl-9 text-xs space-y-1">
                      {/* Stepped Number Node */}
                      <div className={`absolute left-1.5 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[10px] z-10 ${
                        isBuyer 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : isVendor 
                            ? 'border-amber-600 bg-amber-500 text-white' 
                            : 'border-emerald-600 bg-emerald-600 text-white'
                      }`}>
                        {step.stepNumber}
                      </div>

                      <div className={`p-3.5 rounded-xl border transition ${
                        isBuyer
                          ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                          : isVendor
                            ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                            : 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                      }`}>
                        {/* Header of Step: Party + Date + Time */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{step.party}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-slate-200 text-slate-700">
                              {step.statusBadge || `Round ${step.stepNumber}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{step.date}</span>
                            {step.time && <span>• {step.time}</span>}
                          </div>
                        </div>

                        {/* Title & Amount */}
                        <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-slate-900">{step.title}</h4>
                          {step.amount && (
                            <span className="text-sm font-bold font-mono text-[#1A3A5C]">
                              ${step.amount.toLocaleString()} AUD
                            </span>
                          )}
                        </div>

                        {/* Terms & Conditions */}
                        {step.terms && (
                          <div className="text-[11px] text-slate-700 font-medium mt-1">
                            <span className="text-slate-500">Terms: </span>
                            {step.terms}
                          </div>
                        )}

                        {step.conditions && (
                          <div className="text-[11px] text-slate-600 bg-white/70 px-2 py-1 rounded border border-slate-200/80 mt-1">
                            <span className="font-semibold text-slate-700">Conditions: </span>
                            {step.conditions}
                          </div>
                        )}

                        {/* Notes */}
                        {step.notes && (
                          <p className="text-[11px] text-slate-600 italic mt-1.5 pt-1.5 border-t border-slate-200/60">
                            &quot;{step.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LOG NEW NEGOTIATION STEP / COUNTER-OFFER FORM */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#1A3A5C]" />
                  <span>Log New Negotiation Step / Counter-Offer</span>
                </h4>

                <form onSubmit={handleAddTimelineStep} className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Acting Party
                      </label>
                      <select
                        value={counterParty}
                        onChange={(e) => setCounterParty(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Buyer (Buyers Agent)">Buyer (Buyers Agent)</option>
                        <option value="Vendor / Selling Agent">Vendor / Selling Agent</option>
                        <option value="Legal / Conveyancer">Legal / Conveyancer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={counterDate}
                        onChange={(e) => setCounterDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Offer / Counter Amount ($)
                      </label>
                      <input
                        type="number"
                        step={500}
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Step Milestone Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Revised written counter with $3.5k credit"
                        value={counterTitle}
                        onChange={(e) => setCounterTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Conditions & Deadlines
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Finance: 14d | B&P: 7d | 24h Expiry"
                        value={counterConditions}
                        onChange={(e) => setCounterConditions(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tactical Notes / Dialogue Justification
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Agent phoned confirming vendor would accept $772,500 if building inspection condition is satisfied..."
                      value={counterNotes}
                      onChange={(e) => setCounterNotes(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1A3A5C] hover:bg-[#264f7c] text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B8960C]" />
                      <span>Append Step to Timeline</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>

          {/* Right 5 Cols: AI Negotiation Advisor & Strategic Playbook */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* AI Negotiation Strategist Card */}
            <div className="bg-gradient-to-br from-[#0E2238] to-[#1A3A5C] text-white p-5 rounded-2xl shadow-xl border border-[#B8960C]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B8960C]" />
                  <h3 className="font-bold text-sm text-white font-serif-heading">
                    AI Negotiation Strategist
                  </h3>
                </div>
                <button
                  onClick={handleGenerateAdvisor}
                  disabled={isGeneratingAdvisor}
                  className="px-2.5 py-1 rounded bg-[#B8960C] hover:bg-[#9E8009] text-white text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingAdvisor ? 'Calculating...' : 'Recalculate Tactics'}
                </button>
              </div>

              {activeOffer.aiAdvice ? (
                <div className="space-y-4 text-xs">
                  {/* Recommended Counter Banner */}
                  <div className="p-3.5 bg-white/10 rounded-xl border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-amber-300">
                      Recommended Strategic Counter:
                    </div>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      ${activeOffer.aiAdvice.recommendedCounter.toLocaleString()} AUD
                    </div>
                    <div className="text-[11px] text-emerald-300 font-semibold mt-1">
                      Playbook: {activeOffer.aiAdvice.strategyName}
                    </div>
                  </div>

                  {/* Rationale */}
                  <div>
                    <div className="font-bold text-amber-300 text-[11px] mb-1">Strategic Rationale:</div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {activeOffer.aiAdvice.rationale}
                    </p>
                  </div>

                  {/* Tactical Levers */}
                  <div>
                    <div className="font-bold text-amber-300 text-[11px] mb-1.5">Actionable Levers:</div>
                    <ul className="space-y-1.5">
                      {activeOffer.aiAdvice.tacticalRecommendations.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 bg-black/20 p-2 rounded-lg border border-white/5 text-[11px] text-slate-200">
                          <Check className="w-3.5 h-3.5 text-[#B8960C] shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Agent Draft Message */}
                  <div>
                    <div className="flex items-center justify-between font-bold text-amber-300 text-[11px] mb-1.5">
                      <span>Draft Message to Selling Agent:</span>
                      <button
                        onClick={handleCopyAgentMessage}
                        className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                      >
                        {copiedDraft ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDraft ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-slate-200 font-mono text-[10px] leading-relaxed whitespace-pre-line">
                      {activeOffer.aiAdvice.draftMessageToAgent}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-300">Click below to generate tactical advice based on current counter-offers.</p>
                  <button
                    onClick={handleGenerateAdvisor}
                    disabled={isGeneratingAdvisor}
                    className="px-4 py-2 bg-[#B8960C] hover:bg-[#9E8009] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Generate AI Negotiation Plan
                  </button>
                </div>
              )}
            </div>

            {/* Buyers Agency Bidding Principles */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-[#1A3A5C]">
                <ShieldCheck className="w-4 h-4 text-[#B8960C]" />
                <span>The 4 Golden Rules of Deal Acquisition</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-1.5 leading-relaxed">
                <li><span className="font-bold">Odd Numbers Anchor:</span> Bid $768,500 instead of $770,000 to signal strict budget limits.</li>
                <li><span className="font-bold">Sunset Expiry:</span> Always enforce a 24-hour or 48-hour deadline to block agent shopping.</li>
                <li><span className="font-bold">Terms over Price:</span> Concede on short settlement dates in exchange for substantial price cuts.</li>
                <li><span className="font-bold">Defect Leverage:</span> Use B&P quotes directly in writing to neutralize vendor objections.</li>
              </ul>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
          <Scale className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Offer Deal Selected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select a deal from the grid above or click &quot;Log New Offer Deal&quot; to begin tracking a property negotiation.
          </p>
        </div>
      )}

      {/* MODAL: SET OUTCOME (Won / Lost / Withdrawn) */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {targetOutcome === 'Won' ? (
                  <Trophy className="w-5 h-5 text-emerald-600" />
                ) : targetOutcome === 'Lost' ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Ban className="w-5 h-5 text-slate-600" />
                )}
                <h3 className="font-bold text-base text-slate-900 font-serif-heading">
                  Confirm Outcome: {targetOutcome}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOutcomeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Updating status for <span className="font-bold text-slate-900">{activeOffer?.propertyAddress}</span>.
              </p>

              {targetOutcome === 'Won' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Final Agreed Purchase Price ($ AUD)
                  </label>
                  <input
                    type="number"
                    value={outcomeAgreedPrice}
                    onChange={(e) => setOutcomeAgreedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    Secured ${( (activeOffer?.listPrice || 0) - outcomeAgreedPrice > 0 ? (activeOffer?.listPrice || 0) - outcomeAgreedPrice : 0).toLocaleString()} below listing guide.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Outcome Log & Closing Notes
                </label>
                <textarea
                  rows={3}
                  value={outcomeNotesInput}
                  onChange={(e) => setOutcomeNotesInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                  placeholder="Record justification, competing bids, or conveyancing transition details..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOutcomeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOutcome}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow cursor-pointer ${
                  targetOutcome === 'Won' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : targetOutcome === 'Lost' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                Confirm {targetOutcome}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW OFFER DEAL */}
      {showNewOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#B8960C]" />
                <h3 className="font-bold text-base text-slate-900 font-serif-heading">
                  Log New Offer & Negotiation Deal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOfferModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewDeal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Property Asset
                </label>
                <select
                  value={newDealPropertyId}
                  onChange={(e) => {
                    setNewDealPropertyId(e.target.value);
                    const p = properties.find(x => x.id === e.target.value);
                    if (p) {
                      setNewDealListPrice(p.priceGuide);
                      setNewDealInitialOffer(Math.round(p.priceGuide * 0.96));
                      setNewDealDeposit(Math.round(p.priceGuide * 0.096));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.address} ({p.suburb}, {p.state}) — Guide: ${(p.priceGuide / 1000).toFixed(0)}k
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vendor List Price ($ AUD)
                  </label>
                  <input
                    type="number"
                    value={newDealListPrice}
                    onChange={(e) => setNewDealListPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial Written Offer ($ AUD)
                  </label>
                  <input
                    type="number"
                    value={newDealInitialOffer}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewDealInitialOffer(val);
                      setNewDealDeposit(Math.round(val * 0.1));
                    }}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Offer Date
                  </label>
                  <input
                    type="date"
                    value={newDealOfferDate}
                    onChange={(e) => setNewDealOfferDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deposit Amount ($)
                  </label>
                  <input
                    type="number"
                    value={newDealDeposit}
                    onChange={(e) => setNewDealDeposit(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Settlement Date
                  </label>
                  <input
                    type="date"
                    value={newDealSettlementDate}
                    onChange={(e) => setNewDealSettlementDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Contract Conditions:
                </span>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDealFinance}
                      onChange={(e) => setNewDealFinance(e.target.checked)}
                      className="rounded text-[#1A3A5C]"
                    />
                    <span>Finance ({newDealFinanceDays} Days)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDealBP}
                      onChange={(e) => setNewDealBP(e.target.checked)}
                      className="rounded text-[#1A3A5C]"
                    />
                    <span>Building & Pest ({newDealBPDays} Days)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Special Conditions & Annexure Clauses
                </label>
                <textarea
                  rows={2}
                  value={newDealSpecialConditions}
                  onChange={(e) => setNewDealSpecialConditions(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOfferModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1A3A5C] hover:bg-[#275280] text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B8960C]" />
                  <span>Create Deal Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
