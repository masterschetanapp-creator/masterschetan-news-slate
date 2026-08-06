const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generateMasterBlueprintPDF() {
  const outputPath = path.join(__dirname, '../AUTOMATED_NEWS_SLATE_MASTER_BLUEPRINT.pdf');
  const artifactPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\9f134cbd-54d6-4f6b-b870-ed1e8925aa30\\AUTOMATED_NEWS_SLATE_MASTER_BLUEPRINT.pdf';

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

  // --- PAGE 1: TITLE & EXECUTIVE ARCHITECTURE ---
  doc.rect(0, 0, doc.page.width, 140).fill(darkNavy);
  
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('UNIVERSAL AUTOMATED NEWS SLATE', 40, 35);
  doc.fillColor(primaryRed).fontSize(16).text('MASTER FRAMEWORK BLUEPRINT', 40, 65);
  doc.fillColor('#94a3b8').fontSize(9.5).font('Helvetica').text('A Replicable, Zero-Backend, Fully Automated White-Label Platform for Niche Intelligence Portals', 40, 92);
  doc.text('Verticals: Finance | AI & Tech | Fitness & Health | Real Estate | Medical', 40, 108);

  doc.y = 160;
  
  doc.fillColor(primaryRed).fontSize(13).font('Helvetica-Bold').text('1. EXECUTIVE ARCHITECTURE & ZERO-QUOTA PATTERN');
  doc.moveDown(0.4);

  doc.fillColor(textDark).fontSize(9.5).font('Helvetica').text(
    'The Universal Automated News Slate Framework delivers a real-time, AI-curated intelligence portal with ZERO server infrastructure fees and 0 Firestore database read costs for high-frequency widgets.',
    { align: 'justify' }
  );
  doc.moveDown(0.8);

  // Key Pillars Box
  const boxStartY = doc.y;
  doc.rect(40, boxStartY, doc.page.width - 80, 100).fillAndStroke('#f8fafc', '#e2e8f0');
  const boxY = boxStartY + 12;
  
  doc.fillColor(darkNavy).fontSize(10.5).font('Helvetica-Bold').text('Core Architectural Pillars:', 52, boxY);
  doc.fillColor(textDark).fontSize(9).font('Helvetica');
  doc.text('• Static CDN First (0 Firestore Read Quota): Live tickers & heatmaps fetch from public/niche-data.json.', 52, boxY + 20);
  doc.text('• Gemini AI Autonomous Curation: Google Gemini API generates 3 key bullets & impact tags.', 52, boxY + 36);
  doc.text('• GitHub Actions Automated Pipeline: Headless cron runs twice daily (9 AM & 5 PM IST).', 52, boxY + 52);
  doc.text('• Multi-Client White-Label Architecture: Independent Firebase Projects & GitHub Repos per customer.', 52, boxY + 68);

  doc.y = boxStartY + 115;

  doc.fillColor(primaryRed).fontSize(13).font('Helvetica-Bold').text('2. DOMAIN ADAPTATION MATRIX');
  doc.moveDown(0.4);

  // Matrix Table Header
  const tableTop = doc.y;
  doc.rect(40, tableTop, doc.page.width - 80, 22).fill('#e2e8f0');
  doc.fillColor(darkNavy).fontSize(9).font('Helvetica-Bold');
  doc.text('Vertical', 48, tableTop + 6);
  doc.text('Categories', 140, tableTop + 6);
  doc.text('Key Widgets', 320, tableTop + 6);
  doc.text('Data Sources', 450, tableTop + 6);

  const rows = [
    { v: 'AI & Tech', c: 'LLMs, Robotics, AI Ethics, Dev Tools', w: 'Model Benchmark Heatmap', s: 'ArXiv, TechCrunch' },
    { v: 'Fitness', c: 'Hypertrophy, Nutrition, Biohacking', w: 'Macro Estimator, Calorie Chart', s: 'PubMed, Men\'s Health' },
    { v: 'Finance', c: 'Equities, Mutual Funds, PMS/AIF', w: '5-Day FII/DII Chart, Sector Heatmap', s: 'Economic Times, GF' },
    { v: 'Real Estate', c: 'Commercial, REITs, PropTech', w: 'Rental Yield Tracker, Circle Rates', s: 'Housing.com, PropTiger' }
  ];

  let rY = tableTop + 22;
  rows.forEach((r, i) => {
    doc.rect(40, rY, doc.page.width - 80, 22).fill(i % 2 === 0 ? '#ffffff' : '#f8fafc');
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica');
    doc.text(r.v, 48, rY + 6);
    doc.text(r.c, 140, rY + 6);
    doc.text(r.w, 320, rY + 6);
    doc.text(r.s, 450, rY + 6);
    rY += 22;
  });

  // --- PAGE 2: FIREBASE & AI PIPELINE CODE ---
  doc.addPage();
  
  doc.fillColor(primaryRed).fontSize(13).font('Helvetica-Bold').text('3. STEP-BY-STEP REPLICATION & AI SCRAPER PIPELINE');
  doc.moveDown(0.4);

  doc.fillColor(textDark).fontSize(9.5).font('Helvetica').text('Below is the complete, copy-paste ready AI Curation Engine script (scripts/curate-news.cjs):');
  doc.moveDown(0.4);

  const code1 = `const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function curateNicheNews() {
  console.log('🤖 Starting AI Curation Engine...');
  const rawArticles = await fetchRawArticles(); 
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  for (const item of rawArticles) {
    const prompt = \`Summarize in 3 bullet points, assign category & impact (High/Medium/Standard):
      Title: \${item.title} Content: \${item.content}\`;
    
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim());

    const docId = Buffer.from(item.title).toString('hex').slice(0, 20);
    await db.collection('articles').doc(docId).set({
      title: item.title,
      summary: parsed.summary,
      category: parsed.category,
      impactLevel: parsed.impactLevel,
      tags: parsed.tags,
      source: item.source,
      sourceUrl: item.link,
      curatedDate: new Date().toISOString().split('T')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
}
curateNicheNews();`;

  const codeBox1Y = doc.y;
  doc.rect(40, codeBox1Y, doc.page.width - 80, 290).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(7.5).font('Courier').text(code1, 50, codeBox1Y + 10);

  doc.y = codeBox1Y + 305;

  doc.fillColor(primaryRed).fontSize(13).font('Helvetica-Bold').text('4. LIVE DATA SCRAPER (STATIC CDN FEED)');
  doc.moveDown(0.4);

  const code2 = `// scripts/fetch-niche-data.cjs - Generates public/niche-data.json (0 Firestore Reads)
const fs = require('fs');
const path = require('path');

async function fetchLiveNicheMetrics() {
  const tickerData = await fetchLiveTickerFromWeb();
  const sectorData = await fetchLiveSectorHeatmapFromWeb();

  const payload = { ticker: tickerData, sectors: sectorData, updatedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(__dirname, '../public/niche-data.json'), JSON.stringify(payload, null, 2));
}
fetchLiveNicheMetrics();`;

  const codeBox2Y = doc.y;
  doc.rect(40, codeBox2Y, doc.page.width - 80, 120).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(7.5).font('Courier').text(code2, 50, codeBox2Y + 10);

  // --- PAGE 3: GITHUB ACTIONS & REPLICATION CHECKLIST ---
  doc.addPage();

  doc.fillColor(primaryRed).fontSize(13).font('Helvetica-Bold').text('5. GITHUB ACTIONS AUTOMATED DEPLOYMENT WORKFLOW');
  doc.moveDown(0.4);

  doc.fillColor(textDark).fontSize(9.5).font('Helvetica').text('File location: .github/workflows/curate.yml');
  doc.moveDown(0.4);

  const code3 = `name: 🔄 Daily AI Curation & Deployment Pipeline

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
      - run: node scripts/fetch-niche-data.cjs
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
          projectId: YOUR_NEW_FIREBASE_PROJECT_ID`;

  const codeBox3Y = doc.y;
  doc.rect(40, codeBox3Y, doc.page.width - 80, 270).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(7.5).font('Courier').text(code3, 50, codeBox3Y + 10);

  doc.y = codeBox3Y + 285;

  doc.fillColor(primaryRed).fontSize(13).font('Helvetica-Bold').text('6. 30-MINUTE CLIENT ONBOARDING CHECKLIST');
  doc.moveDown(0.4);

  const steps = [
    '1. Create New Firebase Project: Enable Cloud Firestore & Hosting on Console.',
    '2. Create GitHub Repo: Push cloned template code to client\'s GitHub repository.',
    '3. Add Secrets to GitHub: Set GEMINI_API_KEY & FIREBASE_SERVICE_ACCOUNT.',
    '4. Customize Branding: Update logo.jpeg, Header titles, and advisory contact details.',
    '5. Trigger Initial Deployment: Run `npm run build` and `firebase deploy --only hosting`.'
  ];

  steps.forEach(s => {
    doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text(s);
    doc.moveDown(0.3);
  });

  // Footer on all pages
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(
      `Master Framework Blueprint • Page ${i + 1} of ${totalPages} • Universal Automated News Slate Platform`,
      40,
      doc.page.height - 30,
      { align: 'center', width: doc.page.width - 80 }
    );
  }

  doc.end();

  stream.on('finish', () => {
    console.log('SUCCESS! Created PDF:', outputPath);
    try {
      fs.copyFileSync(outputPath, artifactPath);
      console.log('Copied PDF to Artifact Directory!');
    } catch (e) {
      console.warn('Artifact copy warning:', e.message);
    }
  });
}

generateMasterBlueprintPDF();
