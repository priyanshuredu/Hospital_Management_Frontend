import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Stethoscope,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Award,
  Clock,
  Building,
  MapPin,
  GraduationCap,
  Briefcase,
  Hospital,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink
} from 'lucide-react';
import '../styles/DoctorDetails.css';

const API_URL = 'https://hospital-management-backend-9u93.onrender.com';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchDoctorDetails();
    fetchDoctorImages();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/doctor/${id}`);
      console.log("Doctor details:", response.data);
      
      if (response.data && response.data.doctor) {
        setDoctor(response.data.doctor);
      } else if (response.data) {
        setDoctor(response.data);
      } else {
        setError('Doctor not found');
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setError(error.response?.data?.message || 'Failed to fetch doctor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctor-img/doctor/${id}`);
      console.log("Doctor images:", response.data);
      
      if (response.data && response.data.images && Array.isArray(response.data.images)) {
        setImages(response.data.images);
      } else if (Array.isArray(response.data)) {
        setImages(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setImages(response.data.data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching doctor images:', error);
      // Don't set error state for images, just log it
      setImages([]);
    }
  };

  const openImageViewer = (index) => {
    setCurrentImageIndex(index);
    setSelectedImage(images[index]);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setSelectedImage(images[currentImageIndex + 1]);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setSelectedImage(images[currentImageIndex - 1]);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '/placeholder-image.jpg';
    // Handle Cloudinary URLs or any other image URLs
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  if (loading) {
    return (
      <div className="doctor-details-loading">
        <div className="spinner"></div>
        <p>Loading doctor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-details-error">
        <AlertCircle size={48} />
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          Back to Doctors
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-details-error">
        <p>Doctor not found</p>
        <button onClick={() => navigate('/manage-doctors')} className="btn-primary">
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="doctor-details-container">
      {/* Header with back button */}
      <div className="details-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Back to Doctors
        </button>
        <h1>Doctor Details</h1>
      </div>

      {/* Main Content */}
      <div className="details-content">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            <Stethoscope size={64} />
          </div>
          <div className="profile-info">
            <h2>{doctor.doctor_name}</h2>
            <p className="qualification">{doctor.qualification}</p>
            <p className="degree">{doctor.degree}</p>
            <div className="badge-container">
              <span className="badge">
                {doctor.sub_department?.sub_departmentName || 'General'}
              </span>
              <span className="badge status-badge">
                {doctor.accountStatus === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="info-card">
          <h3>
            {/* <User size={20} /> */}
            Personal Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Email:</label>
              <span><Mail size={16} /> {doctor.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span><Phone size={16} /> {doctor.phone}</span>
            </div>
            <div className="info-item">
              <label>Gender:</label>
              <span>{doctor.gender || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Age:</label>
              <span><Calendar size={16} /> {doctor.age || 'N/A'} years</span>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="info-card">
          <h3>
            <Briefcase size={20} />
            Professional Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Qualification:</label>
              <span><GraduationCap size={16} /> {doctor.qualification}</span>
            </div>
            <div className="info-item">
              <label>Degree:</label>
              <span>{doctor.degree}</span>
            </div>
            <div className="info-item">
              <label>Institution:</label>
              <span>{doctor.institution}</span>
            </div>
            <div className="info-item">
              <label>Year of Completion:</label>
              <span>{doctor.yearOfCompletion}</span>
            </div>
            <div className="info-item">
              <label>Experience:</label>
              <span><Clock size={16} /> {doctor.experience} years</span>
            </div>
            <div className="info-item">
              <label>Consultation Fee:</label>
              <span><DollarSign size={16} /> ${doctor.consultation_fee}</span>
            </div>
          </div>
        </div>

        {/* Hospital Information Card */}
        {doctor.hospital && (
          <div className="info-card">
            <h3>
              <Hospital size={20} />
              Hospital Information
            </h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Hospital Name:</label>
                <span>{doctor.hospital.hospital_name}</span>
              </div>
              <div className="info-item">
                <label>Registration No:</label>
                <span>{doctor.hospital.registration_no}</span>
              </div>
              <div className="info-item">
                <label>Hospital Type:</label>
                <span>{doctor.hospital.hospital_type}</span>
              </div>
              <div className="info-item">
                <label>Ownership:</label>
                <span>{doctor.hospital.ownership}</span>
              </div>
              <div className="info-item">
                <label>Established:</label>
                <span>{doctor.hospital.established_year}</span>
              </div>
              <div className="info-item full-width">
                <label>Address:</label>
                <span><MapPin size={16} /> {doctor.hospital.hospital_address}</span>
              </div>
              <div className="info-item">
                <label>City:</label>
                <span>{doctor.hospital.city?.cityName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Total Doctors:</label>
                <span>{doctor.hospital.total_doctors}</span>
              </div>
              <div className="info-item">
                <label>Total Beds:</label>
                <span>{doctor.hospital.total_beds}</span>
              </div>
              <div className="info-item">
                <label>ICU Beds:</label>
                <span>{doctor.hospital.icu_beds}</span>
              </div>
              <div className="info-item">
                <label>Emergency Service:</label>
                <span>{doctor.hospital.emergency_service ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <label>Ambulance Service:</label>
                <span>{doctor.hospital.ambulance_service ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item full-width">
                <label>Departments:</label>
                <div className="departments-list">
                  {doctor.hospital.departments?.map((dept, idx) => (
                    <span key={idx} className="department-tag">{dept}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images Gallery Section */}
        {images.length > 0 && (
          <div className="gallery-section">
            <h3>
              <Image size={20} />
              Documents & Certificates ({images.length})
            </h3>
            <div className="gallery-grid">
              {images.map((image, index) => (
                <div 
                  key={image._id || index} 
                  className="gallery-item"
                  onClick={() => openImageViewer(index)}
                >
                  <img 
                    src={getImageUrl(image.img_url)} 
                    alt={image.img_name || `Document ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="gallery-item-overlay">
                    <span>{image.img_name || 'Document'}</span>
                    <ExternalLink size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Images Message */}
        {images.length === 0 && (
          <div className="no-images">
            <Image size={48} />
            <p>No documents or certificates uploaded</p>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="image-viewer-overlay" onClick={closeImageViewer}>
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="viewer-close" onClick={closeImageViewer}>
              <X size={24} />
            </button>
            
            <div className="image-viewer-header">
              <h3>{selectedImage.img_name || 'Document'}</h3>
            </div>
            
            <div className="image-viewer-body">
              <img 
                src={getImageUrl(selectedImage.img_url)} 
                alt={selectedImage.img_name}
              />
            </div>
            
            <div className="image-viewer-footer">
              <div className="viewer-nav">
                <button 
                  onClick={prevImage} 
                  disabled={currentImageIndex === 0}
                  className="nav-btn"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <span className="image-counter">
                  {currentImageIndex + 1} / {images.length}
                </span>
                <button 
                  onClick={nextImage} 
                  disabled={currentImageIndex === images.length - 1}
                  className="nav-btn"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
              <a 
                href={getImageUrl(selectedImage.img_url)} 
                download
                className="download-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={18} />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;