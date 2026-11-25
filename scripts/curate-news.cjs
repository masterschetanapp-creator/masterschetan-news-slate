/**
 * masterschetan Financial News Slate — Strict Category Matching & Gemini AI Pipeline
 *
 * Category Priority Fix:
 * EPF, EPFO, Pension & EPF vs Mutual Funds evaluation is placed FIRST to prevent
 * RSS descriptions containing "insurance cover under EDLI" from misclassifying EPF into Life Insurance!
 *
 * USAGE:
 *   node scripts/curate-news.cjs
 *   OR GitHub Actions (Scheduled Cron)
 */

const { PROJECT_ID, loadLocalEnv, getAccessToken } = require('./firebase-auth.cjs');

loadLocalEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
];
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/articles`;

const RSS_FEEDS = [
  { source: 'RBI Notifications', url: 'https://www.rbi.org.in/notifications_rss.xml' },
  { source: 'RBI Press Releases', url: 'https://www.rbi.org.in/pressreleases_rss.xml' },
  { source: 'ET Insurance', url: 'https://economictimes.indiatimes.com/industry/banking/finance/insure/rssfeeds/13358319.cms' },
  { source: 'ET Wealth', url: 'https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms' },
  { source: 'ET Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { source: 'ET Mutual Funds', url: 'https://economictimes.indiatimes.com/mf/rssfeeds/1977021501.cms' },
  { source: 'Livemint Money', url: 'https://www.livemint.com/rss/money' },
  { source: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets' },
  { source: 'Business Standard Finance', url: 'https://www.business-standard.com/rss/finance-103.rss' },
  { source: 'Business Standard Markets', url: 'https://www.business-standard.com/rss/markets-106.rss' },
  { source: 'Moneycontrol Top News', url: 'https://www.moneycontrol.com/rss/MCtopnews.xml' },
  { source: 'Moneycontrol Business', url: 'https://www.moneycontrol.com/rss/business.xml' },
];

function stripHtmlAndUnescape(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[/gi, '')
    .replace(/\]\]>/gi, '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchRssFeed(feed) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`  ⚠️ Feed HTTP ${res.status} (${feed.source})`);
      return [];
    }

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const results = [];
    for (const itemXml of items) {
      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

      const title = titleMatch ? stripHtmlAndUnescape(titleMatch[1]) : '';
      const link = linkMatch ? stripHtmlAndUnescape(linkMatch[1]) : '';
      const desc = descMatch ? stripHtmlAndUnescape(descMatch[1]) : '';

      if (title && link && link.startsWith('http')) {
        results.push({
          title,
          link,
          description: desc.slice(0, 450),
          source_name: feed.source,
        });
      }
    }
    return results;
  } catch (e) {
    console.warn(`  ⚠️ Failed to fetch RSS feed (${feed.source}):`, e.message);
    return [];
  }
}

async function getRecentArticleMap(token) {
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const structuredQuery = {
    structuredQuery: {
      from: [{ collectionId: 'articles' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'published_at' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { stringValue: tenDaysAgo.toISOString() },
        },
      },
      orderBy: [{ field: { fieldPath: 'published_at' }, direction: 'DESCENDING' }],
      limit: 600,
    },
  };

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structuredQuery),
      }
    );

    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter(d => d.document && d.document.fields)
      .map(d => ({
        title: d.document.fields.title?.stringValue?.toLowerCase() || '',
        url: d.document.fields.source_url?.stringValue || '',
      }));
  } catch (e) {
    console.warn('Could not fetch recent articles for dedup:', e.message);
    return [];
  }
}

/**
 * Remove expired articles older than retentionDays (up to 100 per run) via Firestore batch commit.
 */
async function pruneExpiredArticles(token, retentionDays = 45) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const structuredQuery = {
    structuredQuery: {
      select: { fields: [{ fieldPath: 'published_at' }] },
      from: [{ collectionId: 'articles' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'published_at' },
          op: 'LESS_THAN',
          value: { stringValue: cutoff.toISOString() },
        },
      },
      orderBy: [{ field: { fieldPath: 'published_at' }, direction: 'ASCENDING' }],
      limit: 100,
    },
  };

  try {
    const queryRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structuredQuery),
      }
    );

    const rows = await queryRes.json();
    const docNames = Array.isArray(rows)
      ? rows.filter(r => r.document?.name).map(r => r.document.name)
      : [];

    if (docNames.length === 0) return 0;

    const commitRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          writes: docNames.map(name => ({ delete: name })),
        }),
      }
    );

    if (!commitRes.ok) {
      console.warn(`  ⚠️ Firestore prune commit failed (${commitRes.status})`);
      return 0;
    }

    return docNames.length;
  } catch (e) {
    console.warn('  ⚠️ Old article pruning skipped:', e.message);
    return 0;
  }
}

function hasWord(text, word) {
  return new RegExp(`\\b${word}\\b`, 'i').test(text);
}

/**
 * Strict Category Classifier with Priority Hierarchy
 */
function classifyStrictCategory(title, desc, sourceName = '') {
  const text = (title + ' ' + desc).toLowerCase();

  // 1. EPF & Mutual Fund Overrides (Checked FIRST so EDLI insurance mentions never misclassify EPF articles!)
  if (text.includes('epf vs mutual fund') || text.includes('epf or mutual fund') || (hasWord(text, 'epf') && text.includes('mutual fund'))) {
    return 'Mutual Funds';
  }

  if (hasWord(text, 'epf') || hasWord(text, 'epfo') || text.includes('pension') || text.includes('retirement benefit')) {
    return 'Wealth Strategy';
  }

  // 2. Health & Motor Insurance (STRICT)
  if (text.includes('health insurance') || text.includes('motor insurance') || text.includes('car insurance') || text.includes('bike insurance') || text.includes('third party insurance') || text.includes('third-party premium') || text.includes('cashless hospital') || text.includes('wellness rider') || text.includes('mediclaim') || text.includes('health policy') || text.includes('irdai')) {
    return 'Health & Motor Insurance';
  }

  // 3. Life & Term Insurance (STRICT - NO loose "policy" string)
  if (text.includes('term insurance') || text.includes('life insurance') || text.includes('lic term') || text.includes('lic life') || text.includes('surrender value') || text.includes('sum assured') || text.includes('claim settlement ratio') || text.includes('death claim') || text.includes('gift city term') || text.includes('dollar term') || text.includes('home loan insurance') || text.includes('term plan')) {
    return 'Life & Term Insurance';
  }

  // 4. PMS & AIF (STRICT)
  if (hasWord(text, 'pms') || hasWord(text, 'aif') || text.includes('portfolio management service') || text.includes('alternative investment fund') || text.includes('sebi pms') || text.includes('sebi circular on pms') || text.includes('offshore fund') || text.includes('gift city aif')) {
    return 'PMS & AIF';
  }

  // 5. Mutual Funds (STRICT)
  if (text.includes('mutual fund') || hasWord(text, 'sip') || hasWord(text, 'nfo') || hasWord(text, 'amfi') || hasWord(text, 'nav') || text.includes('tracking error') || hasWord(text, 'elss') || text.includes('flexicap') || text.includes('smallcap fund') || text.includes('midcap fund') || text.includes('arbitrage fund')) {
    return 'Mutual Funds';
  }

  // 6. Bonds & FDs (STRICT)
  if (text.includes('fixed deposit') || text.includes('fd rate') || text.includes('nre fd') || hasWord(text, 'fcnr') || text.includes('bond yield') || text.includes('g-sec') || text.includes('treasury bill') || text.includes('repo rate') || text.includes('rbi mpc') || text.includes('us fed') || text.includes('federal reserve') || text.includes('corporate bond') || text.includes('sovereign gold bond') || hasWord(text, 'sgb') || text.includes('government securities') || text.includes('liquidity')) {
    return 'Bonds & FDs';
  }

  // 7. Wealth Strategy & Tax (STRICT)
  if (hasWord(text, 'tax') || text.includes('capital gains') || text.includes('itr filing') || text.includes('income tax') || hasWord(text, 'nps') || text.includes('national pension') || text.includes('digital rupee') || text.includes('nri tax') || text.includes('usd/inr') || text.includes('remittance') || text.includes('wealth management') || text.includes('8th pay commission') || hasWord(text, 'fema') || hasWord(text, 'lrs') || sourceName.startsWith('RBI')) {
    return 'Wealth Strategy';
  }

  // 8. Equities & SIF (STRICT)
  if (text.includes('nifty') || text.includes('sensex') || text.includes('share price') || text.includes('stock market') || hasWord(text, 'ipo') || hasWord(text, 'sif') || text.includes('specialised investment fund') || text.includes('demat') || hasWord(text, 'fii') || text.includes('wall street') || text.includes('nasdaq') || text.includes('us stocks') || text.includes('global market') || text.includes('crude oil') || text.includes('q1 result') || text.includes('q2 result') || text.includes('q3 result') || text.includes('q4 result') || text.includes('gainers') || text.includes('loosers')) {
    return 'Equities & SIF';
  }

  return null;
}

/**
 * Deterministic Impact Weightage Classifier
 */
function classifyImpactWeightage(title, desc, sourceName = '') {
  const text = (title + ' ' + desc).toLowerCase();

  if (
    sourceName.startsWith('RBI') ||
    text.includes('us fed') ||
    text.includes('federal reserve') ||
    text.includes('wall street') ||
    text.includes('global market') ||
    text.includes('crude oil') ||
    text.includes('sebi') ||
    text.includes('rbi') ||
    text.includes('irdai') ||
    text.includes('repo rate') ||
    text.includes('income tax') ||
    text.includes('capital gains') ||
    text.includes('itr filing') ||
    text.includes('reinsurance') ||
    text.includes('surge') ||
    text.includes('plunge') ||
    text.includes('ipo opens') ||
    text.includes('blockbuster debut')
  ) {
    return 'High';
  }

  if (
    text.includes('fd rate') ||
    text.includes('interest rate') ||
    text.includes('nre fd') ||
    text.includes('tracking error') ||
    text.includes('bond yield') ||
    text.includes('nfo') ||
    text.includes('q1 result') ||
    text.includes('q2 result') ||
    text.includes('q3 result') ||
    text.includes('q4 result') ||
    text.includes('stake') ||
    text.includes('premium') ||
    text.includes('g-sec')
  ) {
    return 'Medium';
  }

  return 'Standard';
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function isDuplicate(newItem, existingArticleMap) {
  const normTitle = normalizeTitle(newItem.title);
  const normLink = (newItem.link || '').toLowerCase();

  return existingArticleMap.some(existing => {
    if (existing.url && normLink && existing.url.toLowerCase() === normLink) return true;

    const existingNorm = normalizeTitle(existing.title);
    if (existingNorm === normTitle) return true;

    const words1 = normTitle.split(/\s+/).filter(w => w.length > 3);
    const words2 = existingNorm.split(/\s+/).filter(w => w.length > 3);
    if (words1.length === 0 || words2.length === 0) return false;

    const common = words1.filter(w => words2.includes(w));
    const similarity = common.length / Math.max(words1.length, words2.length);
    return similarity > 0.6;
  });
}

function generate4FallbackBullets(title, desc, sourceName, category) {
  const cleanTitle = stripHtmlAndUnescape(title);
  const cleanDesc = stripHtmlAndUnescape(desc);

  const sentences = cleanDesc
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && !s.toLowerCase().includes('click here') && !s.toLowerCase().includes('subscribe'));

  const p1 = `Key Development: ${cleanTitle}`;
  const p2 = sentences.length > 0 ? sentences[0] : `Core details reported by ${sourceName} covering recent updates in ${category}.`;
  const p3 = sentences.length > 1 ? sentences[1] : `Portfolio Implications: Investors and policyholders should evaluate position sizing and risk exposure for ${category}.`;
  const p4 = `Actionable Trigger: Track official regulatory circulars and consult your advisor to align your financial plan.`;

  return [p1, p2, p3, p4];
}

function filterBalancedQualityArticles(items, existingMap) {
  const result = [];
  const categoryCounts = {};
  const currentBatchMap = [...existingMap];

  for (const item of items) {
    const strictCategory = classifyStrictCategory(item.title, item.description, item.source_name);
    if (!strictCategory) continue;

    if (isDuplicate(item, currentBatchMap)) continue;

    categoryCounts[strictCategory] = categoryCounts[strictCategory] || 0;
    if (categoryCounts[strictCategory] < 6) {
      item.category = strictCategory;
      item.impact = classifyImpactWeightage(item.title, item.description, item.source_name);

      result.push(item);
      currentBatchMap.push({ title: item.title, url: item.link });
      categoryCounts[strictCategory]++;
    }
  }

  return { articles: result, counts: categoryCounts };
}

/**
 * Call Gemini generateContent with ordered model cascade and explicit HTTP error reporting.
 */
async function callGeminiWithFallback(prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  for (const model of GEMINI_MODELS) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return { model, parsed: JSON.parse(jsonMatch[0]) };
        }
        console.warn(`  ⚠️ Gemini (${model}) returned non-JSON text: ${text.slice(0, 140)}`);
        continue;
      }

      const errText = await response.text();
      console.warn(`  ⚠️ Gemini (${model}) HTTP ${response.status}: ${errText.slice(0, 180)}`);
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn(`  ⚠️ Gemini (${model}) network error: ${e.message}`);
    }
  }

  return null;
}

async function summarizeAndCategorizeInBatches(rawArticles) {
  if (!rawArticles || rawArticles.length === 0) {
    return { articles: [], aiCount: 0, fallbackCount: 0 };
  }

  const batchSize = 8;
  let allCurated = [];
  let aiCount = 0;
  let fallbackCount = 0;

  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found; using rule-based summaries.');
  }

  for (let b = 0; b < rawArticles.length; b += batchSize) {
    const batch = rawArticles.slice(b, b + batchSize);
    const batchNum = Math.floor(b / batchSize) + 1;

    if (GEMINI_API_KEY) {
      const articlesInput = batch.map((a, i) => ({
        id: i,
        title: stripHtmlAndUnescape(a.title),
        description: stripHtmlAndUnescape(a.description),
        source: a.source_name,
        link: a.link,
        strict_category: a.category,
        assigned_impact: a.impact,
      }));

      const prompt = `You are an expert Indian wealth advisor and financial analyst. Analyze these ${articlesInput.length} news items:
${JSON.stringify(articlesInput, null, 2)}

For EACH news item:
1. Retain the "strict_category" assigned.
2. Retain or refine "assigned_impact": 'High', 'Medium', or 'Standard'.
3. Generate EXACTLY 4 crisp, insightful bullet points tailored for Indian investors.

Return ONLY a JSON array of objects:
[
  {
    "id": 0,
    "category": "MUST match strict_category",
    "impact": "High",
    "summary": [
      "1. Core News & Figures: Precise summary of key figures, valuations, or regulatory updates. NO CDATA tags, NO HTML.",
      "2. Sector / Industry Impact: Analysis of broader industry trends, compliance changes, or market movement. NO CDATA tags, NO HTML.",
      "3. Portfolio Implications: Direct insight on how this affects investor portfolios, SIPs, yields, or tax liabilities. NO CDATA tags, NO HTML.",
      "4. Key Catalyst to Watch: Upcoming dates, SEBI/RBI timelines, or monitoring triggers for investors. NO CDATA tags, NO HTML."
    ],
    "tags": ["tag1", "tag2", "tag3"]
  }
]`;

      const aiResult = await callGeminiWithFallback(prompt);
      if (aiResult && Array.isArray(aiResult.parsed)) {
        const parsedById = new Map(aiResult.parsed.map(p => [p.id, p]));
        for (let i = 0; i < batch.length; i++) {
          const original = batch[i];
          const p = parsedById.get(i);
          let bullets = p?.summary;
          const usedAi = Array.isArray(bullets) && bullets.length >= 3;

          if (!usedAi) {
            bullets = generate4FallbackBullets(original.title, original.description, original.source_name, original.category);
            fallbackCount++;
          } else {
            aiCount++;
          }

          allCurated.push({
            title: stripHtmlAndUnescape(original.title),
            summary: bullets.map(stripHtmlAndUnescape),
            source_name: original.source_name,
            source_url: original.link,
            category: original.category,
            impact: p?.impact || original.impact || classifyImpactWeightage(original.title, original.description, original.source_name),
            tags: Array.isArray(p?.tags) && p.tags.length > 0 ? p.tags : ['WealthAnalysis', 'IndianMarkets'],
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });
        }
        console.log(`  🧠 Batch ${batchNum}: Summarized via ${aiResult.model}`);
        continue;
      }

      console.error(`  ❌ Batch ${batchNum}: All Gemini models failed; falling back to template.`);
    }

    const fallbackBatch = batch.map(a => {
      fallbackCount++;
      return {
        title: stripHtmlAndUnescape(a.title),
        summary: generate4FallbackBullets(a.title, a.description, a.source_name, a.category),
        source_name: a.source_name,
        source_url: a.link,
        category: a.category,
        impact: a.impact || classifyImpactWeightage(a.title, a.description, a.source_name),
        tags: ['Regulatory', 'IndianFinance'],
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    });
    allCurated = allCurated.concat(fallbackBatch);
  }

  return { articles: allCurated, aiCount, fallbackCount };
}

async function saveArticle(article, token) {
  const doc = {
    fields: {
      title: { stringValue: article.title },
      summary: { arrayValue: { values: article.summary.map(s => ({ stringValue: s })) } },
      source_name: { stringValue: article.source_name || 'Financial Desk' },
      source_url: { stringValue: article.source_url },
      category: { stringValue: article.category },
      tags: { arrayValue: { values: (article.tags || []).map(t => ({ stringValue: t })) } },
      impact: { stringValue: article.impact || 'Standard' },
      published_at: { stringValue: article.published_at },
      created_at: { stringValue: article.created_at },
    },
  };

  const response = await fetch(FIRESTORE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(doc),
  });

  if (!response.ok) {
    throw new Error(`Firestore write failed: ${response.status}`);
  }

  return await response.json();
}

async function curate() {
  const startTime = Date.now();
  console.log('\n' + '═'.repeat(60));
  console.log('  🗞️  masterschetan Financial News Slate — AI Curation Pipeline');
  console.log('  📅  ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  console.log('═'.repeat(60) + '\n');

  console.log('🔑 Authenticating with Firebase...');
  const token = await getAccessToken();
  console.log('✅ Authenticated.\n');

  console.log('🧹 Pruning expired articles (>45 days old)...');
  const prunedCount = await pruneExpiredArticles(token, 45);
  console.log(`  Removed ${prunedCount} expired articles.\n`);

  console.log('📋 Checking existing articles (last 10 days) for strict deduplication...');
  const existingMap = await getRecentArticleMap(token);
  console.log(`  Found ${existingMap.length} recent articles in Firestore.\n`);

  console.log('📡 Fetching live RSS feeds...');
  let rawArticles = [];
  for (const feed of RSS_FEEDS) {
    const items = await fetchRssFeed(feed);
    rawArticles = rawArticles.concat(items);
  }
  console.log(`  ✅ Fetched ${rawArticles.length} raw live news items from ${RSS_FEEDS.length} RSS feeds.\n`);

  const { articles: balancedArticles, counts } = filterBalancedQualityArticles(rawArticles, existingMap);

  console.log('📊 Category & Global Market Distribution:');
  for (const [cat, cnt] of Object.entries(counts)) {
    console.log(`  • ${cat}: ${cnt} quality unique articles`);
  }
  console.log(`\n🧠 Processing ${balancedArticles.length} unique articles via Gemini AI...`);

  const { articles: curatedArticles, aiCount, fallbackCount } = await summarizeAndCategorizeInBatches(balancedArticles);
  console.log(`  ✅ Prepared ${curatedArticles.length} items (AI-summarized: ${aiCount} | Fallback: ${fallbackCount}).\n`);

  let totalNew = 0;
  for (const article of curatedArticles) {
    try {
      await saveArticle(article, token);
      existingMap.push({ title: article.title, url: article.source_url });
      console.log(`  ✅ Saved: [${article.category}] [Impact: ${article.impact}] "${article.title.substring(0, 30)}..." -> ${article.source_url}`);
      totalNew++;
    } catch (e) {
      console.error(`  ❌ Save failed: ${e.message}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '═'.repeat(60));
  console.log(`  📊 Curation complete in ${elapsed}s`);
  console.log(`  ✅ Saved: ${totalNew} | AI: ${aiCount} | Fallback: ${fallbackCount} | Pruned: ${prunedCount}`);
  console.log('═'.repeat(60) + '\n');
}

curate();
