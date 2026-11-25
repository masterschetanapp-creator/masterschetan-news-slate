import React, { useState, useEffect } from 'react';
import { Landmark, Clock } from 'lucide-react';
import { getMarketSnapshot } from '../services/marketData';

export default function FiiDiiTable() {
  const [tableData, setTableData] = useState([]);
  const [mtdData, setMtdData] = useState(null);
  const [lastUpdatedDate, setLastUpdatedDate] = useState('Syncing...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFiiDiiTable() {
      try {
        const snapshot = await getMarketSnapshot();
        if (snapshot?.fiiDiiTable && Array.isArray(snapshot.fiiDiiTable.days)) {
          setTableData(snapshot.fiiDiiTable.days);
          if (snapshot.fiiDiiTable.mtd) {
            setMtdData(snapshot.fiiDiiTable.mtd);
          }
          if (snapshot.fiiDiiTable.days[0]?.dateStr) {
            setLastUpdatedDate(snapshot.fiiDiiTable.days[0].dateStr);
          }
        }
      } catch (e) {
        console.warn('5-day FII/DII table fetch info:', e.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadFiiDiiTable();
  }, []);

  return (
    <div className="mb-8 sm:mb-10 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3.5 sm:p-7 shadow-sm max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl sm:rounded-2xl text-[#e02020] shrink-0">
            <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">
              FII & DII 5-Day Institutional Activity Chart
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">
              Daily Gross Buying, Gross Selling & Net Cash Flows in Indian Equities (₹ Crores)
            </p>
          </div>
        </div>

        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 self-start sm:self-auto flex items-center space-x-1">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>PROVISIONAL EXCHANGE DATA • {lastUpdatedDate}</span>
        </span>
      </div>

      {/* Table Container with Horizontal Scroll for Mobile */}
      <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-200 scrollbar-thin">
        <table className="w-full min-w-[580px] text-left border-collapse select-none text-xs sm:text-sm">
          <thead>
            {/* Top Level Grouping Row */}
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
              <th rowSpan={2} className="py-2.5 px-3 sm:px-4 border-r border-slate-200 text-slate-800 font-extrabold">
                Date
              </th>
              <th colSpan={3} className="py-2 px-3 text-center border-r border-slate-200 bg-purple-50/50 text-purple-900 font-black">
                FII Activity (Foreign)
              </th>
              <th colSpan={3} className="py-2 px-3 text-center bg-blue-50/50 text-blue-900 font-black">
                DII Activity (Domestic)
              </th>
            </tr>

            {/* Sub-Header Row */}
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[9px] sm:text-[11px] font-bold text-slate-500">
              {/* FII Sub-Headers */}
              <th className="py-1.5 px-2.5 text-right">Gross buy (₹ Cr)</th>
              <th className="py-1.5 px-2.5 text-right">Gross sell (₹ Cr)</th>
              <th className="py-1.5 px-2.5 text-right border-r border-slate-200 font-black text-slate-700">Net buy/sell (₹ Cr)</th>

              {/* DII Sub-Headers */}
              <th className="py-1.5 px-2.5 text-right">Gross buy (₹ Cr)</th>
              <th className="py-1.5 px-2.5 text-right">Gross sell (₹ Cr)</th>
              <th className="py-1.5 px-2.5 text-right font-black text-slate-700">Net buy/sell (₹ Cr)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
            {/* Month Till Date Summary Row */}
            {mtdData && (
              <tr className="bg-amber-50/40 font-extrabold border-b-2 border-slate-300">
                <td className="py-2.5 px-3 sm:px-4 text-slate-900 border-r border-slate-200 font-black whitespace-nowrap">
                  {mtdData.label}
                </td>
                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{mtdData.fiiBuy}</td>
                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{mtdData.fiiSell}</td>
                <td className={`py-2.5 px-2.5 text-right tabular-nums border-r border-slate-200 font-black ${
                  mtdData.fiiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {mtdData.fiiNet}
                </td>

                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{mtdData.diiBuy}</td>
                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{mtdData.diiSell}</td>
                <td className={`py-2.5 px-2.5 text-right tabular-nums font-black ${
                  mtdData.diiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {mtdData.diiNet}
                </td>
              </tr>
            )}

            {/* Daily Rows */}
            {isLoading && tableData.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td colSpan={7} className="py-3 px-4">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : (
              tableData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                  {row.dateStr}
                </td>

                {/* FII Columns */}
                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{row.fiiBuy}</td>
                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{row.fiiSell}</td>
                <td className={`py-2.5 px-2.5 text-right tabular-nums border-r border-slate-200 font-black ${
                  row.fiiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {row.fiiNet}
                </td>

                {/* DII Columns */}
                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{row.diiBuy}</td>
                <td className="py-2.5 px-2.5 text-right tabular-nums text-slate-700">{row.diiSell}</td>
                <td className={`py-2.5 px-2.5 text-right tabular-nums font-black ${
                  row.diiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {row.diiNet}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info Note */}
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-semibold gap-1 sm:gap-2">
        <p>Source: Official NSE & BSE Provisional Cash Market Reports</p>
        <p className="text-slate-400">Figures in ₹ Crores. Automatically updated daily post-market close.</p>
      </div>
    </div>
  );
}
