const fs = require('fs');
const path = require('path');

const SYMBOLS = [
  { id: '^NSEI', name: 'NIFTY 50', type: 'index', format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
  { id: '^BSESN', name: 'SENSEX', type: 'index', format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
  { id: '^NSEBANK', name: 'BANK NIFTY', type: 'index', format: (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
  { id: 'GC=F', name: 'GOLD (24K)', type: 'commodity', format: (v) => '₹' + Math.round(v * 83.5).toLocaleString('en-IN') },
  { id: 'INR=X', name: 'USD / INR', type: 'forex', format: (v) => '₹' + v.toFixed(2) },
  { id: 'BZ=F', name: 'CRUDE BRENT', type: 'commodity', format: (v) => '$' + v.toFixed(2) },
];

async function fetchLiveMarketData() {
  console.log('Fetching live market ticker data...');
  const results = [];

  for (const s of SYMBOLS) {
    let meta = null;
    
    // Try query1 then query2
    for (const host of ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']) {
      try {
        const res = await fetch(`https://${host}/v8/finance/chart/${encodeURIComponent(s.id)}?range=1d&interval=1m&includePrePost=true&t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          meta = json?.chart?.result?.[0]?.meta;
          if (meta && typeof meta.regularMarketPrice === 'number') break;
        }
      } catch (e) {
        // try next
      }
    }

    if (meta) {
      const price = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose || meta.previousClose || price;
      const diff = price - prev;
      const pct = prev > 0 ? (diff / prev) * 100 : 0;
      
      results.push({
        symbol: s.name,
        val: s.format(price),
        rawPrice: price,
        change: (diff >= 0 ? '+' : '') + diff.toFixed(2),
        pct: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
        isUp: diff > 0 ? true : diff < 0 ? false : null,
        updatedAt: new Date().toISOString()
      });
    }
  }

  if (results.length > 0) {
    const outputPath = path.join(__dirname, '../public/market-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} live market ticker entries to public/market-data.json`);
  }
}

fetchLiveMarketData();
