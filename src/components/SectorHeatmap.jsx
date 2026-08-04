import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const INITIAL_SECTORS = [
  { name: 'NIFTY IT', change: '+0.85%', isUp: true, val: '38,940.10', desc: 'TCS, Infosys, Wipro' },
  { name: 'NIFTY BANK', change: '-0.58%', isUp: false, val: '57,907.20', desc: 'HDFC, ICICI, SBI' },
  { name: 'NIFTY AUTO', change: '+1.12%', isUp: true, val: '24,310.50', desc: 'Tata Motors, M&M, Maruti' },
  { name: 'NIFTY PHARMA', change: '+0.45%', isUp: true, val: '21,850.80', desc: 'Sun Pharma, Cipla' },
  { name: 'NIFTY FMCG', change: '+0.20%', isUp: true, val: '56,420.30', desc: 'ITC, HUL, Nestle' },
  { name: 'NIFTY METAL', change: '-1.05%', isUp: false, val: '9,120.40', desc: 'Tata Steel, JSW, Hindalco' },
  { name: 'NIFTY REALTY', change: '+1.40%', isUp: true, val: '1,085.60', desc: 'DLF, Godrej Prop, Macrotech' },
  { name: 'NIFTY ENERGY', change: '-0.35%', isUp: false, val: '39,450.70', desc: 'Reliance, NTPC, ONGC' },
];

export default function SectorHeatmap() {
  const [sectors] = useState(INITIAL_SECTORS);

  return (
    <div className="mb-10 bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-red-50 rounded-xl text-[#e02020]">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Sectoral Performance Heatmap
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time sector sentiment across Indian markets
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
          Updated Live
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sectors.map((sector, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-2xl border transition-all ${
              sector.isUp
                ? 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/80'
                : 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-100/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 tracking-tight">{sector.name}</span>
              <span className={`inline-flex items-center text-xs font-black px-2 py-0.5 rounded-md tabular-nums ${
                sector.isUp
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-red-600 text-white shadow-2xs'
              }`}>
                {sector.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {sector.change}
              </span>
            </div>

            <p className="text-sm font-black text-slate-900 tabular-nums">{sector.val}</p>
            <p className="text-[10px] text-slate-500 font-semibold truncate mt-1">{sector.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
