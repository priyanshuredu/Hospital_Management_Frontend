import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  User, 
  Edit3, 
  Lock, 
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Clock,
  Users,
  DollarSign,
  FileText,
  Bell,
  Shield
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/DoctorSidebar.css';
import { logout } from '../services/logout';

const DoctorSidebar = ({ activeTab, setActiveTab }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = {
    main: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
    ],
    profile: [
      { id: 'edit-profile', label: 'Edit Profile', icon: Edit3 },
      { id: 'reset-password', label: 'Reset Password', icon: Lock },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: Shield },
    ]
  };

  // Doctor statistics for sidebar display
  const doctorStats = {
    todayAppointments: 8,
    pendingAppointments: 3,
    totalPatients: 245
  };

  return (
    <div className={`doctor-sidebar ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Logo Section */}
      <div className="doctor-logo-section">
        <Stethoscope className="doctor-logo-icon" size={32} />
        <div className="doctor-logo-text">
          <h2>Dr. Portal</h2>
          <p>Doctor Dashboard</p>
        </div>
      </div>

      {/* Doctor Info Card
      <div className="doctor-info-card">
        <div className="doctor-avatar-large">
          <User size={40} />
        </div>
        <div className="doctor-info-details">
          <h3>Dr. Sarah Johnson</h3>
          <p>Cardiologist</p>
          <span className="doctor-id">ID: DOC-2024-001</span>
        </div>
      </div>

      Quick Stats
      <div className="doctor-quick-stats">
        <div className="stat-item">
          <Clock size={16} />
          <div>
            <span className="stat-value">{doctorStats.todayAppointments}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>
        <div className="stat-item">
          <Users size={16} />
          <div>
            <span className="stat-value">{doctorStats.pendingAppointments}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-item">
          <FileText size={16} />
          <div>
            <span className="stat-value">{doctorStats.totalPatients}</span>
            <span className="stat-label">Patients</span>
          </div>
        </div>
      </div> */}

      {/* Navigation Menu */}
      <nav className="doctor-nav-menu">
        {menuItems.main.map(item => (
          <div key={item.id} className="doctor-nav-item">
            <button
              className={`doctor-nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.id === 'appointments' && doctorStats.pendingAppointments > 0 && (
                <span className="notification-badge">{doctorStats.pendingAppointments}</span>
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="doctor-sidebar-bottom">
        {/* Theme Toggle */}
        <button className="doctor-theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="doctor-user-section">
          <button 
            className="doctor-user-info"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="doctor-user-avatar">
              <User size={24} />
            </div>
            <div className="doctor-user-details">
              <span className="doctor-username">Dr. Sarah Johnson</span>
              <span className="doctor-user-status">Online</span>
            </div>
            {isProfileOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isProfileOpen && (
            <div className="doctor-profile-dropdown">
              {menuItems.profile.map(item => (
                <button
                  key={item.id}
                  className={`doctor-profile-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
              <hr className="doctor-dropdown-divider" />
              <button className="doctor-profile-item logout" onClick={() => logout()}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar;