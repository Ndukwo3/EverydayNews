import React, { useState, useEffect } from 'react';
import { X, Send, Bell } from 'lucide-react';
import { WHATSAPP_BOT_NUMBER } from '../lib/api';
import './WhatsAppPopup.css';

export default function WhatsAppPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+234');

  useEffect(() => {
    // Check if user has already dismissed the popup in this session
    const isDismissed = sessionStorage.getItem('everyday_news_popup_dismissed');
    if (isDismissed) return;

    const handleScroll = () => {
      // Trigger popup when user scrolls down past 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
        // Remove event listener once triggered
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Mark as dismissed for the current session so they don't get interrupted again on every page click
    sessionStorage.setItem('everyday_news_popup_dismissed', 'true');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanNum = phone.replace(/[^0-9]/g, '');
    if (!cleanNum) {
      alert('Please enter a valid phone number.');
      return;
    }

    // Redirect user to WhatsApp with the automated START message
    const msg = "START";
    const waUrl = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(msg)}`;
    
    // Open in a new tab
    window.open(waUrl, '_blank');
    
    // Close the popup and save state
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="whatsapp-popup-overlay">
      <div className="whatsapp-popup-card">
        {/* Close button in top-right */}
        <button className="popup-close-btn" onClick={handleClose} aria-label="Close popup">
          <X size={18} />
        </button>

        <div className="popup-badge-icon">
          <Bell size={24} className="badge-ring-icon" />
        </div>

        <h3 className="popup-title">WhatsApp Digest</h3>
        <p className="popup-desc">
          Get real-time news briefs delivered directly to your WhatsApp. Subscribe to our free Morning, Afternoon, and Dawn bulletins!
        </p>

        <form onSubmit={handleSubmit} className="popup-form">
          <div className="popup-input-group">
            <select
              className="popup-country-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+234">🇳🇬 +234</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+233">🇬🇭 +233</option>
              <option value="+27">🇿🇦 +27</option>
              <option value="+254">🇰🇪 +254</option>
              <option value="+33">🇫🇷 +33</option>
            </select>
            <input
              type="tel"
              className="popup-tel-input"
              placeholder="Local Number (e.g. 8030000000)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="popup-subscribe-btn">
            SUBSCRIBE <Send size={14} style={{ marginLeft: '6px' }} />
          </button>
        </form>
        <p className="popup-footer-note">Reply STOP at any time to unsubscribe instantly.</p>
      </div>
    </div>
  );
}
