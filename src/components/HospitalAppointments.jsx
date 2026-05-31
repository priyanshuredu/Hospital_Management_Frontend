// components/HospitalAppointments.jsx
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
  Building,
  DollarSign
} from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/HospitalAppointments.css';

const HospitalAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('appointmentDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAndSortAppointments();
  }, [appointments, searchTerm, sortBy, sortOrder, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAppointmentsByHospital();
      let appointmentsData = response;
      console.log("res",response)
      // if (response?.) appointmentsData = response.data;
      if (response?.appointments) appointmentsData = response.appointments;
      
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setFilteredAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.error('Error fetching hospital appointments:', error);
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAppointments = () => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientPhone?.toString().includes(searchTerm) ||
        apt.doctor?.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.timeSlot?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply attendance status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'attended') {
        filtered = filtered.filter(apt => apt.appointmentAttended === true);
      } else if (filterStatus === 'not-attended') {
        filtered = filtered.filter(apt => apt.appointmentAttended === false);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch(sortBy) {
        case 'appointmentDate':
          comparison = new Date(a.appointmentDate) - new Date(b.appointmentDate);
          break;
        case 'timeSlot':
          comparison = (a.timeSlot || '').localeCompare(b.timeSlot || '');
          break;
        case 'patientName':
          comparison = (a.patientName || '').localeCompare(b.patientName || '');
          break;
        case 'doctorName':
          comparison = (a.doctor?.doctor_name || '').localeCompare(b.doctor?.doctor_name || '');
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
      <div className="hospital-appointments-container">
        <div className="loading-spinner">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="hospital-appointments-container">
      {/* Header */}
      <div className="appointments-header">
        <div>
          <h1>Hospital Appointments</h1>
          <p>View and manage all appointments at your hospital</p>
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
          <div className="stat-badge">
            <span className="stat-label">Revenue</span>
            <span className="stat-number">
              ₹{appointments.filter(apt => apt.appointmentAttended === true).reduce((sum, apt) => sum + (apt.fee || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by patient name, phone, doctor, or time slot..."
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
              <button onClick={() => handleSort('doctorName')} className="sort-btn">
                Doctor <SortIcon field="doctorName" />
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
              <th>Doctor</th>
              <th>Date & Time</th>
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
                  <div className="doctor-info">
                    <strong>{appointment.doctor?.doctor_name || 'N/A'}</strong>
                    <div className="doctor-qualification">
                      {appointment.doctor?.qualification || ''}
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
                  <div className="fee-info">
                    {/* <DollarSign size={14} /> */}
                    <span>₹{appointment.fee}</span>
                  </div>
                </td>
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
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <Eye size={16} /> View Details
                  </button>
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
      {selectedAppointment && (
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
                    <strong>Address:</strong> {selectedAppointment.patientAddress || 'Not provided'}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Doctor Information</h3>
                <div className="details-grid">
                  <div className="detail-item full-width">
                    <strong>Doctor Name:</strong> {selectedAppointment.doctor?.doctor_name || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Qualification:</strong> {selectedAppointment.doctor?.qualification || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Experience:</strong> {selectedAppointment.doctor?.experience || 0} years
                  </div>
                  <div className="detail-item full-width">
                    <strong>Specialization:</strong> {selectedAppointment.doctor?.sub_department?.name || 'General'}
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
                    <strong>Consultation Fee:</strong> ₹{selectedAppointment.fee}
                  </div>
                  <div className="detail-item full-width">
                    <strong>Status:</strong>
                    <span className={selectedAppointment.appointmentAttended ? 'text-success' : 'text-warning'}>
                      {selectedAppointment.appointmentAttended ? ' Attended' : ' Not Attended'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppointment.prescription && (
                <div className="details-section">
                  <h3>Prescription</h3>
                  <div className="prescription-info">
                    <p><strong>Diagnosis:</strong> {selectedAppointment.prescription.diagnosis}</p>
                    <p><strong>Medicines:</strong></p>
                    <ul>
                      {selectedAppointment.prescription.medicines?.map((med, idx) => (
                        <li key={idx}>{med.name} - {med.dosage} ({med.frequency}) for {med.duration}</li>
                      ))}
                    </ul>
                    <p><strong>Advice:</strong> {selectedAppointment.prescription.advice}</p>
                    {selectedAppointment.prescription.followUpDate && (
                      <p><strong>Follow-up:</strong> {formatDate(selectedAppointment.prescription.followUpDate)}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button className="close-modal-btn" onClick={() => setSelectedAppointment(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAppointments;