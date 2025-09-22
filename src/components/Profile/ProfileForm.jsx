import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../redux/hooks/useAuth";
import Input from "../common/Input";
import Button from "../common/Button";
import Loader from "../common/Loader";
import "../../styles/profile.css";
import Toast from "../common/Toast";
import api from "../../utils/api_call";

const ProfileForm = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    bio: "",
    avatar: "",
  });
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To trigger refresh without dependency loop
  const token = localStorage.getItem("access_token");


  const getAvatarUrl = (url) => {
    if (!url) return "https://randomuser.me/api/portraits/men/1.jpg";
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url || "https://randomuser.me/api/portraits/men/1.jpg";
  };
  const fetchProfileData = useCallback(async () => {
    if (!user?.employee?.id) {
      setFetchLoading(false);
      return;
    }
    
    setFetchLoading(true);
    setError(null);

    try {
      const endpoint = `/employees/${user.employee.id}`;

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
        throw new Error(`Failed to fetch employee data`);
      }
      
      const employeeData = response.data.data;
      
      setProfile({
        firstName: employeeData.firstName || "",
        lastName: employeeData.lastName || "",
        middleName: employeeData.midName || "",
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        position: employeeData.jobTitle || "",
        department: employeeData.department || "",
        bio: employeeData.bio || "",
        avatar: employeeData.avatar || "",
      });
      
      // Only show toast for manual refreshes, not initial load
      if (refreshTrigger > 0) {
        setToastMessage(`Profile data refreshed successfully`);
        setToastOpen(true);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch employee data";
      setToastMessage(errorMsg);
      setToastOpen(true);
      setError(errorMsg);
    } finally {
      setFetchLoading(false);
    }
  }, [user, token, refreshTrigger]); // Removed fetchLoading from dependencies

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = `/employees/${user.employee.id}`;
      const payload = {
        firstName: profile.firstName,
        midName: profile.middleName, // Note: API expects 'midName' but state uses 'middleName'
        lastName: profile.lastName,
        bio: profile.bio,
        avatar: profile.avatar,
        phone: profile.phone,
      };

      const response = await api.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.statusCode !== 200 && response.data.statusCode !== 201) {
        throw new Error(`Failed to update profile`);
      }

      // Trigger a refresh instead of directly calling fetchProfileData
      setRefreshTrigger(prev => prev + 1);
      setIsEditing(false);

      setToastMessage(`Profile updated successfully`);
      setToastOpen(true);
    } catch (err) {
      const errorMsg = err.message || "Failed to save profile data";
      setToastMessage(errorMsg);
      setToastOpen(true);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Use the refresh trigger to avoid direct calls
    if (isEditing) {
      setRefreshTrigger(prev => prev + 1);
    }
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
              value={profile.firstName || ""}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="lastName"
              label="Last Name"
              value={profile.lastName || ""}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            type="text"
            name="middleName"
            label="Middle Name"
            value={profile.middleName || ""}
            onChange={handleChange}
          />
          <Input
            type="email"
            name="email"
            label="Email"
            value={profile.email || ""}
            readOnly
            disabled={true}
          />
          <Input
            type="tel"
            name="phone"
            label="Phone"
            value={profile.phone || ""}
            onChange={handleChange}
          />
          <div className="form-row">
            <Input
              type="text"
              name="position"
              label="Position"
              value={profile.position || ""}
              readOnly
              disabled
            />
            <Input
              type="text"
              name="department"
              label="Department"
              value={profile.department || ""}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio || ""}
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
            value={profile.avatar || ""}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
          />
          <div className="button-group">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader size="small" /> : "Save Changes"}
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
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="avatar-container">
            <img
              src={getAvatarUrl(profile.avatar)}
              alt="Profile"
              className="avatar"
              onError={(e) => {
                console.log(e);
                
                e.target.onerror = null;
                e.target.src = "https://randomuser.me/api/portraits/men/1.jpg";
              }}
            />
          </div>
          <h3 className="profile-name">
            {profile.firstName || ""} {profile.lastName || ""}
          </h3>
          <p className="profile-title">
            {profile.position || "No position specified"}
          </p>
          <p className="profile-department">
            {profile.department || "No department specified"}
          </p>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h4 className="detail-title">Contact Information</h4>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">
                {profile.email || "Not provided"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">
                {profile.phone || "Not provided"}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-title">Bio</h4>
            <p className="bio-text">{profile.bio || "No bio provided."}</p>
          </div>
        </div>
      </div>
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastMessage.includes("failed") ? "error" : "success"}
        onClose={() => setToastOpen(false)}
        autoHideDuration={5000}
      />
    </div>
  );
};

export default ProfileForm;