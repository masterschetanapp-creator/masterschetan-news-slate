import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, TrendingUp, TrendingDown, HelpCircle, ShieldCheck } from 'lucide-react';

export default function InstitutionalFlows() {
  const [fiiFlow] = useState({ net: '+1,845.20', isBuy: true });
  const [diiFlow] = useState({ net: '+1,210.50', isBuy: true });
  const [showTooltip, setShowTooltip] = useState(false);

  const combinedTotal = '+3,055.70';

  return (
    <div className="mb-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
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
          </div>

          <p className="text-xs text-slate-400 font-medium max-w-xl leading-relaxed">
            Foreign Institutional Investors (FII) & Domestic Mutual Funds (DII) daily net cash activity in Indian equities.
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
              <span className="text-lg font-black text-emerald-400 tabular-nums">
                ₹{fiiFlow.net} Cr
              </span>
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                BUY
              </span>
            </div>
          </div>

          {/* DII Card */}
          <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">
              DII Net Cash (Domestic)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-emerald-400 tabular-nums">
                ₹{diiFlow.net} Cr
              </span>
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                BUY
              </span>
            </div>
          </div>

          {/* Combined Inflow Card */}
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md">
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block mb-1">
              Combined Inflow
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-emerald-300 tabular-nums">
                +₹{combinedTotal} Cr
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
