import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  X,
  Save,
  User,
  Mail,
  Calendar,
  GraduationCap,
  Eye,
  Edit,
  Power,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  Building2,
  Users,
  Award,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import '../styles/LabManagement.css';

const API_URL = 'https://hospital-management-backend-9u93.onrender.com';

const LabManagement = () => {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'labName', direction: 'asc' });
  const [formData, setFormData] = useState({
    labName: '',
    labManager: '',
    email: '',
    age: '',
    qualification: ''
  });
  const [editFormData, setEditFormData] = useState({
    labName: '',
    labManager: '',
    age: '',
    qualification: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Fetch labs on component mount
  useEffect(() => {
    fetchLabs();
  }, []);

  // Filter, search, and sort labs
  useEffect(() => {
    let results = [...labs];
    
    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      results = results.filter(lab =>
        lab.labName?.toLowerCase().includes(searchLower) ||
        lab.labManager?.toLowerCase().includes(searchLower) ||
        lab.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(lab => lab.status === statusFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle numeric values
      if (sortConfig.key === 'age') {
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
    
    setFilteredLabs(results);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, labs, sortConfig]);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('Token');
      const response = await axios.get(`${API_URL}/lab/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      let labsArray = [];
      if (response.data && Array.isArray(response.data.labs)) {
        labsArray = response.data.labs;
      } else if (Array.isArray(response.data)) {
        labsArray = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        labsArray = response.data.data;
      }
      setLabs(labsArray);
    } catch (error) {
      console.error('Error fetching labs:', error);
      showAlert('error', 'Failed to load labs. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

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
    setStatusFilter('all');
    setSortConfig({ key: 'labName', direction: 'asc' });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const validateForm = (data, isEdit = false) => {
    const errors = {};
    
    if (!data.labName?.trim()) errors.labName = 'Lab name is required';
    if (!data.labManager?.trim()) errors.labManager = 'Lab manager name is required';
    
    if (!isEdit) {
      if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email is required';
    }
    
    if (!data.age || data.age < 18 || data.age > 100) errors.age = 'Age must be between 18 and 100';
    if (!data.qualification?.trim()) errors.qualification = 'Qualification is required';
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData, false);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(`${API_URL}/lab/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.message) {
        showAlert('success', 'Lab created successfully!');
        resetForm();
        setShowModal(false);
        fetchLabs();
      }
    } catch (error) {
      console.error('Error creating lab:', error);
      showAlert('error', error.response?.data?.message || 'Failed to create lab');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLab = async (e) => {
    e.preventDefault();
    const errors = validateForm(editFormData, true);
    
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const updateData = {
        labName: editFormData.labName,
        labManager: editFormData.labManager,
        age: editFormData.age,
        qualification: editFormData.qualification
      };
      
      const response = await axios.put(`${API_URL}/lab/update/${selectedLab._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.message) {
        showAlert('success', 'Lab updated successfully!');
        resetEditForm();
        setShowEditModal(false);
        fetchLabs();
      }
    } catch (error) {
      console.error('Error updating lab:', error);
      showAlert('error', error.response?.data?.message || 'Failed to update lab');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (labId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inActive' : 'active';
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/lab/status`, 
        { id: labId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.message) {
        showAlert('success', `Lab ${newStatus}d successfully!`);
        fetchLabs();
      }
    } catch (error) {
      console.error('Error updating lab status:', error);
      showAlert('error', error.response?.data?.message || 'Failed to update lab status');
    }
  };

  const openEditModal = (lab) => {
    setSelectedLab(lab);
    setEditFormData({
      labName: lab.labName || '',
      labManager: lab.labManager || '',
      age: lab.age || '',
      qualification: lab.qualification || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      labName: '',
      labManager: '',
      email: '',
      age: '',
      qualification: ''
    });
    setFormErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({
      labName: '',
      labManager: '',
      age: '',
      qualification: ''
    });
    setEditFormErrors({});
    setSelectedLab(null);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLabs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="status-badge active"><Activity size={12} /> Active</span>
      : <span className="status-badge inactive"><Clock size={12} /> Inactive</span>;
  };

  return (
    <div className="lab-management-container">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert-notification ${alert.type}`}>
          {alert.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="lab-header">
        <div className="header-left">
          <div className="header-icon">
            <FlaskConical size={28} />
          </div>
          <div>
            <h1>Lab Management</h1>
            <p>Manage all laboratory facilities and staff</p>
          </div>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by lab name, manager or email..."
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
            {statusFilter !== 'all' && <span className="filter-badge">•</span>}
          </button>
          {(statusFilter !== 'all' || searchTerm) && (
            <button className="reset-btn" onClick={resetFilters}>
              Reset All
            </button>
          )}
          <button className="add-lab-btn" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Add New Lab
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {statusFilter !== 'all' && (
        <div className="active-filters">
          <span>Active Filters:</span>
          <div className="filter-tag">
            Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
            <button onClick={() => setStatusFilter('all')}>×</button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-content filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter Labs</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inActive">Inactive</option>
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

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon total">
            <Building2 size={20} />
          </div>
          <div className="stat-info">
            <h3>{labs.length}</h3>
            <p>Total Labs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <Activity size={20} />
          </div>
          <div className="stat-info">
            <h3>{labs.filter(lab => lab.status === 'active').length}</h3>
            <p>Active Labs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <h3>{labs.filter(lab => lab.status === 'inActive').length}</h3>
            <p>Inactive Labs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon staff">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <h3>{labs.reduce((sum, lab) => sum + (lab.staffCount || 0), 0)}</h3>
            <p>Staff Members</p>
          </div>
        </div>
      </div>

      {/* Labs Table */}
      {loading ? (
        <div className="loading-container">
          <Loader size={40} className="spinner" />
          <p>Loading labs...</p>
        </div>
      ) : (
        <>
          <div className="labs-table-container">
            <table className="labs-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('labName')} className="sortable-header">
                    Lab Name {getSortIcon('labName')}
                  </th>
                  <th onClick={() => handleSort('labManager')} className="sortable-header">
                    Lab Manager {getSortIcon('labManager')}
                  </th>
                  <th>Email</th>
                  <th onClick={() => handleSort('age')} className="sortable-header">
                    Age {getSortIcon('age')}
                  </th>
                  <th>Qualification</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      <FlaskConical size={48} />
                      <p>No labs found</p>
                      <button onClick={resetFilters} className="clear-filters-btn">Clear Filters</button>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((lab) => (
                    <tr key={lab._id}>
                      <td>
                        <div className="lab-cell">
                          <div className="lab-avatar-small">
                            <FlaskConical size={20} />
                          </div>
                          <div>
                            <strong>{lab.labName}</strong>
                          </div>
                        </div>
                      </td>
                      <td>{lab.labManager}</td>
                      <td>{lab.email || 'Not provided'}</td>
                      <td>{lab.age} years</td>
                      <td>{lab.qualification}</td>
                      <td>{getStatusBadge(lab.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={() => openEditModal(lab)}>
                            <Edit size={16} />
                          </button>
                          <button 
                            className={`action-btn status ${lab.status === 'active' ? 'inactive' : 'active'}`}
                            onClick={() => handleStatusUpdate(lab._id, lab.status)}
                          >
                            <Power size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                Page {currentPage} of {totalPages} ({filteredLabs.length} labs)
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
        </>
      )}

      {/* Add Lab Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <FlaskConical size={24} />
              </div>
              <h2>Add New Lab</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label><Building2 size={16} /> Lab Name *</label>
                  <input
                    type="text"
                    name="labName"
                    value={formData.labName}
                    onChange={handleInputChange}
                    placeholder="Enter lab name"
                    className={formErrors.labName ? 'error' : ''}
                  />
                  {formErrors.labName && <span className="error-text">{formErrors.labName}</span>}
                </div>
                
                <div className="form-group">
                  <label><User size={16} /> Lab Manager *</label>
                  <input
                    type="text"
                    name="labManager"
                    value={formData.labManager}
                    onChange={handleInputChange}
                    placeholder="Enter lab manager name"
                    className={formErrors.labManager ? 'error' : ''}
                  />
                  {formErrors.labManager && <span className="error-text">{formErrors.labManager}</span>}
                </div>
                
                <div className="form-group">
                  <label><Mail size={16} /> Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="manager@example.com"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label><Calendar size={16} /> Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter age"
                      className={formErrors.age ? 'error' : ''}
                    />
                    {formErrors.age && <span className="error-text">{formErrors.age}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label><GraduationCap size={16} /> Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      placeholder="e.g., PhD, MSc, BSc"
                      className={formErrors.qualification ? 'error' : ''}
                    />
                    {formErrors.qualification && <span className="error-text">{formErrors.qualification}</span>}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader size={18} className="spinner" /> : <Save size={18} />}
                  {submitting ? 'Creating...' : 'Create Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lab Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <Edit size={24} />
              </div>
              <h2>Edit Lab</h2>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateLab}>
              <div className="modal-body">
                <div className="form-group">
                  <label><Building2 size={16} /> Lab Name *</label>
                  <input
                    type="text"
                    name="labName"
                    value={editFormData.labName}
                    onChange={handleEditInputChange}
                    placeholder="Enter lab name"
                    className={editFormErrors.labName ? 'error' : ''}
                  />
                  {editFormErrors.labName && <span className="error-text">{editFormErrors.labName}</span>}
                </div>
                
                <div className="form-group">
                  <label><User size={16} /> Lab Manager *</label>
                  <input
                    type="text"
                    name="labManager"
                    value={editFormData.labManager}
                    onChange={handleEditInputChange}
                    placeholder="Enter lab manager name"
                    className={editFormErrors.labManager ? 'error' : ''}
                  />
                  {editFormErrors.labManager && <span className="error-text">{editFormErrors.labManager}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label><Calendar size={16} /> Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={editFormData.age}
                      onChange={handleEditInputChange}
                      placeholder="Enter age"
                      className={editFormErrors.age ? 'error' : ''}
                    />
                    {editFormErrors.age && <span className="error-text">{editFormErrors.age}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label><GraduationCap size={16} /> Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      value={editFormData.qualification}
                      onChange={handleEditInputChange}
                      placeholder="e.g., PhD, MSc, BSc"
                      className={editFormErrors.qualification ? 'error' : ''}
                    />
                    {editFormErrors.qualification && <span className="error-text">{editFormErrors.qualification}</span>}
                  </div>
                </div>

                <div className="info-message">
                  <Mail size={14} />
                  <span>Email address cannot be changed. Contact administrator for email updates.</span>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader size={18} className="spinner" /> : <Save size={18} />}
                  {submitting ? 'Updating...' : 'Update Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabManagement;