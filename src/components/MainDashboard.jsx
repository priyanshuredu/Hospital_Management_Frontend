import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hospital, 
  Users, 
  Activity, 
  Calendar, 
  Bed, 
  Stethoscope,
  Ambulance,
  Microscope,
  Heart,
  TrendingUp,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import '../styles/MainDashboard.css';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Check if user is already logged in
    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/super-admin');
        } else if (role === 'user') {
          navigate('/user');
        }
      }, 2000);
    }
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/hospital-registeration');
  };

  const features = [
    {
      icon: <Hospital size={32} />,
      title: 'Hospital Management',
      description: 'Centralized management of all hospitals with real-time status tracking and approvals.'
    },
    {
      icon: <Users size={32} />,
      title: 'Doctor Directory',
      description: 'Comprehensive database of doctors across all specialties and hospitals.'
    },
    {
      icon: <Activity size={32} />,
      title: 'Patient Records',
      description: 'Secure and organized electronic health records (EHR) management system.'
    },
    {
      icon: <Calendar size={32} />,
      title: 'Appointment Scheduling',
      description: 'Smart scheduling system for patient appointments and doctor availability.'
    },
    {
      icon: <Bed size={32} />,
      title: 'Bed Management',
      description: 'Real-time bed availability tracking across all hospital departments.'
    },
    {
      icon: <Stethoscope size={32} />,
      title: 'Emergency Services',
      description: '24/7 emergency response coordination and ambulance tracking.'
    },
    {
      icon: <Microscope size={32} />,
      title: 'Lab Management',
      description: 'Integrated laboratory test tracking and result management.'
    },
    {
      icon: <Heart size={32} />,
      title: 'Pharmacy Integration',
      description: 'Connected pharmacy system for prescriptions and inventory management.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Hospitals', icon: Hospital, color: '#3b82f6' },
    { value: '10K+', label: 'Doctors', icon: Users, color: '#10b981' },
    { value: '50K+', label: 'Patients', icon: Activity, color: '#f59e0b' },
    { value: '98%', label: 'Satisfaction', icon: Heart, color: '#ef4444' }
  ];

  const recentActivities = [
    {
      id: 1,
      hospital: 'City Hospital',
      action: 'New registration request',
      status: 'pending',
      time: '5 minutes ago',
      icon: Hospital
    },
    {
      id: 2,
      hospital: 'Apollo Medical Center',
      action: 'Emergency bed request',
      status: 'urgent',
      time: '15 minutes ago',
      icon: Bed
    },
    {
      id: 3,
      hospital: 'Care Hospital',
      action: 'Ambulance dispatched',
      status: 'in-progress',
      time: '1 hour ago',
      icon: Ambulance
    },
    {
      id: 4,
      hospital: 'Children\'s Hospital',
      action: 'New department added',
      status: 'completed',
      time: '2 hours ago',
      icon: Activity
    }
  ];

  const topHospitals = [
    { name: 'Apollo Hospitals', beds: 450, doctors: 320, rating: 4.8 },
    { name: 'Fortis Healthcare', beds: 380, doctors: 280, rating: 4.7 },
    { name: 'AIIMS Delhi', beds: 2200, doctors: 850, rating: 4.9 },
    { name: 'Max Healthcare', beds: 420, doctors: 350, rating: 4.6 }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return 'status-pending';
      case 'urgent':
        return 'status-urgent';
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="main-dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className={`hero-text ${isVisible ? 'fade-in-up' : ''}`}>
            <span className="hero-badge">
              🏥 Complete Hospital Management Solution
            </span>
            <h1 className="hero-title">
              Transform Healthcare Management with
              <span className="gradient-text"> SmarTech Hospital Portal</span>
            </h1>
            <p className="hero-description">
              Centralized platform for managing hospitals, doctors, patients, and appointments. 
              Streamline operations, enhance patient care, and improve healthcare delivery.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary-hero" onClick={() => navigate('/login')}>
                Get Started
                <ChevronRight size={18} />
              </button>
              <button className="btn-secondary-hero" onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More
              </button>
            </div>
          </div>
          
          <div className={`hero-stats ${isVisible ? 'fade-in-up-delay' : ''}`}>
            {stats.map((stat, index) => (
              <div key={index} className="stat-card-hero">
                <div className="stat-icon-hero" style={{ background: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <div className="stat-value-hero">{stat.value}</div>
                  <div className="stat-label-hero">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Key Features</span>
            <h2 className="section-title">Everything You Need for Modern Healthcare</h2>
            <p className="section-subtitle">
              Comprehensive features to manage all aspects of hospital operations efficiently.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activities & Top Hospitals Section */}
      <section className="activities-section">
        <div className="container">
          <div className="activities-grid">
            {/* Recent Activities */}
            <div className="recent-activities">
              <div className="section-header small">
                <h3 className="section-title-small">Recent Activities</h3>
                <p className="section-subtitle-small">Latest updates from hospitals</p>
              </div>
              <div className="activities-list">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        <IconComponent size={20} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-header">
                          <span className="activity-hospital">{activity.hospital}</span>
                          <span className={`activity-status ${getStatusBadge(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="activity-action">{activity.action}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Hospitals */}
            <div className="top-hospitals">
              <div className="section-header small">
                <h3 className="section-title-small">Top Rated Hospitals</h3>
                <p className="section-subtitle-small">Best performing healthcare centers</p>
              </div>
              <div className="hospitals-list">
                {topHospitals.map((hospital, index) => (
                  <div key={index} className="hospital-item">
                    <div className="hospital-rank">{index + 1}</div>
                    <div className="hospital-info">
                      <div className="hospital-name">{hospital.name}</div>
                      <div className="hospital-stats">
                        <span>
                          <Users size={12} />
                          {hospital.doctors} Doctors
                        </span>
                        <span>
                          <Bed size={12} />
                          {hospital.beds} Beds
                        </span>
                      </div>
                    </div>
                    <div className="hospital-rating">
                      <span className="rating-star">⭐</span>
                      <span>{hospital.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">How Hospital Management Works</h2>
            <p className="section-subtitle">
              Easy steps to start managing your healthcare facility
            </p>
          </div>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">🏥</div>
              <h3 className="step-title">Register Hospital</h3>
              <p className="step-description">Add hospital details and get verified</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">👨‍⚕️</div>
              <h3 className="step-title">Add Staff</h3>
              <p className="step-description">Register doctors, nurses, and support staff</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">📋</div>
              <h3 className="step-title">Manage Patients</h3>
              <p className="step-description">Schedule appointments and track records</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-icon">📊</div>
              <h3 className="step-title">Monitor Analytics</h3>
              <p className="step-description">Track performance and generate reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Hospital Management?</h2>
          <p className="cta-description">
            Join hundreds of hospitals already using SmarTech to improve patient care and operational efficiency.
          </p>
          <button className="btn-cta" onClick={handleGetStarted}>
            Start Free Trial
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Hospital size={24} />
              <span>SmarTech Hospital</span>
            </div>
            <p className="footer-description">
              Intelligent hospital management solution for modern healthcare facilities.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <Phone size={14} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <Mail size={14} />
                <span>support@smartechnospital.com</span>
              </div>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Demo</a>
              <a href="#">Integrations</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="#">Help Center</a>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Status</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
              <a href="#">Compliance</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SmarTech Hospital Management System. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainDashboard;