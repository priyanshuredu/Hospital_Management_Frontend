import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const { isDarkMode } = useTheme();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
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
    setError('');
    setSuccess('');
  };

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      case: /[A-Z]/.test(password) && /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordValidation = validatePassword(formData.newPassword);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match!');
      return;
    }
    
    if (!isPasswordValid) {
      setError('Password does not meet requirements!');
      return;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password!');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('Token');
      const response = await axios.patch(
        'https://hospital-management-backend-9u93.onrender.com/user/reset-password',
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

      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        // Optional: Redirect
      }, 2000);
      
    } catch (err) {
      if (err.response) {
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
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className={`reset-password-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="reset-password-wrapper">
        <div className="password-header">
          <h1>Reset Password</h1>
          <p>Change your account password</p>
        </div>

        <div className="password-content">
          <form onSubmit={handleSubmit} className="password-form">
            {error && (
              <div className="alert-message error">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert-message success">
                {success}
              </div>
            )}

            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={passwordValidation.length ? 'valid' : 'invalid'}>
                  {passwordValidation.length ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  At least 8 characters long
                </li>
                <li className={passwordValidation.case ? 'valid' : 'invalid'}>
                  {passwordValidation.case ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Contains uppercase & lowercase letters
                </li>
                <li className={passwordValidation.number ? 'valid' : 'invalid'}>
                  {passwordValidation.number ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Contains at least one number
                </li>
                <li className={passwordValidation.special ? 'valid' : 'invalid'}>
                  {passwordValidation.special ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Contains at least one special character
                </li>
              </ul>
            </div>

            <button 
              type="submit" 
              className="reset-btn" 
              disabled={loading}
            >
              <Lock size={18} />
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;