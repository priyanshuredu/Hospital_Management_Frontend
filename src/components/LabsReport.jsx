// LabsReport.jsx
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

import { FaDownload, FaSort, FaFilter, FaSearch, FaTimes, FaFilePdf, FaFlask, FaMicroscope, FaHospital } from 'react-icons/fa';
import '../styles/LabsReport.css';

const LabsReport = () => {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'labName', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  
  // Unique hospitals for filters
  const [hospitals, setHospitals] = useState([]);

  // Load PDF libraries on component mount
  useEffect(() => {
    const initPDF = async () => {
      const ready = await loadPDFLibraries();
      setPdfReady(ready);
    };
    initPDF();
  }, []);

  // Fetch labs data
  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('Token');
      const response = await axios.get('https://hospital-management-backend-9u93.onrender.com/lab/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const labsData = response.data.labs || [];
      setLabs(labsData);
      setFilteredLabs(labsData);
      
      // Extract unique hospitals for filters
      const uniqueHospitals = [...new Set(labsData.map(lab => lab.hospital?.hospital_name).filter(Boolean))];
      setHospitals(uniqueHospitals);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching labs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...labs];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(lab =>
        lab.labName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.labManager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.qualification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.hospital?.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(lab => lab.status === statusFilter);
    }

    // Apply hospital filter
    if (hospitalFilter !== 'all') {
      result = result.filter(lab => lab.hospital?.hospital_name === hospitalFilter);
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
        } else if (sortConfig.key === 'age') {
          aVal = parseInt(aVal) || 0;
          bVal = parseInt(bVal) || 0;
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

    setFilteredLabs(result);
  }, [labs, searchTerm, statusFilter, hospitalFilter, sortConfig]);

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
    setHospitalFilter('all');
    setSortConfig({ key: 'labName', direction: 'asc' });
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
      doc.text('Labs Report', 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 120);
      const date = new Date().toLocaleString();
      doc.text(`Generated on: ${date}`, 14, 25);
      
      // Add filters info
      let filtersText = `Total Labs: ${filteredLabs.length}`;
      if (searchTerm) filtersText += ` | Search: ${searchTerm}`;
      if (statusFilter !== 'all') filtersText += ` | Status: ${statusFilter}`;
      if (hospitalFilter !== 'all') filtersText += ` | Hospital: ${hospitalFilter}`;
      doc.text(filtersText, 14, 32);
      
      // Prepare table data
      const tableData = filteredLabs.map(lab => [
        lab.labName || 'N/A',
        lab.labManager || 'N/A',
        lab.age || 'N/A',
        lab.qualification || 'N/A',
        lab.hospital?.hospital_name || 'N/A',
        lab.status || 'N/A'
      ]);
      
      // Generate table
      doc.autoTable({
        startY: 38,
        head: [[
          'Lab Name', 'Lab Manager', 'Age', 'Qualification', 'Hospital', 'Status'
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 20 },
          3: { cellWidth: 40 },
          4: { cellWidth: 50 },
          5: { cellWidth: 25 }
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
      
      doc.save(`labs_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  // Statistics
  const stats = {
    total: labs.length,
    active: labs.filter(l => l.status === 'active').length,
    inactive: labs.filter(l => l.status === 'inactive').length,
    avgAge: Math.round(labs.reduce((sum, l) => sum + (l.age || 0), 0) / labs.length) || 0,
    uniqueHospitals: new Set(labs.map(l => l.hospital?.hospital_name).filter(Boolean)).size
  };

  if (loading) {
    return (
      <div className="labs-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading labs data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="labs-report-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchLabs} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="labs-report-container">
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
          <h1>🔬 Labs Report</h1>
          <p>Complete list of diagnostic labs with manager and qualification details</p>
        </div>
        <button className="download-btn-top" onClick={downloadPDF}>
          <FaDownload size={16} />
          Download PDF
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon"><FaFlask /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Labs</div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon"><FaMicroscope /></div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Labs</div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-value">{stats.inactive}</div>
          <div className="stat-label">Inactive Labs</div>
        </div>
        <div className="stat-card age">
          <div className="stat-value">{stats.avgAge}</div>
          <div className="stat-label">Avg. Manager Age</div>
        </div>
        <div className="stat-card hospitals">
          <div className="stat-icon"><FaHospital /></div>
          <div className="stat-value">{stats.uniqueHospitals}</div>
          <div className="stat-label">Hospitals with Labs</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by lab name, manager, qualification or hospital..."
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
          {(statusFilter !== 'all' || hospitalFilter !== 'all') && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
        Showing {filteredLabs.length} of {labs.length} labs
      </div>

      {/* Labs Table */}
      <div className="labs-table-container">
        <table className="labs-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('labName')}>
                Lab Name {sortConfig.key === 'labName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('labManager')}>
                Lab Manager {sortConfig.key === 'labManager' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
              <th onClick={() => handleSort('hospital')}>
                Hospital {sortConfig.key === 'hospital' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLabs.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  <div className="no-data-message">
                    <div className="no-data-icon">🔬</div>
                    <p>No labs found matching your criteria</p>
                    <button onClick={clearFilters}>Clear Filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLabs.map((lab) => (
                <tr key={lab._id}>
                  <td className="lab-name">
                    <strong>{lab.labName}</strong>
                    <div className="lab-id">ID: {lab._id.slice(-6)}</div>
                  </td>
                  <td className="manager-name">{lab.labManager}</td>
                  <td>
                    <div className="age-badge">{lab.age} years</div>
                  </td>
                  <td>
                    <div className="qualification-badge">{lab.qualification}</div>
                  </td>
                  <td>
                    <div className="hospital-link">
                      <FaHospital className="hospital-icon" />
                      {lab.hospital?.hospital_name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(lab.status)}`}>
                      {lab.status?.toUpperCase()}
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

export default LabsReport;