import React from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldAlert, Info, Layers } from 'lucide-react';

const IMPACT_LEVELS = [
  { id: 'All', label: 'All Impacts', icon: Layers, color: 'text-slate-600', activeBg: 'bg-slate-900 text-white', border: 'border-slate-300', symbol: null },
  { id: 'High', label: 'High Impact', icon: Flame, color: 'text-red-700', activeBg: 'bg-[#e02020] text-white', border: 'border-red-200', dot: 'bg-red-600', symbol: '▲' },
  { id: 'Medium', label: 'Medium Impact', icon: ShieldAlert, color: 'text-amber-700', activeBg: 'bg-amber-600 text-white', border: 'border-amber-200', dot: 'bg-amber-600', symbol: '⚡' },
  { id: 'Standard', label: 'Standard Impact', icon: Info, color: 'text-blue-700', activeBg: 'bg-blue-600 text-white', border: 'border-blue-200', dot: 'bg-slate-500', symbol: '●' },
];

export default function ImpactFilter({
  activeImpact,
  onImpactChange,
  setActiveImpact,
  articles = [],
  impactCounts = {}
}) {
  const handleImpactClick = (lvlId) => {
    if (onImpactChange) onImpactChange(lvlId);
    else if (setActiveImpact) setActiveImpact(lvlId);
  };

  // Calculate counts dynamically supporting impact / impactLevel / impact_level schema fields
  const counts = { ...impactCounts };
  if (articles && articles.length > 0) {
    counts['All'] = articles.length;
    IMPACT_LEVELS.forEach(lvl => {
      if (lvl.id !== 'All') {
        counts[lvl.id] = articles.filter(a => {
          const itemImpact = a.impactLevel || a.impact || a.impact_level || 'Standard';
          return itemImpact.toLowerCase() === lvl.id.toLowerCase();
        }).length;
      }
    });
  }

  return (
    <div className="mb-6 select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-red-600" />
          Filter By Impact Weightage:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {IMPACT_LEVELS.map((level) => {
          const isActive = activeImpact?.toLowerCase() === level.id.toLowerCase();
          const count = counts[level.id] !== undefined ? counts[level.id] : 0;
          const Icon = level.icon;

          return (
            <motion.button
              key={level.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleImpactClick(level.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                isActive
                  ? `${level.activeBg} border-transparent shadow-sm scale-[1.02]`
                  : `bg-white text-slate-700 hover:bg-slate-100 ${level.border}`
              }`}
            >
              {level.symbol && (
                <span className={`text-[10px] font-black ${isActive ? 'text-white' : level.color}`}>
                  {level.symbol}
                </span>
              )}
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : level.color}`} />
              <span>{level.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
