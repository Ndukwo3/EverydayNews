import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from 'lucide-react';
import { fetchEditorsPicks } from '../lib/api';
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
  const navigate = useNavigate();

  // Load fresh editor's picks from our database
  useEffect(() => {
    let active = true;
    
    async function loadFeatured() {
      setIsLoading(true);
      try {
        const dbPicks = await fetchEditorsPicks();
        if (active && dbPicks && dbPicks.length > 0) {
          const formattedSlides = dbPicks.map((item, idx) => ({
            id: item.id,
            site: item.author_name ? item.author_name.toUpperCase() : 'EVERYDAY NEWS',
            category: item.category || 'FEATURED',
            title: item.title.toUpperCase(),
            subtitle: item.excerpt,
            image: item.image_url || FALLBACK_SLIDES[idx % FALLBACK_SLIDES.length].image,
            link: `/article/${item.id}`,
            isInternal: true,
            keywords: item.author_name ? `BY · ${item.author_name.toUpperCase()}` : 'BREAKING · NEWS'
          }));
          setSlides(formattedSlides);
        }
      } catch (err) {
        console.warn("Failed to load featured banner slides, keeping fallback:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadFeatured();
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
      onClick={() => {
        if (currentSlide.isInternal) {
          navigate(currentSlide.link);
        } else {
          window.open(currentSlide.link, '_blank');
        }
      }}
      title="Click to read article"
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
