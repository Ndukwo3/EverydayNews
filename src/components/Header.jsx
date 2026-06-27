import React, { useState } from 'react';
import { Search, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ categories = [], activeCategory, onSelectCategory, onLoginClick, onSearchChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setSuggestions([]);
    if (searchOpen) {
      setSearchQuery('');
      if (onSearchChange) onSearchChange('');
    }
  };

  const handleCategorySelect = (category) => {
    if (category === 'ALL') {
      navigate('/');
    } else {
      navigate(`/${category.toLowerCase()}`);
    }
    if (onSelectCategory) onSelectCategory(category);
    setMobileMenuOpen(false);
  };


  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearchChange) onSearchChange(query);

    if (query.trim() === '') {
      setSuggestions([]);
    } else {
      const cached = localStorage.getItem('everyday_news_articles');
      if (cached) {
        const articles = JSON.parse(cached);
        const filtered = articles.filter(art => 
          art.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setSuggestions(filtered);
      }
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        
        {/* Mobile Menu Button */}
        {!mobileMenuOpen && (
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <Menu size={24} />
          </button>
        )}

        {/* Logo */}
        <a href="/" className="logo" onClick={(e) => { e.preventDefault(); handleCategorySelect('ALL'); }}>
          <span className="logo-everyday">Everyday</span>
          <span className="logo-news">News</span>
        </a>

        {/* Navigation Categories */}
        <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li>
              <button 
                className={`nav-link ${activeCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => handleCategorySelect('ALL')}
              >
                ALL
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  className={`nav-link ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
            {/* Mobile close button inside the list */}
            <li className="mobile-menu-close-item">
              <button className="mobile-menu-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </li>
          </ul>
        </nav>

        {/* Action Controls */}
        <div className="header-actions">
          {searchOpen && (
            <div className="search-wrapper">
              <input 
                type="text" 
                className="search-input fade-in" 
                placeholder="Search news..." 
                value={searchQuery}
                onChange={handleSearchInput}
                autoFocus
              />
              {suggestions.length > 0 && (
                <ul className="search-suggestions-dropdown">
                  {suggestions.map((art) => (
                    <li 
                      key={art.id} 
                      className="suggestion-item" 
                      onClick={() => {
                        navigate(`/article/${art.id}`);
                        setSearchOpen(false);
                        setSuggestions([]);
                        setSearchQuery('');
                      }}
                    >
                      <span className="suggestion-category">{art.category}</span>
                      <span className="suggestion-title">{art.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <button className={`action-btn ${searchOpen ? 'active' : ''}`} onClick={toggleSearch} aria-label="Search">
            <Search size={20} />
          </button>

          {isAuthenticated ? (
            <div className="user-profile-menu">
              {user?.email === 'ndukwovictor3@gmail.com' && (
                <button className="admin-shortcut-btn" onClick={() => navigate('/admin')} title="Go to Admin Dashboard">
                  <LayoutDashboard size={15} />
                  <span>ADMIN</span>
                </button>
              )}
              <button className="logout-shortcut-btn" onClick={signOut} title="Sign Out">
                <LogOut size={15} />
                <span>LOGOUT</span>
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={onLoginClick}>
              <User size={16} className="login-icon" />
              <span>LOGIN</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
