import React, { useState } from 'react';
import { X, Plus, Building2, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { Property, PropertyType } from '../../types';

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: Property) => void;
}

export const NewPropertyModal: React.FC<NewPropertyModalProps> = ({
  isOpen,
  onClose,
  onAddProperty
}) => {
  if (!isOpen) return null;

  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('QLD');
  const [postcode, setPostcode] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Freestanding House');
  const [priceGuide, setPriceGuide] = useState<number>(750000);
  const [weeklyRentEst, setWeeklyRentEst] = useState<number>(680);
  const [bedrooms, setBedrooms] = useState<number>(4);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [carSpaces, setCarSpaces] = useState<number>(2);
  const [landSizeM2, setLandSizeM2] = useState<number>(600);
  const [isOffMarket, setIsOffMarket] = useState<boolean>(true);
  const [status, setStatus] = useState<Property['status']>('Shortlisted');
  const [notes, setNotes] = useState<string>('Off-market lead sourced via local contact. Strong potential for rental yield uplift.');
  const [daysOnMarket, setDaysOnMarket] = useState<number>(7);
  const [vendorMotivation, setVendorMotivation] = useState<string>('Deceased estate, executors seeking discreet off-market settlement within 45 days.');
  const [agentName, setAgentName] = useState<string>('Local Lead Agent');
  const [agentAgency, setAgentAgency] = useState<string>('Ray White Commercial');
  const [agentPhone, setAgentPhone] = useState<string>('0400 123 456');
  const [agentEmail, setAgentEmail] = useState<string>('agent@example.com');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !suburb) return;

    const annualRent = weeklyRentEst * 52;
    const grossYield = Number(((annualRent / priceGuide) * 100).toFixed(2));
    const netYield = Number((grossYield * 0.82).toFixed(2));
    const cashflowWeekly = Math.round((annualRent - (priceGuide * 0.8 * 0.0595) - 4000) / 52);

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      address,
      suburb,
      state,
      postcode,
      propertyType,
      priceGuide,
      weeklyRentEst,
      grossYield,
      netYield,
      cashflowWeekly,
      capitalGrowthForecast3Yr: 8.5,
      desirabilityScore: 88,
      isOffMarket,
      status,
      notes,
      shortlistTier: 'Tier 1 - Priority',
      bedrooms,
      bathrooms,
      carSpaces,
      landSizeM2,
      imageUrl,
      daysOnMarket,
      councilRatesPerYear: 1850,
      waterRatesPerYear: 950,
      insurancePerYear: 1200,
      propertyManagementRate: 7.5,
      agentName,
      agentAgency,
      agentPhone,
      agentEmail,
      vendorMotivation,
      keyFeatures: [
        'Large flat rectangular block',
        'Side access potential for granny flat / dual income',
        'High growth infrastructure corridor'
      ]
    };

    onAddProperty(newProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#1A3A5C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#B8960C] text-white flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-heading">Add Investment Property</h2>
              <p className="text-xs text-slate-300">Enter property details, asking guide, and off-market intel.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                placeholder="e.g. 15 Poinciana Crescent"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Suburb</label>
              <input
                type="text"
                placeholder="e.g. Strathpine"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="QLD">QLD</option>
                  <option value="WA">WA</option>
                  <option value="SA">SA</option>
                  <option value="NSW">NSW</option>
                  <option value="VIC">VIC</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postcode</label>
                <input
                  type="text"
                  placeholder="4500"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="Freestanding House">Freestanding House</option>
                <option value="Duplex / Dual Key">Duplex / Dual Key</option>
                <option value="Townhouse">Townhouse</option>
                <option value="House & Land">House & Land</option>
                <option value="Unit / Apartment">Unit / Apartment</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1A3A5C] bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 w-full">
                <input
                  type="checkbox"
                  checked={isOffMarket}
                  onChange={(e) => setIsOffMarket(e.target.checked)}
                  className="rounded text-[#B8960C]"
                />
                <span>Off-Market Deal</span>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Guide / Asking Price ($ AUD)</label>
              <input
                type="number"
                step={5000}
                value={priceGuide}
                onChange={(e) => setPriceGuide(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Est. Weekly Rent ($ / Wk)</label>
              <input
                type="number"
                step={10}
                value={weeklyRentEst}
                onChange={(e) => setWeeklyRentEst(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs text-emerald-700 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bedrooms / Baths / Cars</label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="px-2 py-1.5 rounded border border-slate-300 text-center"
                  placeholder="Bed"
                />
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="px-2 py-1.5 rounded border border-slate-300 text-center"
                  placeholder="Bath"
                />
                <input
                  type="number"
                  value={carSpaces}
                  onChange={(e) => setCarSpaces(Number(e.target.value))}
                  className="px-2 py-1.5 rounded border border-slate-300 text-center"
                  placeholder="Car"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Land Size (m²)</label>
              <input
                type="number"
                value={landSizeM2}
                onChange={(e) => setLandSizeM2(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Badge</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                <option value="Shortlisted">⭐️ Shortlisted</option>
                <option value="Under Review">⏱️ Under Review</option>
                <option value="Offer Made">✨ Offer Made</option>
                <option value="Passed">🚫 Passed</option>
                <option value="Due Diligence">📋 Due Diligence</option>
                <option value="Under Contract">🤝 Under Contract</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Days on Market</label>
              <input
                type="number"
                value={daysOnMarket}
                onChange={(e) => setDaysOnMarket(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                placeholder="e.g. 7"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Buyers Agency Notes & Appraisal</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Enter evaluation notes, strategic value, or renovation potential..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Vendor Motivation Intel</label>
              <input
                type="text"
                value={vendorMotivation}
                onChange={(e) => setVendorMotivation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#B8960C] hover:bg-[#9E8009] text-white rounded-xl font-semibold cursor-pointer shadow"
            >
              Save & Add to Shortlist
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
