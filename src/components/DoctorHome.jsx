import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Stethoscope, Activity, TrendingUp, ChevronRight, DollarSign, User, Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';
import '../styles/DoctorHome.css';

const API_URL = 'http://localhost:5000';

const DoctorHome = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    upcomingAppointments: 0
  });

  const token = sessionStorage.getItem('Token');

  useEffect(() => {
    fetchAllDoctorData();
  }, []);

  const fetchAllDoctorData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, todayRes, upcomingRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/appointment/doctor/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/appointment/doctor/today`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/appointment/doctor/upcoming?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/appointment/doctor/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (statsRes.data.success) {
        console.log("first",statsRes.data.stats)
        setStats(statsRes.data.stats);
      }

      if (todayRes.data.success) {
        setTodayAppointments(todayRes.data.appointments);
      }

      if (upcomingRes.data.success) {
        setUpcomingAppointments(upcomingRes.data.appointments);
      }

      if (profileRes.data.success) {
        setDoctorProfile(profileRes.data.doctor);
        // Update sessionStorage with profile image if available
        if (profileRes.data.doctor.profile_image) {
          sessionStorage.setItem('ProfileImage', profileRes.data.doctor.profile_image);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
    }
  };

  const formatTime = (timeSlot) => {
    if (!timeSlot) return 'N/A';
    // Assuming timeSlot is in format like "09:00-10:00"
    return timeSlot.split('-')[0];
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const getStatusText = (attended) => {
    if (attended === true) return 'Completed';
    if (attended === false) return 'Pending';
    return 'Scheduled';
  };

  if (loading) {
    return (
      <div className="doctor-home-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-home-container">
      {/* Header */}
      <div className="doctor-home-header">
        <div>
          <h1>Welcome back, {doctorProfile?.username || 'Doctor'}!</h1>
          <p>Here's what's happening with your practice today</p>
        </div>
        <div className="current-date">
          <Calendar size={20} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Doctor Profile Summary */}
      {doctorProfile && (
        <div className="doctor-profile-summary">
          <div className="profile-avatar">
            {doctorProfile.profile_image ? (
              <img className='profile-avatar-img' src={doctorProfile.profile_image} alt={doctorProfile.name} />
            ) : (
              <User size={40} />
            )}
          </div>
          <div className="profile-info">
            <h3>{doctorProfile.name}</h3>
            <p>{doctorProfile.qualification} • {doctorProfile.experience} years experience</p>
            <div className="profile-details">
              <span><Stethoscope size={14} /> {doctorProfile.sub_department?.sub_departmentName || 'General'}</span>
              <span><DollarSign size={14} /> ${doctorProfile.consultation_fee}/consultation</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon patients">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
            <span className="stat-trend"><TrendingUp size={14} /> All time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
            <span className="stat-trend">{todayAppointments.filter(a => a.appointmentAttended).length} completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.completedAppointments}</h3>
            <p>Total Consultations</p>
            <span className="stat-trend">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>${stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <span className="stat-trend">From consultations</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="schedule-section">
        <div className="section-header">
          <h2>
            <Clock size={20} />
            Today's Schedule
          </h2>
          <button className="view-all-btn">
            View Full Schedule <ChevronRight size={16} />
          </button>
        </div>

        <div className="appointments-list">
          {todayAppointments.length > 0 ? (
            todayAppointments.map(apt => (
              <div key={apt._id} className="appointment-card">
                <div className="appointment-time">
                  <Clock size={16} />
                  <span>{formatTime(apt.timeSlot)}</span>
                </div>
                <div className="appointment-info">
                  <h4>{apt.patientName}</h4>
                  <p>Age: {apt.patientAge} • {apt.patientGender}</p>
                  <small>{apt.patientPhone}</small>
                </div>
                <div className="appointment-status">
                  <span className={`status-badge ${apt.appointmentAttended ? 'status-completed' : 'status-pending'}`}>
                    {getStatusText(apt.appointmentAttended)}
                  </span>
                </div>
                <button className="action-btn">
                  {apt.appointmentAttended ? 'View Details' : 'Start Consultation'}
                </button>
              </div>
            ))
          ) : (
            <div className="no-appointments">
              <p>No appointments scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="upcoming-section">
        <div className="section-header">
          <h2>
            <Calendar size={20} />
            Upcoming Appointments
          </h2>
        </div>

        <div className="upcoming-list">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(apt => (
              <div key={apt._id} className="upcoming-card">
                <div className="upcoming-date">
                  <span className="date-day">{new Date(apt.appointmentDate).getDate()}</span>
                  <span className="date-month">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="upcoming-details">
                  <h4>{apt.patientName}</h4>
                  <p>{formatTime(apt.timeSlot)} • Age: {apt.patientAge}</p>
                </div>
                <ChevronRight size={20} className="arrow-icon" />
              </div>
            ))
          ) : (
            <div className="no-appointments">
              <p>No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;