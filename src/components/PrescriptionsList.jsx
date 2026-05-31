import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Eye,
  User,
  Calendar,
  Activity,
  AlertCircle,
  FileText,
  Clock,
  X,
  Loader,
  Hospital,
  AlertTriangle,
  Phone,
  Stethoscope,
  FileCheck,
  Download,
  Printer,
  Share2,
  CheckCircle,
  Clock as ClockIcon,
  RefreshCw,
  FileImage,
  TrendingUp,
  UserCheck,
  Building,
  FlaskConical,
  Pill
} from 'lucide-react';
import '../styles/PrescriptionsList.css';
import axios from 'axios';

const PrescriptionsList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'follow_up', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({
    doctorName: '',
    patientName: '',
    testName: '',
    reportStatus: '',
    fromDate: '',
    toDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch prescriptions from API
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('Token');
        const response = await axios.get('http://localhost:5000/prescription/by-doctor', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const prescriptionsData = response.data.prescriptions || [];
        setPrescriptions(prescriptionsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Process prescriptions data with correct field mapping
  const processedPrescriptions = useMemo(() => {
    return prescriptions.map(prescription => ({
      ...prescription,
      // Doctor information
      doctorName: prescription.doctor?.doctor_name || 
                   prescription.doctor?.name || 
                   prescription.doctor?.fullName || 
                   'Unknown Doctor',
      doctorQualification: prescription.doctor?.qualification || 'Not specified',
      doctorDegree: prescription.doctor?.degree || 'Not specified',
      doctorExperience: prescription.doctor?.experience || 0,
      doctorConsultationFee: prescription.doctor?.consultation_fee || 0,
      doctorEmail: prescription.doctor?.email || 'Not available',
      doctorPhone: prescription.doctor?.phone || 'Not available',
      doctorId: prescription.doctor?._id || prescription.doctor,
      
      // Hospital information
      hospitalName: prescription.doctor?.hospital?.hospital_name || 
                    prescription.appointment?.hospital?.name || 
                    'Unknown Hospital',
      hospitalAddress: prescription.doctor?.hospital?.hospital_address || 'Not specified',
      hospitalCity: prescription.doctor?.hospital?.city || 'Not specified',
      hospitalEmergency: prescription.doctor?.hospital?.emergency_service || false,
      hospitalAmbulance: prescription.doctor?.hospital?.ambulance_service || false,
      
      // Patient information
      patientName: prescription.appointment?.patientName || 'Unknown Patient',
      patientAge: prescription.appointment?.patientAge,
      patientGender: prescription.appointment?.patientGender,
      patientPhone: prescription.appointment?.patientPhone,
      
      // Appointment information
      appointmentDate: prescription.appointment?.appointmentDate ? new Date(prescription.appointment.appointmentDate) : new Date(),
      appointmentAttended: prescription.appointment?.appointmentAttended,
      timeSlot: prescription.appointment?.timeSlot,
      appointmentFee: prescription.appointment?.fee,
      bookingDate: prescription.appointment?.bookingDate ? new Date(prescription.appointment.bookingDate) : null,
      
      // Follow up
      followUp: prescription.follow_up ? new Date(prescription.follow_up) : new Date(),
      
      // Test information
      testName: prescription.test?.testName || 'No test ordered',
      testFee: prescription.test?.fee,
      testPrecautions: prescription.test?.precautions,
      testStatus: prescription.test?.status,
      labName: prescription.test?.lab?.labName || 'Not assigned',
      labManager: prescription.test?.lab?.labManager || 'Not assigned',
      
      // Report information
      reportStatus: prescription.testResport?.reportStatus || 'not_ordered',
      reportId: prescription.testResport?._id,
      
      // Additional fields
      medicines: prescription.medicines || '',
      precautions: prescription.precautions || ''
    }));
  }, [prescriptions]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return processedPrescriptions.filter(prescription => {
      // Search functionality
      const matchesSearch = searchTerm === '' || 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.medicines && prescription.medicines.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prescription.precautions && prescription.precautions.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter functionality
      const matchesDoctor = !filterConfig.doctorName || 
        prescription.doctorName.toLowerCase().includes(filterConfig.doctorName.toLowerCase());
      
      const matchesPatient = !filterConfig.patientName || 
        prescription.patientName.toLowerCase().includes(filterConfig.patientName.toLowerCase());
      
      const matchesTest = !filterConfig.testName || 
        prescription.testName.toLowerCase().includes(filterConfig.testName.toLowerCase());
      
      const matchesReportStatus = !filterConfig.reportStatus || 
        prescription.reportStatus.toLowerCase() === filterConfig.reportStatus.toLowerCase();
      
      const matchesFromDate = !filterConfig.fromDate || 
        prescription.appointmentDate >= new Date(filterConfig.fromDate);
      
      const matchesToDate = !filterConfig.toDate || 
        prescription.appointmentDate <= new Date(filterConfig.toDate);

      return matchesSearch && matchesDoctor && matchesPatient && 
             matchesTest && matchesReportStatus && matchesFromDate && matchesToDate;
    });
  }, [processedPrescriptions, searchTerm, filterConfig]);

  // Sort prescriptions
  const sortedPrescriptions = useMemo(() => {
    const sortable = [...filteredPrescriptions];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }
    return sortable;
  }, [filteredPrescriptions, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <SortAsc className="w-4 h-4" /> : 
      <SortDesc className="w-4 h-4" />;
  };

  const clearFilters = () => {
    setFilterConfig({
      doctorName: '',
      patientName: '',
      testName: '',
      reportStatus: '',
      fromDate: '',
      toDate: ''
    });
    setSearchTerm('');
  };

  const getStatusColor = (date) => {
    const today = new Date();
    const followUpDate = new Date(date);
    const diffDays = Math.ceil((followUpDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'status-overdue';
    if (diffDays === 0) return 'status-today';
    if (diffDays <= 7) return 'status-upcoming';
    return 'status-future';
  };

  const getReportStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: <ClockIcon className="w-4 h-4" />,
        color: 'report-pending',
        label: 'Pending',
        bgColor: '#FEF3C7',
        textColor: '#D97706'
      },
      'in-process': {
        icon: <RefreshCw className="w-4 h-4" />,
        color: 'report-in-process',
        label: 'In Process',
        bgColor: '#DBEAFE',
        textColor: '#2563EB'
      },
      completed: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'report-completed',
        label: 'Completed',
        bgColor: '#D1FAE5',
        textColor: '#059669'
      },
      not_ordered: {
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'report-not-ordered',
        label: 'Not Ordered',
        bgColor: '#F3F4F6',
        textColor: '#6B7280'
      }
    };
    return configs[status] || configs.not_ordered;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseMedicines = (medicinesStr) => {
    if (!medicinesStr) return [];
    const medicineEntries = medicinesStr.split(/\d+\./).filter(m => m.trim());
    return medicineEntries.map(med => {
      const nameMatch = med.match(/Medicine:\s*([^\s]+)/);
      const dosageMatch = med.match(/Dosage\s*:\s*([^d]+?)(?=duration|$)/i);
      const durationMatch = med.match(/duration\s*:\s*([^\s]+)/);
      const frequencyMatch = med.match(/frequency\s*:\s*([^\s]+)/);
      const instructionsMatch = med.match(/instructions\s*:\s*(.+)/);
      
      return {
        name: nameMatch ? nameMatch[1] : 'Not specified',
        dosage: dosageMatch ? dosageMatch[1].trim() : 'N/A',
        duration: durationMatch ? durationMatch[1] : 'N/A',
        frequency: frequencyMatch ? frequencyMatch[1] : 'N/A',
        instructions: instructionsMatch ? instructionsMatch[1].trim() : 'None'
      };
    });
  };

  const openModal = (prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => setSelectedPrescription(null), 300);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="loading-spinner" />
        <p>Loading prescriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertTriangle className="error-icon" />
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="prescriptions-container">
      {/* Header */}
      <div className="prescriptions-header">
        <div className="header-content-wrapper">
          <div>
            <h1 className="prescriptions-title">Prescriptions</h1>
            <p className="prescriptions-subtitle">Manage and view all patient prescriptions</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-value">{prescriptions.length}</div>
              <div className="stat-label">Total Prescriptions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {prescriptions.filter(p => p.testResport?.reportStatus === 'completed').length}
              </div>
              <div className="stat-label">Reports Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by patient, doctor, medicine or test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            {(searchTerm || Object.values(filterConfig).some(v => v)) && (
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                <X className="w-5 h-5" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <input
                type="text"
                placeholder="Filter by doctor"
                value={filterConfig.doctorName}
                onChange={(e) => setFilterConfig({...filterConfig, doctorName: e.target.value})}
                className="filter-input"
              />
              <input
                type="text"
                placeholder="Filter by patient"
                value={filterConfig.patientName}
                onChange={(e) => setFilterConfig({...filterConfig, patientName: e.target.value})}
                className="filter-input"
              />
              <input
                type="text"
                placeholder="Filter by test"
                value={filterConfig.testName}
                onChange={(e) => setFilterConfig({...filterConfig, testName: e.target.value})}
                className="filter-input"
              />
              <select
                value={filterConfig.reportStatus}
                onChange={(e) => setFilterConfig({...filterConfig, reportStatus: e.target.value})}
                className="filter-input"
              >
                <option value="">All Report Status</option>
                <option value="pending">Pending</option>
                <option value="in-process">In Process</option>
                <option value="completed">Completed</option>
              </select>
              <input
                type="date"
                placeholder="From date"
                value={filterConfig.fromDate}
                onChange={(e) => setFilterConfig({...filterConfig, fromDate: e.target.value})}
                className="filter-input"
              />
              <input
                type="date"
                placeholder="To date"
                value={filterConfig.toDate}
                onChange={(e) => setFilterConfig({...filterConfig, toDate: e.target.value})}
                className="filter-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="results-count">
        Found {sortedPrescriptions.length} prescription(s)
      </div>

      {/* Prescriptions Table */}
      <div className="prescriptions-table-container">
        <table className="prescriptions-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('patientName')} className="sortable-header">
                <div className="header-content">
                  Patient {getSortIcon('patientName')}
                </div>
              </th>
              <th onClick={() => requestSort('appointmentDate')} className="sortable-header">
                <div className="header-content">
                  Date {getSortIcon('appointmentDate')}
                </div>
              </th>
              <th>Test / Report</th>
              <th onClick={() => requestSort('followUp')} className="sortable-header">
                <div className="header-content">
                  Follow Up {getSortIcon('followUp')}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPrescriptions.map((prescription) => {
              const reportConfig = getReportStatusConfig(prescription.reportStatus);
              return (
                <tr key={prescription._id} className="prescription-row">
                  <td className="patient-cell">
                    <div className="patient-avatar">
                      <User className="avatar-icon" />
                    </div>
                    <div className="patient-info">
                      <div className="patient-name">{prescription.patientName}</div>
                      <div className="patient-details">
                        {prescription.patientAge} yrs • {prescription.patientGender}
                      </div>
                      {prescription.patientPhone && (
                        <div className="patient-contact">
                          <Phone className="w-3 h-3" /> {prescription.patientPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="doctor-cell">
                    <div className="doctor-name">{prescription.doctorName}</div>
                    <div className="doctor-specialty">{prescription.doctorQualification}</div>
                    <div className="doctor-experience">{prescription.doctorExperience} yrs exp</div>
                  </td>
                  <td className="date-cell">
                    <div className="appointment-date">{formatDate(prescription.appointmentDate)}</div>
                    <div className="appointment-time">{prescription.timeSlot}</div>
                    <div className={`attendance-status ${prescription.appointmentAttended ? 'attended' : 'not-attended'}`}>
                      {prescription.appointmentAttended ? '✓ Attended' : '✗ Not Attended'}
                    </div>
                  </td>
                  <td className="test-cell">
                    <div className="test-name">{prescription.testName}</div>
                    <div className={`report-status-badge ${reportConfig.color}`}>
                      {reportConfig.icon}
                      <span>{reportConfig.label}</span>
                    </div>
                    <div className="lab-name">{prescription.labName}</div>
                  </td>
                  <td className="followup-cell">
                    <span className={`status-badge ${getStatusColor(prescription.followUp)}`}>
                      {formatDate(prescription.followUp)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => openModal(prescription)}
                      className="view-details-btn"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
         </table>
        
        {sortedPrescriptions.length === 0 && (
          <div className="empty-state">
            <AlertCircle className="empty-icon" />
            <p className="empty-text">No prescriptions found</p>
            <p className="empty-subtext">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Enhanced Details Modal */}
      {isModalOpen && selectedPrescription && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header enhanced-header">
              <div className="modal-header-content">
                <h2 className="modal-title">Prescription Details</h2>
                <div className="modal-actions">
                  <button className="modal-action-btn" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="modal-action-btn" title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="modal-action-btn" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={closeModal} className="modal-close-btn">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-body enhanced-body">
              {/* Quick Stats Bar */}
              <div className="quick-stats-bar">
                <div className="quick-stat">
                  <UserCheck className="w-5 h-5" />
                  <span>Patient ID: {selectedPrescription.appointment?.user?.slice(-6) || 'N/A'}</span>
                </div>
                <div className="quick-stat">
                  <Calendar className="w-5 h-5" />
                  <span>Created: {formatDate(selectedPrescription.bookingDate || selectedPrescription.appointmentDate)}</span>
                </div>
                <div className="quick-stat">
                  <FileCheck className="w-5 h-5" />
                  <span>RX ID: {selectedPrescription._id?.slice(-8) || 'N/A'}</span>
                </div>
              </div>

              {/* Patient Information Card */}
              <div className="info-card">
                <div className="card-header">
                  <User className="card-icon" />
                  <h3 className="card-title">Patient Information</h3>
                </div>
                <div className="info-grid premium-grid">
                  <div className="info-item premium-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{selectedPrescription.patientName}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Age / Gender</span>
                    <span className="info-value">{selectedPrescription.patientAge} years • {selectedPrescription.patientGender}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Contact Number</span>
                    <span className="info-value">{selectedPrescription.patientPhone}</span>
                  </div>
                </div>
              </div>

              {/* Doctor & Hospital Information */}
              <div className="info-card">
                <div className="card-header">
                  <Stethoscope className="card-icon" />
                  <h3 className="card-title">Doctor & Hospital Information</h3>
                </div>
                <div className="info-grid premium-grid">
                  <div className="info-item premium-item">
                    <span className="info-label">Doctor Name</span>
                    <span className="info-value">{selectedPrescription.doctorName}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Qualification</span>
                    <span className="info-value">{selectedPrescription.doctorQualification}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Experience</span>
                    <span className="info-value">{selectedPrescription.doctorExperience} years</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Consultation Fee</span>
                    <span className="info-value">₹{selectedPrescription.doctorConsultationFee}</span>
                  </div>
                  <div className="info-item premium-item full-width">
                    <span className="info-label">Hospital</span>
                    <div className="hospital-details">
                      <Building className="w-4 h-4" />
                      <span>{selectedPrescription.hospitalName}</span>
                      {selectedPrescription.hospitalAddress && (
                        <span className="hospital-address">{selectedPrescription.hospitalAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="info-card">
                <div className="card-header">
                  <Calendar className="card-icon" />
                  <h3 className="card-title">Appointment Details</h3>
                </div>
                <div className="info-grid premium-grid">
                  <div className="info-item premium-item">
                    <span className="info-label">Appointment Date</span>
                    <span className="info-value">{formatDateTime(selectedPrescription.appointmentDate)}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Time Slot</span>
                    <span className="info-value">{selectedPrescription.timeSlot}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Status</span>
                    <span className={`attendance-badge ${selectedPrescription.appointmentAttended ? 'attended' : 'not-attended'}`}>
                      {selectedPrescription.appointmentAttended ? 'Attended' : 'Not Attended'}
                    </span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Fee Paid</span>
                    <span className="info-value">₹{selectedPrescription.appointmentFee}</span>
                  </div>
                </div>
              </div>

              {/* Prescribed Medicines */}
              <div className="info-card">
                <div className="card-header">
                  <Pill className="card-icon" />
                  <h3 className="card-title">Prescribed Medicines</h3>
                </div>
                <div className="medicines-list premium-medicines">
                  {parseMedicines(selectedPrescription.medicines).length > 0 ? (
                    parseMedicines(selectedPrescription.medicines).map((medicine, idx) => (
                      <div key={idx} className="medicine-card premium-medicine-card">
                        <div className="medicine-header">
                          <div className="medicine-name">{medicine.name}</div>
                          <div className="medicine-dosage-badge">{medicine.dosage}</div>
                        </div>
                        <div className="medicine-details-grid">
                          <div className="medicine-detail-item">
                            <span className="detail-label">Duration</span>
                            <span className="detail-value">{medicine.duration}</span>
                          </div>
                          <div className="medicine-detail-item">
                            <span className="detail-label">Frequency</span>
                            <span className="detail-value">{medicine.frequency}</span>
                          </div>
                        </div>
                        <div className="medicine-instructions">
                          <span className="detail-label">Instructions:</span>
                          <span className="detail-value">{medicine.instructions}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No medicines prescribed</div>
                  )}
                </div>
              </div>

              {/* Test & Report Information */}
              <div className="info-card">
                <div className="card-header">
                  <FlaskConical className="card-icon" />
                  <h3 className="card-title">Test & Report Information</h3>
                </div>
                <div className="info-grid premium-grid">
                  <div className="info-item premium-item">
                    <span className="info-label">Test Name</span>
                    <span className="info-value">{selectedPrescription.testName}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Lab Name</span>
                    <span className="info-value">{selectedPrescription.labName}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Lab Manager</span>
                    <span className="info-value">{selectedPrescription.labManager}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Test Fee</span>
                    <span className="info-value">₹{selectedPrescription.testFee}</span>
                  </div>
                  <div className="info-item premium-item">
                    <span className="info-label">Report Status</span>
                    <div className={`report-status-large ${getReportStatusConfig(selectedPrescription.reportStatus).color}`}>
                      {getReportStatusConfig(selectedPrescription.reportStatus).icon}
                      <span>{getReportStatusConfig(selectedPrescription.reportStatus).label}</span>
                    </div>
                  </div>
                  <div className="info-item premium-item full-width">
                    <span className="info-label">Test Precautions</span>
                    <span className="info-value">{selectedPrescription.testPrecautions || 'No specific precautions'}</span>
                  </div>
                </div>
              </div>

              {/* Follow Up & General Precautions */}
              <div className="info-card">
                <div className="card-header">
                  <Clock className="card-icon" />
                  <h3 className="card-title">Follow Up & Precautions</h3>
                </div>
                <div className="info-grid premium-grid">
                  <div className="info-item premium-item">
                    <span className="info-label">Follow Up Date</span>
                    <div className="followup-info">
                      <span className="info-value">{formatDate(selectedPrescription.followUp)}</span>
                      <span className={`followup-status ${getStatusColor(selectedPrescription.followUp)}`}>
                        {getStatusColor(selectedPrescription.followUp).replace('status-', '').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="info-item premium-item full-width">
                    <span className="info-label">General Precautions</span>
                    <span className="info-value">{selectedPrescription.precautions || 'No specific precautions'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="modal-footer-actions">
                <button className="footer-action-btn primary">
                  <Download className="w-4 h-4" />
                  Download Prescription
                </button>
                <button className="footer-action-btn secondary">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button className="footer-action-btn secondary">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsList;