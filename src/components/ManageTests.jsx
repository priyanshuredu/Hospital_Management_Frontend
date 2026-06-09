// components/ManageTests.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch tests - you'll need to implement this endpoint
  const fetchTests = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('Token')
      
      // Assuming you have a GET endpoint to fetch tests
      const response = await axios.get('https://hospital-management-backend-9u93.onrender.com/test/all',{
        headers:{
            "Authorization":`Bearer ${token}`
        }
      });
      setTests(response.data.tests);
    } catch (err) {
      setError('Failed to fetch tests');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setUpdatingId(id);
    setError('');
    setSuccess('');

    try {
      await axios.post('https://hospital-management-backend-9u93.onrender.com/test/update-status', {
        id: id,
        status: newStatus
      });
      
      setSuccess(`Test status updated to ${newStatus}`);
      
      // Update local state
      setTests(prevTests =>
        prevTests.map(test =>
          test.id === id ? { ...test, status: newStatus } : test
        )
      );
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update test status');
      console.error('Error updating status:', err);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  return (
    <div className="manage-tests-container">
      <h2>Manage Tests</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {loading && tests.length === 0 ? (
        <div className="loading">Loading tests...</div>
      ) : (
        <div className="tests-table-wrapper">
          <table className="tests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Test Name</th>
                <th>Fee</th>
                <th>Precautions</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No tests found</td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.id}</td>
                    <td>{test.testName}</td>
                    <td>${test.fee}</td>
                    <td className="precautions-cell">{test.precautions}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(test.status)}`}>
                        {test.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusUpdate(test.id, test.status || 'active')}
                        disabled={updatingId === test.id}
                        className={`status-btn ${test.status === 'active' ? 'deactivate-btn' : 'activate-btn'}`}
                      >
                        {updatingId === test.id ? (
                          'Updating...'
                        ) : (
                          test.status === 'active' ? 'Deactivate' : 'Activate'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .manage-tests-container {
          max-width: 1200px;
          margin: 20px auto;
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
        .tests-table-wrapper {
          overflow-x: auto;
        }
        .tests-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }
        .tests-table th,
        .tests-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .tests-table th {
          background-color: #007bff;
          color: white;
          font-weight: 600;
        }
        .tests-table tr:hover {
          background-color: #f5f5f5;
        }
        .precautions-cell {
          max-width: 200px;
          word-wrap: break-word;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-active {
          background-color: #d4edda;
          color: #155724;
        }
        .status-inactive {
          background-color: #f8d7da;
          color: #721c24;
        }
        .status-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        .activate-btn {
          background-color: #28a745;
          color: white;
        }
        .activate-btn:hover:not(:disabled) {
          background-color: #218838;
        }
        .deactivate-btn {
          background-color: #dc3545;
          color: white;
        }
        .deactivate-btn:hover:not(:disabled) {
          background-color: #c82333;
        }
        .status-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
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

export default ManageTests;