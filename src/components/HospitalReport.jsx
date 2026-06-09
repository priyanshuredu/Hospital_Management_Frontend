// HospitalReport.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaDownload, FaSort, FaFilter, FaSearch, FaTimes, FaFilePdf } from 'react-icons/fa';
import '../styles/HospitalReport.css';

const HospitalReport = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'hospital_name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [isFloatingBtnVisible, setIsFloatingBtnVisible] = useState(true);

  // Fetch hospitals data
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('Token');
      const response = await axios.get('https://hospital-management-backend-9u93.onrender.com/hospital/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHospitals(response.data.hospitals || []);
      setFilteredHospitals(response.data.hospitals || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...hospitals];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(hospital =>
        hospital.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.city?.cityName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(hospital => hospital.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(hospital => hospital.hospital_type === typeFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle nested objects
        if (sortConfig.key === 'city') {
          aVal = a.city?.cityName || '';
          bVal = b.city?.cityName || '';
        } else if (sortConfig.key === 'established_year') {
          aVal = parseInt(aVal);
          bVal = parseInt(bVal);
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

    setFilteredHospitals(result);
  }, [hospitals, searchTerm, statusFilter, typeFilter, sortConfig]);

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
    setTypeFilter('all');
    setSortConfig({ key: 'hospital_name', direction: 'asc' });
  };

  // Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 50);
    doc.text('Hospitals Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 120);
    const date = new Date().toLocaleString();
    doc.text(`Generated on: ${date}`, 14, 25);
    
    // Add filters info
    let filtersText = `Total Hospitals: ${filteredHospitals.length} | Status: ${statusFilter} | Type: ${typeFilter}`;
    if (searchTerm) filtersText += ` | Search: ${searchTerm}`;
    doc.text(filtersText, 14, 32);
    
    // Prepare table data
    const tableData = filteredHospitals.map(hospital => [
      hospital.hospital_name,
      hospital.city?.cityName || 'N/A',
      hospital.hospital_type,
      hospital.status,
      hospital.established_year,
      hospital.total_doctors,
      hospital.total_beds,
      hospital.emergency_service ? 'Yes' : 'No',
      hospital.ambulance_service ? 'Yes' : 'No',
      hospital.email,
      hospital.primary_phone,
      hospital.hospital_manager
    ]);
    
    // Generate table
    doc.autoTable({
      startY: 38,
      head: [[
        'Hospital Name', 'City', 'Type', 'Status', 'Est. Year',
        'Doctors', 'Beds', 'Emergency', 'Ambulance', 'Email', 'Phone', 'Manager'
      ]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 18 },
        3: { cellWidth: 18 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 18 },
        8: { cellWidth: 18 },
        9: { cellWidth: 40 },
        10: { cellWidth: 25 },
        11: { cellWidth: 25 }
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
    
    doc.save(`hospitals_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-unknown';
    }
  };

  // Statistics
  const stats = {
    total: hospitals.length,
    approved: hospitals.filter(h => h.status === 'approved').length,
    pending: hospitals.filter(h => h.status === 'pending').length,
    govt: hospitals.filter(h => h.hospital_type === 'govt.').length,
    private: hospitals.filter(h => h.hospital_type === 'private').length
  };

  if (loading) {
    return (
      <div className="hospital-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading hospitals data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hospital-report-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchHospitals} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-report-container">
      {/* Floating Download Button */}
      <button 
        className={`floating-download-btn ${isFloatingBtnVisible ? 'visible' : 'hidden'}`}
        onClick={downloadPDF}
        title="Download PDF Report"
      >
        <FaFilePdf size={24} />
        <span>Download PDF</span>
      </button>

      <div className="report-header">
        <div>
          <h1>🏥 Hospitals Report</h1>
          <p>Complete list of hospitals with detailed information</p>
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
          <div className="stat-label">Total Hospitals</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card govt">
          <div className="stat-value">{stats.govt}</div>
          <div className="stat-label">Government</div>
        </div>
        <div className="stat-card private">
          <div className="stat-value">{stats.private}</div>
          <div className="stat-label">Private</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by hospital name, email or city..."
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
          {(statusFilter !== 'all' || typeFilter !== 'all') && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Hospital Type:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="govt.">Government</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredHospitals.length} of {hospitals.length} hospitals
      </div>

      {/* Hospitals Table */}
      <div className="hospitals-table-container">
        <table className="hospitals-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('hospital_name')}>
                Hospital Name {sortConfig.key === 'hospital_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('city')}>
                City {sortConfig.key === 'city' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('hospital_type')}>
                Type {sortConfig.key === 'hospital_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('established_year')}>
                Est. Year {sortConfig.key === 'established_year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('total_doctors')}>
                Doctors {sortConfig.key === 'total_doctors' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('total_beds')}>
                Beds {sortConfig.key === 'total_beds' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th>Emergency</th>
              <th>Ambulance</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredHospitals.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">
                  <div className="no-data-message">
                    <div className="no-data-icon">📭</div>
                    <p>No hospitals found matching your criteria</p>
                    <button onClick={clearFilters}>Clear Filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHospitals.map((hospital) => (
                <tr key={hospital._id}>
                  <td className="hospital-name">
                    <strong>{hospital.hospital_name}</strong>
                    <div className="hospital-manager">{hospital.hospital_manager}</div>
                  </td>
                  <td>{hospital.city?.cityName || 'N/A'}</td>
                  <td>
                    <span className={`type-badge ${hospital.hospital_type === 'govt.' ? 'type-govt' : 'type-private'}`}>
                      {hospital.hospital_type === 'govt.' ? '🏛️ Govt' : '🏥 Private'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(hospital.status)}`}>
                      {hospital.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>{hospital.established_year}</td>
                  <td>{hospital.total_doctors}</td>
                  <td>{hospital.total_beds}</td>
                  <td className="service-indicator">
                    {hospital.emergency_service ? '✅ Yes' : '❌ No'}
                  </td>
                  <td className="service-indicator">
                    {hospital.ambulance_service ? '✅ Yes' : '❌ No'}
                  </td>
                  <td className="email-cell">{hospital.email}</td>
                  <td>{hospital.primary_phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HospitalReport;