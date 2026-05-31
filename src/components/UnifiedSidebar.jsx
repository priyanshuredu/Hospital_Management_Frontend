// UnifiedSidebar.js
import React, { useState, useEffect } from 'react';
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
  FlaskConical,
  Microscope,
  Users,
  FileText,
  Clock,
  CheckCircle,
  ClipboardList,
  Plus,
  Database,
  BarChart3,
  TestTube
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/UnifiedSidebar.css';
import { logout } from '../services/logout';
import { label } from 'framer-motion/client';

const UnifiedSidebar = ({ activeTab, setActiveTab, userRole }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData) {
      setUserProfile(userData.profile_image || '');
      setUserName(userData.name || userData.username || 'User');
      setUserEmail(userData.email || 'user@example.com');
    } else {
      setUserName(sessionStorage.getItem('User Name') || 'User');
      setUserEmail(sessionStorage.getItem('email') || 'user@example.com');
    }
  }, []);

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonProfileItems = [
      { id: 'edit-profile', label: 'Edit Profile', icon: Edit3 },
      { id: 'reset-password', label: 'Reset Password', icon: Lock },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const roleSpecificMenus = {
      admin: {
        main: [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'hospital', label: 'Hospitals', icon: HospitalIcon },
          { id: 'departments', label: 'Departments', icon: Activity },
        ],
        locations: [
          { id: 'state', label: 'State', icon: MapPin },
          { id: 'district', label: 'District', icon: Map },
          { id: 'city', label: 'City', icon: Building2 },
        ],
        reports: [
          { id: 'hospital-report', label: 'Hospital Report', icon: HospitalIcon },
          { id: 'doctor-report', label: 'Doctor Report', icon: ClipboardList },
          { id: 'lab-report', label: 'Lab Report', icon: FlaskConical },
          { id: 'user-report', label: 'User Report', icon: Users },
          { id: 'appointment-report', label: 'Appointment Report', icon: Calendar },
          { id: 'test-report', label: 'Test Report', icon: ClipboardList },
        ],
        management: [
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'test-reports', label: 'Test Reports', icon: ClipboardList },
          { id: 'settings', label: 'Settings', icon: Settings },
        ],
        profile: [...commonProfileItems, { id: 'security', label: 'Security', icon: Shield }]
      },
      'hospital-admin': {
        main: [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'add-doctor', label: 'Add Doctor', icon: User },
          { id: 'manage-doctors', label: 'Manage Doctors', icon: Users },
          { id: 'departments', label: 'Departments', icon: Activity },
          { id: 'lab', label: 'Lab Management', icon: FlaskConical },
        ],
        management: [
          { id: 'appointments', label: 'Appointments', icon: Calendar },
        ],
        reports: [
          { id: 'doctor-report', label: 'Doctor Report', icon: ClipboardList },
          { id: 'lab-report', label: 'Lab Report', icon: FlaskConical },
          { id: 'appointment-report', label: 'Appointment Report', icon: Calendar },
          { id: 'test-report', label: 'Test Report', icon: ClipboardList },
        ],
        profile: commonProfileItems
      },
      doctor: {
        main: [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'prescriptions', label :'My Prescriptions', icon: FileText}
        ],
        profile: commonProfileItems
      },
      'lab-assistant': {
        main: [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'add-test', label: 'Add Tests', icon: FlaskConical },
          { id: 'manage-tests', label: 'Manage Tests', icon: ClipboardList },
        ],
        tests: [
          { id: 'pending-tests', label: 'Pending Tests', icon: Clock },
          { id: 'in-progress', label: 'In Progress', icon: Activity },
          { id: 'completed-tests', label: 'Completed', icon: CheckCircle },
          { id: 'all-tests', label: 'All Tests', icon: ClipboardList },
        ],
        reports: [
          { id: 'generate-report', label: 'Generate Report', icon: FileText },
          { id: 'view-reports', label: 'View Reports', icon: Database },
          { id: 'approved-reports', label: 'Approved Reports', icon: CheckCircle },
        ],
        profile: commonProfileItems
      }
    };

    return roleSpecificMenus[userRole] || roleSpecificMenus.admin;
  };

  const menuItems = getMenuItems();
  const roleDisplayName = {
    admin: 'Administrator',
    'hospital-admin': 'Hospital Admin',
    doctor: 'Doctor',
    'lab-assistant': 'Lab Assistant'
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case 'admin': return <Shield size={20} />;
      case 'hospital-admin': return <Hospital size={20} />;
      case 'doctor': return <User size={20} />;
      case 'lab-assistant': return <Microscope size={20} />;
      default: return <User size={20} />;
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('User Id');
      sessionStorage.removeItem('User Name');
      sessionStorage.removeItem('email');
      window.location.href = '/login';
    }
  };

  return (
    <div className={`unified-sidebar ${isDarkMode ? 'dark' : 'light'}`}>
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
        {menuItems.main && menuItems.main.map(item => (
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

        {/* Locations Dropdown - Only for admin */}
        {menuItems.locations && (
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
        )}

        {/* Management Dropdown */}
        {menuItems.management && menuItems.management.length > 0 && (
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
        )}

        {/* Tests Dropdown - Only for lab assistant */}
        {menuItems.tests && (
          <div className="nav-dropdown">
            <button 
              className="dropdown-header"
              onClick={() => setIsTestsOpen(!isTestsOpen)}
            >
              <TestTube size={20} />
              <span>Lab Tests</span>
              {isTestsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {isTestsOpen && (
              <div className="dropdown-items">
                {menuItems.tests.map(item => (
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
        )}

        {/* Reports Dropdown - Only for lab assistant */}
        {menuItems.reports && (
          <div className="nav-dropdown">
            <button 
              className="dropdown-header"
              onClick={() => setIsReportsOpen(!isReportsOpen)}
            >
              <FileText size={20} />
              <span>Reports</span>
              {isReportsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {isReportsOpen && (
              <div className="dropdown-items">
                {menuItems.reports.map(item => (
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
        )}
      </nav>

      {/* Bottom Section - Same for all views */}
      <div className="sidebar-bottom">
        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Role Badge */}
        <div className="role-badge">
          {getRoleIcon()}
          <span>{roleDisplayName[userRole] || 'User'}</span>
        </div>

        {/* User Profile Dropdown */}
        <div className="user-section">
          <button 
            className="user-info"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="user-avatar">
              {
                userProfile !== '' ? <img className='user-avatar-img' src={userProfile} alt='profile-img'></img> : <User size={24}></User>
              }
            </div>
            <div className="user-details">
              <span className="username">{userName}</span>
              <span className="user-status">{roleDisplayName[userRole] || 'User'}</span>
            </div>
            {isProfileOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              {menuItems.profile.map(item => (
                <button
                  key={item.id}
                  className={`profile-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsProfileOpen(false);
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
              <hr className="dropdown-divider" />
              <button className="profile-item logout" onClick={handleLogout}>
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

export default UnifiedSidebar;