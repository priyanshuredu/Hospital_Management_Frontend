import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';
import '../styles/EditProfile.css';

const EditProfile = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    username: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    bio: 'Hospital Administrator with 10+ years of experience'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    alert('Profile updated successfully!');
  };

  return (
    <div className={`edit-profile-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="profile-header">
        <h1>Edit Profile</h1>
        <p>Update your personal information</p>
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar">
              <User size={48} />
            </div>
            <button className="change-photo-btn">
              <Camera size={16} />
              Change Photo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>
              <User size={18} />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Phone size={18} />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <MapPin size={18} />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="save-btn">
            <Save size={18} />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;