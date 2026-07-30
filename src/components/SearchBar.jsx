import React from 'react';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange, selectedDate, onDateChange, onClear }) => {
  const hasFilters = searchTerm || selectedDate;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search news, topics, tags or sources..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none text-sm font-medium transition-colors"
          />
        </div>

        {/* Date Picker */}
        <div className="relative flex items-center">
          <CalendarIcon className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="date"
            value={selectedDate || ''}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2.5 sm:py-3 pl-10 pr-3 text-slate-700 text-sm font-medium focus:outline-none transition-colors w-full sm:w-auto min-w-[155px]"
          />
        </div>

        {/* Clear Button */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 px-4 py-2.5 sm:py-3 rounded-xl transition-colors border border-slate-200 hover:border-red-200"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
