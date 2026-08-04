import React, { useState } from 'react';
import { Calendar, Clock, BellRing, Sparkles, ChevronRight } from 'lucide-react';

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: 'RBI Monetary Policy Committee (MPC) Review',
    date: 'Aug 6 – Aug 8, 2026',
    category: 'Central Bank',
    impact: 'High Impact',
    desc: 'Repo rate decision and liquidity outlook announcement by RBI Governor.',
    tagColor: 'bg-red-500/10 text-red-600 border-red-200'
  },
  {
    id: 2,
    title: 'India Retail CPI Inflation & IIP Data Release',
    date: 'Aug 12, 2026',
    category: 'Macro Economic',
    impact: 'High Impact',
    desc: 'Consumer price index metrics shaping rate cut expectations.',
    tagColor: 'bg-red-500/10 text-red-600 border-red-200'
  },
  {
    id: 3,
    title: 'Q1 Corporate Earnings Season Peaks',
    date: 'Ongoing (Till Aug 15)',
    category: 'Earnings',
    impact: 'Medium Impact',
    desc: 'Key Nifty 50 earnings reports across Banking, IT, and Auto sectors.',
    tagColor: 'bg-amber-500/10 text-amber-600 border-amber-200'
  },
  {
    id: 4,
    title: 'US Federal Open Market Committee (FOMC) Meeting',
    date: 'Sept 17 – Sept 18, 2026',
    category: 'Global Central Bank',
    impact: 'High Impact',
    desc: 'US Fed interest rate decision influencing global equity capital flows.',
    tagColor: 'bg-blue-500/10 text-blue-600 border-blue-200'
  }
];

export default function EventCalendar() {
  const [events] = useState(UPCOMING_EVENTS);

  return (
    <div className="mb-10 bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-red-50 rounded-xl text-[#e02020]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Market Catalyst Calendar & RBI Watch
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Key macroeconomic events shaping market volatility
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Macro Calendar</span>
        </span>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${evt.tagColor}`}>
                  {evt.impact}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  {evt.date}
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-900 leading-snug">
                {evt.title}
              </h4>
              
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {evt.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">{evt.category}</span>
              <a
                href="https://wa.me/919324273030?text=Hi%20Chetan%2C%20I%20would%20like%20to%20know%20how%20the%20upcoming%20RBI%2FMacro%20events%20impact%20my%20portfolio."
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-red-600 hover:text-red-700 inline-flex items-center space-x-1"
              >
                <span>Consult Advisor</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
