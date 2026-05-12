import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import DynamicModal from './DynamicModal';
import { useTheme } from './ThemeContext';
import { Plus, RefreshCw } from 'lucide-react';
import axios from 'axios';
import '../styles/CityManagement.css';

const API_URL = 'http://localhost:5000/location';

const CityManagement = () => {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { label: 'City Name', key: 'cityName' },
    { label: 'District', key: 'districtName' },
    { label: 'Status', key: 'status' }
  ];

  // Fetch cities from backend
  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cities`);
      if (response.data && response.data.cities) {
        // Populate district names for display
        const citiesWithDistrictNames = await Promise.all(
          response.data.cities.map(async (city) => {
            if (city.district) {
              try {
                const districtResponse = await axios.get(`${API_URL}/district/${city.district}`);
                return {
                  ...city,
                  districtName: districtResponse.data.district?.districtName || 'Unknown'
                };
              } catch {
                return { ...city, districtName: 'Unknown' };
              }
            }
            return { ...city, districtName: 'Unknown' };
          })
        );
        setCities(citiesWithDistrictNames);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      alert('Error fetching cities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAdd = (newCity) => {
    setCities([...cities, newCity]);
    fetchCities(); // Refresh the list
  };

  const handleEdit = async (city) => {
    console.log('Edit city:', city);
  };

  const handleDeactivate = async (city) => {
    const newStatus = city.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.patch(`${API_URL}/city/update`, {
        id: city._id,
        status: newStatus
      });
      
      if (response.data) {
        setCities(cities.map(c => 
          c._id === city._id ? { ...c, status: newStatus } : c
        ));
        alert(`City ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating city status:', error);
      alert('Error updating city status. Please try again.');
    }
  };

  const handleDelete = async (city) => {
    if (window.confirm(`Are you sure you want to delete ${city.cityName}?`)) {
      try {
        const response = await axios.delete(`${API_URL}/city/${city._id}`);
        if (response.data) {
          setCities(cities.filter(c => c._id !== city._id));
          alert('City deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting city:', error);
        alert('Error deleting city. Please try again.');
      }
    }
  };

  return (
    <div className={`city-management ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="city-header">
        <button className="add-city-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add New City
        </button>
        <button className="refresh-btn" onClick={fetchCities}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading cities...</div>
      ) : (
        <DataTable
          title="All Cities"
          data={cities}
          columns={columns}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}

      <DynamicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="city"
        onAdd={handleAdd}
      />
    </div>
  );
};

export default CityManagement;