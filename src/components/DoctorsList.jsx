// components/DoctorsList.jsx - Updated
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Award, Search, Stethoscope, Building, GraduationCap, ChevronRight } from 'lucide-react';
import apiService from '../services/api';

const DoctorsList = ({ onViewDetails, onBookAppointment }) => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');

  const experienceLevels = ['All', '0-5 Years', '5-10 Years', '10-15 Years', '15+ Years'];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch doctors and departments in parallel
      const [doctorsRes, departmentsRes, hospitalsRes] = await Promise.all([
        apiService.getAllDoctors(),
        apiService.getAllSubDepartments(),
        apiService.getAllHospitals()
      ]);
      
      // Handle doctors data
      let doctorsData = [];
      if (doctorsRes && Array.isArray(doctorsRes)) {
        doctorsData = doctorsRes;
      } else if (doctorsRes && doctorsRes.data && Array.isArray(doctorsRes.data)) {
        doctorsData = doctorsRes.data;
      } else if (doctorsRes && doctorsRes.doctors && Array.isArray(doctorsRes.doctors)) {
        doctorsData = doctorsRes.doctors;
      } else {
        doctorsData = [];
      }
      
      // Handle departments data
      let departmentsData = [];
      if (departmentsRes && Array.isArray(departmentsRes)) {
        departmentsData = departmentsRes;
      } else if (departmentsRes && departmentsRes.data && Array.isArray(departmentsRes.data)) {
        departmentsData = departmentsRes.data;
      } else if (departmentsRes && departmentsRes.departments && Array.isArray(departmentsRes.departments)) {
        departmentsData = departmentsRes.departments;
      } else {
        departmentsData = [];
      }
      
      // Handle hospitals data
      let hospitalsData = [];
      if (hospitalsRes && Array.isArray(hospitalsRes)) {
        hospitalsData = hospitalsRes;
      } else if (hospitalsRes && hospitalsRes.data && Array.isArray(hospitalsRes.data)) {
        hospitalsData = hospitalsRes.data;
      } else if (hospitalsRes && hospitalsRes.hospitals && Array.isArray(hospitalsRes.hospitals)) {
        hospitalsData = hospitalsRes.hospitals;
      } else {
        hospitalsData = [];
      }
      
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
      setDepartments(departmentsData);
      setHospitals(hospitalsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let results = [...doctors];
    
    if (searchTerm) {
      results = results.filter(doctor => 
        (doctor.doctor_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (doctor.qualification?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (doctor.degree?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (doctor.sub_department?.sub_departmentName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment) {
      results = results.filter(doctor => 
        doctor.sub_department?._id?.$oid === selectedDepartment ||
        doctor.sub_department === selectedDepartment
      );
    }
    
    if (selectedHospital) {
      results = results.filter(doctor => 
        doctor.hospital?._id?.$oid === selectedHospital ||
        doctor.hospital === selectedHospital
      );
    }
    
    if (selectedExperience && selectedExperience !== 'All') {
      const [min, max] = selectedExperience.split('-');
      if (max) {
        results = results.filter(doctor => 
          doctor.experience >= parseInt(min) && doctor.experience <= parseInt(max)
        );
      } else if (selectedExperience === '15+ Years') {
        results = results.filter(doctor => doctor.experience >= 15);
      }
    }
    
    setFilteredDoctors(results);
  }, [searchTerm, selectedDepartment, selectedHospital, selectedExperience, doctors]);

  const getDoctorImage = (doctor) => {
    return doctor.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️';
  };

  const getRating = (doctor) => {
    return (4.0 + (doctor.experience % 10) / 10).toFixed(1);
  };

  const getReviewCount = (doctor) => {
    return (doctor.experience * 100 + Math.floor(Math.random() * 200));
  };

  const getDepartmentName = (doctor) => {
    if (doctor.sub_department?.sub_departmentName) {
      return doctor.sub_department.sub_departmentName;
    }
    if (typeof doctor.sub_department === 'object' && doctor.sub_department.name) {
      return doctor.sub_department.name;
    }
    return 'General Medicine';
  };

  const getHospitalName = (doctor) => {
    if (doctor.hospital?.hospital_name) {
      return doctor.hospital.hospital_name;
    }
    if (typeof doctor.hospital === 'object' && doctor.hospital.name) {
      return doctor.hospital.name;
    }
    return 'Hospital';
  };

  const getHospitalLocation = (doctor) => {
    if (doctor.hospital?.city?.cityName) {
      return doctor.hospital.city.cityName;
    }
    if (doctor.hospital?.city) {
      return doctor.hospital.city;
    }
    return 'Location N/A';
  };

  if (loading) {
    return (
      <section id="doctors" className="doctors-section">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading doctors...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="doctors" className="doctors-section">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchAllData} className="retry-btn">Retry</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="doctors" className="doctors-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Expert Doctors</span>
          <h2 className="section-title">Meet Our Top Specialists</h2>
          <p className="section-subtitle">
            Consult with India's best doctors across all specialties
          </p>
        </div>

        <div className="doctor-filters">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search doctors by name, qualification, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <Stethoscope size={18} />
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id?.$oid || dept._id} value={dept._id?.$oid || dept._id}>
                  {dept.sub_departmentName || dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <Building size={18} />
            <select 
              value={selectedHospital} 
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="filter-select"
            >
              <option value="">All Hospitals</option>
              {hospitals.map(hospital => (
                <option key={hospital._id?.$oid || hospital._id} value={hospital._id?.$oid || hospital._id}>
                  {hospital.hospital_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <Award size={18} />
            <select 
              value={selectedExperience} 
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="filter-select"
            >
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats-summary">
          <div className="stat-badge">
            <Stethoscope size={16} />
            <span>{filteredDoctors.length} Doctors Found</span>
          </div>
        </div>

        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id?.$oid || doctor._id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar">{getDoctorImage(doctor)}</div>
                <div className="doctor-rating-badge">
                  <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                  <span>{getRating(doctor)}</span>
                  <span className="reviews-count">({getReviewCount(doctor).toLocaleString()}+)</span>
                </div>
              </div>
              <h3 className="doctor-name">{doctor.doctor_name}</h3>
              <p className="doctor-specialty">{getDepartmentName(doctor)}</p>
              <p className="doctor-hospital">{getHospitalName(doctor)}</p>
              <div className="doctor-details">
                <div className="doctor-detail">
                  <GraduationCap size={14} />
                  <span>{doctor.qualification}, {doctor.degree}</span>
                </div>
                <div className="doctor-detail">
                  <Award size={14} />
                  <span>{doctor.experience}+ years experience</span>
                </div>
                <div className="doctor-detail">
                  <MapPin size={14} />
                  <span>{getHospitalLocation(doctor)}</span>
                </div>
              </div>
              <div className="doctor-fees">
                <div className="fee-item">
                  <span className="fee-label">Consultation Fee:</span>
                  <span className="fee-amount">₹{doctor.consultation_fee || 500}</span>
                </div>
              </div>
              <div className="doctor-actions">
                <button 
                  className="doctor-view-btn"
                  onClick={() => onViewDetails?.(doctor)}
                >
                  View Details
                </button>
                <button 
                  className="doctor-book-btn"
                  onClick={() => onBookAppointment?.(doctor)}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="no-results">
            <p>No doctors found matching your criteria.</p>
            <button onClick={() => {
              setSearchTerm('');
              setSelectedDepartment('');
              setSelectedHospital('');
              setSelectedExperience('');
            }} className="clear-filters-btn">Clear Filters</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorsList;