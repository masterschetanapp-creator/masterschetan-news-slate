import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const FALLBACK_SECTORS = [
  { name: 'NIFTY IT', pct: '+0.85%', val: '38,940.10', isUp: true, stocks: ['TCS', 'Infosys', 'Wipro'] },
  { name: 'NIFTY BANK', pct: '-0.58%', val: '57,907.20', isUp: false, stocks: ['HDFC', 'ICICI', 'SBI'] },
  { name: 'NIFTY AUTO', pct: '+1.12%', val: '24,310.50', isUp: true, stocks: ['Tata Motors', 'M&M', 'Maruti'] },
  { name: 'NIFTY PHARMA', pct: '+0.45%', val: '21,850.80', isUp: true, stocks: ['Sun Pharma', 'Cipla'] },
  { name: 'NIFTY FMCG', pct: '+0.20%', val: '56,420.30', isUp: true, stocks: ['ITC', 'HUL', 'Nestle'] },
  { name: 'NIFTY METAL', pct: '-1.05%', val: '9,120.40', isUp: false, stocks: ['Tata Steel', 'JSW', 'Hindalco'] },
  { name: 'NIFTY REALTY', pct: '+1.40%', val: '1,085.60', isUp: true, stocks: ['DLF', 'Godrej Prop', 'Macrotech'] },
  { name: 'NIFTY ENERGY', pct: '-0.35%', val: '39,450.70', isUp: false, stocks: ['Reliance', 'NTPC', 'ONGC'] }
];

export default function SectorHeatmap() {
  const [sectors, setSectors] = useState(FALLBACK_SECTORS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');

  const loadLiveSectors = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/market-data.json?cb=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.sectors) && json.sectors.length > 0) {
          setSectors(json.sectors);
          setLastUpdatedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (e) {
      console.warn('Sector heatmap fetch info:', e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveSectors();
    // Auto-refresh client every 60 seconds
    const interval = setInterval(loadLiveSectors, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-10 bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-50 rounded-2xl text-[#e02020]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Sectoral Performance Heatmap
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time sector sentiment & Nifty index returns across Indian markets
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={loadLiveSectors}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 text-red-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'updating...' : 'Refresh Live'}</span>
          </button>

          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>UPDATED LIVE {lastUpdatedTime ? `• ${lastUpdatedTime}` : ''}</span>
          </span>
        </div>
      </div>

      {/* Grid Heatmap Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {sectors.map((sector, index) => {
          const isUp = sector.isUp !== false && !sector.pct?.includes('-');

          return (
            <motion.div
              key={sector.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group hover:shadow-md ${
                isUp
                  ? 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white border-emerald-200/90 hover:border-emerald-300'
                  : 'bg-gradient-to-br from-red-50/90 via-red-50/40 to-white border-red-200/90 hover:border-red-300'
              }`}
            >
              {/* Header inside tile */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
                  {sector.name}
                </span>
                <span
                  className={`inline-flex items-center space-x-0.5 text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                    isUp
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{sector.pct}</span>
                </span>
              </div>

              {/* Index Value */}
              <p className="text-lg font-black text-slate-900 tabular-nums tracking-tight mb-2">
                {sector.val}
              </p>

              {/* Major Stocks Pill */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold truncate max-w-full">
                  {Array.isArray(sector.stocks) ? sector.stocks.join(', ') : ''}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
