const os = require('os');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'masterchetan-financial';
const OAUTH_CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const OAUTH_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

/**
 * Load key=value pairs from project .env when running locally outside CI.
 */
function loadLocalEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

async function exchangeRefreshToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: OAUTH_CLIENT_ID,
    client_secret: OAUTH_CLIENT_SECRET,
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `OAuth HTTP ${res.status}`);
  }
  return data.access_token;
}

/**
 * Resolve a short-lived Google OAuth access token from FIREBASE_TOKEN or local firebase-tools config.
 */
async function getAccessToken() {
  const envToken = process.env.FIREBASE_TOKEN;
  if (envToken) {
    try {
      return await exchangeRefreshToken(envToken.trim());
    } catch (e) {
      console.warn('FIREBASE_TOKEN exchange warning:', e.message);
    }
  }

  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const refreshToken = config.tokens?.refresh_token;
    if (refreshToken) {
      return await exchangeRefreshToken(refreshToken);
    }
  }

  throw new Error('No valid Firebase authentication token found.');
}

/**
 * Convert a plain JS value into Firestore REST Value format.
 */
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/**
 * Convert a Firestore REST Value object back into a plain JS value.
 */
function fromFirestoreValue(val) {
  if (!val || typeof val !== 'object') return null;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ('mapValue' in val) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = fromFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

/**
 * Read a Firestore document via REST API and decode its fields into plain JS.
 */
async function getDocument(collectionName, docId, token = null) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}/${docId}`;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Firestore read ${collectionName}/${docId} failed (${res.status})`);
  }

  const doc = await res.json();
  const decoded = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    decoded[k] = fromFirestoreValue(v);
  }
  return decoded;
}

/**
 * Upsert a Firestore document via REST API PATCH.
 */
async function upsertDocument(collectionName, docId, payload, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}/${docId}`;
  const fields = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore upsert ${collectionName}/${docId} failed (${res.status}): ${errText}`);
  }

  return res.json();
}

module.exports = {
  PROJECT_ID,
  loadLocalEnv,
  getAccessToken,
  toFirestoreValue,
  fromFirestoreValue,
  getDocument,
  upsertDocument,
};
