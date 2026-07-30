/**
 * Firestore Database Cleaner Script
 * Deletes any articles containing raw HTML tags or generic homepage URLs from Firestore.
 */

const { execSync } = require('child_process');

const PROJECT_ID = 'masterchetan-financial';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/articles`;

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

async function clean() {
  const token = getAccessToken();
  console.log('Fetching Firestore documents...');

  const res = await fetch(`${FIRESTORE_BASE_URL}?pageSize=200`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await res.json();
  const docs = data.documents || [];
  console.log(`Found ${docs.length} total documents.`);

  let deletedCount = 0;

  for (const doc of docs) {
    const fields = doc.fields || {};
    const title = fields.title?.stringValue || '';
    const sourceUrl = fields.source_url?.stringValue || '';
    const summaryValues = fields.summary?.arrayValue?.values || [];
    const summaryText = summaryValues.map(v => v.stringValue || '').join(' ');

    const hasHtmlTags = summaryText.includes('<img') || summaryText.includes('&lt;') || summaryText.includes('<a') || summaryText.includes('alt=');
    const isGeneric = !sourceUrl || sourceUrl.endsWith('.com') || sourceUrl.endsWith('.com/') || sourceUrl.endsWith('.in') || sourceUrl.endsWith('.in/');

    if (hasHtmlTags || isGeneric) {
      console.log(`🗑️ Deleting bad doc: "${title.substring(0, 45)}..." (hasHtml: ${hasHtmlTags}, isGeneric: ${isGeneric})`);
      await fetch(`https://firestore.googleapis.com/v1/${doc.name}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      deletedCount++;
    }
  }

  console.log(`\nCleaned ${deletedCount} bad documents from Firestore.`);
}

clean();
