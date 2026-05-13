import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Stethoscope,
  Bed,
  Ambulance,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Save,
  Hospital,
  FileText,
  Briefcase,
  Users,
  Heart,
  ChevronDown,
  X
} from 'lucide-react';
import '../styles/HospitalRegistration.css';

const API_URL = 'http://localhost:5000';

const HospitalRegistration = () => {
  const [formData, setFormData] = useState({
    hospital_name: '',
    registration_no: '',
    hospital_type: '',
    ownership: '',
    established_year: '',
    email: '',
    primary_phone: '',
    secondary_phone: '',
    hospital_address: '',
    city: '',
    district: '',
    state: '',
    total_doctors: '',
    total_beds: '',
    icu_beds: '',
    emergency_service: false,
    ambulance_service: false,
    departments: [],
    hospital_manager: '',
    hospital_description: ''
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch states and departments on component mount
  useEffect(() => {
    fetchStates();
    fetchDepartments();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/location/states');
      if (response.data && response.data.states) {
        setStates(response.data.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await axios.get(`${API_URL}/sub-department/all`);
      
      // Handle different response structures
      let departmentsArray = [];
      if (Array.isArray(response.data)) {
        departmentsArray = response.data;
      } else if (response.data && response.data.subDepartments && Array.isArray(response.data.subDepartments)) {
        departmentsArray = response.data.subDepartments;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        departmentsArray = response.data.data;
      }
      
      // Map the departments to ensure consistent field names
      const mappedDepartments = departmentsArray.map(dept => ({
        _id: dept._id,
        name: dept.sub_departmentName || dept.subDepartmentName || dept.name || 'Unnamed',
        status: dept.status,
        department: dept.department
      }));
      
      setAvailableDepartments(mappedDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchDistricts = async (stateId) => {
    try {
      const response = await axios.get(`http://localhost:5000/location/districts/by-state/${stateId}`);
      if (response.data && response.data.districts) {
        setDistricts(response.data.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchCities = async (districtId) => {
    try {
      const response = await axios.get(`http://localhost:5000/location/cities/${districtId}`);
      if (response.data && response.data.cities) {
        setCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Handle cascading selects
    if (name === 'state') {
      fetchDistricts(value);
      setFormData(prev => ({ ...prev, district: '', city: '' }));
      setDistricts([]);
      setCities([]);
    }
    
    if (name === 'district') {
      fetchCities(value);
      setFormData(prev => ({ ...prev, city: '' }));
      setCities([]);
    }
  };

  const handleDepartmentToggle = (department) => {
    const isSelected = formData.departments.some(
      dept => dept._id === department._id
    );
    
    if (isSelected) {
      // Remove department
      setFormData({
        ...formData,
        departments: formData.departments.filter(dept => dept._id !== department._id)
      });
    } else {
      // Add department
      setFormData({
        ...formData,
        departments: [...formData.departments, department]
      });
    }
  };

  const handleRemoveDepartment = (departmentToRemove) => {
    setFormData({
      ...formData,
      departments: formData.departments.filter(dept => dept._id !== departmentToRemove._id)
    });
  };

  const getDepartmentDisplayName = (department) => {
    return department.name || department.sub_departmentName || department.subDepartmentName || 'Unnamed';
  };

  const getDepartmentId = (department) => {
    return department._id;
  };

  // Filter departments based on search term
  const filteredDepartments = availableDepartments.filter(dept => {
    const deptName = getDepartmentDisplayName(dept).toLowerCase();
    return deptName.includes(searchTerm.toLowerCase());
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hospital_name.trim()) newErrors.hospital_name = 'Hospital name is required';
    if (!formData.registration_no.trim()) newErrors.registration_no = 'Registration number is required';
    if (!formData.hospital_type) newErrors.hospital_type = 'Hospital type is required';
    if (!formData.ownership) newErrors.ownership = 'Ownership type is required';
    if (!formData.established_year) newErrors.established_year = 'Established year is required';
    if (formData.established_year && (formData.established_year < 1800 || formData.established_year > new Date().getFullYear())) {
      newErrors.established_year = 'Please enter a valid year';
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.primary_phone.toString().match(/^\d{10}$/)) newErrors.primary_phone = 'Valid 10-digit phone number is required';
    if (!formData.hospital_address.trim()) newErrors.hospital_address = 'Address is required';
    if (!formData.city) newErrors.city = 'Please select a city';
    if (!formData.district) newErrors.district = 'Please select a district';
    if (!formData.state) newErrors.state = 'Please select a state';
    if (!formData.total_doctors || formData.total_doctors < 0) newErrors.total_doctors = 'Valid number of doctors is required';
    if (!formData.total_beds || formData.total_beds < 0) newErrors.total_beds = 'Valid number of beds is required';
    if (!formData.hospital_manager.trim()) newErrors.hospital_manager = 'Hospital manager name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    
    // Prepare data for submission - send department IDs
    const submissionData = {
      ...formData,
      departments: formData.departments.map(dept => getDepartmentId(dept))
    };
    
    try {
      const response = await axios.post(`${API_URL}/hospital/create`, submissionData);
      
      if (response.data) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating hospital:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create hospital. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      hospital_name: '',
      registration_no: '',
      hospital_type: '',
      ownership: '',
      established_year: '',
      email: '',
      primary_phone: '',
      secondary_phone: '',
      hospital_address: '',
      city: '',
      district: '',
      state: '',
      total_doctors: '',
      total_beds: '',
      icu_beds: '',
      emergency_service: false,
      ambulance_service: false,
      departments: [],
      hospital_manager: '',
      hospital_description: ''
    });
    setSearchTerm('');
    setErrors({});
    setIsDepartmentDropdownOpen(false);
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        {/* Header */}
        <div className="registration-header">
          <div className="header-icon">
            <Hospital size={32} />
          </div>
          <h2>Hospital Registration</h2>
          <p>Register your hospital to join our healthcare network</p>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="alert success">
            <CheckCircle size={18} />
            <span>Hospital registered successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <div className="alert error">
            <AlertCircle size={18} />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="section-title">
              <Building2 size={20} />
              <h3>Basic Information</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Hospital size={16} />
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  className={errors.hospital_name ? 'error' : ''}
                />
                {errors.hospital_name && <span className="error-text">{errors.hospital_name}</span>}
              </div>

              <div className="form-group">
                <label>
                  <FileText size={16} />
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="registration_no"
                  value={formData.registration_no}
                  onChange={handleChange}
                  placeholder="e.g., GOV/UP/2011/05"
                  className={errors.registration_no ? 'error' : ''}
                />
                {errors.registration_no && <span className="error-text">{errors.registration_no}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Building2 size={16} />
                  Hospital Type *
                </label>
                <select
                  name="hospital_type"
                  value={formData.hospital_type}
                  onChange={handleChange}
                  className={errors.hospital_type ? 'error' : ''}
                >
                  <option value="">Select type</option>
                  <option value="govt.">Government</option>
                  <option value="private">Private</option>
                  <option value="trust">Trust</option>
                  <option value="corporate">Corporate</option>
                </select>
                {errors.hospital_type && <span className="error-text">{errors.hospital_type}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Briefcase size={16} />
                  Ownership *
                </label>
                <select
                  name="ownership"
                  value={formData.ownership}
                  onChange={handleChange}
                  className={errors.ownership ? 'error' : ''}
                >
                  <option value="">Select ownership</option>
                  <option value="individual">Individual</option>
                  <option value="partnership">Partnership</option>
                  <option value="private_limited">Private Limited</option>
                  <option value="public_limited">Public Limited</option>
                  <option value="government">Government</option>
                </select>
                {errors.ownership && <span className="error-text">{errors.ownership}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Established Year *
                </label>
                <input
                  type="number"
                  name="established_year"
                  value={formData.established_year}
                  onChange={handleChange}
                  placeholder="YYYY"
                  className={errors.established_year ? 'error' : ''}
                />
                {errors.established_year && <span className="error-text">{errors.established_year}</span>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <div className="section-title">
              <Mail size={20} />
              <h3>Contact Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hospital@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  name="primary_phone"
                  value={formData.primary_phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={errors.primary_phone ? 'error' : ''}
                />
                {errors.primary_phone && <span className="error-text">{errors.primary_phone}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  name="secondary_phone"
                  value={formData.secondary_phone}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="form-section">
            <div className="section-title">
              <MapPin size={20} />
              <h3>Location Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>
                  <MapPin size={16} />
                  Hospital Address *
                </label>
                <textarea
                  name="hospital_address"
                  value={formData.hospital_address}
                  onChange={handleChange}
                  placeholder="Street address, landmark, area"
                  rows="2"
                  className={errors.hospital_address ? 'error' : ''}
                />
                {errors.hospital_address && <span className="error-text">{errors.hospital_address}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={errors.state ? 'error' : ''}
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state._id} value={state._id}>{state.stateName}</option>
                  ))}
                </select>
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label>District *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.state}
                  className={errors.district ? 'error' : ''}
                >
                  <option value="">Select district</option>
                  {districts.map(district => (
                    <option key={district._id} value={district._id}>{district.districtName}</option>
                  ))}
                </select>
                {errors.district && <span className="error-text">{errors.district}</span>}
              </div>

              <div className="form-group">
                <label>City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className={errors.city ? 'error' : ''}
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city._id} value={city._id}>{city.cityName}</option>
                  ))}
                </select>
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
            </div>
          </div>

          {/* Hospital Statistics */}
          <div className="form-section">
            <div className="section-title">
              <Users size={20} />
              <h3>Hospital Statistics</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Stethoscope size={16} />
                  Total Doctors *
                </label>
                <input
                  type="number"
                  name="total_doctors"
                  value={formData.total_doctors}
                  onChange={handleChange}
                  placeholder="Number of doctors"
                  className={errors.total_doctors ? 'error' : ''}
                />
                {errors.total_doctors && <span className="error-text">{errors.total_doctors}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Bed size={16} />
                  Total Beds *
                </label>
                <input
                  type="number"
                  name="total_beds"
                  value={formData.total_beds}
                  onChange={handleChange}
                  placeholder="Total bed capacity"
                  className={errors.total_beds ? 'error' : ''}
                />
                {errors.total_beds && <span className="error-text">{errors.total_beds}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Heart size={16} />
                  ICU Beds
                </label>
                <input
                  type="number"
                  name="icu_beds"
                  value={formData.icu_beds}
                  onChange={handleChange}
                  placeholder="Number of ICU beds"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="emergency_service"
                    checked={formData.emergency_service}
                    onChange={handleChange}
                  />
                  <span>24/7 Emergency Service Available</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="ambulance_service"
                    checked={formData.ambulance_service}
                    onChange={handleChange}
                  />
                  <span>Ambulance Service Available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Departments - Multi-select dropdown */}
          <div className="form-section">
            <div className="section-title">
              <Briefcase size={20} />
              <h3>Departments & Management</h3>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Select Departments (Multiple)</label>
                <div className="multi-select-container">
                  <div 
                    className="multi-select-header"
                    onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                  >
                    <div className="selected-departments">
                      {formData.departments.length === 0 ? (
                        <span className="placeholder">Select departments...</span>
                      ) : (
                        <div className="selected-tags">
                          {formData.departments.map((dept, index) => (
                            <span key={index} className="selected-tag">
                              {getDepartmentDisplayName(dept)}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDepartment(dept);
                                }}
                                className="remove-tag"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`dropdown-arrow ${isDepartmentDropdownOpen ? 'open' : ''}`}
                    />
                  </div>
                  
                  {isDepartmentDropdownOpen && (
                    <div className="multi-select-dropdown">
                      {loadingDepartments ? (
                        <div className="dropdown-loading">Loading departments...</div>
                      ) : (
                        <>
                          <div className="dropdown-search">
                            <input
                              type="text"
                              placeholder="Search departments..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="dropdown-options">
                            {filteredDepartments.length === 0 ? (
                              <div className="no-options">No departments found</div>
                            ) : (
                              filteredDepartments.map((dept) => {
                                const isSelected = formData.departments.some(
                                  selected => selected._id === dept._id
                                );
                                return (
                                  <label key={dept._id} className="dropdown-option">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleDepartmentToggle(dept)}
                                    />
                                    <span>{getDepartmentDisplayName(dept)}</span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <small className="field-hint">Select one or more departments for your hospital</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Hospital Manager *
                </label>
                <input
                  type="text"
                  name="hospital_manager"
                  value={formData.hospital_manager}
                  onChange={handleChange}
                  placeholder="Full name of hospital manager"
                  className={errors.hospital_manager ? 'error' : ''}
                />
                {errors.hospital_manager && <span className="error-text">{errors.hospital_manager}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Hospital Description</label>
                <textarea
                  name="hospital_description"
                  value={formData.hospital_description}
                  onChange={handleChange}
                  placeholder="Brief description about the hospital, specialties, achievements, etc."
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={resetForm} className="btn-secondary">
              <ArrowLeft size={18} />
              Reset Form
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Registering...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Register Hospital
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalRegistration;