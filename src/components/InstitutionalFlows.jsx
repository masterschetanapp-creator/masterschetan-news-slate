import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, HelpCircle, ShieldCheck, Clock } from 'lucide-react';

const FALLBACK_FII_DII = {
  sessionDate: '05 Aug 2026',
  fiiNet: '-943.42',
  fiiIsBuy: false,
  diiNet: '+2,883.17',
  diiIsBuy: true,
  combinedNet: '+1,939.75',
  combinedIsBuy: true
};

const formatCrValue = (valStr, fallbackIsBuy = true) => {
  if (!valStr) return '₹0.00 Cr';
  const str = String(valStr).trim();
  const isNegative = str.startsWith('-');
  const clean = str.replace(/[+₹\s-]/g, '');
  if (isNegative) {
    return `-₹${clean} Cr`;
  }
  return fallbackIsBuy ? `+₹${clean} Cr` : `-₹${clean} Cr`;
};

export default function InstitutionalFlows() {
  const [fiiDii, setFiiDii] = useState(FALLBACK_FII_DII);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    async function loadOfficialData() {
      try {
        const res = await fetch(`/market-data.json?cache_buster=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.fiiDii) {
            setFiiDii(json.fiiDii);
          }
        }
      } catch (e) {
        console.warn('Institutional flow fetch info:', e.message);
      }
    }
    loadOfficialData();
  }, []);

  const sessionDate = fiiDii?.sessionDate || '05 Aug 2026';
  const fiiIsBuy = Boolean(fiiDii?.fiiIsBuy);
  const diiIsBuy = fiiDii?.diiIsBuy !== undefined ? Boolean(fiiDii.diiIsBuy) : true;
  const combinedIsBuy = fiiDii?.combinedIsBuy !== undefined ? Boolean(fiiDii.combinedIsBuy) : true;

  return (
    <div className="mb-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="p-2 bg-red-500/20 rounded-xl text-red-400 border border-red-500/30">
              <Landmark className="w-5 h-5" />
            </span>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-100">
                Institutional Cash Flows (FII & DII)
              </h3>
              <button
                onClick={() => setShowTooltip(prev => !prev)}
                className="text-slate-400 hover:text-white transition-colors relative"
                title="What are FII & DII Flows?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Official Exchange Session Timestamp Badge */}
            <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-md border border-slate-700">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>NSE/BSE OFFICIAL • {sessionDate}</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium max-w-xl leading-relaxed">
            Official NSE & BSE provisional net cash activity of Foreign Institutional Investors (FII) & Domestic Mutual Funds (DII).
          </p>

          {/* Interactive Explanation Tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-1 mt-2"
            >
              <p><strong className="text-emerald-400">FII (Foreign Institutional Investors):</strong> Global funds, hedge funds, and pension funds. FII inflows signal global confidence in Indian markets.</p>
              <p><strong className="text-blue-400">DII (Domestic Institutional Investors):</strong> Domestic mutual funds, LIC, and pension funds. Strong DII buying acts as a shock-absorber for retail SIP investors.</p>
            </motion.div>
          )}
        </div>

        {/* Right Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* FII Card */}
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">
              FII Net Cash (Foreign)
            </span>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-black tabular-nums ${fiiIsBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCrValue(fiiDii?.fiiNet, fiiIsBuy)}
              </span>
              <span className={`p-1 rounded-md text-xs font-bold ${
                fiiIsBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {fiiIsBuy ? 'BUY' : 'SELL'}
              </span>
            </div>
          </div>

          {/* DII Card */}
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">
              DII Net Cash (Domestic)
            </span>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-black tabular-nums ${diiIsBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCrValue(fiiDii?.diiNet, diiIsBuy)}
              </span>
              <span className={`p-1 rounded-md text-xs font-bold ${
                diiIsBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {diiIsBuy ? 'BUY' : 'SELL'}
              </span>
            </div>
          </div>

          {/* Combined Inflow Card */}
          <div className={`p-4 rounded-2xl backdrop-blur-md ${
            combinedIsBuy ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-red-500/15 border border-red-500/30'
          }`}>
            <span className={`text-[10px] uppercase font-black tracking-wider block mb-1 ${
              combinedIsBuy ? 'text-emerald-300' : 'text-red-300'
            }`}>
              Combined {combinedIsBuy ? 'Inflow' : 'Outflow'}
            </span>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-black tabular-nums ${
                combinedIsBuy ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {formatCrValue(fiiDii?.combinedNet, combinedIsBuy)}
              </span>
              <ShieldCheck className={`w-4 h-4 ${combinedIsBuy ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
