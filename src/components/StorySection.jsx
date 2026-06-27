import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MessageCircle, Clock } from 'lucide-react';
import './StorySection.css';

export default function StorySection({ data, onArticleClick }) {
  const navigate = useNavigate();
  if (!data) return null;
  const { tag, tagHighlight, featured, moreLabel, articles } = data;

  return (
    <section className="story-section">

      {/* Featured Story */}
      <div className="story-tag-row">
        <span className="story-tag-label">{tag}</span>
        <span className="story-tag-highlight">{tagHighlight}</span>
      </div>

      <div className="story-featured" onClick={() => onArticleClick && onArticleClick(featured)}>
        {/* Left: Text content */}
        <div className="story-featured-left">
          <h2 className="story-featured-title">{featured.title}</h2>

          <div className="story-author-row">
            <img
              className="story-author-avatar"
              src={featured.author.avatar}
              alt={featured.author.name}
            />
            <div className="story-author-info">
              <span className="story-author-name">{featured.author.name}</span>
              <span className="story-author-role">{featured.author.role}</span>
            </div>
            <div className="story-date">
              <Clock size={13} />
              {featured.date}
            </div>
          </div>

          <p className="story-featured-excerpt">
            {featured.excerpt}{' '}
            <span className="story-read-more">READ MORE</span>
          </p>
        </div>

        {/* Right: Featured image */}
        <div className="story-featured-img-wrapper">
          <img src={featured.image} alt={featured.title} />
        </div>
      </div>

      {/* More Articles Header */}
      <div className="story-more-header" onClick={() => navigate('/news')}>
        <span className="story-more-icon">▶</span>
        <span className="story-more-label">{moreLabel}</span>
      </div>

      {/* 3-Column Article List */}
      <div className="story-articles-grid">
        {articles.map((article) => (
          <div
            key={article.id}
            className="story-article-item"
            onClick={() => onArticleClick && onArticleClick(article)}
          >
            <div className="story-article-thumb">
              <img src={article.image} alt={article.title} />
            </div>
            <div className="story-article-details">
              <p className="story-article-title">{article.title}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
