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
  Eye
} from 'lucide-react';
import '../styles/LabAssistantDashboard.css';

const API_URL = 'http://localhost:5000';

const LabAssistantDashboard = () => {
  const [stats, setStats] = useState({
    pendingTests: 0,
    inProgressTests: 0,
    completedTests: 0,
    totalTests: 0,
    todaySamples: 0,
    patientsServed: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const [statsRes, testsRes] = await Promise.all([
        axios.get(`${API_URL}/lab-assistant/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/lab-assistant/recent-tests`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(statsRes.data);
      setRecentTests(testsRes.data.tests);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Pending Tests', value: stats.pendingTests, icon: Clock, color: 'pending', bgColor: '#fff3cd' },
    { title: 'In Progress', value: stats.inProgressTests, icon: Activity, color: 'progress', bgColor: '#cfe2ff' },
    { title: 'Completed', value: stats.completedTests, icon: CheckCircle, color: 'completed', bgColor: '#d1e7dd' },
    { title: 'Today\'s Samples', value: stats.todaySamples, icon: Calendar, color: 'info', bgColor: '#f8d7da' },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge pending"><Clock size={12} /> Pending</span>,
      'in-progress': <span className="badge progress"><Activity size={12} /> In Progress</span>,
      completed: <span className="badge completed"><CheckCircle size={12} /> Completed</span>,
      approved: <span className="badge approved"><CheckCircle size={12} /> Approved</span>
    };
    return badges[status] || badges.pending;
  };

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
              <stat.icon size={24} color={stat.color === 'pending' ? '#856404' : stat.color === 'progress' ? '#084298' : '#0f5132'} />
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
          <Users size={20} />
          <div>
            <h4>{stats.patientsServed}</h4>
            <p>Patients Served</p>
          </div>
        </div>
        <div className="stat-box">
          <TestTube size={20} />
          <div>
            <h4>{stats.totalTests}</h4>
            <p>Total Tests</p>
          </div>
        </div>
        <div className="stat-box">
          <TrendingUp size={20} />
          <div>
            <h4>{Math.round((stats.completedTests / stats.totalTests) * 100) || 0}%</h4>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="recent-tests-section">
        <div className="section-header">
          <h2>Recent Test Requests</h2>
          <button className="view-all-btn" onClick={() => window.location.href = '#all-tests'}>
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="tests-table-container">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Test Type</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTests.map((test) => (
                <tr key={test._id}>
                  <td>{test.patientName}</td>
                  <td>{test.testType}</td>
                  <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(test.status)}</td>
                  <td>
                    <button className="action-btn view" title="View Details">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {recentTests.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">No recent tests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => window.location.href = '#pending-tests'}>
            <TestTube size={24} />
            <span>Start New Test</span>
          </button>
          <button className="action-card" onClick={() => window.location.href = '#generate-report'}>
            <FileText size={24} />
            <span>Generate Report</span>
          </button>
          <button className="action-card" onClick={() => window.location.href = '#sample-tracking'}>
            <Activity size={24} />
            <span>Track Samples</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabAssistantDashboard;