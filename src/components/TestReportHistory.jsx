import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TestReportHistory.css';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const TestReportHistory = () => {
  const [testReports, setTestReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestReports();
  }, []);

  const fetchTestReports = async () => {
    try {
      setLoading(true);
      const storedToken = sessionStorage.getItem('Token');
      const response = await axios.get('http://localhost:5000/test-report/test-report-history',{
        headers: { Authorization: `Bearer ${storedToken}` }
      }); // Update with your API endpoint
      
      setTestReports(response.data.testReports || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching test reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (reportId) => {
    navigate(`/test-report/${reportId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in-process':
        return 'status-in-process';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '✅';
      case 'in-process':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = testReports.filter(report => 
    filterStatus === 'all' ? true : report.reportStatus?.toLowerCase() === filterStatus.toLowerCase()
  );

  const stats = {
    total: testReports.length,
    completed: testReports.filter(r => r.reportStatus === 'completed').length,
    inProcess: testReports.filter(r => r.reportStatus === 'in-process').length,
    pending: testReports.filter(r => r.reportStatus === 'pending').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading test reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Reports</h3>
        <p>{error}</p>
        <button onClick={fetchTestReports} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="test-report-history">
      <button className='filter-btn' onClick={() => navigate(-1)}><ChevronLeft size={18}/>Back</button>
      <div className="header">
        <h1>📋 Test Reports History</h1>
        <p>View and manage all your medical test reports</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card in-process">
          <div className="stat-value">{stats.inProcess}</div>
          <div className="stat-label">In Process</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          ✅ Completed ({stats.completed})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'in-process' ? 'active' : ''}`}
          onClick={() => setFilterStatus('in-process')}
        >
          🔄 In Process ({stats.inProcess})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          ⏳ Pending ({stats.pending})
        </button>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Test Reports Found</h3>
          <p>You don't have any {filterStatus !== 'all' ? filterStatus : ''} test reports yet.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <div className="report-id">Report #{report._id.slice(-6)}</div>
                <div className={`status-badge ${getStatusBadgeClass(report.reportStatus)}`}>
                  {getStatusIcon(report.reportStatus)} {report.reportStatus?.toUpperCase()}
                </div>
              </div>
              
              <div className="report-body">
                <div className="info-row">
                  <span className="info-label">Patient Name:</span>
                  <span className="info-value">{report.appointment?.patientName}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Appointment Date:</span>
                  <span className="info-value">{formatDate(report.appointment?.appointmentDate)}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Time Slot:</span>
                  <span className="info-value">{report.appointment?.timeSlot}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Doctor:</span>
                  <span className="info-value">Dr. {report.appointment?.doctor?.name || 'Not assigned'}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Patient Details:</span>
                  <span className="info-value">
                    {report.appointment?.patientAge} yrs, {report.appointment?.patientGender}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{report.appointment?.patientPhone}</span>
                </div>
              </div>
              
              <div className="report-footer">
                <button 
                  onClick={() => handleViewDetails(report._id)}
                  className="view-details-btn"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestReportHistory;