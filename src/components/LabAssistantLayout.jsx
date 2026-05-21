import React, { useState, useEffect } from 'react';
import { 
  Home,
  FlaskConical,
  Microscope,
  Users,
  Calendar,
  Activity,
  Bell,
  Settings,
  LogOut,
  Sun,
  Mail,
  Moon,
  ChevronDown,
  ChevronRight,
  User,
  Edit3,
  Lock,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Database,
  BarChart3,
  ClipboardList,
  TestTube,
  Droplet,
  Dna,
  Pill,
  GraduationCap
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/LabAssistantLayout.css';
import LabAssistantDashboard from './LabAssistantDashboard';
import LabTests from './LabTests';
import axios from 'axios';
// import LabReports from './LabReports';
// import LabPatients from './LabPatients';
// import LabProfile from './LabProfile';
// import LabResetPassword from './LabResetPassword';
// import LabNotifications from './LabNotifications';
// import LabSettings from './LabSettings';

const LabAssistantLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [labInfo, setLabInfo] = useState(null);
  const API_URL = 'http://localhost:5000/'

  useEffect(() => {
    // Fetch lab assistant info from sessionStorage or API
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setLabInfo({
      name: userData.username || 'Lab Assistant',
      lab: userData.labName || 'Central Laboratory',
      role: 'Lab Assistant',
      email: userData.email || 'lab@hospital.com'
    });
  }, []);

  const menuItems = {
    main: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'lab-info', label: 'My Lab', icon: FlaskConical },
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
    patients: [
      { id: 'patient-samples', label: 'Patient Samples', icon: Users },
      { id: 'sample-tracking', label: 'Sample Tracking', icon: Activity },
    ],
    profile: [
      { id: 'edit-profile', label: 'Edit Profile', icon: Edit3 },
      { id: 'reset-password', label: 'Reset Password', icon: Lock },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <LabAssistantDashboard />;
      case 'lab-info':
        return <LabInfo />;
      case 'pending-tests':
      case 'in-progress':
      case 'completed-tests':
      case 'all-tests':
        return <LabTests activeTab={activeTab} />;
    //   case 'generate-report':
    //   case 'view-reports':
    //   case 'approved-reports':
    //     return <LabReports activeTab={activeTab} />;
    //   case 'patient-samples':
    //   case 'sample-tracking':
    //     return <LabPatients activeTab={activeTab} />;
    //   case 'edit-profile':
    //     return <LabProfile />;
    //   case 'reset-password':
    //     return <LabResetPassword />;
    //   case 'notifications':
    //     return <LabNotifications />;
    //   case 'settings':
    //     return <LabSettings />;
      default:
        return <LabAssistantDashboard />;
    }
  };

  return (
    <div className={`lab-assistant-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="lab-sidebar">
        {/* Logo Section */}
        <div className="logo-section">
          <Microscope className="logo-icon" size={32} />
          <div className="logo-text">
            <h2>Lab Portal</h2>
            <p>Assistant Dashboard</p>
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

          {/* Tests Dropdown */}
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

          {/* Reports Dropdown */}
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

          {/* Patients Dropdown */}
          {/* <div className="nav-dropdown">
            <button 
              className="dropdown-header"
              onClick={() => setIsPatientsOpen(true)}
            >
              <Users size={20} />
              <span>Patients</span>
              {isPatientsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {isPatientsOpen && (
              <div className="dropdown-items">
                {menuItems.patients.map(item => (
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
          </div> */}
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Lab Info Section */}
          <div className="lab-info-section">
            <div className="lab-badge">
              <FlaskConical size={16} />
              <span>{labInfo?.lab || 'Lab'}</span>
            </div>
          </div>

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
                <span className="username">{labInfo?.name}</span>
                <span className="user-status">{labInfo?.role}</span>
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
                <button className="profile-item logout" onClick={() => {
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('user');
                  window.location.href = '/login';
                }}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="lab-main-content">
        {renderContent()}
      </main>
    </div>
  );
};

// Lab Info Component
const LabInfo = () => {
  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabInfo();
  }, []);

  const fetchLabInfo = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/lab/my-lab`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabData(response.data.lab);
    } catch (error) {
      console.error('Error fetching lab info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="lab-info-container">
      <div className="info-header">
        <FlaskConical size={32} />
        <h1>{labData?.labName}</h1>
        <span className={`status-badge ${labData?.status}`}>
          {labData?.status}
        </span>
      </div>
      
      <div className="info-grid">
        <div className="info-card">
          <User size={20} />
          <h3>Lab Manager</h3>
          <p>{labData?.labManager}</p>
        </div>
        <div className="info-card">
          <Mail size={20} />
          <h3>Email</h3>
          <p>{labData?.email}</p>
        </div>
        <div className="info-card">
          <GraduationCap size={20} />
          <h3>Qualification</h3>
          <p>{labData?.qualification}</p>
        </div>
        <div className="info-card">
          <Activity size={20} />
          <h3>Total Tests</h3>
          <p>{labData?.totalTests || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default LabAssistantLayout;