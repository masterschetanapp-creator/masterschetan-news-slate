import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="max-w-4xl bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 mb-6 text-left sm:text-center">
          <p className="text-xs text-slate-600 leading-relaxed font-medium mb-2">
            <span className="font-black text-slate-900 uppercase tracking-wide">AMFI Distributor & Regulatory Disclaimer:</span> masterSchetan (Chetan Shah Wealth Advisory) is an AMFI-Registered Mutual Fund Distributor. The content presented on masterSchetan Financial News Slate is curated strictly for informational, educational, and awareness purposes.
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            It does <span className="font-bold text-slate-700">not</span> constitute financial advice, investment advisory services, or SEBI Research Analyst stock recommendations/buy/sell/hold calls. Mutual Fund investments are subject to market risks; read all scheme related documents carefully before making investment decisions. Please consult Chetan Shah or your certified financial advisor.
          </p>
        </div>
        <div className="w-16 h-px bg-slate-200 mb-6"></div>
        <p className="text-xs font-bold text-slate-600">
          &copy; {new Date().getFullYear()} <a href="https://masterSchetan.com" target="_blank" rel="noopener noreferrer" className="text-[#e02020] hover:underline font-extrabold">masterSchetan.com</a> · Chetan Shah Wealth Advisory. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
