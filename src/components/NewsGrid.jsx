import React, { useState } from 'react';
import { Clock, User } from 'lucide-react';
import { formatRelativeTime, estimateReadingTime } from '../lib/utils';
import './NewsGrid.css';

export default function NewsGrid({ articles = [], onArticleClick }) {
  const featuredArticle = articles.find(a => a.featured);
  const gridArticles = articles.filter(a => !a.featured && !a.isSidebarArticle);
  
  const [visibleCount, setVisibleCount] = useState(6);

  const displayedArticles = gridArticles.slice(0, visibleCount);

  return (
    <div className="news-grid-section">
      
      {/* Featured Big Article */}
      {featuredArticle && (
        <article className="featured-article" onClick={() => onArticleClick(featuredArticle)}>
          <div className="featured-content">
            <span className="category-badge politics">{featuredArticle.category}</span>
            <h2 className="featured-title">{featuredArticle.title}</h2>
            
            <div className="author-meta">
              <span className="meta-item">
                <Clock size={14} />
                <span>{formatRelativeTime(featuredArticle.created_at || featuredArticle.date)}</span>
              </span>
              <span className="meta-item">
                <span>{estimateReadingTime(featuredArticle.body || featuredArticle.excerpt)}</span>
              </span>
              <span className="meta-item">
                {featuredArticle.author.avatar ? (
                  <img src={featuredArticle.author.avatar} alt={featuredArticle.author.name} className="author-avatar" />
                ) : (
                  <User size={14} />
                )}
                <span>by <strong>{featuredArticle.author.name}</strong></span>
              </span>
            </div>

            <p className="featured-excerpt">{featuredArticle.excerpt}</p>
            <a href="#read" className="read-more-link" onClick={(e) => { e.preventDefault(); onArticleClick(featuredArticle); }}>
              READ MORE
            </a>
          </div>
          <div className="featured-image-wrapper">
            <img src={featuredArticle.image} alt={featuredArticle.title} className="featured-img" />
          </div>
        </article>
      )}

      {/* Grid Articles Below */}
      <div className="articles-grid">
        {displayedArticles.map((article) => {
          const categoryClass = article.category.toLowerCase();
          return (
            <article key={article.id} className="grid-article-card" onClick={() => onArticleClick(article)}>
              <div className="card-image-wrapper">
                <img src={article.image} alt={article.title} className="card-img" />
              </div>
              <div className="card-content">
                <span className={`category-badge ${categoryClass}`}>{article.category}</span>
                <h3 className="card-title">{article.title}</h3>
                <p className="card-excerpt">{article.excerpt}</p>
                
                <div className="card-meta">
                  <span className="meta-item">
                    <Clock size={12} />
                    <span>{formatRelativeTime(article.created_at || article.date)} • {estimateReadingTime(article.body || article.excerpt)}</span>
                  </span>
                  <span className="meta-item">
                    {article.author.avatar ? (
                      <img src={article.author.avatar} alt={article.author.name} className="author-avatar-sm" />
                    ) : (
                      <User size={12} />
                    )}
                    <span>by {article.author.name}</span>
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load More Button */}
      {visibleCount < gridArticles.length && (
        <div className="load-more-wrapper">
          <button className="load-more-btn" onClick={() => setVisibleCount(prev => prev + 6)}>
            Load More News
          </button>
        </div>
      )}

    </div>
  );
}
