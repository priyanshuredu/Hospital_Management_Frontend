// components/BookingModal.jsx - Updated with API integration
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, User, Mail, CheckCircle, CreditCard, ArrowRight, Stethoscope, Building } from 'lucide-react';
import { apiService } from '../services/api';

const BookingModal = ({ item, type, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState('clinic');
  const [loading, setLoading] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: ''
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  const dates = [
    'Today', 'Tomorrow', getFormattedDate(2), getFormattedDate(3), 
    getFormattedDate(4), getFormattedDate(5)
  ];

  function getFormattedDate(daysAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysAdd);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const handlePatientDetailsChange = (e) => {
    setPatientDetails({
      ...patientDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      // Prepare appointment data
      const appointmentData = {
        patientName: patientDetails.name,
        patientEmail: patientDetails.email,
        patientPhone: patientDetails.phone,
        patientAge: parseInt(patientDetails.age),
        patientGender: patientDetails.gender,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        consultationType: consultationType,
        ...(type === 'doctor' ? {
          doctorId: item._id?.$oid || item._id,
          doctorName: item.doctor_name,
          fee: item.consultation_fee || 500
        } : {
          hospitalId: item._id?.$oid || item._id,
          hospitalName: item.hospital_name,
          fee: 500 // Default hospital consultation fee
        }),
        bookingDate: new Date().toISOString(),
        status: 'pending'
      };

      // Call API to book appointment
      const response = await apiService.bookAppointment(appointmentData);
      const bookingId = response.bookingId || response.data?.bookingId || 'APPT' + Math.floor(Math.random() * 100000);
      
      setBookingId(bookingId);
      setBookingConfirmed(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFee = () => {
    if (type === 'doctor') {
      return consultationType === 'clinic' ? (item.consultation_fee || 500) : (item.consultation_fee || 500) * 0.8;
    }
    return 500; // Default hospital consultation fee
  };

  const getItemName = () => {
    if (type === 'doctor') {
      return item.doctor_name;
    }
    return item.hospital_name;
  };

  const getItemType = () => {
    return type === 'doctor' ? 'Doctor' : 'Hospital';
  };

  const renderStep1 = () => (
    <div className="booking-step">
      <h3>Select Consultation Type</h3>
      <div className="consultation-types">
        <button 
          className={`consultation-type ${consultationType === 'clinic' ? 'active' : ''}`}
          onClick={() => setConsultationType('clinic')}
        >
          <MapPin size={24} />
          <div>
            <strong>Clinic Visit</strong>
            <span>₹{getFee()}</span>
          </div>
        </button>
        <button 
          className={`consultation-type ${consultationType === 'video' ? 'active' : ''}`}
          onClick={() => setConsultationType('video')}
        >
          <Video size={24} />
          <div>
            <strong>Video Consultation</strong>
            <span>₹{Math.floor(getFee() * 0.8)}</span>
          </div>
        </button>
      </div>

      <h3>Select Date</h3>
      <div className="date-slots">
        {dates.map((date, index) => (
          <button
            key={index}
            className={`date-slot ${selectedDate === date ? 'active' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </button>
        ))}
      </div>

      <h3>Select Time Slot</h3>
      <div className="time-slots">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            className={`time-slot ${selectedSlot === slot ? 'active' : ''}`}
            onClick={() => setSelectedSlot(slot)}
          >
            {slot}
          </button>
        ))}
      </div>

      <button 
        className="next-btn"
        disabled={!selectedDate || !selectedSlot}
        onClick={() => setStep(2)}
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="booking-step">
      <h3>Patient Details</h3>
      <div className="patient-form">
        <div className="form-group">
          <User size={18} />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={patientDetails.name}
            onChange={handlePatientDetailsChange}
            required
          />
        </div>
        <div className="form-group">
          <Mail size={18} />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={patientDetails.email}
            onChange={handlePatientDetailsChange}
            required
          />
        </div>
        <div className="form-group">
          <Phone size={18} />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={patientDetails.phone}
            onChange={handlePatientDetailsChange}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={patientDetails.age}
              onChange={handlePatientDetailsChange}
            />
          </div>
          <div className="form-group">
            <select name="gender" value={patientDetails.gender} onChange={handlePatientDetailsChange}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="booking-summary">
        <h4>Booking Summary</h4>
        <div className="summary-item">
          <span>{getItemType()}:</span>
          <strong>{getItemName()}</strong>
        </div>
        <div className="summary-item">
          <span>Date & Time:</span>
          <strong>{selectedDate} at {selectedSlot}</strong>
        </div>
        <div className="summary-item">
          <span>Consultation Type:</span>
          <strong>{consultationType === 'clinic' ? 'Clinic Visit' : 'Video Consultation'}</strong>
        </div>
        <div className="summary-item total">
          <span>Total Amount:</span>
          <strong>₹{getFee()}</strong>
        </div>
      </div>

      <button 
        className="confirm-btn"
        disabled={!patientDetails.name || !patientDetails.email || !patientDetails.phone || loading}
        onClick={handleConfirmBooking}
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
        {!loading && <CreditCard size={18} />}
      </button>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="booking-header">
          <h2>Book Appointment</h2>
          <div className="booking-steps">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
        </div>

        {!bookingConfirmed ? (
          step === 1 ? renderStep1() : renderStep2()
        ) : (
          <div className="booking-confirmed">
            <CheckCircle size={64} color="#10b981" />
            <h3>Appointment Booked Successfully!</h3>
            <p>Your appointment has been confirmed. You will receive a confirmation email and SMS shortly.</p>
            <div className="confirmation-details">
              <p><strong>Booking ID:</strong> {bookingId}</p>
              <p><strong>{getItemType()}:</strong> {getItemName()}</p>
              <p><strong>Date & Time:</strong> {selectedDate} at {selectedSlot}</p>
              <p><strong>Consultation Type:</strong> {consultationType === 'clinic' ? 'Clinic Visit' : 'Video Consultation'}</p>
              <p><strong>Amount Paid:</strong> ₹{getFee()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;