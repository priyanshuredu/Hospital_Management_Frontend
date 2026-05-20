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
  Clock as ClockIcon
} from 'lucide-react';
import '../styles/DoctorAppointments.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
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
    try {
      // Simulate API call
      const data = await mockApiCall();
      setAppointments(data);
      setFilteredAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const mockApiCall = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            patientName: "John Doe",
            patientAge: 45,
            patientGender: "Male",
            phone: "+1 234 567 8900",
            email: "john.doe@email.com",
            address: "123 Main St, New York, NY 10001",
            date: "2024-01-15",
            time: "09:00 AM",
            type: "General Checkup",
            status: "completed",
            symptoms: "Headache, fatigue",
            notes: "Regular checkup, blood work needed",
            duration: 30
          },
          {
            id: 2,
            patientName: "Jane Smith",
            patientAge: 32,
            patientGender: "Female",
            phone: "+1 234 567 8901",
            email: "jane.smith@email.com",
            address: "456 Oak Ave, Los Angeles, CA 90001",
            date: "2024-01-15",
            time: "10:30 AM",
            type: "Follow-up",
            status: "confirmed",
            symptoms: "Blood pressure check",
            notes: "Follow-up on medication",
            duration: 20
          },
          {
            id: 3,
            patientName: "Mike Johnson",
            patientAge: 58,
            patientGender: "Male",
            phone: "+1 234 567 8902",
            email: "mike.j@email.com",
            address: "789 Pine Rd, Chicago, IL 60601",
            date: "2024-01-15",
            time: "02:00 PM",
            type: "Consultation",
            status: "pending",
            symptoms: "Chest pain, shortness of breath",
            notes: "Urgent consultation needed",
            duration: 45
          },
          {
            id: 4,
            patientName: "Sarah Williams",
            patientAge: 29,
            patientGender: "Female",
            phone: "+1 234 567 8903",
            email: "sarah.w@email.com",
            address: "321 Elm St, Houston, TX 77001",
            date: "2024-01-16",
            time: "11:00 AM",
            type: "Vaccination",
            status: "confirmed",
            symptoms: "Routine vaccination",
            notes: "Flu shot",
            duration: 15
          },
          {
            id: 5,
            patientName: "Robert Brown",
            patientAge: 67,
            patientGender: "Male",
            phone: "+1 234 567 8904",
            email: "robert.b@email.com",
            address: "654 Maple Dr, Phoenix, AZ 85001",
            date: "2024-01-16",
            time: "03:30 PM",
            type: "Specialist Referral",
            status: "cancelled",
            symptoms: "Joint pain, arthritis",
            notes: "Referred to orthopedics",
            duration: 30
          },
          {
            id: 6,
            patientName: "Emily Davis",
            patientAge: 24,
            patientGender: "Female",
            phone: "+1 234 567 8905",
            email: "emily.d@email.com",
            address: "987 Cedar Ln, Philadelphia, PA 19101",
            date: "2024-01-17",
            time: "09:30 AM",
            type: "Checkup",
            status: "confirmed",
            symptoms: "Annual physical",
            notes: "Complete blood work",
            duration: 30
          }
        ]);
      }, 800);
    });
  };

  const filterAndSortAppointments = () => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch(sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'time':
          comparison = a.time.localeCompare(b.time);
          break;
        case 'patientName':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <ClockIcon size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedAppointments = appointments.map(apt =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      );
      setAppointments(updatedAppointments);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
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
          <h1>Appointments</h1>
          <p>Manage and track all patient appointments</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-label">Total</span>
            <span className="stat-number">{appointments.length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Today</span>
            <span className="stat-number">{appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Pending</span>
            <span className="stat-number">{appointments.filter(apt => apt.status === 'pending').length}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by patient name, appointment type, or symptoms..."
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
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <div className="sort-buttons">
              <button onClick={() => handleSort('date')} className="sort-btn">
                Date <SortIcon field="date" />
              </button>
              <button onClick={() => handleSort('time')} className="sort-btn">
                Time <SortIcon field="time" />
              </button>
              <button onClick={() => handleSort('patientName')} className="sort-btn">
                Patient <SortIcon field="patientName" />
              </button>
              <button onClick={() => handleSort('type')} className="sort-btn">
                Type <SortIcon field="type" />
              </button>
              <button onClick={() => handleSort('status')} className="sort-btn">
                Status <SortIcon field="status" />
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
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} onClick={() => setSelectedAppointment(appointment)}>
                <td>
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="patient-name">{appointment.patientName}</div>
                      <div className="patient-detail">{appointment.patientAge} yrs, {appointment.patientGender}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="datetime-info">
                    <Calendar size={14} />
                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    <Clock size={14} />
                    <span>{appointment.time}</span>
                  </div>
                </td>
                <td>{appointment.type}</td>
                <td>
                  <span className={getStatusClass(appointment.status)}>
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </span>
                </td>
                <td>
                  <button className="view-details-btn">View Details</button>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                    <strong>Phone:</strong> {selectedAppointment.phone}
                  </div>
                  <div className="detail-item">
                    <Mail size={16} />
                    <strong>Email:</strong> {selectedAppointment.email}
                  </div>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <strong>Address:</strong> {selectedAppointment.address}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Appointment Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <strong>Time:</strong> {selectedAppointment.time}
                  </div>
                  <div className="detail-item">
                    <FileText size={16} />
                    <strong>Type:</strong> {selectedAppointment.type}
                  </div>
                  <div className="detail-item">
                    <span>⏱️</span>
                    <strong>Duration:</strong> {selectedAppointment.duration} minutes
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Medical Information</h3>
                <div className="detail-item full-width">
                  <strong>Symptoms:</strong> {selectedAppointment.symptoms}
                </div>
                <div className="detail-item full-width">
                  <strong>Notes:</strong> {selectedAppointment.notes}
                </div>
              </div>

              <div className="details-section">
                <h3>Update Status</h3>
                <div className="status-actions">
                  <button 
                    className="status-action-btn confirmed"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                  >
                    Confirm
                  </button>
                  <button 
                    className="status-action-btn completed"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                  >
                    Mark Completed
                  </button>
                  <button 
                    className="status-action-btn cancelled"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
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