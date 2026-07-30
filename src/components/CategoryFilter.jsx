import React from 'react';
import { Briefcase, BarChart3, PiggyBank, Landmark, Shield, HeartPulse, Lightbulb } from 'lucide-react';

export const CATEGORY_COLORS = {
  'All': '#1e293b',
  'PMS & AIF': '#7c3aed',
  'Equities & SIF': '#2563eb',
  'Mutual Funds': '#16a34a',
  'Bonds & FDs': '#d97706',
  'Life & Term Insurance': '#db2777',
  'Health & Motor Insurance': '#0891b2',
  'Wealth Strategy': '#e02020',
};

const CATEGORY_ICONS = {
  'All': BarChart3,
  'PMS & AIF': Briefcase,
  'Equities & SIF': BarChart3,
  'Mutual Funds': PiggyBank,
  'Bonds & FDs': Landmark,
  'Life & Term Insurance': Shield,
  'Health & Motor Insurance': HeartPulse,
  'Wealth Strategy': Lightbulb,
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

const CategoryFilter = ({ activeCategory, onCategoryChange, categoryCounts = {} }) => {
  return (
    <div className="w-full pb-3 mb-4 sm:mb-6">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2.5">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          const color = CATEGORY_COLORS[category];
          const Icon = CATEGORY_ICONS[category];
          const count = categoryCounts[category];
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`group relative px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 flex items-center space-x-1.5 border shadow-sm ${
                isActive 
                  ? 'text-white shadow-md scale-[1.02]' 
                  : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
              style={{
                backgroundColor: isActive ? color : undefined,
                borderColor: isActive ? color : undefined,
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? '#ffffff' : color }} />
              <span className="whitespace-nowrap">{category}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
