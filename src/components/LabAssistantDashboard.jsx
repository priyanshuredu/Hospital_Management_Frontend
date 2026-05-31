import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  TestTube,
  FileText,
  Calendar,
  ChevronRight,
  Download,
  Eye,
  FlaskConical,
  Hospital,
  DollarSign,
  ClipboardList
} from 'lucide-react';
import '../styles/LabAssistantDashboard.css';

const API_URL = 'http://localhost:5000';

const LabAssistantDashboard = () => {
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    inactiveTests: 0,
    uniqueLabs: 0,
    uniqueHospitals: 0,
    avgFee: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('Token');
      const response = await axios.get(`${API_URL}/test/recent-test`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const testsData = response.data.tests || [];
      setRecentTests(testsData);
      
      // Calculate statistics from the data
      calculateStats(testsData);
      
      console.log("Recent tests data:", testsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tests) => {
    const activeTests = tests.filter(test => test.status === 'active').length;
    const inactiveTests = tests.filter(test => test.status === 'inactive').length;
    
    // Get unique labs
    const uniqueLabs = new Set(tests.map(test => test.lab?._id || test.lab)).size;
    
    // Get unique hospitals
    const uniqueHospitals = new Set(tests.map(test => test.hospital?._id || test.hospital)).size;
    
    // Calculate average fee
    const totalFee = tests.reduce((sum, test) => sum + (test.fee || 0), 0);
    const avgFee = tests.length > 0 ? totalFee / tests.length : 0;
    
    setStats({
      totalTests: tests.length,
      activeTests: activeTests,
      inactiveTests: inactiveTests,
      uniqueLabs: uniqueLabs,
      uniqueHospitals: uniqueHospitals,
      avgFee: avgFee
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="badge active"><CheckCircle size={12} /> Active</span>;
    } else if (status === 'inactive') {
      return <span className="badge inactive"><AlertCircle size={12} /> Inactive</span>;
    }
    return <span className="badge pending"><Clock size={12} /> {status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statCards = [
    { 
      title: 'Total Tests', 
      value: stats.totalTests, 
      icon: TestTube, 
      color: 'primary', 
      bgColor: '#e3f2fd' 
    },
    { 
      title: 'Active Tests', 
      value: stats.activeTests, 
      icon: CheckCircle, 
      color: 'success', 
      bgColor: '#d1e7dd' 
    },
    { 
      title: 'Inactive Tests', 
      value: stats.inactiveTests, 
      icon: AlertCircle, 
      color: 'danger', 
      bgColor: '#f8d7da' 
    },
    { 
      title: 'Avg. Fee', 
      value: `₹${Math.round(stats.avgFee)}`, 
      icon: DollarSign, 
      color: 'warning', 
      bgColor: '#fff3cd' 
    },
  ];

  if (loading) {
    return (
      <div className="lab-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Lab Assistant Dashboard</h1>
          <p>Welcome back! Here's what's happening with your lab today.</p>
        </div>
        <div className="date-display">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon" style={{ background: stat.bgColor }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="additional-stats">
        <div className="stat-box">
          <FlaskConical size={20} />
          <div>
            <h4>{stats.uniqueLabs}</h4>
            <p>Active Labs</p>
          </div>
        </div>
        <div className="stat-box">
          <Hospital size={20} />
          <div>
            <h4>{stats.uniqueHospitals}</h4>
            <p>Hospitals</p>
          </div>
        </div>
        <div className="stat-box">
          <TrendingUp size={20} />
          <div>
            <h4>{stats.totalTests > 0 ? Math.round((stats.activeTests / stats.totalTests) * 100) : 0}%</h4>
            <p>Active Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="recent-tests-section">
        <div className="section-header">
          <h2>Recent Tests</h2>
          <button className="view-all-btn" onClick={() => window.location.href = '#all-tests'}>
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="tests-table-container">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Lab</th>
                <th>Hospital</th>
                <th>Fee (₹)</th>
                <th>Status</th>
                <th>Precautions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTests.map((test, index) => (
                <tr key={test._id}>
                  <td className="test-name">
                    <strong>{test.testName}</strong>
                  </td>
                  <td>{test.lab?.labName || 'N/A'}</td>
                  <td>{test.hospital?.hospital_name || 'N/A'}</td>
                  <td>₹{test.fee}</td>
                  <td>{getStatusBadge(test.status)}</td>
                  <td>
                    {test.precautions ? (
                      <span className="precautions-text" title={test.precautions}>
                        {test.precautions.length > 30 ? test.precautions.substring(0, 30) + '...' : test.precautions}
                      </span>
                    ) : (
                      'No precautions'
                    )}
                  </td>
                  <td>
                    <button className="action-btn view" title="View Details">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {recentTests.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-content">
                      <TestTube size={48} />
                      <p>No tests found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Categories Summary */}
      {recentTests.length > 0 && (
        <div className="test-summary">
          <h3>Test Summary by Lab</h3>
          <div className="summary-grid">
            {[...new Map(recentTests.map(test => [test.lab?._id, test.lab])).values()].map(lab => {
              if (!lab) return null;
              const labTests = recentTests.filter(t => t.lab?._id === lab._id);
              return (
                <div key={lab._id} className="summary-card">
                  <FlaskConical size={20} />
                  <div>
                    <h4>{lab.labName}</h4>
                    <p>{labTests.length} tests • ₹{Math.round(labTests.reduce((sum, t) => sum + t.fee, 0) / labTests.length)} avg</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => window.location.href = '#add-test'}>
            <TestTube size={24} />
            <span>Add New Test</span>
          </button>
          <button className="action-card" onClick={() => window.location.href = '#manage-tests'}>
            <ClipboardList size={24} />
            <span>Manage Tests</span>
          </button>
          <button className="action-card" onClick={() => window.location.href = '#lab-info'}>
            <Activity size={24} />
            <span>Lab Information</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabAssistantDashboard;