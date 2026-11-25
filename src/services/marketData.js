import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const CACHE_TTL_MS = 15000;
let cachedSnapshot = null;
let cachedAt = 0;
let inFlightPromise = null;

async function fetchSnapshotFromNetwork() {
  // Primary: Firestore live snapshot updated by GitHub Actions without requiring Hosting rebuilds
  try {
    const snap = await getDoc(doc(db, 'market_snapshot', 'latest'));
    if (snap.exists()) {
      const data = snap.data();
      if (data && (Array.isArray(data.ticker) || Array.isArray(data.sectors) || data.fiiDiiTable)) {
        return {
          ...data,
          updatedAt: data.updatedAt || data.fiiDii?.updatedAt || data.ticker?.[0]?.updatedAt || null,
          _source: 'firestore',
        };
      }
    }
  } catch (err) {
    console.warn('Firestore market_snapshot/latest read failed, falling back to CDN JSON:', err.message);
  }

  // Fallback: static CDN /market-data.json
  try {
    const res = await fetch(`/market-data.json?cb=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      return {
        ...json,
        updatedAt: json.updatedAt || json.fiiDii?.updatedAt || json.ticker?.[0]?.updatedAt || null,
        _source: 'cdn',
      };
    }
  } catch (err) {
    console.warn('Static market-data.json fetch failed:', err.message);
  }

  return null;
}

/**
 * Fetch the latest market snapshot (ticker, sectors, FII/DII) with short-lived in-flight deduplication
 * so simultaneously mounting widgets share a single Firestore read.
 */
export async function getMarketSnapshot({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cachedSnapshot && now - cachedAt < CACHE_TTL_MS) {
    return cachedSnapshot;
  }

  if (!forceRefresh && inFlightPromise) {
    return inFlightPromise;
  }

  const run = fetchSnapshotFromNetwork()
    .then((data) => {
      if (data) {
        cachedSnapshot = data;
        cachedAt = Date.now();
      }
      return data;
    })
    .finally(() => {
      if (inFlightPromise === run) {
        inFlightPromise = null;
      }
    });

  if (!forceRefresh) {
    inFlightPromise = run;
  }

  return run;
}
