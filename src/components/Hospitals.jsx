import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Hospital,
  MapPin,
  Phone,
  Mail,
  Users,
  Bed,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
  Info,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/Hospitals.css';

const Hospitals = () => {
  const { isDarkMode } = useTheme();
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'hospital_name', direction: 'asc' });
  
  const itemsPerPage = 10;
  const availableTypes = ['govt.', 'private', 'trust', 'corporate'];

  // Fetch all hospitals
  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://hospital-management-backend-9u93.onrender.com/hospital/all');
      setHospitals(response.data.hospitals);
      setFilteredHospitals(response.data.hospitals);
    } catch (err) {
      setError('Failed to fetch hospitals. Please try again.');
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Filter, search, and sort hospitals
  useEffect(() => {
    let results = [...hospitals];
    
    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      results = results.filter(hospital =>
        hospital.hospital_name?.toLowerCase().includes(searchLower) ||
        hospital.registration_no?.toLowerCase().includes(searchLower) ||
        hospital.hospital_manager?.toLowerCase().includes(searchLower) ||
        hospital.email?.toLowerCase().includes(searchLower) ||
        hospital.city?.cityName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      results = results.filter(hospital => hospital.status === filterStatus);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      results = results.filter(hospital => hospital.hospital_type === filterType);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested properties
      if (sortConfig.key === 'city') {
        aValue = a.city?.cityName || '';
        bValue = b.city?.cityName || '';
      } else if (sortConfig.key === 'doctors') {
        aValue = a.total_doctors || 0;
        bValue = b.total_doctors || 0;
      } else if (sortConfig.key === 'beds') {
        aValue = a.total_beds || 0;
        bValue = b.total_beds || 0;
      }
      
      // Handle numeric values
      if (sortConfig.key === 'total_doctors' || sortConfig.key === 'total_beds') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredHospitals(results);
    setCurrentPage(1);
  }, [searchTerm, hospitals, sortConfig, filterStatus, filterType]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setSortConfig({ key: 'hospital_name', direction: 'asc' });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Fetch single hospital details
  const fetchHospitalDetails = async (id) => {
    try {
      const response = await axios.get(`https://hospital-management-backend-9u93.onrender.com/hospital/${id}`);
      setSelectedHospital(response.data.hospital);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching hospital details:', err);
      alert('Failed to fetch hospital details');
    }
  };

  // Update hospital status
  const updateStatus = async (id, newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await axios.patch(`https://hospital-management-backend-9u93.onrender.com/hospital/update-request`, {
        id,
        status: newStatus
      });
      
      if (response.data.success) {
        setHospitals(prev => 
          prev.map(h => h._id === id ? { ...h, status: newStatus } : h)
        );
        alert(`Hospital status updated to ${newStatus}`);
        if (showModal && selectedHospital?._id === id) {
          setSelectedHospital(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update hospital status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle status change from dropdown
  const handleStatusChange = async (id, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      await updateStatus(id, newStatus);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { class: 'status-approved', icon: CheckCircle, text: 'Approved' };
      case 'rejected':
        return { class: 'status-rejected', icon: XCircle, text: 'Rejected' };
      default:
        return { class: 'status-pending', icon: Clock, text: 'Pending' };
    }
  };

  // Get hospital type badge
  const getTypeBadge = (type) => {
    switch(type) {
      case 'govt.':
        return { class: 'type-govt', text: 'Government' };
      case 'private':
        return { class: 'type-private', text: 'Private' };
      case 'trust':
        return { class: 'type-trust', text: 'Trust' };
      case 'corporate':
        return { class: 'type-corporate', text: 'Corporate' };
      default:
        return { class: 'type-private', text: 'Private' };
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHospitals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);

  // Statistics
  const stats = {
    total: hospitals.length,
    approved: hospitals.filter(h => h.status === 'approved').length,
    pending: hospitals.filter(h => h.status === 'pending').length,
    rejected: hospitals.filter(h => h.status === 'rejected').length,
    totalDoctors: hospitals.reduce((sum, h) => sum + (h.total_doctors || 0), 0),
    totalBeds: hospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0)
  };

  if (loading) {
    return (
      <div className={`hospitals-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="loading-container">
          <RefreshCw className="spinning" size={48} />
          <p>Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`hospitals-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="hospitals-header">
        <div>
          <h1>Hospitals Management</h1>
          <p>View and manage hospital status</p>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by hospital name, registration no, manager, or email..."
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
            {(filterStatus !== 'all' || filterType !== 'all') && <span className="filter-badge">•</span>}
          </button>
          {(filterStatus !== 'all' || filterType !== 'all' || searchTerm) && (
            <button className="reset-btn" onClick={resetFilters}>
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filterStatus !== 'all' || filterType !== 'all') && (
        <div className="active-filters">
          <span>Active Filters:</span>
          {filterStatus !== 'all' && (
            <div className="filter-tag">
              Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              <button onClick={() => setFilterStatus('all')}>×</button>
            </div>
          )}
          {filterType !== 'all' && (
            <div className="filter-tag">
              Type: {filterType === 'govt.' ? 'Government' : filterType === 'private' ? 'Private' : filterType === 'trust' ? 'Trust' : 'Corporate'}
              <button onClick={() => setFilterType('all')}>×</button>
            </div>
          )}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
            <Hospital size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Hospitals</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
            <CheckCircle size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
            <Clock size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
            <XCircle size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalDoctors}</h3>
            <p>Total Doctors</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ec489920', color: '#ec4899' }}>
            <Bed size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalBeds}</h3>
            <p>Total Beds</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle-container">
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 Table View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            🖼️ Grid View
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-content filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter Hospitals</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <label>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Hospital Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="govt.">Government</option>
                  <option value="private">Private</option>
                  <option value="trust">Trust</option>
                  <option value="corporate">Corporate</option>
                </select>
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

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchHospitals} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="hospitals-table-container">
          <table className="hospitals-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('hospital_name')} className="sortable-header">
                  Hospital Name {getSortIcon('hospital_name')}
                </th>
                <th>Registration No</th>
                <th onClick={() => handleSort('hospital_type')} className="sortable-header">
                  Type {getSortIcon('hospital_type')}
                </th>
                <th onClick={() => handleSort('city')} className="sortable-header">
                  Location {getSortIcon('city')}
                </th>
                <th>Contact</th>
                <th onClick={() => handleSort('doctors')} className="sortable-header">
                  Doctors/Beds {getSortIcon('doctors')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable-header">
                  Status {getSortIcon('status')}
                </th>
                <th>Update Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((hospital) => {
                  const StatusIcon = getStatusBadge(hospital.status).icon;
                  const statusBadge = getStatusBadge(hospital.status);
                  const typeBadge = getTypeBadge(hospital.hospital_type);
                  
                  return (
                    <tr key={hospital._id}>
                      <td className="hospital-name-cell">
                        <div className="hospital-cell">
                          <div className="hospital-avatar-small">
                            <Hospital size={20} />
                          </div>
                          <div>
                            <strong>{hospital.hospital_name}</strong>
                            <small>{hospital.hospital_manager}</small>
                          </div>
                        </div>
                      </td>
                      <td>{hospital.registration_no}</td>
                      <td>
                        <span className={`type-badge ${typeBadge.class}`}>
                          {typeBadge.text}
                        </span>
                      </td>
                      <td>
                        <div className="location-info">
                          <MapPin size={14} />
                          <span>{hospital.city?.cityName || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <Phone size={14} />
                          <span>{hospital.primary_phone}</span>
                        </div>
                        <div className="contact-info">
                          <Mail size={14} />
                          <span>{hospital.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="stats-info">
                          <span>👨‍⚕️ {hospital.total_doctors || 0}</span>
                          <span>🛏️ {hospital.total_beds || 0}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          <StatusIcon size={14} />
                          {statusBadge.text}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-update-select"
                          value={hospital.status}
                          onChange={(e) => handleStatusChange(hospital._id, e.target.value)}
                          disabled={updatingStatus}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => fetchHospitalDetails(hospital._id)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <AlertCircle size={48} />
                    <p>No hospitals found</p>
                    <button onClick={resetFilters} className="clear-filters-btn">Clear Filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="hospitals-grid">
          {currentItems.length > 0 ? (
            currentItems.map((hospital) => {
              const statusBadge = getStatusBadge(hospital.status);
              const typeBadge = getTypeBadge(hospital.hospital_type);
              
              return (
                <div key={hospital._id} className="hospital-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <Hospital size={32} />
                    </div>
                    <div className="card-status">
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h3>{hospital.hospital_name}</h3>
                    <p className="manager">{hospital.hospital_manager}</p>
                    <div className="card-details">
                      <div className="detail">
                        <MapPin size={14} />
                        <span>{hospital.city?.cityName || 'N/A'}</span>
                      </div>
                      <div className="detail">
                        <Phone size={14} />
                        <span>{hospital.primary_phone}</span>
                      </div>
                      <div className="detail">
                        <Mail size={14} />
                        <span>{hospital.email}</span>
                      </div>
                    </div>
                    <div className="card-stats">
                      <div className="stat">
                        <Users size={16} />
                        <span>{hospital.total_doctors || 0} Doctors</span>
                      </div>
                      <div className="stat">
                        <Bed size={16} />
                        <span>{hospital.total_beds || 0} Beds</span>
                      </div>
                    </div>
                    <div className="card-badges">
                      <span className={`type-badge ${typeBadge.class}`}>
                        {typeBadge.text}
                      </span>
                      <span className="reg-no">{hospital.registration_no}</span>
                    </div>
                    <div className="status-update-section">
                      <label>Update Status:</label>
                      <select
                        className="status-update-select"
                        value={hospital.status}
                        onChange={(e) => handleStatusChange(hospital._id, e.target.value)}
                        disabled={updatingStatus}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button
                      className="card-btn view-btn"
                      onClick={() => fetchHospitalDetails(hospital._id)}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-data-grid">
              <AlertCircle size={48} />
              <p>No hospitals found</p>
              <button onClick={resetFilters} className="clear-filters-btn">Clear Filters</button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages} ({filteredHospitals.length} hospitals)
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Hospital Details Modal */}
      {showModal && selectedHospital && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hospital Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3><Hospital size={20} /> Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Hospital Name:</label>
                    <p>{selectedHospital.hospital_name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Registration No:</label>
                    <p>{selectedHospital.registration_no}</p>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <p>{selectedHospital.hospital_type}</p>
                  </div>
                  <div className="detail-item">
                    <label>Ownership:</label>
                    <p>{selectedHospital.ownership || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Established Year:</label>
                    <p>{selectedHospital.established_year || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusBadge(selectedHospital.status).class}`}>
                      {selectedHospital.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><MapPin size={20} /> Location</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <label>Address:</label>
                    <p>{selectedHospital.hospital_address}</p>
                  </div>
                  <div className="detail-item">
                    <label>City:</label>
                    <p>{selectedHospital.city?.cityName || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>District:</label>
                    <p>{selectedHospital.district?.districtName || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>State:</label>
                    <p>{selectedHospital.state?.stateName || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Country:</label>
                    <p>{selectedHospital.country || 'India'}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><Phone size={20} /> Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Primary Phone:</label>
                    <p>{selectedHospital.primary_phone}</p>
                  </div>
                  <div className="detail-item">
                    <label>Secondary Phone:</label>
                    <p>{selectedHospital.secondary_phone || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <p>{selectedHospital.email}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3> Medical Facilities</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Total Doctors:</label>
                    <p>{selectedHospital.total_doctors}</p>
                  </div>
                  <div className="detail-item">
                    <label>Total Beds:</label>
                    <p>{selectedHospital.total_beds}</p>
                  </div>
                  <div className="detail-item">
                    <label>ICU Beds:</label>
                    <p>{selectedHospital.icu_beds}</p>
                  </div>
                  <div className="detail-item">
                    <label>Emergency Service:</label>
                    <p>{selectedHospital.emergency_service ? '✅ Yes' : '❌ No'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Ambulance Service:</label>
                    <p>{selectedHospital.ambulance_service ? '✅ Yes' : '❌ No'}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Departments:</label>
                    <div className="departments-list">
                      {selectedHospital.departments?.map((dept, idx) => (
                        <span key={idx} className="dept-tag">{dept}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><Info size={20} /> Description</h3>
                <p className="hospital-description">{selectedHospital.hospital_description}</p>
              </div>
            </div>

            <div className="modal-footer">
              <div className="status-update-modal">
                <label>Update Status:</label>
                <select
                  className="status-update-select"
                  value={selectedHospital.status}
                  onChange={(e) => updateStatus(selectedHospital._id, e.target.value)}
                  disabled={updatingStatus}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <button className="close-action-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospitals;