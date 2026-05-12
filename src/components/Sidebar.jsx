import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  Map, 
  Building2, 
  User, 
  Edit3, 
  Lock, 
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Hospital
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLocationsOpen, setIsLocationsOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = {
    main: [
      { id: 'home', label: 'Home', icon: Home },
    ],
    locations: [
      { id: 'state', label: 'State', icon: MapPin },
      { id: 'district', label: 'District', icon: Map },
      { id: 'city', label: 'City', icon: Building2 },
    ],
    profile: [
      { id: 'edit-profile', label: 'Edit Profile', icon: Edit3 },
      { id: 'reset-password', label: 'Reset Password', icon: Lock },
    ]
  };

  return (
    <div className={`sidebar ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Logo Section */}
      <div className="logo-section">
        <Hospital className="logo-icon" size={32} />
        <div className="logo-text">
          <h2>HM</h2>
          <p>Hospital Management</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {/* Home */}
        <div className="nav-item">
          <button
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </div>

        {/* Locations Dropdown */}
        <div className="nav-dropdown">
          <button 
            className="dropdown-header"
            onClick={() => setIsLocationsOpen(!isLocationsOpen)}
          >
            <MapPin size={20} />
            <span>Locations</span>
            {isLocationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isLocationsOpen && (
            <div className="dropdown-items">
              {menuItems.locations.map(item => (
                <button
                  key={item.id}
                  className={`nav-link dropdown-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="user-section">
          <button 
            className="user-info"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div className="user-details">
              <span className="username">Username</span>
              <span className="user-status">online</span>
            </div>
            {isProfileOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              {menuItems.profile.map(item => (
                <button
                  key={item.id}
                  className={`profile-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
              <button className="profile-item logout">
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

export default Sidebar;