// MainDashboard.jsx - Updated with proper integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hospital, Users, Activity, Calendar, Bed, Stethoscope,
  Ambulance, Microscope, Heart, TrendingUp, Shield, Clock,
  MapPin, Phone, Mail, ChevronRight, LogIn, UserPlus, Menu, X,
  Star, Award, Globe, CheckCircle, ArrowRight, Video, MessageCircle,
  FileText, CreditCard, Smartphone, Headphones, Search as SearchIcon,
  Lock
} from 'lucide-react';
import HospitalsList from './HospitalsList';
import DoctorsList from './DoctorsList';
import HospitalDetailsModal from './HospitalDetailsModal';
import DoctorDetailsModal from './DoctorDetailsModal';
import BookingModal from './BookingModal';
import '../styles/MainDashboard.css';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSource, setBookingSource] = useState(null);
  const [bookingItem, setBookingItem] = useState(null);
  const [token,setToken] = useState(null);

  useEffect(() => {
    setIsVisible(true);
    
    setToken(sessionStorage.getItem('Token'));
    const role = sessionStorage.getItem('role');
    
    if (token && role) {
      setTimeout(() => {
        if (role === "admin") {
          navigate('/super-admin');
        } else if(role === 'hospital-admin') {
          navigate('/hospital');
        } else if(role === 'lab-assistant') {
          navigate('/lab');
        } else if(role === 'doctor') {
          navigate('/doctor');
        } else if(role === 'user') {
          navigate('/');
        }
      }, 2000);
    }
  }, [navigate]);

  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/hospital-registeration');
  const handleHospitalLogin = () => navigate('/hospital-login');
  const handleUserSignUp = () => navigate('/user-registeration');
  const handleLogOut = () => {
    sessionStorage.clear();
    navigate('/login');
  }

  const handleViewHospitalDetails = (hospital) => {
    setSelectedHospital(hospital);
  };

  const handleBookHospital = (hospital, source) => {
    setBookingSource(source || 'hospital');
    setBookingItem(hospital);
    setShowBookingModal(true);
  };

  const handleViewDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleBookDoctor = (doctor, source) => {
    setBookingSource(source || 'doctor');
    setBookingItem(doctor);
    setShowBookingModal(true);
  };

  const handleCloseModals = () => {
    setSelectedHospital(null);
    setSelectedDoctor(null);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setBookingSource(null);
    setBookingItem(null);
  };

  const features = [
    {
      icon: <Calendar size={28} />,
      title: 'Smart Appointment Booking',
      description: 'Book appointments with doctors from any hospital instantly with real-time availability.'
    },
    {
      icon: <Stethoscope size={28} />,
      title: 'Multi-Specialty Doctors',
      description: 'Access thousands of verified doctors across various specialties and hospitals.'
    },
    {
      icon: <Video size={28} />,
      title: 'Telemedicine',
      description: 'Consult with doctors remotely via video calls from the comfort of your home.'
    },
    {
      icon: <FileText size={28} />,
      title: 'Digital Health Records',
      description: 'Secure access to your medical history, prescriptions, and reports anytime.'
    },
    {
      icon: <Hospital size={28} />,
      title: 'Hospital Directory',
      description: 'Find and compare hospitals based on ratings, services, and location.'
    },
    {
      icon: <CreditCard size={28} />,
      title: 'Online Payments',
      description: 'Easy and secure online payments for consultations and medical services.'
    },
    {
      icon: <MessageCircle size={28} />,
      title: 'Chat with Doctors',
      description: 'Quick pre-consultation chats to understand your health concerns better.'
    },
    {
      icon: <Smartphone size={28} />,
      title: 'Mobile App Support',
      description: 'Full-featured mobile app for appointments and health tracking on the go.'
    }
  ];

  const stats = [
    { value: '1000+', label: 'Hospitals', icon: Hospital, color: '#3b82f6' },
    { value: '5000+', label: 'Doctors', icon: Stethoscope, color: '#10b981' },
    { value: '1M+', label: 'Happy Patients', icon: Users, color: '#f59e0b' },
    { value: '50K+', label: 'Daily Appointments', icon: Calendar, color: '#ef4444' }
  ];

  const specialties = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 
    'Dermatology', 'Gynecology', 'Ophthalmology', 'Dentistry',
    'Psychiatry', 'ENT', 'Urology', 'Endocrinology'
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Find a Doctor/Hospital',
      description: 'Search for doctors or hospitals based on specialty, location, and availability',
      icon: <SearchIcon size={32} />
    },
    {
      step: '02',
      title: 'Book Appointment',
      description: 'Choose a convenient time slot and book your appointment instantly',
      icon: <Calendar size={32} />
    },
    {
      step: '03',
      title: 'Get Consultation',
      description: 'Visit the hospital or opt for video consultation with the doctor',
      icon: <Video size={32} />
    },
    {
      step: '04',
      title: 'Follow-up Care',
      description: 'Receive prescriptions, reports, and schedule follow-up appointments',
      icon: <Heart size={32} />
    }
  ];

  return (
    <div className="main-dashboard">
      <header className={`main-header ${isVisible ? 'header-visible' : ''}`}>
        <nav className="nav-container">
          <div className="logo-container" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <Hospital size={28} />
              <Heart size={16} className="logo-heart" />
            </div>
            <span className="logo-text">
              SmarTech<span className="logo-highlight">Health</span>
            </span>
          </div>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#hospitals">Hospitals</a>
            <a href="#doctors">Doctors</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="nav-buttons">
            {
              token ? (
              <>
              <button className="nav-btn-login" onClick={handleLogOut}>
              Log Out
              <LogIn size={18} />
            </button>
              </>
            ) : (
                <>
                <button className="nav-btn-login" onClick={handleLogin}>
              <LogIn size={18} />
              Login
            </button>
            <button className="nav-btn-signup" onClick={handleUserSignUp}>
              <UserPlus size={18} />
              Sign Up
            </button>
            <button className="nav-btn-hospital" onClick={handleSignUp}>
              <Hospital size={18} />
              Register Hospital
            </button>
            </>
              )
            }
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#hospitals" onClick={() => setMobileMenuOpen(false)}>Hospitals</a>
            <a href="#doctors" onClick={() => setMobileMenuOpen(false)}>Doctors</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className="mobile-buttons">
              {
                token ? (
                <>
                <button className="mobile-login" onClick={handleLogOut}>Log Out</button>
                </>
              ) : (
                  <>
                  <button className="mobile-login" onClick={handleLogin}>Login</button>
                  <button className="mobile-signup" onClick={handleUserSignUp}>Sign Up</button>
                  <button className="mobile-hospital" onClick={handleSignUp}>Register Hospital</button>
                  </>
                )
              }
            </div>
          </div>
        )}
      </header>

      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className={`hero-text ${isVisible ? 'fade-in-up' : ''}`}>
            <div className="hero-badge">
              <span className="badge-pulse">✨</span>
              India's Trusted Healthcare Platform
            </div>
            <h1 className="hero-title">
              Your Health, Our Priority
              <span className="gradient-text"> Connect with Top Doctors & Hospitals</span>
            </h1>
            <p className="hero-description">
              Book appointments with 5000+ trusted doctors across 1000+ hospitals. 
              Get quality healthcare from the comfort of your home or at nearby hospitals.
            </p>
            
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search for doctors, specialties, or hospitals..." 
                className="search-input"
              />
              <button className="search-btn">
                Search
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="hero-buttons">
              <button className="btn-primary-hero" >
                <a  href="#hospitals">Book Appointment</a>
                <ArrowRight size={18} />
              </button>
              {
                token ? (<></>) : (
                  <>
                  <button className="btn-secondary-hero" onClick={handleHospitalLogin}>
                  Hospital Login
                  </button>
                  </>
                )
              }
            </div>

            <div className="trust-badges">
              <div className="trust-item">
                <Shield size={16} />
                <span>ISO Certified</span>
              </div>
              <div className="trust-item">
                <CheckCircle size={16} />
                <span>Verified Doctors</span>
              </div>
              <div className="trust-item">
                <Lock size={16} />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
          
          <div className={`hero-stats ${isVisible ? 'fade-in-up-delay' : ''}`}>
            {stats.map((stat, index) => (
              <div key={index} className="stat-card-hero">
                <div className="stat-icon-hero" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <stat.icon size={26} />
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

      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Comprehensive Healthcare Solutions</h2>
            <p className="section-subtitle">
              Everything you need for modern healthcare management in one platform
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="hospitals">
        <HospitalsList 
          onViewDetails={handleViewHospitalDetails}
          onBookAppointment={handleBookHospital}
        />
      </section>

      <section id="doctors">
        <DoctorsList 
          onViewDetails={handleViewDoctorDetails}
          onBookAppointment={handleBookDoctor}
        />
      </section>

      <section className="specialties-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Medical Specialties</span>
            <h2 className="section-title">Expert Care Across All Specialties</h2>
            <p className="section-subtitle">
              Find specialized doctors for every medical condition
            </p>
          </div>

          <div className="specialties-grid">
            {specialties.map((specialty, index) => (
              <div key={index} className="specialty-card">
                <span>{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">Book Appointment in 4 Easy Steps</h2>
            <p className="section-subtitle">
              Get the care you need with our streamlined booking process
            </p>
          </div>

          <div className="steps-container">
            {howItWorks.map((step, index) => (
              <React.Fragment key={index}>
                <div className="step-card">
                  <div className="step-number-badge">{step.step}</div>
                  <div className="step-icon-container">{step.icon}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="step-arrow">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {
        token ? (<></>) : (
          <section className="hospital-cta-section">
        <div className="hospital-cta-content">
          <div className="cta-left">
            <div className="cta-badge">For Hospitals</div>
            <h2 className="cta-title">List Your Hospital on Our Platform</h2>
            <p className="cta-description">
              Join 1000+ hospitals already using SmarTechHealth to manage appointments, 
              reach more patients, and streamline operations.
            </p>
            <ul className="cta-benefits">
              <li><CheckCircle size={18} /> Increase patient reach by 200%</li>
              <li><CheckCircle size={18} /> Free 30-day trial with full features</li>
              <li><CheckCircle size={18} /> Dedicated account manager support</li>
              <li><CheckCircle size={18} /> Advanced analytics and insights</li>
            </ul>
            <button className="cta-register-btn" onClick={handleSignUp}>
              Register Your Hospital Now
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="cta-right">
            <div className="stats-card">
              <div className="stats-item">
                <div className="stats-value">98%</div>
                <div className="stats-label">Patient Satisfaction</div>
              </div>
              <div className="stats-item">
                <div className="stats-value">50K+</div>
                <div className="stats-label">Daily Appointments</div>
              </div>
              <div className="stats-item">
                <div className="stats-value">24/7</div>
                <div className="stats-label">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>
        )
      }

      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">
              Trusted by millions of patients and healthcare providers
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                Amazing platform! Found the best cardiologist for my father within minutes. 
                The video consultation feature is a lifesaver.
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">RK</div>
                <div>
                  <div className="author-name">Rahul Kumar</div>
                  <div className="author-title">Patient</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                As a hospital administrator, this platform has revolutionized how we manage 
                appointments. Patient flow has improved significantly.
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">DS</div>
                <div>
                  <div className="author-name">Dr. Sharmila Das</div>
                  <div className="author-title">Hospital Admin</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                The digital records feature is fantastic! I can access all my medical history 
                anytime, anywhere. Highly recommended!
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">PP</div>
                <div>
                  <div className="author-name">Priya Patel</div>
                  <div className="author-title">Patient</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="download-app-section">
        <div className="download-app-content">
          <div className="app-info">
            <div className="app-badge">Mobile App</div>
            <h2 className="app-title">Healthcare at Your Fingertips</h2>
            <p className="app-description">
              Download our mobile app for easy appointment booking, health tracking, 
              and instant doctor consultations.
            </p>
            <div className="app-buttons">
              <button className="app-store-btn">
                <Smartphone size={20} />
                App Store
              </button>
              <button className="play-store-btn">
                <Smartphone size={20} />
                Google Play
              </button>
            </div>
          </div>
          <div className="app-mockup">
            <div className="mockup-phone">
              <div className="mockup-screen"></div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Hospital size={24} />
              <Heart size={12} className="footer-heart" />
              <span>SmarTechHealth</span>
            </div>
            <p className="footer-description">
              India's most trusted healthcare platform connecting patients with top doctors and hospitals.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <Phone size={14} />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="contact-item">
                <Mail size={14} />
                <span>support@smartechealth.com</span>
              </div>
              <div className="contact-item">
                <MapPin size={14} />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>For Patients</h4>
              <a href="#">Find Doctors</a>
              <a href="#">Find Hospitals</a>
              <a href="#">Book Appointment</a>
              <a href="#">Video Consult</a>
              <a href="#">Health Records</a>
            </div>
            <div className="footer-column">
              <h4>For Hospitals</h4>
              <a href="#">List Your Hospital</a>
              <a href="#">Pricing Plans</a>
              <a href="#">API Integration</a>
              <a href="#">Success Stories</a>
              <a href="#">Support</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
              <a href="#">Compliance</a>
              <a href="#">HIPAA</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SmarTechHealth. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedHospital && (
        <HospitalDetailsModal 
          hospital={selectedHospital} 
          onClose={handleCloseModals}
          onBookAppointment={() => handleBookHospital(selectedHospital, 'hospital')}
        />
      )}

      {selectedDoctor && (
        <DoctorDetailsModal 
          doctor={selectedDoctor} 
          onClose={handleCloseModals}
          onBookAppointment={() => handleBookDoctor(selectedDoctor, 'doctor')}
        />
      )}

      {showBookingModal && bookingItem && (
        <BookingModal 
          onClose={handleCloseBookingModal}
          preSelectedData={bookingItem}
          sourceType={bookingSource}
        />
      )}
    </div>
  );
};

export default MainDashboard;