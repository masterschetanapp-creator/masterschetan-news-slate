import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Flame, BarChart3, Bookmark } from 'lucide-react';
import Header from './components/Header';
import Highlights from './components/Highlights';
import SectorHeatmap from './components/SectorHeatmap';
import InstitutionalFlows from './components/InstitutionalFlows';
import EventCalendar from './components/EventCalendar';
import CategoryFilter from './components/CategoryFilter';
import ImpactFilter from './components/ImpactFilter';
import SearchBar from './components/SearchBar';
import NewsList from './components/NewsList';
import ArticleModal from './components/ArticleModal';
import Footer from './components/Footer';
import { getAllArticles, searchArticles } from './services/firestore';

function App() {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeImpact, setActiveImpact] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive Reader State & Deep Link Handler
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('masterschetan_saved_articles');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('masterschetan_saved_articles', JSON.stringify(savedIds));
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [savedIds]);

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle URL deep-linking (?article=ID)
  useEffect(() => {
    if (articles.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const articleId = params.get('article');
      if (articleId) {
        const found = articles.find(a => a.id === articleId);
        if (found) {
          setSelectedArticle(found);
        }
      }
    }
  }, [articles]);

  const toggleSaveArticle = (articleId) => {
    setSavedIds(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllArticles();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Unable to load news updates. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Highlights: Top 3 high-impact or recent articles
  const highlights = useMemo(() => {
    const highImpact = articles.filter(a => a.impactLevel === 'High');
    return (highImpact.length >= 3 ? highImpact : articles).slice(0, 3);
  }, [articles]);

  // Client-side filtering logic
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      if (showSavedOnly && !savedIds.includes(article.id)) {
        return false;
      }
      if (activeCategory !== 'All' && article.category !== activeCategory) {
        return false;
      }
      if (activeImpact !== 'All' && article.impactLevel !== activeImpact) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const titleMatch = article.title?.toLowerCase().includes(term);
        const summaryMatch = article.summary?.some(s => s.toLowerCase().includes(term));
        const tagMatch = article.tags?.some(t => t.toLowerCase().includes(term));
        const sourceMatch = article.source?.toLowerCase().includes(term);
        if (!titleMatch && !summaryMatch && !tagMatch && !sourceMatch) return false;
      }
      if (selectedDate && article.curatedDate !== selectedDate) {
        return false;
      }
      return true;
    });
  }, [articles, activeCategory, activeImpact, searchTerm, selectedDate, showSavedOnly, savedIds]);

  // Statistics
  const stats = useMemo(() => {
    const categories = new Set(articles.map(a => a.category));
    const sources = new Set(articles.map(a => a.source));
    const high = articles.filter(a => a.impactLevel === 'High').length;
    return {
      total: articles.length,
      categories: categories.size,
      sources: sources.size,
      high,
    };
  }, [articles]);

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-[#e02020] selection:text-white">
      {/* Masthead Header */}
      <Header
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={setShowSavedOnly}
        savedCount={savedIds.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center mb-8"
          >
            <p className="text-red-700 mb-4 font-bold text-sm">{error}</p>
            <button
              onClick={fetchArticles}
              className="px-6 py-2.5 bg-[#e02020] text-white rounded-xl font-bold hover:bg-[#b91c1c] transition-all shadow-md"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Quick Stats Bar in White Theme */}
        {!isLoading && !error && articles.length > 0 && !showSavedOnly && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {[
              { icon: Newspaper, label: 'Total News Slate', value: stats.total, color: '#e02020', bg: 'bg-red-50' },
              { icon: Flame, label: 'High Impact', value: stats.high, color: '#dc2626', bg: 'bg-rose-50' },
              { icon: BarChart3, label: 'Asset Categories', value: stats.categories, color: '#16a34a', bg: 'bg-emerald-50' },
              { icon: TrendingUp, label: 'Trusted Sources', value: stats.sources, color: '#2563eb', bg: 'bg-blue-50' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-4 flex items-center space-x-3.5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Highlights */}
        {!error && !showSavedOnly && (
          <Highlights
            articles={highlights}
            onArticleClick={handleSelectArticle}
          />
        )}

        {/* PHASE 2 MARKET INTELLIGENCE WIDGETS */}
        {!error && !showSavedOnly && (
          <>
            {/* 1. Sector Performance Heatmap */}
            <SectorHeatmap />

            {/* 2. FII / DII Institutional Flow Widget */}
            <InstitutionalFlows />

            {/* 3. Upcoming Events & RBI Policy Watch Calendar */}
            <EventCalendar />
          </>
        )}

        {/* Section Banner */}
        {!error && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-700 font-black uppercase tracking-widest flex items-center gap-2">
              {showSavedOnly ? (
                <>
                  <Bookmark className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span className="text-amber-700">Bookmarked News ({filteredArticles.length})</span>
                </>
              ) : (
                <span>All Curated Financial News</span>
              )}
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>
        )}

        {/* Search Bar & Date Filter */}
        {!error && (
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}

        {/* Impact Level Pills */}
        {!error && (
          <ImpactFilter
            activeImpact={activeImpact}
            setActiveImpact={setActiveImpact}
            articles={articles}
          />
        )}

        {/* Category Pills */}
        {!error && (
          <CategoryFilter
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            articles={articles}
          />
        )}

        {/* News Feed Grid */}
        <NewsList
          articles={filteredArticles}
          isLoading={isLoading}
          error={error}
          savedIds={savedIds}
          onToggleSave={toggleSaveArticle}
          onArticleClick={handleSelectArticle}
        />
      </main>

      {/* Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={handleCloseModal}
          isSaved={savedIds.includes(selectedArticle.id)}
          onToggleSave={() => toggleSaveArticle(selectedArticle.id)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
