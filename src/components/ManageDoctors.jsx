import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Award,
  Clock,
  X,
  CheckCircle,
  AlertCircle,
  Save,
  User,
  GraduationCap,
  Briefcase,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import '../styles/ManageDoctors.css';

const API_URL = 'https://hospital-management-backend-9u93.onrender.com';

const ManageDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [subDepartments, setSubDepartments] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  // New state for sorting and filtering
  const [sortConfig, setSortConfig] = useState({ key: 'doctor_name', direction: 'asc' });
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [availableSpecializations, setAvailableSpecializations] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchSubDepartments();
  }, []);

  // Update filtering, searching, and sorting whenever dependencies change
  useEffect(() => {
    let results = [...doctors];
    
    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      results = results.filter(doctor =>
        (doctor.doctor_name?.toLowerCase().includes(searchLower) ||
        doctor.email?.toLowerCase().includes(searchLower) ||
        doctor.qualification?.toLowerCase().includes(searchLower)) ||
        doctor.sub_department?.sub_departmentName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply specialization filter
    if (filterSpecialization) {
      results = results.filter(doctor =>
        doctor.sub_department?.sub_departmentName === filterSpecialization ||
        doctor.sub_department?.name === filterSpecialization
      );
    }
    
    // Apply experience filter
    if (filterExperience) {
      if (filterExperience === '0-5') {
        results = results.filter(doctor => doctor.experience < 5);
      } else if (filterExperience === '5-10') {
        results = results.filter(doctor => doctor.experience >= 5 && doctor.experience < 10);
      } else if (filterExperience === '10+') {
        results = results.filter(doctor => doctor.experience >= 10);
      }
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested properties
      if (sortConfig.key === 'specialization') {
        aValue = a.sub_department?.sub_departmentName || a.sub_department?.name || '';
        bValue = b.sub_department?.sub_departmentName || b.sub_department?.name || '';
      }
      
      // Handle numeric values
      if (sortConfig.key === 'experience' || sortConfig.key === 'consultation_fee') {
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
    
    setFilteredDoctors(results);
    setCurrentPage(1);
  }, [searchTerm, doctors, sortConfig, filterSpecialization, filterExperience]);

  // Extract unique specializations for filter dropdown
  useEffect(() => {
    if (doctors.length > 0) {
      const specializations = [...new Set(doctors.map(doctor => 
        doctor.sub_department?.sub_departmentName || doctor.sub_department?.name || 'General'
      ))];
      setAvailableSpecializations(specializations);
    }
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/doctor/all`);
      console.log("first", response);
      let doctorsArray = [];
      if (response.data && response.data.success && Array.isArray(response.data.doctors)) {
        doctorsArray = response.data.doctors;
      } else if (Array.isArray(response.data)) {
        doctorsArray = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        doctorsArray = response.data.data;
      }
      setDoctors(doctorsArray);
      setFilteredDoctors(doctorsArray);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/sub-department/all`);
      let departmentsArray = [];
      if (response.data && response.data.success && Array.isArray(response.data.subDepartments)) {
        departmentsArray = response.data.subDepartments;
      } else if (Array.isArray(response.data)) {
        departmentsArray = response.data;
      }
      const mappedDepartments = departmentsArray.map(dept => ({
        _id: dept._id,
        name: dept.sub_departmentName || dept.subDepartmentName || dept.name || 'Unnamed'
      }));
      setSubDepartments(mappedDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
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
    setFilterSpecialization('');
    setFilterExperience('');
    setSortConfig({ key: 'doctor_name', direction: 'asc' });
  };

  // Updated handleViewDoctor to navigate to details page
  const handleViewDoctor = (doctor) => {
    navigate(`/doctor/${doctor._id}`);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setEditFormData({
      doctor_name: doctor.doctor_name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      gender: doctor.gender || '',
      age: doctor.age || '',
      qualification: doctor.qualification || '',
      degree: doctor.degree || '',
      institution: doctor.institution || '',
      yearOfCompletion: doctor.yearOfCompletion || '',
      experience: doctor.experience || '',
      sub_department: doctor.sub_department?._id || doctor.sub_department || '',
      consultation_fee: doctor.consultation_fee || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/doctor/${selectedDoctor._id}`);
      fetchDoctors();
      setIsDeleteModalOpen(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    try {
      const response = await axios.put(`${API_URL}/doctor/update/${selectedDoctor._id}`, editFormData);
      if (response.data && response.data.updatedDoctor) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        fetchDoctors();
        setIsEditModalOpen(false);
        setSelectedDoctor(null);
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="manage-doctors-container">
      <div className="manage-doctors-header">
        <div className="header-left">
          <h1>Manage Doctors</h1>
          <p>View, edit, and manage all doctors in your hospital</p>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or qualification..."
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
            {(filterSpecialization || filterExperience) && <span className="filter-badge">•</span>}
          </button>
          {(filterSpecialization || filterExperience || searchTerm) && (
            <button className="reset-btn" onClick={resetFilters}>
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filterSpecialization || filterExperience) && (
        <div className="active-filters">
          <span>Active Filters:</span>
          {filterSpecialization && (
            <div className="filter-tag">
              Specialization: {filterSpecialization}
              <button onClick={() => setFilterSpecialization('')}>×</button>
            </div>
          )}
          {filterExperience && (
            <div className="filter-tag">
              Experience: {filterExperience === '0-5' ? '0-5 years' : filterExperience === '5-10' ? '5-10 years' : '10+ years'}
              <button onClick={() => setFilterExperience('')}>×</button>
            </div>
          )}
        </div>
      )}

      {updateSuccess && (
        <div className="alert success">
          <CheckCircle size={18} />
          <span>Doctor updated successfully!</span>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-content filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filter Doctors</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <label>Specialization</label>
                <select value={filterSpecialization} onChange={(e) => setFilterSpecialization(e.target.value)}>
                  <option value="">All Specializations</option>
                  {availableSpecializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Experience (Years)</label>
                <select value={filterExperience} onChange={(e) => setFilterExperience(e.target.value)}>
                  <option value="">All</option>
                  <option value="0-5">Less than 5 years</option>
                  <option value="5-10">5 - 10 years</option>
                  <option value="10+">10+ years</option>
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

      <div className="doctors-table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading doctors...</p>
          </div>
        ) : (
          <>
            <table className="doctors-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('doctor_name')} className="sortable-header">
                    Doctor Name {getSortIcon('doctor_name')}
                  </th>
                  <th onClick={() => handleSort('specialization')} className="sortable-header">
                    Specialization {getSortIcon('specialization')}
                  </th>
                  <th onClick={() => handleSort('email')} className="sortable-header">
                    Email {getSortIcon('email')}
                  </th>
                  <th>Phone</th>
                  <th onClick={() => handleSort('experience')} className="sortable-header">
                    Experience {getSortIcon('experience')}
                  </th>
                  <th onClick={() => handleSort('consultation_fee')} className="sortable-header">
                    Fee {getSortIcon('consultation_fee')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar">
                          <Stethoscope size={20} />
                        </div>
                        <div className="doctor-info">
                          <strong>{doctor.doctor_name}</strong>
                          <small>{doctor.qualification}</small>
                        </div>
                      </div>
                    </td>
                     <td>{doctor.sub_department?.sub_departmentName || doctor.sub_department?.name || 'N/A'}</td>
                     <td><Mail size={14} /> {doctor.email}</td>
                     <td><Phone size={14} /> {doctor.phone}</td>
                     <td>{doctor.experience} years</td>
                     <td><DollarSign size={14} /> {doctor.consultation_fee}</td>
                     <td>
                      <div className="action-buttons">
                        <button onClick={() => handleViewDoctor(doctor)} className="action-btn view">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEditDoctor(doctor)} className="action-btn edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteDoctor(doctor)} className="action-btn delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDoctors.length === 0 && (
              <div className="no-results">
                <Stethoscope size={48} />
                <p>No doctors found matching your criteria</p>
                <button onClick={resetFilters} className="btn-secondary">Clear Filters</button>
              </div>
            )}

            {filteredDoctors.length > 0 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                <span>Page {currentPage} of {totalPages} ({filteredDoctors.length} doctors)</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Doctor</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {updateError && <div className="alert error"><AlertCircle size={16} />{updateError}</div>}
                <div className="edit-form">
                  <div className="form-group"><label>Doctor Name *</label><input type="text" name="doctor_name" value={editFormData.doctor_name} onChange={handleEditChange} required /></div>
                  <div className="form-group"><label>Email *</label><input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required /></div>
                  <div className="form-group"><label>Phone *</label><input type="tel" name="phone" value={editFormData.phone} onChange={handleEditChange} required /></div>
                  <div className="form-group"><label>Gender</label><select name="gender" value={editFormData.gender} onChange={handleEditChange}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  <div className="form-group"><label>Age</label><input type="number" name="age" value={editFormData.age} onChange={handleEditChange} /></div>
                  <div className="form-group"><label>Qualification</label><input type="text" name="qualification" value={editFormData.qualification} onChange={handleEditChange} /></div>
                  <div className="form-group"><label>Degree</label><input type="text" name="degree" value={editFormData.degree} onChange={handleEditChange} /></div>
                  <div className="form-group"><label>Institution</label><input type="text" name="institution" value={editFormData.institution} onChange={handleEditChange} /></div>
                  <div className="form-group"><label>Year of Completion</label><input type="number" name="yearOfCompletion" value={editFormData.yearOfCompletion} onChange={handleEditChange} /></div>
                  <div className="form-group"><label>Experience (years)</label><input type="number" name="experience" value={editFormData.experience} onChange={handleEditChange} step="0.5" /></div>
                  <div className="form-group"><label>Department</label><select name="sub_department" value={editFormData.sub_department} onChange={handleEditChange}><option value="">Select</option>{subDepartments.map(dept => (<option key={dept._id} value={dept._id}>{dept.name}</option>))}</select></div>
                  <div className="form-group"><label>Consultation Fee ($)</label><input type="number" name="consultation_fee" value={editFormData.consultation_fee} onChange={handleEditChange} step="0.01" /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Save size={18} /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <AlertCircle size={48} className="warning-icon" />
              <p>Are you sure you want to delete <strong>{selectedDoctor.doctor_name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={confirmDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;