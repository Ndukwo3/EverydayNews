import React from 'react';
import { Clock, User } from 'lucide-react';
import FeaturedBanner from './FeaturedBanner';
import './EditorsPick.css';

export default function EditorsPick({ articles = [], onArticleClick }) {
  // Find featured (middle) article, fallback to index 2 or 0 if none marked
  const middleArticle = articles.find(a => a.featured) || articles[2] || articles[0];
  
  // Filter out the middle article
  const remainingArticles = articles.filter(a => a.id !== middleArticle?.id);
  
  // Left column gets the first 2 remaining
  const leftColArticles = remainingArticles.slice(0, 2);
  
  // Right column gets the next 2 remaining
  const rightColArticles = remainingArticles.slice(2, 4);


  return (
    <div className="editors-pick-section">
      
      {/* 1. Futuristic Dynamic magazines Picker Banner */}
      <FeaturedBanner />

      {/* 2. Editor's Pick Title */}
      <div className="editors-pick-header">
        <h2 className="editors-pick-title">
          <span className="title-editors">Editor's</span> <span className="title-pick">Pick</span>
        </h2>
      </div>

      {/* 3. 3-Column Layout */}
      <div className="editors-pick-grid">
        
        {/* Left Column (2 Small Cards) */}
        <div className="grid-column side-column">
          {leftColArticles.map((article) => (
            <article key={article.id} className="small-article-card" onClick={() => onArticleClick(article)}>
              <div className="small-card-img-wrapper">
                <img src={article.image} alt={article.title} />
              </div>
              <div className="small-card-details">
                <h4 className="small-card-title">{article.title}</h4>
                <div className="small-card-meta">
                  <span className="meta-item"><Clock size={12} /> {article.date}</span>
                  <span className="meta-item">by {article.author.name}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Middle Column (1 Large Featured Card) */}
        <div className="grid-column middle-column">
          {middleArticle && (
            <article className="large-middle-card" onClick={() => onArticleClick(middleArticle)}>
              <div className="large-card-img-wrapper">
                <img src={middleArticle.image} alt={middleArticle.title} />
              </div>
              <div className="large-card-details">
                <div className="large-card-meta">
                  <span className="meta-item"><Clock size={12} /> {middleArticle.date}</span>
                  <span className="meta-item">by {middleArticle.author.name}</span>
                </div>
                <h3 className="large-card-title">{middleArticle.title}</h3>
                <p className="large-card-excerpt">{middleArticle.excerpt}</p>
                <a href="#read" className="large-card-read-more" onClick={(e) => { e.preventDefault(); onArticleClick(middleArticle); }}>
                  READ MORE
                </a>
              </div>
            </article>
          )}
        </div>

        {/* Right Column (2 Small Cards) */}
        <div className="grid-column side-column">
          {rightColArticles.map((article) => (
            <article key={article.id} className="small-article-card" onClick={() => onArticleClick(article)}>
              <div className="small-card-img-wrapper">
                <img src={article.image} alt={article.title} />
              </div>
              <div className="small-card-details">
                <h4 className="small-card-title">{article.title}</h4>
                <div className="small-card-meta">
                  <span className="meta-item"><Clock size={12} /> {article.date}</span>
                  <span className="meta-item">by {article.author.name}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

    </div>
  );
}
