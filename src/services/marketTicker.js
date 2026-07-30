/**
 * Live Market Ticker Service
 * Fetches real-time market data from Yahoo Finance API for Indian indices
 * with realistic fallbacks if network/CORS blocks the request.
 */

const SYMBOLS = [
  { id: 'nifty', symbol: '^NSEI', label: 'NIFTY 50', fallbackValue: '24,850.15', fallbackChange: '+0.45%', up: true },
  { id: 'sensex', symbol: '^BSESN', label: 'SENSEX', fallbackValue: '81,420.30', fallbackChange: '+0.38%', up: true },
  { id: 'banknifty', symbol: '^NSEBANK', label: 'BANK NIFTY', fallbackValue: '51,280.60', fallbackChange: '+0.62%', up: true },
  { id: 'usdinr', symbol: 'INR=X', label: 'USD/INR', fallbackValue: '83.72', fallbackChange: '-0.08%', up: false },
  { id: 'gold', symbol: 'GC=F', label: 'GOLD (10g)', fallbackValue: '₹71,850', fallbackChange: '+0.25%', up: true },
  { id: 'gsec', symbol: 'GSEC', label: '10Y G-SEC', fallbackValue: '6.94%', fallbackChange: '-2bps', up: true },
];

export async function fetchLiveMarketTicker() {
  try {
    const symbolQuery = encodeURIComponent('^NSEI,^BSESN,^NSEBANK,INR=X');
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolQuery}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) throw new Error('Network response error');

    const data = await response.json();
    const result = data.quoteResponse?.result || [];

    if (result.length === 0) return SYMBOLS;

    return SYMBOLS.map(item => {
      const quote = result.find(q => q.symbol === item.symbol);
      if (!quote) return item;

      const price = quote.regularMarketPrice;
      const changePercent = quote.regularMarketChangePercent;

      if (price === undefined) return item;

      const formattedPrice = item.id === 'usdinr' 
        ? price.toFixed(2)
        : Math.round(price).toLocaleString('en-IN');

      const isUp = changePercent >= 0;
      const formattedChange = `${isUp ? '+' : ''}${changePercent.toFixed(2)}%`;

      return {
        ...item,
        value: formattedPrice,
        change: formattedChange,
        up: isUp
      };
    });
  } catch (error) {
    // If CORS or network blocks live fetch, return updated realistic Indian market values
    return SYMBOLS;
  }
}
