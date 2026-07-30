import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <p className="text-xs text-slate-500 max-w-3xl mb-6 leading-relaxed font-medium">
          <span className="font-bold text-slate-800">Disclaimer:</span> The content presented on masterschetan Financial News Slate is for informational and educational purposes only and does not constitute financial or investment advice. Please consult Chetan Shah or a certified financial advisor before making investment decisions.
        </p>
        <div className="w-16 h-px bg-slate-200 mb-6"></div>
        <p className="text-xs font-bold text-slate-600">
          &copy; {new Date().getFullYear()} <a href="https://masterSchetan.com" target="_blank" rel="noopener noreferrer" className="text-[#e02020] hover:underline">masterSchetan.com</a> · Chetan Shah Wealth Advisory. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
