// components/DoctorAppointments.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  Filter, 
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  PlusCircle,
  Activity,
  X,
  FlaskConical,
  AlertCircle,
  Pill
} from 'lucide-react';
import { apiService } from '../services/api';
import axios from 'axios';
import '../styles/DoctorAppointments.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('appointmentDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [loadingLabTests, setLoadingLabTests] = useState(false);
  const [labTestsList, setLabTestsList] = useState([]);
  const [selectedLabTest, setSelectedLabTest] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    precautions: '',
    medicines: [],
    labTests: [],
    followUpDate: ''
  });
  const [currentMedicine, setCurrentMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAndSortAppointments();
  }, [appointments, searchTerm, sortBy, sortOrder, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAppointmentsByDoctor();
      let appointmentsData = response;
      if (response?.data) appointmentsData = response.data;
      if (response?.appointments) appointmentsData = response.appointments;
      
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setFilteredAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabTests = async () => {
    setLoadingLabTests(true);
    try {
      const response = await axios.get('https://hospital-management-backend-9u93.onrender.com/test/all');
      let labTestsData = response.data || response;
      if (response?.data?.tests) labTestsData = response.data.tests;
      if (response?.tests) labTestsData = response.tests;
      
      const formattedLabTests = Array.isArray(labTestsData) 
        ? labTestsData.map(test => ({
            _id: test._id || test.id,
            name: test.testName || test.test_name || test.name,
            price: test.fee || test.price,
            category: test.category,
            preparation: test.preparation_instructions,
            normal_range: test.normal_range,
            unit: test.unit
          }))
        : [];
      
      setLabTestsList(formattedLabTests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setLabTestsList([]);
    } finally {
      setLoadingLabTests(false);
    }
  };

  const filterAndSortAppointments = () => {
    let filtered = [...appointments];

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientPhone?.toString().includes(searchTerm) ||
        apt.timeSlot?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'attended') {
        filtered = filtered.filter(apt => apt.appointmentAttended === true);
      } else if (filterStatus === 'not-attended') {
        filtered = filtered.filter(apt => apt.appointmentAttended === false);
      }
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch(sortBy) {
        case 'appointmentDate':
          comparison = new Date(a.appointmentDate) - new Date(b.appointmentDate);
          break;
        case 'timeSlot':
          comparison = a.timeSlot?.localeCompare(b.timeSlot);
          break;
        case 'patientName':
          comparison = (a.patientName || '').localeCompare(b.patientName || '');
          break;
        case 'patientAge':
          comparison = (a.patientAge || 0) - (b.patientAge || 0);
          break;
        case 'fee':
          comparison = (a.fee || 0) - (b.fee || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAppointments(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const updateAttendance = async (appointmentId, status) => {
    try {
      await apiService.updateAppointmentAttendance(appointmentId, status);
      await fetchAppointments();
      if (selectedAppointment) {
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  const openPrescriptionModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedLabTest(null);
    setPrescriptionData(prev => ({ ...prev, labTests: [] }));
    await fetchLabTests();
    setShowPrescriptionModal(true);
  };

  const handleAddPrescription = async () => {
    if (!prescriptionData.medicines.length && !prescriptionData.precautions && !prescriptionData.labTests.length) {
      alert('Please add at least one medicine, precaution, or lab test');
      return;
    }

    setLoadingPrescription(true);
    try {
      const prescriptionPayload = {
        appointment: selectedAppointment._id,
        patientId: selectedAppointment.user?._id || selectedAppointment.user,
        precautions: prescriptionData.precautions,
        medicines: prescriptionData.medicines.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions || ''
        })),
        test: prescriptionData.labTests.length > 0 ? prescriptionData.labTests[0]._id : null,
        follow_up: prescriptionData.followUpDate || null,
        prescribedDate: new Date().toISOString()
      };
      
      console.log("Prescription:", prescriptionPayload);
      const response = await apiService.createPrescription(prescriptionPayload);
      
      if (response.prescription || response.message === 'Prescription created.') {
        alert('Prescription added successfully!');
        setShowPrescriptionModal(false);
        resetPrescriptionForm();
        await fetchAppointments();
      } else {
        throw new Error('Failed to add prescription');
      }
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert(error.response?.data?.message || 'Failed to add prescription. Please try again.');
    } finally {
      setLoadingPrescription(false);
    }
  };

  const resetPrescriptionForm = () => {
    setPrescriptionData({
      precautions: '',
      medicines: [],
      labTests: [],
      followUpDate: ''
    });
    setSelectedLabTest(null);
    setCurrentMedicine({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const addMedicine = () => {
    if (currentMedicine.name && currentMedicine.dosage) {
      setPrescriptionData({
        ...prescriptionData,
        medicines: [...prescriptionData.medicines, { ...currentMedicine, id: Date.now() }]
      });
      setCurrentMedicine({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    } else {
      alert('Please enter at least medicine name and dosage');
    }
  };

  const removeMedicine = (id) => {
    setPrescriptionData({
      ...prescriptionData,
      medicines: prescriptionData.medicines.filter(med => med.id !== id)
    });
  };

  // Single select lab test handler using _id
  const handleLabTestSelect = (test) => {
    if (selectedLabTest?._id === test._id) {
      // Deselect if already selected
      setSelectedLabTest(null);
      setPrescriptionData({
        ...prescriptionData,
        labTests: []
      });
    } else {
      // Select new test (replace existing)
      setSelectedLabTest(test);
      setPrescriptionData({
        ...prescriptionData,
        labTests: [test]
      });
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading-spinner">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      {/* Header */}
      <div className="appointments-header">
        <div>
          <h1>My Appointments</h1>
          <p>Manage and track all patient appointments</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-label">Total</span>
            <span className="stat-number">{appointments.length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Attended</span>
            <span className="stat-number">{appointments.filter(apt => apt.appointmentAttended === true).length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Pending</span>
            <span className="stat-number">{appointments.filter(apt => apt.appointmentAttended === false).length}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by patient name, phone, or time slot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Attendance Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="attended">Attended</option>
              <option value="not-attended">Not Attended</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <div className="sort-buttons">
              <button onClick={() => handleSort('appointmentDate')} className="sort-btn">
                Date <SortIcon field="appointmentDate" />
              </button>
              <button onClick={() => handleSort('timeSlot')} className="sort-btn">
                Time <SortIcon field="timeSlot" />
              </button>
              <button onClick={() => handleSort('patientName')} className="sort-btn">
                Patient <SortIcon field="patientName" />
              </button>
              <button onClick={() => handleSort('patientAge')} className="sort-btn">
                Age <SortIcon field="patientAge" />
              </button>
              <button onClick={() => handleSort('fee')} className="sort-btn">
                Fee <SortIcon field="fee" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date & Time</th>
              <th>Hospital</th>
              <th>Fee</th>
              <th>Attendance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="patient-name">{appointment.patientName}</div>
                      <div className="patient-detail">
                        {appointment.patientAge} yrs, {appointment.patientGender}
                      </div>
                      <div className="patient-contact">
                        <Phone size={12} /> {appointment.patientPhone}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="datetime-info"> 
                    <Calendar size={14} />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                    <Clock size={14} />
                    <span>{appointment.timeSlot}</span>
                  </div>
                </td>
                <td>
                  {appointment.doctor?.hospital?.hospital_name || appointment.hospital?.hospital_name || 'N/A'}
                </td>
                <td>₹{appointment.fee}</td>
                <td>
                  <span className={`status-badge ${appointment.appointmentAttended ? 'status-attended' : 'status-pending'}`}>
                    {appointment.appointmentAttended ? 
                      <CheckCircle size={14} /> : 
                      <ClockIcon size={14} />
                    }
                    {appointment.appointmentAttended ? 'Attended' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-details-btn"
                      onClick={() => setSelectedAppointment(appointment)}
                      title="View Details"
                    >
                      <Eye size={16} /> View
                    </button>
                    {!appointment.appointmentAttended && (
                      <button 
                        className="mark-attended-btn"
                        onClick={() => updateAttendance(appointment._id, true)}
                        title="Mark as Attended"
                      >
                        <Activity size={16} /> Mark Attended
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAppointments.length === 0 && (
          <div className="no-results">
            <p>No appointments found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && !showPrescriptionModal && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button className="close-btn" onClick={() => setSelectedAppointment(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-section">
                <h3>Patient Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <User size={16} />
                    <strong>Name:</strong> {selectedAppointment.patientName}
                  </div>
                  <div className="detail-item">
                    <span>🎂</span>
                    <strong>Age:</strong> {selectedAppointment.patientAge} years
                  </div>
                  <div className="detail-item">
                    <span>⚥</span>
                    <strong>Gender:</strong> {selectedAppointment.patientGender}
                  </div>
                  <div className="detail-item">
                    <Phone size={16} />
                    <strong>Phone:</strong> {selectedAppointment.patientPhone}
                  </div>
                  <div className="detail-item full-width">
                    <strong>Doctor:</strong> {selectedAppointment.doctor?.doctor_name || 'N/A'}
                  </div>
                  <div className="detail-item full-width">
                    <strong>Hospital:</strong> {selectedAppointment.hospital?.hospital_name || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Appointment Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <strong>Time:</strong> {selectedAppointment.timeSlot}
                  </div>
                  <div className="detail-item">
                    <strong>Booking Date:</strong> {formatDate(selectedAppointment.bookingDate)}
                  </div>
                  <div className="detail-item">
                    <strong>Fee:</strong> ₹{selectedAppointment.fee}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Attendance Status</h3>
                <div className="attendance-status">
                  <p>Current Status: 
                    <strong className={selectedAppointment.appointmentAttended ? 'text-success' : 'text-warning'}>
                      {selectedAppointment.appointmentAttended ? ' Attended' : ' Not Attended Yet'}
                    </strong>
                  </p>
                  {!selectedAppointment.appointmentAttended && (
                    <button 
                      className="update-attendance-btn"
                      onClick={() => updateAttendance(selectedAppointment._id, true)}
                    >
                      Mark as Attended
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                {
                  selectedAppointment.appointmentAttended ? (
                    <button 
                      className="prescription-btn"
                      onClick={() => openPrescriptionModal(selectedAppointment)}
                    >
                      <PlusCircle size={18} /> Add Prescription
                    </button>
                  ) : (<></>)
                }
                <button className="close-modal-btn" onClick={() => setSelectedAppointment(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => {
          setShowPrescriptionModal(false);
          resetPrescriptionForm();
        }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Prescription</h2>
              <button className="close-btn" onClick={() => {
                setShowPrescriptionModal(false);
                resetPrescriptionForm();
              }}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="prescription-form">
                <div className="form-group patient-info-bar">
                  <label>Patient: <strong>{selectedAppointment.patientName}</strong></label>
                  <label>Age: <strong>{selectedAppointment.patientAge} yrs</strong></label>
                  <label>Gender: <strong>{selectedAppointment.patientGender}</strong></label>
                </div>

                <div className="form-group">
                  <label>Hospital: <strong>{selectedAppointment.doctor?.hospital?.hospital_name || 'N/A'}</strong></label>
                </div>

                {/* Medicines Section */}
                <div className="form-group">
                  <label><Pill size={16} /> Medicines</label>
                  <div className="medicine-input-grid">
                    <input
                      type="text"
                      placeholder="Medicine name *"
                      value={currentMedicine.name}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, name: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g., 500mg) *"
                      value={currentMedicine.dosage}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, dosage: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Frequency (e.g., twice daily)"
                      value={currentMedicine.frequency}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, frequency: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g., 5 days)"
                      value={currentMedicine.duration}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, duration: e.target.value})}
                    />
                    <textarea
                      placeholder="Instructions (e.g., Take after food)"
                      value={currentMedicine.instructions}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, instructions: e.target.value})}
                      rows="2"
                    />
                    <button onClick={addMedicine} className="add-medicine-btn">Add Medicine</button>
                  </div>
                  
                  <div className="medicines-list">
                    {prescriptionData.medicines.length === 0 ? (
                      <p className="no-items">No medicines added yet</p>
                    ) : (
                      prescriptionData.medicines.map((med) => (
                        <div key={med.id} className="medicine-item">
                          <div className="medicine-details">
                            <strong>{med.name}</strong> - {med.dosage}
                            {med.frequency && <span> | {med.frequency}</span>}
                            {med.duration && <span> | {med.duration}</span>}
                            {med.instructions && <div className="medicine-instructions">📝 {med.instructions}</div>}
                          </div>
                          <button onClick={() => removeMedicine(med.id)} className="remove-medicine-btn">×</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Precautions Section */}
                <div className="form-group">
                  <label><AlertCircle size={16} /> Precautions</label>
                  <textarea
                    value={prescriptionData.precautions}
                    onChange={(e) => setPrescriptionData({...prescriptionData, precautions: e.target.value})}
                    placeholder="Enter precautions and safety measures..."
                    rows="3"
                  />
                </div>

                {/* Lab Tests Section - Single Select using _id */}
                <div className="form-group">
                  <label><FlaskConical size={16} /> Lab Tests (Select one)</label>
                  {loadingLabTests ? (
                    <div className="loading-lab-tests">Loading lab tests...</div>
                  ) : labTestsList.length > 0 ? (
                    <div className="lab-tests-dropdown">
                      <div className="lab-tests-container">
                        {labTestsList.map((test) => (
                          <label key={test._id} className={`lab-test-radio ${selectedLabTest?._id === test._id ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="labTest"
                              checked={selectedLabTest?._id === test._id}
                              onChange={() => handleLabTestSelect(test)}
                            />
                            <span className="test-name">{test.name}</span>
                            {test.price && <span className="test-price">₹{test.price}</span>}
                            {test.category && <span className="test-category">{test.category}</span>}
                            {test.normal_range && <span className="test-normal-range">Normal: {test.normal_range}</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-lab-tests">
                      <p>No lab tests available</p>
                    </div>
                  )}
                  
                  {selectedLabTest && (
                    <div className="selected-lab-test">
                      <strong>Selected Test:</strong>
                      <div className="selected-test-card">
                        <span className="test-name">{selectedLabTest.name}</span>
                        {selectedLabTest.price && <span className="test-price">₹{selectedLabTest.price}</span>}
                        {selectedLabTest.category && <span className="test-category">{selectedLabTest.category}</span>}
                        {selectedLabTest.preparation && (
                          <div className="test-preparation">
                            📋 Preparation: {selectedLabTest.preparation}
                          </div>
                        )}
                        <button 
                          className="remove-test-btn" 
                          onClick={() => handleLabTestSelect(selectedLabTest)}
                        >
                          × Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Follow-up Date */}
                <div className="form-group">
                  <label>Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData({...prescriptionData, followUpDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    onClick={handleAddPrescription} 
                    className="save-prescription-btn"
                    disabled={loadingPrescription}
                  >
                    {loadingPrescription ? 'Saving...' : 'Save Prescription'}
                    {!loadingPrescription && <PlusCircle size={18} />}
                  </button>
                  <button 
                    onClick={() => {
                      setShowPrescriptionModal(false);
                      resetPrescriptionForm();
                    }} 
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;