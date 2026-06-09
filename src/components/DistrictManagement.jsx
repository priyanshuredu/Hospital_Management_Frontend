import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import DynamicModal from './DynamicModal';
import { useTheme } from './ThemeContext';
import { Plus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import '../styles/DistrictManagement.css';

const API_URL = 'https://hospital-management-backend-9u93.onrender.com/location';

const DistrictManagement = () => {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { label: 'District Name', key: 'districtName' },
    { label: 'State', key: 'state' },
    { label: 'Status', key: 'status' }
  ];

  // Fetch districts from backend
  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/districts`);
      if (response.data && response.data.districts) {
        // Populate state names for display
        const districtsWithStateNames = await Promise.all(
          response.data.districts.map(async (district) => {
            if (district.state) {
              try {
                const stateResponse = await axios.get(`${API_URL}/state/${district.state}`);
                return {
                  ...district,
                  stateName: stateResponse.data.state?.stateName || 'Unknown'
                };
              } catch {
                return { ...district, stateName: 'Unknown' };
              }
            }
            return { ...district, stateName: 'Unknown' };
          })
        );
        setDistricts(districtsWithStateNames);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      alert('Error fetching districts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleAdd = (newDistrict) => {
    setDistricts([...districts, newDistrict]);
    fetchDistricts(); // Refresh the list
  };

  const handleEdit = async (district) => {
    console.log('Edit district:', district);
  };

  const handleDeactivate = async (district) => {
    const newStatus = district.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.patch(`${API_URL}/district/update`, {
        id: district._id,
        status: newStatus
      });
      
      if (response.data) {
        setDistricts(districts.map(d => 
          d._id === district._id ? { ...d, status: newStatus } : d
        ));
        alert(`District ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating district status:', error);
      alert('Error updating district status. Please try again.');
    }
  };

  const handleDelete = async (district) => {
    if (window.confirm(`Are you sure you want to delete ${district.districtName}? This will also delete all associated cities.`)) {
      try {
        const response = await axios.delete(`${API_URL}/district/${district._id}`);
        if (response.data) {
          setDistricts(districts.filter(d => d._id !== district._id));
          alert('District deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting district:', error);
        alert('Error deleting district. Please try again.');
      }
    }
  };

  return (
    <div className={`district-management ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="district-header">
        <button className="add-district-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add New District
        </button>
        <button className="refresh-btn" onClick={fetchDistricts}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading districts...</div>
      ) : (
        <DataTable
          title="All Districts"
          data={districts.map(d => ({
            ...d,
            state: d.stateName
          }))}
          columns={columns}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}

      <DynamicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="district"
        onAdd={handleAdd}
      />
    </div>
  );
};

export default DistrictManagement;