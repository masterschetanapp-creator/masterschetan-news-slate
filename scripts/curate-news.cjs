/**
 * masterschetan Financial News Slate — Multi-Source Curation Pipeline
 * 
 * Generates 4 detailed, actionable wealth takeaways for every news article
 * across official regulatory sources, insurance, mutual funds, equities, debt, and wealth strategy.
 * 
 * USAGE:
 *   node scripts/curate-news.cjs
 *   OR GitHub Actions (24h Cloud Automation)
 */

const { execSync } = require('child_process');

const PROJECT_ID = 'masterchetan-financial';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/articles`;

const RSS_FEEDS = [
  { source: 'SEBI Official', url: 'https://www.sebi.gov.in/sebirss.xml' },
  { source: 'ET Insurance', url: 'https://economictimes.indiatimes.com/industry/banking/finance/insure/rssfeeds/13358319.cms' },
  { source: 'ET Wealth', url: 'https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms' },
  { source: 'Livemint Money', url: 'https://www.livemint.com/rss/money' },
  { source: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets' },
  { source: 'Business Standard Finance', url: 'https://www.business-standard.com/rss/finance-103.rss' },
  { source: 'Business Standard Markets', url: 'https://www.business-standard.com/rss/markets-106.rss' },
  { source: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/MCtopnews.xml' },
];

function getAccessToken() {
  const envToken = process.env.FIREBASE_TOKEN;
  if (envToken) {
    try {
      const response = execSync(
        `curl -s -X POST "https://oauth2.googleapis.com/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=refresh_token&refresh_token=${envToken}&client_id=563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com&client_secret=j9iVZfS8kkCEFUPaAeJV0sAi"`,
        { encoding: 'utf8' }
      );
      const data = JSON.parse(response);
      if (data.access_token) return data.access_token;
    } catch (e) {
      console.warn('FIREBASE_TOKEN exchange warning:', e.message);
    }
  }

  try {
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    
    const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const refreshToken = config.tokens?.refresh_token;
      
      if (refreshToken) {
        const response = execSync(
          `curl -s -X POST "https://oauth2.googleapis.com/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=refresh_token&refresh_token=${refreshToken}&client_id=563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com&client_secret=j9iVZfS8kkCEFUPaAeJV0sAi"`,
          { encoding: 'utf8' }
        );
        return JSON.parse(response).access_token;
      }
    }
  } catch (e) {
    console.error('Local auth failed:', e.message);
  }

  throw new Error('No valid authentication token found.');
}

function stripHtmlAndUnescape(str) {
  if (!str) return '';
  return str
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
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const results = [];
    for (const itemXml of items) {
      const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

      let title = titleMatch ? stripHtmlAndUnescape(titleMatch[1]) : '';
      let link = linkMatch ? linkMatch[1].trim() : '';
      let desc = descMatch ? stripHtmlAndUnescape(descMatch[1]) : '';

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

async function getRecentArticles(token) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const structuredQuery = {
    structuredQuery: {
      from: [{ collectionId: 'articles' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'published_at' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { stringValue: sevenDaysAgo.toISOString() }
        }
      },
      limit: 200
    }
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
    return data
      .filter(d => d.document && d.document.fields && d.document.fields.title)
      .map(d => d.document.fields.title.stringValue.toLowerCase());
  } catch (e) {
    console.warn('Could not fetch recent articles for dedup:', e.message);
    return [];
  }
}

function categorizeByRule(title, desc) {
  const text = (title + ' ' + desc).toLowerCase();
  
  if (text.includes('pms') || text.includes('aif') || text.includes('portfolio management') || text.includes('alternative investment') || text.includes('sebi circular')) {
    return 'PMS & AIF';
  }
  if (text.includes('mutual fund') || text.includes('sip') || text.includes('nfo') || text.includes('amfi') || text.includes('nav')) {
    return 'Mutual Funds';
  }
  if (text.includes('fd') || text.includes('bond') || text.includes('repo rate') || text.includes('yield') || text.includes('g-sec') || text.includes('fixed deposit') || text.includes('rbi')) {
    return 'Bonds & FDs';
  }
  if (text.includes('term insurance') || text.includes('life insurance') || text.includes('lic') || text.includes('surrender value') || text.includes('irdai')) {
    return 'Life & Term Insurance';
  }
  if (text.includes('health insurance') || text.includes('motor insurance') || text.includes('third-party') || text.includes('wellness rider') || text.includes('bima')) {
    return 'Health & Motor Insurance';
  }
  if (text.includes('tax') || text.includes('capital gains') || text.includes('wealth') || text.includes('budget') || text.includes('nps') || text.includes('nri') || text.includes('demat')) {
    return 'Wealth Strategy';
  }
  return 'Equities & SIF';
}

function generate4FallbackBullets(title, desc, sourceName, category) {
  const cleanTitle = stripHtmlAndUnescape(title);
  const cleanDesc = stripHtmlAndUnescape(desc);

  const sentences = cleanDesc
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !s.toLowerCase().includes('click here') && !s.toLowerCase().includes('subscribe'));

  const p1 = `Core Announcement: ${cleanTitle}`;
  const p2 = sentences.length > 0 ? sentences[0] : `Key updates reported by ${sourceName} covering recent developments in the ${category} space.`;
  const p3 = sentences.length > 1 ? sentences[1] : `Portfolio Implications: Investors should evaluate sector weightages and risk exposure in response to this notice.`;
  const p4 = `Actionable Trigger: Monitor official regulatory disclosures and align portfolio duration/equity mix accordingly.`;

  return [p1, p2, p3, p4];
}

function balanceArticlesBySource(items, maxTotal = 14) {
  const grouped = {};
  for (const item of items) {
    grouped[item.source_name] = grouped[item.source_name] || [];
    grouped[item.source_name].push(item);
  }

  const sources = Object.keys(grouped);
  const result = [];
  let index = 0;

  while (result.length < maxTotal && sources.some(s => grouped[s].length > index)) {
    for (const source of sources) {
      if (grouped[source][index] && result.length < maxTotal) {
        result.push(grouped[source][index]);
      }
    }
    index++;
  }
  return result;
}

async function summarizeAndCategorize(rawArticles) {
  if (!rawArticles || rawArticles.length === 0) return [];

  if (!GEMINI_API_KEY) {
    return rawArticles.map(a => {
      const cat = categorizeByRule(a.title, a.description);
      return {
        title: stripHtmlAndUnescape(a.title),
        summary: generate4FallbackBullets(a.title, a.description, a.source_name, cat),
        source_name: a.source_name,
        source_url: a.link,
        category: cat,
        impact: a.title.toLowerCase().includes('sebi') || a.title.toLowerCase().includes('rbi') || a.title.toLowerCase().includes('surge') ? 'High' : 'Standard',
        tags: ['Regulatory', 'IndianFinance'],
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    });
  }

  const articlesInput = rawArticles.map((a, i) => ({
    id: i,
    title: stripHtmlAndUnescape(a.title),
    description: stripHtmlAndUnescape(a.description),
    source: a.source_name,
    link: a.link,
  }));

  const prompt = `You are an expert wealth analyst for Indian high-net-worth and retail investors. Analyze these ${articlesInput.length} news items:
${JSON.stringify(articlesInput, null, 2)}

For EACH news item, generate EXACTLY 4 comprehensive, insightful bullet points. Return a JSON array containing objects with:
[
  {
    "id": original_id_number,
    "category": "Pick EXACTLY ONE of: 'PMS & AIF', 'Equities & SIF', 'Mutual Funds', 'Bonds & FDs', 'Life & Term Insurance', 'Health & Motor Insurance', 'Wealth Strategy'",
    "summary": [
      "1. Core News & Figures: Precise summary of what happened, key financial figures, valuations or regulatory numbers.",
      "2. Sector / Industry Impact: Analysis of broader industry trends, compliance changes, or market movement.",
      "3. Portfolio Implications: Direct advice on how this affects investor portfolios, SIPs, yields, or tax liabilities.",
      "4. Key Catalyst to Watch: Upcoming dates, SEBI/RBI timelines, or monitoring triggers for smart investors."
    ],
    "impact": "High or Medium or Standard",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

CRITICAL RULES:
- "summary" MUST be an array of EXACTLY 4 detailed, insightful bullet points.
- NO raw HTML tags, NO placeholder text like "Direct coverage".
- Focus strictly on practical value for Indian investors.
- Only return the JSON array.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
  };

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map(p => {
          const original = rawArticles[p.id];
          if (!original) return null;
          
          let bullets = p.summary || [];
          if (!Array.isArray(bullets) || bullets.length < 3) {
            const cat = p.category || categorizeByRule(original.title, original.description);
            bullets = generate4FallbackBullets(original.title, original.description, original.source_name, cat);
          }

          return {
            title: stripHtmlAndUnescape(original.title),
            summary: bullets.map(stripHtmlAndUnescape),
            source_name: original.source_name,
            source_url: original.link,
            category: p.category || categorizeByRule(original.title, original.description),
            impact: p.impact || (original.title.toLowerCase().includes('sebi') || original.title.toLowerCase().includes('rbi') ? 'High' : 'Standard'),
            tags: p.tags || ['WealthAnalysis', 'IndianMarkets'],
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
        }).filter(Boolean);
      }
    }
  } catch (e) {
    console.warn('  ⚠️ Gemini API fallback to 4-bullet engine:', e.message);
  }

  return rawArticles.map(a => {
    const cat = categorizeByRule(a.title, a.description);
    return {
      title: stripHtmlAndUnescape(a.title),
      summary: generate4FallbackBullets(a.title, a.description, a.source_name, cat),
      source_name: a.source_name,
      source_url: a.link,
      category: cat,
      impact: a.title.toLowerCase().includes('sebi') || a.title.toLowerCase().includes('rbi') || a.title.toLowerCase().includes('surge') ? 'High' : 'Standard',
      tags: ['Regulatory', 'IndianFinance'],
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  });
}

function isDuplicate(title, existingTitles) {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  return existingTitles.some(existing => {
    const normalizedExisting = existing.replace(/[^a-z0-9\s]/g, '');
    const words1 = normalizedTitle.split(/\s+/);
    const words2 = normalizedExisting.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    return similarity > 0.7;
  });
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
    }
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
  console.log('  🗞️  masterschetan Financial News Slate — 4-Bullet Insight Curation');
  console.log('  📅  ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  console.log('═'.repeat(60) + '\n');

  console.log('🔑 Authenticating with Firebase...');
  const token = getAccessToken();
  console.log('✅ Authenticated.\n');

  console.log('📋 Checking existing articles...');
  const existingTitles = await getRecentArticles(token);
  console.log(`  Found ${existingTitles.length} existing articles in Firestore.\n`);

  console.log('📡 Fetching live RSS feeds (SEBI Official, ET Insurance, ET Wealth, Livemint, Business Standard, Moneycontrol)...');
  let rawArticles = [];
  for (const feed of RSS_FEEDS) {
    const items = await fetchRssFeed(feed);
    rawArticles = rawArticles.concat(items);
  }
  console.log(`  ✅ Fetched ${rawArticles.length} raw live news items from RSS feeds.\n`);

  const uniqueRaw = [];
  for (const item of rawArticles) {
    if (!isDuplicate(item.title, existingTitles) && !isDuplicate(item.title, uniqueRaw.map(u => u.title))) {
      uniqueRaw.push(item);
    }
  }

  const balancedCandidates = balanceArticlesBySource(uniqueRaw, 14);
  console.log(`🧠 Generating 4 detailed wealth insights for ${balancedCandidates.length} articles via Gemini AI...`);

  const curatedArticles = await summarizeAndCategorize(balancedCandidates);
  console.log(`  ✅ Prepared ${curatedArticles.length} news items with 4 detailed insights.\n`);

  let totalNew = 0;
  for (const article of curatedArticles) {
    try {
      await saveArticle(article, token);
      existingTitles.push(article.title.toLowerCase());
      console.log(`  ✅ Saved: [${article.source_name}] "${article.title.substring(0, 35)}..." (${article.summary.length} insights) -> ${article.source_url}`);
      totalNew++;
    } catch (e) {
      console.error(`  ❌ Save failed: ${e.message}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '═'.repeat(60));
  console.log(`  📊 4-Bullet Insight Curation complete in ${elapsed}s`);
  console.log(`  ✅ New live articles saved to Firestore: ${totalNew}`);
  console.log('═'.repeat(60) + '\n');
}

curate();
