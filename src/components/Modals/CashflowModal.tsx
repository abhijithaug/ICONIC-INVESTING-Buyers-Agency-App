import React, { useState } from 'react';
import { X, Calculator, DollarSign, TrendingUp, Percent, ShieldCheck } from 'lucide-react';
import { Property } from '../../types';

interface CashflowModalProps {
  property: Property | null;
  onClose: () => void;
}

export const CashflowModal: React.FC<CashflowModalProps> = ({ property, onClose }) => {
  if (!property) return null;

  const [purchasePrice, setPurchasePrice] = useState<number>(property.priceGuide);
  const [weeklyRent, setWeeklyRent] = useState<number>(property.weeklyRentEst);
  const [lvrPercent, setLvrPercent] = useState<number>(80);
  const [interestRate, setInterestRate] = useState<number>(5.95);
  const [loanType, setLoanType] = useState<'IO' | 'PI'>('IO'); // Interest Only or P&I
  const [annualDepreciation, setAnnualDepreciation] = useState<number>(6500);

  // Calculations
  const loanAmount = (purchasePrice * lvrPercent) / 100;
  const depositRequired = purchasePrice - loanAmount;
  const stampDutyEst = Math.round(purchasePrice * 0.042); // approx 4.2% average
  const legalAndFees = 2800;
  const totalCashRequired = depositRequired + stampDutyEst + legalAndFees;

  const annualRent = weeklyRent * 52;
  const annualMortgageInterest = (loanAmount * (interestRate / 100));
  const annualManagementFee = (annualRent * property.propertyManagementRate) / 100;
  const annualOutgoings = 
    property.councilRatesPerYear + 
    property.waterRatesPerYear + 
    property.insurancePerYear + 
    annualManagementFee + 
    1000; // $1k maintenance allowance

  const netOperatingIncome = annualRent - annualOutgoings;
  const preTaxCashflowAnnual = netOperatingIncome - annualMortgageInterest;
  const preTaxCashflowWeekly = Math.round(preTaxCashflowAnnual / 52);

  // Tax deductions (assumes 37% marginal tax bracket)
  const taxableDeduction = annualMortgageInterest + annualOutgoings + annualDepreciation;
  const taxableIncomeFromProperty = annualRent - taxableDeduction;
  const taxBenefitOrLiability = taxableIncomeFromProperty < 0 ? Math.abs(taxableIncomeFromProperty) * 0.37 : -(taxableIncomeFromProperty * 0.37);
  const afterTaxCashflowAnnual = Math.round(preTaxCashflowAnnual + taxBenefitOrLiability);
  const afterTaxCashflowWeekly = Math.round(afterTaxCashflowAnnual / 52);

  const cashOnCashReturn = ((afterTaxCashflowAnnual / totalCashRequired) * 100).toFixed(2);
  const calculatedGrossYield = ((annualRent / purchasePrice) * 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#1A3A5C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#B8960C] text-white flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-heading">Cashflow & ROI Financial Underwriter</h2>
              <p className="text-xs text-slate-300 truncate max-w-md">{property.address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Sliders */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Price ($ AUD)
              </label>
              <input
                type="number"
                step={5000}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Rent ($ / Week)
              </label>
              <input
                type="number"
                step={10}
                value={weeklyRent}
                onChange={(e) => setWeeklyRent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan to Value Ratio (LVR %): {lvrPercent}%
              </label>
              <input
                type="range"
                min={50}
                max={90}
                step={5}
                value={lvrPercent}
                onChange={(e) => setLvrPercent(Number(e.target.value))}
                className="w-full accent-[#B8960C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mortgage Interest Rate (%): {interestRate}%
              </label>
              <input
                type="number"
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Upfront Capital Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Initial Capital Outlay</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400">Cash Deposit ({100 - lvrPercent}%)</span>
                <div className="font-bold text-slate-800 font-mono mt-0.5">${depositRequired.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400">Est. Stamp Duty</span>
                <div className="font-bold text-slate-800 font-mono mt-0.5">${stampDutyEst.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400">Legal & Fees</span>
                <div className="font-bold text-slate-800 font-mono mt-0.5">${legalAndFees.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-900 font-semibold">Total Funds Needed</span>
                <div className="font-bold text-amber-900 font-mono mt-0.5">${totalCashRequired.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Underwriting Results Card */}
          <div className="bg-gradient-to-br from-[#1A3A5C] to-[#0E2238] text-white p-5 rounded-2xl shadow-xl space-y-4">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">
              Projected Investment Returns & Holding Cost
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300">Gross Yield</span>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {calculatedGrossYield}%
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300">Pre-Tax Weekly</span>
                <div className={`text-base font-bold font-mono mt-0.5 ${preTaxCashflowWeekly >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {preTaxCashflowWeekly >= 0 ? `+$${preTaxCashflowWeekly}` : `-$${Math.abs(preTaxCashflowWeekly)}`}/wk
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300">After-Tax Weekly</span>
                <div className={`text-base font-bold font-mono mt-0.5 ${afterTaxCashflowWeekly >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {afterTaxCashflowWeekly >= 0 ? `+$${afterTaxCashflowWeekly}` : `-$${Math.abs(afterTaxCashflowWeekly)}`}/wk
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-300">Cash-on-Cash ROI</span>
                <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
                  {cashOnCashReturn}%
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed italic">
              *Calculations factor in loan interest (${Math.round(annualMortgageInterest).toLocaleString()}/yr), council/water rates, landlord insurance, 7.5% management fee, and estimated tax depreciation.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1A3A5C] text-white text-xs font-semibold rounded-xl hover:bg-[#2A5480] cursor-pointer"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
