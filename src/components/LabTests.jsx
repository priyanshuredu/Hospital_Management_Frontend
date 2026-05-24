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
  Download,
  Calendar,
  ArrowUpDown,
  AlertCircle,
  User,
  Phone,
  Hospital,
  FlaskConical,
  DollarSign
} from 'lucide-react';
import '../styles/LabTests.css';

const API_URL = 'http://localhost:5000';

const LabTests = ({ activeTab }) => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('appointmentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLab, setFilterLab] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [labs, setLabs] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchTests();
    fetchLabsAndHospitals();
  }, [activeTab]);

  useEffect(() => {
    filterAndSortTests();
  }, [searchTerm, tests, sortBy, sortOrder, filterLab, filterHospital]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      let endpoint = '/test-report/all';
      
      switch(activeTab) {
        case 'pending-tests':
          endpoint = '/test-report/pending';
          break;
        case 'in-progress':
          endpoint = '/test-report/in-progress';
          break;
        case 'completed-tests':
          endpoint = '/test-report/completed';
          break;
        case 'all-tests':
          endpoint = '/test-report/all';
          break;
        default:
          endpoint = '/test-report/all';
      }
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform the data to match the expected structure
      let testsData = response.data.tests || response.data || [];
      
      // Process the tests data
      const processedTests = testsData.map(test => ({
        _id: test._id,
        patientName: test.patientName || test.appointment?.patientName || 'N/A',
        patientAge: test.patientAge || test.appointment?.patientAge,
        patientGender: test.patientGender || test.appointment?.patientGender,
        patientPhone: test.patientPhone || test.appointment?.patientPhone,
        testName: test.testName || test.test?.testName,
        testType: test.testName || test.test?.testName,
        testId: test.test?._id || test.testId,
        lab: test.lab || test.test?.lab.labName,
        hospital: test.hospital || test.test?.hospital,
        fee: test.fee || test.test?.fee,
        precautions: test.precautions || test.test?.precautions,
        status: test.status || 'pending',
        appointmentDate: test.appointmentDate || test.appointment?.appointmentDate,
        result: test.result,
        reportStatus: test.reportStatus,
        createdAt: test.createdAt || test.appointmentDate
      }));
      
      setTests(processedTests);
      console.log("Tests data:", processedTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabsAndHospitals = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const [labsRes, hospitalsRes] = await Promise.all([
        axios.get(`${API_URL}/lab/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/hospital/all`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLabs(labsRes.data.labs || labsRes.data || []);
      setHospitals(hospitalsRes.data.hospitals || hospitalsRes.data || []);
    } catch (error) {
      console.error('Error fetching labs/hospitals:', error);
    }
  };

  const filterAndSortTests = () => {
    let filtered = [...tests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.patientPhone?.toString().includes(searchTerm)
      );
    }

    // Apply lab filter
    if (filterLab) {
      filtered = filtered.filter(test => test.lab?._id === filterLab);
    }

    // Apply hospital filter
    if (filterHospital) {
      filtered = filtered.filter(test => test.hospital?._id === filterHospital);
    }

    // Apply sorting (by appointment date by default)
    filtered.sort((a, b) => {
      let comparison = 0;
      switch(sortBy) {
        case 'appointmentDate':
          comparison = new Date(a.appointmentDate || a.createdAt) - new Date(b.appointmentDate || b.createdAt);
          break;
        case 'patientName':
          comparison = (a.patientName || '').localeCompare(b.patientName || '');
          break;
        case 'testName':
          comparison = (a.testName || '').localeCompare(b.testName || '');
          break;
        case 'fee':
          comparison = (a.fee || 0) - (b.fee || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTests(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleUpdateStatus = async (testId, status, shouldAddReport = false) => {
    if (status === 'completed' && shouldAddReport) {
      setSelectedTest(tests.find(t => t._id === testId));
      setShowModal(true);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.patch(`${API_URL}/test-report/update-status`, 
        { id: testId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTests();
    } catch (error) {
      console.error('Error updating test status:', error);
      alert('Failed to update test status');
    }
  };

  const handleSubmitResult = async () => {
    if (!testResult.trim() && !reportFile) {
      alert('Please enter test results or upload a report');
      return;
    }
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('result', testResult);
      if (reportFile) {
        formData.append('report', reportFile);
      }
      
      await axios.post(`${API_URL}/lab-assistant/test/${selectedTest._id}/result`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      // Also update status to completed
      await axios.patch(`${API_URL}/test-report/update-status`,
        { id: selectedTest._id, status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowModal(false);
      setTestResult('');
      setReportFile(null);
      fetchTests();
      alert('Report added successfully!');
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Failed to submit report');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <div className="stat-chip">
            <CheckCircle size={16} />
            <span>Completed: {tests.filter(t => t.status === 'completed').length}</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by patient name, test name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
        
        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Sort By</label>
            <div className="sort-buttons">
              <button onClick={() => handleSort('appointmentDate')} className="sort-btn">
                Date <ArrowUpDown size={14} />
                {sortBy === 'appointmentDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('patientName')} className="sort-btn">
                Patient Name <ArrowUpDown size={14} />
                {sortBy === 'patientName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('testName')} className="sort-btn">
                Test Name <ArrowUpDown size={14} />
                {sortBy === 'testName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('fee')} className="sort-btn">
                Fee <ArrowUpDown size={14} />
                {sortBy === 'fee' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
          
          <div className="filter-group">
            <label>Lab</label>
            <select value={filterLab} onChange={(e) => setFilterLab(e.target.value)}>
              <option value="">All Labs</option>
              {labs.map(lab => (
                <option key={lab._id} value={lab._id}>{lab.labName}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Hospital</label>
            <select value={filterHospital} onChange={(e) => setFilterHospital(e.target.value)}>
              <option value="">All Hospitals</option>
              {hospitals.map(hospital => (
                <option key={hospital._id} value={hospital._id}>{hospital.hospital_name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

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
                    <div className="patient-meta">
                      {test.patientAge && <span>{test.patientAge} yrs</span>}
                      {test.patientGender && <span>• {test.patientGender}</span>}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                
                <div className="test-card-body">
                  <div className="test-detail">
                    <FlaskConical size={14} />
                    <strong>Test:</strong>
                    <span>{test.testName || test.testType}</span>
                  </div>
                  <div className="test-detail">
                    <Calendar size={14} />
                    <strong>Date:</strong>
                    <span>{formatDate(test.appointmentDate || test.createdAt)}</span>
                  </div>
                  <div className="test-detail">
                    <DollarSign size={14} />
                    <strong>Fee:</strong>
                    <span>₹{test.fee}</span>
                  </div>
                  {test.precautions && (
                    <div className="test-precautions">
                      <AlertCircle size={14} />
                      <strong>Precautions:</strong>
                      <span>{test.precautions}</span>
                    </div>
                  )}
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
                        onClick={() => handleUpdateStatus(test._id, 'in-process')}
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
                    <>
                      <button 
                        className="btn-result"
                        onClick={() => {
                          setSelectedTest(test);
                          setShowModal(true);
                        }}
                      >
                        <FileText size={16} />
                        Add Report
                      </button>
                      <button 
                        className="btn-complete"
                        onClick={() => handleUpdateStatus(test._id, 'completed')}
                      >
                        <CheckCircle size={16} />
                        Mark Completed
                      </button>
                    </>
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

          {filteredTests.length === 0 && (
            <div className="no-results">
              <Microscope size={48} />
              <p>No tests found matching your criteria</p>
            </div>
          )}

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

      {/* Report Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Test Report</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="test-info-grid">
                <div className="info-item">
                  <User size={16} />
                  <strong>Patient:</strong> {selectedTest?.patientName}
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  <strong>Phone:</strong> {selectedTest?.patientPhone || 'N/A'}
                </div>
                <div className="info-item">
                  <FlaskConical size={16} />
                  <strong>Test:</strong> {selectedTest?.testName || selectedTest?.testType}
                </div>
                <div className="info-item">
                  <Hospital size={16} />
                  <strong>Hospital:</strong> {selectedTest?.hospital?.hospital_name || 'N/A'}
                </div>
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
              
              <div className="form-group">
                <label>Upload Report (PDF/Image)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setReportFile(e.target.files[0])}
                />
                <small>Upload PDF or image file of the test report</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmitResult} disabled={submitting}>
                {submitting ? <Loader size={18} className="spinner" /> : <Save size={18} />}
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;