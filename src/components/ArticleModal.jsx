import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Bookmark, Share2, ExternalLink, Type, Clock, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { CATEGORY_COLORS } from './CategoryFilter';

const ArticleModal = ({ article, onClose, isSaved, onToggleSave }) => {
  const [fontSize, setFontSize] = useState('md');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!article) return null;

  const catColor = CATEGORY_COLORS[article.category] || '#2563eb';
  const shareableUrl = `${window.location.origin}/?article=${article.id}`;

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${article.title}. Key takeaways: ${article.summary.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `*${article.title}*\n\n${article.summary.map(s => `• ${s}`).join('\n')}\n\nRead full story on masterSchetan News Slate:\n${shareableUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window in White Theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header Accent Line */}
          <div className="h-1.5 w-full" style={{ backgroundColor: catColor }} />

          {/* Reader Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center space-x-2">
              <span 
                className="text-xs uppercase tracking-widest font-extrabold px-3 py-1 rounded-md"
                style={{ backgroundColor: catColor + '15', color: catColor }}
              >
                {article.category}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {article.impact} Impact
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Font Size Selector */}
              <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${fontSize === 'sm' ? 'bg-[#e02020] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${fontSize === 'md' ? 'bg-[#e02020] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${fontSize === 'lg' ? 'bg-[#e02020] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  A+
                </button>
              </div>

              {/* Text to Speech */}
              <button
                onClick={handleToggleSpeech}
                className={`p-2 rounded-xl border transition-all ${
                  isSpeaking 
                    ? 'bg-amber-500 text-white border-amber-600 animate-pulse' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSpeaking ? 'Stop Audio Reader' : 'Listen to Article (Audio Reader)'}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Bookmark */}
              <button
                onClick={() => onToggleSave(article.id)}
                className={`p-2 rounded-xl border transition-all ${
                  isSaved 
                    ? 'bg-amber-500 text-white border-amber-600' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {article.title}
            </h2>

            {/* Meta info */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-4 border-b border-slate-100 gap-2 font-medium">
              <div className="flex items-center space-x-3">
                <span className="font-extrabold text-[#e02020]">{article.source_name}</span>
                <span>·</span>
                <span className="flex items-center text-slate-500">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {article.published_at ? format(parseISO(article.published_at), 'MMMM d, yyyy') : ''}
                </span>
              </div>
              
              {isSpeaking && (
                <span className="flex items-center space-x-1.5 text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>Reading Aloud...</span>
                </span>
              )}
            </div>

            {/* Key Wealth Takeaways Box */}
            <div className="rounded-2xl p-6 bg-slate-50 border border-slate-200/80 relative">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-xs uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-[#e02020]" />
                <span>Why It Matters To Your Portfolio</span>
              </div>

              <div className={`space-y-3 font-medium text-slate-700 ${fontClasses[fontSize]}`}>
                {article.summary && article.summary.map((bullet, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: catColor }} />
                    <p>{bullet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-400 font-semibold">Tags:</span>
                {article.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-semibold border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Regulatory Disclaimer Pill inside Modal */}
            <div className="flex items-start space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-700">Educational Summary:</strong> Curated for informational awareness. masterSchetan is an AMFI-Registered Mutual Fund Distributor. Mutual fund investments are subject to market risks.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold transition-all shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Type className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>
            </div>

            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#e02020] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-md transition-all"
            >
              <span>Read Original on {article.source_name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ArticleModal;
