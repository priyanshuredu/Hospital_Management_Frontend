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
  DollarSign,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/HospitalAppointments.css';

const HospitalAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'appointmentDate', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAndSortAppointments();
  }, [appointments, searchTerm, sortConfig, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAppointmentsByHospital();
      let appointmentsData = response;
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
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchLower) ||
        apt.patientPhone?.toString().includes(searchTerm) ||
        apt.doctor?.doctor_name?.toLowerCase().includes(searchLower) ||
        apt.timeSlot?.toLowerCase().includes(searchLower)
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
      switch(sortConfig.key) {
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
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setSortConfig({ key: 'appointmentDate', direction: 'desc' });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
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
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

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
        <div className="header-right">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by patient name, phone, doctor, or time slot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search">
                <X size={14} />
              </button>
            )}
          </div>
          <button className="filter-btn" onClick={() => setIsFilterModalOpen(true)}>
            <Filter size={18} />
            Filter
            {filterStatus !== 'all' && <span className="filter-badge">•</span>}
          </button>
          {(filterStatus !== 'all' || searchTerm) && (
            <button className="reset-btn" onClick={resetFilters}>
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-content filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter Appointments</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
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
                    Date {getSortIcon('appointmentDate')}
                  </button>
                  <button onClick={() => handleSort('timeSlot')} className="sort-btn">
                    Time {getSortIcon('timeSlot')}
                  </button>
                  <button onClick={() => handleSort('patientName')} className="sort-btn">
                    Patient {getSortIcon('patientName')}
                  </button>
                  <button onClick={() => handleSort('doctorName')} className="sort-btn">
                    Doctor {getSortIcon('doctorName')}
                  </button>
                  <button onClick={() => handleSort('fee')} className="sort-btn">
                    Fee {getSortIcon('fee')}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => {
                resetFilters();
                setIsFilterModalOpen(false);
              }} className="btn-secondary">Reset All</button>
              <button onClick={() => setIsFilterModalOpen(false)} className="btn-primary">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('patientName')} className="sortable-header">
                Patient {getSortIcon('patientName')}
              </th>
              <th onClick={() => handleSort('doctorName')} className="sortable-header">
                Doctor {getSortIcon('doctorName')}
              </th>
              <th onClick={() => handleSort('appointmentDate')} className="sortable-header">
                Date & Time {getSortIcon('appointmentDate')}
              </th>
              <th onClick={() => handleSort('fee')} className="sortable-header">
                Fee {getSortIcon('fee')}
              </th>
              <th>Attendance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  <p>No appointments found matching your criteria</p>
                  <button onClick={resetFilters} className="clear-filters-btn">Clear Filters</button>
                </td>
              </tr>
            ) : (
              currentItems.map((appointment) => (
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
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages} ({filteredAppointments.length} appointments)
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
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