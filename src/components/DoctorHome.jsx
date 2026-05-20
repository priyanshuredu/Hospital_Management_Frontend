import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Stethoscope, Activity, TrendingUp, ChevronRight } from 'lucide-react';
import '../styles/DoctorHome.css';

const DoctorHome = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      // Simulate API calls
      const appointmentsData = await fetchAppointments();
      const statsData = await fetchStats();
      
      const now = new Date();
      const today = appointmentsData.filter(apt => 
        new Date(apt.date).toDateString() === now.toDateString()
      );
      const upcoming = appointmentsData.filter(apt => 
        new Date(apt.date) > now
      );

      setTodayAppointments(today);
      setUpcomingAppointments(upcoming);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, patientName: "John Doe", time: "09:00 AM", type: "Checkup", status: "confirmed", date: new Date() },
          { id: 2, patientName: "Jane Smith", time: "10:30 AM", type: "Follow-up", status: "confirmed", date: new Date() },
          { id: 3, patientName: "Mike Johnson", time: "02:00 PM", type: "Consultation", status: "pending", date: new Date() },
          { id: 4, patientName: "Sarah Williams", time: "03:30 PM", type: "Emergency", status: "confirmed", date: new Date(Date.now() + 86400000) },
          { id: 5, patientName: "Robert Brown", time: "11:00 AM", type: "Checkup", status: "confirmed", date: new Date(Date.now() + 172800000) }
        ]);
      }, 500);
    });
  };

  const fetchStats = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalPatients: 245,
          todayAppointments: 8,
          completedAppointments: 1245,
          revenue: 28450
        });
      }, 300);
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="doctor-home-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="doctor-home-container">
      {/* Header */}
      <div className="doctor-home-header">
        <div>
          <h1>Welcome back, Dr. Sarah!</h1>
          <p>Here's what's happening with your practice today</p>
        </div>
        <div className="current-date">
          <Calendar size={20} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon patients">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
            <span className="stat-trend"><TrendingUp size={14} /> +12% this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
            <span className="stat-trend">{todayAppointments.filter(a => a.status === 'confirmed').length} confirmed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.completedAppointments}</h3>
            <p>Total Consultations</p>
            <span className="stat-trend">Lifetime</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSignIcon size={24} />
          </div>
          <div className="stat-info">
            <h3>${stats.revenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <span className="stat-trend">This year</span>
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
              <div key={apt.id} className="appointment-card">
                <div className="appointment-time">
                  <Clock size={16} />
                  <span>{apt.time}</span>
                </div>
                <div className="appointment-info">
                  <h4>{apt.patientName}</h4>
                  <p>{apt.type}</p>
                </div>
                <div className="appointment-status">
                  <span className={`status-badge ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
                <button className="action-btn">Start Consultation</button>
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
          {upcomingAppointments.slice(0, 3).map(apt => (
            <div key={apt.id} className="upcoming-card">
              <div className="upcoming-date">
                <span className="date-day">{new Date(apt.date).getDate()}</span>
                <span className="date-month">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="upcoming-details">
                <h4>{apt.patientName}</h4>
                <p>{apt.type} • {apt.time}</p>
              </div>
              <ChevronRight size={20} className="arrow-icon" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper component for DollarSign icon
const DollarSignIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

export default DoctorHome;