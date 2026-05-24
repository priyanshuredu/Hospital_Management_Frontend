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
  GraduationCap,
  Plus,
  X,
  Save,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/LabAssistantLayout.css';
import LabAssistantDashboard from './LabAssistantDashboard';
import LabTests from './LabTests';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const LabAssistantLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [labInfo, setLabInfo] = useState(null);

  useEffect(() => {
    // Fetch lab assistant info from sessionStorage or API
    const userData = JSON.parse(sessionStorage.getItem('user'));
    setLabInfo(userData);
  }, []);

  const menuItems = {
    main: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'lab-info', label: 'My Lab', icon: FlaskConical },
      { id: 'add-test', label: 'Add Test', icon: Plus },
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
      case 'add-test':
        return <AddTest />;
      case 'manage-tests':
        return <ManageTests />;
      case 'pending-tests':
      case 'in-progress':
      case 'completed-tests':
      case 'all-tests':
        return <LabTests activeTab={activeTab} />;
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
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="lab-info-section">
            <div className="lab-badge">
              <FlaskConical size={16} />
              <span>{labInfo?.lab || 'Lab'}</span>
            </div>
          </div>

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
      const user = JSON.parse(sessionStorage.getItem('user'));
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/lab/${user.lab}`, {
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

// Add Test Component
const AddTest = () => {
  const [formData, setFormData] = useState({
    testName: '',
    lab: '',
    hospital: '',
    fee: '',
    precautions: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetchHospitals();
    fetchLabs();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get(`${API_URL}/hospital/all`);
      setHospitals(response.data.hospitals || response.data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchLabs = async () => {
    try {
      const response = await axios.get(`${API_URL}/lab/all`);
      setLabs(response.data.labs || response.data || []);
    } catch (error) {
      console.error('Error fetching labs:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(`${API_URL}/test/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Test added successfully!' });
      setFormData({
        testName: '',
        lab: '',
        hospital: '',
        fee: '',
        precautions: ''
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add test. Please try again.' 
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-test-container">
      <div className="page-header">
        <Plus size={28} />
        <h1>Add New Test</h1>
        <p>Create a new laboratory test</p>
      </div>

      {message && (
        <div className={`message-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-test-form">
        <div className="form-group">
          <label>Test Name *</label>
          <input
            type="text"
            name="testName"
            value={formData.testName}
            onChange={handleChange}
            placeholder="Enter test name (e.g., Complete Blood Count)"
            required
          />
        </div>

        <div className="form-group">
          <label>Lab *</label>
          <select
            name="lab"
            value={formData.lab}
            onChange={handleChange}
            required
          >
            <option value="">Select Lab</option>
            {labs.map(lab => (
              <option key={lab._id} value={lab._id}>
                {lab.labName || lab.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Hospital *</label>
          <select
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            required
          >
            <option value="">Select Hospital</option>
            {hospitals.map(hospital => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.hospital_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fee (₹) *</label>
          <input
            type="number"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            placeholder="Enter test fee"
            required
          />
        </div>

        <div className="form-group">
          <label>Precautions</label>
          <textarea
            name="precautions"
            value={formData.precautions}
            onChange={handleChange}
            placeholder="Enter precautions for this test (e.g., Fasting required, No alcohol, etc.)"
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <RefreshCw size={18} className="spinning" /> : <Save size={18} />}
            {loading ? 'Adding...' : 'Add Test'}
          </button>
          <button type="reset" className="reset-btn" onClick={() => setFormData({
            testName: '',
            lab: '',
            hospital: '',
            fee: '',
            precautions: ''
          })}>
            <X size={18} />
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

// Manage Tests Component
const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/test/all`);
      let testsData = response.data.tests || response.data || [];
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setMessage({ type: 'error', text: 'Failed to fetch tests' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId, currentStatus) => {
    setUpdatingId(testId);
    const newStatus = currentStatus === 'active' ? 'inActive' : 'active';
    console.log("status:",newStatus)
    
    try {
      await axios.patch(`${API_URL}/test/update-status`, {
        id: testId,
        status: newStatus
      });
      
      setTests(tests.map(test => 
        test._id === testId ? { ...test, status: newStatus } : test
      ));
      
      setMessage({ type: 'success', text: `Test status updated to ${newStatus}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating test status:', error);
      setMessage({ type: 'error', text: 'Failed to update test status' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTests = tests.filter(test => {
    if (filter === 'all') return true;
    return test.status === filter;
  });

  return (
    <div className="manage-tests-container">
      <div className="page-header">
        <ClipboardList size={28} />
        <h1>Manage Tests</h1>
        <p>View and manage all laboratory tests</p>
      </div>

      {message && (
        <div className={`message-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tests
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={`filter-btn ${filter === 'inActive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Inactive
        </button>
        <button className="refresh-btn" onClick={fetchTests}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <RefreshCw size={32} className="spinning" />
          <p>Loading tests...</p>
        </div>
      ) : (
        <div className="tests-table-container">
          <table className="tests-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Test Name</th>
                <th>Lab</th>
                <th>Hospital</th>
                <th>Fee (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <p>No tests found</p>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test, index) => (
                  <tr key={test._id}>
                    <td>{index + 1}</td>
                    <td className="test-name-cell">
                      <strong>{test.testName || test.name}</strong>
                      {test.precaution && (
                        <div className="test-precaution">{test.precaution}</div>
                      )}
                    </td>
                    <td>{test.lab?.labName || test.lab?.name || 'N/A'}</td>
                    <td>{test.hospital?.hospital_name || test.hospital?.name || 'N/A'}</td>
                    <td>₹{test.fee || test.price}</td>
                    <td>
                      <span className={`status-badge ${test.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {test.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-toggle-btn ${test.status === 'active' ? 'deactivate' : 'activate'}`}
                        onClick={() => updateTestStatus(test._id, test.status)}
                        disabled={updatingId === test._id}
                      >
                        {updatingId === test._id ? (
                          <RefreshCw size={16} className="spinning" />
                        ) : test.status === 'active' ? (
                          'Deactivate'
                        ) : (
                          'Activate'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LabAssistantLayout;