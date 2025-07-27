import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    // Simulate a brief login delay for better UX
    setTimeout(() => {
      if (credentials.username === 'Admin' && credentials.password === 'YellowHutAdmin@123') {
        onLogin(true);
      } else {
        setError('Invalid username or password. Please try again.');
        setIsLoggingIn(false);
      }
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">🏠</div>
              <h1 className="app-title">YellowHut</h1>
              <p className="app-subtitle">Service Center Management</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="input-field"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-field"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoggingIn || !credentials.username || !credentials.password}
            >
              {isLoggingIn ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  🔐 Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              Secure access to YellowHut Service Center
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
