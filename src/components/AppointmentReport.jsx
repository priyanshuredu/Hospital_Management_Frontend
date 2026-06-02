// AppointmentReport.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaDownload, FaSort, FaFilter, FaSearch, FaTimes, FaFilePdf, FaUserMd, FaHospital, FaCalendarAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import '../styles/AppointmentReport.css';

const AppointmentReport = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'appointmentDate', direction: 'desc' });
  const [uniqueDoctors, setUniqueDoctors] = useState([]);

  // Fetch appointments data
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('Token');
      const response = await axios.get('http://localhost:5000/appointment/by-hospital', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const appointmentsData = response.data.appointments || [];
      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);
      
      // Extract unique doctors for filter
      const doctors = [...new Set(appointmentsData.map(apt => apt.doctor?.doctor_name).filter(Boolean))];
      setUniqueDoctors(doctors);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...appointments];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor?.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientPhone?.toString().includes(searchTerm) ||
        apt._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter (attended status)
    if (statusFilter !== 'all') {
      const isAttended = statusFilter === 'attended';
      result = result.filter(apt => apt.appointmentAttended === isAttended);
    }

    // Apply doctor filter
    if (doctorFilter !== 'all') {
      result = result.filter(apt => apt.doctor?.doctor_name === doctorFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortConfig.key) {
          case 'appointmentDate':
            aVal = new Date(a.appointmentDate);
            bVal = new Date(b.appointmentDate);
            break;
          case 'patientName':
            aVal = a.patientName || '';
            bVal = b.patientName || '';
            break;
          case 'doctor_name':
            aVal = a.doctor?.doctor_name || '';
            bVal = b.doctor?.doctor_name || '';
            break;
          case 'fee':
            aVal = a.fee || 0;
            bVal = b.fee || 0;
            break;
          case 'patientAge':
            aVal = a.patientAge || 0;
            bVal = b.patientAge || 0;
            break;
          case 'timeSlot':
            aVal = a.timeSlot || '';
            bVal = b.timeSlot || '';
            break;
          default:
            aVal = a[sortConfig.key];
            bVal = b[sortConfig.key];
        }
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredAppointments(result);
  }, [appointments, searchTerm, statusFilter, doctorFilter, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDoctorFilter('all');
    setSortConfig({ key: 'appointmentDate', direction: 'desc' });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format datetime for PDF
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 50);
    doc.text('Appointments Report', 14, 15);
    
    // Add hospital info (if available)
    if (appointments[0]?.hospital?.hospital_name) {
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 100);
      doc.text(`Hospital: ${appointments[0].hospital.hospital_name}`, 14, 25);
    }
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 120);
    const date = new Date().toLocaleString();
    doc.text(`Generated on: ${date}`, 14, 32);
    
    // Add filters info
    let filtersText = `Total Appointments: ${filteredAppointments.length} | Status: ${statusFilter === 'all' ? 'All' : statusFilter}`;
    if (doctorFilter !== 'all') filtersText += ` | Doctor: ${doctorFilter}`;
    if (searchTerm) filtersText += ` | Search: ${searchTerm}`;
    doc.text(filtersText, 14, 39);
    
    // Prepare table data
    const tableData = filteredAppointments.map(apt => [
      formatDate(apt.appointmentDate),
      apt.timeSlot || 'N/A',
      apt.patientName || 'N/A',
      apt.patientAge || 'N/A',
      apt.patientGender || 'N/A',
      apt.patientPhone || 'N/A',
      apt.doctor?.doctor_name || 'N/A',
      apt.doctor?.qualification || 'N/A',
      `$${apt.fee || 0}`,
      apt.appointmentAttended ? 'Attended' : 'Pending',
      formatDateTime(apt.bookingDate)
    ]);
    
    // Generate table
    doc.autoTable({
      startY: 45,
      head: [[
        'Date', 'Time', 'Patient Name', 'Age', 'Gender', 'Phone',
        'Doctor', 'Qualification', 'Fee', 'Status', 'Booked On'
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [67, 97, 238],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 18 },
        2: { cellWidth: 25 },
        3: { cellWidth: 12 },
        4: { cellWidth: 15 },
        5: { cellWidth: 22 },
        6: { cellWidth: 28 },
        7: { cellWidth: 25 },
        8: { cellWidth: 15 },
        9: { cellWidth: 18 },
        10: { cellWidth: 30 }
      },
      margin: { left: 14, right: 14 }
    });
    
    // Add summary section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 80);
    doc.text('Summary:', 14, finalY);
    
    const attended = filteredAppointments.filter(a => a.appointmentAttended).length;
    const pending = filteredAppointments.filter(a => !a.appointmentAttended).length;
    const totalRevenue = filteredAppointments.reduce((sum, a) => sum + (a.fee || 0), 0);
    
    doc.setFontSize(9);
    doc.text(`✓ Attended: ${attended}`, 14, finalY + 7);
    doc.text(`⏳ Pending: ${pending}`, 14, finalY + 14);
    doc.text(`💰 Total Revenue: $${totalRevenue.toLocaleString()}`, 14, finalY + 21);
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 170);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`appointments_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Get status badge class
  const getStatusBadgeClass = (attended) => {
    return attended ? 'status-attended' : 'status-pending';
  };

  // Get status text
  const getStatusText = (attended) => {
    return attended ? '✅ Attended' : '⏳ Pending';
  };

  // Calculate statistics
  const stats = {
    total: appointments.length,
    attended: appointments.filter(a => a.appointmentAttended).length,
    pending: appointments.filter(a => !a.appointmentAttended).length,
    totalRevenue: appointments.reduce((sum, a) => sum + (a.fee || 0), 0),
    uniquePatients: new Set(appointments.map(a => a.patientPhone)).size,
    uniqueDoctors: uniqueDoctors.length
  };

  if (loading) {
    return (
      <div className="appointment-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading appointments data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-report-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchAppointments} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-report-container">
      {/* Floating Download Button */}
      <button 
        className="floating-download-btn"
        onClick={downloadPDF}
        title="Download PDF Report"
      >
        <FaFilePdf size={24} />
        <span>Download PDF</span>
      </button>

      <div className="report-header">
        <div>
          <h1>📅 Appointments Report</h1>
          <p>Complete list of appointments with detailed patient and doctor information</p>
        </div>
        <button className="download-btn-top" onClick={downloadPDF}>
          <FaDownload size={16} />
          Download PDF
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon"><FaCalendarAlt /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
        <div className="stat-card attended">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.attended}</div>
          <div className="stat-label">Attended</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon"><FaMoneyBillWave /></div>
          <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card patients">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.uniquePatients}</div>
          <div className="stat-label">Unique Patients</div>
        </div>
        <div className="stat-card doctors">
          <div className="stat-icon"><FaUserMd /></div>
          <div className="stat-value">{stats.uniqueDoctors}</div>
          <div className="stat-label">Active Doctors</div>
        </div>
      </div>

      {/* Hospital Info Banner */}
      {appointments[0]?.hospital && (
        <div className="hospital-info-banner">
          <FaHospital className="hospital-icon" />
          <div className="hospital-details">
            <strong>{appointments[0].hospital.hospital_name}</strong>
            <span>{appointments[0].hospital.city?.cityName}, {appointments[0].hospital.district?.districtName}</span>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient name, doctor, phone or appointment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FaTimes />
            </button>
          )}
        </div>
        
        <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter />
          Filters
          {(statusFilter !== 'all' || doctorFilter !== 'all') && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="attended">Attended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Doctor:</label>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
              <option value="all">All Doctors</option>
              {uniqueDoctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>
          
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredAppointments.length} of {appointments.length} appointments
        {filteredAppointments.length > 0 && (
          <span className="revenue-summary">
            Total Revenue: ${filteredAppointments.reduce((sum, a) => sum + (a.fee || 0), 0).toLocaleString()}
          </span>
        )}
      </div>

      {/* Appointments Table */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('appointmentDate')}>
                Date {sortConfig.key === 'appointmentDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('patientName')}>
                Patient Name {sortConfig.key === 'patientName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('patientAge')}>
                Age/Gender {sortConfig.key === 'patientAge' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th>Phone</th>
              <th onClick={() => handleSort('doctor_name')}>
                Doctor {sortConfig.key === 'doctor_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th>Qualification</th>
              <th onClick={() => handleSort('fee')}>
                Fee {sortConfig.key === 'fee' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th>Status</th>
              <th>Booked Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  <div className="no-data-message">
                    <div className="no-data-icon">📭</div>
                    <p>No appointments found matching your criteria</p>
                    <button onClick={clearFilters}>Clear Filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="date-cell">
                    <FaCalendarAlt className="cell-icon" />
                    {formatDate(appointment.appointmentDate)}
                  </td>
                  <td className="time-cell">
                    <FaClock className="cell-icon" />
                    {appointment.timeSlot || 'N/A'}
                  </td>
                  <td className="patient-name">
                    <strong>{appointment.patientName}</strong>
                  </td>
                  <td>
                    {appointment.patientAge} yrs<br/>
                    <span className="gender-badge">{appointment.patientGender}</span>
                  </td>
                  <td className="phone-cell">{appointment.patientPhone}</td>
                  <td>
                    <div className="doctor-info">
                      <FaUserMd className="doctor-icon" />
                      <span>{appointment.doctor?.doctor_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="qualification-cell">
                    <small>{appointment.doctor?.qualification || 'N/A'}</small>
                  </td>
                  <td className="fee-cell">
                    <span className="fee-amount">${appointment.fee || 0}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(appointment.appointmentAttended)}`}>
                      {getStatusText(appointment.appointmentAttended)}
                    </span>
                  </td>
                  <td className="booking-date">
                    <small>{formatDateTime(appointment.bookingDate)}</small>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentReport;