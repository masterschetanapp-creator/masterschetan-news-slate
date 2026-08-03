import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Flame, BarChart3, Bookmark } from 'lucide-react';
import Header from './components/Header';
import Highlights from './components/Highlights';
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

  const handleSelectArticle = (art) => {
    setSelectedArticle(art);
    if (art) {
      const newUrl = `${window.location.pathname}?article=${art.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllArticles();
      setArticles(data);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError('Unable to load news articles. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = (id) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Highlights
  const highlights = useMemo(() => {
    return articles.filter(a => a.impact === 'High').slice(0, 3);
  }, [articles]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { 'All': articles.length };
    articles.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // Impact counts
  const impactCounts = useMemo(() => {
    const counts = { 'All': articles.length, 'High': 0, 'Medium': 0, 'Standard': 0 };
    articles.forEach(a => {
      const imp = a.impact || 'Standard';
      counts[imp] = (counts[imp] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // Stats
  const stats = useMemo(() => {
    const highCount = articles.filter(a => a.impact === 'High').length;
    const categories = new Set(articles.map(a => a.category)).size;
    const sources = new Set(articles.map(a => a.source_name)).size;
    return { total: articles.length, high: highCount, categories, sources };
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    if (showSavedOnly) {
      filtered = filtered.filter(a => savedIds.includes(a.id));
    }

    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }

    if (activeImpact && activeImpact !== 'All') {
      filtered = filtered.filter(a => (a.impact || 'Standard') === activeImpact);
    }

    if (selectedDate) {
      filtered = filtered.filter(a => {
        if (!a.published_at) return false;
        return a.published_at.substring(0, 10) === selectedDate;
      });
    }

    if (searchTerm) {
      filtered = searchArticles(filtered, searchTerm);
    }

    return filtered;
  }, [articles, activeCategory, activeImpact, searchTerm, selectedDate, showSavedOnly, savedIds]);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedDate('');
    setActiveCategory('All');
    setActiveImpact('All');
    setShowSavedOnly(false);
  };

  return (
    <div className="min-h-screen relative">
      <Header
        savedCount={savedIds.length}
        showSavedOnly={showSavedOnly}
        onToggleSaved={() => setShowSavedOnly(prev => !prev)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
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

        {/* Category Filters */}
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setShowSavedOnly(false);
          }}
          categoryCounts={categoryCounts}
        />

        {/* Impact Filter */}
        <ImpactFilter
          activeImpact={activeImpact}
          onImpactChange={setActiveImpact}
          impactCounts={impactCounts}
        />

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onClear={handleClear}
        />

        {/* Article Count */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Showing <span className="text-slate-900 font-black tabular-nums">{filteredArticles.length}</span> article{filteredArticles.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' && (
                <span className="text-slate-500"> in <span className="text-red-600 font-bold">{activeCategory}</span></span>
              )}
              {activeImpact !== 'All' && (
                <span className="text-slate-500"> with <span className="text-red-600 font-bold">{activeImpact} Impact</span></span>
              )}
            </p>
          </div>
        )}

        {/* News Grid List */}
        {!error && (
          <NewsList
            articles={filteredArticles}
            isLoading={isLoading}
            onArticleClick={handleSelectArticle}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        )}
      </main>

      <Footer />

      {/* Interactive Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={handleCloseArticle}
          isSaved={savedIds.includes(selectedArticle.id)}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
}

export default App;
