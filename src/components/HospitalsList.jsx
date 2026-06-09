// components/HospitalsList.jsx - Updated with only approved hospitals
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Bed, Users, Search, Building, ChevronRight } from 'lucide-react';
import apiService from '../services/api';
import '../styles/HospitalList.css'

const HospitalsList = ({ onViewDetails, onBookAppointment }) => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [hospitalTypes, setHospitalTypes] = useState([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllHospitals();
      
      // Handle different response structures and filter only approved hospitals
      let hospitalsArray = [];
      if (response && Array.isArray(response)) {
        hospitalsArray = response.filter(h => h.status === 'approved');
      } else if (response && response.data && Array.isArray(response.data)) {
        hospitalsArray = response.data.filter(h => h.status === 'approved');
      } else if (response && response.hospitals && Array.isArray(response.hospitals)) {
        hospitalsArray = response.hospitals.filter(h => h.status === 'approved');
      } else {
        hospitalsArray = [];
      }
      
      setHospitals(hospitalsArray);
      setFilteredHospitals(hospitalsArray);
      
      // Extract unique cities and types for filters
      const uniqueCities = [...new Set(hospitalsArray.map(h => {
        return h.city?.cityName || 'Unknown';
      }))];
      
      const uniqueTypes = [...new Set(hospitalsArray.map(h => {
        if (h.hospital_type) {
          return h.hospital_type.charAt(0).toUpperCase() + h.hospital_type.slice(1);
        }
        return 'General';
      }))];
      
      setCities(uniqueCities.filter(city => city !== 'Unknown'));
      setHospitalTypes(uniqueTypes);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load hospitals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let results = [...hospitals];
    
    if (searchTerm) {
      results = results.filter(hospital => 
        (hospital.hospital_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (hospital.hospital_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (hospital.city?.cityName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (hospital.departments?.some(dept => dept.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    if (selectedType) {
      results = results.filter(hospital => 
        (hospital.hospital_type?.charAt(0).toUpperCase() + hospital.hospital_type?.slice(1)) === selectedType
      );
    }
    
    if (selectedCity) {
      results = results.filter(hospital => 
        hospital.city?.cityName === selectedCity
      );
    }
    
    setFilteredHospitals(results);
  }, [searchTerm, selectedType, selectedCity, hospitals]);

  const getHospitalImage = (hospital) => {
    const images = ['🏥', '🏨', '🏛️'];
    const id = hospital._id?.$oid || hospital._id || '';
    const index = id.length ? id.charCodeAt(0) % images.length : 0;
    return images[index];
  };

  const getRating = (hospital) => {
    const baseRating = 4.2;
    const doctorFactor = (hospital.total_doctors || 0) / 100;
    return (baseRating + doctorFactor).toFixed(1);
  };

  const getReviewCount = (hospital) => {
    return ((hospital.total_doctors || 0) * 50 + Math.floor(Math.random() * 1000));
  };

  const handleBookAppointment = (hospital) => {
    // Pass hospital data to booking modal with source type 'hospital'
    onBookAppointment?.(hospital, 'hospital');
  };

  if (loading) {
    return (
      <section id="hospitals" className="hospitals-section">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading hospitals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="hospitals" className="hospitals-section">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchHospitals} className="retry-btn">Retry</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hospitals" className="hospitals-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Top Hospitals</span>
          <h2 className="section-title">Leading Healthcare Providers</h2>
          <p className="section-subtitle">
            Choose from India's most trusted and top-rated hospitals
          </p>
        </div>

        <div className="hospital-filters">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search hospitals by name, specialty, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <Building size={18} />
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              {hospitalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <MapPin size={18} />
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="filter-select"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats-summary">
          <div className="stat-badge">
            <Building size={16} />
            <span>{filteredHospitals.length} Hospitals Found</span>
          </div>
        </div>

        <div className="hospitals-grid">
          {filteredHospitals.map((hospital) => (
            <div key={hospital._id?.$oid || hospital._id} className="hospital-card">
              <div className="hospital-card-header">
                <div className="hospital-avatar">{getHospitalImage(hospital)}</div>
                <div className="hospital-rating-badge">
                  <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                  <span>{getRating(hospital)}</span>
                  <span className="reviews-count">({getReviewCount(hospital).toLocaleString()}+)</span>
                </div>
              </div>
              <h3 className="hospital-name">{hospital.hospital_name}</h3>
              <p className="hospital-specialty">{hospital.hospital_type?.charAt(0).toUpperCase() + hospital.hospital_type?.slice(1)} Hospital</p>
              <div className="hospital-details">
                <div className="hospital-detail">
                  <MapPin size={14} />
                  <span>{hospital.city?.cityName || 'Location N/A'}</span>
                </div>
                <div className="hospital-detail">
                  <Bed size={14} />
                  <span>{hospital.total_beds || 0} Beds</span>
                </div>
                <div className="hospital-detail">
                  <Users size={14} />
                  <span>{hospital.total_doctors || 0} Doctors</span>
                </div>
                <div className="hospital-detail">
                  <Clock size={14} />
                  <span>{hospital.emergency_service ? '24/7 Emergency' : 'Regular Hours'}</span>
                </div>
              </div>
              <div className="hospital-departments-preview">
                {(hospital.departments || []).slice(0, 3).map((dept, idx) => (
                  <span key={idx} className="dept-tag">{dept}</span>
                ))}
                {(hospital.departments?.length || 0) > 3 && (
                  <span className="dept-tag more">+{hospital.departments.length - 3}</span>
                )}
              </div>
              <div className="hospital-actions">
                <button 
                  className="hospital-view-btn"
                  onClick={() => onViewDetails?.(hospital)}
                >
                  View Details
                </button>
                <button 
                  className="hospital-book-btn"
                  onClick={() => handleBookAppointment(hospital)}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="no-results">
            <p>No hospitals found matching your criteria.</p>
            <button onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedCity('');
            }} className="clear-filters-btn">Clear Filters</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HospitalsList;