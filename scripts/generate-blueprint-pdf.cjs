const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generateMasterBlueprintPDF() {
  const outputPath = path.join(__dirname, '../PRODUCTION_TECHNICAL_BLUEPRINT.pdf');
  const artifactPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\9f134cbd-54d6-4f6b-b870-ed1e8925aa30\\PRODUCTION_TECHNICAL_BLUEPRINT.pdf';

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Helper colors
  const primaryRed = '#e02020';
  const darkNavy = '#0a0f1a';
  const textDark = '#1e293b';
  const textMuted = '#64748b';

  // --- PAGE 1: TITLE & EXACT TECHNICAL ARCHITECTURE ---
  doc.rect(0, 0, doc.page.width, 140).fill(darkNavy);
  
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('FINANCIAL NEWS SLATE', 40, 35);
  doc.fillColor(primaryRed).fontSize(15).text('PRODUCTION TECHNICAL BLUEPRINT & DEPLOYMENT SPECIFICATION', 40, 62);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Complete Technical Architecture, Data Schemas, Scraper Engines, Component Hierarchies, and CI/CD Pipeline', 40, 88);
  doc.text('Target Project: masterchetan-financial.web.app | React 18 + Vite 8 + TailwindCSS + Firestore', 40, 104);

  doc.y = 155;
  
  doc.fillColor(primaryRed).fontSize(12).font('Helvetica-Bold').text('1. CORE ARCHITECTURE & ZERO-QUOTA CDN PATTERN');
  doc.moveDown(0.3);

  doc.fillColor(textDark).fontSize(9).font('Helvetica').text(
    'This system employs a dual-data pipeline. High-frequency live tickers, 8 Nifty sectoral indices, and the 5-Day FII/DII Institutional Table are fetched from a static CDN JSON file (public/market-data.json). This guarantees ZERO Firestore database read quotas for high-frequency client updates.',
    { align: 'justify' }
  );
  doc.moveDown(0.6);

  // Key Pillars Box
  const boxStartY = doc.y;
  doc.rect(40, boxStartY, doc.page.width - 80, 110).fillAndStroke('#f8fafc', '#cbd5e1');
  const boxY = boxStartY + 10;
  
  doc.fillColor(darkNavy).fontSize(10).font('Helvetica-Bold').text('Production Technical Stack:', 52, boxY);
  doc.fillColor(textDark).fontSize(8.5).font('Helvetica');
  doc.text('• Frontend: React 18, Vite 8, TailwindCSS (Modern Light Theme, #e02020 Red Accent), Lucide-React, Framer Motion', 52, boxY + 18);
  doc.text('• Data Engine: Public Static CDN Dataset (public/market-data.json) + Cloud Firestore NoSQL Database (articles)', 52, boxY + 34);
  doc.text('• AI Processing: Google Gemini 1.5 Flash API (@google/genai) for 3-bullet summarization & category tagging', 52, boxY + 50);
  doc.text('• Automation Pipeline: GitHub Actions Headless Cron (.github/workflows/curate.yml) twice daily (9:03 AM & 5:33 PM IST)', 52, boxY + 66);
  doc.text('• Hosting CDN: Firebase Hosting CDN (masterchetan-financial.web.app)', 52, boxY + 82);

  doc.y = boxStartY + 125;

  doc.fillColor(primaryRed).fontSize(12).font('Helvetica-Bold').text('2. COMPONENT ARCHITECTURE & WIDGET SPECIFICATIONS');
  doc.moveDown(0.3);

  const components = [
    { n: 'Header.jsx', d: 'Brand Masthead, WhatsApp (93242 73030), Advisory Contact Cards, Saved Bookmarks Filter' },
    { n: 'MarketTicker.jsx', d: 'Live Marquee Bar for SENSEX, NIFTY 50, BANK NIFTY, GOLD (24K), USD/INR, CRUDE BRENT' },
    { n: 'SectorHeatmap.jsx', d: '8 Nifty Sectoral Indices Grid with Direct Client Live Fetch to Yahoo Finance on Refresh' },
    { n: 'FiiDiiTable.jsx', d: 'Official 5-Day FII & DII Institutional Gross Buy, Gross Sell & Net Cash Flow Table + MTD Row' },
    { n: 'EventCalendar.jsx', d: 'Upcoming Macro Catalysts Strip & RBI MPC Policy Watch' },
    { n: 'ArticleModal.jsx', d: 'Full-Screen Article Reader Drawer Modal + Deep Link URL Parameter (?article=ID)' }
  ];

  let cY = doc.y;
  components.forEach((c, i) => {
    doc.rect(40, cY, doc.page.width - 80, 18).fill(i % 2 === 0 ? '#ffffff' : '#f1f5f9');
    doc.fillColor(darkNavy).fontSize(8.5).font('Helvetica-Bold').text(c.n, 48, cY + 4);
    doc.fillColor(textDark).fontSize(8).font('Helvetica').text(c.d, 170, cY + 4);
    cY += 18;
  });

  // --- PAGE 2: MARKET DATA SCRAPER ENGINE ---
  doc.addPage();
  
  doc.fillColor(primaryRed).fontSize(12).font('Helvetica-Bold').text('3. MARKET & INSTITUTIONAL DATA SCRAPER ENGINE (scripts/fetch-market-data.cjs)');
  doc.moveDown(0.3);

  const code1 = `const fs = require('fs');
const path = require('path');

// Scrapes Google Finance, Yahoo Finance & Economic Times exchange tables
async function fetchAllLiveMarketData() {
  const tickerResults = [];
  const sensex = await fetchGoogleFinanceQuote('SENSEX:INDEXBOM', 'SENSEX');
  if (sensex) tickerResults.push(sensex);
  
  const nifty = await fetchGoogleFinanceQuote('NIFTY_50:INDEXNSE', 'NIFTY 50');
  if (nifty) tickerResults.push(nifty);

  const fiiDiiTableData = await fetch5DayFiiDiiTable();

  const payload = {
    ticker: tickerResults,
    fiiDiiTable: fiiDiiTableData,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(path.join(__dirname, '../public/market-data.json'), JSON.stringify(payload, null, 2));
}
fetchAllLiveMarketData();`;

  const codeBox1Y = doc.y;
  doc.rect(40, codeBox1Y, doc.page.width - 80, 240).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(7.5).font('Courier').text(code1, 50, codeBox1Y + 10);

  doc.y = codeBox1Y + 255;

  doc.fillColor(primaryRed).fontSize(12).font('Helvetica-Bold').text('4. GEMINI AI CURATION PIPELINE (scripts/curate-news.cjs)');
  doc.moveDown(0.3);

  const code2 = `const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Summarizes raw articles into 3 bullets, categorizes & assigns High/Medium/Standard impact
async function curateArticle(rawItem) {
  const prompt = \`Summarize in 3 bullet points, categorize & assign impact: \${rawItem.content}\`;
  const res = await model.generateContent(prompt);
  const parsed = JSON.parse(res.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim());

  await admin.firestore().collection('articles').doc(rawItem.id).set({
    title: rawItem.title, summary: parsed.summary, category: parsed.category,
    impactLevel: parsed.impactLevel, curatedDate: new Date().toISOString().split('T')[0]
  }, { merge: true });
}`;

  const codeBox2Y = doc.y;
  doc.rect(40, codeBox2Y, doc.page.width - 80, 200).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(7.5).font('Courier').text(code2, 50, codeBox2Y + 10);

  // --- PAGE 3: GITHUB ACTIONS & REPLICATION CHECKLIST ---
  doc.addPage();

  doc.fillColor(primaryRed).fontSize(12).font('Helvetica-Bold').text('5. GITHUB ACTIONS AUTOMATION WORKFLOW (.github/workflows/curate.yml)');
  doc.moveDown(0.3);

  const code3 = `name: 🔄 Daily Market & Financial Curation Pipeline

on:
  schedule:
    - cron: '33 3 * * *'  # 9:03 AM IST
    - cron: '3 12 * * *'  # 5:33 PM IST
  workflow_dispatch:

jobs:
  curate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: 18 }
      - run: npm ci
      - run: node scripts/fetch-market-data.cjs
      - run: node scripts/curate-news.cjs
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          FIREBASE_SERVICE_ACCOUNT_KEY: \${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '\${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: masterchetan-financial`;

  const codeBox3Y = doc.y;
  doc.rect(40, codeBox3Y, doc.page.width - 80, 270).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(7.5).font('Courier').text(code3, 50, codeBox3Y + 10);

  doc.y = codeBox3Y + 285;

  doc.fillColor(primaryRed).fontSize(12).font('Helvetica-Bold').text('6. REPLICATION & CUSTOMER ONBOARDING STEPS');
  doc.moveDown(0.3);

  const steps = [
    '1. Clone Working Repository: `git clone https://github.com/masterschetanapp-creator/masterschetan-news-slate.git new-project`',
    '2. Firebase Target Setup: Change projectId in `.firebaserc` to client\'s Firebase project ID.',
    '3. GitHub Repo Secrets: Configure `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, and `FIREBASE_SERVICE_ACCOUNT_KEY`.',
    '4. Custom Subject Matter: Replace category lists in CategoryFilter.jsx and prompt definitions in curate-news.cjs.',
    '5. Initial Production Build: Run `npm run build` and `firebase deploy --only hosting`.'
  ];

  steps.forEach(s => {
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold').text(s);
    doc.moveDown(0.25);
  });

  // Footer on all pages
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(
      `Financial News Slate • Production Technical Blueprint • Page ${i + 1} of ${totalPages}`,
      40,
      doc.page.height - 30,
      { align: 'center', width: doc.page.width - 80 }
    );
  }

  doc.end();

  stream.on('finish', () => {
    console.log('SUCCESS! Updated PDF with exact technical specs:', outputPath);
    try {
      fs.copyFileSync(outputPath, artifactPath);
      console.log('Copied PDF to Artifact Directory!');
    } catch (e) {
      console.warn('Artifact copy warning:', e.message);
    }
  });
}

generateMasterBlueprintPDF();
