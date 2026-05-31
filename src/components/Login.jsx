import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newFieldErrors = {};
    if (!form.email) newFieldErrors.email = "Email is required.";
    if (!form.password) newFieldErrors.password = "Password is required.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      console.log("form",form)
      const response = await axios.post('http://localhost:5000/user/login', form);
      console.log("Response:", response);
      
      const token = response.data.token;
      // const userId = response.data.id;
      // const userName = response.data.username;
      // const role = response.data.role;
      // const email = response.data.email;
      // const host = response.data.host
      // const machine = response.data.machine;
      const user = response.data.userData;
      const role = user.role;

      if (user && token) {
        sessionStorage.setItem('Token', token);
        sessionStorage.setItem('User Id', user._id);
        sessionStorage.setItem('User Name', user.userName);
        sessionStorage.setItem('role', user.role);
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('email', user.email);
        // sessionStorage.setItem('host', host);
        // sessionStorage.setItem('machine', machine);
        
        setLoading(false);
        
        if (role === "admin") {
          navigate('/super-admin');
        } else if(role === 'hospital-admin') {
          navigate('/hospital');
        } else if(role === 'lab-assistant') {
          navigate('/lab');
        } else if(role === 'doctor') {
          navigate('/doctor');
        } else if(role === 'user') {
          navigate('/');
        } else {
          navigate('/')
        }
      } else {
        setError(response.data.message || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Login failed';
        
        if (status === 400) {
          setError(message || 'Invalid email or password. Please try again.');
        } else if (status === 401) {
          setError('Unauthorized. Please check your credentials.');
        } else if (status === 404) {
          setError('User not found. Please sign up first.');
        } else {
          setError(message);
        }
      } else if (error.request) {
        // Request was made but no response
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-header">
          <div className="logo-icon">
            <LogIn size={32} />
          </div>
          <h2>Welcome Back</h2>
          <p>Login to access your tasks</p>
        </div>

        {error && (
          <div className="alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>
              <Mail size={16} />
              Email Address
            </label>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setFieldErrors({ ...fieldErrors, email: '' });
                  setError('');
                }}
                placeholder="     Enter your email"
                disabled={loading}
                className={fieldErrors.email ? 'error' : ''}
              />
            </div>
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label>
              <Lock size={16} />
              Password
            </label>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setFieldErrors({ ...fieldErrors, password: '' });
                  setError('');
                }}
                placeholder="     Enter your password"
                disabled={loading}
                className={fieldErrors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/signup')} 
              className="signup-link"
            >
              Sign up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;