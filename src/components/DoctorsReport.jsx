// DoctorsReport.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Dynamic imports for PDF libraries to prevent build errors
let jsPDF;
let autoTable;

// Lazy load PDF libraries
const loadPDFLibraries = async () => {
  try {
    const jspdfModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    jsPDF = jspdfModule.default;
    autoTable = autoTableModule.default;
    return true;
  } catch (error) {
    console.error('Failed to load PDF libraries:', error);
    return false;
  }
};

import { FaDownload, FaSort, FaFilter, FaSearch, FaTimes, FaFilePdf, FaUserMd, FaStar, FaCalendarAlt } from 'react-icons/fa';
import '../styles/DoctorsReport.css';

const DoctorsReport = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'doctor_name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  
  // Unique departments and hospitals for filters
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  // Load PDF libraries on component mount
  useEffect(() => {
    const initPDF = async () => {
      const ready = await loadPDFLibraries();
      setPdfReady(ready);
    };
    initPDF();
  }, []);

  // Fetch doctors data
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('Token');
      const response = await axios.get('https://hospital-management-backend-9u93.onrender.com/doctor/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const doctorsData = response.data.doctors || [];
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
      
      // Extract unique departments and hospitals for filters
      const uniqueDepts = [...new Set(doctorsData.map(d => d.sub_department?.sub_departmentName).filter(Boolean))];
      const uniqueHospitals = [...new Set(doctorsData.map(d => d.hospital?.hospital_name).filter(Boolean))];
      setDepartments(uniqueDepts);
      setHospitals(uniqueHospitals);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...doctors];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(doctor =>
        doctor.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.qualification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital?.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.sub_department?.sub_departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply gender filter
    if (genderFilter !== 'all') {
      result = result.filter(doctor => doctor.gender === genderFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(doctor => doctor.sub_department?.sub_departmentName === departmentFilter);
    }

    // Apply hospital filter
    if (hospitalFilter !== 'all') {
      result = result.filter(doctor => doctor.hospital?.hospital_name === hospitalFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle nested objects
        if (sortConfig.key === 'hospital') {
          aVal = a.hospital?.hospital_name || '';
          bVal = b.hospital?.hospital_name || '';
        } else if (sortConfig.key === 'department') {
          aVal = a.sub_department?.sub_departmentName || '';
          bVal = b.sub_department?.sub_departmentName || '';
        } else if (sortConfig.key === 'experience' || sortConfig.key === 'consultation_fee') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
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

    setFilteredDoctors(result);
  }, [doctors, searchTerm, genderFilter, departmentFilter, hospitalFilter, sortConfig]);

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
    setGenderFilter('all');
    setDepartmentFilter('all');
    setHospitalFilter('all');
    setSortConfig({ key: 'doctor_name', direction: 'asc' });
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!pdfReady) {
      alert('PDF generation is loading. Please try again in a moment.');
      return;
    }

    try {
      const doc = new jsPDF('landscape');
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 50);
      doc.text('Doctors Report', 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 120);
      const date = new Date().toLocaleString();
      doc.text(`Generated on: ${date}`, 14, 25);
      
      // Add filters info
      let filtersText = `Total Doctors: ${filteredDoctors.length}`;
      if (searchTerm) filtersText += ` | Search: ${searchTerm}`;
      if (genderFilter !== 'all') filtersText += ` | Gender: ${genderFilter}`;
      if (departmentFilter !== 'all') filtersText += ` | Dept: ${departmentFilter}`;
      doc.text(filtersText, 14, 32);
      
      // Prepare table data
      const tableData = filteredDoctors.map(doctor => [
        doctor.doctor_name || 'N/A',
        doctor.gender || 'N/A',
        doctor.age || 'N/A',
        doctor.qualification || 'N/A',
        doctor.experience || 0,
        doctor.sub_department?.sub_departmentName || 'N/A',
        doctor.hospital?.hospital_name || 'N/A',
        `₹${doctor.consultation_fee || 0}`,
        doctor.email || 'N/A',
        doctor.phone || 'N/A',
        doctor.accountStatus || 'N/A'
      ]);
      
      // Generate table
      doc.autoTable({
        startY: 38,
        head: [[
          'Doctor Name', 'Gender', 'Age', 'Qualification', 'Experience (Yrs)',
          'Department', 'Hospital', 'Fee', 'Email', 'Phone', 'Status'
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 18 },
          2: { cellWidth: 15 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
          6: { cellWidth: 40 },
          7: { cellWidth: 20 },
          8: { cellWidth: 45 },
          9: { cellWidth: 25 },
          10: { cellWidth: 20 }
        },
        margin: { left: 14, right: 14 }
      });
      
      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 170);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      }
      
      doc.save(`doctors_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Get gender badge class
  const getGenderBadgeClass = (gender) => {
    return gender === 'male' ? 'gender-male' : 'gender-female';
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  // Statistics
  const stats = {
    total: doctors.length,
    male: doctors.filter(d => d.gender === 'male').length,
    female: doctors.filter(d => d.gender === 'female').length,
    avgExperience: Math.round(doctors.reduce((sum, d) => sum + (d.experience || 0), 0) / doctors.length) || 0,
    avgFee: Math.round(doctors.reduce((sum, d) => sum + (d.consultation_fee || 0), 0) / doctors.length) || 0,
    active: doctors.filter(d => d.accountStatus === 'active').length
  };

  if (loading) {
    return (
      <div className="doctors-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading doctors data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctors-report-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchDoctors} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctors-report-container">
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
          <h1>👨‍⚕️ Doctors Report</h1>
          <p>Complete list of doctors with their qualifications and details</p>
        </div>
        <button className="download-btn-top" onClick={downloadPDF}>
          <FaDownload size={16} />
          Download PDF
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Doctors</div>
        </div>
        <div className="stat-card male">
          <div className="stat-value">{stats.male}</div>
          <div className="stat-label">Male</div>
        </div>
        <div className="stat-card female">
          <div className="stat-value">{stats.female}</div>
          <div className="stat-label">Female</div>
        </div>
        <div className="stat-card experience">
          <div className="stat-value">{stats.avgExperience}</div>
          <div className="stat-label">Avg. Experience (Yrs)</div>
        </div>
        <div className="stat-card fee">
          <div className="stat-value">₹{stats.avgFee}</div>
          <div className="stat-label">Avg. Consultation Fee</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Doctors</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, qualification, hospital or department..."
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
          {(genderFilter !== 'all' || departmentFilter !== 'all' || hospitalFilter !== 'all') && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Gender:</label>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Department:</label>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Hospital:</label>
            <select value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
              <option value="all">All Hospitals</option>
              {hospitals.map(hospital => (
                <option key={hospital} value={hospital}>{hospital}</option>
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
        Showing {filteredDoctors.length} of {doctors.length} doctors
      </div>

      {/* Doctors Table */}
      <div className="doctors-table-container">
        <table className="doctors-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('doctor_name')}>
                Doctor Name {sortConfig.key === 'doctor_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('gender')}>
                Gender {sortConfig.key === 'gender' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('age')}>
                Age {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('qualification')}>
                Qualification {sortConfig.key === 'qualification' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('experience')}>
                Experience {sortConfig.key === 'experience' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('department')}>
                Department {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('hospital')}>
                Hospital {sortConfig.key === 'hospital' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('consultation_fee')}>
                Fee {sortConfig.key === 'consultation_fee' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">
                  <div className="no-data-message">
                    <div className="no-data-icon">📭</div>
                    <p>No doctors found matching your criteria</p>
                    <button onClick={clearFilters}>Clear Filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td className="doctor-name">
                    <strong>{doctor.doctor_name}</strong>
                    <div className="doctor-degree">{doctor.degree}</div>
                  </td>
                  <td>
                    <span className={`gender-badge ${getGenderBadgeClass(doctor.gender)}`}>
                      {doctor.gender === 'male' ? '👨 Male' : '👩 Female'}
                    </span>
                  </td>
                  <td>{doctor.age} yrs</td>
                  <td>
                    <div className="qualification">{doctor.qualification}</div>
                    <div className="institution">{doctor.institution}, {doctor.yearOfCompletion}</div>
                  </td>
                  <td>
                    <div className="experience-badge">
                      <FaStar className="star-icon" />
                      {doctor.experience} years
                    </div>
                  </td>
                  <td>
                    <span className="department-badge">
                      {doctor.sub_department?.sub_departmentName || 'N/A'}
                    </span>
                  </td>
                  <td className="hospital-name">
                    {doctor.hospital?.hospital_name || 'N/A'}
                  </td>
                  <td className="fee-cell">
                    <span className="fee-amount">₹{doctor.consultation_fee}</span>
                  </td>
                  <td className="email-cell">{doctor.email}</td>
                  <td>{doctor.phone}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(doctor.accountStatus)}`}>
                      {doctor.accountStatus?.toUpperCase()}
                    </span>
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

export default DoctorsReport;