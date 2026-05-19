// ForgotPassword.jsx - Modern Version

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Mail, 
  Key, 
  Lock, 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Shield,
  RefreshCw
} from 'lucide-react';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    cnfPassword: ""
  });
  const [send, setSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const verifyMail = async () => {
    if (!form.email) {
      setError({ email: "Please enter your email address" });
      return;
    }
    
    setLoading(true);
    setGeneralError('');
    
    try {
      const res = await axios.post('http://localhost:5000/user/verify-mail', { email: form.email });
      if (res.data.message === "Otp sent.") {
        setOtpSent(true);
        setSend(true);
        alert('OTP sent to your email successfully!');
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setGeneralError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let newError = {};
    if (!form.email) newError.email = "Email is required.";
    if (!form.otp) newError.otp = "Please enter the OTP.";
    if (!form.password) newError.password = "Password is required.";
    if (!form.cnfPassword) newError.cnfPassword = "Confirm your password.";
    if (form.password !== form.cnfPassword) newError.cnfPassword = "Passwords don't match.";
    if (form.password && form.password.length < 6) newError.password = "Password must be at least 6 characters.";
    
    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }
    
    setLoading(true);
    setGeneralError('');
    setSuccess('');
    
    try {
      const userData = {
        email: form.email,
        otp: form.otp,
        password: form.password
      };
      
      const res = await axios.post('http://localhost:5000/user/forgot-password', userData);
      if(res.data.message === "password updated."){
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
        navigate('/login');
      }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setGeneralError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-container">
        <button onClick={() => navigate('/login')} className="back-btn">
          <ArrowLeft size={18} />
          Back to Login
        </button>
        
        <div className="forgot-header">
          <div className="header-icon">
            <Shield size={32} />
          </div>
          <h1>Forgot Password?</h1>
          <p>Don't worry! It happens. Enter your email and we'll send you an OTP to reset your password.</p>
        </div>
        
        {generalError && (
          <div className="alert error">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}
        
        {success && (
          <div className="alert success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}
        
        <form className="forgot-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label>
              <Mail size={16} />
              Email Address
            </label>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Enter your registered email"
                name="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setError({ ...error, email: '' });
                }}
                className={error.email ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {error.email && <span className="error-text">{error.email}</span>}
          </div>
          
          {/* OTP Field */}
          <div className="form-group">
            <label>
              <Key size={16} />
              Verification Code
            </label>
            <div className="input-group">
              <Key size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Enter OTP"
                name="otp"
                value={form.otp}
                onChange={(e) => {
                  setForm({ ...form, otp: e.target.value });
                  setError({ ...error, otp: '' });
                }}
                className={error.otp ? 'error' : ''}
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={verifyMail}
                className="otp-btn"
                disabled={loading || otpSent}
              >
                {loading ? <RefreshCw size={16} className="spinning" /> : <Send size={16} />}
                {otpSent ? 'Sent!' : 'Send OTP'}
              </button>
            </div>
            {error.otp && <span className="error-text">{error.otp}</span>}
            <small className="hint-text">
              Enter the 6-digit code sent to your email address
            </small>
          </div>
          
          {/* New Password Field */}
          <div className="form-group">
            <label>
              <Lock size={16} />
              New Password
            </label>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Enter new password"
                name="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setError({ ...error, password: '' });
                }}
                className={error.password ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {error.password && <span className="error-text">{error.password}</span>}
            <small className="hint-text">Password must be at least 6 characters</small>
          </div>
          
          {/* Confirm Password Field */}
          <div className="form-group">
            <label>
              <Lock size={16} />
              Confirm Password
            </label>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Confirm your new password"
                name="cnfPassword"
                value={form.cnfPassword}
                onChange={(e) => {
                  setForm({ ...form, cnfPassword: e.target.value });
                  setError({ ...error, cnfPassword: '' });
                }}
                className={error.cnfPassword ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {error.cnfPassword && <span className="error-text">{error.cnfPassword}</span>}
          </div>
          
          <button type="submit" className="update-btn" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Resetting Password...
              </>
            ) : (
              <>
                <Lock size={18} />
                Reset Password
              </>
            )}
          </button>
        </form>
        
        <div className="forgot-footer">
          <p>
            Remember your password?{' '}
            <button onClick={() => navigate('/login')} className="link-btn">
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;