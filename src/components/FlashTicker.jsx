import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import './FlashTicker.css';

export default function FlashTicker({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const isClickable = currentItem && typeof currentItem === 'object' && currentItem.id;
  const displayText = isClickable ? currentItem.text : currentItem;

  const handleItemClick = () => {
    if (isClickable) {
      navigate(`/article/${currentItem.id}`);
    }
  };

  return (
    <div className="flash-ticker">
      <div className="flash-label">
        <Zap size={14} className="flash-icon" />
        <span>FLASH</span>
      </div>
      <div className="flash-content">
        <span 
          key={currentIndex} 
          className="flash-text fade-in"
          style={{ cursor: isClickable ? 'pointer' : 'default' }}
          onClick={handleItemClick}
        >
          {displayText}
        </span>
      </div>
      <div className="flash-controls">
        <button onClick={handlePrev} className="control-btn" aria-label="Previous flash news">
          <ChevronLeft size={16} />
        </button>
        <button onClick={handleNext} className="control-btn" aria-label="Next flash news">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
