import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, ArrowUpRight, Bookmark } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { CATEGORY_COLORS } from './CategoryFilter';

const IMPACT_STYLES = {
  'High': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-600',
    pulse: true,
  },
  'Medium': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-600',
    pulse: false,
  },
  'Standard': {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
    pulse: false,
  }
};

const NewsCard = ({ article, index, onClick, isSaved, onToggleSave }) => {
  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS['All'];
  const impact = IMPACT_STYLES[article.impact] || IMPACT_STYLES['Standard'];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      onClick={() => onClick && onClick(article)}
      className="group relative flex flex-col h-full rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      {/* Top color accent bar */}
      <div className="h-[4px] w-full" style={{ backgroundColor: catColor }} />

      <div className="p-5 sm:p-6 flex flex-col h-full relative">
        {/* Row 1: Category + Impact + Bookmark */}
        <div className="flex items-center justify-between mb-3.5 gap-2">
          <div className="flex items-center space-x-2">
            <span 
              className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md border border-slate-200/50"
              style={{ backgroundColor: catColor + '12', color: catColor }}
            >
              {article.category}
            </span>
            <span className={`flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border ${impact.bg} ${impact.text} ${impact.border}`}>
              <span className="relative flex h-1.5 w-1.5">
                {impact.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${impact.dot} opacity-75`}></span>}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${impact.dot}`}></span>
              </span>
              <span>{article.impact}</span>
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(article.id);
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              isSaved
                ? 'bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove bookmark' : 'Bookmark article'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600' : ''}`} />
          </button>
        </div>

        {/* Row 2: Title */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-3 group-hover:text-[#e02020] transition-colors duration-200 leading-snug line-clamp-2">
          {article.title}
        </h3>

        {/* Row 3: Summary bullets */}
        <div className="space-y-2 mb-5 flex-grow">
          {article.summary && article.summary.slice(0, 2).map((point, idx) => (
            <div key={idx} className="flex items-start text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed">
              <span className="min-w-[5px] h-[5px] rounded-full mt-[7px] mr-2.5 flex-shrink-0" style={{ backgroundColor: catColor }} />
              <span className="line-clamp-2">{point}</span>
            </div>
          ))}
        </div>

        {/* Row 4: Hashtags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200/60">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Row 5: Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-medium">
            <span className="font-extrabold text-slate-800">{article.source_name}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="flex items-center text-slate-500">
              <Clock className="w-3 h-3 mr-1" />
              {article.published_at ? format(parseISO(article.published_at), 'MMM d') : ''}
            </span>
          </div>
          
          <span className="flex items-center text-xs font-extrabold text-red-600 group-hover:text-red-700 transition-colors">
            <span>Read Summary</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default NewsCard;
