import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox } from 'lucide-react';
import NewsCard from './NewsCard';

const NewsList = ({ articles, isLoading, onArticleClick, savedIds = [], onToggleSave }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-[4px] w-full bg-slate-200 animate-pulse"></div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse"></div>
                <div className="h-5 w-16 bg-slate-100 rounded-md animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 rounded-lg animate-pulse w-full"></div>
                <div className="h-5 bg-slate-100 rounded-lg animate-pulse w-3/4"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-5 w-20 bg-slate-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-white border border-dashed border-slate-300 py-16 px-6 text-center shadow-xs"
      >
        <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 border border-slate-200">
          <Inbox className="w-10 h-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">No articles found</h3>
        <p className="text-slate-600 max-w-sm mx-auto text-sm leading-relaxed font-medium">
          No news matches your current filters or bookmarks. Try clearing your search or selecting another category.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <AnimatePresence mode="popLayout">
        {articles.map((article, index) => (
          <NewsCard
            key={article.id}
            article={article}
            index={index}
            onClick={onArticleClick}
            isSaved={savedIds.includes(article.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NewsList;
