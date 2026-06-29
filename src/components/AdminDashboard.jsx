import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchAllFlashNews,
  createFlashNews,
  updateFlashNews,
  deleteFlashNews,
  fetchAllTrendingArticles,
  createTrendingArticle,
  updateTrendingArticle,
  deleteTrendingArticle,
  fetchAllEditorsPicks,
  createEditorsPick,
  updateEditorsPick,
  deleteEditorsPick,
  fetchAllStoryArticles,
  createStoryArticle,
  updateStoryArticle,
  deleteStoryArticle,
  fetchAnalyticsSummary
} from '../lib/api';
import './AdminDashboard.css';

const CATEGORIES = ['NEWS', 'BUSINESS', 'FINANCE', 'SPORT', 'TRAVEL', 'TECH', 'ENTERTAINMENT', 'POLITICS', 'FEATURED'];

const EMPTY_ARTICLE = {
  title: '',
  excerpt: '',
  body: '',
  category: 'NEWS',
  image_url: '',
  author_name: '',
  author_avatar: '',
  author_bio: '',
  featured: false
};

export default function AdminDashboard() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Navigation
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Articles state
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [editingArticle, setEditingArticle] = useState(null); // null = list view, object = editing
  const [articleForm, setArticleForm] = useState({ ...EMPTY_ARTICLE });
  const [savingArticle, setSavingArticle] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Flash news state
  const [flashItems, setFlashItems] = useState([]);
  const [loadingFlash, setLoadingFlash] = useState(true);
  const [newFlashText, setNewFlashText] = useState('');
  const [savingFlash, setSavingFlash] = useState(false);

  // Trending articles state
  const [trendingItems, setTrendingItems] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [editingTrending, setEditingTrending] = useState(null); // null = list view, id/'new' = editing
  const [trendingForm, setTrendingForm] = useState({
    title: '',
    excerpt: '',
    category: 'NEWS',
    image_url: '',
    author_name: '',
    author_avatar: '',
    active: true
  });
  const [savingTrending, setSavingTrending] = useState(false);
  const [deleteTrendingConfirmId, setDeleteTrendingConfirmId] = useState(null);
  const [trendingError, setTrendingError] = useState(false);

  // Editor's picks state
  const [editorsPicksItems, setEditorsPicksItems] = useState([]);
  const [loadingEditorsPicks, setLoadingEditorsPicks] = useState(true);
  const [editingEditorsPick, setEditingEditorsPick] = useState(null); // null = list view, id/'new' = editing
  const [editorsPickForm, setEditorsPickForm] = useState({
    title: '',
    excerpt: '',
    category: 'NEWS',
    image_url: '',
    author_name: '',
    author_avatar: '',
    featured: false,
    active: true
  });
  const [savingEditorsPick, setSavingEditorsPick] = useState(false);
  const [deleteEditorsPickConfirmId, setDeleteEditorsPickConfirmId] = useState(null);
  const [editorsPickError, setEditorsPickError] = useState(false);

  // Story section state
  const [storyArticlesItems, setStoryArticlesItems] = useState([]);
  const [loadingStoryArticles, setLoadingStoryArticles] = useState(true);
  const [editingStoryArticle, setEditingStoryArticle] = useState(null); // null = list view, id/'new' = editing
  const [storyArticleForm, setStoryArticleForm] = useState({
    title: '',
    excerpt: '',
    image_url: '',
    author_name: '',
    author_avatar: '',
    author_role: 'Writer',
    featured: false,
    views_count: '0',
    comments_count: '0',
    active: true
  });
  const [savingStoryArticle, setSavingStoryArticle] = useState(false);
  const [deleteStoryArticleConfirmId, setDeleteStoryArticleConfirmId] = useState(null);
  const [storyArticleError, setStoryArticleError] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Load data ───
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAnalytics();
    loadArticles();
    loadFlashNews();
    loadTrendingArticles();
    loadEditorsPicks();
    loadStoryArticles();
  }, [isAuthenticated]);

  async function loadAnalytics() {
    setLoadingAnalytics(true);
    try {
      const data = await fetchAnalyticsSummary();
      setAnalytics(data);
    } catch (err) {
      showToast('Failed to load analytics: ' + err.message, 'error');
    }
    setLoadingAnalytics(false);
  }

  async function loadArticles() {
    setLoadingArticles(true);
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (err) {
      showToast('Failed to load articles: ' + err.message, 'error');
    }
    setLoadingArticles(false);
  }

  async function loadFlashNews() {
    setLoadingFlash(true);
    try {
      const data = await fetchAllFlashNews();
      setFlashItems(data);
    } catch (err) {
      showToast('Failed to load flash news: ' + err.message, 'error');
    }
    setLoadingFlash(false);
  }

  async function loadTrendingArticles() {
    setLoadingTrending(true);
    setTrendingError(false);
    try {
      const data = await fetchAllTrendingArticles();
      setTrendingItems(data);
    } catch (err) {
      if (err.message?.includes("trending_articles") || err.code === 'PGRST205') {
        setTrendingError(true);
      } else {
        showToast('Failed to load trending articles: ' + err.message, 'error');
      }
    }
    setLoadingTrending(false);
  }

  async function loadEditorsPicks() {
    setLoadingEditorsPicks(true);
    setEditorsPickError(false);
    try {
      const data = await fetchAllEditorsPicks();
      setEditorsPicksItems(data);
    } catch (err) {
      if (err.message?.includes("editors_picks") || err.code === 'PGRST205') {
        setEditorsPickError(true);
      } else {
        showToast('Failed to load editor\'s picks: ' + err.message, 'error');
      }
    }
    setLoadingEditorsPicks(false);
  }

  async function loadStoryArticles() {
    setLoadingStoryArticles(true);
    setStoryArticleError(false);
    try {
      const data = await fetchAllStoryArticles();
      setStoryArticlesItems(data);
    } catch (err) {
      if (err.message?.includes("story_articles") || err.code === 'PGRST205') {
        setStoryArticleError(true);
      } else {
        showToast('Failed to load stories: ' + err.message, 'error');
      }
    }
    setLoadingStoryArticles(false);
  }

  // ─── Article CRUD handlers ───
  const handleNewArticle = () => {
    setArticleForm({ ...EMPTY_ARTICLE });
    setEditingArticle('new');
  };

  const handleEditArticle = (article) => {
    setArticleForm({
      title: article.title || '',
      excerpt: article.excerpt || '',
      body: article.body || '',
      category: article.category || 'NEWS',
      image_url: article.image_url || '',
      author_name: article.author_name || '',
      author_avatar: article.author_avatar || '',
      author_bio: article.author_bio || '',
      featured: article.featured || false
    });
    setEditingArticle(article.id);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSavingArticle(true);
    try {
      if (editingArticle === 'new') {
        await createArticle(articleForm);
        showToast('Article published successfully!');
      } else {
        await updateArticle(editingArticle, articleForm);
        showToast('Article updated successfully!');
      }
      setEditingArticle(null);
      await loadArticles();
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    }
    setSavingArticle(false);
  };

  const handleDeleteArticle = async (id) => {
    try {
      await deleteArticle(id);
      showToast('Article deleted');
      setDeleteConfirmId(null);
      await loadArticles();
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error');
    }
  };

  // ─── Flash News handlers ───
  const handleAddFlash = async (e) => {
    e.preventDefault();
    if (!newFlashText.trim()) return;
    setSavingFlash(true);
    try {
      await createFlashNews(newFlashText);
      setNewFlashText('');
      showToast('Flash news added!');
      await loadFlashNews();
    } catch (err) {
      showToast('Failed to add: ' + err.message, 'error');
    }
    setSavingFlash(false);
  };

  const handleToggleFlash = async (item) => {
    try {
      await updateFlashNews(item.id, { active: !item.active });
      await loadFlashNews();
    } catch (err) {
      showToast('Failed to update: ' + err.message, 'error');
    }
  };

  const handleDeleteFlash = async (id) => {
    try {
      await deleteFlashNews(id);
      showToast('Flash news removed');
      await loadFlashNews();
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error');
    }
  };

  // ─── Trending Articles CRUD handlers ───
  const handleNewTrending = () => {
    setTrendingForm({
      title: '',
      excerpt: '',
      category: 'NEWS',
      image_url: '',
      author_name: '',
      author_avatar: '',
      active: true
    });
    setEditingTrending('new');
  };

  const handleEditTrending = (item) => {
    setTrendingForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      category: item.category || 'NEWS',
      image_url: item.image_url || '',
      author_name: item.author_name || '',
      author_avatar: item.author_avatar || '',
      active: item.active !== undefined ? item.active : true
    });
    setEditingTrending(item.id);
  };

  const handleSaveTrending = async (e) => {
    e.preventDefault();
    if (!trendingForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSavingTrending(true);
    try {
      if (editingTrending === 'new') {
        await createTrendingArticle(trendingForm);
        showToast('Trending article added successfully!');
      } else {
        await updateTrendingArticle(editingTrending, trendingForm);
        showToast('Trending article updated successfully!');
      }
      setEditingTrending(null);
      await loadTrendingArticles();
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    }
    setSavingTrending(false);
  };

  const handleToggleTrendingActive = async (item) => {
    try {
      await updateTrendingArticle(item.id, { active: !item.active });
      await loadTrendingArticles();
    } catch (err) {
      showToast('Failed to update: ' + err.message, 'error');
    }
  };

  const handleDeleteTrending = async (id) => {
    try {
      await deleteTrendingArticle(id);
      showToast('Trending article deleted');
      setDeleteTrendingConfirmId(null);
      await loadTrendingArticles();
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error');
    }
  };

  // ─── Editor's Picks CRUD handlers ───
  const handleNewEditorsPick = () => {
    setEditorsPickForm({
      title: '',
      excerpt: '',
      category: 'NEWS',
      image_url: '',
      author_name: '',
      author_avatar: '',
      featured: false,
      active: true
    });
    setEditingEditorsPick('new');
  };

  const handleEditEditorsPick = (item) => {
    setEditorsPickForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      category: item.category || 'NEWS',
      image_url: item.image_url || '',
      author_name: item.author_name || '',
      author_avatar: item.author_avatar || '',
      featured: item.featured || false,
      active: item.active !== undefined ? item.active : true
    });
    setEditingEditorsPick(item.id);
  };

  const handleSaveEditorsPick = async (e) => {
    e.preventDefault();
    if (!editorsPickForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSavingEditorsPick(true);
    try {
      if (editingEditorsPick === 'new') {
        await createEditorsPick(editorsPickForm);
        showToast('Editor\'s pick added successfully!');
      } else {
        await updateEditorsPick(editingEditorsPick, editorsPickForm);
        showToast('Editor\'s pick updated successfully!');
      }
      setEditingEditorsPick(null);
      await loadEditorsPicks();
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    }
    setSavingEditorsPick(false);
  };

  const handleToggleEditorsPickActive = async (item) => {
    try {
      await updateEditorsPick(item.id, { active: !item.active });
      await loadEditorsPicks();
    } catch (err) {
      showToast('Failed to update: ' + err.message, 'error');
    }
  };

  const handleDeleteEditorsPick = async (id) => {
    try {
      await deleteEditorsPick(id);
      showToast('Editor\'s pick deleted');
      setDeleteEditorsPickConfirmId(null);
      await loadEditorsPicks();
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error');
    }
  };

  // ─── Stories CRUD handlers ───
  const handleNewStoryArticle = () => {
    setStoryArticleForm({
      title: '',
      excerpt: '',
      image_url: '',
      author_name: '',
      author_avatar: '',
      author_role: 'Writer',
      featured: false,
      views_count: '0',
      comments_count: '0',
      active: true
    });
    setEditingStoryArticle('new');
  };

  const handleEditStoryArticle = (item) => {
    setStoryArticleForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      image_url: item.image_url || '',
      author_name: item.author_name || '',
      author_avatar: item.author_avatar || '',
      author_role: item.author_role || 'Writer',
      featured: item.featured || false,
      views_count: item.views_count || '0',
      comments_count: item.comments_count || '0',
      active: item.active !== undefined ? item.active : true
    });
    setEditingStoryArticle(item.id);
  };

  const handleSaveStoryArticle = async (e) => {
    e.preventDefault();
    if (!storyArticleForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSavingStoryArticle(true);
    try {
      if (editingStoryArticle === 'new') {
        await createStoryArticle(storyArticleForm);
        showToast('Story added successfully!');
      } else {
        await updateStoryArticle(editingStoryArticle, storyArticleForm);
        showToast('Story updated successfully!');
      }
      setEditingStoryArticle(null);
      await loadStoryArticles();
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    }
    setSavingStoryArticle(false);
  };

  const handleToggleStoryArticleActive = async (item) => {
    try {
      await updateStoryArticle(item.id, { active: !item.active });
      await loadStoryArticles();
    } catch (err) {
      showToast('Failed to update: ' + err.message, 'error');
    }
  };

  const handleDeleteStoryArticle = async (id) => {
    try {
      await deleteStoryArticle(id);
      showToast('Story deleted');
      setDeleteStoryArticleConfirmId(null);
      await loadStoryArticles();
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error');
    }
  };

  // ─── Auth guard ───
  const isAdmin = isAuthenticated && user?.email === 'ndukwovictor3@gmail.com';

  if (!isAdmin) {
    return (
      <div className="admin-auth-guard">
        <div className="admin-auth-card">
          <div className="admin-lock-icon">🔒</div>
          <h2>Admin Access Required</h2>
          <p>Please sign in with the admin account to access the dashboard.</p>
          <button className="admin-btn-primary" onClick={() => navigate('/')}>
            ← Go to Homepage & Sign In
          </button>
        </div>
      </div>
    );
  }

  // ─── Analytics Helpers ───
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const visitsByDate = last7Days.map(date => {
    const dayVisits = analytics?.recentVisits?.filter(v => v.created_at.startsWith(date)) || [];
    const label = new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    return { date, label, count: dayVisits.length };
  });

  const maxVisits = Math.max(...visitsByDate.map(d => d.count), 5);

  const categoryViews = {};
  const allArticlesList = [...articles, ...trendingItems, ...editorsPicksItems, ...storyArticlesItems];
  
  // Count the actual articles published in each category (this shows content distribution)
  allArticlesList.forEach(art => {
    const cat = art.category || 'NEWS';
    categoryViews[cat] = (categoryViews[cat] || 0) + 1;
  });

  const categoryChartData = Object.entries(categoryViews)
    .map(([category, views]) => ({ category, views }))
    .sort((a, b) => b.views - a.views) // Sort by most articles first
    .slice(0, 6);

  const maxCategoryViews = Math.max(...categoryChartData.map(c => c.views), 5);

  // ─── RENDER ───
  return (
    <div className="admin-dashboard">

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-logo">
            <span className="admin-logo-icon">⚡</span>
            Everyday News
          </h2>
          <span className="admin-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
            Overview
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => { setActiveTab('articles'); setEditingArticle(null); }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Articles
            <span className="admin-nav-count">{articles.length}</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => { setActiveTab('trending'); setEditingTrending(null); }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 6l-9.5 9.5-5-5L1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            Trending Articles
            {!trendingError && <span className="admin-nav-count">{trendingItems.length}</span>}
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'editors_picks' ? 'active' : ''}`}
            onClick={() => { setActiveTab('editors_picks'); setEditingEditorsPick(null); }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Editor's Picks
            {!editorsPickError && <span className="admin-nav-count">{editorsPicksItems.length}</span>}
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stories'); setEditingStoryArticle(null); }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Stories
            {!storyArticleError && <span className="admin-nav-count">{storyArticlesItems.length}</span>}
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'flash' ? 'active' : ''}`}
            onClick={() => setActiveTab('flash')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Flash News
            <span className="admin-nav-count">{flashItems.length}</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-email">{user?.email}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <div className="admin-sidebar-actions">
            <button className="admin-btn-ghost" onClick={() => navigate('/')}>
              ← Site
            </button>
            <button className="admin-btn-ghost danger" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        {/* ════════ OVERVIEW/ANALYTICS TAB ════════ */}
        {activeTab === 'overview' && (
          <>
            <header className="admin-page-header">
              <div>
                <h1 className="admin-page-title">Dashboard Overview</h1>
                <p className="admin-page-subtitle">Real-time traffic and operations analytics</p>
              </div>
              <button className="admin-btn-primary" onClick={loadAnalytics} disabled={loadingAnalytics}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                {loadingAnalytics ? 'Refreshing...' : 'Refresh Stats'}
              </button>
            </header>

            {loadingAnalytics && !analytics ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <p>Loading analytics…</p>
              </div>
            ) : (
              <div className="admin-analytics-grid">
                
                {/* 1. KPI Cards */}
                <div className="analytics-kpis">
                  <div className="kpi-card">
                    <div className="kpi-icon blue">👁</div>
                    <div className="kpi-info">
                      <span className="kpi-value">{analytics?.totalViews.toLocaleString()}</span>
                      <span className="kpi-label">Total Views</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon green">👤</div>
                    <div className="kpi-info">
                      <span className="kpi-value">{analytics?.uniqueVisitors.toLocaleString()}</span>
                      <span className="kpi-label">Unique Visitors</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon red">✍</div>
                    <div className="kpi-info">
                      <span className="kpi-value">{analytics?.totalArticles.toLocaleString()}</span>
                      <span className="kpi-label">Total Articles</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon purple">💬</div>
                    <div className="kpi-info">
                      <span className="kpi-value">{analytics?.totalComments.toLocaleString()}</span>
                      <span className="kpi-label">Total Comments</span>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive SVG Charts */}
                <div className="analytics-charts-row">
                  {/* Traffic Line Chart */}
                  <div className="analytics-chart-box card-trend">
                    <h3 className="chart-box-title">7-Day Traffic Trend</h3>
                    <div className="chart-container-svg">
                      <svg viewBox="0 0 500 220" className="svg-trend-chart">
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(225, 29, 72, 0.4)" />
                            <stop offset="100%" stopColor="rgba(225, 29, 72, 0.0)" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1" />
                        
                        {/* Grid labels Y */}
                        <text x="15" y="24" fontSize="10" fill="#94a3b8" textAnchor="middle">{Math.round(maxVisits)}</text>
                        <text x="15" y="74" fontSize="10" fill="#94a3b8" textAnchor="middle">{Math.round(maxVisits * 0.66)}</text>
                        <text x="15" y="124" fontSize="10" fill="#94a3b8" textAnchor="middle">{Math.round(maxVisits * 0.33)}</text>
                        <text x="15" y="174" fontSize="10" fill="#94a3b8" textAnchor="middle">0</text>

                        {/* Generate points path */}
                        {(() => {
                          const points = visitsByDate.map((day, idx) => {
                            const x = 40 + idx * ((480 - 40) / 6);
                            const y = 170 - (day.count / maxVisits) * 140;
                            return { x, y };
                          });
                          const pathD = points.reduce((acc, p, idx) => 
                            idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, ''
                          );
                          const areaD = `${pathD} L ${points[points.length-1].x} 170 L ${points[0].x} 170 Z`;
                          
                          return (
                            <>
                              {/* Filled Area */}
                              <path d={areaD} fill="url(#trendGrad)" />
                              {/* Line */}
                              <path d={pathD} fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Data Points */}
                              {points.map((p, idx) => (
                                <g key={idx} className="chart-dot-group">
                                  <circle cx={p.x} cy={p.y} r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="2" className="chart-dot" />
                                  <circle cx={p.x} cy={p.y} r="10" fill="transparent" className="chart-hover-trigger" />
                                  <text x={p.x} y={p.y - 12} fontSize="10" fontWeight="700" fill="#1e293b" textAnchor="middle" className="chart-point-value">
                                    {visitsByDate[idx].count}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}

                        {/* Grid labels X */}
                        {visitsByDate.map((day, idx) => {
                          const x = 40 + idx * ((480 - 40) / 6);
                          return (
                            <text key={idx} x={x} y="195" fontSize="10" fontWeight="600" fill="#64748b" textAnchor="middle">
                              {day.label}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Category Distribution bar chart */}
                  <div className="analytics-chart-box card-categories">
                    <h3 className="chart-box-title">Articles by Category</h3>
                    <div className="chart-container-svg">
                      {categoryChartData.length === 0 ? (
                        <div className="admin-empty-small">No category articles logged yet.</div>
                      ) : (
                        <svg viewBox="0 0 420 220" className="svg-bar-chart">
                          {categoryChartData.map((item, idx) => {
                            const barWidth = 28;
                            const gap = 30;
                            const offsetLeft = 40;
                            const x = offsetLeft + idx * (barWidth + gap);
                            const barHeight = (item.views / maxCategoryViews) * 130;
                            const y = 160 - barHeight;

                            return (
                              <g key={idx} className="chart-bar-group">
                                {/* Bar background shimmer on hover */}
                                <rect x={x} y="20" width={barWidth} height="140" fill="rgba(0,0,0,0.01)" rx="4" />
                                {/* Value indicator */}
                                <text x={x + barWidth/2} y={y - 8} fontSize="9" fontWeight="700" fill="#e11d48" textAnchor="middle">
                                  {item.views.toLocaleString()}
                                </text>
                                {/* Colored Bar */}
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={barWidth} 
                                  height={barHeight} 
                                  fill={idx % 2 === 0 ? "#e11d48" : "#fb7185"} 
                                  rx="4" 
                                  className="chart-bar" 
                                />
                                {/* Category Label */}
                                <text x={x + barWidth/2} y="185" fontSize="9" fontWeight="700" fill="#64748b" textAnchor="middle">
                                  {item.category}
                                </text>
                              </g>
                            );
                          })}
                          {/* Baseline */}
                          <line x1="20" y1="160" x2="390" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Scraper Logs Table */}
                <div className="analytics-scraper-section">
                  <div className="scraper-header-row">
                    <h3 className="scraper-section-title">🤖 AI Scraper Status & History</h3>
                    <span className="scraper-auto-badge">Cron Job Status: ACTIVE (3 Hours)</span>
                  </div>

                  {analytics?.scraperLogs.length === 0 ? (
                    <div className="admin-empty">No scraper runs logged yet.</div>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Run Time</th>
                            <th>Status</th>
                            <th>Articles Added</th>
                            <th>Error Logs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics?.scraperLogs.map((run) => (
                            <tr key={run.id}>
                              <td className="admin-date-cell">
                                {new Date(run.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td>
                                <span className={`scraper-status-badge ${run.status}`}>
                                  {run.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="admin-nav-count-cell" style={{ fontWeight: 800, color: '#e11d48' }}>
                                + {run.articles_added} articles
                              </td>
                              <td className="scraper-error-cell" style={{ color: run.error_message ? '#ef4444' : '#64748b', fontSize: '12px' }}>
                                {run.error_message || 'No errors logged. Operations nominal.'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

        {/* ════════ ARTICLES TAB ════════ */}
        {activeTab === 'articles' && !editingArticle && (
          <>
            <header className="admin-page-header">
              <div>
                <h1 className="admin-page-title">Articles</h1>
                <p className="admin-page-subtitle">Manage all published articles</p>
              </div>
              <button className="admin-btn-primary" onClick={handleNewArticle}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Article
              </button>
            </header>

            {loadingArticles ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <p>Loading articles…</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="admin-empty">
                <p>No articles yet. Create your first one!</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Date</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="admin-article-cell">
                            {a.image_url && (
                              <img src={a.image_url} alt="" className="admin-article-thumb" />
                            )}
                            <div className="admin-article-info">
                              <span className="admin-article-title-cell">{a.title}</span>
                              <span className="admin-article-excerpt-cell">{a.excerpt?.slice(0, 80)}…</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-category-badge">{a.category}</span>
                        </td>
                        <td className="admin-author-cell">{a.author_name || '—'}</td>
                        <td className="admin-date-cell">
                          {new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          {a.featured ? (
                            <span className="admin-featured-badge">★ Featured</span>
                          ) : (
                            <span className="admin-not-featured">—</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button className="admin-btn-icon edit" title="Edit" onClick={() => handleEditArticle(a)}>
                              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {deleteConfirmId === a.id ? (
                              <div className="admin-delete-confirm">
                                <button className="admin-btn-icon confirm-yes" onClick={() => handleDeleteArticle(a.id)}>Yes</button>
                                <button className="admin-btn-icon confirm-no" onClick={() => setDeleteConfirmId(null)}>No</button>
                              </div>
                            ) : (
                              <button className="admin-btn-icon delete" title="Delete" onClick={() => setDeleteConfirmId(a.id)}>
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════ ARTICLE EDITOR ════════ */}
        {activeTab === 'articles' && editingArticle && (
          <>
            <header className="admin-page-header">
              <div>
                <h1 className="admin-page-title">
                  {editingArticle === 'new' ? 'New Article' : 'Edit Article'}
                </h1>
                <p className="admin-page-subtitle">
                  {editingArticle === 'new' ? 'Create a new article for your readers' : `Editing article #${editingArticle}`}
                </p>
              </div>
              <button className="admin-btn-ghost" onClick={() => setEditingArticle(null)}>
                ← Back to List
              </button>
            </header>

            <form className="admin-article-form" onSubmit={handleSaveArticle}>
              <div className="admin-form-grid">
                {/* Left column - main content */}
                <div className="admin-form-left">
                  <div className="admin-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      placeholder="Enter article headline…"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Excerpt / Summary</label>
                    <textarea
                      className="admin-input admin-textarea-small"
                      value={articleForm.excerpt}
                      onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                      placeholder="A brief summary shown on cards and previews…"
                      rows="3"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Body Content</label>
                    <textarea
                      className="admin-input admin-textarea-large"
                      value={articleForm.body}
                      onChange={(e) => setArticleForm({ ...articleForm, body: e.target.value })}
                      placeholder="Write the full article body here. Use double line breaks for paragraphs. Wrap quotes in double-quotes to render as blockquotes."
                      rows="14"
                    />
                  </div>
                </div>

                {/* Right column - metadata */}
                <div className="admin-form-right">
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      className="admin-input admin-select"
                      value={articleForm.category}
                      onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      className="admin-input"
                      value={articleForm.image_url}
                      onChange={(e) => setArticleForm({ ...articleForm, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/…"
                    />
                    {articleForm.image_url && (
                      <img src={articleForm.image_url} alt="Preview" className="admin-image-preview" />
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label>Author Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={articleForm.author_name}
                      onChange={(e) => setArticleForm({ ...articleForm, author_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Author Avatar URL</label>
                    <input
                      type="url"
                      className="admin-input"
                      value={articleForm.author_avatar}
                      onChange={(e) => setArticleForm({ ...articleForm, author_avatar: e.target.value })}
                      placeholder="https://…"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Author Bio</label>
                    <textarea
                      className="admin-input admin-textarea-small"
                      value={articleForm.author_bio}
                      onChange={(e) => setArticleForm({ ...articleForm, author_bio: e.target.value })}
                      placeholder="Short bio shown in article sidebar…"
                      rows="3"
                    />
                  </div>

                  <div className="admin-form-group admin-checkbox-group">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={articleForm.featured}
                        onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                      />
                      <span className="admin-checkbox-custom" />
                      Mark as Featured Article
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn-ghost" onClick={() => setEditingArticle(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={savingArticle}>
                  {savingArticle ? 'Saving…' : editingArticle === 'new' ? 'Publish Article' : 'Update Article'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ════════ FLASH NEWS TAB ════════ */}
        {activeTab === 'flash' && (
          <>
            <header className="admin-page-header">
              <div>
                <h1 className="admin-page-title">Flash News</h1>
                <p className="admin-page-subtitle">Manage the breaking news ticker</p>
              </div>
            </header>

            <form className="admin-flash-form" onSubmit={handleAddFlash}>
              <input
                type="text"
                className="admin-input"
                value={newFlashText}
                onChange={(e) => setNewFlashText(e.target.value)}
                placeholder="Type breaking news headline…"
                required
              />
              <button type="submit" className="admin-btn-primary" disabled={savingFlash}>
                {savingFlash ? 'Adding…' : '+ Add'}
              </button>
            </form>

            {loadingFlash ? (
              <div className="admin-loading">
                <div className="admin-spinner" />
                <p>Loading flash news…</p>
              </div>
            ) : flashItems.length === 0 ? (
              <div className="admin-empty">
                <p>No flash news items yet.</p>
              </div>
            ) : (
              <div className="admin-flash-list">
                {flashItems.map((item) => (
                  <div key={item.id} className={`admin-flash-item ${item.active ? '' : 'inactive'}`}>
                    <div className="admin-flash-content">
                      <span className={`admin-flash-status ${item.active ? 'live' : 'off'}`}>
                        {item.active ? '● LIVE' : '○ OFF'}
                      </span>
                      <span className="admin-flash-text">{item.text}</span>
                    </div>
                    <div className="admin-flash-actions">
                      <button
                        className={`admin-btn-small ${item.active ? 'warn' : 'success'}`}
                        onClick={() => handleToggleFlash(item)}
                      >
                        {item.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="admin-btn-small danger" onClick={() => handleDeleteFlash(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════ TRENDING TAB ════════ */}
        {activeTab === 'trending' && (
          <>
            {trendingError ? (
              <div className="admin-empty" style={{ maxWidth: '600px', margin: '3rem auto', padding: '2.5rem', background: '#1e293b', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>Setup Required</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  To manage the Live Trending Section dynamically, please create the <code>trending_articles</code> table in your Supabase project.
                </p>
                <div style={{ background: '#0f172a', color: '#38bdf8', padding: '1.25rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'left', overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid #334155' }}>
                  {`create table public.trending_articles (
  id           bigserial primary key,
  title        text        not null,
  excerpt      text,
  category     text,
  image_url    text,
  author_name  text,
  author_avatar text,
  active       boolean     default true,
  created_at   timestamptz default now()
);`}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Copy this SQL and run it in the SQL Editor of your Supabase Dashboard. RLS policies and seed data are available in <code>supabase_trending.sql</code>.
                </p>
                <button className="admin-btn-primary" onClick={loadTrendingArticles}>
                  Verify & Connect Table
                </button>
              </div>
            ) : editingTrending ? (
              <>
                <header className="admin-page-header">
                  <div>
                    <h1 className="admin-page-title">
                      {editingTrending === 'new' ? 'New Trending Article' : 'Edit Trending Article'}
                    </h1>
                    <p className="admin-page-subtitle">
                      {editingTrending === 'new' ? 'Add a new card to the live trending section' : `Editing trending article #${editingTrending}`}
                    </p>
                  </div>
                  <button className="admin-btn-ghost" onClick={() => setEditingTrending(null)}>
                    ← Back to List
                  </button>
                </header>

                <form className="admin-article-form" onSubmit={handleSaveTrending}>
                  <div className="admin-form-grid">
                    <div className="admin-form-left">
                      <div className="admin-form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={trendingForm.title}
                          onChange={(e) => setTrendingForm({ ...trendingForm, title: e.target.value })}
                          placeholder="Enter trending headline…"
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Excerpt / Summary</label>
                        <textarea
                          className="admin-input admin-textarea-small"
                          value={trendingForm.excerpt}
                          onChange={(e) => setTrendingForm({ ...trendingForm, excerpt: e.target.value })}
                          placeholder="A brief summary shown on the card…"
                          rows="3"
                        />
                      </div>

                      <div className="admin-form-group admin-checkbox-group" style={{ marginTop: '2rem' }}>
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={trendingForm.active}
                            onChange={(e) => setTrendingForm({ ...trendingForm, active: e.target.checked })}
                          />
                          <span className="admin-checkbox-custom" />
                          Show this article in Live Trending Section
                        </label>
                      </div>
                    </div>

                    <div className="admin-form-right">
                      <div className="admin-form-group">
                        <label>Category</label>
                        <select
                          className="admin-input admin-select"
                          value={trendingForm.category}
                          onChange={(e) => setTrendingForm({ ...trendingForm, category: e.target.value })}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-form-group">
                        <label>Image URL</label>
                        <input
                          type="url"
                          className="admin-input"
                          value={trendingForm.image_url}
                          onChange={(e) => setTrendingForm({ ...trendingForm, image_url: e.target.value })}
                          placeholder="https://images.unsplash.com/…"
                        />
                        {trendingForm.image_url && (
                          <img src={trendingForm.image_url} alt="Preview" className="admin-image-preview" style={{ maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem' }} />
                        )}
                      </div>

                      <div className="admin-form-group">
                        <label>Author Name</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={trendingForm.author_name}
                          onChange={(e) => setTrendingForm({ ...trendingForm, author_name: e.target.value })}
                          placeholder="David Chen"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Author Avatar URL</label>
                        <input
                          type="url"
                          className="admin-input"
                          value={trendingForm.author_avatar}
                          onChange={(e) => setTrendingForm({ ...trendingForm, author_avatar: e.target.value })}
                          placeholder="https://…"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button type="button" className="admin-btn-ghost" onClick={() => setEditingTrending(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn-primary" disabled={savingTrending}>
                      {savingTrending ? 'Saving…' : editingTrending === 'new' ? 'Add Trending Article' : 'Update Trending Article'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <header className="admin-page-header">
                  <div>
                    <h1 className="admin-page-title">Trending Articles</h1>
                    <p className="admin-page-subtitle">Manage the 4-column live trending section</p>
                  </div>
                  <button className="admin-btn-primary" onClick={handleNewTrending}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New Trending Card
                  </button>
                </header>

                {loadingTrending ? (
                  <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Loading trending cards…</p>
                  </div>
                ) : trendingItems.length === 0 ? (
                  <div className="admin-empty">
                    <p>No trending articles. Click "New Trending Card" to create one!</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Trending Card</th>
                          <th>Category</th>
                          <th>Author</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trendingItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="admin-article-cell">
                                {item.image_url && (
                                  <img src={item.image_url} alt="" className="admin-article-thumb" />
                                )}
                                <div className="admin-article-info">
                                  <span className="admin-article-title-cell">{item.title}</span>
                                  <span className="admin-article-excerpt-cell">{item.excerpt?.slice(0, 80)}…</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="admin-category-badge">{item.category}</span>
                            </td>
                            <td className="admin-author-cell">{item.author_name || '—'}</td>
                            <td>
                              <span className={`admin-flash-status ${item.active ? 'live' : 'off'}`} style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                {item.active ? '● LIVE' : '○ OFF'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-action-btns">
                                <button className="admin-btn-icon edit" title="Edit" onClick={() => handleEditTrending(item)}>
                                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button
                                  className={`admin-btn-small ${item.active ? 'warn' : 'success'}`}
                                  onClick={() => handleToggleTrendingActive(item)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '4px'
                                  }}
                                >
                                  {item.active ? 'Deactivate' : 'Activate'}
                                </button>
                                {deleteTrendingConfirmId === item.id ? (
                                  <div className="admin-delete-confirm">
                                    <button className="admin-btn-icon confirm-yes" onClick={() => handleDeleteTrending(item.id)}>Yes</button>
                                    <button className="admin-btn-icon confirm-no" onClick={() => setDeleteTrendingConfirmId(null)}>No</button>
                                  </div>
                                ) : (
                                  <button className="admin-btn-icon delete" title="Delete" onClick={() => setDeleteTrendingConfirmId(item.id)}>
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"/>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ════════ EDITOR'S PICKS TAB ════════ */}
        {activeTab === 'editors_picks' && (
          <>
            {editorsPickError ? (
              <div className="admin-empty" style={{ maxWidth: '600px', margin: '3rem auto', padding: '2.5rem', background: '#1e293b', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>Setup Required</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  To manage the Editor's Pick Section dynamically, please create the <code>editors_picks</code> table in your Supabase project.
                </p>
                <div style={{ background: '#0f172a', color: '#38bdf8', padding: '1.25rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'left', overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid #334155' }}>
                  {`create table public.editors_picks (
  id           bigserial primary key,
  title        text        not null,
  excerpt      text,
  category     text,
  image_url    text,
  author_name  text,
  author_avatar text,
  featured     boolean     default false,
  active       boolean     default true,
  created_at   timestamptz default now()
);`}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Copy this SQL and run it in the SQL Editor of your Supabase Dashboard. RLS policies and seed data are available in <code>supabase_editors_picks.sql</code>.
                </p>
                <button className="admin-btn-primary" onClick={loadEditorsPicks}>
                  Verify & Connect Table
                </button>
              </div>
            ) : editingEditorsPick ? (
              <>
                <header className="admin-page-header">
                  <div>
                    <h1 className="admin-page-title">
                      {editingEditorsPick === 'new' ? 'New Editor\'s Pick' : 'Edit Editor\'s Pick'}
                    </h1>
                    <p className="admin-page-subtitle">
                      {editingEditorsPick === 'new' ? 'Add a new card to the editor\'s picks' : `Editing editor's pick #${editingEditorsPick}`}
                    </p>
                  </div>
                  <button className="admin-btn-ghost" onClick={() => setEditingEditorsPick(null)}>
                    ← Back to List
                  </button>
                </header>

                <form className="admin-article-form" onSubmit={handleSaveEditorsPick}>
                  <div className="admin-form-grid">
                    <div className="admin-form-left">
                      <div className="admin-form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={editorsPickForm.title}
                          onChange={(e) => setEditorsPickForm({ ...editorsPickForm, title: e.target.value })}
                          placeholder="Enter headline…"
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Excerpt / Summary (Mainly for center featured card)</label>
                        <textarea
                          className="admin-input admin-textarea-small"
                          value={editorsPickForm.excerpt}
                          onChange={(e) => setEditorsPickForm({ ...editorsPickForm, excerpt: e.target.value })}
                          placeholder="A brief summary shown on the card…"
                          rows="3"
                        />
                      </div>

                      <div className="admin-form-group admin-checkbox-group" style={{ marginTop: '2rem' }}>
                        <label className="admin-checkbox-label" style={{ marginBottom: '1rem', display: 'flex' }}>
                          <input
                            type="checkbox"
                            checked={editorsPickForm.featured}
                            onChange={(e) => setEditorsPickForm({ ...editorsPickForm, featured: e.target.checked })}
                          />
                          <span className="admin-checkbox-custom" />
                          Mark as Center Featured Card (Large)
                        </label>
                        <label className="admin-checkbox-label" style={{ display: 'flex' }}>
                          <input
                            type="checkbox"
                            checked={editorsPickForm.active}
                            onChange={(e) => setEditorsPickForm({ ...editorsPickForm, active: e.target.checked })}
                          />
                          <span className="admin-checkbox-custom" />
                          Show this article in Editor's Pick Section
                        </label>
                      </div>
                    </div>

                    <div className="admin-form-right">
                      <div className="admin-form-group">
                        <label>Category</label>
                        <select
                          className="admin-input admin-select"
                          value={editorsPickForm.category}
                          onChange={(e) => setEditorsPickForm({ ...editorsPickForm, category: e.target.value })}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-form-group">
                        <label>Image URL</label>
                        <input
                          type="url"
                          className="admin-input"
                          value={editorsPickForm.image_url}
                          onChange={(e) => setEditorsPickForm({ ...editorsPickForm, image_url: e.target.value })}
                          placeholder="https://images.unsplash.com/…"
                        />
                        {editorsPickForm.image_url && (
                          <img src={editorsPickForm.image_url} alt="Preview" className="admin-image-preview" style={{ maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem' }} />
                        )}
                      </div>

                      <div className="admin-form-group">
                        <label>Author Name</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={editorsPickForm.author_name}
                          onChange={(e) => setEditorsPickForm({ ...editorsPickForm, author_name: e.target.value })}
                          placeholder="Lukas Berg"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Author Avatar URL</label>
                        <input
                          type="url"
                          className="admin-input"
                          value={editorsPickForm.author_avatar}
                          onChange={(e) => setEditorsPickForm({ ...editorsPickForm, author_avatar: e.target.value })}
                          placeholder="https://…"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button type="button" className="admin-btn-ghost" onClick={() => setEditingEditorsPick(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn-primary" disabled={savingEditorsPick}>
                      {savingEditorsPick ? 'Saving…' : editingEditorsPick === 'new' ? 'Add Editor\'s Pick' : 'Update Editor\'s Pick'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <header className="admin-page-header">
                  <div>
                    <h1 className="admin-page-title">Editor's Picks</h1>
                    <p className="admin-page-subtitle">Manage the 5-card editor's pick section (2 small left, 1 featured middle, 2 small right)</p>
                  </div>
                  <button className="admin-btn-primary" onClick={handleNewEditorsPick}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New Editor's Pick
                  </button>
                </header>

                {loadingEditorsPicks ? (
                  <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Loading editor's picks…</p>
                  </div>
                ) : editorsPicksItems.length === 0 ? (
                  <div className="admin-empty">
                    <p>No editor's picks. Click "New Editor's Pick" to create one!</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Editor's Pick</th>
                          <th>Category</th>
                          <th>Author</th>
                          <th>Layout</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editorsPicksItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="admin-article-cell">
                                {item.image_url && (
                                  <img src={item.image_url} alt="" className="admin-article-thumb" />
                                )}
                                <div className="admin-article-info">
                                  <span className="admin-article-title-cell">{item.title}</span>
                                  <span className="admin-article-excerpt-cell">{item.excerpt?.slice(0, 80)}…</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="admin-category-badge">{item.category}</span>
                            </td>
                            <td className="admin-author-cell">{item.author_name || '—'}</td>
                            <td>
                              {item.featured ? (
                                <span className="admin-featured-badge" style={{ backgroundColor: '#1e3a8a', color: '#60a5fa', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>★ Middle Featured</span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Side Card</span>
                              )}
                            </td>
                            <td>
                              <span className={`admin-flash-status ${item.active ? 'live' : 'off'}`} style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                {item.active ? '● LIVE' : '○ OFF'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-action-btns">
                                <button className="admin-btn-icon edit" title="Edit" onClick={() => handleEditEditorsPick(item)}>
                                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button
                                  className={`admin-btn-small ${item.active ? 'warn' : 'success'}`}
                                  onClick={() => handleToggleEditorsPickActive(item)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '4px'
                                  }}
                                >
                                  {item.active ? 'Deactivate' : 'Activate'}
                                </button>
                                {deleteEditorsPickConfirmId === item.id ? (
                                  <div className="admin-delete-confirm">
                                    <button className="admin-btn-icon confirm-yes" onClick={() => handleDeleteEditorsPick(item.id)}>Yes</button>
                                    <button className="admin-btn-icon confirm-no" onClick={() => setDeleteEditorsPickConfirmId(null)}>No</button>
                                  </div>
                                ) : (
                                  <button className="admin-btn-icon delete" title="Delete" onClick={() => setDeleteEditorsPickConfirmId(item.id)}>
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"/>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ════════ STORIES TAB ════════ */}
        {activeTab === 'stories' && (
          <>
            {storyArticleError ? (
              <div className="admin-empty" style={{ maxWidth: '600px', margin: '3rem auto', padding: '2.5rem', background: '#1e293b', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>Setup Required</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  To manage the Stories Section dynamically, please create the <code>story_articles</code> table in your Supabase project.
                </p>
                <div style={{ background: '#0f172a', color: '#38bdf8', padding: '1.25rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'left', overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid #334155' }}>
                  {`create table public.story_articles (
  id            bigserial primary key,
  title         text        not null,
  excerpt       text,
  image_url     text,
  author_name   text,
  author_avatar text,
  author_role   text,
  featured      boolean     default false,
  views_count   text        default '0',
  comments_count text       default '0',
  active        boolean     default true,
  created_at    timestamptz default now()
);`}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Copy this SQL and run it in the SQL Editor of your Supabase Dashboard. RLS policies and seed data are available in <code>supabase_stories.sql</code>.
                </p>
                <button className="admin-btn-primary" onClick={loadStoryArticles}>
                  Verify & Connect Table
                </button>
              </div>
            ) : editingStoryArticle ? (
              <>
                <header className="admin-page-header">
                  <div>
                    <h1 className="admin-page-title">
                      {editingStoryArticle === 'new' ? 'New Story Article' : 'Edit Story Article'}
                    </h1>
                    <p className="admin-page-subtitle">
                      {editingStoryArticle === 'new' ? 'Add a new card to the story section' : `Editing story article #${editingStoryArticle}`}
                    </p>
                  </div>
                  <button className="admin-btn-ghost" onClick={() => setEditingStoryArticle(null)}>
                    ← Back to List
                  </button>
                </header>

                <form className="admin-article-form" onSubmit={handleSaveStoryArticle}>
                  <div className="admin-form-grid">
                    <div className="admin-form-left">
                      <div className="admin-form-group">
                        <label>Title *</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={storyArticleForm.title}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, title: e.target.value })}
                          placeholder="Enter story headline…"
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Excerpt / Summary (Mainly for featured top story)</label>
                        <textarea
                          className="admin-input admin-textarea-small"
                          value={storyArticleForm.excerpt}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, excerpt: e.target.value })}
                          placeholder="A brief summary shown on the featured story card…"
                          rows="3"
                        />
                      </div>

                      <div className="admin-form-group admin-checkbox-group" style={{ marginTop: '2rem' }}>
                        <label className="admin-checkbox-label" style={{ marginBottom: '1rem', display: 'flex' }}>
                          <input
                            type="checkbox"
                            checked={storyArticleForm.featured}
                            onChange={(e) => setStoryArticleForm({ ...storyArticleForm, featured: e.target.checked })}
                          />
                          <span className="admin-checkbox-custom" />
                          Mark as Featured Top Story (Large)
                        </label>
                        <label className="admin-checkbox-label" style={{ display: 'flex' }}>
                          <input
                            type="checkbox"
                            checked={storyArticleForm.active}
                            onChange={(e) => setStoryArticleForm({ ...storyArticleForm, active: e.target.checked })}
                          />
                          <span className="admin-checkbox-custom" />
                          Show this article in Stories Section
                        </label>
                      </div>
                    </div>

                    <div className="admin-form-right">
                      <div className="admin-form-group">
                        <label>Image URL</label>
                        <input
                          type="url"
                          className="admin-input"
                          value={storyArticleForm.image_url}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, image_url: e.target.value })}
                          placeholder="https://images.unsplash.com/…"
                        />
                        {storyArticleForm.image_url && (
                          <img src={storyArticleForm.image_url} alt="Preview" className="admin-image-preview" style={{ maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem' }} />
                        )}
                      </div>

                      <div className="admin-form-group">
                        <label>Author Name</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={storyArticleForm.author_name}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, author_name: e.target.value })}
                          placeholder="Marcus Vance"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Author Role</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={storyArticleForm.author_role}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, author_role: e.target.value })}
                          placeholder="Diplomatic Correspondent"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Author Avatar URL</label>
                        <input
                          type="url"
                          className="admin-input"
                          value={storyArticleForm.author_avatar}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, author_avatar: e.target.value })}
                          placeholder="https://…"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Views Count (e.g. 14,250)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={storyArticleForm.views_count}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, views_count: e.target.value })}
                          placeholder="14,250"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Comments Count (e.g. 28)</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={storyArticleForm.comments_count}
                          onChange={(e) => setStoryArticleForm({ ...storyArticleForm, comments_count: e.target.value })}
                          placeholder="28"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button type="button" className="admin-btn-ghost" onClick={() => setEditingStoryArticle(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn-primary" disabled={savingStoryArticle}>
                      {savingStoryArticle ? 'Saving…' : editingStoryArticle === 'new' ? 'Add Story' : 'Update Story'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <header className="admin-page-header">
                  <div>
                    <h1 className="admin-page-title">Stories</h1>
                    <p className="admin-page-subtitle">Manage the bottom story section (1 featured top, rest show in a 3-column list below)</p>
                  </div>
                  <button className="admin-btn-primary" onClick={handleNewStoryArticle}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New Story Card
                  </button>
                </header>

                {loadingStoryArticles ? (
                  <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Loading stories…</p>
                  </div>
                ) : storyArticlesItems.length === 0 ? (
                  <div className="admin-empty">
                    <p>No story articles. Click "New Story Card" to create one!</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Story Card</th>
                          <th>Author</th>
                          <th>Views</th>
                          <th>Comments</th>
                          <th>Layout</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storyArticlesItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="admin-article-cell">
                                {item.image_url && (
                                  <img src={item.image_url} alt="" className="admin-article-thumb" />
                                )}
                                <div className="admin-article-info">
                                  <span className="admin-article-title-cell">{item.title}</span>
                                  <span className="admin-article-excerpt-cell">{item.excerpt?.slice(0, 80)}…</span>
                                </div>
                              </div>
                            </td>
                            <td className="admin-author-cell">
                              <div>{item.author_name || '—'}</div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.author_role || '—'}</div>
                            </td>
                            <td>{item.views_count || '0'}</td>
                            <td>{item.comments_count || '0'}</td>
                            <td>
                              {item.featured ? (
                                <span className="admin-featured-badge" style={{ backgroundColor: '#1e3a8a', color: '#60a5fa', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>★ Top Featured</span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>List Item</span>
                              )}
                            </td>
                            <td>
                              <span className={`admin-flash-status ${item.active ? 'live' : 'off'}`} style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                {item.active ? '● LIVE' : '○ OFF'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-action-btns">
                                <button className="admin-btn-icon edit" title="Edit" onClick={() => handleEditStoryArticle(item)}>
                                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                                <button
                                  className={`admin-btn-small ${item.active ? 'warn' : 'success'}`}
                                  onClick={() => handleToggleStoryArticleActive(item)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '4px'
                                  }}
                                >
                                  {item.active ? 'Deactivate' : 'Activate'}
                                </button>
                                {deleteStoryArticleConfirmId === item.id ? (
                                  <div className="admin-delete-confirm">
                                    <button className="admin-btn-icon confirm-yes" onClick={() => handleDeleteStoryArticle(item.id)}>Yes</button>
                                    <button className="admin-btn-icon confirm-no" onClick={() => setDeleteStoryArticleConfirmId(null)}>No</button>
                                  </div>
                                ) : (
                                  <button className="admin-btn-icon delete" title="Delete" onClick={() => setDeleteStoryArticleConfirmId(item.id)}>
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"/>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </main>
    </div>
  );
}
