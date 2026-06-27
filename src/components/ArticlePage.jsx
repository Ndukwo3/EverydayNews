import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockFlashNews, mockArticles, mockEditorsPicks, mockTrendingArticles, mockStorySection, mockVideoGallery } from '../newsData';
import { fetchArticle, fetchComments, postComment as apiPostComment, fetchLikes, toggleLike as apiToggleLike, fetchArticles as apiFetchArticles, likeComment as apiLikeComment } from '../lib/api';
import FlashTicker from './FlashTicker';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime, estimateReadingTime } from '../lib/utils';
import './ArticlePage.css';

// Combine all mock articles as fallback
const allMockArticles = [
  ...mockArticles,
  ...mockEditorsPicks,
  ...mockTrendingArticles,
  mockStorySection.featured,
  ...mockStorySection.articles,
  mockVideoGallery.featured,
  ...mockVideoGallery.sidebar
];

function formatQuotes(text) {
  if (!text) return "";
  const parts = text.split(/"/g);
  if (parts.length === 1) {
    return text;
  }
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="inline-news-quote">
          &ldquo;{part}&rdquo;
        </span>
      );
    }
    return part;
  });
}

function getDynamicTagsAndHashtags(title, category) {
  const tags = [];
  const hashtags = [];

  if (category) {
    const formattedCat = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    tags.push(formattedCat);
    hashtags.push(category.toLowerCase());
  } else {
    tags.push("News");
    hashtags.push("news");
  }

  if (title) {
    const cleanTitle = title.replace(/[^\w\s\d]/g, '');
    const words = cleanTitle.split(/\s+/);
    
    const stopWords = new Set([
      'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'as', 'by', 'is', 'are', 'was', 'were',
      'and', 'or', 'but', 'about', 'says', 'against', 'has', 'have', 'had', 'after', 'over', 'under', 'be',
      'been', 'that', 'this', 'from', 'who', 'what', 'why', 'how', 'which', 'its', 'their', 'his', 'her',
      'he', 'she', 'they', 'it', 'into', 'out', 'up', 'down', 'no', 'not', 'only', 'other', 'some', 'more',
      'than', 'them', 'their', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must',
      'so', 'then', 'also', 'just', 'now', 'today', 'latest'
    ]);

    const uniqueKeywords = [];
    const seen = new Set();
    seen.add(category ? category.toLowerCase() : 'news');
    
    for (const word of words) {
      const lower = word.toLowerCase();
      if (lower.length > 3 && !stopWords.has(lower) && isNaN(lower) && !seen.has(lower)) {
        seen.add(lower);
        uniqueKeywords.push(word);
      }
    }

    const titleTags = uniqueKeywords.slice(0, 3);
    tags.push(...titleTags);

    const titleHashtags = uniqueKeywords.map(w => w.toLowerCase()).slice(0, 8);
    hashtags.push(...titleHashtags);
  }

  // Add default hashtags if too short
  const fallbacks = ['breaking', 'worldnews', 'everydaynews'];
  let fallbackIdx = 0;
  while (hashtags.length < 6 && fallbackIdx < fallbacks.length) {
    if (!hashtags.includes(fallbacks[fallbackIdx])) {
      hashtags.push(fallbacks[fallbackIdx]);
    }
    fallbackIdx++;
  }

  return { tags, hashtags };
}

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();

  // Article state — loaded from Supabase (falls back to mock)
  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashNews, setFlashNews] = useState(() => {
    const cached = localStorage.getItem('everyday_news_flash');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    const cached = localStorage.getItem('everyday_news_flash');
    if (cached) {
      setFlashNews(JSON.parse(cached));
    }
  }, []);


  // State for Likes (from Supabase)
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  // State for Shares
  const [shareCopied, setShareCopied] = useState(false);

  // State for Comments (from Supabase)
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentPosting, setCommentPosting] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [userSessionId, setUserSessionId] = useState(null); // Track user session for likes

  // Initialize user session ID for tracking likes
  useEffect(() => {
    let sid = localStorage.getItem('newsSessionId');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('newsSessionId', sid);
    }
    setUserSessionId(sid);
  }, []);

  // Check if a comment is liked by the current session
  const isCommentLiked = (commentId) => {
    if (!userSessionId) return false;
    const likeKey = `liked_comment_${commentId}_${userSessionId}`;
    return localStorage.getItem(likeKey) === 'true';
  };

  // ─── Load article data from Supabase ───
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let cancelled = false;

    async function loadArticle() {
      setLoading(true);
      try {
        // Try fetching from Supabase first
        const dbArticle = await fetchArticle(id);
        if (!dbArticle) {
          throw new Error('Article not found in database');
        }
        if (!cancelled) {
          // Normalize Supabase column names to the shape our JSX expects
          setArticle({
            id: id,
            title: dbArticle.title,
            excerpt: dbArticle.excerpt,
            body: dbArticle.body,
            category: dbArticle.category,
            image: dbArticle.image_url,
            date: new Date(dbArticle.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            created_at: dbArticle.created_at,
            author: {
              name: dbArticle.author_name,
              avatar: dbArticle.author_avatar,
              bio: dbArticle.author_bio
            },
            featured: dbArticle.featured,
            _source: 'supabase'
          });
        }
      } catch {
        // Supabase article not found — try mock data
        if (!cancelled) {
          const mock = allMockArticles.find((a) => String(a.id) === String(id));
          setArticle(mock || null);
        }
      }
      if (!cancelled) setLoading(false);
    }

    async function loadAllArticles() {
      try {
        const dbArticles = await apiFetchArticles();
        if (!cancelled && dbArticles.length > 0) {
          setAllArticles(dbArticles.map(a => ({
            id: a.id,
            title: a.title,
            excerpt: a.excerpt,
            category: a.category,
            image: a.image_url,
            date: new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            author: { name: a.author_name, avatar: a.author_avatar }
          })));
        }
      } catch {
        if (!cancelled) setAllArticles(allMockArticles);
      }
    }

    loadArticle();
    loadAllArticles();
    return () => { cancelled = true; };
  }, [id]);

  // ─── Load comments from Supabase ───
  useEffect(() => {
    if (!article) return;
    let cancelled = false;
    const articleId = article._source === 'supabase' ? article.id : null;

    async function loadComments() {
      if (!articleId) return; // mock articles don't have Supabase comments
      try {
        const rows = await fetchComments(articleId);
        if (!cancelled) {
          setCommentsList(rows.map(r => ({
            id: r.id,
            author: r.author,
            avatar: r.avatar,
            text: r.text,
            parentId: r.parent_id,
            likesCount: r.likes_count || 0,
            date: new Date(r.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
          })));
        }
      } catch { /* ignore */ }
    }
    loadComments();
    return () => { cancelled = true; };
  }, [article]);

  // ─── Load likes from Supabase ───
  useEffect(() => {
    if (!article || article._source !== 'supabase') return;
    let cancelled = false;

    async function loadLikes() {
      try {
        const { count, hasLiked: liked } = await fetchLikes(article.id);
        if (!cancelled) {
          setLikesCount(count);
          setHasLiked(liked);
        }
      } catch { /* ignore */ }
    }
    loadLikes();
    return () => { cancelled = true; };
  }, [article]);

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="article-page">
        <FlashTicker items={flashNews} />
        <Header categories={['NEWS', 'BUSINESS', 'FINANCE', 'SPORT', 'TRAVEL', 'TECH', 'ENTERTAINMENT']} activeCategory="ALL" onSelectCategory={() => navigate('/')} onLoginClick={() => navigate('/')} />
        <div className="article-not-found" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: 16, color: '#888' }}>Loading article…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page">
        <FlashTicker items={flashNews} />
        <Header categories={['NEWS', 'BUSINESS', 'FINANCE', 'SPORT', 'TRAVEL', 'TECH', 'ENTERTAINMENT']} activeCategory="ALL" onSelectCategory={() => navigate('/')} onLoginClick={() => navigate('/')} />
        <div className="article-not-found">
          <h2>Article not found</h2>
          <button className="back-home-btn" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle logo category select to go home
  const handleLogoClick = () => {
    navigate('/');
  };

  // Get suggested articles (excluding the current one)
  const suggestedSource = allArticles.length > 0 ? allArticles : allMockArticles;
  const suggestedArticles = suggestedSource
    .filter((a) => String(a.id) !== String(id))
    .slice(0, 4);

  // Toggle Like (Supabase)
  const handleLike = async () => {
    if (article._source !== 'supabase' || likeBusy) return;
    setLikeBusy(true);
    try {
      const nowLiked = await apiToggleLike(article.id);
      setHasLiked(nowLiked);
      setLikesCount(prev => nowLiked ? prev + 1 : prev - 1);
    } catch { /* ignore */ }
    setLikeBusy(false);
  };

  // Copy Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => {
      setShareCopied(false);
    }, 2000);
  };

  // Submit Comment to Supabase
  const submitComment = async (text, parentId = null) => {
    if (!text.trim()) return;

    if (article._source === 'supabase') {
      setCommentPosting(true);
      try {
        const saved = await apiPostComment({
          articleId: article.id,
          author: 'Anonymous Reader',
          avatar: null,
          text: text,
          parentId: parentId
        });
        setCommentsList(prev => [...prev, {
          id: saved.id,
          author: saved.author,
          avatar: saved.avatar,
          text: saved.text,
          parentId: saved.parent_id,
          likesCount: saved.likes_count || 0,
          date: new Date(saved.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
        }]);
      } catch (err) {
        console.error('Failed to post comment:', err);
      }
      setCommentPosting(false);
    } else {
      // Fallback for mock articles — local only
      setCommentsList(prev => [...prev, {
        id: Date.now(),
        author: 'Anonymous Reader',
        avatar: null,
        text: text,
        parentId: parentId,
        likesCount: 0,
        date: new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
    }
  };

  const handleLikeComment = async (commentId) => {
    const comment = commentsList.find(c => c.id === commentId);
    if (!comment) return;

    // Wait for session ID to be initialized
    if (!userSessionId) {
      console.error('User session not initialized yet');
      return;
    }

    // For demo purposes, we'll allow multiple clicks but only update UI once per session
    // In a real application, you would track this against the database
    const likeKey = `liked_comment_${commentId}_${userSessionId}`;
    const hasLiked = localStorage.getItem(likeKey);
    
    if (hasLiked) {
      // Already liked by this session, show a message or return
      return;
    }

    // Call Supabase update
    if (article._source === 'supabase') {
      try {
        await apiLikeComment(commentId, comment.likesCount);
        setCommentsList(prev => prev.map(c => c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c));
        // Mark as liked in localStorage
        localStorage.setItem(likeKey, 'true');
      } catch (err) {
        console.error('Failed to like comment:', err);
        alert(`Failed to like comment: ${err.message}`);
      }
    } else {
      // Mock fallback
      setCommentsList(prev => prev.map(c => c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c));
      // Mark as liked in localStorage
      localStorage.setItem(likeKey, 'true');
    }
  };

  const handlePostNewComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    submitComment(newCommentText);
    setNewCommentText("");
  };

  const handlePostReply = (e, parentId) => {
    e.preventDefault();
    const replyText = replyTexts[parentId];
    if (!replyText || !replyText.trim()) return;
    submitComment(replyText, parentId);
    setReplyTexts(prev => ({ ...prev, [parentId]: "" }));
    setActiveReplyId(null);
  };

  // Body content: use Supabase body if present, otherwise fallback
  const bodyContent = article.body || article.excerpt || "";

  const { tags, hashtags } = getDynamicTagsAndHashtags(article.title, article.category);

  return (
    <div className="article-page">
      <FlashTicker items={flashNews} />
      <Header 
        categories={['NEWS', 'BUSINESS', 'FINANCE', 'SPORT', 'TRAVEL', 'TECH', 'ENTERTAINMENT']} 
        activeCategory={article.category} 
        onSelectCategory={handleLogoClick} 
        onLoginClick={openLoginModal} 
      />

      <div className="article-layout-container">
        
        {/* Left Column: Author card & Hashtags */}
        <aside className="article-sidebar-left">
          <div className="author-card-new">
            <div className="author-avatar-wrapper">
              <img 
                src={article.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                alt={article.author?.name || "Bestami Ç."} 
                className="author-avatar-new" 
              />
            </div>
            <h3 className="author-name-new">{article.author?.name || "Bestami Ç."}</h3>
            <p className="author-bio-new">
              {article.author?.bio || "Everyday News is a premier independent news portal delivering accurate, unbiased coverage. We provide real-time updates on politics, business, technology, sports, and culture."}
            </p>
          </div>

          <div className="hashtags-card-new">
            <h4 className="hashtags-title-new">Hashtags</h4>
            <div className="hashtags-list-new">
              {hashtags.map((h, i) => (
                <span key={i} className="hashtag-badge-new">#{h}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Main Content */}
        <main className="article-main-content-new">
          <div className="article-breadcrumb-tags">
            {tags.map((t, i) => (
              <span key={i} className={`breadcrumb-tag ${i === 0 ? 'active-tag' : ''}`}>{t}</span>
            ))}
          </div>

          <h1 className="article-headline-new">{article.title}</h1>

          <p className="article-excerpt-new">
            {article.excerpt || "Latest news update from the region."}
          </p>

          <div className="article-meta-row-new">
            <div className="meta-item-new">
              {/* Red indicator clock */}
              <span className="meta-icon-red">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                </svg>
              </span>
              <span className="meta-text-new">
                {formatRelativeTime(article.created_at || article.date)} • {estimateReadingTime(article.body || article.excerpt)}
              </span>
            </div>
            <div className="meta-item-new">
              {/* Red indicator comment */}
              <span className="meta-icon-red">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                </svg>
              </span>
              <span className="meta-text-new">{commentsList.length} comments</span>
            </div>
          </div>

          <div className="article-image-box-new">
            <img src={article.image || article.thumbnail} alt={article.title} className="article-hero-img-new" />
          </div>

          <article className="article-body-content-new">
            {bodyContent.split('\n\n').map((para, i) =>
              para.trim().startsWith('"') ? (
                <blockquote key={i} className="article-blockquote-new">{formatQuotes(para)}</blockquote>
              ) : (
                <p key={i}>{formatQuotes(para)}</p>
              )
            )}
          </article>

          {/* Social Interactions Bar */}
          <div className="interaction-bar-new">
            <button className={`interact-btn ${hasLiked ? 'liked' : ''}`} onClick={handleLike}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill={hasLiked ? "#e11d48" : "none"} stroke={hasLiked ? "#e11d48" : "currentColor"} strokeWidth="2">
                <path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0l-1.3 1.3-1.3-1.3c-1.8-1.8-4.7-1.8-6.5 0-1.8 1.8-1.8 4.7 0 6.5l7.8 7.8 7.8-7.8c1.8-1.8 1.8-4.7 0-6.5z"/>
              </svg>
              <span>{likesCount} Likes</span>
            </button>
            <button className="interact-btn share-btn" onClick={handleShare}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>
              </svg>
              <span>{shareCopied ? "Link Copied!" : "Share Article"}</span>
            </button>
          </div>

          {/* Comments Section */}
          <section className="comments-section-new">
            <h3 className="comments-header-title">{commentsList.filter(c => !c.parentId).length} Comments</h3>
            
            <div className="comments-display-list">
              {commentsList.filter(c => !c.parentId).map((c) => (
                <div key={c.id}>
                  {/* Top-level comment */}
                  <div className="single-comment-card">
                    <div className="comment-avatar-col">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.author} className="commenter-avatar" />
                      ) : (
                        <div className="commenter-avatar-placeholder">
                          {c.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="comment-content-col">
                      <div className="comment-meta-row">
                        <strong className="commenter-name">{c.author}</strong>
                        <span className="comment-date">{c.date}</span>
                      </div>
                      <p className="comment-text-content">{c.text}</p>
                      <div className="comment-actions-bar">
                        <button
                          className={`comment-action-btn ${isCommentLiked(c.id) ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(c.id)}
                          title="Like this comment"
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill={isCommentLiked(c.id) ? "#e11d48" : "none"} stroke={isCommentLiked(c.id) ? "#e11d48" : "currentColor"} strokeWidth="2">
                            <path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0l-1.3 1.3-1.3-1.3c-1.8-1.8-4.7-1.8-6.5 0-1.8 1.8-1.8 4.7 0 6.5l7.8 7.8 7.8-7.8c1.8-1.8 1.8-4.7 0-6.5z"/>
                          </svg>
                          <span>{c.likesCount}</span>
                          <span>Like</span>
                        </button>
                        <button
                          className="comment-action-btn"
                          onClick={() => setActiveReplyId(activeReplyId === c.id ? null : c.id)}
                          title="Reply"
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          Reply
                        </button>
                      </div>

                      {/* Inline Reply Form */}
                      {activeReplyId === c.id && (
                        <div className="reply-form-inline">
                          <textarea
                            className="reply-textarea-inline"
                            placeholder={`Replying to ${c.author}...`}
                            value={replyTexts[c.id] || ''}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                            rows="2"
                          />
                          <div className="reply-actions-inline">
                            <button className="btn-reply-cancel" onClick={() => setActiveReplyId(null)}>Cancel</button>
                            <button className="btn-reply-submit" onClick={(e) => handlePostReply(e, c.id)}>Reply</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Threaded replies indented under parent */}
                  {commentsList.filter(r => r.parentId === c.id).map(reply => (
                    <div key={reply.id} className="single-comment-card reply-comment-card">
                      <div className="comment-avatar-col">
                        {reply.avatar ? (
                          <img src={reply.avatar} alt={reply.author} className="commenter-avatar" />
                        ) : (
                          <div className="commenter-avatar-placeholder">
                            {reply.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="comment-content-col">
                        <div className="comment-meta-row">
                          <strong className="commenter-name">{reply.author}</strong>
                          <span className="comment-date">{reply.date}</span>
                        </div>
                        <p className="comment-text-content">{reply.text}</p>
                        <div className="comment-actions-bar">
                          <button
                            className={`comment-action-btn ${isCommentLiked(reply.id) ? 'liked' : ''}`}
                            onClick={() => handleLikeComment(reply.id)}
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill={isCommentLiked(reply.id) ? "#e11d48" : "none"} stroke={isCommentLiked(reply.id) ? "#e11d48" : "currentColor"} strokeWidth="2">
                              <path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0l-1.3 1.3-1.3-1.3c-1.8-1.8-4.7-1.8-6.5 0-1.8 1.8-1.8 4.7 0 6.5l7.8 7.8 7.8-7.8c1.8-1.8 1.8-4.7 0-6.5z"/>
                            </svg>
                            <span>{reply.likesCount}</span>
                            <span>Like</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Post Comment Form */}
            <div className="post-comment-box">
              <h4 className="post-comment-title">Join the Conversation</h4>
              <form className="comment-form-new" onSubmit={handlePostNewComment}>
                <textarea 
                  className="comment-textarea-new"
                  placeholder="Share your thoughts on this story..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows="4"
                  required
                />
                <div className="comment-form-actions">
                  <button type="submit" className="btn-anonymous-post" disabled={commentPosting}>
                    {commentPosting ? 'Posting…' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>

      </div>

      {/* Suggested Picks Section */}
      <section className="suggested-news-section">
        <div className="suggested-news-container">
          <h2 className="suggested-news-title">Suggested Picks</h2>
          <div className="suggested-news-grid">
            {suggestedArticles.map((item) => (
              <div key={item.id} className="suggested-news-card" onClick={() => navigate(`/article/${item.id}`)}>
                <div className="suggested-image-wrapper">
                  <img src={item.image || item.thumbnail} alt={item.title} className="suggested-card-img" />
                  {item.category && <span className="suggested-card-category">{item.category}</span>}
                </div>
                <div className="suggested-card-content">
                  <h3 className="suggested-card-title">{item.title}</h3>
                  <div className="suggested-card-meta">
                    <span>{item.date || "9 Jan 2024"}</span>
                    <span>•</span>
                    <span>{item.author?.name || "Staff Reporter"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


