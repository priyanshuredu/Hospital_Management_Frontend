// components/HospitalDetailsModal.jsx - Update to use getHospitalById if needed
import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Phone, Mail, Clock, CheckCircle, Bed, Users, Stethoscope, Ambulance, Coffee, Shield, Award, Calendar, Building, Heart } from 'lucide-react';
import apiService from '../services/api';

const HospitalDetailsModal = ({ hospital, onClose, onBookAppointment }) => {
  const [fullHospitalData, setFullHospitalData] = useState(hospital);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we only have hospital ID, fetch full details
    if (hospital && hospital._id && !hospital.hospital_name) {
      fetchHospitalDetails(hospital._id);
    }
  }, [hospital]);

  const fetchHospitalDetails = async (id) => {
    try {
      setLoading(true);
      const hospitalId = id?.$oid || id;
      const response = await apiService.getHospitalById(hospitalId);
      
      let hospitalData = response;
      if (response && response.data) {
        hospitalData = response.data;
      }
      
      setFullHospitalData(hospitalData);
    } catch (error) {
      console.error('Error fetching hospital details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!fullHospitalData) return null;

  const data = fullHospitalData;
  
  const getHospitalImage = () => {
    const images = ['🏥', '🏨', '🏛️'];
    const id = data._id?.$oid || data._id || '';
    const index = id.length ? id.charCodeAt(0) % images.length : 0;
    return images[index];
  };

  const getRating = () => {
    return (4.2 + (data.total_doctors % 8) / 10).toFixed(1);
  };

  const amenities = [
    { icon: <Ambulance size={18} />, label: 'Ambulance Service', available: data.ambulance_service },
    { icon: <Shield size={18} />, label: 'Emergency Service', available: data.emergency_service },
    { icon: <Bed size={18} />, label: 'ICU Facility', available: data.icu_beds > 0 },
    { icon: <Bed size={18} />, label: 'Parking Available', available: true },
    { icon: <Coffee size={18} />, label: 'Cafeteria', available: true },
    { icon: <Users size={18} />, label: 'Wheelchair Access', available: true },
  ];

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content">
          <div className="loading-spinner">Loading hospital details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hospital-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="hospital-modal-avatar">{getHospitalImage()}</div>
          <div className="hospital-modal-info">
            <h2>{data.hospital_name}</h2>
            <div className="hospital-rating">
              <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
              <span>{getRating()}</span>
              <span className="reviews">({Math.floor(data.total_doctors * 50)} reviews)</span>
            </div>
            <div className="hospital-location">
              <MapPin size={16} />
              <span>{data.hospital_address}, {data.city?.name || data.city}</span>
            </div>
            <div className="hospital-registration">
              <Building size={16} />
              <span>Reg. No: {data.registration_no}</span>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="hospital-quick-stats">
            <div className="stat-item">
              <Bed size={20} />
              <div>
                <div className="stat-value">{data.total_beds}+</div>
                <div className="stat-label">Total Beds</div>
              </div>
            </div>
            <div className="stat-item">
              <Heart size={20} />
              <div>
                <div className="stat-value">{data.icu_beds}</div>
                <div className="stat-label">ICU Beds</div>
              </div>
            </div>
            <div className="stat-item">
              <Stethoscope size={20} />
              <div>
                <div className="stat-value">{data.total_doctors}+</div>
                <div className="stat-label">Doctors</div>
              </div>
            </div>
            <div className="stat-item">
              <Clock size={20} />
              <div>
                <div className="stat-value">{data.established_year || 'N/A'}</div>
                <div className="stat-label">Established</div>
              </div>
            </div>
          </div>

          {data.hospital_description && (
            <div className="hospital-description">
              <h3>About {data.hospital_name}</h3>
              <p>{data.hospital_description}</p>
            </div>
          )}

          <div className="hospital-amenities">
            <h3>Facilities & Amenities</h3>
            <div className="amenities-grid">
              {amenities.map((item, index) => (
                <div key={index} className="amenity-item">
                  {item.available ? (
                    <CheckCircle size={18} color="#10b981" />
                  ) : (
                    <X size={18} color="#ef4444" />
                  )}
                  <span className={!item.available ? 'unavailable' : ''}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hospital-departments">
            <h3>Departments</h3>
            <div className="departments-list">
              {(data.departments || []).map((dept, index) => (
                <span key={index} className="department-tag">{dept}</span>
              ))}
            </div>
          </div>

          <div className="hospital-contact">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={16} />
                <span>{data.primary_phone || 'N/A'}</span>
              </div>
              {data.secondary_phone && (
                <div className="contact-item">
                  <Phone size={16} />
                  <span>{data.secondary_phone}</span>
                </div>
              )}
              <div className="contact-item">
                <Mail size={16} />
                <span>{data.email || 'N/A'}</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>{data.hospital_address}, {data.city?.name || data.city}, {data.state?.name || data.state}, {data.country}</span>
              </div>
            </div>
          </div>

          <div className="hospital-management">
            <h3>Management</h3>
            <div className="management-info">
              <div className="contact-item">
                <Users size={16} />
                <span>Hospital Manager: {data.hospital_manager || 'N/A'}</span>
              </div>
              <div className="contact-item">
                <Shield size={16} />
                <span>Status: <span className={`status-${data.status}`}>{data.status}</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-book-btn" onClick={() => onBookAppointment(data)}>
            Book Appointment
            <Calendar size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailsModal;