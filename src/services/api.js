/* eslint-disable no-useless-catch */
// services/api.js - Updated with booking and doctor/hospital endpoints
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';
const token = sessionStorage.getItem('Token')

export const apiService = {
  // Hospitals
  getAllHospitals: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hospital/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      throw error;
    }
  },

  getHospitalById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hospital/${id}`);
      return response.data.hospital;
    } catch (error) {
      console.error('Error fetching hospital by ID:', error);
      throw error;
    }
  },

  // Doctors
  getAllDoctors: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  getDoctorById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/${id}`);
      return response.data.doctor;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      throw error;
    }
  },

  // Get doctors by hospital ID (required for booking modal)
  getDoctorsByHospital: async (hospitalId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/hospital/${hospitalId}`);
      console.log("res:",response)
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors by hospital:', error);
      throw error;
    }
  },

  // Sub Departments
  getAllSubDepartments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-department/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sub-departments:', error);
      throw error;
    }
  },

  // Appointments (new endpoints for booking)
  createAppointment: async (appointmentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/appointment/create`, appointmentData,{
        headers:{
          "Authorization":`Bearer ${token}`        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  bookAppointment: async (appointmentData) => {
    return apiService.createAppointment(appointmentData);
  },

  getAllAppointments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointment/by-doctor`,{
        headers:{
          "Authorization":`Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  getAppointmentById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointment/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment by ID:', error);
      throw error;
    }
  },

  updateAppointmentStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/appointment/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  cancelAppointment: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/appointment/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },


getAppointmentsByDoctor: async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/appointment/by-doctor`,{
        headers:{
          "Authorization":`Bearer ${token}`
        }
      });
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Get appointments by hospital
getAppointmentsByHospital: async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/appointment/by-hospital`, {
      headers:{
        'Authorization':`Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Update appointment attendance
updateAppointmentAttendance: async (appointmentId, status) => {
  try {
    const data ={id : appointmentId ,status : status};
    const response = await axios.patch(`${API_BASE_URL}/appointment/update-attendance`, data ,{
      headers:{
        "Authorization":`Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

getLabTestsByHospital: async (hospitalId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lab/hospital/${hospitalId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Add prescription
createPrescription: async (prescriptionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/prescription/create`, prescriptionData ,{
      headers:{
        'Authorization':`Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
};

export default apiService;