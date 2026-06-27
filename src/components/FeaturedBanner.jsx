import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from 'lucide-react';
import './FeaturedBanner.css';

// Stunning fallback magazines/posts that look like futuristic science/finance picks
const FALLBACK_SLIDES = [
  {
    id: 1,
    site: 'INSIDER',
    category: 'TECH FORECAST',
    title: 'SILICON CONSCIOUSNESS',
    subtitle: 'The secret race for next-generation bio-synaptic AI accelerators.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
    link: 'https://www.businessinsider.com',
    keywords: 'NVIDIA · TSMC · CEREBRAS'
  },
  {
    id: 2,
    site: 'INVESTOPEDIA',
    category: 'QUANTUM FINANCE',
    title: 'THE ALGORITHMIC EDGE',
    subtitle: 'How sub-millisecond quantum computing is rewriting market arbitrage.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1600&auto=format&fit=crop',
    link: 'https://www.investopedia.com',
    keywords: 'FINTECH · BLOCKCHAIN · SEC'
  },
  {
    id: 3,
    site: 'THE ECONOMIST',
    category: 'GLOBAL ENERGY',
    title: 'THE FUSION PARADOX',
    subtitle: 'Commercial net-energy reactors are coming sooner than you think.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1600&auto=format&fit=crop',
    link: 'https://www.economist.com',
    keywords: 'TOKAMAK · ITER · HELION'
  },
  {
    id: 4,
    site: 'BLOOMBERG',
    category: 'FUTURE COMMERCE',
    title: 'MINING THE ASTEROIDS',
    subtitle: 'The trillion-dollar venture to extract platinum from Near-Earth space.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    link: 'https://www.bloomberg.com',
    keywords: 'NASA · DEEP SPACE · REE'
  }
];

export default function FeaturedBanner() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Try to load fresh headlines from RSS feeds and merge them into our gorgeous slides
  useEffect(() => {
    let active = true;
    
    async function fetchLiveHeadlines() {
      setIsLoading(true);
      try {
        const feeds = [
          {
            site: 'INSIDER',
            url: 'https://www.businessinsider.com/rss',
            fallbackIndex: 0
          },
          {
            site: 'INVESTOPEDIA',
            url: 'https://www.investopedia.com/feed-rss-4769781',
            fallbackIndex: 1
          },
          {
            site: 'THE ECONOMIST',
            url: 'https://www.economist.com/sections/business-finance/rss.xml',
            fallbackIndex: 2
          }
        ];

        // Fetch each feed via a public CORS proxy
        const updatedSlides = [...FALLBACK_SLIDES];

        for (const feed of feeds) {
          try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
            const res = await fetch(proxyUrl);
            const json = await res.json();
            
            if (json.contents) {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(json.contents, 'text/xml');
              const firstItem = xmlDoc.querySelector('item');
              
              if (firstItem && active) {
                const rawTitle = firstItem.querySelector('title')?.textContent || '';
                const link = firstItem.querySelector('link')?.textContent || feed.url;
                const description = firstItem.querySelector('description')?.textContent || '';
                
                // Clean up title (remove HTML tags, limit length, uppercase for style)
                const cleanTitle = rawTitle.replace(/<[^>]*>/g, '').trim().toUpperCase();
                // Clean up description/subtitle
                const cleanDesc = description.replace(/<[^>]*>/g, '').trim().slice(0, 120) + '...';

                // Update the matching slide info
                if (cleanTitle) {
                  updatedSlides[feed.fallbackIndex] = {
                    ...updatedSlides[feed.fallbackIndex],
                    title: cleanTitle.length > 50 ? cleanTitle.slice(0, 50) + '...' : cleanTitle,
                    subtitle: cleanDesc || updatedSlides[feed.fallbackIndex].subtitle,
                    link: link
                  };
                }
              }
            }
          } catch (e) {
            console.warn(`Could not update live feed for ${feed.site}, using premium fallback.`, e);
          }
        }

        if (active) {
          setSlides(updatedSlides);
        }
      } catch (err) {
        console.error('Failed to fetch feeds', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchLiveHeadlines();
    return () => {
      active = false;
    };
  }, []);

  // Slide autoplay effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="future-featured-banner"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onClick={() => window.open(currentSlide.link, '_blank')}
      title="Click to read original article"
    >
      {/* Background Slides Container */}
      <div className="slides-viewport">
        {slides.map((slide, idx) => (
          <div 
            key={slide.id} 
            className={`slide-item ${idx === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-dark-overlay" />
          </div>
        ))}
      </div>

      {/* Futuristic Grid Line Effects */}
      <div className="futuristic-grid-overlay" />

      {/* Floating Controls */}
      <div className="banner-controls">
        <button className="control-btn" onClick={handlePrev} aria-label="Previous Slide">
          <ChevronLeft size={20} />
        </button>
        <button 
          className="control-btn play-pause-btn" 
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          aria-label={isPlaying ? 'Pause Autoplay' : 'Play Autoplay'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="control-btn" onClick={handleNext} aria-label="Next Slide">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide Indicators / Progress Bars */}
      <div className="slide-progress-indicators" onClick={(e) => e.stopPropagation()}>
        {slides.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`progress-indicator-track ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          >
            <div className="progress-fill" style={{ animationDuration: isPlaying ? '6000ms' : '0ms' }} />
          </div>
        ))}
      </div>

      {/* Slide Content Overlay */}
      <div className="banner-content">
        <div className="badge-row">
          <div className="live-pill-tag">
            <span className="live-pulsar" />
            LIVE FEED
          </div>
          <span className="mag-source-badge">{currentSlide.site}</span>
          <span className="mag-category-badge">{currentSlide.category}</span>
        </div>

        <div className="main-headline-group">
          <h2 className="headline-text">{currentSlide.title}</h2>
          <p className="headline-sub">{currentSlide.subtitle}</p>
        </div>

        <div className="footer-meta-row">
          <span className="spaced-keywords">{currentSlide.keywords}</span>
          <div className="link-arrow-indicator">
            READ ORIGINAL <ExternalLink size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
