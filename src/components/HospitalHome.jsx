import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { 
  Activity, 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Bell, 
  Stethoscope,
  DollarSign,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  UserPlus,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import '../styles/HospitalHome.css';

const HospitalHome = () => {
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { 
      title: 'Total Doctors', 
      value: '45', 
      change: '+8%', 
      icon: Stethoscope, 
      color: '#4a9eff',
      trend: 'up'
    },
    { 
      title: 'Total Patients', 
      value: '1,234', 
      change: '+12%', 
      icon: Users, 
      color: '#ff9800',
      trend: 'up'
    },
    { 
      title: 'Total Hospitals', 
      value: '12', 
      change: '+0%', 
      icon: Building2, 
      color: '#4caf50',
      trend: 'neutral'
    },
    { 
      title: 'Today\'s Appointments', 
      value: '28', 
      change: '+5%', 
      icon: Calendar, 
      color: '#f44336',
      trend: 'up'
    },
    { 
      title: 'Revenue (Monthly)', 
      value: '$45.2K', 
      change: '+15%', 
      icon: DollarSign, 
      color: '#9c27b0',
      trend: 'up'
    },
    { 
      title: 'Avg. Consultation Fee', 
      value: '$85', 
      change: '+2%', 
      icon: Activity, 
      color: '#00bcd4',
      trend: 'up'
    }
  ];

  const recentDoctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', patients: 128, rating: 4.8, status: 'active' },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Neurologist', patients: 95, rating: 4.9, status: 'active' },
    { id: 3, name: 'Dr. Emily Rodriguez', specialty: 'Pediatrician', patients: 156, rating: 4.7, status: 'active' },
    { id: 4, name: 'Dr. James Wilson', specialty: 'Dermatologist', patients: 87, rating: 4.6, status: 'inactive' },
  ];

  const upcomingAppointments = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Johnson', time: '09:00 AM', type: 'Checkup' },
    { id: 2, patient: 'Mary Davis', doctor: 'Dr. Michael Chen', time: '10:30 AM', type: 'Consultation' },
    { id: 3, patient: 'Robert Brown', doctor: 'Dr. Emily Rodriguez', time: '02:00 PM', type: 'Follow-up' },
    { id: 4, patient: 'Lisa Anderson', doctor: 'Dr. James Wilson', time: '03:30 PM', type: 'Emergency' },
  ];

  const recentActivities = [
    { id: 1, action: 'New doctor added', detail: 'Dr. Sarah Johnson - Cardiology', time: '2 hours ago', icon: UserPlus },
    { id: 2, action: 'Appointment completed', detail: 'John Smith with Dr. Chen', time: '3 hours ago', icon: CheckCircle },
    { id: 3, action: 'Appointment cancelled', detail: 'Mary Davis - Rescheduled', time: '5 hours ago', icon: XCircle },
    { id: 4, action: 'Report generated', detail: 'Monthly revenue report', time: '1 day ago', icon: FileText },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`home-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Welcome Header */}
      <div className="home-header">
        <div className="header-left">
          <h1>Welcome back, Dr. Admin</h1>
          <p className="header-subtitle">Here's what's happening with your healthcare facility today</p>
        </div>
        <div className="header-right">
          <div className="datetime-card">
            <div className="date">{formatDate(currentTime)}</div>
            <div className="time">{formatTime(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn">
          <UserPlus size={18} />
          <span>Add New Doctor</span>
        </button>
        <button className="action-btn">
          <Calendar size={18} />
          <span>Schedule Appointment</span>
        </button>
        <button className="action-btn">
          <FileText size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              {stat.trend && (
                <div className={`stat-trend ${stat.trend}`}>
                  {stat.trend === 'up' && <ArrowUp size={14} />}
                  {stat.trend === 'down' && <ArrowDown size={14} />}
                  {stat.change}
                </div>
              )}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Doctors */}
        <div className="recent-doctors">
          <div className="section-header">
            <h2>
              <Stethoscope size={20} />
              Recent Doctors
            </h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="doctors-list">
            {recentDoctors.map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-info">
                  <div className="doctor-avatar">
                    <Stethoscope size={24} />
                  </div>
                  <div className="doctor-details">
                    <h4>{doctor.name}</h4>
                    <p>{doctor.specialty}</p>
                    <div className="doctor-stats">
                      <span><Users size={12} /> {doctor.patients} patients</span>
                      <span><Star size={12} /> {doctor.rating}</span>
                    </div>
                  </div>
                </div>
                <div className={`doctor-status ${doctor.status}`}>
                  {doctor.status === 'active' ? 'Active' : 'Inactive'}
                </div>
                <button className="more-btn">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="upcoming-appointments">
          <div className="section-header">
            <h2>
              <Calendar size={20} />
              Today's Appointments
            </h2>
            <button className="view-all-btn">Schedule New</button>
          </div>
          <div className="appointments-list">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-time">
                  <Clock size={14} />
                  <span>{appointment.time}</span>
                </div>
                <div className="appointment-details">
                  <h4>{appointment.patient}</h4>
                  <p>{appointment.doctor}</p>
                  <span className="appointment-type">{appointment.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="recent-activities">
          <div className="section-header">
            <h2>
              <Bell size={20} />
              Recent Activities
            </h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <activity.icon size={16} />
                </div>
                <div className="activity-details">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-detail">{activity.detail}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-metrics">
        <div className="section-header">
          <h2>
            <TrendingUp size={20} />
            Performance Metrics
          </h2>
        </div>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-title">Patient Satisfaction</div>
            <div className="metric-value">94%</div>
            <div className="metric-progress">
              <div className="progress-bar" style={{ width: '94%' }}></div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Doctor Utilization</div>
            <div className="metric-value">87%</div>
            <div className="metric-progress">
              <div className="progress-bar" style={{ width: '87%' }}></div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Appointment Fill Rate</div>
            <div className="metric-value">92%</div>
            <div className="metric-progress">
              <div className="progress-bar" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalHome;