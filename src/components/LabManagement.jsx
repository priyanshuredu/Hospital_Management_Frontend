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
  Trash2,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  Building2,
  Users,
  Award
} from 'lucide-react';
import '../styles/LabManagement.css';

const API_URL = 'http://localhost:5000';

const LabManagement = () => {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
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
  const [itemsPerPage] = useState(6);

  // Fetch labs on component mount
  useEffect(() => {
    fetchLabs();
  }, []);

  // Filter labs based on search and status
  useEffect(() => {
    let filtered = [...labs];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lab =>
        lab.labName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.labManager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lab => lab.status === statusFilter);
    }
    
    setFilteredLabs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, labs]);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('Token');
      const response = await axios.get(`${API_URL}/lab/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      // console.log("first",response)
      // Handle different response structures
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

  const validateForm = (data, isEdit = false) => {
    const errors = {};
    
    if (!data.labName?.trim()) errors.labName = 'Lab name is required';
    if (!data.labManager?.trim()) errors.labManager = 'Lab manager name is required';
    
    // Only validate email for create form
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
    // Validate edit form (without email)
    const errors = validateForm(editFormData, true);
    
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      // Only send fields that should be updated (excluding email)
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
        <button className="add-lab-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add New Lab
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by lab name, manager or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="filter-group">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

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

      {/* Labs Grid */}
      {loading ? (
        <div className="loading-container">
          <Loader size={40} className="spinner" />
          <p>Loading labs...</p>
        </div>
      ) : (
        <>
          <div className="labs-grid">
            {currentItems.length === 0 ? (
              <div className="no-results">
                <FlaskConical size={64} />
                <h3>No labs found</h3>
                <p>{searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Click "Add New Lab" to create your first lab'}</p>
              </div>
            ) : (
              currentItems.map((lab) => (
                <div key={lab._id} className="lab-card">
                  <div className="card-header">
                    <div className="lab-icon">
                      <FlaskConical size={24} />
                    </div>
                    <div className="lab-title">
                      <h3>{lab.labName}</h3>
                      {getStatusBadge(lab.status)}
                    </div>
                    <div className="card-actions">
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
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <User size={16} />
                      <span className="label">Lab Manager:</span>
                      <span className="value">{lab.labManager}</span>
                    </div>
                    <div className="info-row">
                      <Mail size={16} />
                      <span className="label">Email:</span>
                      <span className="value">{lab.email || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                      <Calendar size={16} />
                      <span className="label">Age:</span>
                      <span className="value">{lab.age} years</span>
                    </div>
                    <div className="info-row">
                      <GraduationCap size={16} />
                      <span className="label">Qualification:</span>
                      <span className="value">{lab.qualification}</span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className="created-date">
                      Created: {new Date(lab.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
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
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'active' : ''}
                  >
                    {page}
                  </button>
                ))}
              </div>
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

      {/* Edit Lab Modal - Email field removed */}
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

                {/* Informational message about email */}
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