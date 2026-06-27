import React, { useState } from 'react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="site-footer">
      <div className="footer-content-wrap">
        {/* Left Side: Logo & Brand Bio */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <span className="footer-logo-everyday">Everyday</span>
            <span className="footer-logo-news"> News</span>
          </div>
          <p className="footer-brand-desc">
            Everyday News is a premier independent news portal delivering accurate, unbiased coverage. We provide real-time updates on politics, business, technology, sports, and culture.
          </p>
        </div>

        {/* Right Side: Newsletter Subscription */}
        <div className="footer-newsletter-col">
          <h3 className="newsletter-title">
            Subscribe to <strong>Our Newsletter</strong>
          </h3>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">Send</button>
          </form>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Everyday News. All rights reserved.</p>
      </div>
    </footer>
  );
}
