import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import '../styles/ManageDoctors.css';

const API_URL = 'http://localhost:5000';

const ManageDoctors = () => {
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

  useEffect(() => {
    fetchDoctors();
    fetchSubDepartments();
  }, []);

  useEffect(() => {
    const results = doctors.filter(doctor =>
      doctor.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.phone?.includes(searchTerm)
    );
    setFilteredDoctors(results);
    setCurrentPage(1);
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/doctor/all`);
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

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
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
      await axios.delete(`${API_URL}/doctor/delete/${selectedDoctor._id}`);
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
      if (response.data && response.data.success) {
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
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
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter-btn">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {updateSuccess && (
        <div className="alert success">
          <CheckCircle size={18} />
          <span>Doctor updated successfully!</span>
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
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Experience</th>
                  <th>Consultation Fee</th>
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
                    <td><Clock size={14} /> {doctor.experience} years</td>
                    <td><DollarSign size={14} /> ${doctor.consultation_fee}</td>
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
                <p>No doctors found</p>
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
                <span>Page {currentPage} of {totalPages}</span>
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

      {/* View Modal */}
      {isViewModalOpen && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Doctor Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="doctor-profile-header">
                <div className="profile-avatar large">
                  <Stethoscope size={48} />
                </div>
                <div className="profile-info">
                  <h3>{selectedDoctor.doctor_name}</h3>
                  <p>{selectedDoctor.qualification}, {selectedDoctor.degree}</p>
                  <span className="badge">{selectedDoctor.sub_department?.sub_departmentName || 'General'}</span>
                </div>
              </div>
              <div className="details-grid">
                <div className="detail-item"><label>Email:</label><span>{selectedDoctor.email}</span></div>
                <div className="detail-item"><label>Phone:</label><span>{selectedDoctor.phone}</span></div>
                <div className="detail-item"><label>Gender:</label><span>{selectedDoctor.gender}</span></div>
                <div className="detail-item"><label>Age:</label><span>{selectedDoctor.age}</span></div>
                <div className="detail-item"><label>Institution:</label><span>{selectedDoctor.institution}</span></div>
                <div className="detail-item"><label>Year of Completion:</label><span>{selectedDoctor.yearOfCompletion}</span></div>
                <div className="detail-item"><label>Experience:</label><span>{selectedDoctor.experience} years</span></div>
                <div className="detail-item"><label>Consultation Fee:</label><span>${selectedDoctor.consultation_fee}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

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