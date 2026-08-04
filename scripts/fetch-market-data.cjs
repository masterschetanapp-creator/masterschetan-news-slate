const fs = require('fs');
const path = require('path');

// Google Finance 100% Real-Time Fetcher
async function fetchGoogleFinanceQuote(tickerId, name, isCommodityInr = false) {
  try {
    const url = `https://www.google.com/finance/quote/${tickerId}?hl=en`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await res.text();

    // 1. Price
    const priceMatch = html.match(/class="N6SYTe"[^>]*><span[^>]*><span>([^<]+)<\/span>/) || html.match(/data-last-price="([^"]+)"/);
    if (!priceMatch) return null;
    const priceRaw = priceMatch[1];

    // 2. Change Amount: <span jsname="xnruHf" class=""><span>-210.08</span></span>
    const changeMatch = html.match(/jsname="xnruHf"[^>]*><span>([^<]+)<\/span>/);
    const changeStr = changeMatch ? changeMatch[1] : '0.00';
    const changeNum = parseFloat(changeStr.replace(/,/g, ''));

    // 3. Percentage change
    const isUp = changeNum > 0 ? true : changeNum < 0 ? false : null;
    const pctVal = Math.abs(changeNum) > 0 ? Math.abs((changeNum / (parseFloat(priceRaw.replace(/,/g, '')) - changeNum)) * 100).toFixed(2) + '%' : '0.00%';
    const pct = (changeNum >= 0 ? '+' : '-') + pctVal;

    return {
      symbol: name,
      val: isCommodityInr ? '₹' + priceRaw : priceRaw,
      rawPrice: parseFloat(priceRaw.replace(/,/g, '')),
      change: changeStr,
      pct: pct,
      isUp: isUp,
      updatedAt: new Date().toISOString()
    };
  } catch (e) {
    console.warn(`Failed GF fetch for ${name}:`, e.message);
    return null;
  }
}

// Yahoo Finance fallback for Commodities
async function fetchYahooQuote(symbolId, name, isGoldInr = false, isBrent = false) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbolId)}?range=1d&interval=1m&includePrePost=true&t=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === 'number') {
        const price = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose || meta.previousClose || price;
        const diff = price - prev;
        const pct = prev > 0 ? (diff / prev) * 100 : 0;
        
        let formattedVal = price.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        if (isGoldInr) formattedVal = '₹' + Math.round(price * 83.5).toLocaleString('en-IN');
        if (isBrent) formattedVal = '$' + price.toFixed(2);

        return {
          symbol: name,
          val: formattedVal,
          rawPrice: price,
          change: (diff >= 0 ? '+' : '') + diff.toFixed(2),
          pct: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
          isUp: diff > 0 ? true : diff < 0 ? false : null,
          updatedAt: new Date().toISOString()
        };
      }
    }
  } catch (e) {
    console.warn(`Failed Yahoo fetch for ${name}:`, e.message);
  }
  return null;
}

async function fetchAllLiveMarketData() {
  console.log('Fetching 100% Real-Time Market Data from Google & Yahoo Finance...');
  const results = [];

  // 1. SENSEX from Google Finance
  const sensex = await fetchGoogleFinanceQuote('SENSEX:INDEXBOM', 'SENSEX');
  if (sensex) results.push(sensex);

  // 2. NIFTY 50 from Google Finance
  const nifty = await fetchGoogleFinanceQuote('NIFTY_50:INDEXNSE', 'NIFTY 50');
  if (nifty) results.push(nifty);

  // 3. BANK NIFTY from Google Finance
  const bankNifty = await fetchGoogleFinanceQuote('NIFTY_BANK:INDEXNSE', 'BANK NIFTY');
  if (bankNifty) results.push(bankNifty);

  // 4. GOLD (24K) from Yahoo
  const gold = await fetchYahooQuote('GC=F', 'GOLD (24K)', true, false);
  if (gold) results.push(gold);

  // 5. USD / INR from Google Finance
  const usdInr = await fetchGoogleFinanceQuote('USD-INR', 'USD / INR');
  if (usdInr) {
    usdInr.val = '₹' + parseFloat(usdInr.val).toFixed(2);
    results.push(usdInr);
  }

  // 6. CRUDE BRENT from Yahoo
  const brent = await fetchYahooQuote('BZ=F', 'CRUDE BRENT', false, true);
  if (brent) results.push(brent);

  if (results.length > 0) {
    const outputPath = path.join(__dirname, '../public/market-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`SUCCESS! Saved ${results.length} 100% real-time market ticker entries to public/market-data.json`);
    console.log(results.map(r => `${r.symbol}: ${r.val} (${r.pct})`).join(' | '));
  }
}

fetchAllLiveMarketData();
