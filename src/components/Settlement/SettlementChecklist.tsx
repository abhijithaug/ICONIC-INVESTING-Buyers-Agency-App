import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  UserCheck, 
  FileText, 
  Check, 
  Plus, 
  Building2, 
  ShieldCheck, 
  Key, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock3,
  CalendarCheck,
  Edit2,
  Trash2,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SettlementRecord, SettlementTask, SettlementSectionKey, AppSection } from '../../types';

interface SettlementChecklistProps {
  settlements: SettlementRecord[];
  selectedSettlementId?: string;
  onUpdateSettlement: (record: SettlementRecord) => void;
  onNavigate: (section: AppSection, propertyId?: string) => void;
}

const SECTION_METADATA: Record<
  SettlementSectionKey,
  { title: string; subtitle: string; icon: any; color: string; badgeBg: string; borderActive: string }
> = {
  'pre-exchange': {
    title: 'Pre-Exchange',
    subtitle: 'Legal Due Diligence, Inspections & Loan Formal Approval',
    icon: ShieldCheck,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    borderActive: 'border-blue-500'
  },
  'exchange': {
    title: 'Exchange',
    subtitle: 'Contract Execution, Deposit Escrow & Cooling-Off Tracking',
    icon: FileCheck,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    borderActive: 'border-amber-500'
  },
  'pre-settlement': {
    title: 'Pre-Settlement',
    subtitle: 'Final Walk-Through, Utilities Transfer & Building Insurance',
    icon: Building2,
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    borderActive: 'border-purple-500'
  },
  'settlement-day': {
    title: 'Settlement Day',
    subtitle: 'PEXA Financial Settlement, Key Handover & Title Registration',
    icon: Key,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    borderActive: 'border-emerald-500'
  }
};

const SECTION_KEYS: SettlementSectionKey[] = ['pre-exchange', 'exchange', 'pre-settlement', 'settlement-day'];

export const SettlementChecklist: React.FC<SettlementChecklistProps> = ({
  settlements = [],
  selectedSettlementId,
  onUpdateSettlement,
  onNavigate
}) => {
  const safeSettlements = settlements || [];
  const [activeSettlementId, setActiveSettlementId] = useState<string>(
    selectedSettlementId || (safeSettlements.length > 0 ? safeSettlements[0].id : '')
  );

  const activeSettlement = safeSettlements.find(s => s.id === activeSettlementId) || safeSettlements[0];

  const [activeTabSection, setActiveTabSection] = useState<SettlementSectionKey | 'ALL'>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  // Add Task Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [newTaskSection, setNewTaskSection] = useState<SettlementSectionKey>('pre-settlement');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<SettlementTask['assignee']>('Buyers Agent');
  const [newTaskDocument, setNewTaskDocument] = useState<string>('');

  // Inline editing due date state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState<string>('');

  React.useEffect(() => {
    if (selectedSettlementId) {
      setActiveSettlementId(selectedSettlementId);
    }
  }, [selectedSettlementId]);

  if (!activeSettlement) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
        <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-800 text-base">No Property Currently in Conveyancing</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          When an offer is marked as accepted in the Offer & Negotiation module, it will automatically populate here for conveyancing and settlement management.
        </p>
      </div>
    );
  }

  // Normalise tasks to include section if legacy
  const normalizeTaskSection = (t: SettlementTask): SettlementSectionKey => {
    if (t.section) return t.section;
    if (t.phase === 1) return 'pre-exchange';
    if (t.phase === 2) return 'exchange';
    if (t.phase === 3 || t.phase === 4) return 'pre-settlement';
    if (t.phase === 5) return 'settlement-day';
    return 'pre-settlement';
  };

  const safeTasks: SettlementTask[] = (activeSettlement.tasks || []).map(t => ({
    ...t,
    section: normalizeTaskSection(t),
    sectionName: (
      normalizeTaskSection(t) === 'pre-exchange' ? 'Pre-Exchange' :
      normalizeTaskSection(t) === 'exchange' ? 'Exchange' :
      normalizeTaskSection(t) === 'pre-settlement' ? 'Pre-Settlement' : 'Settlement Day'
    )
  }));

  const completedTasksCount = safeTasks.filter(t => t.completed).length;
  const totalTasksCount = safeTasks.length || 1;
  const overallPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = safeTasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString().slice(0, 16).replace('T', ' ') : undefined
        };
      }
      return t;
    });

    const isAllDone = updatedTasks.every(t => t.completed);
    const updatedRecord: SettlementRecord = {
      ...activeSettlement,
      tasks: updatedTasks,
      status: isAllDone ? 'Settled' : 'In Progress'
    };

    onUpdateSettlement(updatedRecord);
  };

  const handleSaveDueDate = (taskId: string) => {
    if (!editingDueDate) {
      setEditingTaskId(null);
      return;
    }
    const updatedTasks = safeTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, dueDate: editingDueDate };
      }
      return t;
    });

    onUpdateSettlement({
      ...activeSettlement,
      tasks: updatedTasks
    });
    setEditingTaskId(null);
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const sectionNameMap: Record<SettlementSectionKey, SettlementTask['sectionName']> = {
      'pre-exchange': 'Pre-Exchange',
      'exchange': 'Exchange',
      'pre-settlement': 'Pre-Settlement',
      'settlement-day': 'Settlement Day'
    };

    const newTask: SettlementTask = {
      id: `st-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription || 'Custom milestone added by Buyers Agent.',
      section: newTaskSection,
      sectionName: sectionNameMap[newTaskSection],
      dueDate: newTaskDueDate || activeSettlement.settlementDate,
      completed: false,
      assignee: newTaskAssignee,
      documentName: newTaskDocument.trim() ? newTaskDocument.trim() : undefined
    };

    const updatedRecord = {
      ...activeSettlement,
      tasks: [...safeTasks, newTask]
    };

    onUpdateSettlement(updatedRecord);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setNewTaskDocument('');
    setShowAddTaskModal(false);
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTasks = safeTasks.filter(t => t.id !== taskId);
    onUpdateSettlement({
      ...activeSettlement,
      tasks: updatedTasks
    });
  };

  const handleFinalizeSettlement = () => {
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.5 }
    });

    const updatedTasks = safeTasks.map(t => ({
      ...t,
      completed: true,
      completedAt: t.completedAt || new Date().toISOString().slice(0, 16).replace('T', ' ')
    }));

    const updated: SettlementRecord = {
      ...activeSettlement,
      status: 'Settled',
      tasks: updatedTasks,
      daysRemaining: 0
    };
    onUpdateSettlement(updated);
  };

  // Filter tasks
  const getTasksForSection = (sec: SettlementSectionKey) => {
    return safeTasks.filter(t => {
      const matchSec = t.section === sec;
      const matchAssignee = filterAssignee === 'ALL' || t.assignee === filterAssignee;
      const matchStatus = 
        filterStatus === 'ALL' ? true :
        filterStatus === 'COMPLETED' ? t.completed : !t.completed;
      return matchSec && matchAssignee && matchStatus;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading">
              Settlement & Conveyancing Checklist
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Structured 4-stage property purchase verification: Pre-Exchange, Exchange, Pre-Settlement, and Settlement Day.
          </p>
        </div>

        {/* Property Selector & Add Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Active Property:</span>
            <select
              value={activeSettlementId}
              onChange={(e) => setActiveSettlementId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]"
            >
              {settlements.map(s => (
                <option key={s.id} value={s.id}>
                  {s.propertyAddress}
                </option>
              ))}
            </select>
          </div>

          <button
            id="add-settlement-task-btn"
            onClick={() => {
              setNewTaskDueDate(activeSettlement.settlementDate);
              setShowAddTaskModal(true);
            }}
            className="flex items-center gap-1.5 bg-[#B8960C] hover:bg-[#9E8009] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Checklist Item</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card with Financials & PEXA Countdown */}
      <div className="bg-gradient-to-r from-[#1A3A5C] via-[#1E436A] to-[#0E2238] rounded-2xl p-6 text-white shadow-xl border border-[#B8960C]/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                PEXA Electronic Settlement Workspace
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                activeSettlement.status === 'Settled' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {activeSettlement.status}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white font-serif-heading mt-2">
              {activeSettlement.propertyAddress}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                Contract Date: <strong>{activeSettlement.contractDate}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                Settlement Date: <strong className="text-amber-200">{activeSettlement.settlementDate}</strong>
              </span>
              {activeSettlement.coolingOffExpiry && (
                <>
                  <span>•</span>
                  <span className="text-slate-300">
                    Cooling-Off: <strong className="text-slate-100">{activeSettlement.coolingOffExpiry}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Action Block */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#0E2238]/80 backdrop-blur border border-slate-700 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Days to Handover</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {activeSettlement.daysRemaining} <span className="text-xs text-slate-300 font-normal">Days</span>
              </div>
            </div>

            {activeSettlement.status !== 'Settled' ? (
              <button
                id="settlement-finalize-btn"
                onClick={handleFinalizeSettlement}
                className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-300" />
                <span>Mark All Complete & Handover</span>
              </button>
            ) : (
              <div className="bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Settlement Finalized & Keys Handed Over</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Flow Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Agreed Purchase Price</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              ${activeSettlement.purchasePrice.toLocaleString()} AUD
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">10% Deposit Paid (In Trust)</span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              ${activeSettlement.depositPaid.toLocaleString()} AUD
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Balance Due at PEXA Settlement</span>
            <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
              ${activeSettlement.balanceDueAtSettlement.toLocaleString()} AUD
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1.5">
            <span>End-to-End Checklist Completion</span>
            <span className="text-[#B8960C] font-mono font-bold">
              {completedTasksCount} of {totalTasksCount} Items Completed ({overallPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-[#B8960C] via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Interactive Section Cards Navigator (Prompt 6 Sections) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SECTION_KEYS.map((secKey) => {
          const meta = SECTION_METADATA[secKey];
          const tasksInSec = safeTasks.filter(t => t.section === secKey);
          const doneInSec = tasksInSec.filter(t => t.completed).length;
          const secTotal = tasksInSec.length || 1;
          const secPct = Math.round((doneInSec / secTotal) * 100);
          const isSelected = activeTabSection === secKey;
          const isFullyDone = tasksInSec.length > 0 && doneInSec === tasksInSec.length;
          const Icon = meta.icon;

          return (
            <div
              key={secKey}
              onClick={() => setActiveTabSection(isSelected ? 'ALL' : secKey)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#1A3A5C]'
                  : isFullyDone
                  ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-white/10 text-amber-300' : meta.color
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {meta.title}
                    </h3>
                  </div>
                </div>

                {isFullyDone ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                    {doneInSec}/{tasksInSec.length}
                  </span>
                )}
              </div>

              <p className={`text-[11px] mt-2 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {meta.subtitle}
              </p>

              {/* Progress bar per section */}
              <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFullyDone ? 'bg-emerald-500' : isSelected ? 'bg-amber-400' : 'bg-[#1A3A5C]'
                    }`}
                    style={{ width: `${secPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Checklist Body & Sidebar Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: 4 Sections with Checkboxes and Due Date Fields */}
        <div className="lg:col-span-8 space-y-6">

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">View Section:</span>
              <button
                onClick={() => setActiveTabSection('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  activeTabSection === 'ALL'
                    ? 'bg-[#1A3A5C] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All 4 Sections ({safeTasks.length})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs"
                >
                  <option value="ALL">All Items</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Assignee:</span>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs"
                >
                  <option value="ALL">All Parties</option>
                  <option value="Conveyancer">Conveyancer</option>
                  <option value="Mortgage Broker">Mortgage Broker</option>
                  <option value="Buyers Agent">Buyers Agent</option>
                  <option value="Client">Client</option>
                  <option value="Building Inspector">Building Inspector</option>
                  <option value="Property Manager">Property Manager</option>
                  <option value="Insurer">Insurer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Render Sections */}
          {SECTION_KEYS.filter(secKey => activeTabSection === 'ALL' || activeTabSection === secKey).map(secKey => {
            const meta = SECTION_METADATA[secKey];
            const tasks = getTasksForSection(secKey);
            const doneCount = tasks.filter(t => t.completed).length;
            const Icon = meta.icon;

            return (
              <div
                key={secKey}
                id={`settlement-section-${secKey}`}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Section Header */}
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                          {meta.title}
                        </h2>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.badgeBg}`}>
                          {doneCount} / {tasks.length} Completed
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {meta.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNewTaskSection(secKey);
                      setNewTaskDueDate(activeSettlement.settlementDate);
                      setShowAddTaskModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#1A3A5C] hover:text-[#B8960C] transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Section Items */}
                <div className="divide-y divide-slate-100 p-2">
                  {tasks.map(task => {
                    const isEditingDate = editingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        id={`task-item-${task.id}`}
                        className={`p-3.5 rounded-xl transition flex flex-col sm:flex-row sm:items-start gap-3 ${
                          task.completed
                            ? 'bg-emerald-50/40 opacity-80'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-0.5 shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                              task.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'border-slate-300 bg-white hover:border-[#B8960C]'
                            }`}
                            aria-label={`Toggle task: ${task.title}`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h4
                              onClick={() => handleToggleTask(task.id)}
                              className={`text-xs sm:text-sm font-bold cursor-pointer select-none ${
                                task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h4>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {task.assignee}
                              </span>
                              <button
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                title="Delete task"
                                className="text-slate-300 hover:text-rose-500 transition p-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            {task.description}
                          </p>

                          {task.notes && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 mt-2">
                              <strong className="text-slate-700">Note:</strong> {task.notes}
                            </div>
                          )}

                          {/* Due Date & Attachments Bar */}
                          <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                            
                            {/* Due Date Field with Inline Edit */}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#B8960C]" />
                              <span className="text-[11px] font-semibold text-slate-400">Due Date:</span>
                              {isEditingDate ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="date"
                                    value={editingDueDate}
                                    onChange={(e) => setEditingDueDate(e.target.value)}
                                    className="px-1.5 py-0.5 text-xs rounded border border-slate-300 bg-white"
                                  />
                                  <button
                                    onClick={() => handleSaveDueDate(task.id)}
                                    className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-semibold hover:bg-emerald-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingTaskId(null)}
                                    className="px-1.5 py-0.5 text-slate-500 text-[10px] hover:text-slate-800"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 group">
                                  <span className="font-mono text-slate-800 font-semibold text-[11px]">
                                    {task.dueDate}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingTaskId(task.id);
                                      setEditingDueDate(task.dueDate);
                                    }}
                                    title="Edit Due Date"
                                    className="text-slate-400 hover:text-[#1A3A5C] p-0.5"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Completed Timestamp */}
                            {task.completed && task.completedAt && (
                              <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Completed on {task.completedAt}</span>
                              </span>
                            )}

                            {/* Document Link / Verification */}
                            {task.documentName && (
                              <span className="flex items-center gap-1 text-blue-700 text-[11px] font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                <FileText className="w-3 h-3" />
                                <span>{task.documentName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {tasks.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No items matching the current filter in this section.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 4 Cols: Conveyancing Team & Key Dates */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Key Dates Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#B8960C]" />
              <span>Conveyancing Critical Dates</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">1. Contract Exchange</span>
                  <div className="font-bold text-slate-900">{activeSettlement.contractDate}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Executed</span>
              </div>

              {activeSettlement.coolingOffExpiry && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">2. Cooling-Off Expiry</span>
                    <div className="font-bold text-slate-900">{activeSettlement.coolingOffExpiry}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Unconditional</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">3. Pre-Settlement Walkthrough</span>
                  <div className="font-bold text-slate-900">
                    {safeTasks.find(t => t.id === 'st-ps-1')?.dueDate || '2-3 Days Prior'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Scheduled</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1A3A5C]/5 border border-[#1A3A5C]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#1A3A5C] uppercase font-bold">4. Final PEXA Settlement</span>
                  <div className="font-bold text-[#1A3A5C] font-mono">{activeSettlement.settlementDate}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#B8960C] text-white text-[10px] font-bold">
                  {activeSettlement.daysRemaining}d Left
                </span>
              </div>
            </div>
          </div>

          {/* Stakeholders Contact Directory */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#1A3A5C]" />
              <span>Conveyancing Team Directory</span>
            </h3>

            {/* Conveyancer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Solicitor / Conveyancer</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">PEXA Lead</span>
              </div>
              <div className="font-bold text-slate-900">{activeSettlement.conveyancer.name}</div>
              <div className="text-slate-500 text-[11px]">{activeSettlement.conveyancer.firm}</div>
              <div className="flex items-center gap-3 pt-1 text-slate-700">
                <a href={`tel:${activeSettlement.conveyancer.phone}`} className="flex items-center gap-1 hover:text-[#B8960C]">
                  <Phone className="w-3 h-3 text-[#B8960C]" />
                  <span>Call</span>
                </a>
                <a href={`mailto:${activeSettlement.conveyancer.email}`} className="flex items-center gap-1 hover:text-[#B8960C]">
                  <Mail className="w-3 h-3 text-[#1A3A5C]" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Mortgage Broker */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mortgage Broker</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Finance Lead</span>
              </div>
              <div className="font-bold text-slate-900">{activeSettlement.mortgageBroker.name}</div>
              <div className="text-slate-500 text-[11px]">{activeSettlement.mortgageBroker.firm}</div>
              <div className="flex items-center gap-3 pt-1 text-slate-700">
                <a href={`tel:${activeSettlement.mortgageBroker.phone}`} className="flex items-center gap-1 hover:text-[#B8960C]">
                  <Phone className="w-3 h-3 text-[#B8960C]" />
                  <span>Call</span>
                </a>
                <a href={`mailto:${activeSettlement.mortgageBroker.email}`} className="flex items-center gap-1 hover:text-[#B8960C]">
                  <Mail className="w-3 h-3 text-[#1A3A5C]" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Property Manager */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Appointed Property Manager</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold">Leasing Lead</span>
              </div>
              <div className="font-bold text-slate-900">{activeSettlement.propertyManager.name}</div>
              <div className="text-slate-500 text-[11px]">{activeSettlement.propertyManager.agency}</div>
              <div className="flex items-center gap-3 pt-1 text-slate-700">
                <a href={`tel:${activeSettlement.propertyManager.phone}`} className="flex items-center gap-1 hover:text-[#B8960C]">
                  <Phone className="w-3 h-3 text-[#B8960C]" />
                  <span>Call</span>
                </a>
                <a href={`mailto:${activeSettlement.propertyManager.email}`} className="flex items-center gap-1 hover:text-[#B8960C]">
                  <Mail className="w-3 h-3 text-[#1A3A5C]" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#B8960C]" />
                <span>Add Settlement Checklist Item</span>
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Strata Inspection Section 184 Certificate Received"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1A3A5C] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checklist Section *</label>
                <select
                  value={newTaskSection}
                  onChange={(e) => setNewTaskSection(e.target.value as SettlementSectionKey)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="pre-exchange">1. Pre-Exchange (Solicitor, B&P, Finance Approval)</option>
                  <option value="exchange">2. Exchange (Deposit Paid, Signed Contracts, Cooling-Off)</option>
                  <option value="pre-settlement">3. Pre-Settlement (Final Inspection, Utilities, Insurance)</option>
                  <option value="settlement-day">4. Settlement Day (PEXA Funds, Keys Received, Title Confirmed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-[#1A3A5C] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Responsible Assignee *</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="Conveyancer">Conveyancer / Solicitor</option>
                  <option value="Mortgage Broker">Mortgage Broker</option>
                  <option value="Buyers Agent">Buyers Agent</option>
                  <option value="Client">Client / Purchaser</option>
                  <option value="Building Inspector">Building Inspector</option>
                  <option value="Property Manager">Property Manager</option>
                  <option value="Insurer">Building Insurer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Action Required</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or requirements for completing this milestone..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1A3A5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Attachment (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Strata_Report_Certificate.pdf"
                  value={newTaskDocument}
                  onChange={(e) => setNewTaskDocument(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1A3A5C] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#B8960C] hover:bg-[#9E8009] text-white rounded-lg font-semibold cursor-pointer shadow"
                >
                  Add Milestone Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
