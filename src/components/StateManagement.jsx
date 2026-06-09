import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import DynamicModal from './DynamicModal';
import { useTheme } from './ThemeContext';
import { Plus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import '../styles/StateManagement.css';

const API_URL = 'https://hospital-management-backend-9u93.onrender.com/location';

const StateManagement = () => {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { label: 'State Name', key: 'stateName' },
    { label: 'Country', key: 'country' },
    { label: 'Status', key: 'status' }
  ];

  // Fetch states from backend
  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/states`);
      if (response.data && response.data.states) {
        setStates(response.data.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      alert('Error fetching states. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleAdd = (newState) => {
    setStates([...states, newState]);
    fetchStates(); // Refresh the list
  };

  const handleEdit = async (state) => {
    // Since your backend doesn't have edit endpoint, you can implement status toggle
    console.log('Edit state:', state);
  };

  const handleDeactivate = async (state) => {
    const newStatus = state.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.patch(`${API_URL}/state/update`, {
        id: state._id,
        status: newStatus
      });
      
      if (response.data.result) {
        // Update local state
        setStates(states.map(s => 
          s._id === state._id ? { ...s, status: newStatus } : s
        ));
        alert(`State ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating state status:', error);
      alert('Error updating state status. Please try again.');
    }
  };

  const handleDelete = async (state) => {
    if (window.confirm(`Are you sure you want to delete ${state.stateName}? This will also delete all associated districts and cities.`)) {
      try {
        const response = await axios.delete(`${API_URL}/state/${state._id}`);
        if (response.data) {
          setStates(states.filter(s => s._id !== state._id));
          alert('State deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting state:', error);
        alert('Error deleting state. Please try again.');
      }
    }
  };

  return (
    <div className={`state-management ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="state-header">
        <button className="add-state-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add New State
        </button>
        <button className="add-state-btn" onClick={fetchStates}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="loading-state">Loading states...</div>
      ) : (
        <DataTable
          title="All States"
          data={states}
          columns={columns}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}

      <DynamicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="state"
        onAdd={handleAdd}
      />
    </div>
  );
};

export default StateManagement;