import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const {
    showLoginModal,
    modalMode,
    setModalMode,
    closeLoginModal,
    signIn,
    signUp,
    signInWithGoogle
  } = useAuth();

  if (!showLoginModal) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await signIn(email, password);
      closeLoginModal();
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
    setAuthLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const data = await signUp(signupEmail, signupPassword);
      if (data?.session) {
        closeLoginModal();
        setSignupEmail('');
        setSignupPassword('');
        setSignupName('');
      } else {
        setAuthError('Account created! Please check your email to confirm registration.');
        setModalMode('login');
      }
    } catch (err) {
      setAuthError(err.message);
    }
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeLoginModal();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={closeLoginModal}>
          <X size={20} />
        </button>

        {authError && (
          <div className="auth-error-banner">{authError}</div>
        )}

        {modalMode === 'login' && (
          <>
            <h2>Welcome to Everyday News</h2>
            <p className="modal-subtitle">Sign in to publish articles and manage your dashboard.</p>
            
            <button type="button" className="google-modal-login-btn" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '10px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.63-4.53-5.34-4.53z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Gmail
            </button>

            <div className="modal-divider"><span>or sign in with email</span></div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <input
                  type="email"
                  id="loginEmail"
                  required
                  placeholder="name@everyday.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPassword"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="submit-login-btn" disabled={authLoading}>
                {authLoading ? 'Signing in…' : 'SIGN IN'}
              </button>
            </form>

            <div className="modal-footer-links">
              <p>Don't have an account? <button className="modal-link-btn" onClick={() => { setModalMode('signup'); setAuthError(''); }}>Sign Up</button></p>
            </div>
          </>
        )}

        {modalMode === 'signup' && (
          <>
            <h2>Create Account</h2>
            <p className="modal-subtitle">Join Everyday News to customize feeds and save articles.</p>

            <button type="button" className="google-modal-login-btn" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '10px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.63-4.53-5.34-4.53z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign up with Gmail
            </button>

            <div className="modal-divider"><span>or fill details below</span></div>

            <form onSubmit={handleSignUp} className="login-form">
              <div className="form-group">
                <label htmlFor="signupName">Full Name</label>
                <input
                  type="text"
                  id="signupName"
                  required
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupEmail">Email Address</label>
                <input
                  type="email"
                  id="signupEmail"
                  required
                  placeholder="name@everyday.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signupPassword">Password</label>
                <div className="password-input-container">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    id="signupPassword"
                    required
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="submit-login-btn" disabled={authLoading}>
                {authLoading ? 'Creating account…' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <div className="modal-footer-links">
              <p>Already have an account? <button className="modal-link-btn" onClick={() => { setModalMode('login'); setAuthError(''); }}>Sign In</button></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
