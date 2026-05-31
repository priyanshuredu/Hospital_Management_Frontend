import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { User, Mail, Save, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import '../styles/EditProfile.css';

const API_URL = 'http://localhost:5000';

const EditProfile = () => {
  const { isDarkMode } = useTheme();
  
  // Get token from sessionStorage
  const token = sessionStorage.getItem('Token');
  
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchError, setFetchError] = useState('');
  
  // State for profile image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [currentProfileImage, setCurrentProfileImage] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setFetchError('');
      
      const response = await axios.get(`${API_URL}/user/get-user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log("User data response:", response.data);
      
      if (response.data) {
        const user = response.data.response || response.data;
        setUserData(user);
        
        // Set profile image
        if (user.profile_image) {
          setCurrentProfileImage(user.profile_image);
          sessionStorage.setItem('ProfileImage', user.profile_image);
        }
        
        // Populate form data with user info
        setFormData({
          username: user.username || '',
          email: user.email || ''
        });
        
        // Update sessionStorage
        sessionStorage.setItem('User Name', user.username);
        sessionStorage.setItem('email', user.email);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setFetchError(error.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Handle profile data update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      // Update user profile
      const userUpdateData = {
        username: formData.username,
        email: formData.email
      };
      
      const response = await axios.put(
        `${API_URL}/user/profile-update`,
        userUpdateData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.message === "User updated successfully") {
        // Update sessionStorage with new data
        sessionStorage.setItem('User Name', formData.username);
        sessionStorage.setItem('email', formData.email);
        
        setSuccess('Username updated successfully!');
        
        // Refresh user data
        fetchUserData();
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle image selection for profile picture
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setImageError('Please select a valid image file (JPEG, PNG, JPG, GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      setImageError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for profile picture
  const handleImageUpload = async () => {
    if (!selectedImage) {
      setImageError('Please select an image first');
      return;
    }
    
    setImageUploading(true);
    setImageError('');
    
    try {
      const formDataImage = new FormData();
      formDataImage.append('image', selectedImage);
      
      const response = await axios.patch(
        `${API_URL}/user/update-profile-img`,
        formDataImage,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      );
      
      console.log("Image upload response:", response);
      
      if (response.data.message === "Profile image updated successfully.") {
        setSuccess('Profile image updated successfully!');
        
        // Update the current profile image preview
        if (imagePreview) {
          setCurrentProfileImage(imagePreview);
          sessionStorage.setItem('ProfileImage', imagePreview);
        }
        
        setIsImageModalOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
        
        // Refresh user data to get updated profile image URL
        fetchUserData();
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setImageError(response.data.message || 'Failed to upload profile image.');
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setImageError(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  // Close profile image modal
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
  };

  // Remove profile image
  const handleRemoveImage = async () => {
    setImageUploading(true);
    
    try {
      const response = await axios.delete(
        `${API_URL}/user/remove-profile-image`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      );
      
      if (response.data.message === "Profile image removed successfully") {
        setCurrentProfileImage(null);
        sessionStorage.removeItem('ProfileImage');
        setSuccess('Profile image removed successfully!');
        setIsImageModalOpen(false);
        
        fetchUserData();
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setImageError(response.data.message || 'Failed to remove profile image');
      }
    } catch (error) {
      console.error("Remove image error:", error);
      setImageError(error.response?.data?.message || 'Failed to remove image');
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className={`edit-profile-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={`edit-profile-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{fetchError}</span>
        </div>
        <button onClick={fetchUserData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className={`edit-profile-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="profile-header">
        <h1>Edit Profile</h1>
        <p>Update your profile information</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar">
              {currentProfileImage ? (
                <img 
                  src={currentProfileImage} 
                  alt="Profile" 
                  className="avatar-image"
                />
              ) : (
                <User size={48} />
              )}
            </div>
            <button 
              className="change-photo-btn"
              onClick={() => setIsImageModalOpen(true)}
            >
              <Camera size={16} />
              Change Photo
            </button>
          </div>
          
          {/* Account Status Badge */}
          {userData && (
            <div className="account-status">
              <span className={`status-badge ${userData.accountStatus}`}>
                {userData.accountStatus === 'active' ? '✓ Active Account' : '⚠️ Inactive Account'}
              </span>
              <span className={`online-status ${userData.currentStatus}`}>
                {userData.currentStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>Account Information</h3>
            
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
                disabled={updating}
                placeholder="Enter your username"
              />
              <small className="field-note">You can change your username</small>
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
                disabled={true}
                className="readonly-field"
              />
              <small className="field-note">Email cannot be changed</small>
            </div>
          </div>

          <button type="submit" className="save-btn" disabled={updating}>
            <Save size={18} />
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Modal for profile image upload */}
      {isImageModalOpen && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Profile Picture</h3>
              <button className="modal-close" onClick={closeImageModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    className="change-image-btn"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      document.getElementById('image-input').value = '';
                    }}
                  >
                    Remove Selection
                  </button>
                </div>
              ) : (
                <div className="upload-area">
                  <label htmlFor="image-input" className="upload-label">
                    <div className="upload-icon">📸</div>
                    <p>Click to select an image</p>
                    <small>JPEG, PNG, JPG, GIF (Max 5MB)</small>
                  </label>
                  <input
                    id="image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
              
              {currentProfileImage && !imagePreview && (
                <div className="current-image-section">
                  <p>Current Profile Image:</p>
                  <div className="current-image-preview">
                    <img src={currentProfileImage} alt="Current profile" />
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className="modal-error">
                  <AlertCircle size={16} />
                  <span>{imageError}</span>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {currentProfileImage && !imagePreview && (
                <button 
                  className="remove-btn" 
                  onClick={handleRemoveImage}
                  disabled={imageUploading}
                >
                  {imageUploading ? 'Removing...' : 'Remove Image'}
                </button>
              )}
              <button className="cancel-btn" onClick={closeImageModal}>
                Cancel
              </button>
              <button 
                className="upload-btn" 
                onClick={handleImageUpload}
                disabled={!selectedImage || imageUploading}
              >
                {imageUploading ? 'Uploading...' : 'Update Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;