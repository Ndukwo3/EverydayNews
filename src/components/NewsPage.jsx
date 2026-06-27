import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchArticles as apiFetchArticles,
  fetchFlashNews as apiFetchFlashNews,
  fetchTrendingArticles as apiFetchTrendingArticles,
  fetchEditorsPicks as apiFetchEditorsPicks,
  fetchStoryArticles as apiFetchStoryArticles
} from '../lib/api';
import FlashTicker from './FlashTicker';
import Header from './Header';
import NewsGrid from './NewsGrid';
import Footer from './Footer';
import CNNLivePlayer from './CNNLivePlayer';
import './LiveSection.css';
import '../App.css';

export default function NewsPage({ defaultCategory = 'ALL' }) {
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const [articles, setArticles] = useState(() => {
    const cached = localStorage.getItem('everyday_news_articles');
    return cached ? JSON.parse(cached) : [];
  });
  const [flashNews, setFlashNews] = useState(() => {
    const cached = localStorage.getItem('everyday_news_flash');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    const cached = localStorage.getItem('everyday_news_articles');
    return !cached;
  });

  const categories = ['NEWS', 'BUSINESS', 'FINANCE', 'SPORT', 'TRAVEL', 'TECH', 'ENTERTAINMENT'];

  // Sync state if routing changes defaultCategory prop
  useEffect(() => {
    setActiveCategory(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [dbArticles, dbTrending, dbEditors, dbStories] = await Promise.all([
          apiFetchArticles().catch(() => []),
          apiFetchTrendingArticles().catch(() => []),
          apiFetchEditorsPicks().catch(() => []),
          apiFetchStoryArticles().catch(() => [])
        ]);

        if (!cancelled) {
          const normalizedArticles = dbArticles.map(a => ({
            id: String(a.id),
            title: a.title,
            excerpt: a.excerpt,
            category: a.category ? a.category.toUpperCase() : 'NEWS',
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: { name: a.author_name, avatar: a.author_avatar },
            image: a.image_url,
            featured: false,
            _source: 'supabase',
            created_at: a.created_at,
            body: a.body
          }));

          const normalizedTrending = dbTrending.map(a => ({
            id: `tr-${a.id}`,
            title: a.title,
            excerpt: a.excerpt,
            category: a.category ? a.category.toUpperCase() : 'NEWS',
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: { name: a.author_name, avatar: a.author_avatar },
            image: a.image_url,
            featured: false,
            _source: 'supabase',
            created_at: a.created_at,
            body: a.body
          }));

          const normalizedEditors = dbEditors.map(a => ({
            id: `ep-${a.id}`,
            title: a.title,
            excerpt: a.excerpt,
            category: a.category ? a.category.toUpperCase() : 'NEWS',
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: { name: a.author_name, avatar: a.author_avatar },
            image: a.image_url,
            featured: false,
            _source: 'supabase',
            created_at: a.created_at,
            body: a.body
          }));

          const normalizedStories = dbStories.map(a => ({
            id: `story-${a.id}`,
            title: a.title,
            excerpt: a.excerpt,
            category: 'NEWS', // Default stories category to NEWS or ALL so they show up under news/stories
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: { name: a.author_name || 'Staff Reporter', avatar: a.author_avatar },
            image: a.image_url,
            featured: false,
            _source: 'supabase',
            created_at: a.created_at,
            body: a.excerpt
          }));

          // Merge all articles
          const combined = [
            ...normalizedArticles,
            ...normalizedTrending,
            ...normalizedEditors,
            ...normalizedStories
          ];

          setArticles(combined);
          localStorage.setItem('everyday_news_articles', JSON.stringify(combined));

          // Generate interactive flash items from hidden articles (require "Load More" to be seen)
          const nonFeatured = combined.filter(a => !a.featured);
          let hiddenArticles = nonFeatured.slice(6);
          if (hiddenArticles.length < 3) {
            hiddenArticles = combined;
          }
          const flash = hiddenArticles.map(a => ({ id: String(a.id), text: a.title }));
          setFlashNews(flash);
          localStorage.setItem('everyday_news_flash', JSON.stringify(flash));
        }
      } catch (err) {
        console.error("Failed to load articles in NewsPage:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
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

  const handleArticleClick = (article) => {
    if (article?.id) navigate(`/article/${article.id}`);
  };

  const CNN_EMBED_URL = 'https://www.youtube.com/embed/live_stream?channel=UCupvZG-5ko_eiXAupbDfxWw&autoplay=1&mute=1';

  const pageTitle = activeCategory === 'ALL' ? 'All News & Stories' : `${activeCategory} News & Stories`;
  const pageSubtitle = activeCategory === 'ALL'
    ? 'Explore complete archive of published reports'
    : `Explore latest updates in ${activeCategory.toLowerCase()}`;

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

      <main className="main-content" style={{ padding: '0 2rem' }}>
        
        {/* CNN Live Stream */}
        {(activeCategory === 'ALL' || activeCategory === 'NEWS') && (
          <div className="live-hub-container" style={{ margin: '2rem auto', maxWidth: '1200px' }}>
            <div className="live-player-wrapper">
              <CNNLivePlayer />
              <div className="live-player-badge">
                <span className="live-pulse-dot"></span>
                LIVE · CNN International
              </div>
            </div>
          </div>
        )}

        <div className="section-header" style={{ maxWidth: '1200px', margin: '2rem auto' }}>
          <div className="title-group">
            <h1 className="main-title">{pageTitle}</h1>
            <span className="subtitle">{pageSubtitle}</span>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto 4rem auto' }}>
          {isLoading ? (
            <div className="news-skeleton-wrapper">
              <div className="skeleton-grid">
                {[1, 2, 3, 4, 5, 6].map(n => (
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
              <p>Try switching to another category or clearing your search.</p>
            </div>
          ) : (
            <NewsGrid
              articles={searchedArticles}
              onArticleClick={handleArticleClick}
            />
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
