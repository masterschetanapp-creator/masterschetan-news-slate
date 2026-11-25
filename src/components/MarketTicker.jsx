import React, { useState, useEffect, useCallback } from 'react';
import { Pause, Play, RefreshCw } from 'lucide-react';
import { getMarketSnapshot } from '../services/marketData';

export default function MarketTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [justRefreshed, setJustRefreshed] = useState(false);

  // Fetch live market data from Firestore snapshot (with CDN fallback)
  const fetchLiveQuotes = useCallback(async (forceRefresh = false) => {
    setIsFetching(true);
    let updatedData = [];
    let dataTimestamp = '';

    try {
      const snapshot = await getMarketSnapshot({ forceRefresh });
      const list = Array.isArray(snapshot) ? snapshot : snapshot?.ticker;
      if (Array.isArray(list) && list.length > 0) {
        updatedData = list;
        const tsSource = snapshot?.updatedAt || list[0]?.updatedAt;
        if (tsSource) {
          const dt = new Date(tsSource);
          dataTimestamp = dt.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      }
    } catch (err) {
      console.warn('Market ticker fetch info:', err.message);
    }

    if (updatedData.length > 0) {
      setMarketData(updatedData);
    }

    if (dataTimestamp) {
      setLastUpdated(dataTimestamp);
    }
    setIsFetching(false);

    if (forceRefresh) {
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2500);
    }
  }, []);

  useEffect(() => {
    fetchLiveQuotes(false);

    // Auto-refresh every 60 seconds (1 minute interval)
    const intervalId = setInterval(() => {
      fetchLiveQuotes(true);
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
          {marketData.length === 0 ? (
            <div className="text-[11px] text-slate-400 font-semibold animate-pulse">
              Syncing live Indian & global market indices...
            </div>
          ) : (
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
          )}
        </div>

        {/* Manual Refresh & Pause/Play Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Refresh Button */}
          <button
            onClick={() => fetchLiveQuotes(true)}
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
