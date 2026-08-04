import React, { useState, useEffect } from 'react';
import { Pause, Play, Activity, RefreshCw } from 'lucide-react';

const SYMBOL_CONFIG = [
  { id: '^NSEI', symbol: 'NIFTY 50', format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
  { id: '^BSESN', symbol: 'SENSEX', format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
  { id: '^NSEBANK', symbol: 'BANK NIFTY', format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
  { id: 'GC=F', symbol: 'GOLD (24K)', format: (v) => '₹' + Math.round(v * 83.5).toLocaleString('en-IN') },
  { id: 'INR=X', symbol: 'USD / INR', format: (v) => '₹' + v.toFixed(2) },
  { id: 'BZ=F', symbol: 'CRUDE BRENT', format: (v) => '$' + v.toFixed(2) },
];

const FALLBACK_MARKET_DATA = [
  { symbol: 'NIFTY 50', val: '24,774.30', change: '+390.70', pct: '+1.60%', isUp: true },
  { symbol: 'SENSEX', val: '78,639.03', change: '+544.39', pct: '+0.70%', isUp: true },
  { symbol: 'BANK NIFTY', val: '58,247.95', change: '+983.10', pct: '+1.72%', isUp: true },
  { symbol: 'GOLD (24K)', val: '₹74,250', change: '+₹220', pct: '+0.30%', isUp: true },
  { symbol: 'USD / INR', val: '₹83.72', change: '0.00', pct: '0.00%', isUp: null },
  { symbol: 'CRUDE BRENT', val: '$82.99', change: '-$4.94', pct: '-5.62%', isUp: false },
];

export default function MarketTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [marketData, setMarketData] = useState(FALLBACK_MARKET_DATA);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Fetch live market data directly from browser (0 Firebase Quota)
  const fetchLiveQuotes = async () => {
    setIsFetching(true);
    let updatedData = [];

    try {
      // Try static CDN cache first
      const staticRes = await fetch(`/market-data.json?t=${Date.now()}`);
      if (staticRes.ok) {
        const staticJson = await staticRes.json();
        if (Array.isArray(staticJson) && staticJson.length > 0) {
          updatedData = staticJson;
        }
      }
    } catch (e) {
      console.warn('Static market cache fetch info:', e.message);
    }

    // Try client-side live fetch for real-time tick updates
    try {
      const livePromises = SYMBOL_CONFIG.map(async (cfg) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cfg.id)}?range=1d&interval=1m`;
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            const meta = json?.chart?.result?.[0]?.meta;
            if (meta) {
              const price = meta.regularMarketPrice;
              const prev = meta.chartPreviousClose || meta.previousClose || price;
              const diff = price - prev;
              const pct = prev > 0 ? (diff / prev) * 100 : 0;

              return {
                symbol: cfg.symbol,
                val: cfg.format(price),
                change: (diff >= 0 ? '+' : '') + diff.toFixed(2),
                pct: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
                isUp: diff > 0 ? true : diff < 0 ? false : null,
              };
            }
          }
        } catch (err) {
          // CORS or network fallback
          return null;
        }
        return null;
      });

      const liveResults = await Promise.all(livePromises);
      const validLive = liveResults.filter(Boolean);

      if (validLive.length > 0) {
        updatedData = validLive;
      }
    } catch (err) {
      console.warn('Live API tick info:', err.message);
    }

    if (updatedData.length > 0) {
      setMarketData(updatedData);
    }

    const now = new Date();
    setLastUpdated(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setIsFetching(false);
  };

  useEffect(() => {
    fetchLiveQuotes();

    // Auto-refresh every 60 seconds (1 minute interval) - 100% Client Side, 0 Firebase Quota!
    const intervalId = setInterval(() => {
      fetchLiveQuotes();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-bold py-1.5 px-3 relative overflow-hidden z-50 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Live Indicator Badge */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider shadow-2xs">
          <Activity className={`w-3 h-3 text-white ${isFetching ? 'animate-spin' : 'animate-pulse'}`} />
          <span>LIVE MARKETS</span>
          {lastUpdated && (
            <span className="hidden md:inline-inline text-[9px] text-red-100 font-mono font-normal ml-1">
              • {lastUpdated}
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

        {/* Manual Refresh & Pause/Play Toggle */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={fetchLiveQuotes}
            disabled={isFetching}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 disabled:opacity-50"
            title="Refresh Live Quotes Now"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin text-red-400' : ''}`} />
          </button>
          
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
