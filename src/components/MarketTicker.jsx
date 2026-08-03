import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Pause, Play, Activity } from 'lucide-react';

const MARKET_DATA = [
  { symbol: 'NIFTY 50', val: '24,850.25', change: '+112.40', pct: '+0.45%', isUp: true },
  { symbol: 'SENSEX', val: '81,420.10', change: '+310.15', pct: '+0.38%', isUp: true },
  { symbol: 'BANK NIFTY', val: '52,140.80', change: '-65.20', pct: '-0.12%', isUp: false },
  { symbol: 'NIFTY MIDCAP', val: '58,310.45', change: '+245.80', pct: '+0.42%', isUp: true },
  { symbol: 'GOLD (24K)', val: '₹74,250', change: '+₹220', pct: '+0.30%', isUp: true },
  { symbol: 'USD / INR', val: '83.72', change: '0.00', pct: '0.00%', isUp: null },
  { symbol: 'CRUDE BRENT', val: '$79.45', change: '-$0.85', pct: '-1.06%', isUp: false },
  { symbol: '10Y G-SEC YIELD', val: '6.92%', change: '0.00', pct: '0.00%', isUp: null },
];

export default function MarketTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-bold py-1.5 px-3 relative overflow-hidden z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Label */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider shadow-2xs">
          <Activity className="w-3 h-3 text-white animate-pulse" />
          <span>MARKETS</span>
        </div>

        {/* Scrolling Ticker Strip */}
        <div 
          className="flex-1 overflow-hidden relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex items-center space-x-6 sm:space-x-8 whitespace-nowrap ${isPaused ? '' : 'ticker-scroll'}`}>
            {[...MARKET_DATA, ...MARKET_DATA].map((item, idx) => (
              <div key={idx} className="inline-flex items-center space-x-1.5">
                <span className="text-slate-400 font-extrabold">{item.symbol}</span>
                <span className="font-black text-white tabular-nums">{item.val}</span>
                <span className={`inline-flex items-center font-bold text-[10px] px-1 py-0.2 rounded tabular-nums ${
                  item.isUp === true
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : item.isUp === false
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.isUp === true && <span className="mr-0.5 font-black">▲</span>}
                  {item.isUp === false && <span className="mr-0.5 font-black">▼</span>}
                  <span>{item.pct}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Pause/Play Toggle */}
        <button
          onClick={() => setIsPaused(prev => !prev)}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 border border-slate-700"
          title={isPaused ? "Play Live Market Ticker" : "Pause Market Ticker"}
        >
          {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
        </button>

      </div>
    </div>
  );
}
