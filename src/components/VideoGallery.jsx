import React, { useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import './VideoGallery.css';

export default function VideoGallery({ data }) {
  const [playing, setPlaying] = useState(null);

  if (!data) return null;
  const { featured, sidebar } = data;

  return (
    <section className="video-gallery-section">
      {/* Section Title */}
      <div className="vg-header">
        <span className="vg-quote vg-quote-open">"</span>
        <h2 className="vg-title">VIDEO GALLERY</h2>
        <span className="vg-quote vg-quote-close">"</span>
      </div>

      {/* Main Layout */}
      <div className="vg-layout">

        {/* Featured Video */}
        <div className="vg-featured">
          <div
            className="vg-featured-thumb"
            onClick={() => setPlaying(featured.id)}
          >
            <img src={featured.thumbnail} alt={featured.title} />
            <div className="vg-overlay">
              {playing === featured.id ? (
                <div className="vg-playing-indicator">▶ Playing</div>
              ) : (
                <button className="vg-play-btn" aria-label="Play video">
                  <Play size={28} fill="#fff" />
                </button>
              )}
            </div>
            <span className="vg-duration">{featured.duration}</span>
          </div>
          <div className="vg-featured-info">
            <h3 className="vg-featured-title">{featured.title}</h3>
            <p className="vg-featured-excerpt">{featured.excerpt}</p>
          </div>
        </div>

        {/* Sidebar Videos + More Button */}
        <div className="vg-sidebar">
          {sidebar.map((video) => (
            <div key={video.id} className="vg-sidebar-card" onClick={() => setPlaying(video.id)}>
              <div className="vg-sidebar-thumb">
                <img src={video.thumbnail} alt={video.title} />
                <div className="vg-sidebar-overlay">
                  {playing === video.id ? (
                    <div className="vg-playing-indicator small">▶</div>
                  ) : (
                    <button className="vg-play-btn small" aria-label="Play">
                      <Play size={16} fill="#fff" />
                    </button>
                  )}
                </div>
                <span className="vg-duration small">{video.duration}</span>
              </div>
              <p className="vg-sidebar-title">{video.title}</p>
            </div>
          ))}

          {/* More Video CTA */}
          <div className="vg-more-row">
            <button className="vg-more-btn">
              <span className="vg-more-icon"><ArrowRight size={20} /></span>
              MORE VIDEO
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
