import React from 'react';
import { Phone, Bookmark } from 'lucide-react';

const Header = ({ savedCount = 0, showSavedOnly = false, onToggleSaved }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
          
          {/* Logo & Brand Identity */}
          <a href="https://masterSchetan.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
            {/* Logo Mark */}
            <div className="relative p-1.5 sm:p-2 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
              <svg width="34" height="34" className="sm:w-10 sm:h-10 md:w-11 md:h-11" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="25" y="55" width="12" height="30" rx="2" fill="#B91C1C" />
                <rect x="42" y="45" width="12" height="40" rx="2" fill="#DC2626" />
                <rect x="59" y="35" width="12" height="50" rx="2" fill="#EF4444" />
                <rect x="76" y="25" width="12" height="60" rx="2" fill="#991B1B" />
                <path d="M15 65 L40 40 L55 52 L88 15" stroke="#16A34A" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M68 15 H88 V35" stroke="#16A34A" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Brand Titles */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline">
                <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-wider uppercase text-slate-800 truncate">CHETAN SHAH</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  master<span className="text-[#e02020] font-black">S</span>chetan
                </h1>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 flex-shrink-0">
                  News Slate
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wide hidden xs:block truncate">
                Penny to Pound <span className="text-red-500 font-bold">·</span> Financial Intelligence
              </p>
            </div>
          </a>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            {/* Bookmarks Button */}
            <button
              onClick={onToggleSaved}
              className={`flex items-center space-x-1 sm:space-x-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all border ${
                showSavedOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Saved Articles"
            >
              <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showSavedOnly ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">Bookmarks</span>
              {savedCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${showSavedOnly ? 'bg-white text-amber-600 font-black' : 'bg-slate-200 text-slate-800 font-bold'}`}>
                  {savedCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Call Button */}
            <a
              href="https://wa.me/919324273030?text=Hello%20Chetan%20Shah,%20I%20would%20like%20wealth%20advisory%20consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-1.5 sm:space-x-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-110 transition-transform" />
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-[9px] text-emerald-100 font-medium">Consult Chetan Shah</span>
                <span className="text-xs font-black tracking-wide">93242 73030</span>
              </div>
              <span className="md:hidden text-xs font-bold">Call</span>
            </a>
          </div>

        </div>
      </div>
      
      {/* Red & Green Accent Line */}
      <div className="h-[2.5px] bg-gradient-to-r from-red-500 via-emerald-500 to-red-500"></div>
    </header>
  );
};

export default Header;
