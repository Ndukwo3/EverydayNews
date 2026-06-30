import React, { useState } from 'react';
import { subscribeWhatsApp } from '../lib/api';
import './Footer.css';

export default function Footer() {
  const [activeTab, setActiveTab] = useState('WHATSAPP'); // 'EMAIL' or 'WHATSAPP'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'EMAIL') {
        // Mock email subscribe
        setTimeout(() => {
          setEmail('');
          setSuccessMsg('Email subscribed successfully!');
          setIsSubmitting(false);
        }, 800);
      } else {
        // Supabase WhatsApp subscribe
        const fullPhoneNumber = `${countryCode}${phone}`;
        await subscribeWhatsApp(fullPhoneNumber);
        setPhone('');
        setSuccessMsg('WhatsApp subscribed successfully!');
        setIsSubmitting(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to subscribe, please try again.');
      setIsSubmitting(false);
    }
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
            Subscribe to <strong>Everyday News</strong>
          </h3>
          <div className="newsletter-tabs">
            <button 
              className={`tab-btn ${activeTab === 'WHATSAPP' ? 'active' : ''}`}
              onClick={() => { setActiveTab('WHATSAPP'); setSuccessMsg(''); }}
            >
              WHATSAPP DIGEST
            </button>
            <button 
              className={`tab-btn ${activeTab === 'EMAIL' ? 'active' : ''}`}
              onClick={() => { setActiveTab('EMAIL'); setSuccessMsg(''); }}
            >
              EMAIL NEWSLETTER
            </button>
          </div>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            {activeTab === 'EMAIL' ? (
              <input
                type="email"
                className="newsletter-input"
                placeholder="Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            ) : (
              <div className="whatsapp-input-group">
                <select 
                  className="country-select"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isSubmitting}
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
                  className="newsletter-input tel-input"
                  placeholder="Phone Number (e.g. 8030000000)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}
            <button type="submit" className="newsletter-btn" disabled={isSubmitting}>
              {isSubmitting ? '...' : 'Send'}
            </button>
          </form>
          {successMsg && <div className="newsletter-success">{successMsg}</div>}
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Everyday News. All rights reserved.</p>
      </div>
    </footer>
  );
}
