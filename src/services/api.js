// services/api.js - Simplified with only required endpoints
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

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

  // Sub Departments
  getAllSubDepartments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-department/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sub-departments:', error);
      throw error;
    }
  }
};

export default apiService;