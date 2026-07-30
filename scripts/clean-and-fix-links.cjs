/**
 * Firestore Maintenance & Link Sanitizer Script
 * 
 * 1. Fetches all articles from Firestore.
 * 2. Checks each article's URL with HTTP HEAD/GET requests.
 * 3. Removes articles with 404 / expired links.
 * 4. Fixes generic homepage URLs by retrieving exact deep-link URLs.
 * 
 * USAGE:
 *   node scripts/clean-and-fix-links.cjs
 */

const { execSync } = require('child_process');

const PROJECT_ID = 'masterchetan-financial';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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

async function getAllDocuments(token) {
  const response = await fetch(`${FIRESTORE_BASE_URL}?pageSize=200`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Firestore docs: ${response.status}`);
  }

  const data = await response.json();
  return (data.documents || []).map(doc => {
    const fields = doc.fields || {};
    return {
      docName: doc.name,
      docId: doc.name.split('/').pop(),
      title: fields.title?.stringValue || '',
      source_name: fields.source_name?.stringValue || '',
      source_url: fields.source_url?.stringValue || '',
      category: fields.category?.stringValue || '',
    };
  });
}

async function searchDeepLinkForTitle(title, sourceName) {
  if (!GEMINI_API_KEY) return null;

  const prompt = `Find the exact direct web URL of the original article for this headline: "${title}" from source "${sourceName}". Return ONLY a JSON object with {"url": "https://..."}.`;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.1 }
  };

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const webUris = candidate?.groundingMetadata?.groundingChunks || [];

    for (const chunk of webUris) {
      if (chunk.web && chunk.web.uri) {
        return chunk.web.uri;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function testUrlValidity(url) {
  if (!url || url.length < 10) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeoutId);

    if (res.status === 404 || res.status === 410) return false;
    return true;
  } catch (e) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      clearTimeout(timeoutId);
      return res.status !== 404 && res.status !== 410;
    } catch (err) {
      return true;
    }
  }
}

async function deleteDocument(docName, token) {
  const url = `https://firestore.googleapis.com/v1/${docName}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.ok;
}

async function updateDocumentUrl(docName, newUrl, token) {
  const url = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=source_url`;
  const body = {
    name: docName,
    fields: {
      source_url: { stringValue: newUrl }
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return res.ok;
}

async function auditAndClean() {
  console.log('\n' + '═'.repeat(60));
  console.log('  🔍 Firestore Article Link Audit & Sanitizer');
  console.log('═'.repeat(60) + '\n');

  const token = getAccessToken();
  const docs = await getAllDocuments(token);
  console.log(`📋 Found ${docs.length} total articles in Firestore.\n`);

  let updatedCount = 0;
  let deletedCount = 0;

  for (const doc of docs) {
    console.log(`🔎 Auditing: "${doc.title.substring(0, 50)}..."`);
    console.log(`   Current URL: ${doc.source_url}`);

    const isGeneric = !doc.source_url || doc.source_url.endsWith('.com') || doc.source_url.endsWith('.com/') || doc.source_url.endsWith('.in') || doc.source_url.endsWith('.in/');
    
    let isWorking = false;
    if (!isGeneric) {
      isWorking = await testUrlValidity(doc.source_url);
    }

    if (isGeneric || !isWorking) {
      console.log(`   ⚠️ Link is ${isGeneric ? 'generic homepage' : 'broken/404'}. Searching Google for exact article deep link...`);
      const deepLink = await searchDeepLinkForTitle(doc.title, doc.source_name);

      if (deepLink) {
        console.log(`   ✅ Found deep link: ${deepLink}`);
        await updateDocumentUrl(doc.docName, deepLink, token);
        updatedCount++;
      } else {
        console.log(`   ❌ No working link found. Deleting expired article from Firestore...`);
        await deleteDocument(doc.docName, token);
        deletedCount++;
      }
    } else {
      console.log(`   ✅ Link verified valid.`);
    }

    console.log('─'.repeat(50));
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  📊 Link Audit Complete!`);
  console.log(`  🔗 Links Updated with Deep Links: ${updatedCount}`);
  console.log(`  🗑️ Expired/Broken Articles Removed: ${deletedCount}`);
  console.log('═'.repeat(60) + '\n');
}

auditAndClean();
