import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'articles';

/**
 * Derive YYYY-MM-DD date string in Asia/Kolkata from an article's timestamp fields.
 */
export function getArticleIstDate(article) {
  if (!article) return '';
  if (article.curatedDate) return article.curatedDate;
  const iso = article.published_at || article.created_at;
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  } catch {
    return String(iso).slice(0, 10);
  }
}

/**
 * Normalize inconsistent legacy/new article fields once at read time.
 */
function normalizeArticle(docSnap) {
  const data = docSnap.data() || {};
  const impact = data.impact || data.impactLevel || data.impact_level || 'Standard';
  const sourceName = data.source_name || data.source || 'Financial Desk';

  return {
    id: docSnap.id,
    ...data,
    impact,
    impactLevel: impact,
    source_name: sourceName,
    source: sourceName,
    curatedDate: getArticleIstDate(data),
    summary: Array.isArray(data.summary) ? data.summary : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}

/**
 * Fetch articles with flexible filters.
 */
export const getArticles = async ({ category, searchTerm, startDate, endDate, limitCount = 50 }) => {
  try {
    const q = collection(db, COLLECTION_NAME);
    const constraints = [];

    if (category && category !== 'All') {
      constraints.push(where('category', '==', category));
    }

    if (startDate) {
      constraints.push(where('published_at', '>=', startDate.toISOString()));
    }

    if (endDate) {
      constraints.push(where('published_at', '<=', endDate.toISOString()));
    }

    constraints.push(orderBy('published_at', 'desc'));

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const finalQuery = query(q, ...constraints);
    const snapshot = await getDocs(finalQuery);
    const articles = snapshot.docs.map(normalizeArticle);

    return searchArticles(articles, searchTerm);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
};

/**
 * Fetch top 3 high-impact highlights.
 */
export const getHighlights = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('impact', '==', 'High'),
      orderBy('published_at', 'desc'),
      limit(3)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(normalizeArticle);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return [];
  }
};

/**
 * Fetch recent articles (last 7 days), gracefully falling back to the latest 40 archived
 * briefings if the 7-day window has zero results.
 */
export const getAllArticles = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentQuery = query(
      collection(db, COLLECTION_NAME),
      where('published_at', '>=', sevenDaysAgo.toISOString()),
      orderBy('published_at', 'desc'),
      limit(120)
    );
    const snapshot = await getDocs(recentQuery);
    if (!snapshot.empty) {
      return snapshot.docs.map(normalizeArticle);
    }

    // Graceful fallback so users never see an empty slate if backend curation paused >7 days
    const fallbackQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('published_at', 'desc'),
      limit(40)
    );
    const fallbackSnap = await getDocs(fallbackQuery);
    return fallbackSnap.docs.map(normalizeArticle);
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
};

/**
 * Client-side search implementation.
 */
export const searchArticles = (articles, term) => {
  if (!term) return articles;

  const lowerTerm = term.toLowerCase();
  return articles.filter(article => {
    const matchTitle = article.title?.toLowerCase().includes(lowerTerm);
    const matchSummary = article.summary?.some(bullet => bullet.toLowerCase().includes(lowerTerm));
    const matchTags = article.tags?.some(tag => tag.toLowerCase().includes(lowerTerm));
    const matchSource = (article.source_name || article.source)?.toLowerCase().includes(lowerTerm);

    return matchTitle || matchSummary || matchTags || matchSource;
  });
};
