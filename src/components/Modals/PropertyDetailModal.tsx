import React from 'react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Building2, 
  Check, 
  Phone, 
  Mail,
  Calendar,
  Layers,
  Bed,
  Bath,
  Car,
  UserCheck,
  Target,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Property, AppSection, ClientProfile } from '../../types';

interface PropertyDetailModalProps {
  property: Property | null;
  activeClient?: ClientProfile;
  onClose: () => void;
  onNavigate: (section: AppSection, propertyId?: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  activeClient,
  onClose,
  onNavigate
}) => {
  if (!property) return null;

  const clientMaxBudget = activeClient?.budgetMax || 950000;
  const isWithinBudget = property.priceGuide <= clientMaxBudget;
  const budgetDelta = property.priceGuide - clientMaxBudget;

  const clientTargetSuburbs = activeClient?.targetSuburbs || activeClient?.preferredSuburbs || [];
  const matchesSuburb = clientTargetSuburbs.some(s => 
    s.toLowerCase().includes(property.suburb.toLowerCase()) || property.suburb.toLowerCase().includes(s.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Modal Image Header */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900">
          <img
            src={property.imageUrl}
            alt={property.address}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {property.isOffMarket && (
              <span className="px-3 py-1 rounded-md bg-[#B8960C] text-white text-xs font-bold shadow-md uppercase tracking-wider">
                Off-Market Asset
              </span>
            )}
            <span className="px-3 py-1 rounded-md bg-[#1A3A5C] text-amber-200 text-xs font-semibold backdrop-blur">
              {property.propertyType}
            </span>
            <span className="px-3 py-1 rounded-md bg-white/90 text-slate-900 text-xs font-bold shadow-md">
              Status: {property.status}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-bold font-serif-heading">{property.address}</h2>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-4 h-4 text-[#B8960C]" />
              <span>{property.suburb}, {property.state} {property.postcode}</span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          
          {/* Active Client Mandate Match Section */}
          {activeClient && (
            <div className="bg-gradient-to-r from-slate-50 to-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Client Mandate Match: <span className="text-[#1A3A5C]">{activeClient.fullName || activeClient.name}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Goal: <strong className="text-slate-700">{activeClient.primaryGoal}</strong> • Target: ${activeClient.budgetMin.toLocaleString()} - ${activeClient.budgetMax.toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('onboarding');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#1A3A5C] hover:text-white text-[#1A3A5C] border border-slate-300 hover:border-[#1A3A5C] rounded-xl text-[11px] font-bold transition cursor-pointer shadow-xs"
                >
                  <span>Open Client Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Match Criteria Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                  isWithinBudget ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {isWithinBudget ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <div>
                    <div className="font-bold">{isWithinBudget ? 'Within Budget' : 'Exceeds Budget'}</div>
                    <div className="text-[10px] opacity-80">${property.priceGuide.toLocaleString()} vs max ${activeClient.budgetMax.toLocaleString()}</div>
                  </div>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                  matchesSuburb ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <Target className={`w-4 h-4 shrink-0 ${matchesSuburb ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-bold">{matchesSuburb ? 'Target Suburb Match' : 'Adjacent Location'}</div>
                    <div className="text-[10px] opacity-80">{property.suburb}, {property.state}</div>
                  </div>
                </div>

                <div className="p-2 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#B8960C] shrink-0" />
                  <div>
                    <div className="font-bold">Gross Yield: {property.grossYield}%</div>
                    <div className="text-[10px] opacity-80">${property.weeklyRentEst}/wk est. rent</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Guide Price</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                ${property.priceGuide.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-800 font-semibold uppercase">Gross Yield</span>
              <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                {property.grossYield}%
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <span className="text-[10px] text-amber-900 font-semibold uppercase">3-Yr Capital Growth</span>
              <div className="text-lg font-bold text-[#B8960C] font-mono mt-0.5">
                +{property.capitalGrowthForecast3Yr}% p.a.
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <span className="text-[10px] text-blue-800 font-semibold uppercase">Est. Rent / Wk</span>
              <div className="text-lg font-bold text-blue-700 font-mono mt-0.5">
                ${property.weeklyRentEst}
              </div>
            </div>
          </div>

          {/* Specs & Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Property Specifications</h4>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bedrooms:</span>
                  <span className="font-semibold">{property.bedrooms} Beds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bathrooms:</span>
                  <span className="font-semibold">{property.bathrooms} Baths</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Car Accommodation:</span>
                  <span className="font-semibold">{property.carSpaces} Secure Spaces</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Land Allotment:</span>
                  <span className="font-semibold">{property.landSizeM2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Days on Market:</span>
                  <span className="font-semibold">{property.daysOnMarket} Days</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Selling Agent Contacts</h4>
              <div className="space-y-1.5 text-slate-700">
                <div className="font-bold text-slate-900">{property.agentName}</div>
                <div className="text-slate-500 text-[11px]">{property.agentAgency}</div>
                <div className="flex items-center gap-3 pt-2">
                  <a href={`tel:${property.agentPhone}`} className="flex items-center gap-1 text-[#B8960C] font-semibold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{property.agentPhone}</span>
                  </a>
                </div>
                <div className="text-slate-500 text-[11px] truncate">
                  {property.agentEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Key Investment Features */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Key Investment Attributes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {property.keyFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buyers Agency Notes & Appraisal */}
          {property.notes && (
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/70 space-y-1.5">
              <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#B8960C]" />
                <span>Buyers Agency Appraisal & Notes</span>
              </h4>
              <p className="text-slate-800 text-xs leading-relaxed italic">
                &quot;{property.notes}&quot;
              </p>
            </div>
          )}

          {/* Outgoings Breakdown */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
            <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider">Annual Estimated Outgoings</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-amber-100">
                <span className="text-[10px] text-slate-400">Council Rates</span>
                <div className="font-bold text-slate-800 font-mono mt-0.5">${property.councilRatesPerYear}/yr</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-amber-100">
                <span className="text-[10px] text-slate-400">Water Rates</span>
                <div className="font-bold text-slate-800 font-mono mt-0.5">${property.waterRatesPerYear}/yr</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-amber-100">
                <span className="text-[10px] text-slate-400">Insurance</span>
                <div className="font-bold text-slate-800 font-mono mt-0.5">${property.insurancePerYear}/yr</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-amber-100">
                <span className="text-[10px] text-slate-400">Property Mgmt</span>
                <div className="font-bold text-slate-800 font-mono mt-0.5">{property.propertyManagementRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Close
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigate('analyser', property.id);
              }}
              className="px-4 py-2 bg-[#1A3A5C] hover:bg-[#2A5480] text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Analyze B&P Report</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigate('negotiation', property.id);
              }}
              className="px-4 py-2 bg-[#B8960C] hover:bg-[#9E8009] text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Make Offer</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
