import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowUpRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CATEGORY_COLORS = {
  'All': '#2563eb',
  'PMS & AIF': '#7c3aed',
  'Equities & SIF': '#2563eb',
  'Mutual Funds': '#16a34a',
  'Bonds & FDs': '#d97706',
  'Life & Term Insurance': '#db2777',
  'Health & Motor Insurance': '#0891b2',
  'Wealth Strategy': '#e02020',
};

const Highlights = ({ articles, onArticleClick }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center space-x-3 mb-6">
        <div className="relative p-2 bg-red-100 rounded-xl">
          <Zap className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Today's High Impact Updates</span>
            <span className="text-xs bg-red-100 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200 uppercase">Top 3</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">Essential financial & market intelligence for investors</p>
        </div>
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-red-200 to-transparent ml-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {articles.slice(0, 3).map((article, index) => {
          const catColor = CATEGORY_COLORS[article.category] || '#2563eb';
          
          return (
            <motion.div
              key={article.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => onArticleClick && onArticleClick(article)}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              style={{ borderLeftWidth: '5px', borderLeftColor: catColor }}
            >
              {/* Card Number Watermark */}
              <div className="absolute top-2 right-3 text-6xl font-black text-slate-100 group-hover:text-slate-200 transition-colors select-none">
                0{index + 1}
              </div>

              <div className="p-6 relative z-10">
                {/* Badges */}
                <div className="flex items-center justify-between mb-3.5">
                  <span 
                    className="text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-md"
                    style={{ backgroundColor: catColor + '15', color: catColor }}
                  >
                    {article.category}
                  </span>
                  <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span>High Impact</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-extrabold text-slate-900 mb-3 group-hover:text-[#e02020] transition-colors leading-snug">
                  {article.title}
                </h3>

                {/* Summary Bullets */}
                <div className="space-y-2 mb-4">
                  {article.summary && article.summary.slice(0, 2).map((point, idx) => (
                    <div key={idx} className="flex items-start text-xs text-slate-600 leading-relaxed font-medium">
                      <span className="min-w-[6px] h-[6px] rounded-full mt-1.5 mr-2.5 flex-shrink-0" style={{ backgroundColor: catColor }} />
                      <span className="line-clamp-2">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between relative z-10">
                <div className="text-xs text-slate-500 font-semibold">
                  <span className="text-slate-800 font-extrabold">{article.source_name}</span>
                  <span className="mx-2">·</span>
                  <span>{article.published_at ? format(parseISO(article.published_at), 'MMM d') : ''}</span>
                </div>
                <span className="flex items-center text-xs font-bold text-red-600 group-hover:text-red-700 transition-colors">
                  <span>Read Story</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Highlights;
