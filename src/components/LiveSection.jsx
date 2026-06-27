import React from 'react';
import CNNLivePlayer from './CNNLivePlayer';
import './LiveSection.css';

export default function LiveSection({ articles = [], onArticleClick }) {
  return (
    <div className="live-section">

      {/* CNN Live Stream Embed */}
      <div className="live-hub-container">
        <div className="live-player-wrapper">
          <CNNLivePlayer />
          <div className="live-player-badge">
            <span className="live-pulse-dot"></span>
            LIVE · CNN International
          </div>
        </div>
      </div>

      {/* 4-Column Trending Articles */}
      <div className="trending-grid">
        {articles.map((article) => (
          <article key={article.id} className="trending-card" onClick={() => onArticleClick(article)}>
            <div className="trending-img-wrapper">
              <img src={article.image} alt={article.title} />
            </div>
            <div className="trending-content">
              <h4 className="trending-title">{article.title}</h4>
              <p className="trending-excerpt">{article.excerpt}</p>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}

