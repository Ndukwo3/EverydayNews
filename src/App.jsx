import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { mockFlashNews, mockArticles, mockStocks, mockEditorsPicks, mockLiveBanner, mockTrendingArticles, mockStorySection } from './newsData';
import { fetchArticles as apiFetchArticles, fetchFlashNews as apiFetchFlashNews, fetchTrendingArticles as apiFetchTrendingArticles, fetchEditorsPicks as apiFetchEditorsPicks, fetchStoryArticles as apiFetchStoryArticles, logVisit } from './lib/api';
import { useAuth } from './context/AuthContext';
import FlashTicker from './components/FlashTicker';
import Header from './components/Header';
import NewsGrid from './components/NewsGrid';
import FinanceWidget from './components/FinanceWidget';
import LiveScoresWidget from './components/LiveScoresWidget';
import EditorsPick from './components/EditorsPick';
import LiveSection from './components/LiveSection';
import StorySection from './components/StorySection';
import Footer from './components/Footer';
import ArticlePage from './components/ArticlePage';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import NewsPage from './components/NewsPage';
import { Clock, Sparkles, X, Eye, EyeOff } from 'lucide-react';
import './App.css';

// Helper to interleave/mix articles from different categories to ensure home page diversity
function mixArticlesByCategory(articlesList) {
  if (!articlesList || articlesList.length === 0) return [];
  
  // Group articles by category
  const groups = {};
  articlesList.forEach(art => {
    const cat = art.category || 'NEWS';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(art);
  });
  
  // Interleave the grouped articles
  const mixed = [];
  const categories = Object.keys(groups);
  let hasMore = true;
  let index = 0;
  
  while (hasMore) {
    hasMore = false;
    categories.forEach(cat => {
      if (groups[cat][index]) {
        mixed.push(groups[cat][index]);
        hasMore = true;
      }
    });
    index++;
  }
  
  return mixed;
}

// ── Homepage ──────────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stale-While-Revalidate Caching for instant page loads
  const [articles, setArticles] = useState(() => {
    const cached = localStorage.getItem('everyday_news_articles');
    return cached ? JSON.parse(cached) : [];
  });
  const [flashNews, setFlashNews] = useState(() => {
    const cached = localStorage.getItem('everyday_news_flash');
    return cached ? JSON.parse(cached) : [];
  });
  const [trendingArticles, setTrendingArticles] = useState(() => {
    const cached = localStorage.getItem('everyday_news_trending');
    return cached ? JSON.parse(cached) : mockTrendingArticles;
  });
  const [editorsPicks, setEditorsPicks] = useState(() => {
    const cached = localStorage.getItem('everyday_news_editors');
    return cached ? JSON.parse(cached) : mockEditorsPicks;
  });
  const [storySection, setStorySection] = useState(() => {
    const cached = localStorage.getItem('everyday_news_stories');
    return cached ? JSON.parse(cached) : mockStorySection;
  });
  
  const [stocks] = useState(mockStocks);
  
  // Always show loading shimmer while fetching the latest news
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['NEWS', 'BUSINESS', 'FINANCE', 'SPORT', 'TRAVEL', 'TECH', 'ENTERTAINMENT'];

  // ─── Load articles + flash news from Supabase on mount ───
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // Re-evaluate loading state based on cache presence
      const cached = localStorage.getItem('everyday_news_articles');
      if (!cached) {
        setIsLoading(true);
      }

      try {
        const dbArticles = await apiFetchArticles();
        if (!cancelled && dbArticles.length > 0) {
          // Normalize Supabase columns to shape components expect
          const normalized = dbArticles.map(a => ({
            id: a.id,
            title: a.title,
            excerpt: a.excerpt,
            category: a.category,
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: {
              name: a.author_name,
              avatar: a.author_avatar
            },
            image: a.image_url,
            featured: a.featured,
            _source: 'supabase',
            created_at: a.created_at,
            body: a.body
          }));
          const mixedArticles = mixArticlesByCategory(normalized);
          setArticles(mixedArticles);
          localStorage.setItem('everyday_news_articles', JSON.stringify(mixedArticles));
          
          // Generate interactive flash items from hidden articles (require "Load More" to be seen)
          const nonFeatured = normalized.filter(a => !a.featured);
          let hiddenArticles = nonFeatured.slice(6);
          if (hiddenArticles.length < 3) {
            hiddenArticles = normalized;
          }
          const flash = hiddenArticles.map(a => ({ id: String(a.id), text: a.title }));
          setFlashNews(flash);
          localStorage.setItem('everyday_news_flash', JSON.stringify(flash));
        }
      } catch (err) {
        console.error("Failed to load articles from Supabase:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }


      try {
        const dbTrending = await apiFetchTrendingArticles();
        if (!cancelled && dbTrending.length > 0) {
          const normalized = dbTrending.map(a => ({
            id: `tr-${a.id}`,
            title: a.title,
            excerpt: a.excerpt,
            category: a.category,
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: {
              name: a.author_name,
              avatar: a.author_avatar
            },
            image: a.image_url,
            active: a.active,
            _source: 'supabase',
            created_at: a.created_at,
            body: a.body
          }));
          setTrendingArticles(normalized);
          localStorage.setItem('everyday_news_trending', JSON.stringify(normalized));
        }
      } catch (err) {
        console.warn("Failed to load trending articles from Supabase (using mock/cached):", err);
      }

      try {
        const dbEditors = await apiFetchEditorsPicks();
        if (!cancelled && dbEditors.length > 0) {
          const normalized = dbEditors.map(a => ({
            id: `ep-${a.id}`,
            title: a.title,
            excerpt: a.excerpt,
            category: a.category,
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: {
              name: a.author_name,
              avatar: a.author_avatar
            },
            image: a.image_url,
            featured: a.featured,
            active: a.active,
            _source: 'supabase',
            created_at: a.created_at,
            body: a.body
          }));
          setEditorsPicks(normalized);
          localStorage.setItem('everyday_news_editors', JSON.stringify(normalized));
        }
      } catch (err) {
        console.warn("Failed to load editor's picks from Supabase (using mock/cached):", err);
      }

      try {
        const dbStories = await apiFetchStoryArticles();
        if (!cancelled && dbStories.length > 0) {
          const dbFeatured = dbStories.find(a => a.featured) || dbStories[0];
          const dbList = dbStories.filter(a => a.id !== dbFeatured?.id);
          
          const normalized = {
            tag: "STORY:",
            tagHighlight: "TRENDING",
            moreLabel: "CONTINUE READING STORIES...",
            featured: dbFeatured ? {
              id: `story-${dbFeatured.id}`,
              title: dbFeatured.title,
              excerpt: dbFeatured.excerpt,
              image: dbFeatured.image_url,
              author: {
                name: dbFeatured.author_name || 'Staff Reporter',
                role: dbFeatured.author_role || 'Writer',
                avatar: dbFeatured.author_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
              },
              date: new Date(dbFeatured.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
              created_at: dbFeatured.created_at,
              body: dbFeatured.excerpt
            } : mockStorySection.featured,
            articles: dbList.slice(0, 6).map(a => ({
              id: `story-${a.id}`,
              title: a.title,
              image: a.image_url,
              views: a.views_count || '0',
              comments: a.comments_count || '0',
              created_at: a.created_at,
              body: a.excerpt
            }))
          };
          setStorySection(normalized);
          localStorage.setItem('everyday_news_stories', JSON.stringify(normalized));
        }
      } catch (err) {
        console.warn("Failed to load story articles from Supabase (using mock/cached):", err);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const filteredArticles = activeCategory === 'ALL'
    ? articles
    : articles.filter(art => art.category.toUpperCase() === activeCategory);

  const searchedArticles = searchQuery.trim() === ''
    ? filteredArticles
    : filteredArticles.filter(art => 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (art.excerpt && art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Navigate to article page instead of opening modal
  const handleArticleClick = (article) => {
    if (article?.id) navigate(`/article/${article.id}`);
  };

  return (
    <div className="app-container">

      <FlashTicker items={flashNews} />

      <Header
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onLoginClick={() => openLoginModal('login')}
        onSearchChange={setSearchQuery}
      />

      <main className="main-content">

        <div className="section-header">
          <div className="title-group">
            <h1 className="main-title">Today's News</h1>
            <span className="subtitle">Real-time updates curated for you</span>
          </div>
        </div>

        <div className="content-layout">

          <div className="left-news-column">
            {isLoading ? (
              <div className="news-skeleton-wrapper">
                {/* Shimmering Featured Loader */}
                <div className="skeleton-featured">
                  <div className="skeleton-featured-content">
                    <div className="skeleton-badge skeleton-loading"></div>
                    <div className="skeleton-title-large skeleton-loading"></div>
                    <div className="skeleton-title-medium skeleton-loading"></div>
                    <div className="skeleton-text-block skeleton-loading"></div>
                  </div>
                  <div className="skeleton-image skeleton-loading"></div>
                </div>
                {/* Shimmering Grid Loaders */}
                <div className="skeleton-grid">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="skeleton-card">
                      <div className="skeleton-card-img skeleton-loading"></div>
                      <div className="skeleton-card-body">
                        <div className="skeleton-badge skeleton-loading"></div>
                        <div className="skeleton-title-medium skeleton-loading"></div>
                        <div className="skeleton-meta skeleton-loading"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchedArticles.length === 0 ? (
              <div className="empty-state">
                <h3>No articles found</h3>
                <p>Try switching to another category, clearing your search, or checking back later!</p>
              </div>
            ) : (
              <NewsGrid
                articles={searchedArticles}
                onArticleClick={handleArticleClick}
              />
            )}
          </div>

          <aside className="right-sidebar-column">
            <LiveScoresWidget />
            <FinanceWidget />
          </aside>

        </div>

        <EditorsPick articles={editorsPicks} onArticleClick={handleArticleClick} />
        <LiveSection banner={mockLiveBanner} articles={trendingArticles.slice(0, 8)} onArticleClick={handleArticleClick} />
        <StorySection data={storySection} onArticleClick={handleArticleClick} />

      </main>

      <Footer />

    </div>
  );
}

// ── App Router ────────────────────────────────────────────
export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Generate/retrieve Session ID
    let sid = localStorage.getItem('newsSessionId');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('newsSessionId', sid);
    }
    // Log the page visit to Supabase
    logVisit(location.pathname, sid);
    
    // Reset scroll position to top on navigation
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/news" element={<NewsPage defaultCategory="NEWS" />} />
        <Route path="/business" element={<NewsPage defaultCategory="BUSINESS" />} />
        <Route path="/finance" element={<NewsPage defaultCategory="FINANCE" />} />
        <Route path="/sport" element={<NewsPage defaultCategory="SPORT" />} />
        <Route path="/travel" element={<NewsPage defaultCategory="TRAVEL" />} />
        <Route path="/tech" element={<NewsPage defaultCategory="TECH" />} />
        <Route path="/entertainment" element={<NewsPage defaultCategory="ENTERTAINMENT" />} />
      </Routes>
      <LoginModal />
    </>
  );
}