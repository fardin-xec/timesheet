import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../redux/hooks/useAuth";
import Input from "../common/Input";
import Button from "../common/Button";
import Loader from "../common/Loader";
import "../../styles/profile.css";
import Toast from "../common/Toast";
import api from "../../utils/api_call";
import ReactCountryFlag from "react-country-flag";

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
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const token = localStorage.getItem("access_token");

  // Country codes with flags - useMemo to prevent recreation on every render
  const countryCodes = React.useMemo(
    () => [
      { code: "US", dialCode: "+1", flag: "🇺🇸", name: "United States" },
      { code: "IN", dialCode: "+91", flag: "🇮🇳", name: "India" },
      { code: "GB", dialCode: "+44", flag: "🇬🇧", name: "United Kingdom" },
      { code: "CA", dialCode: "+1", flag: "🇨🇦", name: "Canada" },
      { code: "AU", dialCode: "+61", flag: "🇦🇺", name: "Australia" },
      { code: "DE", dialCode: "+49", flag: "🇩🇪", name: "Germany" },
      { code: "FR", dialCode: "+33", flag: "🇫🇷", name: "France" },
      { code: "JP", dialCode: "+81", flag: "🇯🇵", name: "Japan" },
      { code: "CN", dialCode: "+86", flag: "🇨🇳", name: "China" },
      { code: "BR", dialCode: "+55", flag: "🇧🇷", name: "Brazil" },
      { code: "MX", dialCode: "+52", flag: "🇲🇽", name: "Mexico" },
      { code: "IT", dialCode: "+39", flag: "🇮🇹", name: "Italy" },
      { code: "ES", dialCode: "+34", flag: "🇪🇸", name: "Spain" },
      { code: "NL", dialCode: "+31", flag: "🇳🇱", name: "Netherlands" },
      { code: "SE", dialCode: "+46", flag: "🇸🇪", name: "Sweden" },
      { code: "CH", dialCode: "+41", flag: "🇨🇭", name: "Switzerland" },
      { code: "SG", dialCode: "+65", flag: "🇸🇬", name: "Singapore" },
      { code: "AE", dialCode: "+971", flag: "🇦🇪", name: "UAE" },
      { code: "SA", dialCode: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
      { code: "ZA", dialCode: "+27", flag: "🇿🇦", name: "South Africa" },
    ],
    []
  );

  // Parse phone number to extract country code
  const parsePhoneNumber = useCallback((phone) => {
    if (!phone) return { countryCode: "IN", number: "" };

    const trimmedPhone = phone.trim();
    for (const country of countryCodes) {
      if (trimmedPhone.startsWith(country.dialCode)) {
        return {
          countryCode: country.code,
          number: trimmedPhone.substring(country.dialCode.length).trim(),
        };
      }
    }
    return { countryCode: "IN", number: trimmedPhone };
  }, [countryCodes]);

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name || name.trim() === "") {
      return `${fieldName} is required`;
    }
    if (name.trim().length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (name.trim().length > 50) {
      return `${fieldName} must not exceed 50 characters`;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") {
      return ""; // Phone is optional
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (digitsOnly.length > 15) {
      return "Phone number must not exceed 15 digits";
    }
    if (!/^[\d\s\-+()]+$/.test(phone)) {
      return "Phone number contains invalid characters";
    }
    return "";
  };

  const validateBio = (bio) => {
    if (!bio || bio.trim() === "") {
      return ""; // Bio is optional
    }
    if (bio.trim().length < 10) {
      return "Bio must be at least 10 characters if provided";
    }
    if (bio.trim().length > 500) {
      return "Bio must not exceed 500 characters";
    }
    const specialCharCount = (bio.match(/[^a-zA-Z0-9\s.,!?'-]/g) || []).length;
    if (specialCharCount > bio.length * 0.3) {
      return "Bio contains too many special characters";
    }
    if (/(.)\1{9,}/.test(bio)) {
      return "Bio contains excessive repeated characters";
    }
    return "";
  };

  const validateAvatarFile = (file) => {
    if (!file) return "";

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      return "Please upload a valid image file (JPG, PNG, GIF, or WebP)";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Image size must not exceed 5MB";
    }

    return "";
  };

  const validateForm = () => {
    const errors = {};

    const firstNameError = validateName(profile.firstName, "First name");
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(profile.lastName, "Last name");
    if (lastNameError) errors.lastName = lastNameError;

    if (profile.middleName && profile.middleName.trim() !== "") {
      const middleNameError = validateName(profile.middleName, "Middle name");
      if (middleNameError) errors.middleName = middleNameError;
    }

    const phoneError = validatePhone(profile.phone);
    if (phoneError) errors.phone = phoneError;

    const bioError = validateBio(profile.bio);
    if (bioError) errors.bio = bioError;

    // Validate avatar file if selected
    if (selectedFile) {
      const fileError = validateAvatarFile(selectedFile);
      if (fileError) errors.avatarFile = fileError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
        error = validateName(value, "First name");
        break;
      case "lastName":
        error = validateName(value, "Last name");
        break;
      case "middleName":
        if (value && value.trim() !== "") {
          error = validateName(value, "Middle name");
        }
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "bio":
        error = validateBio(value);
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const getAvatarUrl = (url) => {
    if (!url) return "https://randomuser.me/api/portraits/men/1.jpg";

    // If it's a base64 data URI, return as is
    if (url.startsWith("data:image/")) {
      return url;
    }

    // If it's a relative path from server (e.g., "/uploads/avatars/image.jpg")
    if (url.startsWith("/")) {
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
      return `${apiBaseUrl}${url}`;
    }

    // If it's a filename only (e.g., "avatar-123456.jpg")
    if (!url.startsWith("http") && !url.includes("/")) {
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
      return `${apiBaseUrl}/uploads/avatars/${url}`;
    }

    // Handle Google Drive links
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // If it's already a full URL, return as is
    return url || "https://randomuser.me/api/portraits/men/1.jpg";
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Return the full base64 string including the data URI scheme
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
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

      if (
        response.data.statusCode !== 200 &&
        response.data.statusCode !== 201
      ) {
        throw new Error(`Failed to fetch employee data`);
      }

      const employeeData = response.data.data;

      // Parse phone number to set country code
      const phoneData = parsePhoneNumber(employeeData.phone);
      setSelectedCountry(phoneData.countryCode);

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

      setValidationErrors({});

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
  }, [user, token, refreshTrigger, parsePhoneNumber]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));

    validateField(name, value);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const selectedCountryData = countryCodes.find(
      (c) => c.code === selectedCountry
    );
    const fullPhone = selectedCountryData.dialCode + " " + value;

    setProfile((prevProfile) => ({ ...prevProfile, phone: fullPhone }));
    validateField("phone", fullPhone);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file
    const fileError = validateAvatarFile(file);
    if (fileError) {
      setValidationErrors((prev) => ({ ...prev, avatarFile: fileError }));
      setToastMessage(fileError);
      setToastOpen(true);
      e.target.value = null; // Reset file input
      return;
    }

    // Clear any previous errors
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.avatarFile;
      delete newErrors.avatar;
      return newErrors;
    });

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    // Reset file input
    const fileInput = document.getElementById('avatarFile');
    if (fileInput) fileInput.value = '';
    
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.avatarFile;
      return newErrors;
    });
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    setShowCountryDropdown(false);

    // Update phone with new country code
    const phoneData = parsePhoneNumber(profile.phone);
    const newCountryData = countryCodes.find((c) => c.code === countryCode);
    const newPhone = newCountryData.dialCode + " " + phoneData.number;

    setProfile((prevProfile) => ({ ...prevProfile, phone: newPhone }));
    validateField("phone", newPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToastMessage("Please fix all validation errors before submitting");
      setToastOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = `/employees/${user.employee.id}`;

      // Prepare payload
      const payload = {
        firstName: profile.firstName.trim(),
        midName: profile.middleName.trim(),
        lastName: profile.lastName.trim(),
        bio: profile.bio.trim(),
        phone: profile.phone.trim(),
      };

      // Handle avatar upload
      if (selectedFile) {
        try {
          const base64Image = await convertFileToBase64(selectedFile);
          // Send complete base64 string with data URI
          payload.avatar = base64Image;
        } catch (error) {
          console.error("Image conversion error:", error);
          throw new Error("Failed to process image file");
        }
      } else if (profile.avatar && profile.avatar.trim()) {
        // Keep existing avatar if no new file selected
        payload.avatar = profile.avatar.trim();
      } else {
        // If no avatar at all, send empty string
        payload.avatar = "";
      }

      const response = await api.put(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        response.data.statusCode !== 200 &&
        response.data.statusCode !== 201
      ) {
        throw new Error(response.data.message || `Failed to update profile`);
      }

      // Clear file selection after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
      const fileInput = document.getElementById('avatarFile');
      if (fileInput) fileInput.value = '';

      setRefreshTrigger((prev) => prev + 1);
      setIsEditing(false);
      setValidationErrors({});

      setToastMessage(`Profile updated successfully`);
      setToastOpen(true);
    } catch (err) {
      console.error("Profile update error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to save profile data";
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
    setValidationErrors({});
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('avatarFile');
    if (fileInput) fileInput.value = '';
    
    if (isEditing) {
      setRefreshTrigger((prev) => prev + 1);
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

  const selectedCountryData = countryCodes.find(
    (c) => c.code === selectedCountry
  );
  const phoneData = parsePhoneNumber(profile.phone);

  if (isEditing) {
    return (
      <div className="container">
        <h2 className="section-title">Edit Profile</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                name="firstName"
                label="First Name"
                value={profile.firstName || ""}
                onChange={handleChange}
                required
              />
              {validationErrors.firstName && (
                <span
                  className="validation-error"
                  style={{
                    color: "red",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  {validationErrors.firstName}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                name="lastName"
                label="Last Name"
                value={profile.lastName || ""}
                onChange={handleChange}
                required
              />
              {validationErrors.lastName && (
                <span
                  className="validation-error"
                  style={{
                    color: "red",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  {validationErrors.lastName}
                </span>
              )}
            </div>
          </div>
          <div>
            <Input
              type="text"
              name="middleName"
              label="Middle Name"
              value={profile.middleName || ""}
              onChange={handleChange}
            />
            {validationErrors.middleName && (
              <span
                className="validation-error"
                style={{
                  color: "red",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {validationErrors.middleName}
              </span>
            )}
          </div>
          <Input
            type="email"
            name="email"
            label="Email"
            value={profile.email || ""}
            readOnly
            disabled={true}
          />

          {/* Phone Number with Country Code */}
          <div>
            <label
              htmlFor="phone"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Phone Number
            </label>
            <div
              style={{ display: "flex", gap: "0.5rem", position: "relative" }}
            >
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "1rem",
                    minWidth: "120px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    <ReactCountryFlag
                      countryCode={selectedCountryData.code}
                      svg
                      style={{ width: "1.5em", height: "1.5em" }}
                    />
                  </span>
                  <span>{selectedCountryData.dialCode}</span>
                  <span style={{ marginLeft: "auto" }}>▼</span>
                </button>

                {showCountryDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "0.25rem",
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxHeight: "300px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      minWidth: "250px",
                    }}
                  >
                    {countryCodes.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => handleCountrySelect(country.code)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          cursor: "pointer",
                          backgroundColor:
                            country.code === selectedCountry
                              ? "#f0f0f0"
                              : "white",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f0f0f0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            country.code === selectedCountry
                              ? "#f0f0f0"
                              : "white")
                        }
                      >
                        <span style={{ fontSize: "1.5rem" }}>
                          <ReactCountryFlag
                            countryCode={country.code}
                            svg
                            style={{ width: "1.5em", height: "1.5em" }}
                          />
                        </span>
                        <span style={{ flex: 1 }}>{country.name}</span>
                        <span style={{ color: "#666" }}>
                          {country.dialCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="tel"
                value={phoneData.number}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem",
                }}
              />
            </div>
            {validationErrors.phone && (
              <span
                className="validation-error"
                style={{
                  color: "red",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {validationErrors.phone}
              </span>
            )}
          </div>

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
            <label htmlFor="bio">
              Bio {profile.bio && `(${profile.bio.length}/500 characters)`}
            </label>
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
            {validationErrors.bio && (
              <span
                className="validation-error"
                style={{
                  color: "red",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {validationErrors.bio}
              </span>
            )}
          </div>

          {/* Avatar Upload Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Profile Picture
            </label>

            <div
              style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
            >
              {/* Preview */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "2px solid #e0e0e0",
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={previewUrl || getAvatarUrl(profile.avatar)}
                  alt="Profile Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://randomuser.me/api/portraits/men/1.jpg";
                  }}
                />
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <input
                    type="file"
                    id="avatarFile"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="avatarFile"
                    style={{
                      display: "inline-block",
                      padding: "0.5rem 1rem",
                      backgroundColor: "#007bff",
                      color: "white",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Choose File
                  </label>
                  {selectedFile && (
                    <span
                      style={{
                        marginLeft: "1rem",
                        fontSize: "0.875rem",
                        color: "#666",
                      }}
                    >
                      {selectedFile.name}
                    </span>
                  )}
                </div>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Remove File
                  </button>
                )}

                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                </p>

                {validationErrors.avatarFile && (
                  <span
                    className="validation-error"
                    style={{
                      color: "red",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                      display: "block",
                    }}
                  >
                    {validationErrors.avatarFile}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="button-group">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                Object.keys(validationErrors).some(
                  (key) => validationErrors[key]
                )
              }
            >
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
        severity={
          toastMessage.includes("failed") || toastMessage.includes("fix")
            ? "error"
            : "success"
        }
        onClose={() => setToastOpen(false)}
        autoHideDuration={5000}
      />
    </div>
  );
};

export default ProfileForm;