// NotFound.jsx
import React from 'react';
import '../styles/NotFound.css';

const NotFound = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.172 16.172C10.366 15.366 12 15.366 13.828 16.172M10 10H10.01M14 10H14.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="10" cy="10" r="0.5" fill="currentColor" stroke="currentColor"/>
            <circle cx="14" cy="10" r="0.5" fill="currentColor" stroke="currentColor"/>
          </svg>
        </div>
        
        <div className="error-code-large">404</div>
        
        <h1 className="not-found-title">Page Not Found</h1>
        
        <div className="not-found-message">
          <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        </div>
        
        <div className="not-found-actions">
          <button onClick={handleGoBack} className="btn btn-outline">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Go Back
          </button>
          <button onClick={handleGoHome} className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M3 9L12 3L21 9V20H15V14H9V20H3V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Home Page
          </button>
        </div>

        <div className="suggestions">
          <p>You might want to check:</p>
          <ul>
            <li>The URL for typos</li>
            <li>Your internet connection</li>
            <li>If the page was moved or deleted</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;