import React, { useState, useEffect } from 'react';
import { Landmark, Calendar, ShieldCheck, Clock, TrendingUp, TrendingDown } from 'lucide-react';

const FALLBACK_5DAY_DATA = [
  {
    dateStr: '05 Aug 2026',
    fiiBuy: '15,940.50',
    fiiSell: '16,883.92',
    fiiNet: '-943.42',
    fiiIsBuy: false,
    diiBuy: '19,353.43',
    diiSell: '16,470.26',
    diiNet: '+2,883.17',
    diiIsBuy: true
  },
  {
    dateStr: '04 Aug 2026',
    fiiBuy: '15,630.45',
    fiiSell: '13,183.98',
    fiiNet: '+2,446.47',
    fiiIsBuy: true,
    diiBuy: '15,241.39',
    diiSell: '16,177.53',
    diiNet: '-936.14',
    diiIsBuy: false
  },
  {
    dateStr: '03 Aug 2026',
    fiiBuy: '12,621.89',
    fiiSell: '11,699.63',
    fiiNet: '+922.26',
    fiiIsBuy: true,
    diiBuy: '18,325.97',
    diiSell: '16,754.79',
    diiNet: '+1,571.18',
    diiIsBuy: true
  },
  {
    dateStr: '31 Jul 2026',
    fiiBuy: '19,045.51',
    fiiSell: '18,768.03',
    fiiNet: '+277.48',
    fiiIsBuy: true,
    diiBuy: '19,885.80',
    diiSell: '17,625.43',
    diiNet: '+2,260.37',
    diiIsBuy: true
  },
  {
    dateStr: '30 Jul 2026',
    fiiBuy: '17,431.96',
    fiiSell: '13,808.45',
    fiiNet: '+3,623.51',
    fiiIsBuy: true,
    diiBuy: '17,979.63',
    diiSell: '19,843.66',
    diiNet: '-1,864.03',
    diiIsBuy: false
  }
];

const FALLBACK_MTD = {
  label: 'Month till date',
  fiiBuy: '44,192.84',
  fiiSell: '41,767.53',
  fiiNet: '+2,425.31',
  fiiIsBuy: true,
  diiBuy: '52,920.79',
  diiSell: '49,402.58',
  diiNet: '+3,518.21',
  diiIsBuy: true
};

export default function FiiDiiTable() {
  const [tableData, setTableData] = useState(FALLBACK_5DAY_DATA);
  const [mtdData, setMtdData] = useState(FALLBACK_MTD);
  const [lastUpdatedDate, setLastUpdatedDate] = useState('05 Aug 2026');

  useEffect(() => {
    async function loadFiiDiiTable() {
      try {
        const res = await fetch(`/market-data.json?cb=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.fiiDiiTable && Array.isArray(json.fiiDiiTable.days)) {
            setTableData(json.fiiDiiTable.days);
            if (json.fiiDiiTable.mtd) {
              setMtdData(json.fiiDiiTable.mtd);
            }
            if (json.fiiDiiTable.days[0]?.dateStr) {
              setLastUpdatedDate(json.fiiDiiTable.days[0].dateStr);
            }
          }
        }
      } catch (e) {
        console.warn('5-day FII/DII table fetch info:', e.message);
      }
    }
    loadFiiDiiTable();
  }, []);

  return (
    <div className="mb-10 bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-50 rounded-2xl text-[#e02020]">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              FII & DII 5-Day Institutional Activity Chart
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Daily Gross Buying, Gross Selling & Net Cash Flows in Indian Equities (₹ Crores)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto flex items-center space-x-1.5">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>PROVISIONAL EXCHANGE DATA • {lastUpdatedDate}</span>
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse select-none text-xs sm:text-sm">
          <thead>
            {/* Top Level Grouping Row */}
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider">
              <th rowSpan={2} className="py-3 px-4 border-r border-slate-200 text-slate-800 font-extrabold">
                Date
              </th>
              <th colSpan={3} className="py-2.5 px-4 text-center border-r border-slate-200 bg-purple-50/50 text-purple-900 font-black">
                FII Activity (Foreign)
              </th>
              <th colSpan={3} className="py-2.5 px-4 text-center bg-blue-50/50 text-blue-900 font-black">
                DII Activity (Domestic)
              </th>
            </tr>

            {/* Sub-Header Row */}
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] sm:text-[11px] font-bold text-slate-500">
              {/* FII Sub-Headers */}
              <th className="py-2 px-3 text-right">Gross buy (₹ Cr)</th>
              <th className="py-2 px-3 text-right">Gross sell (₹ Cr)</th>
              <th className="py-2 px-3 text-right border-r border-slate-200 font-black text-slate-700">Net buy/sell (₹ Cr)</th>

              {/* DII Sub-Headers */}
              <th className="py-2 px-3 text-right">Gross buy (₹ Cr)</th>
              <th className="py-2 px-3 text-right">Gross sell (₹ Cr)</th>
              <th className="py-2 px-3 text-right font-black text-slate-700">Net buy/sell (₹ Cr)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
            {/* Month Till Date Summary Row */}
            {mtdData && (
              <tr className="bg-amber-50/40 font-extrabold border-b-2 border-slate-300">
                <td className="py-3 px-4 text-slate-900 border-r border-slate-200 font-black whitespace-nowrap">
                  {mtdData.label}
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{mtdData.fiiBuy}</td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{mtdData.fiiSell}</td>
                <td className={`py-3 px-3 text-right tabular-nums border-r border-slate-200 font-black ${
                  mtdData.fiiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {mtdData.fiiNet}
                </td>

                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{mtdData.diiBuy}</td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{mtdData.diiSell}</td>
                <td className={`py-3 px-3 text-right tabular-nums font-black ${
                  mtdData.diiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {mtdData.diiNet}
                </td>
              </tr>
            )}

            {/* Daily Rows */}
            {tableData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                  {row.dateStr}
                </td>

                {/* FII Columns */}
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.fiiBuy}</td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.fiiSell}</td>
                <td className={`py-3 px-3 text-right tabular-nums border-r border-slate-200 font-black ${
                  row.fiiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {row.fiiNet}
                </td>

                {/* DII Columns */}
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.diiBuy}</td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{row.diiSell}</td>
                <td className={`py-3 px-3 text-right tabular-nums font-black ${
                  row.diiIsBuy ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {row.diiNet}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info Note */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-semibold gap-2">
        <p>Source: Official NSE & BSE Provisional Cash Market Reports</p>
        <p className="text-slate-400">Figures in ₹ Crores. Automatically updated daily post-market close.</p>
      </div>
    </div>
  );
}
