import React, { useState, useEffect, useCallback } from 'react';
import { Pause, Play, Activity, RefreshCw } from 'lucide-react';

const FALLBACK_MARKET_DATA = [
  { symbol: 'NIFTY 50', val: '24,581.30', change: '-193.00', pct: '-0.78%', isUp: false },
  { symbol: 'SENSEX', val: '78,749.19', change: '+110.16', pct: '+0.14%', isUp: true },
  { symbol: 'BANK NIFTY', val: '57,745.05', change: '-502.90', pct: '-0.86%', isUp: false },
  { symbol: 'GOLD (24K)', val: '₹3,44,012', change: '+29.40', pct: '+0.72%', isUp: true },
  { symbol: 'USD / INR', val: '₹95.28', change: '-0.04', pct: '-0.05%', isUp: false },
  { symbol: 'CRUDE BRENT', val: '$85.05', change: '+1.28', pct: '+1.53%', isUp: true },
];

export default function MarketTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [marketData, setMarketData] = useState(FALLBACK_MARKET_DATA);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  // Fetch live market data (0 Firestore Quota, 100% Free CDN Fetch)
  const fetchLiveQuotes = useCallback(async () => {
    setIsFetching(true);
    let updatedData = [];
    let dataTimestamp = '';

    try {
      // Fetch latest market data JSON with cache buster
      const res = await fetch(`/market-data.json?v=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          updatedData = json;
          if (json[0]?.updatedAt) {
            const dt = new Date(json[0].updatedAt);
            dataTimestamp = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          }
        }
      }
    } catch (err) {
      console.warn('Market ticker fetch info:', err.message);
    }

    if (updatedData.length > 0) {
      setMarketData(updatedData);
    }

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLastUpdated(dataTimestamp || nowStr);
    setIsFetching(false);

    // Visual pulse confirmation
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  }, []);

  useEffect(() => {
    fetchLiveQuotes();

    // Auto-refresh every 60 seconds (1 minute interval) - 0 Firebase Quota!
    const intervalId = setInterval(() => {
      fetchLiveQuotes();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchLiveQuotes]);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-bold py-1.5 px-3 relative overflow-hidden z-50 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Left Live Indicator Badge + Pulsing Dot + Timestamp */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-red-600 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider shadow-2xs">
          {/* Pulsing Status Dot */}
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          
          <span className="whitespace-nowrap">LIVE MARKETS</span>

          {/* Timestamp */}
          {lastUpdated && (
            <span className={`inline-block text-[9px] font-mono font-bold border-l border-red-400/50 pl-1.5 ml-1 transition-colors ${justRefreshed ? 'text-amber-200 font-extrabold' : 'text-red-100'}`}>
              {lastUpdated}
            </span>
          )}
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

        {/* Manual Refresh & Pause/Play Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Refresh Button */}
          <button
            onClick={fetchLiveQuotes}
            disabled={isFetching}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors border text-[10px] font-bold ${
              justRefreshed ? 'border-emerald-500 text-emerald-400 scale-105' : 'border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Click to Refresh Live Quotes Now"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin text-red-400' : justRefreshed ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{justRefreshed ? 'Updated!' : 'Refresh'}</span>
          </button>
          
          {/* Pause / Play Toggle */}
          <button
            onClick={() => setIsPaused(prev => !prev)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            title={isPaused ? "Play Live Market Ticker" : "Pause Market Ticker"}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>

      </div>
    </div>
  );
}
