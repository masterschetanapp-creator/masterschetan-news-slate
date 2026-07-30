import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'articles';

/**
 * Fetch articles with flexible filters
 */
export const getArticles = async ({ category, searchTerm, startDate, endDate, limitCount = 50 }) => {
  try {
    let q = collection(db, COLLECTION_NAME);
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

    // Default sorting by publish date
    constraints.push(orderBy('published_at', 'desc'));
    
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const finalQuery = query(q, ...constraints);
    const snapshot = await getDocs(finalQuery);

    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side search as Firestore doesn't support full-text search directly
    return searchArticles(articles, searchTerm);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
};

/**
 * Fetch top 3 high-impact highlights
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return [];
  }
};

/**
 * Fetch all recent articles (last 7 days)
 */
export const getAllArticles = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const q = query(
      collection(db, COLLECTION_NAME),
      where('published_at', '>=', sevenDaysAgo.toISOString()),
      orderBy('published_at', 'desc'),
      limit(100) // generous limit for recent articles
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
};

/**
 * Client-side search implementation
 */
export const searchArticles = (articles, term) => {
  if (!term) return articles;
  
  const lowerTerm = term.toLowerCase();
  return articles.filter(article => {
    const matchTitle = article.title?.toLowerCase().includes(lowerTerm);
    const matchSummary = article.summary?.some(bullet => bullet.toLowerCase().includes(lowerTerm));
    const matchTags = article.tags?.some(tag => tag.toLowerCase().includes(lowerTerm));
    
    return matchTitle || matchSummary || matchTags;
  });
};
