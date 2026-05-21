import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Activity,
  X,
  Save,
  Loader,
  ChevronLeft,
  ChevronRight,
  Microscope,
  FileText,
  Download
} from 'lucide-react';
import '../styles/LabTests.css';

const API_URL = 'http://localhost:5000';

const LabTests = ({ activeTab }) => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchTests();
  }, [activeTab]);

  useEffect(() => {
    filterTests();
  }, [searchTerm, tests]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      let endpoint = '/lab-assistant/tests';
      
      switch(activeTab) {
        case 'pending-tests':
          endpoint = '/lab-assistant/tests/pending';
          break;
        case 'in-progress':
          endpoint = '/lab-assistant/tests/in-progress';
          break;
        case 'completed-tests':
          endpoint = '/lab-assistant/tests/completed';
          break;
        default:
          endpoint = '/lab-assistant/tests/all';
      }
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTests(response.data.tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...tests];
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTests(filtered);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (testId, status) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(`${API_URL}/lab-assistant/test/${testId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTests();
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };

  const handleSubmitResult = async () => {
    if (!testResult.trim()) {
      alert('Please enter test results');
      return;
    }
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${API_URL}/lab-assistant/test/${selectedTest._id}/result`,
        { result: testResult },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setTestResult('');
      fetchTests();
    } catch (error) {
      console.error('Error submitting results:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="test-badge pending"><Clock size={12} /> Pending</span>,
      'in-progress': <span className="test-badge progress"><Activity size={12} /> In Progress</span>,
      completed: <span className="test-badge completed"><CheckCircle size={12} /> Completed</span>
    };
    return badges[status] || badges.pending;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);

  return (
    <div className="lab-tests-container">
      <div className="tests-header">
        <div>
          <h1>
            {activeTab === 'pending-tests' && 'Pending Tests'}
            {activeTab === 'in-progress' && 'Tests In Progress'}
            {activeTab === 'completed-tests' && 'Completed Tests'}
            {activeTab === 'all-tests' && 'All Lab Tests'}
          </h1>
          <p>Manage and process laboratory tests</p>
        </div>
        <div className="header-stats">
          <div className="stat-chip">
            <Microscope size={16} />
            <span>Total: {tests.length}</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by patient name, test type or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Loader size={40} className="spinner" />
          <p>Loading tests...</p>
        </div>
      ) : (
        <>
          <div className="tests-grid">
            {currentItems.map((test) => (
              <div key={test._id} className="test-card">
                <div className="test-card-header">
                  <div className="patient-info">
                    <h3>{test.patientName}</h3>
                    <span className="patient-id">ID: {test.patientId}</span>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                
                <div className="test-card-body">
                  <div className="test-detail">
                    <strong>Test Type:</strong>
                    <span>{test.testType}</span>
                  </div>
                  <div className="test-detail">
                    <strong>Requested By:</strong>
                    <span>{test.requestedBy}</span>
                  </div>
                  <div className="test-detail">
                    <strong>Request Date:</strong>
                    <span>{new Date(test.createdAt).toLocaleDateString()}</span>
                  </div>
                  {test.result && (
                    <div className="test-result">
                      <strong>Result:</strong>
                      <p>{test.result}</p>
                    </div>
                  )}
                </div>
                
                <div className="test-card-footer">
                  {test.status === 'pending' && (
                    <>
                      <button 
                        className="btn-start"
                        onClick={() => handleUpdateStatus(test._id, 'in-progress')}
                      >
                        <Activity size={16} />
                        Start Test
                      </button>
                      <button 
                        className="btn-view"
                        onClick={() => {
                          setSelectedTest(test);
                          setShowModal(true);
                        }}
                      >
                        <Edit size={16} />
                        Add Result
                      </button>
                    </>
                  )}
                  {test.status === 'in-progress' && (
                    <button 
                      className="btn-result"
                      onClick={() => {
                        setSelectedTest(test);
                        setShowModal(true);
                      }}
                    >
                      <FileText size={16} />
                      Submit Results
                    </button>
                  )}
                  {test.status === 'completed' && (
                    <button className="btn-view-result">
                      <Download size={16} />
                      Download Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                <ChevronLeft size={18} />
                Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? 'active' : ''}>
                    {page}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Result Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Test Results</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="test-info">
                <p><strong>Patient:</strong> {selectedTest?.patientName}</p>
                <p><strong>Test Type:</strong> {selectedTest?.testType}</p>
              </div>
              <div className="form-group">
                <label>Test Results *</label>
                <textarea
                  rows={6}
                  value={testResult}
                  onChange={(e) => setTestResult(e.target.value)}
                  placeholder="Enter detailed test results here..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmitResult} disabled={submitting}>
                {submitting ? <Loader size={18} className="spinner" /> : <Save size={18} />}
                {submitting ? 'Submitting...' : 'Submit Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;