const fs = require('fs');
const path = require('path');
const { getAccessToken, getDocument, upsertDocument } = require('./firebase-auth.cjs');

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatInrNum(num, signed = false) {
  const formatted = Math.abs(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (signed) {
    return (num >= 0 ? '+' : '-') + formatted;
  }
  return num < 0 ? '-' + formatted : formatted;
}

function parseNum(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : null;
  if (!str || str === '—') return null;
  const cleaned = String(str).replace(/[,₹\s+]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalize dates like "23-Nov-2026", "23 Nov 2026", or "2026-11-23" into canonical fields.
 */
function parseFlexibleDate(input) {
  if (!input) return null;
  const s = String(input).trim();

  let y, m, d;
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    y = Number(isoMatch[1]);
    m = Number(isoMatch[2]) - 1;
    d = Number(isoMatch[3]);
  } else {
    const dmyMatch = s.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{4})$/);
    if (!dmyMatch) return null;
    d = Number(dmyMatch[1]);
    m = MONTHS[dmyMatch[2].toLowerCase()];
    y = Number(dmyMatch[3]);
    if (m === undefined) return null;
  }

  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return {
    isoDate: `${y}-${mm}-${dd}`,
    monthKey: `${y}-${mm}`,
    rawDate: `${dd}-${MONTH_NAMES[m]}-${y}`,
    dateStr: `${dd} ${MONTH_NAMES[m]} ${y}`,
  };
}

// Google Finance real-time quote fetcher
async function fetchGoogleFinanceQuote(tickerId, name) {
  try {
    const url = `https://www.google.com/finance/quote/${tickerId}?hl=en`;
    const res = await fetch(url, { headers: BROWSER_HEADERS });
    const html = await res.text();

    const priceMatch = html.match(/class="N6SYTe"[^>]*><span[^>]*><span>([^<]+)<\/span>/) || html.match(/data-last-price="([^"]+)"/);
    if (!priceMatch) return null;
    const priceRaw = priceMatch[1];

    const changeMatch = html.match(/jsname="xnruHf"[^>]*><span>([^<]+)<\/span>/);
    const changeStr = changeMatch ? changeMatch[1] : '0.00';
    const changeNum = parseFloat(changeStr.replace(/,/g, ''));

    const isUp = changeNum > 0 ? true : changeNum < 0 ? false : null;
    const rawPriceNum = parseFloat(priceRaw.replace(/,/g, ''));
    const prevClose = rawPriceNum - changeNum;
    const pctVal = prevClose > 0 ? (Math.abs(changeNum / prevClose) * 100).toFixed(2) + '%' : '0.00%';
    const pct = (changeNum >= 0 ? '+' : '-') + pctVal;

    return {
      symbol: name,
      val: priceRaw,
      rawPrice: rawPriceNum,
      change: changeStr,
      pct,
      isUp,
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`Failed GF fetch for ${name}:`, e.message);
    return null;
  }
}

// Yahoo Finance quote fetcher (server-side)
async function fetchYahooQuote(symbolId, name, isBrent = false) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbolId)}?range=1d&interval=1m&includePrePost=true&t=${Date.now()}`;
    const res = await fetch(url, { headers: { 'User-Agent': BROWSER_HEADERS['User-Agent'] } });
    if (!res.ok) return null;

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (meta && typeof meta.regularMarketPrice === 'number') {
      const price = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose || meta.previousClose || price;
      const diff = price - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : 0;

      const formattedVal = isBrent
        ? '$' + price.toFixed(2)
        : price.toLocaleString('en-IN', { maximumFractionDigits: 2 });

      return {
        symbol: name,
        val: formattedVal,
        rawPrice: price,
        change: (diff >= 0 ? '+' : '') + diff.toFixed(2),
        pct: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
        isUp: diff > 0 ? true : diff < 0 ? false : null,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn(`Failed Yahoo fetch for ${name}:`, e.message);
  }
  return null;
}

/**
 * Fetch Indian 24K Gold (per 10 grams) from IBJA official rates, paired with COMEX % trend,
 * falling back to live USD/INR + troy-ounce conversion if IBJA is unavailable.
 */
async function fetchIndianGold24k(usdInrRate = 92.3) {
  const comex = await fetchYahooQuote('GC=F', 'GOLD (24K)', false);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const res = await fetch('https://ibjarates.com/', {
      signal: controller.signal,
      headers: BROWSER_HEADERS,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const pm10g = parseNum(html.match(/id="lblGold999_PM"[^>]*>([^<]+)</i)?.[1]);
      const am10g = parseNum(html.match(/id="lblGold999_AM"[^>]*>([^<]+)</i)?.[1]);
      const per1g = parseNum(html.match(/id="GoldRatesCompare999"[^>]*>([^<]+)</i)?.[1]);

      const gold10g = (pm10g && pm10g > 20000)
        ? pm10g
        : (am10g && am10g > 20000)
          ? am10g
          : (per1g && per1g > 2000 ? per1g * 10 : null);

      if (gold10g) {
        return {
          symbol: 'GOLD (24K / 10g)',
          val: '₹' + Math.round(gold10g).toLocaleString('en-IN'),
          rawPrice: Math.round(gold10g),
          change: comex?.change || '0.00',
          pct: comex?.pct || '0.00%',
          isUp: comex?.isUp ?? true,
          updatedAt: new Date().toISOString(),
        };
      }
    }
  } catch (e) {
    console.warn('IBJA Gold fetch warning, using live FX conversion fallback:', e.message);
  }

  if (comex) {
    // 1 troy oz = 31.1034768g; ~1.15 approximates landed import duty + GST + domestic premium
    const est10g = Math.round((comex.rawPrice / 31.1034768) * 10 * usdInrRate * 1.15);
    return {
      symbol: 'GOLD (24K / 10g)',
      val: '₹' + est10g.toLocaleString('en-IN'),
      rawPrice: est10g,
      change: comex.change,
      pct: comex.pct,
      isUp: comex.isUp,
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}

// Live Sectoral Performance Scraper
async function fetchAllSectorIndices(existingSectors = []) {
  const sectorsConfig = [
    { ticker: 'NIFTY_IT:INDEXNSE', name: 'NIFTY IT', stocks: ['TCS', 'Infosys', 'Wipro'] },
    { ticker: 'NIFTY_BANK:INDEXNSE', name: 'NIFTY BANK', stocks: ['HDFC', 'ICICI', 'SBI'] },
    { ticker: 'NIFTY_AUTO:INDEXNSE', name: 'NIFTY AUTO', stocks: ['Tata Motors', 'M&M', 'Maruti'] },
    { ticker: 'NIFTY_PHARMA:INDEXNSE', name: 'NIFTY PHARMA', stocks: ['Sun Pharma', 'Cipla', 'Dr Reddy'] },
    { ticker: 'NIFTY_FMCG:INDEXNSE', name: 'NIFTY FMCG', stocks: ['ITC', 'HUL', 'Nestle'] },
    { ticker: 'NIFTY_METAL:INDEXNSE', name: 'NIFTY METAL', stocks: ['Tata Steel', 'JSW', 'Hindalco'] },
    { ticker: 'NIFTY_REALTY:INDEXNSE', name: 'NIFTY REALTY', stocks: ['DLF', 'Godrej Prop', 'Macrotech'] },
    { ticker: 'NIFTY_ENERGY:INDEXNSE', name: 'NIFTY ENERGY', stocks: ['Reliance', 'NTPC', 'ONGC'] },
  ];

  const sectorResults = [];
  for (const s of sectorsConfig) {
    const q = await fetchGoogleFinanceQuote(s.ticker, s.name);
    if (q) {
      sectorResults.push({
        name: s.name,
        val: q.val,
        pct: q.pct,
        change: q.change,
        isUp: q.isUp,
        stocks: s.stocks,
      });
    }
  }

  if (sectorResults.length >= 4) {
    return sectorResults;
  }

  return Array.isArray(existingSectors) && existingSectors.length > 0 ? existingSectors : [];
}

function buildFiiDiiRecord(dateInput, { fiiBuy, fiiSell, fiiNet, diiBuy, diiSell, diiNet }) {
  const parsed = parseFlexibleDate(dateInput);
  if (!parsed) return null;

  const hasGross = Number.isFinite(fiiBuy) && Number.isFinite(fiiSell) && Number.isFinite(diiBuy) && Number.isFinite(diiSell);
  const fiiNetNum = Number.isFinite(fiiNet) ? fiiNet : (hasGross ? fiiBuy - fiiSell : null);
  const diiNetNum = Number.isFinite(diiNet) ? diiNet : (hasGross ? diiBuy - diiSell : null);
  if (!Number.isFinite(fiiNetNum) || !Number.isFinite(diiNetNum)) return null;

  return {
    isoDate: parsed.isoDate,
    monthKey: parsed.monthKey,
    dateStr: parsed.dateStr,
    rawDate: parsed.rawDate,
    hasGross,
    fiiBuy: hasGross ? formatInrNum(fiiBuy) : '—',
    fiiSell: hasGross ? formatInrNum(fiiSell) : '—',
    fiiNet: formatInrNum(fiiNetNum, true),
    fiiIsBuy: fiiNetNum >= 0,
    diiBuy: hasGross ? formatInrNum(diiBuy) : '—',
    diiSell: hasGross ? formatInrNum(diiSell) : '—',
    diiNet: formatInrNum(diiNetNum, true),
    diiIsBuy: diiNetNum >= 0,
  };
}

/**
 * Load previously persisted rolling FII/DII history from Firestore or local JSON.
 */
function hydrateStoredHistory(storedSnapshot) {
  const map = new Map();
  const candidateRows = [
    ...(storedSnapshot?.fiiDiiTable?.history || []),
    ...(storedSnapshot?.fiiDiiTable?.days || []),
  ];

  const cutoffMs = Date.now() - 60 * 24 * 60 * 60 * 1000;
  for (const row of candidateRows) {
    const parsed = parseFlexibleDate(row.isoDate || row.rawDate || row.dateStr);
    if (!parsed) continue;
    if (new Date(parsed.isoDate).getTime() < cutoffMs) continue;

    const fiiBuy = parseNum(row.fiiBuy);
    const fiiSell = parseNum(row.fiiSell);
    const fiiNet = parseNum(row.fiiNet);
    const diiBuy = parseNum(row.diiBuy);
    const diiSell = parseNum(row.diiSell);
    const diiNet = parseNum(row.diiNet);

    const rec = buildFiiDiiRecord(parsed.isoDate, { fiiBuy, fiiSell, fiiNet, diiBuy, diiSell, diiNet });
    if (rec && (!map.has(rec.isoDate) || (rec.hasGross && !map.get(rec.isoDate).hasGross))) {
      map.set(rec.isoDate, rec);
    }
  }
  return map;
}

/**
 * Fetch official provisional daily FII & DII data (Gross Buy, Gross Sell, Net) from NSE India.
 */
async function fetchNseDailyFiiDii() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const res = await fetch('https://www.nseindia.com/api/fiidiiTradeReact', {
      signal: controller.signal,
      headers: { ...BROWSER_HEADERS, Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];

    const byDate = {};
    for (const item of data) {
      const parsed = parseFlexibleDate(item.date);
      if (!parsed) continue;
      byDate[parsed.isoDate] = byDate[parsed.isoDate] || {};
      if (String(item.category).toUpperCase().includes('FII')) {
        byDate[parsed.isoDate].fiiBuy = parseNum(item.buyValue);
        byDate[parsed.isoDate].fiiSell = parseNum(item.sellValue);
        byDate[parsed.isoDate].fiiNet = parseNum(item.netValue);
      } else if (String(item.category).toUpperCase().includes('DII')) {
        byDate[parsed.isoDate].diiBuy = parseNum(item.buyValue);
        byDate[parsed.isoDate].diiSell = parseNum(item.sellValue);
        byDate[parsed.isoDate].diiNet = parseNum(item.netValue);
      }
    }

    const records = [];
    for (const [isoDate, vals] of Object.entries(byDate)) {
      const rec = buildFiiDiiRecord(isoDate, vals);
      if (rec) records.push(rec);
    }
    return records;
  } catch (e) {
    console.warn('NSE FII/DII fetch warning:', e.message);
    return [];
  }
}

/**
 * Key-order-independent Economic Times parser for daily FII/DII cash objects.
 */
async function fetchEtDailyFiiDii() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const res = await fetch('https://economictimes.indiatimes.com/markets/fii-dii-activity', {
      signal: controller.signal,
      headers: BROWSER_HEADERS,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const html = await res.text();
    const chunks = html.match(/\{[^{}]*(?:\\"|")dateStr(?:\\"|")[^{}]*\}/g) || [];
    const records = [];

    for (const raw of chunks) {
      try {
        const clean = raw.replace(/\\"/g, '"');
        const obj = JSON.parse(clean);
        const label = String(obj.datelable || obj.dateLabel || '').toLowerCase();
        if (!obj.dateStr || label.includes('days') || label.includes('week') || label.includes('month')) continue;

        const rec = buildFiiDiiRecord(obj.dateStr, {
          fiiBuy: obj.value2_1 !== undefined ? Math.abs(Number(obj.value2_1)) : null,
          fiiSell: obj.value3_1 !== undefined ? Math.abs(Number(obj.value3_1)) : null,
          fiiNet: obj.value1_1 !== undefined ? Number(obj.value1_1) : null,
          diiBuy: obj.value2_2 !== undefined ? Math.abs(Number(obj.value2_2)) : null,
          diiSell: obj.value3_2 !== undefined ? Math.abs(Number(obj.value3_2)) : null,
          diiNet: obj.value1_2 !== undefined ? Number(obj.value1_2) : null,
        });
        if (rec) records.push(rec);
      } catch (_) {
        // Ignore malformed partial object matches
      }
    }
    return records;
  } catch (e) {
    console.warn('ET FII/DII fetch warning:', e.message);
    return [];
  }
}

/**
 * Fetch 30-day rolling net FII/DII history from Moneycontrol __NEXT_DATA__ to fill historical days & MTD.
 */
async function fetchMoneycontrolFiiDiiHistory() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://www.moneycontrol.com/stocks/marketstats/fii_dii_activity/index.php', {
      signal: controller.signal,
      headers: BROWSER_HEADERS,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const html = await res.text();
    const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!nextMatch) return [];

    const json = JSON.parse(nextMatch[1]);
    const list = json?.props?.pageProps?.FiiDiiData?.fiiDiiData || [];
    const records = [];

    for (const item of list) {
      const fiiNet = parseNum(item.fiiCM);
      const diiNet = parseNum(item.diiCM);
      const rec = buildFiiDiiRecord(item.date, { fiiNet, diiNet });
      if (rec) records.push(rec);
    }
    return records;
  } catch (e) {
    console.warn('Moneycontrol FII/DII fetch warning:', e.message);
    return [];
  }
}

/**
 * Combine live NSE exchange data, ET data, Moneycontrol 30-day history, and persisted Firestore history
 * to build a dynamic 5-day table + accurate current-month MTD aggregate.
 */
async function buildFiiDiiTable(storedSnapshot) {
  const historyMap = hydrateStoredHistory(storedSnapshot);

  // Backfill up to 30 sessions from Moneycontrol (net flows) only for dates lacking full records
  const mcRecords = await fetchMoneycontrolFiiDiiHistory();
  for (const rec of mcRecords) {
    if (!historyMap.has(rec.isoDate)) {
      historyMap.set(rec.isoDate, rec);
    }
  }

  // Merge ET records (prefers records with Gross Buy/Sell)
  const etRecords = await fetchEtDailyFiiDii();
  for (const rec of etRecords) {
    const prev = historyMap.get(rec.isoDate);
    if (!prev || (rec.hasGross && !prev.hasGross)) {
      historyMap.set(rec.isoDate, rec);
    }
  }

  // Merge official NSE provisional record (authoritative source of truth for latest trading day)
  const nseRecords = await fetchNseDailyFiiDii();
  for (const rec of nseRecords) {
    historyMap.set(rec.isoDate, rec);
  }

  const sortedHistory = Array.from(historyMap.values())
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate))
    .slice(0, 45);

  const days = sortedHistory.slice(0, 5);

  // Dynamic Month-Till-Date aggregation for the latest trading month
  const latestMonthKey = days[0]?.monthKey;
  const monthRows = latestMonthKey
    ? sortedHistory.filter(r => r.monthKey === latestMonthKey)
    : [];

  let mtd = null;
  if (monthRows.length > 0) {
    const fiiNetSum = monthRows.reduce((acc, r) => acc + (parseNum(r.fiiNet) || 0), 0);
    const diiNetSum = monthRows.reduce((acc, r) => acc + (parseNum(r.diiNet) || 0), 0);
    const allHaveGross = monthRows.every(r => r.hasGross);

    const fiiBuySum = allHaveGross ? monthRows.reduce((acc, r) => acc + (parseNum(r.fiiBuy) || 0), 0) : null;
    const fiiSellSum = allHaveGross ? monthRows.reduce((acc, r) => acc + (parseNum(r.fiiSell) || 0), 0) : null;
    const diiBuySum = allHaveGross ? monthRows.reduce((acc, r) => acc + (parseNum(r.diiBuy) || 0), 0) : null;
    const diiSellSum = allHaveGross ? monthRows.reduce((acc, r) => acc + (parseNum(r.diiSell) || 0), 0) : null;

    const [yr, mo] = latestMonthKey.split('-');
    const monthLabel = `Month till date (${MONTH_NAMES[Number(mo) - 1]} ${yr})`;

    mtd = {
      label: monthLabel,
      fiiBuy: fiiBuySum !== null ? formatInrNum(fiiBuySum) : '—',
      fiiSell: fiiSellSum !== null ? formatInrNum(fiiSellSum) : '—',
      fiiNet: formatInrNum(fiiNetSum, true),
      fiiIsBuy: fiiNetSum >= 0,
      diiBuy: diiBuySum !== null ? formatInrNum(diiBuySum) : '—',
      diiSell: diiSellSum !== null ? formatInrNum(diiSellSum) : '—',
      diiNet: formatInrNum(diiNetSum, true),
      diiIsBuy: diiNetSum >= 0,
    };
  }

  return { days, mtd, history: sortedHistory };
}

/**
 * Generate upcoming macro & regulatory catalysts strictly relative to the current IST date.
 */
function buildUpcomingMacroCalendar(now = new Date()) {
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const todayMidnight = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
  const y = todayMidnight.getFullYear();

  const fmtDate = (dt) => `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
  const candidates = [];

  for (const year of [y, y + 1]) {
    // Bi-monthly RBI MPC meetings (typical early-month windows across Feb, Apr, Jun, Aug, Oct, Dec)
    for (const m of [1, 3, 5, 7, 9, 11]) {
      const start = new Date(year, m, 4);
      const end = new Date(year, m, 6);
      candidates.push({
        sortDate: start.getTime(),
        endDate: end.getTime(),
        title: 'RBI Monetary Policy Committee (MPC) Review',
        date: `${MONTH_NAMES[m]} 4 – ${MONTH_NAMES[m]} 6, ${year}`,
        category: 'Central Bank',
        impact: 'High Impact',
        desc: 'Repo rate decision, stance, and domestic liquidity commentary from the RBI Governor.',
        tagColor: 'bg-red-500/10 text-red-600 border-red-200',
      });
    }

    // Monthly India Retail CPI & IIP Release (~12th of every month)
    for (let m = 0; m < 12; m++) {
      const d = new Date(year, m, 12);
      candidates.push({
        sortDate: d.getTime(),
        endDate: d.getTime(),
        title: `India Retail CPI Inflation & IIP Data (${MONTH_NAMES[m]})`,
        date: fmtDate(d),
        category: 'Macro Economic',
        impact: 'High Impact',
        desc: 'Monthly consumer inflation and industrial output release guiding RBI rate expectations.',
        tagColor: 'bg-red-500/10 text-red-600 border-red-200',
      });
    }

    // Key US FOMC windows (Jan, Mar, May, Jun, Jul, Sep, Nov, Dec)
    for (const [m, day] of [[0, 29], [2, 18], [4, 6], [5, 17], [6, 29], [8, 16], [10, 4], [11, 9]]) {
      const d = new Date(year, m, day);
      candidates.push({
        sortDate: d.getTime(),
        endDate: d.getTime(),
        title: 'US Federal Open Market Committee (FOMC) Policy',
        date: `${MONTH_NAMES[m]} ${day - 1} – ${MONTH_NAMES[m]} ${day}, ${year}`,
        category: 'Global Central Bank',
        impact: 'High Impact',
        desc: 'US Fed interest rate guidance and dot-plot projections impacting global FII capital flows.',
        tagColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
      });
    }

    // Seasonal Indian Wealth, Tax & Fiscal Catalysts
    const milestones = [
      { m: 11, d: 15, title: 'Q3 Advance Tax Payment Deadline', cat: 'Tax & Wealth', impact: 'Medium Impact', desc: '75% cumulative advance tax deadline for businesses, professionals, and capital gains.', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
      { m: 0, d: 15, title: 'Q3 Corporate Earnings Season Kickoff', cat: 'Earnings', impact: 'Medium Impact', desc: 'Nifty 50 quarterly results across Banking, IT, Auto, and Consumer sectors.', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
      { m: 1, d: 1, title: 'Union Budget & Direct/Indirect Tax Proposals', cat: 'Fiscal Policy', impact: 'High Impact', desc: 'Annual Union Budget capex allocation, fiscal deficit target, and personal tax changes.', color: 'bg-red-500/10 text-red-600 border-red-200' },
      { m: 2, d: 15, title: 'Final Advance Tax & Section 80C/ELSS Window', cat: 'Tax & Wealth', impact: 'Medium Impact', desc: 'Year-end tax-saving allocation window and fourth advance tax installment deadline.', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
      { m: 6, d: 31, title: 'Annual Income Tax Return (ITR) Filing Deadline', cat: 'Tax & Wealth', impact: 'High Impact', desc: 'Statutory ITR filing due date for non-audit individual taxpayers and NRI investors.', color: 'bg-red-500/10 text-red-600 border-red-200' },
    ];
    for (const ms of milestones) {
      const d = new Date(year, ms.m, ms.d);
      candidates.push({
        sortDate: d.getTime(),
        endDate: d.getTime(),
        title: ms.title,
        date: fmtDate(d),
        category: ms.cat,
        impact: ms.impact,
        desc: ms.desc,
        tagColor: ms.color,
      });
    }
  }

  return candidates
    .filter(e => e.endDate >= todayMidnight.getTime())
    .sort((a, b) => a.sortDate - b.sortDate)
    .slice(0, 4)
    .map((evt, idx) => ({
      id: idx + 1,
      title: evt.title,
      date: evt.date,
      category: evt.category,
      impact: evt.impact,
      desc: evt.desc,
      tagColor: evt.tagColor,
    }));
}

async function fetchAllLiveMarketData() {
  console.log('Fetching 100% Real-Time Indices, Sectors, Gold 24K, 5-Day FII/DII & Calendar...');

  let token = null;
  let storedSnapshot = null;
  try {
    token = await getAccessToken();
    storedSnapshot = await getDocument('market_snapshot', 'latest', token);
  } catch (e) {
    console.warn('Firestore snapshot pre-read warning:', e.message);
  }

  if (!storedSnapshot) {
    const localJsonPath = path.join(__dirname, '../public/market-data.json');
    if (fs.existsSync(localJsonPath)) {
      try {
        storedSnapshot = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
      } catch (_) {}
    }
  }

  const tickerResults = [];

  const sensex = await fetchGoogleFinanceQuote('SENSEX:INDEXBOM', 'SENSEX');
  if (sensex) tickerResults.push(sensex);

  const nifty = await fetchGoogleFinanceQuote('NIFTY_50:INDEXNSE', 'NIFTY 50');
  if (nifty) tickerResults.push(nifty);

  const bankNifty = await fetchGoogleFinanceQuote('NIFTY_BANK:INDEXNSE', 'BANK NIFTY');
  if (bankNifty) tickerResults.push(bankNifty);

  const usdInr = await fetchGoogleFinanceQuote('USD-INR', 'USD / INR');
  const liveUsdInrRate = usdInr?.rawPrice || 92.3;

  const gold = await fetchIndianGold24k(liveUsdInrRate);
  if (gold) tickerResults.push(gold);

  if (usdInr) {
    usdInr.val = '₹' + liveUsdInrRate.toFixed(2);
    tickerResults.push(usdInr);
  }

  const brent = await fetchYahooQuote('BZ=F', 'CRUDE BRENT', true);
  if (brent) tickerResults.push(brent);

  const sectors = await fetchAllSectorIndices(storedSnapshot?.sectors);
  const fiiDiiTableData = await buildFiiDiiTable(storedSnapshot);
  const calendar = buildUpcomingMacroCalendar();
  const latestDay = fiiDiiTableData.days[0];
  const nowIso = new Date().toISOString();

  const payload = {
    updatedAt: nowIso,
    ticker: tickerResults,
    sectors,
    fiiDii: latestDay ? {
      sessionDate: latestDay.dateStr,
      fiiNet: latestDay.fiiNet,
      fiiIsBuy: latestDay.fiiIsBuy,
      diiNet: latestDay.diiNet,
      diiIsBuy: latestDay.diiIsBuy,
      updatedAt: nowIso,
    } : null,
    fiiDiiTable: fiiDiiTableData,
    calendar,
  };

  const outputPath = path.join(__dirname, '../public/market-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`SUCCESS! Saved ${tickerResults.length} tickers, ${sectors.length} sectors, ${fiiDiiTableData.days.length} FII/DII days & ${calendar.length} events to public/market-data.json`);

  try {
    if (!token) token = await getAccessToken();
    await upsertDocument('market_snapshot', 'latest', payload, token);
    console.log('SUCCESS! Synced live snapshot to Firestore document market_snapshot/latest');
  } catch (err) {
    console.error('ERROR syncing market_snapshot/latest to Firestore:', err.message);
    if (process.env.CI || process.env.FIREBASE_TOKEN) {
      process.exitCode = 1;
    }
  }
}

fetchAllLiveMarketData();
