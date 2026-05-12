import React, { useState, useEffect } from 'react';
import { X, Plus, Globe, MapPin, Building2, Navigation } from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/DynamicModal.css';
import axios from 'axios';

const API_URL = 'http://localhost:5000/location'; // Update with your API URL

const DynamicModal = ({ isOpen, onClose, type, onAdd, existingData = {} }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    country: 'India',
    stateId: '',
    districtId: '',
    cityName: ''
  });
  
  const [countries] = useState(['India']); // Static for now, can be dynamic
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const IndianStates = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"]
  const [states, setStates] = useState(IndianStates);
  
  // Configurations for different modal types
  const modalConfig = {
    state: {
      title: 'Add New State',
      icon: Globe,
      endpoint: '/states',
      fields: [
        { name: 'stateName', label: 'State Name', type: 'text', icon: MapPin, required: true, placeholder: 'Enter state name' }
      ],
      dropdownCount: 1
    },
    district: {
      title: 'Add New District',
      icon: MapPin,
      endpoint: '/districts',
      fields: [
        { name: 'stateId', label: 'Select State', type: 'dropdown', icon: MapPin, required: true },
        { name: 'districtName', label: 'District Name', type: 'text', icon: Building2, required: true, placeholder: 'Enter district name' }
      ],
      dropdownCount: 2
    },
    city: {
      title: 'Add New City',
      icon: Building2,
      endpoint: '/cities',
      fields: [
        { name: 'stateId', label: 'Select State', type: 'dropdown', icon: MapPin, required: true },
        { name: 'districtId', label: 'Select District', type: 'dropdown', icon: Building2, required: true },
        { name: 'cityName', label: 'City Name', type: 'text', icon: Navigation, required: true, placeholder: 'Enter city name' }
      ],
      dropdownCount: 3
    }
  };

  const config = modalConfig[type];

  // Fetch states from backend
  useEffect(() => {
    if (isOpen) {
      fetchStates();
    }
  }, [isOpen]);

  // Fetch districts when state is selected
  useEffect(() => {
    if (formData.stateId && (type === 'district' || type === 'city')) {
      fetchDistrictsByState(formData.stateId);
    }
  }, [formData.stateId, type]);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/states`);
      if (response.data && response.data.states) {
        setStates(response.data.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistrictsByState = async (stateId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/districts/by-state/${stateId}`);
      console.log("res :",response)
      if (response.data && response.data.districts) {
        setDistricts(response.data.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'stateId') {
      setFormData(prev => ({ ...prev, stateId: value, districtId: '', cityName: '' }));
    } else if (field === 'districtId') {
      setFormData(prev => ({ ...prev, districtId: value, cityName: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      switch(type) {
        case 'state':
          response = await axios.post(`${API_URL}/add-state`, {
            stateName: formData.stateName
          });
          break;
          
        case 'district':
          response = await axios.post(`${API_URL}/add-districts`, {
            stateId: formData.stateId,
            districtName: formData.districtName
          });
          break;
          
        case 'city':
          response = await axios.post(`${API_URL}/add-cities`, {
            districtId: formData.districtId,
            stateId: formData.stateId,
            cityName: formData.cityName
          });
          break;
          
        default:
          return;
      }
      
      if (response.data && response.data.result) {
        onAdd(response.data.result);
        handleClose();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert(error.response?.data?.message || 'Error adding item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      country: 'India',
      stateId: '',
      districtId: '',
      cityName: ''
    });
    setDistricts([]);
    onClose();
  };

  if (!isOpen) return null;

  // Render form field based on type
  const renderField = (field) => {
    const { name, label, icon: Icon, required, type: fieldType, placeholder } = field;

    if (fieldType === 'dropdown') {
      let options = [];
      let value = formData[name];
      let isDisabled = false;

      if (name === 'stateId') {
        options = states;
        isDisabled = states.length === 0;
      } else if (name === 'districtId') {
        options = districts;
        isDisabled = !formData.stateId || districts.length === 0;
      }

      return (
        <div className="form-group" key={name}>
          <label>
            <Icon size={18} />
            {label} {required && <span className="required">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            required={required}
            disabled={isDisabled || loading}
            className={isDisabled ? 'disabled' : ''}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option._id || option} value={option._id}>
                {option.stateName || option.districtName || option}
              </option>
            ))}
          </select>
          {isDisabled && name === 'districtId' && !formData.stateId && (
            <small className="hint">Please select a state first</small>
          )}
          {loading && <small className="hint">Loading...</small>}
        </div>
      );
    }

    if (fieldType === 'text') {
      return (
        <div className="form-group" key={name}>
          <label>
            <Icon size={18} />
            {label} {required && <span className="required">*</span>}
          </label>
          <input
            type="text"
            value={formData[name]}
            onChange={(e) => handleChange(name, e.target.value)}
            required={required}
            placeholder={placeholder}
            disabled={loading}
          />
        </div>
      );
    }

    return null;
  };

  const Icon = config.icon;

  // Check if form is valid
  const isFormValid = () => {
    if (type === 'state') {
      return formData.stateName && formData.stateName.trim() !== '';
    }
    if (type === 'district') {
      return formData.stateId && formData.districtName && formData.districtName.trim() !== '';
    }
    if (type === 'city') {
      return formData.stateId && formData.districtId && formData.cityName && formData.cityName.trim() !== '';
    }
    return false;
  };

  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark' : 'light'}`} onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Icon size={24} />
            <h3>{config.title}</h3>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {config.fields.map(field => renderField(field))}
            
            {/* Preview Section */}
            <div className="preview-section">
              <h4>Preview:</h4>
              <div className="preview-content">
                {type === 'state' && formData.stateName && (
                  <div className="preview-item">
                    <MapPin size={16} />
                    <span>Will add state: <strong>{formData.stateName}</strong></span>
                  </div>
                )}
                {type === 'district' && formData.districtName && (
                  <div className="preview-item">
                    <MapPin size={16} />
                    <span>Will add district: <strong>{formData.districtName}</strong></span>
                  </div>
                )}
                {type === 'city' && formData.cityName && (
                  <div className="preview-item">
                    <Building2 size={16} />
                    <span>Will add city: <strong>{formData.cityName}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="add-btn"
              disabled={!isFormValid() || loading}
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <Plus size={18} />
                  Add {type.charAt(0).toUpperCase() + type.slice(1)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicModal;