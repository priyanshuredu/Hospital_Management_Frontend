// components/AddTest.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddTest = ({ onTestAdded }) => {
  const [formData, setFormData] = useState({
    testName: '',
    fee: '',
    precautions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.testName || !formData.fee || !formData.precautions) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('Token');
      const response = await axios.post('http://localhost:5000/test/create', formData ,{
        headers:{
            'Authorization':`Bearer ${token}`
        }
      });
      setSuccess('Test added successfully!');
      setFormData({
        testName: '',
        fee: '',
        precautions: ''
      });
      
      if (onTestAdded) {
        onTestAdded(response.data);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add test');
      console.error('Error adding test:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-test-container">
      <h2>Add New Test</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="test-form">
        <div className="form-group">
          <label htmlFor="testName">Test Name *</label>
          <input
            type="text"
            id="testName"
            name="testName"
            value={formData.testName}
            onChange={handleChange}
            placeholder="Enter test name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fee">Fee *</label>
          <input
            type="number"
            id="fee"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            placeholder="Enter test fee"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="precautions">Precautions *</label>
          <textarea
            id="precautions"
            name="precautions"
            value={formData.precautions}
            onChange={handleChange}
            placeholder="Enter precautions"
            rows="3"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding...' : 'Add Test'}
        </button>
      </form>

      <style jsx>{`
        .add-test-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }
        input, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .disabled-field {
          background-color: #e9ecef;
          cursor: not-allowed;
        }
        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }
        .submit-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
};

export default AddTest;