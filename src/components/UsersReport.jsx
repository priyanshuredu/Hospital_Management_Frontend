// UsersReport.jsx
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

import { FaDownload, FaSort, FaFilter, FaSearch, FaTimes, FaFilePdf, FaUsers, FaUserCheck, FaUserTimes, FaEnvelope, FaUserCircle } from 'react-icons/fa';
import '../styles/UsersReport.css';

const UsersReport = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  // Load PDF libraries on component mount
  useEffect(() => {
    const initPDF = async () => {
      const ready = await loadPDFLibraries();
      setPdfReady(ready);
    };
    initPDF();
  }, []);

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('Token');
      const response = await axios.get('http://localhost:5000/user/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = response.data.result || response.data.users || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.accountStatus === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, statusFilter, sortConfig]);

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
    setSortConfig({ key: 'username', direction: 'asc' });
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!pdfReady) {
      alert('PDF generation is loading. Please try again in a moment.');
      return;
    }

    try {
      const doc = new jsPDF('portrait');
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 50);
      doc.text('Users Report', 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 120);
      const date = new Date().toLocaleString();
      doc.text(`Generated on: ${date}`, 14, 25);
      
      // Add filters info
      let filtersText = `Total Users: ${filteredUsers.length}`;
      if (searchTerm) filtersText += ` | Search: ${searchTerm}`;
      if (statusFilter !== 'all') filtersText += ` | Status: ${statusFilter}`;
      doc.text(filtersText, 14, 32);
      
      // Prepare table data
      const tableData = filteredUsers.map(user => [
        user.username || 'N/A',
        user.email || 'N/A',
        user.accountStatus || 'N/A'
      ]);
      
      // Generate table
      doc.autoTable({
        startY: 38,
        head: [['Username', 'Email', 'Account Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 80 },
          2: { cellWidth: 40 }
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
      
      doc.save(`users_report_${new Date().toISOString().split('T')[0]}.pdf`);
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
    total: users.length,
    active: users.filter(u => u.accountStatus === 'active').length,
    inactive: users.filter(u => u.accountStatus === 'inactive').length,
    uniqueDomains: new Set(users.map(u => u.email?.split('@')[1]).filter(Boolean)).size
  };

  if (loading) {
    return (
      <div className="users-report-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-report-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchUsers} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-report-container">
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
          <h1>👥 Users Report</h1>
          <p>Complete list of system users with account details</p>
        </div>
        <button className="download-btn-top" onClick={downloadPDF}>
          <FaDownload size={16} />
          Download PDF
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon"><FaUserCheck /></div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-icon"><FaUserTimes /></div>
          <div className="stat-value">{stats.inactive}</div>
          <div className="stat-label">Inactive Users</div>
        </div>
        <div className="stat-card domains">
          <div className="stat-icon"><FaEnvelope /></div>
          <div className="stat-value">{stats.uniqueDomains}</div>
          <div className="stat-label">Email Domains</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by username or email..."
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
          {statusFilter !== 'all' && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Account Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('username')}>
                Username {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('email')}>
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
              <th onClick={() => handleSort('accountStatus')}>
                Account Status {sortConfig.key === 'accountStatus' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                <FaSort className="sort-icon" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">
                  <div className="no-data-message">
                    <div className="no-data-icon">👥</div>
                    <p>No users found matching your criteria</p>
                    <button onClick={clearFilters}>Clear Filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={index}>
                  <td className="username-cell">
                    <div className="user-info">
                      <FaUserCircle className="user-icon" />
                      <div>
                        <strong>{user.username}</strong>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">
                    <div className="email-info">
                      <FaEnvelope className="email-icon" />
                      <a href={`mailto:${user.email}`} className="email-link">
                        {user.email}
                      </a>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user.accountStatus)}`}>
                      {user.accountStatus?.toUpperCase()}
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

export default UsersReport;