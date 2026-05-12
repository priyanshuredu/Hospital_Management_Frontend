import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    console.log('Password reset:', formData);
    alert('Password changed successfully!');
  };

  return (
    <div className={`reset-password-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="password-header">
        <h1>Reset Password</h1>
        <p>Change your account password</p>
      </div>

      <div className="password-content">
        <form onSubmit={handleSubmit} className="password-form">
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
              />
            </div>
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li><CheckCircle size={14} /> At least 8 characters long</li>
              <li><CheckCircle size={14} /> Contains uppercase & lowercase letters</li>
              <li><CheckCircle size={14} /> Contains at least one number</li>
              <li><CheckCircle size={14} /> Contains at least one special character</li>
            </ul>
          </div>

          <button type="button" className="show-password-btn" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPassword ? 'Hide Password' : 'Show Password'}
          </button>

          <button type="submit" className="reset-btn">
            <Lock size={18} />
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;