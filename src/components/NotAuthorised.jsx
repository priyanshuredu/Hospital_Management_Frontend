// NotAuthorized.jsx
import React from 'react';
import '../styles/NotAuthorized.css';

const NotAuthorized = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="not-authorized-container">
      <div className="not-authorized-card">
        <div className="unauth-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H6C4.89543 7 4 7.89543 4 9V19C4 20.1046 4.89543 21 6 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="13" r="1" fill="currentColor"/>
            <path d="M12 11V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h1 className="unauth-title">Access Denied</h1>
        
        <div className="unauth-message">
          <p>You don't have permission to access this page.</p>
          <p>Please contact your administrator if you believe this is a mistake.</p>
        </div>
        
        <div className="unauth-actions">
          <button onClick={handleGoBack} className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Go Back
          </button>
          <button onClick={handleGoHome} className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M3 9L12 3L21 9V20H15V14H9V20H3V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Go to Home
          </button>
        </div>

        <div className="unauth-footer">
          <span className="error-code">403</span>
          <span>Unauthorized Access</span>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;