import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { getMarketSnapshot } from '../services/marketData';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildClientFallbackCalendar() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const nextM = (m + 1) % 12;
  const nextY = nextM === 0 ? y + 1 : y;
  const mpcMonth = [1, 3, 5, 7, 9, 11].find(idx => idx > m || (idx === m && now.getDate() <= 6)) ?? 1;
  const mpcYear = mpcMonth < m ? y + 1 : y;

  return [
    {
      id: 1,
      title: 'RBI Monetary Policy Committee (MPC) Review',
      date: `${MONTH_NAMES[mpcMonth]} 4 – ${MONTH_NAMES[mpcMonth]} 6, ${mpcYear}`,
      category: 'Central Bank',
      impact: 'High Impact',
      desc: 'Repo rate decision, stance, and liquidity commentary from the RBI Governor.',
      tagColor: 'bg-red-500/10 text-red-600 border-red-200',
    },
    {
      id: 2,
      title: `India Retail CPI Inflation & IIP Release (${MONTH_NAMES[nextM]})`,
      date: `${MONTH_NAMES[nextM]} 12, ${nextY}`,
      category: 'Macro Economic',
      impact: 'High Impact',
      desc: 'Consumer price index and industrial output metrics shaping rate expectations.',
      tagColor: 'bg-red-500/10 text-red-600 border-red-200',
    },
    {
      id: 3,
      title: 'US Federal Open Market Committee (FOMC) Policy',
      date: `Upcoming Cycle (${y}/${y + 1})`,
      category: 'Global Central Bank',
      impact: 'High Impact',
      desc: 'US Fed interest rate guidance influencing global equity & FII capital flows.',
      tagColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      id: 4,
      title: 'Advance Tax & Quarterly Corporate Earnings Watch',
      date: 'Upcoming Quarterly Window',
      category: 'Earnings & Tax',
      impact: 'Medium Impact',
      desc: 'Key Nifty 50 sector earnings reports and statutory tax deadlines.',
      tagColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
  ];
}

export default function EventCalendar() {
  const [events, setEvents] = useState(() => buildClientFallbackCalendar());

  useEffect(() => {
    async function loadCalendar() {
      try {
        const snapshot = await getMarketSnapshot();
        if (Array.isArray(snapshot?.calendar) && snapshot.calendar.length > 0) {
          setEvents(snapshot.calendar);
        }
      } catch (e) {
        console.warn('Calendar snapshot load warning:', e.message);
      }
    }
    loadCalendar();
  }, []);

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
              Key upcoming macroeconomic events shaping market volatility
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
