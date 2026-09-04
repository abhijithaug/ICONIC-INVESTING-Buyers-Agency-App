import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight, 
  Upload, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Layers,
  MapPin,
  FileCheck,
  AlertCircle,
  Check
} from 'lucide-react';
import { 
  ClientProfile, 
  Property, 
  SettlementRecord, 
  ClientDocument, 
  AgentMessage, 
  AppSection, 
  DocumentCategory,
  AuthUser
} from '../../types';
import { ADVOCATES } from '../../data/mockMessages';
import { ClientAgentMessaging } from '../Messages/ClientAgentMessaging';

interface PersonalClientDashboardProps {
  client: ClientProfile;
  currentUser: AuthUser;
  properties: Property[];
  documents: ClientDocument[];
  settlements: SettlementRecord[];
  messages: AgentMessage[];
  onNavigate: (section: AppSection, propertyId?: string) => void;
  onOpenPropertyDetail: (property: Property) => void;
  onSendMessage: (text: string, propertyRef?: Property, attachmentName?: string) => void;
  onAddDocument: (doc: ClientDocument) => void;
  onToggleTask?: (settlementId: string, taskId: string) => void;
}

export const PersonalClientDashboard: React.FC<PersonalClientDashboardProps> = ({
  client,
  currentUser,
  properties = [],
  documents = [],
  settlements = [],
  messages = [],
  onNavigate,
  onOpenPropertyDetail,
  onSendMessage,
  onAddDocument,
  onToggleTask
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'shortlist' | 'documents' | 'settlement' | 'messages'>('all');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentCategory>('Contract of Sale');

  const advocateName = client.assignedAgent || 'Damian Sterling';
  const advocate = ADVOCATES[advocateName] || ADVOCATES['Damian Sterling'];

  // 1. Client's Own Shortlisted Properties
  const clientProperties = properties.filter(p => 
    !p.clientId || p.clientId === client.id
  );

  // 2. Client's Uploaded Documents
  const clientDocuments = documents.filter(d => 
    d.clientId === client.id
  );

  const filteredDocuments = docCategoryFilter === 'All' 
    ? clientDocuments 
    : clientDocuments.filter(d => d.category === docCategoryFilter);

  // 3. Client's Settlement Progress
  const activeSettlement = settlements.find(s => !s.clientId || s.clientId === client.id) || settlements[0];
  const settlementTasks = activeSettlement?.tasks || [];
  const completedTasksCount = settlementTasks.filter(t => t.completed).length;
  const totalTasksCount = settlementTasks.length || 1;
  const settlementPercent = Math.round((completedTasksCount / totalTasksCount) * 100);

  // 4. Client's Messages
  const clientMessages = messages.filter(m => m.clientId === client.id);

  const formatCurrency = (val?: number) => {
    if (!val) return '$0 AUD';
    return `$${val.toLocaleString()} AUD`;
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc: ClientDocument = {
      id: `doc-client-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      title: newDocTitle.trim(),
      category: newDocCategory,
      fileName: `${newDocTitle.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.8 MB',
      fileType: 'PDF',
      uploadedBy: 'client',
      uploadedByName: currentUser.name,
      uploadedAt: new Date().toISOString(),
      status: 'Verified',
      downloadUrl: '#'
    };

    onAddDocument(newDoc);
    setNewDocTitle('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME HEADER & ASSIGNED ADVOCATE HERO */}
      <div className="bg-gradient-to-r from-[#0E2238] via-[#1A3A5C] to-[#224b75] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-[#B8960C]/30 relative overflow-hidden">
        {/* Subtle Gold Ambient Glow */}
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#B8960C]/25 via-transparent to-transparent pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Client Profile Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#B8960C] text-slate-950 uppercase tracking-wider shadow-xs">
                Private Client Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-200 border border-white/10">
                Client ID: #{client.id.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Pre-Approved ({client.preApprovalLender || 'Macquarie Bank'})</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#B8960C] to-[#8C7209] text-white font-bold flex items-center justify-center text-xl shadow-lg border border-amber-300/40 shrink-0">
                {(client.fullName || client.name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white tracking-tight">
                  Welcome, {client.fullName || client.name}
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your dedicated buying agency portal. Track your handpicked shortlist, contract vault, settlement timeline, and advocate message thread.
                </p>
              </div>
            </div>

            {/* Criteria Pills */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-slate-300">
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-300" />
                <span>Budget: <strong className="text-white font-mono">{formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}</strong></span>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>Target: <strong className="text-white">{(client.targetStates || ['QLD', 'WA']).join(', ')}</strong></span>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                <span>Strategy: <strong className="text-amber-200">{client.primaryGoal || 'High Capital Growth'}</strong></span>
              </span>
            </div>
          </div>

          {/* Right: Assigned Buyers Advocate Card */}
          <div className="bg-[#0E2238]/95 backdrop-blur-md border border-[#B8960C]/40 p-4 sm:p-5 rounded-2xl shadow-xl min-w-[280px] max-w-sm shrink-0">
            <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
              <span>Your Assigned Advocate</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online Now
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={advocate.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'}
                alt={advocate.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#B8960C] shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-white text-sm truncate">{advocate.name}</div>
                <div className="text-xs text-slate-300 truncate">{advocate.role}</div>
                <div className="text-[11px] text-[#B8960C] font-mono mt-0.5">{advocate.licenseNumber}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              <a
                href={`tel:${advocate.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>Call Direct</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate('messages')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-[#B8960C] hover:bg-[#9E8009] text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. THE 4 PILLARS QUICK OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: Shortlist */}
        <div 
          onClick={() => onNavigate('search')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#B8960C] flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-slate-900">{clientProperties.length}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-[#1A3A5C] transition">
            My Property Shortlist
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Curated investment assets matching your yield & growth targets.
          </p>
          <div className="mt-3 text-xs font-bold text-[#1A3A5C] flex items-center gap-1">
            <span>View Shortlist</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Documents */}
        <div 
          onClick={() => onNavigate('documents')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-slate-900">{clientDocuments.length}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-[#1A3A5C] transition">
            My Uploaded Documents
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Contracts of sale, verified B&P reports, pre-approvals & ID.
          </p>
          <div className="mt-3 text-xs font-bold text-emerald-700 flex items-center gap-1">
            <span>Open Document Vault</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Settlement Progress */}
        <div 
          onClick={() => onNavigate('settlement')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-slate-900">{settlementPercent}%</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-[#1A3A5C] transition">
            Settlement Progress
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {activeSettlement ? `${activeSettlement.daysRemaining} days to settlement • ${completedTasksCount}/${totalTasksCount} tasks done` : 'Tracking PEXA milestones'}
          </p>
          <div className="mt-3 text-xs font-bold text-blue-700 flex items-center gap-1">
            <span>Track Checklist</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 4: Message Thread */}
        <div 
          onClick={() => onNavigate('messages')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-mono text-slate-900">{clientMessages.length}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-[#1A3A5C] transition">
            Agent Message Thread
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Direct real-time line with {advocate.name}.
          </p>
          <div className="mt-3 text-xs font-bold text-purple-700 flex items-center gap-1">
            <span>Open Chat Thread</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* 3. SECTION SWITCHER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all' 
              ? 'bg-[#1A3A5C] text-white shadow-xs' 
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          All 4 Pillars Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shortlist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'shortlist' 
              ? 'bg-[#1A3A5C] text-white shadow-xs' 
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          📋 Property Shortlist ({clientProperties.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'documents' 
              ? 'bg-[#1A3A5C] text-white shadow-xs' 
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          📂 Uploaded Documents ({clientDocuments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settlement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'settlement' 
              ? 'bg-[#1A3A5C] text-white shadow-xs' 
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          ⏱️ Settlement Progress ({settlementPercent}%)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'messages' 
              ? 'bg-[#1A3A5C] text-white shadow-xs' 
              : 'bg-white hover:bg-slate-100 text-slate-600'
          }`}
        >
          💬 Agent Message Thread
        </button>
      </div>

      {/* 4. CONTENT SECTIONS ACCORDING TO USER'S 4 PILLARS */}

      {/* PILLAR 1: PROPERTY SHORTLIST */}
      {(activeTab === 'all' || activeTab === 'shortlist') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#B8960C] flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  My Curated Property Shortlist
                </h2>
                <p className="text-xs text-slate-500">
                  Vetted exclusively for your budget ({formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}) and {client.primaryGoal} goal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('search')}
              className="text-xs font-bold text-[#1A3A5C] hover:text-[#B8960C] flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Shortlisted Assets ({clientProperties.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {clientProperties.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Your buyers advocate is currently conducting on-the-ground inspections for new opportunities. Check back shortly!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clientProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-amber-400/80 transition flex flex-col"
                >
                  {/* Property Image & Status Badges */}
                  <div className="relative h-44 overflow-hidden group">
                    <img
                      src={prop.imageUrl}
                      alt={prop.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#1A3A5C] text-amber-300 shadow-sm">
                        {prop.status}
                      </span>
                      {prop.isOffMarket && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#B8960C] text-slate-950 shadow-sm">
                          Off-Market Exclusive
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <div className="text-lg font-bold font-mono drop-shadow-md">
                        {formatCurrency(prop.priceGuide)}
                      </div>
                      <div className="text-xs truncate font-medium drop-shadow-sm text-slate-100">
                        {prop.address}, {prop.suburb} {prop.state}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Yield</span>
                        <strong className="text-emerald-600 font-mono">{prop.grossYield}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Yield</span>
                        <strong className="text-slate-800 font-mono">{prop.netYield}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cashflow</span>
                        <strong className="text-emerald-700 font-mono">
                          {prop.cashflowWeekly >= 0 ? `+$${prop.cashflowWeekly}/wk` : `-$${Math.abs(prop.cashflowWeekly)}/wk`}
                        </strong>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{prop.bedrooms} Bed • {prop.bathrooms} Bath • {prop.carSpaces} Car</span>
                        <span>{prop.landSizeM2} m²</span>
                      </div>
                      {prop.keyFeatures && prop.keyFeatures.length > 0 && (
                        <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                          • {prop.keyFeatures[0]}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => onOpenPropertyDetail(prop)}
                      className="w-full py-2 px-3 rounded-xl bg-[#1A3A5C] hover:bg-[#234d77] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>View Full Analysis & Photos</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#B8960C]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PILLAR 2: UPLOADED DOCUMENTS */}
      {(activeTab === 'all' || activeTab === 'documents') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  My Uploaded Documents & Contracts
                </h2>
                <p className="text-xs text-slate-500">
                  Verified legal contracts of sale, independent B&P inspection reports, and pre-approval letters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#1A3A5C] hover:bg-[#224b75] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>Upload New Document</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('documents')}
                className="text-xs font-bold text-[#1A3A5C] hover:text-[#B8960C] flex items-center gap-1 cursor-pointer"
              >
                <span>Full Document Vault ({clientDocuments.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['All', 'Contract of Sale', 'Building & Pest', 'Pre-Approval & Finance', 'Proof of ID & Entity'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setDocCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                  docCategoryFilter === cat
                    ? 'bg-[#1A3A5C] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Documents Grid / Table */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No documents in this category. Click &quot;Upload New Document&quot; to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400/80 transition flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#B8960C] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700">{doc.category}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Uploaded {doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {doc.status}
                    </span>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert(`Downloading: ${doc.fileName}`); }}
                      className="text-xs text-[#1A3A5C] hover:text-[#B8960C] p-1 rounded hover:bg-white transition"
                      title="Download document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PILLAR 3: SETTLEMENT CHECKLIST PROGRESS */}
      {(activeTab === 'all' || activeTab === 'settlement') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Settlement Checklist Progress
                </h2>
                <p className="text-xs text-slate-500">
                  Live countdown and PEXA financial settlement workflow for {activeSettlement?.propertyAddress || 'your acquisition'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('settlement')}
              className="text-xs font-bold text-[#1A3A5C] hover:text-[#B8960C] flex items-center gap-1 cursor-pointer"
            >
              <span>Full Settlement Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Settlement Milestone Bar */}
          {activeSettlement && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">{activeSettlement.propertyAddress}</div>
                  <div className="text-[11px] text-slate-500">
                    Contract Date: {activeSettlement.contractDate} • Target Settlement: <strong className="text-slate-900">{activeSettlement.settlementDate}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-[#1A3A5C] text-amber-300 font-mono font-bold text-xs shadow-xs">
                    ⏳ {activeSettlement.daysRemaining} Days to Settlement
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs">
                    {settlementPercent}% Completed
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-[#1A3A5C] h-full transition-all duration-500"
                  style={{ width: `${settlementPercent}%` }}
                />
              </div>

              {/* Four Phases Visual Checklist Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
                {[
                  { phase: '1. Pre-Exchange', done: true, desc: 'Solicitor Review & Deposit' },
                  { phase: '2. Exchange', done: true, desc: 'Formal Loan & B&P Clause' },
                  { phase: '3. Pre-Settlement', done: false, desc: 'Walkthrough & Insurance' },
                  { phase: '4. Settlement Day', done: false, desc: 'PEXA Transfer & Keys' }
                ].map((ph, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg border ${ph.done ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      {ph.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      <span>{ph.phase}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{ph.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Settlement Tasks List Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Key Settlement Tasks ({completedTasksCount}/{totalTasksCount} Complete)
            </h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {settlementTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    task.completed 
                      ? 'bg-slate-50/80 border-slate-200/60 text-slate-500' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask && activeSettlement && onToggleTask(activeSettlement.id, task.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer transition ${
                        task.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300 hover:border-slate-500'
                      }`}
                      title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed && <Check className="w-3 h-3" />}
                    </button>
                    <span className={`truncate font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {task.assignee}
                    </span>
                    <span className="text-slate-400">Due: {task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 4: AGENT MESSAGE THREAD */}
      {(activeTab === 'all' || activeTab === 'messages') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>Message Thread with Your Buyers Advocate</span>
            </div>
            <span className="text-xs text-slate-500">
              Assigned Advocate: <strong className="text-slate-800">{advocate.name}</strong>
            </span>
          </div>

          <ClientAgentMessaging
            client={client}
            messages={messages}
            properties={clientProperties}
            onSendMessage={onSendMessage}
            onNavigate={onNavigate}
            onOpenPropertyDetail={onOpenPropertyDetail}
            compact={activeTab === 'all'}
          />
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#B8960C]" />
                <h3 className="font-bold text-slate-900 text-base">Upload Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Contract of Sale - 42 Bunya Pine"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C]"
                >
                  <option value="Contract of Sale">Contract of Sale</option>
                  <option value="Building & Pest">Building & Pest Report</option>
                  <option value="Pre-Approval & Finance">Pre-Approval & Finance</option>
                  <option value="Proof of ID & Entity">Proof of ID & Entity</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-1">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-semibold text-slate-700 text-xs">Select PDF, DOCX, or Image file</div>
                <div className="text-[11px] text-slate-400">Maximum file size: 25 MB</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A3A5C] hover:bg-[#224b75] text-white font-bold cursor-pointer"
                >
                  Upload & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
