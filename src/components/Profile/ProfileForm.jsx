import React, { useState, useEffect } from 'react';
import { useAuth } from '../../redux/hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { getUserProfile, updateUserProfile } from '../../utils/api';
import "../../styles/profile.css"

const ProfileForm = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    bio: '',
    skills: '',
    avatar: '',
  });

  // Fetch profile data on component mount
  useEffect(() => {
    if (user) {
      console.log(user)
      fetchProfileData();
    } else {
      setFetchLoading(false);
    }
  }, []);

  const fetchProfileData = async () => {
    setFetchLoading(true);
    setError(null);
    
    try {
      const response = await getUserProfile(user.email);
      if (response && response.profile) {
        setProfile(response.profile);
      } else {
        setError('No profile data found');
      }
    } catch (err) {
      setError('Failed to load profile data. Please refresh the page.');
      console.error('Error fetching profile:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!profile.email) {
        throw new Error('Email is required');
      }
      
      const response = await updateUserProfile(profile.email, profile);
      if (response && response.profile) {
        setProfile(response.profile);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchProfileData();
    setIsEditing(false);
    setError(null);
  };

  if (fetchLoading) {
    return (
      <div className="loading-container">
        <Loader size="medium" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user || !user.email) {
    return (
      <div className="error-container">
        <p>You must be logged in to view your profile.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container">
        <h2 className="section-title">Edit Profile</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <Input
              type="text"
              name="firstName"
              label="First Name"
              value={profile.firstName || ''}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="lastName"
              label="Last Name"
              value={profile.lastName || ''}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            type="email"
            name="email"
            label="Email"
            value={profile.email || ''}
            onChange={handleChange}
            required
            disabled // Email shouldn't be editable as it's used for authentication
          />
          <Input
            type="tel"
            name="phone"
            label="Phone"
            value={profile.phone || ''}
            onChange={handleChange}
          />
          <div className="form-row">
            <Input
              type="text"
              name="position"
              label="Position"
              value={profile.position || ''}
              onChange={handleChange}
            />
            <Input
              type="text"
              name="department"
              label="Department"
              value={profile.department || ''}
              onChange={handleChange}
            />
          </div>
          <Input
            type="text"
            name="skills"
            label="Skills (comma separated)"
            value={profile.skills || ''}
            onChange={handleChange}
            placeholder="React, JavaScript, CSS..."
          />
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio || ''}
              onChange={handleChange}
              className="form-control"
              placeholder="Write a short bio about yourself..."
              rows="5"
              cols="100"
              
            ></textarea>
          </div>
          <Input
            type="text"
            name="avatar"
            label="Avatar URL"
            value={profile.avatar || ''}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
          />
          <div className="button-group">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader size="small" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      <div className="profile-header">
        <h2 className="section-title">Profile</h2>
        <div>
          <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
        </div>
       
      </div>
      
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="avatar-container">
            <img 
              src={profile.avatar || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="avatar" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          </div>
          <h3 className="profile-name">{profile.firstName || ''} {profile.lastName || ''}</h3>
          <p className="profile-title">{profile.position || 'No position specified'}</p>
          <p className="profile-department">{profile.department || 'No department specified'}</p>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h4 className="detail-title">Contact Information</h4>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{profile.email || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{profile.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-title">Bio</h4>
            <p className="bio-text">{profile.bio || 'No bio provided.'}</p>
          </div>

          <div className="detail-section">
            <h4 className="detail-title">Skills</h4>
            {profile.skills ? (
              <div className="skills-container">
                {profile.skills.split(',').map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-data">No skills listed</p>
            )}
          </div>
        </div>
      </div>
    

    </div>
  );
};

export default ProfileForm;