/**
 * Seed Firestore with sample Indian financial news articles.
 * 
 * This script uses the Firestore REST API with a Firebase CLI access token.
 * 
 * USAGE:
 *   1. Make sure you're logged into Firebase CLI: firebase login
 *   2. Run: node scripts/seed-firestore.js
 * 
 * The script automatically gets the access token from Firebase CLI.
 */

const { execSync } = require('child_process');

const PROJECT_ID = 'masterchetan-financial';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/articles`;

// Get access token from Firebase CLI
function getAccessToken() {
  try {
    // Use gcloud if available
    const token = execSync('gcloud auth print-access-token 2>nul', { encoding: 'utf8' }).trim();
    if (token) return token;
  } catch (e) {
    // fall through
  }
  
  try {
    // Alternative: use Firebase CLI stored credentials
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    
    // Firebase CLI stores refresh token in config
    const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const refreshToken = config.tokens?.refresh_token;
    
    if (!refreshToken) {
      throw new Error('No refresh token found. Run: firebase login');
    }
    
    // Exchange refresh token for access token
    const response = execSync(`curl -s -X POST "https://oauth2.googleapis.com/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=refresh_token&refresh_token=${refreshToken}&client_id=563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com&client_secret=j9iVZfS8kkCEFUPaAeJV0sAi"`, { encoding: 'utf8' });
    const tokenData = JSON.parse(response);
    return tokenData.access_token;
  } catch (e) {
    console.error('Could not get access token:', e.message);
    console.log('\nPlease run one of these commands first:');
    console.log('  gcloud auth application-default login');
    console.log('  OR');
    console.log('  firebase login');
    process.exit(1);
  }
}

// Seed articles data
const SEED_ARTICLES = [
  // === PMS & AIF (3) ===
  {
    title: "SEBI Proposes Stricter Disclosure Norms for PMS Providers",
    summary: [
      "New monthly disclosure requirements will increase transparency for PMS investors with granular portfolio-level attribution reports.",
      "Funds managing over ₹500 Crore must now report risk-adjusted returns benchmarked against category-specific indices."
    ],
    source_name: "Moneycontrol",
    source_url: "https://www.moneycontrol.com/news/business/markets/",
    category: "PMS & AIF",
    tags: ["PMS", "SEBI", "Regulation", "Disclosure"],
    impact: "High",
    published_at: "2026-07-29T08:30:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "Top 5 PMS Strategies That Outperformed Nifty 50 in H1 2026",
    summary: [
      "Multi-cap and value-oriented PMS strategies delivered 18-24% returns vs Nifty 50's 14.2% in the first half of 2026.",
      "Concentration-based strategies with fewer than 15 stocks showed the highest alpha generation, per PMS Bazaar data."
    ],
    source_name: "PMS Bazaar",
    source_url: "https://www.pmsbazaar.com/",
    category: "PMS & AIF",
    tags: ["PMS", "Performance", "Returns", "Multi-cap"],
    impact: "Medium",
    published_at: "2026-07-28T10:15:00+05:30",
    created_at: "2026-07-28T07:00:00+05:30"
  },
  {
    title: "Category III AIF Inflows Cross ₹2.5 Lakh Crore Mark in Q2",
    summary: [
      "Long-short equity and derivatives-based Category III AIFs attracted record institutional capital in Q2, crossing ₹2.5 lakh crore in cumulative AUM.",
      "SEBI's new performance benchmarking framework is improving investor confidence in the alternative investment space."
    ],
    source_name: "Business Standard",
    source_url: "https://www.business-standard.com/",
    category: "PMS & AIF",
    tags: ["AIF", "Category III", "Inflows", "SEBI"],
    impact: "Standard",
    published_at: "2026-07-27T14:00:00+05:30",
    created_at: "2026-07-27T07:00:00+05:30"
  },

  // === Equities & SIF (3) ===
  {
    title: "SEBI Introduces Specialized Investment Fund Category with ₹10L Minimum",
    summary: [
      "The new SIF category bridges the gap between mutual funds and PMS, allowing curated strategies with a minimum ₹10 lakh investment — bringing institutional-grade portfolios to HNIs.",
      "SIFs can invest in up to 15 stocks with concentration limits, offering a regulated alternative to unregistered advisory services."
    ],
    source_name: "Economic Times",
    source_url: "https://economictimes.indiatimes.com/",
    category: "Equities & SIF",
    tags: ["SIF", "SEBI", "Regulation", "HNI"],
    impact: "High",
    published_at: "2026-07-29T09:00:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "Nifty 50 Hits All-Time High as FII Inflows Resume After 3-Month Gap",
    summary: [
      "Foreign institutional investors pumped ₹18,400 crore into Indian equities in July, marking the first month of net positive FII flows since April.",
      "Banking, IT, and capital goods sectors led the rally; market breadth remains strong with 70% of Nifty 500 stocks above their 200-DMA."
    ],
    source_name: "Livemint",
    source_url: "https://www.livemint.com/",
    category: "Equities & SIF",
    tags: ["Nifty", "FII", "Markets", "All-time high"],
    impact: "High",
    published_at: "2026-07-29T11:30:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "Demat Account Openings Surge 22% YoY, Cross 18 Crore Mark",
    summary: [
      "India's demat account count crossed 18 crore in July 2026, driven by mobile-first brokers and fintech platforms targeting Tier-2 and Tier-3 cities.",
      "Average age of new demat holders has dropped to 28 years, signaling deeper retail participation in equity markets."
    ],
    source_name: "NDTV Profit",
    source_url: "https://www.ndtvprofit.com/",
    category: "Equities & SIF",
    tags: ["Demat", "Retail investors", "CDSL", "NSDL"],
    impact: "Medium",
    published_at: "2026-07-28T15:00:00+05:30",
    created_at: "2026-07-28T07:00:00+05:30"
  },

  // === Mutual Funds (3) ===
  {
    title: "SIP Inflows Hit Record ₹25,000 Crore in June 2026",
    summary: [
      "Monthly SIP contributions crossed the ₹25,000 crore milestone for the first time, with 9.8 crore active SIP accounts — demonstrating India's maturing savings-to-investment culture.",
      "Small-cap and mid-cap funds received 40% of new SIP registrations despite SEBI's valuation warnings earlier this year."
    ],
    source_name: "Value Research",
    source_url: "https://www.valueresearchonline.com/",
    category: "Mutual Funds",
    tags: ["SIP", "Mutual Funds", "AMFI", "Record"],
    impact: "High",
    published_at: "2026-07-29T07:45:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "SEBI Mulls New Rules for Passive Fund Expense Ratios",
    summary: [
      "Proposed regulations would cap index fund and ETF expense ratios at 0.20% for large-cap and 0.30% for thematic indices, making passive investing even cheaper.",
      "The move aims to level the playing field for retail investors and encourage competition among AMCs in the rapidly growing passive segment."
    ],
    source_name: "Moneycontrol",
    source_url: "https://www.moneycontrol.com/",
    category: "Mutual Funds",
    tags: ["ETF", "Index Fund", "SEBI", "Expense Ratio"],
    impact: "Medium",
    published_at: "2026-07-28T12:30:00+05:30",
    created_at: "2026-07-28T07:00:00+05:30"
  },
  {
    title: "Three New NFOs Launch in Small-Cap Space Despite Valuation Concerns",
    summary: [
      "HDFC, Kotak, and Nippon India launched small-cap focused NFOs this week, collectively targeting ₹5,000 crore in fresh mobilization.",
      "Analysts caution that small-cap P/E ratios remain elevated at 28x vs the 10-year average of 22x, suggesting selective stock-picking is critical."
    ],
    source_name: "Economic Times",
    source_url: "https://economictimes.indiatimes.com/",
    category: "Mutual Funds",
    tags: ["NFO", "Small-cap", "HDFC", "Kotak"],
    impact: "Standard",
    published_at: "2026-07-27T09:00:00+05:30",
    created_at: "2026-07-27T07:00:00+05:30"
  },

  // === Bonds & FDs (3) ===
  {
    title: "RBI Holds Repo Rate at 6.0%, Signals Possible Cut in October",
    summary: [
      "The RBI MPC unanimously voted to hold the repo rate at 6.0% but changed its stance to 'accommodative,' strongly hinting at a 25bps rate cut in the October policy review.",
      "Bond yields dropped 8bps on the announcement; 10-year G-Sec yield fell to 6.82% — positive for existing debt fund holders and corporate borrowers."
    ],
    source_name: "Livemint",
    source_url: "https://www.livemint.com/",
    category: "Bonds & FDs",
    tags: ["RBI", "Repo Rate", "MPC", "Bonds"],
    impact: "High",
    published_at: "2026-07-29T14:00:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "Corporate Bond Market Sees ₹1.2 Lakh Crore Issuance in Q1",
    summary: [
      "Corporate bond issuance touched ₹1.2 lakh crore in Q1 FY27, a 28% jump YoY, as companies locked in lower borrowing costs ahead of potential rate cuts.",
      "AAA-rated 3-year corporate bonds now offer 7.8% yield — a compelling 98bps spread over comparable G-Secs for conservative investors."
    ],
    source_name: "Business Standard",
    source_url: "https://www.business-standard.com/",
    category: "Bonds & FDs",
    tags: ["Corporate Bonds", "Debt", "Yield", "Fixed Income"],
    impact: "Medium",
    published_at: "2026-07-28T11:00:00+05:30",
    created_at: "2026-07-28T07:00:00+05:30"
  },
  {
    title: "SBI Revises FD Rates Upward by 25bps for 1-3 Year Tenures",
    summary: [
      "SBI increased fixed deposit rates by 25 basis points for the 1-3 year bucket, now offering 7.10% for general depositors and 7.60% for senior citizens.",
      "The rate hike follows similar moves by HDFC Bank and ICICI Bank, intensifying competition for retail deposits amid strong credit demand."
    ],
    source_name: "Moneycontrol",
    source_url: "https://www.moneycontrol.com/",
    category: "Bonds & FDs",
    tags: ["FD", "SBI", "Interest Rates", "Banking"],
    impact: "Standard",
    published_at: "2026-07-27T16:30:00+05:30",
    created_at: "2026-07-27T07:00:00+05:30"
  },

  // === Life & Term Insurance (3) ===
  {
    title: "IRDAI Mandates Standard Term Insurance with ₹50L Cover at ₹500/Month",
    summary: [
      "IRDAI's new 'Saral Jeevan Bima 2.0' mandates all life insurers to offer a standardized term plan with ₹50 lakh cover at approximately ₹500/month for a 30-year-old — ensuring affordable protection for every Indian.",
      "The directive eliminates restrictive exclusion clauses and mandates 100% claim payout within 30 days of documentation submission."
    ],
    source_name: "Economic Times",
    source_url: "https://economictimes.indiatimes.com/",
    category: "Life & Term Insurance",
    tags: ["IRDAI", "Term Insurance", "Regulation", "Saral Jeevan"],
    impact: "High",
    published_at: "2026-07-29T08:00:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "LIC Reports 97.8% Claim Settlement Ratio for FY26",
    summary: [
      "Life Insurance Corporation reported an industry-leading 97.8% individual death claim settlement ratio for FY26, processing over 12 lakh claims worth ₹23,400 crore.",
      "Private insurers averaged 98.2% settlement ratio, with HDFC Life and ICICI Prudential leading the pack — excellent news for policyholders evaluating insurers."
    ],
    source_name: "NDTV Profit",
    source_url: "https://www.ndtvprofit.com/",
    category: "Life & Term Insurance",
    tags: ["LIC", "Claim Settlement", "Life Insurance"],
    impact: "Medium",
    published_at: "2026-07-28T13:00:00+05:30",
    created_at: "2026-07-28T07:00:00+05:30"
  },
  {
    title: "New Surrender Value Norms Make Endowment Plans More Liquid",
    summary: [
      "IRDAI's revised surrender value regulations (effective April 2026) now guarantee 85% of premiums paid as surrender value after 3 years, up from the previous 30%.",
      "This makes traditional endowment and money-back plans significantly more liquid, reducing the penalty for early exits — a major consumer-friendly reform."
    ],
    source_name: "Livemint",
    source_url: "https://www.livemint.com/",
    category: "Life & Term Insurance",
    tags: ["IRDAI", "Surrender Value", "Endowment", "Reform"],
    impact: "Standard",
    published_at: "2026-07-27T10:30:00+05:30",
    created_at: "2026-07-27T07:00:00+05:30"
  },

  // === Health & Motor Insurance (3) ===
  {
    title: "IRDAI Launches Standardized Health Policy for Senior Citizens Above 65",
    summary: [
      "The new 'Saral Senior Arogya' policy mandates all health insurers to provide coverage up to ₹25 lakh for citizens above 65, with no pre-existing condition waiting period beyond 1 year.",
      "Premiums are capped at ₹1,500/month for ₹10 lakh cover, with day-care procedures and AYUSH treatments included — addressing India's massive insurance gap for retirees."
    ],
    source_name: "Economic Times",
    source_url: "https://economictimes.indiatimes.com/",
    category: "Health & Motor Insurance",
    tags: ["IRDAI", "Health Insurance", "Senior Citizens", "Saral Arogya"],
    impact: "High",
    published_at: "2026-07-29T09:30:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "Motor Insurance Third-Party Premium Hiked by 12-15% from April",
    summary: [
      "IRDAI revised third-party motor insurance premiums upward by 12-15% across all vehicle categories, citing increased claim frequency and repair cost inflation.",
      "Two-wheeler TP premium now starts at ₹1,680/year (up from ₹1,500), while private car premiums for 1500cc+ vehicles increased to ₹6,200/year — a significant cost impact for vehicle owners."
    ],
    source_name: "Business Standard",
    source_url: "https://www.business-standard.com/",
    category: "Health & Motor Insurance",
    tags: ["Motor Insurance", "IRDAI", "Third Party", "Premium Hike"],
    impact: "Medium",
    published_at: "2026-07-28T08:45:00+05:30",
    created_at: "2026-07-28T07:00:00+05:30"
  },
  {
    title: "Wellness Riders Now Mandatory Offering Across All Health Insurers",
    summary: [
      "IRDAI now requires every health insurer to offer optional wellness riders — covering gym memberships, preventive health check-ups, mental health consultations, and nutrition counseling.",
      "Policyholders opting for wellness riders can earn premium discounts of up to 15% based on tracked health metrics and engagement scores."
    ],
    source_name: "Moneycontrol",
    source_url: "https://www.moneycontrol.com/",
    category: "Health & Motor Insurance",
    tags: ["Wellness", "Health Insurance", "IRDAI", "Riders"],
    impact: "Standard",
    published_at: "2026-07-27T12:00:00+05:30",
    created_at: "2026-07-27T07:00:00+05:30"
  },

  // === Wealth Strategy (3) ===
  {
    title: "Budget 2026: Capital Gains Tax Rationalization — Key Changes for Investors",
    summary: [
      "Union Budget 2026 rationalized capital gains tax: LTCG on equities now at 10% (from 12.5%) with a ₹2 lakh exemption, while STCG reduced to 15% — a significant boost for long-term wealth creation.",
      "Debt mutual fund indexation benefits partially restored for holding periods above 36 months, and NPS Tier-1 withdrawal up to ₹75 lakh is now tax-free on maturity."
    ],
    source_name: "Livemint",
    source_url: "https://www.livemint.com/",
    category: "Wealth Strategy",
    tags: ["Budget", "Capital Gains", "Tax", "LTCG", "NPS"],
    impact: "High",
    published_at: "2026-07-29T07:00:00+05:30",
    created_at: "2026-07-29T07:00:00+05:30"
  },
  {
    title: "RBI Digital Rupee Pilot Expands to 15 New Cities",
    summary: [
      "The RBI's CBDC pilot (e₹) expanded to 15 additional Tier-2 cities, with participating banks now including RBL, Federal Bank, and IDFC First alongside the original pilot banks.",
      "Daily transaction volumes crossed ₹120 crore in the pilot, with UPI-like QR code payments being the most adopted use case — a step closer to full digital currency rollout."
    ],
    source_name: "NDTV Profit",
    source_url: "https://www.ndtvprofit.com/",
    category: "Wealth Strategy",
    tags: ["Digital Rupee", "CBDC", "RBI", "Fintech"],
    impact: "Medium",
    published_at: "2026-07-28T14:30:00+05:30",
    created_at: "2026-07-28T07:00:00+05:30"
  },
  {
    title: "Financial Planning for NRIs: New DTAA Benefits with 5 Countries",
    summary: [
      "India signed updated Double Taxation Avoidance Agreements with UAE, Singapore, Australia, Canada, and the UK — reducing withholding tax rates on dividends, interest, and royalties for NRI investors.",
      "NRIs in these countries can now benefit from reduced TDS of 10% on mutual fund dividends (down from 20%) and streamlined tax credit claims on Indian income."
    ],
    source_name: "Economic Times",
    source_url: "https://economictimes.indiatimes.com/",
    category: "Wealth Strategy",
    tags: ["NRI", "DTAA", "Tax Planning", "International"],
    impact: "Standard",
    published_at: "2026-07-27T11:15:00+05:30",
    created_at: "2026-07-27T07:00:00+05:30"
  }
];

// Convert article to Firestore REST API format
function toFirestoreDoc(article) {
  return {
    fields: {
      title: { stringValue: article.title },
      summary: { 
        arrayValue: { 
          values: article.summary.map(s => ({ stringValue: s }))
        }
      },
      source_name: { stringValue: article.source_name },
      source_url: { stringValue: article.source_url },
      category: { stringValue: article.category },
      tags: {
        arrayValue: {
          values: article.tags.map(t => ({ stringValue: t }))
        }
      },
      impact: { stringValue: article.impact },
      published_at: { stringValue: article.published_at },
      created_at: { stringValue: article.created_at }
    }
  };
}

async function seedFirestore() {
  console.log('🚀 Seeding Firestore with sample articles...\n');
  console.log('Getting access token from Firebase CLI...');
  
  const token = getAccessToken();
  console.log('✅ Access token obtained.\n');

  let successCount = 0;
  let errorCount = 0;

  for (const article of SEED_ARTICLES) {
    try {
      const response = await fetch(FIRESTORE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toFirestoreDoc(article)),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`HTTP ${response.status}: ${err}`);
      }

      const data = await response.json();
      const docId = data.name.split('/').pop();
      console.log(`  ✅ [${article.category}] "${article.title}" → ${docId}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ [${article.category}] "${article.title}" → ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  📊 Seeding complete: ${successCount} success, ${errorCount} errors`);
  console.log(`  🌐 Project: ${PROJECT_ID}`);
  console.log(`  📁 Collection: articles`);
  console.log(`${'═'.repeat(60)}\n`);
}

seedFirestore();
