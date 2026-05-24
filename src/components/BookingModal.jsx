// components/BookingModal.jsx - Smart integration for both doctor and hospital booking
import React, { useState, useEffect } from 'react';
import { X, MapPin, Video, Phone, User, Mail, CheckCircle, CreditCard, ArrowRight, Stethoscope, Building } from 'lucide-react';
import { apiService } from '../services/api';

const BookingModal = ({ onClose, preSelectedData, sourceType }) => {
  const [step, setStep] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentDateValue, setAppointmentDateValue] = useState(null); // Store actual Date object
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState('clinic');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    name: '',
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

  // Helper function to get formatted date string
  function getFormattedDate(daysAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysAdd);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Helper function to get actual Date object from display string
  function getActualDateFromDisplay(displayDate) {
    if (displayDate === 'Today') {
      return new Date();
    } else if (displayDate === 'Tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else {
      // Find which day it corresponds to from the dates array
      const index = dates.findIndex(d => d === displayDate);
      if (index !== -1) {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date;
      }
    }
    return new Date(); // fallback
  }

  // Create date options with both display label and actual date
  const dateOptions = [
    { label: 'Today', value: new Date() },
    { label: 'Tomorrow', value: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      })()
    },
    { label: getFormattedDate(2), value: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date;
      })()
    },
    { label: getFormattedDate(3), value: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date;
      })()
    },
    { label: getFormattedDate(4), value: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        return date;
      })()
    },
    { label: getFormattedDate(5), value: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date;
      })()
    }
  ];

  const dates = dateOptions.map(option => option.label);

  // Handle date selection
  const handleDateSelect = (selectedLabel) => {
    setAppointmentDate(selectedLabel);
    const actualDate = getActualDateFromDisplay(selectedLabel);
    setAppointmentDateValue(actualDate);
  };

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
    fetchAllDoctors();
  }, []);

  // Handle pre-selected data from doctor or hospital list
  useEffect(() => {
    if (preSelectedData) {
      if (sourceType === 'doctor') {
        // User came from doctor list - pre-select the doctor's hospital and doctor
        const doctorHospitalId = preSelectedData.hospital?._id?.$oid || preSelectedData.hospital?._id;
        if (doctorHospitalId) {
          setSelectedHospital(doctorHospitalId);
          setSelectedDoctor(preSelectedData._id?.$oid || preSelectedData._id);
        }
      } else if (sourceType === 'hospital') {
        // User came from hospital list - pre-select only the hospital
        const hospitalId = preSelectedData._id?.$oid || preSelectedData._id;
        setSelectedHospital(hospitalId);
      }
    }
  }, [preSelectedData, sourceType, hospitals]);

  // Fetch doctors when hospital is selected
  useEffect(() => {
    if (selectedHospital) {
      fetchDoctorsByHospital(selectedHospital);
    } else {
      setDoctors([]);
      setSelectedDoctor('');
    }
  }, [selectedHospital]);

  const fetchAllDoctors = async () => {
    try {
      const response = await apiService.getAllDoctors();
      let doctorsData = response;
      if (response?.data) doctorsData = response.data;
      if (response?.doctors) doctorsData = response.doctors;
      setAllDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (error) {
      console.error('Error fetching all doctors:', error);
    }
  };

  const fetchHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const response = await apiService.getAllHospitals();
      let hospitalsData = response;
      if (response?.data) hospitalsData = response.data;
      if (response?.hospitals) hospitalsData = response.hospitals;
      
      // Filter only approved hospitals
      const approvedHospitals = Array.isArray(hospitalsData) 
        ? hospitalsData.filter(h => h.status === 'approved')
        : [];
      
      setHospitals(approvedHospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals([]);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchDoctorsByHospital = async (hospitalId) => {
    setLoadingDoctors(true);
    try {
      // First try to fetch doctors by hospital API
      let hospitalDoctors = [];
      try {
        const response = await apiService.getDoctorsByHospital(hospitalId);
        let doctorsData = response;
        if (response?.data) doctorsData = response.data;
        if (response?.doctors) doctorsData = response.doctors;
        hospitalDoctors = Array.isArray(doctorsData) ? doctorsData : [];
      } catch (error) {
        console.log('Fetch by hospital API failed, filtering from all doctors');
        // Fallback: Filter from all doctors
        hospitalDoctors = allDoctors.filter(doctor => {
          const docHospitalId = doctor.hospital?._id?.$oid || doctor.hospital?._id || doctor.hospital;
          return docHospitalId === hospitalId && doctor.accountStatus === 'active';
        });
      }
      
      setDoctors(hospitalDoctors);
      
      // If coming from doctor selection and doctor is in this hospital, auto-select
      if (sourceType === 'doctor' && preSelectedData) {
        const doctorId = preSelectedData._id?.$oid || preSelectedData._id;
        const doctorExists = hospitalDoctors.some(d => (d._id?.$oid || d._id) === doctorId);
        if (doctorExists && !selectedDoctor) {
          setSelectedDoctor(doctorId);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handlePatientDetailsChange = (e) => {
    setPatientDetails({
      ...patientDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const selectedHospitalData = hospitals.find(h => 
        (h._id?.$oid || h._id) === selectedHospital
      );
      const selectedDoctorData = doctors.find(d => 
        (d._id?.$oid || d._id) === selectedDoctor
      );

      // Get the actual date object
      let finalAppointmentDate = appointmentDateValue;
      if (!finalAppointmentDate) {
        finalAppointmentDate = getActualDateFromDisplay(appointmentDate);
      }
      
      // Format date for API (ISO string or specific format)
      const formattedDate = finalAppointmentDate.toISOString();

      const appointmentData = {
        hospital: selectedHospital,
        doctor: selectedDoctor,
        appointmentDate: formattedDate, // Send actual Date object or ISO string
        appointmentDateDisplay: appointmentDate, // Keep display string for reference
        timeSlot: selectedSlot,
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone,
        patientAge: parseInt(patientDetails.age),
        patientGender: patientDetails.gender,
        fee: selectedDoctorData?.consultation_fee || 500,
        bookingDate: new Date().toISOString(),
        status: 'pending',
        consultationType: consultationType
      };

      console.log('Sending appointment data:', appointmentData);
      const response = await apiService.createAppointment(appointmentData);
      
      const newBookingId = response.bookingId || response.data?.bookingId || response.id || 'APPT' + Math.floor(Math.random() * 100000);
      setBookingId(newBookingId);
      setBookingConfirmed(true);
      
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.\n' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getFee = () => {
    const selectedDoctorData = doctors.find(d => (d._id?.$oid || d._id) === selectedDoctor);
    const baseFee = selectedDoctorData?.consultation_fee || 500;
    return consultationType === 'video' ? Math.floor(baseFee * 0.8) : baseFee;
  };

  const getSelectedHospitalName = () => {
    const hospital = hospitals.find(h => (h._id?.$oid || h._id) === selectedHospital);
    return hospital?.hospital_name || '';
  };

  const getSelectedDoctorName = () => {
    const doctor = doctors.find(d => (d._id?.$oid || d._id) === selectedDoctor);
    return doctor?.doctor_name || '';
  };

  const isNextDisabled = () => {
    if (sourceType === 'doctor') {
      return !selectedHospital || !selectedDoctor || !appointmentDate || !selectedSlot;
    }
    return !selectedHospital || !appointmentDate || !selectedSlot;
  };

  const renderStep1 = () => (
    <div className="booking-step">
      <h3>Select Hospital</h3>
      <div className="form-group">
        <Building size={18} />
        <select 
          value={selectedHospital} 
          onChange={(e) => setSelectedHospital(e.target.value)}
          disabled={loadingHospitals || (sourceType === 'doctor' && selectedHospital)}
        >
          <option value="">{loadingHospitals ? 'Loading hospitals...' : 'Select a hospital'}</option>
          {hospitals.map((hospital) => (
            <option key={hospital._id?.$oid || hospital._id} value={hospital._id?.$oid || hospital._id}>
              {hospital.hospital_name}
            </option>
          ))}
        </select>
      </div>

      <h3>Select Doctor</h3>
      <div className="form-group">
        <Stethoscope size={18} />
        <select 
          value={selectedDoctor} 
          onChange={(e) => setSelectedDoctor(e.target.value)}
          disabled={!selectedHospital || loadingDoctors || (sourceType === 'doctor' && selectedDoctor)}
        >
          <option value="">
            {!selectedHospital 
              ? 'Please select a hospital first' 
              : loadingDoctors 
                ? 'Loading doctors...' 
                : doctors.length === 0
                  ? 'No doctors available for this hospital'
                  : 'Select a doctor'
            }
          </option>
          {doctors.map((doctor) => (
            <option key={doctor._id?.$oid || doctor._id} value={doctor._id?.$oid || doctor._id}>
              {doctor.doctor_name} - ₹{doctor.consultation_fee || 500}
            </option>
          ))}
        </select>
      </div>

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
            className={`date-slot ${appointmentDate === date ? 'active' : ''}`}
            onClick={() => handleDateSelect(date)}
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
        disabled={isNextDisabled()}
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
          <span>Hospital:</span>
          <strong>{getSelectedHospitalName()}</strong>
        </div>
        <div className="summary-item">
          <span>Doctor:</span>
          <strong>{getSelectedDoctorName()}</strong>
        </div>
        <div className="summary-item">
          <span>Date & Time:</span>
          <strong>{appointmentDate} at {selectedSlot}</strong>
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
        disabled={!patientDetails.name || !patientDetails.phone || loading}
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
              <p><strong>Hospital:</strong> {getSelectedHospitalName()}</p>
              <p><strong>Doctor:</strong> {getSelectedDoctorName()}</p>
              <p><strong>Date & Time:</strong> {appointmentDate} at {selectedSlot}</p>
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