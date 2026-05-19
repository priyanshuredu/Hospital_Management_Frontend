import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  Stethoscope,
  DollarSign,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building2,
  X,
  Upload,
  FileImage,
  Activity,
  Clock,
  Award,
  Users
} from 'lucide-react';
import '../styles/DoctorRegistration.css';

const API_URL = 'http://localhost:5000';

const DoctorRegistration = () => {
  const [formData, setFormData] = useState({
    doctor_name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    qualification: '',
    degree: '',
    institution: '',
    yearOfCompletion: '',
    experience: '',
    sub_department: '',
    consultation_fee: ''
  });

  const [images, setImages] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Fetch sub-departments on component mount
  useEffect(() => {
    fetchSubDepartments();
  }, []);

  const fetchSubDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await axios.get(`${API_URL}/sub-department/all`);
      
      // Handle the response structure based on your API
      let departmentsArray = [];
      
      // Check if response has the structure with success flag and subDepartments array
      if (response.data && response.data.success && Array.isArray(response.data.subDepartments)) {
        departmentsArray = response.data.subDepartments;
        console.log(departmentsArray)
      } 
      // Fallback for other possible response structures
      else if (Array.isArray(response.data)) {
        departmentsArray = response.data;
      } 
      else if (response.data && response.data.subDepartments && Array.isArray(response.data.subDepartments)) {
        departmentsArray = response.data.subDepartments;
      } 
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        departmentsArray = response.data.data;
      }
      
      // Map the departments to ensure consistent field names
      const mappedDepartments = departmentsArray.map(dept => ({
        _id: dept._id,
        name: dept.sub_departmentName || dept.subDepartmentName || dept.name || 'Unnamed',
        departmentName: dept.department?.departmentName || dept.departmentName || 'Unknown Department',
        status: dept.status,
        department: dept.department
      }));
      
      console.log('Fetched sub-departments:', mappedDepartments);
      setSubDepartments(mappedDepartments);
    } catch (error) {
      console.error('Error fetching sub-departments:', error);
      setErrors({ fetch: 'Failed to load departments. Please refresh the page.' });
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Image handling functions
  const handleImageNameChange = (index, imageName) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], name: imageName };
    setImages(updatedImages);
    
    // Clear error for this image
    if (imageErrors[index]) {
      const newImageErrors = { ...imageErrors };
      delete newImageErrors[index];
      setImageErrors(newImageErrors);
    }
  };

  const handleImageFileChange = (index, file) => {
    if (!file) return;
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setImageErrors({
        ...imageErrors,
        [index]: 'Please select a valid image file (JPEG, PNG, GIF, or WEBP)'
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageErrors({
        ...imageErrors,
        [index]: 'Image size should be less than 5MB'
      });
      return;
    }
    
    // Convert file to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedImages = [...images];
      updatedImages[index] = { 
        ...updatedImages[index], 
        file: file,
        preview: reader.result,
        fileType: file.type,
        fileSize: file.size
      };
      setImages(updatedImages);
    };
    reader.readAsDataURL(file);
    
    // Clear error if any
    if (imageErrors[index]) {
      const newImageErrors = { ...imageErrors };
      delete newImageErrors[index];
      setImageErrors(newImageErrors);
    }
  };

  const addImageField = () => {
    setImages([
      ...images,
      { name: '', file: null, preview: null, id: Date.now() }
    ]);
  };

  const removeImageField = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    
    // Clean up image errors
    const newImageErrors = { ...imageErrors };
    delete newImageErrors[index];
    setImageErrors(newImageErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.doctor_name.trim()) newErrors.doctor_name = 'Doctor name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.phone.toString().match(/^\d{10}$/)) newErrors.phone = 'Valid 10-digit phone number is required';
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.age || formData.age < 18 || formData.age > 120) newErrors.age = 'Please enter valid age (18-120)';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution name is required';
    if (!formData.yearOfCompletion || formData.yearOfCompletion < 1950 || formData.yearOfCompletion > new Date().getFullYear()) {
      newErrors.yearOfCompletion = 'Please enter valid year of completion';
    }
    if (!formData.experience || formData.experience < 0 || formData.experience > 70) {
      newErrors.experience = 'Please enter valid years of experience (0-70)';
    }
    if (!formData.sub_department) newErrors.sub_department = 'Please select a department';
    if (!formData.consultation_fee || formData.consultation_fee < 0) {
      newErrors.consultation_fee = 'Please enter valid consultation fee';
    }
    
    // Validate images
    images.forEach((image, index) => {
      if (!image.name.trim()) {
        newErrors[`image_${index}_name`] = 'Image name is required';
      }
      if (!image.file) {
        newErrors[`image_${index}_file`] = 'Please select an image file';
      }
    });
    
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
  
  // Create FormData object for multipart/form-data
  const submitFormData = new FormData();
  
  // Append doctor data as individual fields (not JSON string)
  submitFormData.append('doctor_name', formData.doctor_name);
  submitFormData.append('email', formData.email);
  submitFormData.append('phone', formData.phone);
  submitFormData.append('gender', formData.gender);
  submitFormData.append('age', formData.age);
  submitFormData.append('qualification', formData.qualification);
  submitFormData.append('degree', formData.degree);
  submitFormData.append('institution', formData.institution);
  submitFormData.append('yearOfCompletion', formData.yearOfCompletion);
  submitFormData.append('experience', formData.experience);
  submitFormData.append('sub_department', formData.sub_department);
  submitFormData.append('consultation_fee', formData.consultation_fee);
  
  // Append images - each image as a separate field with the same name 'images'
  images.forEach((image, index) => {
    if (image.file) {
      submitFormData.append('images', image.file);
      submitFormData.append('imageNames', image.name);
    }
  });
  
  try {
    const response = await axios.post(`${API_URL}/doctor/create`, submitFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data && response.data.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        resetForm();
      }, 3000);
    } else {
      throw new Error(response.data?.message || 'Failed to create doctor profile');
    }
  } catch (error) {
    console.error('Error creating doctor:', error);
    setErrors({ submit: error.response?.data?.message || 'Failed to create doctor profile. Please try again.' });
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      doctor_name: '',
      email: '',
      phone: '',
      gender: '',
      age: '',
      qualification: '',
      degree: '',
      institution: '',
      yearOfCompletion: '',
      experience: '',
      sub_department: '',
      consultation_fee: ''
    });
    setImages([]);
    setErrors({});
    setImageErrors({});
  };

  const getDepartmentDisplayName = (department) => {
    const name = department.sub_departmentName || department.subDepartmentName || department.name || 'Unnamed';
    const parentDept = department.departmentName || (department.department?.departmentName);
    return parentDept ? `${name} (${parentDept})` : name;
  };

  return (
    <div className="doctor-registration-container">
      <div className="registration-card">
        {/* Header */}
        <div className="registration-header">
          <div className="header-icon">
            <Stethoscope size={32} />
          </div>
          <div>
          <h2>Doctor Registration</h2>
          <p>Register a new doctor to join our medical team</p>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="alert success">
            <CheckCircle size={18} />
            <span>Doctor registered successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <div className="alert error">
            <AlertCircle size={18} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Fetch Error Alert */}
        {errors.fetch && (
          <div className="alert error">
            <AlertCircle size={18} />
            <span>{errors.fetch}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <div className="section-title">
              <User size={20} />
              <h3>Personal Information</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Doctor Name *
                </label>
                <input
                  type="text"
                  name="doctor_name"
                  value={formData.doctor_name}
                  onChange={handleChange}
                  placeholder="Enter doctor's full name"
                  className={errors.doctor_name ? 'error' : ''}
                />
                {errors.doctor_name && <span className="error-text">{errors.doctor_name}</span>}
              </div>

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
                  placeholder="doctor@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Users size={16} />
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  className={errors.age ? 'error' : ''}
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>
            </div>
          </div>

          {/* Educational Information */}
          <div className="form-section">
            <div className="section-title">
              <GraduationCap size={20} />
              <h3>Educational Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Award size={16} />
                  Qualification *
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g., MBBS, MD, MS"
                  className={errors.qualification ? 'error' : ''}
                />
                {errors.qualification && <span className="error-text">{errors.qualification}</span>}
              </div>

              <div className="form-group">
                <label>
                  <GraduationCap size={16} />
                  Degree *
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="Full degree name"
                  className={errors.degree ? 'error' : ''}
                />
                {errors.degree && <span className="error-text">{errors.degree}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Building2 size={16} />
                  Institution *
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Name of medical college/university"
                  className={errors.institution ? 'error' : ''}
                />
                {errors.institution && <span className="error-text">{errors.institution}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Year of Completion *
                </label>
                <input
                  type="number"
                  name="yearOfCompletion"
                  value={formData.yearOfCompletion}
                  onChange={handleChange}
                  placeholder="YYYY"
                  className={errors.yearOfCompletion ? 'error' : ''}
                />
                {errors.yearOfCompletion && <span className="error-text">{errors.yearOfCompletion}</span>}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="form-section">
            <div className="section-title">
              <Briefcase size={20} />
              <h3>Professional Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Clock size={16} />
                  Experience (years) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  className={errors.experience ? 'error' : ''}
                  step="0.5"
                />
                {errors.experience && <span className="error-text">{errors.experience}</span>}
              </div>

              <div className="form-group">
                <label>
                  <Stethoscope size={16} />
                  Department *
                </label>
                <select
                  name="sub_department"
                  value={formData.sub_department}
                  onChange={handleChange}
                  className={errors.sub_department ? 'error' : ''}
                  disabled={loadingDepartments}
                >
                  <option value="">Select department</option>
                  {subDepartments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {getDepartmentDisplayName(dept)}
                    </option>
                  ))}
                </select>
                {loadingDepartments && (
                  <span className="field-hint">
                    <div className="spinner-small"></div>
                    Loading departments...
                  </span>
                )}
                {!loadingDepartments && subDepartments.length === 0 && (
                  <span className="field-hint error-text">No departments available. Please contact administrator.</span>
                )}
                {errors.sub_department && <span className="error-text">{errors.sub_department}</span>}
              </div>

              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  Consultation Fee ($) *
                </label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  placeholder="Enter consultation fee"
                  className={errors.consultation_fee ? 'error' : ''}
                  step="0.01"
                />
                {errors.consultation_fee && <span className="error-text">{errors.consultation_fee}</span>}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="form-section">
            <div className="section-title">
              <ImageIcon size={20} />
              <h3>Doctor Images</h3>
              <button 
                type="button" 
                onClick={addImageField} 
                className="add-image-btn"
              >
                <Plus size={16} />
                Add Image
              </button>
            </div>

            <div className="images-container">
              {images.length === 0 && (
                <div className="no-images-message">
                  <ImageIcon size={48} />
                  <p>No images added yet. Click "Add Image" to upload doctor photos.</p>
                </div>
              )}
              
              {images.map((image, index) => (
                <div key={image.id || index} className="image-item">
                  <div className="image-header">
                    <h4>Image {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="remove-image-btn"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                  
                  <div className="image-fields">
                    <div className="form-group">
                      <label>
                        <FileImage size={16} />
                        Image Name *
                      </label>
                      <input
                        type="text"
                        value={image.name}
                        onChange={(e) => handleImageNameChange(index, e.target.value)}
                        placeholder="e.g., Profile Photo, Certificate, etc."
                        className={errors[`image_${index}_name`] ? 'error' : ''}
                      />
                      {errors[`image_${index}_name`] && (
                        <span className="error-text">{errors[`image_${index}_name`]}</span>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <Upload size={16} />
                        Image File *
                      </label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          id={`image-file-${index}`}
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => handleImageFileChange(index, e.target.files[0])}
                          className="file-input"
                        />
                        <label htmlFor={`image-file-${index}`} className="file-upload-label">
                          <Upload size={20} />
                          Choose Image
                        </label>
                        {image.file && (
                          <span className="file-name">{image.file.name}</span>
                        )}
                      </div>
                      {errors[`image_${index}_file`] && (
                        <span className="error-text">{errors[`image_${index}_file`]}</span>
                      )}
                      <small className="field-hint">
                        Allowed formats: JPEG, PNG, GIF, WEBP. Max size: 5MB
                      </small>
                    </div>
                    
                    {image.preview && (
                      <div className="image-preview">
                        <img src={image.preview} alt={image.name || 'Preview'} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                  Register Doctor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegistration;