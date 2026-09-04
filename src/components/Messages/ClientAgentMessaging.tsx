import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Building2, 
  Phone, 
  Mail, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  User,
  CheckCircle2,
  Info,
  Download
} from 'lucide-react';
import { AgentMessage, AdvocateContact, ClientProfile, Property, AppSection } from '../../types';
import { ADVOCATES } from '../../data/mockMessages';

interface ClientAgentMessagingProps {
  client: ClientProfile;
  messages: AgentMessage[];
  properties: Property[];
  onSendMessage: (text: string, propertyRef?: Property, attachmentName?: string) => void;
  onNavigate?: (section: AppSection, targetId?: string) => void;
  onOpenPropertyDetail?: (property: Property) => void;
  compact?: boolean;
}

export const ClientAgentMessaging: React.FC<ClientAgentMessagingProps> = ({
  client,
  messages,
  properties,
  onSendMessage,
  onNavigate,
  onOpenPropertyDetail,
  compact = false
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const advocateName = client.assignedAgent || 'Damian Sterling';
  const advocate: AdvocateContact = ADVOCATES[advocateName] || ADVOCATES['Damian Sterling'];

  // Filter messages for this client
  const clientMessages = messages.filter(m => m.clientId === client.id);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [clientMessages.length, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const attachedProp = properties.find(p => p.id === selectedPropertyId);
    const text = inputText.trim();
    setInputText('');
    setSelectedPropertyId('');

    onSendMessage(text, attachedProp);

    // Simulate advocate typing and auto-reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${
      compact ? 'h-[540px]' : 'h-[750px] max-h-[85vh]'
    }`}>
      {/* 1. Header: Advocate Profile & Live Status */}
      <div className="bg-[#0E2238] text-white p-4 border-b border-[#B8960C]/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={advocate.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'}
              alt={advocate.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-[#B8960C]"
            />
            <span 
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0E2238] rounded-full shadow-xs"
              title="Online now"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base leading-snug">{advocate.name}</h3>
              <span className="bg-[#B8960C]/30 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300/30">
                Your Buyers Advocate
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{advocate.role} • {advocate.agency}</p>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-amber-200/90 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#B8960C]" />
                {advocate.licenseNumber}
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline text-slate-300">Resp: {advocate.typicalResponseTime}</span>
            </div>
          </div>
        </div>

        {/* Action Direct Contact Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${advocate.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition"
            title="Call advocate direct line"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">{advocate.phone}</span>
          </a>
          <a
            href={`mailto:${advocate.email}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition"
            title="Email advocate"
          >
            <Mail className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Email</span>
          </a>
        </div>
      </div>

      {/* 2. Message History Feed */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        
        {/* Trust & Direct Line Notice Banner */}
        <div className="mx-auto max-w-lg p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-center text-xs text-amber-900 shadow-xs">
          <div className="font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#B8960C]" />
            Direct Advocate Advisory Thread
          </div>
          <p className="text-[11px] text-amber-800/90 mt-0.5">
            This private thread connects you directly to {advocate.name}. Discuss your shortlist, contract terms, inspection reports, and offer instructions in real time.
          </p>
        </div>

        {clientMessages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${
                isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              {isAgent ? (
                <img
                  src={msg.senderAvatar || advocate.avatarUrl}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-lg object-cover border border-amber-300/40 shrink-0 mt-1 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#1A3A5C] text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs border border-white/20">
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Message Bubble */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                  <span className="font-bold text-slate-700">{msg.senderName}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl shadow-xs text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      : 'bg-[#1A3A5C] text-white rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Attached Property Reference Card */}
                  {msg.propertyRef && (
                    <div className={`mt-3 p-2.5 rounded-xl border flex items-center gap-3 transition ${
                      isAgent ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}>
                      {msg.propertyRef.imageUrl && (
                        <img
                          src={msg.propertyRef.imageUrl}
                          alt={msg.propertyRef.address}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-xs truncate ${isAgent ? 'text-[#1A3A5C]' : 'text-amber-200'}`}>
                          {msg.propertyRef.address}
                        </div>
                        <div className={`text-[10px] truncate ${isAgent ? 'text-slate-500' : 'text-slate-300'}`}>
                          {msg.propertyRef.suburb}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-emerald-600 mt-0.5">
                          ${msg.propertyRef.priceGuide.toLocaleString()} AUD
                        </div>
                      </div>

                      {onOpenPropertyDetail && (
                        <button
                          type="button"
                          onClick={() => {
                            const found = properties.find(p => p.id === msg.propertyRef?.id);
                            if (found) onOpenPropertyDetail(found);
                          }}
                          className="p-1.5 rounded-lg bg-[#B8960C] text-slate-950 hover:bg-[#9E8009] transition shrink-0 cursor-pointer"
                          title="View property details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Attached Document Card */}
                  {msg.attachment && (
                    <div className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      isAgent ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-white/10 border-white/20 text-white'
                    }`}>
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#B8960C] shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-[11px] truncate">{msg.attachment.name}</div>
                          <div className="text-[9px] opacity-75">{msg.attachment.type} • {msg.attachment.size}</div>
                        </div>
                      </div>
                      <span className="p-1 rounded-md bg-white/20 text-xs shrink-0" title="Verified Document">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Read status */}
                <div className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${
                  isAgent ? '' : 'justify-end'
                }`}>
                  {!isAgent && (
                    <>
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span>Read by {advocate.name.split(' ')[0]}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-center text-slate-500 text-xs animate-pulse pl-1">
            <img
              src={advocate.avatarUrl}
              alt={advocate.name}
              className="w-6 h-6 rounded-md object-cover"
            />
            <span className="font-medium text-slate-600">{advocate.name} is typing...</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Action Chips */}
      <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200/80 overflow-x-auto shrink-0 flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#B8960C]" />
          Quick Prompts:
        </span>
        <button
          type="button"
          onClick={() => handleQuickPrompt('Can we request a contract review on our top shortlisted property?')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 transition cursor-pointer"
        >
          📄 Request Contract Review
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt('What is our recommended offer price anchor for 42 Bunya Pine?')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 transition cursor-pointer"
        >
          💰 Advise Offer Price
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt('Can you book an off-market inspection this Thursday?')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 transition cursor-pointer"
        >
          🔍 Book Inspection
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt('How are the settlement conditions tracking with our conveyancer?')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 transition cursor-pointer"
        >
          ⏱️ Settlement Check
        </button>
      </div>

      {/* 4. Composer Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 shrink-0">
        
        {/* Optional Property Reference Selector */}
        {properties.length > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">
              Attach Property:
            </span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#1A3A5C] truncate max-w-xs"
            >
              <option value="">No property attached</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.address}, {p.suburb} (${p.priceGuide.toLocaleString()})
                </option>
              ))}
            </select>
            {selectedPropertyId && (
              <span className="text-[10px] text-emerald-600 font-semibold">
                ✓ Property card will be attached to message
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${advocate.name}...`}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#1A3A5C] hover:bg-[#224b75] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-40 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5 text-[#B8960C]" />
          </button>
        </div>
      </form>
    </div>
  );
};
