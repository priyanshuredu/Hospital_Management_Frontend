// components/DoctorDetailsModal.jsx - Update to use getDoctorById
import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, CheckCircle, Award, Calendar, Video, MessageCircle, GraduationCap, Building, Mail as MailIcon, Phone as PhoneIcon } from 'lucide-react';
import apiService from '../services/api';

const DoctorDetailsModal = ({ doctor, onClose, onBookAppointment }) => {
  const [fullDoctorData, setFullDoctorData] = useState(doctor);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we only have doctor ID, fetch full details
    if (doctor && doctor._id && !doctor.doctor_name) {
      fetchDoctorDetails(doctor._id);
    }
  }, [doctor]);

  const fetchDoctorDetails = async (id) => {
    try {
      setLoading(true);
      const doctorId = id?.$oid || id;
      const response = await apiService.getDoctorById(doctorId);
      
      let doctorData = response;
      if (response && response.data) {
        doctorData = response.data;
      }
      
      setFullDoctorData(doctorData);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!fullDoctorData) return null;

  const data = fullDoctorData;

  const getDoctorImage = () => {
    return data.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️';
  };

  const getRating = () => {
    return (4.0 + (data.experience % 10) / 10).toFixed(1);
  };

  const getHospitalName = () => {
    if (data.hospital?.hospital_name) return data.hospital.hospital_name;
    if (typeof data.hospital === 'object' && data.hospital.name) return data.hospital.name;
    return 'Hospital';
  };

  const getHospitalLocation = () => {
    if (data.hospital?.city?.cityName) return data.hospital.city.cityName;
    if (data.hospital?.city) return data.hospital.city;
    return 'Location N/A';
  };

  const getDepartmentName = () => {
    if (data.sub_department?.sub_departmentName) return data.sub_department.sub_departmentName;
    if (typeof data.sub_department === 'object' && data.sub_department.name) return data.sub_department.name;
    return 'General Medicine';
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content">
          <div className="loading-spinner">Loading doctor details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content doctor-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="doctor-modal-avatar">{getDoctorImage()}</div>
          <div className="doctor-modal-info">
            <h2>{data.doctor_name}</h2>
            <p className="doctor-specialty-badge">{getDepartmentName()}</p>
            <div className="doctor-rating">
              <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
              <span>{getRating()}</span>
              <span className="reviews">({(data.experience * 100)} reviews)</span>
            </div>
            <div className="doctor-hospital-info">
              <Building size={16} />
              <span>{getHospitalName()}, {getHospitalLocation()}</span>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="doctor-quick-stats">
            <div className="stat-item">
              <Award size={20} />
              <div>
                <div className="stat-value">{data.experience}+</div>
                <div className="stat-label">Years Experience</div>
              </div>
            </div>
            <div className="stat-item">
              <GraduationCap size={20} />
              <div>
                <div className="stat-value">{data.yearOfCompletion || 'N/A'}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-item">
              <Video size={20} />
              <div>
                <div className="stat-value">Available</div>
                <div className="stat-label">Video Consult</div>
              </div>
            </div>
            <div className="stat-item">
              <Clock size={20} />
              <div>
                <div className="stat-value">₹{data.consultation_fee || 500}</div>
                <div className="stat-label">Consultation Fee</div>
              </div>
            </div>
          </div>

          <div className="doctor-about">
            <h3>Professional Information</h3>
            <p><strong>Dr. {data.doctor_name}</strong> is a {getDepartmentName()} specialist with {data.experience} years of experience. 
            {data.gender === 'female' ? 'She' : 'He'} completed {data.degree} from {data.institution} in {data.yearOfCompletion} 
            and holds a {data.qualification} degree.</p>
          </div>

          <div className="doctor-education">
            <h3>Education & Qualifications</h3>
            <ul className="education-list">
              <li>
                <GraduationCap size={16} />
                <span>{data.qualification} - {data.institution}</span>
              </li>
              <li>
                <GraduationCap size={16} />
                <span>{data.degree} - {data.institution}</span>
              </li>
              <li>
                <GraduationCap size={16} />
                <span>Year of Completion: {data.yearOfCompletion}</span>
              </li>
            </ul>
          </div>

          <div className="doctor-contact-info">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <div className="contact-item">
                <PhoneIcon size={16} />
                <span>{data.phone || 'N/A'}</span>
              </div>
              <div className="contact-item">
                <MailIcon size={16} />
                <span>{data.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="doctor-availability-detail">
            <h3>Availability Status</h3>
            <div className="availability-info">
              {data.accountStatus === 'active' ? (
                <>
                  <CheckCircle size={16} color="#10b981" />
                  <span className="status-active">Active - Available for consultations</span>
                </>
              ) : (
                <>
                  <X size={16} color="#ef4444" />
                  <span className="status-inactive">Currently Not Available</span>
                </>
              )}
            </div>
            <div className="working-hours">
              <Clock size={16} />
              <span>Working Hours: Mon - Sat, 9:00 AM - 6:00 PM</span>
            </div>
          </div>

          <div className="doctor-additional-info">
            <h3>Additional Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Gender:</span>
                <span className="info-value">{data.gender || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Age:</span>
                <span className="info-value">{data.age || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Experience:</span>
                <span className="info-value">{data.experience} years</span>
              </div>
              <div className="info-item">
                <span className="info-label">Consultation Fee:</span>
                <span className="info-value">₹{data.consultation_fee || 500}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="modal-book-btn" 
            onClick={() => onBookAppointment(data)}
            disabled={data.accountStatus !== 'active'}
          >
            {data.accountStatus === 'active' ? 'Book Appointment' : 'Not Available'}
            <Calendar size={18} />
          </button>
          <button className="modal-chat-btn">
            <MessageCircle size={18} />
            Chat with Doctor
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsModal;