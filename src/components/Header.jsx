import React, { useState } from 'react';
import { Phone, Bookmark, ShieldCheck, Award, Sparkles, Mail, Check } from 'lucide-react';
import MarketTicker from './MarketTicker';

const FacebookIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307c-1.96-1.867-4.56-3.32-8.213-3.32-6.8 0-12.427 5.48-12.427 12.28s5.627 12.28 12.427 12.28c3.627 0 6.387-1.2 8.427-3.333 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053h-11.453z"/>
  </svg>
);

const Header = ({ savedCount = 0, showSavedOnly = false, onToggleSaved }) => {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = (e) => {
    e.preventDefault();
    const email = 'support@masterschetan.com';
    
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email);
      }
    } catch (err) {
      console.warn('Clipboard write warning:', err);
    }

    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 3000);

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=Financial%20Advisory%20Inquiry%20-%20masterSchetan`, '_blank');
  };

  return (
    <>
      {/* Top Live Market Indices Ticker */}
      <MarketTicker />

      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-sm">
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 sm:h-28 md:h-32 gap-3 sm:gap-4 py-2">
            
            {/* Left: Logo & Brand Identity */}
            <a href="https://masterSchetan.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2.5 sm:space-x-3.5 group shrink-0">
              {/* Real logo.jpeg Image */}
              <div className="relative p-1 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex-shrink-0 overflow-hidden flex items-center justify-center">
                <img 
                  src="/logo.jpeg" 
                  alt="masterSchetan Logo" 
                  className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 object-contain rounded-lg"
                />
              </div>

              {/* Brand Titles */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline">
                  <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-wider uppercase text-slate-800 truncate">CHETAN SHAH</span>
                </div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">
                  master<span className="text-[#e02020] font-black">S</span>chetan
                </h1>
                <div className="mt-1 flex items-center space-x-1.5">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 flex-shrink-0 shadow-2xs">
                    News Slate
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wide hidden xs:block truncate">
                    Penny to Pound
                  </span>
                </div>
              </div>
            </a>

            {/* Middle: BIG & PROMINENT Header Marketing Card */}
            <div className="hidden lg:flex flex-col items-center justify-center text-center px-5 py-2 mx-2 bg-gradient-to-r from-red-50 via-white to-emerald-50 rounded-2xl border border-slate-300/80 shadow-xs flex-1 max-w-2xl">
              {/* Top Pill */}
              <div className="inline-flex items-center space-x-2 bg-[#e02020] text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-xs">
                <Award className="w-3.5 h-3.5 text-white" />
                <span>30+ Years of Trust & Wealth Advisory</span>
              </div>

              {/* Serving Counter */}
              <p className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-1 leading-snug">
                Serving <span className="text-[#e02020] font-black underline decoration-red-300">1,300+ Families</span> & <span className="text-emerald-700 font-black underline decoration-emerald-300">5,000+ Clients</span> Across India & NRIs
              </p>

              {/* Services */}
              <p className="text-xs font-bold text-slate-700 tracking-wide mt-0.5">
                PMS <span className="text-red-500 font-bold">·</span> AIF <span className="text-red-500 font-bold">·</span> Mutual Funds <span className="text-red-500 font-bold">·</span> Equities <span className="text-red-500 font-bold">·</span> Bonds & FDs <span className="text-red-500 font-bold">·</span> Insurance
              </p>

              {/* Tagline */}
              <div className="inline-flex items-center space-x-2 text-xs font-black text-slate-800 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Goal-Based Financial Planning</span>
                <span className="text-slate-400 font-bold">|</span>
                <Sparkles className="w-3.5 h-3.5 text-[#e02020]" />
                <span className="text-[#e02020] font-black italic">Penny to Pound</span>
              </div>
            </div>

            {/* Right: Controls + Social Media Icons */}
            <div className="flex flex-col items-end justify-center space-y-1.5 shrink-0 relative">
              {/* Top Row: Bookmarks & WhatsApp Call Button */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Bookmarks Button */}
                <button
                  onClick={onToggleSaved}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                    showSavedOnly
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Saved Articles"
                >
                  <Bookmark className={`w-4 h-4 ${showSavedOnly ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">Bookmarks</span>
                  {savedCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${showSavedOnly ? 'bg-white text-amber-600 font-black' : 'bg-slate-200 text-slate-800 font-bold'}`}>
                      {savedCount}
                    </span>
                  )}
                </button>

                {/* Direct WhatsApp Call Button */}
                <a
                  href="https://wa.me/919324273030?text=Hello%20Chetan%20Shah,%20I%20would%20like%20wealth%20advisory%20consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-[10px] text-emerald-100 font-medium">Consult Chetan Shah</span>
                    <span className="text-xs font-black tracking-wide">93242 73030</span>
                  </div>
                  <span className="md:hidden text-xs font-bold">Call</span>
                </a>
              </div>

              {/* Bottom Row: Official Social Media Icons */}
              <div className="flex items-center space-x-1.5 pt-0.5 relative">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline mr-1">
                  Follow Us:
                </span>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/p/Chetan-Shah-100063942194665/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#1877f2] hover:text-white text-slate-600 transition-all border border-slate-200 shadow-2xs"
                  title="Facebook — Chetan Shah (masterSchetan)"
                >
                  <FacebookIcon />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/masterschetan/?originalSubdomain=in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0a66c2] hover:text-white text-slate-600 transition-all border border-slate-200 shadow-2xs"
                  title="LinkedIn — masterSchetan Official Company"
                >
                  <LinkedinIcon />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/masterschetan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#e4405f] hover:text-white text-slate-600 transition-all border border-slate-200 shadow-2xs"
                  title="Instagram — @masterschetan"
                >
                  <InstagramIcon />
                </a>

                {/* Google My Business & Maps Listing */}
                <a
                  href="https://www.google.com/search?rlz=1C1RXQR_enIN1104IN1104&sca_esv=361416631b2a74db&cs=1&output=search&q=CHETAN+SHAH+INVESTMENT+AND+FINANCIAL+CONSULTANT&ludocid=6242484208392529719&lsig=AB86z5WSNvI3MrQmzQdiJg2tARHf&kgs=8021bdcb76fdbc24&shndl=-1&shem=lsp,ssim&source=sh/x/kp/local/m1/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#ea4335] hover:text-white text-slate-600 transition-all border border-slate-200 shadow-2xs"
                  title="Google Business & Reviews — CHETAN SHAH INVESTMENT AND FINANCIAL CONSULTANT"
                >
                  <GoogleIcon />
                </a>

                {/* Email Support */}
                <button
                  onClick={handleEmailClick}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#e02020] hover:text-white text-slate-600 transition-all border border-slate-200 shadow-2xs cursor-pointer relative"
                  title="Click to copy support@masterschetan.com & compose email"
                >
                  {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5" />}
                </button>

                {/* Tooltip confirmation */}
                {emailCopied && (
                  <div className="absolute right-0 -bottom-8 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md z-50 whitespace-nowrap">
                    Copied support@masterschetan.com!
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
        
        {/* Mobile-Only Prominent Responsive Banner */}
        <div className="lg:hidden bg-gradient-to-r from-red-50 via-white to-emerald-50 border-t border-b border-slate-200 py-2.5 px-3 text-center">
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-[#e02020] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-2xs">
              <Award className="w-3 h-3 text-white" />
              <span>30+ Years of Trust & Wealth Advisory</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-slate-900">
              Serving <span className="text-[#e02020]">1,300+ Families</span> & <span className="text-emerald-700">5,000+ Clients</span> Across India & NRIs
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-700">
              PMS · AIF · Mutual Funds · Equities · Bonds & FDs · Insurance
            </p>
            <p className="text-[10px] sm:text-xs font-black text-slate-800">
              Goal-Based Financial Planning <span className="text-slate-400">|</span> <span className="text-[#e02020] font-black italic">Penny to Pound</span>
            </p>
          </div>
        </div>

        {/* Red & Green Accent Line */}
        <div className="h-[2.5px] bg-gradient-to-r from-red-500 via-emerald-500 to-red-500"></div>
      </header>
    </>
  );
};

export default Header;
