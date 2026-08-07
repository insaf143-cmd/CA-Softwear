import React, { useState } from 'react';
import { Calculator, X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TaxCalculatorModal({ onClose }) {
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [dedD80C, setDed80C] = useState(150000);
  const [dedD80D, setDed80D] = useState(25000);
  const [homeLoanInt, setHomeLoanInt] = useState(0);

  // New Tax Regime AY 2026-27 Calculation
  const calculateNewRegime = (income) => {
    const stdDed = 75000;
    const taxable = Math.max(0, income - stdDed);

    if (taxable <= 700000) {
      // 87A rebate applies up to 7L taxable income under New Regime
      return { taxable, tax: 0, cess: 0, total: 0 };
    }

    let tax = 0;
    let rem = taxable;

    // Slabs:
    // 0 - 3,00,000: Nil
    // 3,00,001 - 7,00,000: 5% (max 20,000)
    // 7,00,001 - 10,00,000: 10% (max 30,000)
    // 10,00,001 - 12,00,000: 15% (max 30,000)
    // 12,00,001 - 15,00,000: 20% (max 60,000)
    // > 15,00,000: 30%

    if (rem > 1500000) {
      tax += (rem - 1500000) * 0.30;
      rem = 1500000;
    }
    if (rem > 1200000) {
      tax += (rem - 1200000) * 0.20;
      rem = 1200000;
    }
    if (rem > 1000000) {
      tax += (rem - 1000000) * 0.15;
      rem = 1000000;
    }
    if (rem > 700000) {
      tax += (rem - 700000) * 0.10;
      rem = 700000;
    }
    if (rem > 300000) {
      tax += (rem - 300000) * 0.05;
      rem = 300000;
    }

    const cess = tax * 0.04;
    return { taxable, tax, cess, total: Math.round(tax + cess) };
  };

  // Old Tax Regime Calculation
  const calculateOldRegime = (income, d80c, d80d, hLoan) => {
    const stdDed = 50000;
    const totalDeductions = stdDed + Math.min(150000, Number(d80c)) + Math.min(100000, Number(d80d)) + Math.min(200000, Number(hLoan));
    const taxable = Math.max(0, income - totalDeductions);

    if (taxable <= 500000) {
      return { taxable, tax: 0, cess: 0, total: 0 };
    }

    let tax = 0;
    let rem = taxable;

    if (rem > 1000000) {
      tax += (rem - 1000000) * 0.30;
      rem = 1000000;
    }
    if (rem > 500000) {
      tax += (rem - 500000) * 0.20;
      rem = 500000;
    }
    if (rem > 250000) {
      tax += (rem - 250000) * 0.05;
      rem = 250000;
    }

    const cess = tax * 0.04;
    return { taxable, tax, cess, total: Math.round(tax + cess) };
  };

  const newRes = calculateNewRegime(Number(grossIncome));
  const oldRes = calculateOldRegime(Number(grossIncome), dedD80C, dedD80D, homeLoanInt);

  const savings = Math.abs(newRes.total - oldRes.total);
  const recommendedRegime = newRes.total <= oldRes.total ? 'New Tax Regime (u/s 115BAC)' : 'Old Tax Regime';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Income Tax Quick Estimator (AY 2026-27 / FY 2025-26)
            </h3>
            <p className="text-xs text-slate-400">Compare Tax Payable under Old vs New Tax Regime</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gross Annual Income (₹)</label>
              <input
                type="number"
                step="50000"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Old Regime Deductions</span>

              <div>
                <label className="block text-slate-400 mb-0.5">Section 80C (PPF, ELSS, EPF, Life Insurance)</label>
                <input
                  type="number"
                  value={dedD80C}
                  onChange={(e) => setDed80C(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Section 80D Health Insurance</label>
                <input
                  type="number"
                  value={dedD80D}
                  onChange={(e) => setDed80D(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Section 24(b) Home Loan Interest</label>
                <input
                  type="number"
                  value={homeLoanInt}
                  onChange={(e) => setHomeLoanInt(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Comparison */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="font-bold text-emerald-400 text-sm">New Tax Regime</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  Std Ded: ₹75,000
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxable Income:</span>
                <span className="font-mono">₹{newRes.taxable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Income Tax + 4% Cess:</span>
                <span className="font-mono font-bold text-white">₹{newRes.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="font-bold text-blue-400 text-sm">Old Tax Regime</span>
                <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                  Std Ded: ₹50,000
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxable Income:</span>
                <span className="font-mono">₹{oldRes.taxable.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Income Tax + 4% Cess:</span>
                <span className="font-mono font-bold text-white">₹{oldRes.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                CA Recommendation:
              </div>
              <p className="text-xs text-slate-200">
                Recommend <strong>{recommendedRegime}</strong>. Taxpayer saves{' '}
                <strong className="text-emerald-400 font-mono">₹{savings.toLocaleString('en-IN')}</strong> in taxes!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
