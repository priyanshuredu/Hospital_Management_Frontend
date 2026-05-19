import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import axios from 'axios';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return Object.values(requirements).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match!');
      return;
    }
    
    if (!validatePassword(formData.newPassword)) {
      setError('Password does not meet requirements!');
      return;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password!');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('Token')
      const response = await axios.patch(
        'http://localhost:5000/user/reset-password',
        {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Handle success
      setSuccess('Password changed successfully!');
      console.log('Password reset response:', response.data);
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Optional: Redirect after 2 seconds
      setTimeout(() => {
        // window.location.href = '/login'; // Uncomment to redirect
      }, 2000);
      
    } catch (err) {
      // Handle different error scenarios
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data.message || err.response.data.error;
        switch (err.response.status) {
          case 400:
            setError(errorMessage || 'Invalid request. Please check your input.');
            break;
          case 401:
            setError('Current password is incorrect.');
            break;
          case 403:
            setError('You are not authorized to change this password.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(errorMessage || 'Failed to reset password. Please try again.');
        }
      } else if (err.request) {
        // Request was made but no response
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`reset-password-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="password-header">
        <h1>Reset Password</h1>
        <p>Change your account password</p>
      </div>

      <div className="password-content">
        <form onSubmit={handleSubmit} className="password-form">
          {/* Error Message */}
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="success-message" style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                <CheckCircle size={14} /> At least 8 characters long
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                <CheckCircle size={14} /> Contains uppercase & lowercase letters
              </li>
              <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                <CheckCircle size={14} /> Contains at least one number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'valid' : ''}>
                <CheckCircle size={14} /> Contains at least one special character
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button 
              type="button" 
              className="show-password-btn" 
              onClick={toggleShowPassword}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              {showPassword ? 'Hide Password' : 'Show Password'}
            </button>
          </div>

          <button 
            type="submit" 
            className="reset-btn" 
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <Lock size={18} />
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;