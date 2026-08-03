import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Pause, Play, Activity } from 'lucide-react';

const FALLBACK_MARKET_DATA = [
  { symbol: 'NIFTY 50', val: '24,774.30', change: '+390.70', pct: '+1.60%', isUp: true },
  { symbol: 'SENSEX', val: '78,639.03', change: '+544.39', pct: '+0.70%', isUp: true },
  { symbol: 'BANK NIFTY', val: '58,247.95', change: '+983.10', pct: '+1.72%', isUp: true },
  { symbol: 'GOLD (24K/10g)', val: '₹74,250', change: '+₹220', pct: '+0.30%', isUp: true },
  { symbol: 'USD / INR', val: '₹83.72', change: '0.00', pct: '0.00%', isUp: null },
  { symbol: 'CRUDE BRENT', val: '$82.99', change: '-$4.94', pct: '-5.62%', isUp: false },
];

export default function MarketTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [marketData, setMarketData] = useState(FALLBACK_MARKET_DATA);

  useEffect(() => {
    fetch('/market-data.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMarketData(data);
        }
      })
      .catch(err => {
        console.warn('Using fallback ticker data:', err);
      });
  }, []);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-bold py-1.5 px-3 relative overflow-hidden z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Label */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider shadow-2xs">
          <Activity className="w-3 h-3 text-white animate-pulse" />
          <span>LIVE MARKETS</span>
        </div>

        {/* Scrolling Ticker Strip */}
        <div 
          className="flex-1 overflow-hidden relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex items-center space-x-6 sm:space-x-8 whitespace-nowrap ${isPaused ? '' : 'ticker-scroll'}`}>
            {[...marketData, ...marketData].map((item, idx) => (
              <div key={idx} className="inline-flex items-center space-x-1.5">
                <span className="text-slate-400 font-extrabold">{item.symbol}</span>
                <span className="font-black text-white tabular-nums">{item.val}</span>
                <span className={`inline-flex items-center font-bold text-[10px] px-1.5 py-0.2 rounded tabular-nums ${
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
