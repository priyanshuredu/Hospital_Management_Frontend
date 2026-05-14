import React, { useState } from 'react';
import { 
  Home,
  HospitalIcon, 
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
  Hospital,
  Activity,
  Calendar,
  Settings,
  Bell,
  Shield,
  Stethoscope,
  Users,
  PlusCircle,
  List
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/HospitalSidebar.css';

const HospitalSidebar = ({ activeTab, setActiveTab }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isDoctorOpen, setIsDoctorOpen] = useState(true);

  const menuItems = {
    main: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'hospitals', label: 'Hospitals', icon: HospitalIcon },
    ],
    doctor: [
      { id: 'add-doctor', label: 'Add Doctor', icon: PlusCircle },
      { id: 'manage-doctors', label: 'Manage Doctors', icon: List },
    ],
    locations: [
      { id: 'state', label: 'State', icon: MapPin },
      { id: 'district', label: 'District', icon: Map },
      { id: 'city', label: 'City', icon: Building2 },
    ],
    management: [
      { id: 'departments', label: 'Departments', icon: Activity },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    profile: [
      { id: 'edit-profile', label: 'Edit Profile', icon: Edit3 },
      { id: 'reset-password', label: 'Reset Password', icon: Lock },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: Shield },
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
        {/* Main Menu Items */}
        {menuItems.main.map(item => (
          <div key={item.id} className="nav-item">
            <button
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          </div>
        ))}

        {/* Doctor Dropdown */}
        <div className="nav-dropdown">
          <button 
            className="dropdown-header"
            onClick={() => setIsDoctorOpen(!isDoctorOpen)}
          >
            <Stethoscope size={20} />
            <span>Doctor Management</span>
            {isDoctorOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isDoctorOpen && (
            <div className="dropdown-items">
              {menuItems.doctor.map(item => (
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

        {/* Management Dropdown */}
        <div className="nav-dropdown">
          <button 
            className="dropdown-header"
            onClick={() => setIsManagementOpen(!isManagementOpen)}
          >
            <Settings size={20} />
            <span>Management</span>
            {isManagementOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isManagementOpen && (
            <div className="dropdown-items">
              {menuItems.management.map(item => (
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
              <span className="username">Dr. Admin</span>
              <span className="user-status">Hospital Administrator</span>
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
              <hr className="dropdown-divider" />
              <button className="profile-item logout" onClick={() => console.log('Logout clicked')}>
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

export default HospitalSidebar;