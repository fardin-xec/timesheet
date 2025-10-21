import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../redux/hooks/useAuth";
import Input from "../common/Input";
import Button from "../common/Button";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import { personalInfoAPI } from "../../utils/api";
import "../../styles/profile.css";
import ReactCountryFlag from "react-country-flag";
import { Dialog, IconButton } from "@mui/material";

import { Eye, Trash } from "lucide-react";

const ProfileForm = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [personalEditing, setPersonalEditing] = useState(false);
  const [bankEditing, setBankEditing] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const BASE_URL = "http://localhost:3000";

  const handlePreviewDocument = (path) => {
    const url = `${BASE_URL}/${path.replace(/^\/+/, "")}`;
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  // Combined Personal Information State (Profile + Details)
  const [personalInfo, setPersonalInfo] = useState({
    // Profile fields
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    bio: "",
    avatar: "",
    // Details fields
    residentialAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    maritalStatus: "single",
    nationality: "",
  });
  const [personalErrors, setPersonalErrors] = useState({});

  // Bank Information State
  const [bankInfo, setBankInfo] = useState({
    accountHolderName: "",
    bankName: "",
    city: "",
    branchName: "",
    ifscCode: "",
    accountNumber: "",
  });
  const [bankErrors, setBankErrors] = useState({});

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("AADHAR_CARD");

  // Avatar Upload State
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);

  // Phone & Country Code State
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Emergency Contact Phone Country Code State
  const [emergencyCountry, setEmergencyCountry] = useState("IN");
  const [showEmergencyCountryDropdown, setShowEmergencyCountryDropdown] =
    useState(false);

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
    ],
    []
  );

  const documentTypes = [
    { value: "AADHAR_CARD", label: "Aadhar Card" },
    { value: "PAN_CARD", label: "PAN Card" },
    { value: "PASSPORT", label: "Passport" },
    { value: "CERTIFICATE", label: "Certificate" },
    { value: "OTHER", label: "Others" },
  ];

  const maritalStatuses = ["single", "married", "divorced", "widowed"];
  const supportedFileFormats = ["PDF", "JPG", "PNG", "DOCX"];

  const nationalities = [
    "Indian",
    "American",
    "British",
    "Canadian",
    "Australian",
    "German",
    "French",
    "Japanese",
    "Chinese",
    "Brazilian",
    "Other",
  ];

  // Parse phone number to extract country code
  const parsePhoneNumber = useCallback(
    (phone) => {
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
    },
    [countryCodes]
  );

  // Validation Functions
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
      return "Phone number is required";
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (digitsOnly.length > 15) {
      return "Phone number must not exceed 15 digits";
    }
    return "";
  };

  const validateBio = (bio) => {
    if (!bio || bio.trim() === "") {
      return "";
    }
    if (bio.trim().length < 10) {
      return "Bio must be at least 10 characters if provided";
    }
    if (bio.trim().length > 500) {
      return "Bio must not exceed 500 characters";
    }
    return "";
  };

  const validateAddress = (address) => {
    if (!address || address.trim() === "") {
      return "Residential address is required";
    }
    if (address.trim().length < 10) {
      return "Address must be at least 10 characters";
    }
    if (address.trim().length > 200) {
      return "Address must not exceed 200 characters";
    }
    return "";
  };

  const validateIfscCode = (code) => {
    if (!code || code.trim() === "") {
      return "IFSC Code is required";
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code.toUpperCase())) {
      return "IFSC Code format is invalid (e.g., SBIN0001234)";
    }
    return "";
  };

  const validateAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.trim() === "") {
      return "Account Number is required";
    }
    if (!/^\d{9,18}$/.test(accountNumber)) {
      return "Account Number must be between 9 and 18 digits";
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
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return "Image size must not exceed 10MB";
    }
    return "";
  };

  const validateFile = (file) => {
    if (!file) return "Please select a file";
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      return "File format not supported. Please use PDF, JPG, PNG, or DOCX";
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must not exceed 5MB";
    }
    return "";
  };

  const getAvatarUrl = (url) => {
    if (!url) return "https://randomuser.me/api/portraits/men/1.jpg";
    if (url.startsWith("data:image/")) return url;
    if (url.startsWith("/")) {
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
      return `${apiBaseUrl}${url}`;
    }
    if (!url.startsWith("http") && !url.includes("/")) {
      const apiBaseUrl =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
      return `${apiBaseUrl}/uploads/avatars/${url}`;
    }
    return url || "https://randomuser.me/api/portraits/men/1.jpg";
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Fetch Data
  const fetchPersonalData = useCallback(async () => {
    if (!user?.employee?.id) {
      setFetchLoading(false);
      return;
    }

    setFetchLoading(true);
    try {
      const profileData = await personalInfoAPI.getPersonalInfo(
        user.employee.id
      );
      const phoneData = parsePhoneNumber(profileData.phone);
      setSelectedCountry(phoneData.countryCode);

      setPersonalInfo({
        // Profile fields
        firstName: profileData.employee.firstName || "",
        lastName: profileData.employee.lastName || "",
        middleName: profileData.employee.midName || "",
        email: profileData.employee.email || "",
        phone: profileData.employee.phone || "",
        position: profileData.employee.jobTitle || "",
        department: profileData.employee.department || "",
        bio: profileData.employee.bio || "",
        avatar: profileData.employee.avatar || "",
        // Details fields
        residentialAddress: profileData.permanentAddress || "",
        emergencyContactName: profileData.emergencyContactName || "",
        emergencyContactPhone: profileData.emergencyContactPhone || "",
        maritalStatus: profileData.maritalStatus,
        nationality: profileData.nationality || "",
      });

      const bankData = await personalInfoAPI.getBankInfo(user.employee.id);

      setBankInfo({
        accountHolderName: bankData.accountHolderName || "",
        bankName: bankData.bankName || "",
        city: bankData.city || "",
        branchName: bankData.branchName || "",
        ifscCode: bankData.ifscCode || "",
        accountNumber: bankData.accountNo || "",
      });

      const docsData = await personalInfoAPI.getDocuments(user.employee.id);
      setDocuments(docsData || []);
    } catch (err) {
      showToast(err.message || "Failed to fetch data", "error");
    } finally {
      setFetchLoading(false);
    }
  }, [user, parsePhoneNumber]);

  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  // Handlers
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    if (personalErrors[name]) {
      setPersonalErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const selectedCountryData = countryCodes.find(
      (c) => c.code === selectedCountry
    );
    const fullPhone = selectedCountryData.dialCode + " " + value;
    setPersonalInfo((prev) => ({ ...prev, phone: fullPhone }));
    if (personalErrors.phone) {
      setPersonalErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    setShowCountryDropdown(false);
    const phoneData = parsePhoneNumber(personalInfo.phone);
    const newCountryData = countryCodes.find((c) => c.code === countryCode);
    const newPhone = newCountryData.dialCode + " " + phoneData.number;
    setPersonalInfo((prev) => ({ ...prev, phone: newPhone }));
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateAvatarFile(file);
      if (error) {
        showToast(error, "error");
        return;
      }
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatarFile = () => {
    setSelectedAvatarFile(null);
    setPreviewAvatarUrl(null);
    const fileInput = document.getElementById("avatarFile");
    if (fileInput) fileInput.value = "";
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [name]: value }));
    if (bankErrors[name]) {
      setBankErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        showToast(error, "error");
        return;
      }
      setSelectedFile(file);
    }
  };

  const showToast = (message, severity = "success") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleSavePersonalInfo = async () => {
    const errors = {};

    // Profile validations
    const firstNameError = validateName(personalInfo.firstName, "First name");
    if (firstNameError) errors.firstName = firstNameError;
    const lastNameError = validateName(personalInfo.lastName, "Last name");
    if (lastNameError) errors.lastName = lastNameError;
    if (personalInfo.middleName && personalInfo.middleName.trim() !== "") {
      const middleNameError = validateName(
        personalInfo.middleName,
        "Middle name"
      );
      if (middleNameError) errors.middleName = middleNameError;
    }
    const phoneError = validatePhone(personalInfo.phone);
    if (phoneError) errors.phone = phoneError;
    const bioError = validateBio(personalInfo.bio);
    if (bioError) errors.bio = bioError;

    // Details validations
    const addressError = validateAddress(personalInfo.residentialAddress);
    if (addressError) errors.residentialAddress = addressError;
    const emergencyNameError = validateName(
      personalInfo.emergencyContactName,
      "Emergency contact name"
    );
    if (emergencyNameError) errors.emergencyContactName = emergencyNameError;
    const emergencyPhoneError = validatePhone(
      personalInfo.emergencyContactPhone
    );
    if (emergencyPhoneError) errors.emergencyContactPhone = emergencyPhoneError;
    const nationalityError = validateName(
      personalInfo.nationality,
      "Nationality"
    );
    if (nationalityError) errors.nationality = nationalityError;

    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      showToast("Please fix all validation errors", "error");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        // Profile fields
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        middleName: personalInfo.middleName.trim(),
        phone: personalInfo.phone.trim(),
        bio: personalInfo.bio.trim(),
        // Details fields
        residentialAddress: personalInfo.residentialAddress.trim(),
        emergencyContactName: personalInfo.emergencyContactName.trim(),
        emergencyContactPhone: personalInfo.emergencyContactPhone.trim(),
        maritalStatus: personalInfo.maritalStatus,
        nationality: personalInfo.nationality.trim(),
      };
      console.log(selectedAvatarFile);

      if (selectedAvatarFile) {
        const base64Image = await convertFileToBase64(selectedAvatarFile);
        const data = await personalInfoAPI.updatePersonalPic(
          user.employee.id,
          base64Image
        );
        showToast("Profile Pic updated successfully");
        personalInfo.avatar = data.avatar;
      } else if (personalInfo.avatar && personalInfo.avatar.trim()) {
        updateData.avatar = personalInfo.avatar.trim();
      } else {
        updateData.avatar = "";
      }

      await personalInfoAPI.updatePersonalInfo(user.employee.id, updateData);
      showToast("Personal information updated successfully");
      setPersonalEditing(false);
      setSelectedAvatarFile(null);
      setPreviewAvatarUrl(null);
    } catch (err) {
      showToast(
        err.message || "Failed to update personal information",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async () => {
    const errors = {};
    const holderError = validateName(
      bankInfo.accountHolderName,
      "Account holder name"
    );
    if (holderError) errors.accountHolderName = holderError;
    const bankError = validateName(bankInfo.bankName, "Bank name");
    if (bankError) errors.bankName = bankError;
    const cityError = validateName(bankInfo.city, "City");
    if (cityError) errors.city = cityError;
    const branchError = validateName(bankInfo.branchName, "Branch name");
    if (branchError) errors.branchName = branchError;
    const ifscError = validateIfscCode(bankInfo.ifscCode);
    if (ifscError) errors.ifscCode = ifscError;
    const accountError = validateAccountNumber(bankInfo.accountNumber);
    if (accountError) errors.accountNumber = accountError;

    if (Object.keys(errors).length > 0) {
      setBankErrors(errors);
      showToast("Please fix all validation errors", "error");
      return;
    }

    setLoading(true);
    try {
      await personalInfoAPI.updateBankInfo(user.employee.id, bankInfo);
      showToast("Bank information updated successfully");
      setBankEditing(false);
    } catch (err) {
      showToast(err.message || "Failed to update bank information", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      showToast("Please select a file", "error");
      return;
    }

    setLoading(true);
    try {
      await personalInfoAPI.uploadDocument(
        user.employee.id,
        selectedFile,
        documentType
      );
      showToast("Document uploaded successfully");
      setSelectedFile(null);
      setDocumentType("AADHAR_CARD");
      const fileInput = document.getElementById("documentFile");
      if (fileInput) fileInput.value = "";
      const docsData = await personalInfoAPI.getDocuments(user.employee.id);
      setDocuments(docsData);
    } catch (err) {
      showToast(err.message || "Failed to upload document", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await personalInfoAPI.deleteDocument(user.employee.id, docId);
      showToast("Document deleted successfully");
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      showToast(err.message || "Failed to delete document", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="pi-loading-container">
        <Loader size="medium" />
        <p>Loading personal information...</p>
      </div>
    );
  }

  const selectedCountryData = countryCodes.find(
    (c) => c.code === selectedCountry
  );
  const phoneData = parsePhoneNumber(personalInfo.phone);

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="pi-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2
        className="pi-section-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Personal Information
      </motion.h2>

      {/* Tab Navigation */}
      <motion.div
        className="pi-tabs"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { id: "personal", label: "Personal Information" },
          { id: "bank", label: "Bank Information" },
          { id: "documents", label: "Documents" },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            className={`pi-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Personal Information Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "personal" && (
          <motion.div
            className="pi-tab-content"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="personal-tab"
          >
            <motion.div
              className="pi-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="pi-section-header">
                <h3 className="pi-subsection-title">Personal Information</h3>
                {!personalEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPersonalEditing(true)}
                    className="pi-edit-btn"
                  >
                    Edit
                  </motion.button>
                )}
              </div>

              {!personalEditing ? (
                <motion.div
                  className="pi-info-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Profile Information Display */}
                  <div className="pi-info-card">
                    <div className="pi-avatar-container">
                      <img
                        src={getAvatarUrl(personalInfo.avatar)}
                        alt="Profile"
                        className="pi-avatar"
                      />
                    </div>
                  </div>
                  <div className="pi-info-details">
                    <motion.div className="pi-info-row" variants={itemVariants}>
                      <span className="pi-label">Name:</span>
                      <span className="pi-value">
                        {personalInfo.firstName} {personalInfo.lastName}
                      </span>
                    </motion.div>
                    <motion.div className="pi-info-row" variants={itemVariants}>
                      <span className="pi-label">Email:</span>
                      <span className="pi-value">{personalInfo.email}</span>
                    </motion.div>
                    <motion.div className="pi-info-row" variants={itemVariants}>
                      <span className="pi-label">Phone:</span>
                      <span className="pi-value">{personalInfo.phone}</span>
                    </motion.div>
                    <motion.div className="pi-info-row" variants={itemVariants}>
                      <span className="pi-label">Position:</span>
                      <span className="pi-value">
                        {personalInfo.position || "Not specified"}
                      </span>
                    </motion.div>
                    <motion.div className="pi-info-row" variants={itemVariants}>
                      <span className="pi-label">Bio:</span>
                      <span className="pi-value">
                        {personalInfo.bio || "Not provided"}
                      </span>
                    </motion.div>
                  </div>

                  {/* Personal Details Display */}
                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">Residential Address:</span>
                      <span className="pi-value">
                        {personalInfo.residentialAddress || "Not provided"}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">Emergency Contact Name:</span>
                      <span className="pi-value">
                        {personalInfo.emergencyContactName || "Not provided"}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">Emergency Contact Phone:</span>
                      <span className="pi-value">
                        {personalInfo.emergencyContactPhone || "Not provided"}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">Marital Status:</span>
                      <span className="pi-value">
                        {personalInfo.maritalStatus || "Not provided"}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">Nationality:</span>
                      <span className="pi-value">
                        {personalInfo.nationality || "Not provided"}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="pi-form"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Avatar Upload */}
                  <motion.div
                    className="pi-avatar-upload-section"
                    variants={itemVariants}
                  >
                    <label>Profile Picture</label>
                    <div className="pi-avatar-upload">
                      <div className="pi-avatar-preview">
                        <img
                          src={
                            previewAvatarUrl ||
                            getAvatarUrl(personalInfo.avatar)
                          }
                          alt="Preview"
                        />
                      </div>
                      <div className="pi-avatar-upload-controls">
                        <input
                          type="file"
                          id="avatarFile"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleAvatarFileChange}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="avatarFile" className="pi-file-label">
                          Choose File
                        </label>
                        {selectedAvatarFile && (
                          <>
                            <p className="pi-file-name">
                              {selectedAvatarFile.name}
                            </p>
                            <button
                              type="button"
                              onClick={handleRemoveAvatarFile}
                              className="pi-remove-btn"
                            >
                              Remove
                            </button>
                          </>
                        )}
                        <p className="pi-help-text">
                          JPG, PNG, GIF, WebP (Max 10MB)
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Profile Fields */}
                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>First Name *</label>
                      <Input
                        name="firstName"
                        type="text"
                        value={personalInfo.firstName}
                        onChange={handlePersonalChange}
                      />
                      {personalErrors.firstName && (
                        <span className="pi-error">
                          {personalErrors.firstName}
                        </span>
                      )}
                    </motion.div>
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Last Name *</label>
                      <Input
                        name="lastName"
                        type="text"
                        value={personalInfo.lastName}
                        onChange={handlePersonalChange}
                      />
                      {personalErrors.lastName && (
                        <span className="pi-error">
                          {personalErrors.lastName}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Middle Name</label>
                    <Input
                      name="middleName"
                      type="text"
                      value={personalInfo.middleName}
                      onChange={handlePersonalChange}
                    />
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Email</label>
                    <Input
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      disabled
                    />
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Phone Number *</label>
                    <div className="pi-phone-group">
                      <div className="pi-country-selector">
                        <button
                          type="button"
                          onClick={() =>
                            setShowCountryDropdown(!showCountryDropdown)
                          }
                          className="pi-country-btn"
                        >
                          <ReactCountryFlag
                            countryCode={selectedCountryData.code}
                            svg
                            style={{ width: "1.5em", height: "1.5em" }}
                          />
                          <span>{selectedCountryData.dialCode}</span>
                        </button>
                        {showCountryDropdown && (
                          <motion.div
                            className="pi-country-dropdown"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {countryCodes.map((country) => (
                              <motion.div
                                key={country.code}
                                onClick={() =>
                                  handleCountrySelect(country.code)
                                }
                                className={`pi-country-option ${
                                  country.code === selectedCountry
                                    ? "active"
                                    : ""
                                }`}
                                whileHover={{ backgroundColor: "#f0f0f0" }}
                              >
                                <ReactCountryFlag
                                  countryCode={country.code}
                                  svg
                                  style={{ width: "1.5em", height: "1.5em" }}
                                />
                                <span>{country.name}</span>
                                <span>{country.dialCode}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                      <input
                        type="tel"
                        value={phoneData.number}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        className="pi-phone-input"
                      />
                    </div>
                    {personalErrors.phone && (
                      <span className="pi-error">{personalErrors.phone}</span>
                    )}
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Position</label>
                    <Input
                      name="position"
                      type="text"
                      value={personalInfo.position}
                      disabled
                    />
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={personalInfo.bio}
                      onChange={handlePersonalChange}
                      className="pi-textarea"
                      placeholder="Write a short bio about yourself..."
                      rows={4}
                    />
                    {personalErrors.bio && (
                      <span className="pi-error">{personalErrors.bio}</span>
                    )}
                  </motion.div>

                  {/* Details Section Header */}
                  <motion.h4
                    className="pi-section-divider"
                    variants={itemVariants}
                    style={{ marginTop: "2rem", marginBottom: "1rem" }}
                  >
                    Personal Details
                  </motion.h4>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Residential Address *</label>
                    <textarea
                      name="residentialAddress"
                      value={personalInfo.residentialAddress}
                      onChange={handlePersonalChange}
                      className="pi-textarea"
                      rows={3}
                    />
                    {personalErrors.residentialAddress && (
                      <span className="pi-error">
                        {personalErrors.residentialAddress}
                      </span>
                    )}
                  </motion.div>

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Emergency Contact Name *</label>
                      <Input
                        name="emergencyContactName"
                        type="text"
                        value={personalInfo.emergencyContactName}
                        onChange={handlePersonalChange}
                      />
                      {personalErrors.emergencyContactName && (
                        <span className="pi-error">
                          {personalErrors.emergencyContactName}
                        </span>
                      )}
                    </motion.div>

                    <div
                      className="pi-form-row"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        maxWidth: "600px",
                        width: "100%",
                        padding: "8px",
                        boxSizing: "border-box",
                        maxHeight: "20px",
                        height: "100%",
                      }}
                    >
                      <motion.div
                        className="pi-form-group"
                        variants={itemVariants}
                      >
                        <label>Emergency Contact Phone *</label>
                        <div className="pi-phone-group">
                          <div className="pi-country-selector">
                            <button
                              type="button"
                              onClick={() =>
                                setShowEmergencyCountryDropdown(
                                  !showEmergencyCountryDropdown
                                )
                              }
                              className="pi-country-btn"
                            >
                              <ReactCountryFlag
                                countryCode={
                                  countryCodes.find(
                                    (c) => c.code === emergencyCountry
                                  )?.code
                                }
                                svg
                                style={{ width: "1.5em", height: "1.5em" }}
                              />
                              <span>
                                {
                                  countryCodes.find(
                                    (c) => c.code === emergencyCountry
                                  )?.dialCode
                                }
                              </span>
                            </button>
                            {showEmergencyCountryDropdown && (
                              <motion.div
                                className="pi-country-dropdown"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                {countryCodes.map((country) => (
                                  <motion.div
                                    key={country.code}
                                    onClick={() => {
                                      setEmergencyCountry(country.code);
                                      setShowEmergencyCountryDropdown(false);
                                      const currentPhone =
                                        personalInfo.emergencyContactPhone;
                                      const phoneDigits = currentPhone.replace(
                                        /\D/g,
                                        ""
                                      );
                                      const newPhone =
                                        country.dialCode + " " + phoneDigits;
                                      setPersonalInfo((prev) => ({
                                        ...prev,
                                        emergencyContactPhone: newPhone,
                                      }));
                                    }}
                                    className={`pi-country-option ${
                                      country.code === emergencyCountry
                                        ? "active"
                                        : ""
                                    }`}
                                    whileHover={{ backgroundColor: "#f0f0f0" }}
                                  >
                                    <ReactCountryFlag
                                      countryCode={country.code}
                                      svg
                                      style={{
                                        width: "1.5em",
                                        height: "1.5em",
                                      }}
                                    />
                                    <span>{country.name}</span>
                                    <span>{country.dialCode}</span>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                          <input
                            type="tel"
                            value={
                              personalInfo.emergencyContactPhone.replace(
                                countryCodes.find(
                                  (c) => c.code === emergencyCountry
                                )?.dialCode + " ",
                                ""
                              ) || ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              const countryData = countryCodes.find(
                                (c) => c.code === emergencyCountry
                              );
                              const fullPhone =
                                countryData.dialCode + " " + value;
                              setPersonalInfo((prev) => ({
                                ...prev,
                                emergencyContactPhone: fullPhone,
                              }));
                              if (personalErrors.emergencyContactPhone) {
                                setPersonalErrors((prev) => ({
                                  ...prev,
                                  emergencyContactPhone: "",
                                }));
                              }
                            }}
                            placeholder="Enter phone number"
                            className="pi-phone-input"
                          />
                        </div>
                        {personalErrors.emergencyContactPhone && (
                          <span className="pi-error">
                            {personalErrors.emergencyContactPhone}
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Marital Status *</label>
                      <select
                        name="maritalStatus"
                        value={personalInfo.maritalStatus}
                        onChange={handlePersonalChange}
                        className="pi-select"
                      >
                        {maritalStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Nationality *</label>
                      <select
                        name="nationality"
                        value={personalInfo.nationality}
                        onChange={handlePersonalChange}
                        className="pi-select"
                      >
                        <option value="">Select Nationality</option>
                        {nationalities.map((nationality) => (
                          <option key={nationality} value={nationality}>
                            {nationality}
                          </option>
                        ))}
                      </select>
                      {personalErrors.nationality && (
                        <span className="pi-error">
                          {personalErrors.nationality}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <motion.div
                    className="pi-button-group"
                    variants={itemVariants}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setPersonalEditing(false);
                        setPersonalErrors({});
                        setPreviewAvatarUrl(null);
                        setSelectedAvatarFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSavePersonalInfo} disabled={loading}>
                      {loading ? <Loader size="small" /> : "Save Changes"}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Bank Information Tab */}
        {activeTab === "bank" && (
          <motion.div
            className="pi-tab-content"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="bank-tab"
          >
            <motion.div
              className="pi-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="pi-section-header">
                <h3 className="pi-subsection-title">Bank Account Details</h3>
                {!bankEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBankEditing(true)}
                    className="pi-edit-btn"
                  >
                    Edit
                  </motion.button>
                )}
              </div>

              {!bankEditing ? (
                <motion.div
                  className="pi-info-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    {
                      label: "Account Holder Name",
                      value: bankInfo.accountHolderName,
                    },
                    { label: "Bank Name", value: bankInfo.bankName },
                    { label: "City", value: bankInfo.city },
                    { label: "Branch Name", value: bankInfo.branchName },
                    { label: "IFSC Code", value: bankInfo.ifscCode },
                    {
                      label: "Account Number",
                      value: bankInfo.accountNumber
                        ? `****${bankInfo.accountNumber.slice(-4)}`
                        : "Not provided",
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="pi-info-card"
                      variants={itemVariants}
                    >
                      <div className="pi-info-row-large">
                        <span className="pi-label">{item.label}:</span>
                        <span className="pi-value">
                          {item.value || "Not provided"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="pi-form"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Account Holder Name *</label>
                      <Input
                        name="accountHolderName"
                        type="text"
                        value={bankInfo.accountHolderName}
                        onChange={handleBankChange}
                      />
                      {bankErrors.accountHolderName && (
                        <span className="pi-error">
                          {bankErrors.accountHolderName}
                        </span>
                      )}
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Bank Name *</label>
                      <Input
                        name="bankName"
                        type="text"
                        value={bankInfo.bankName}
                        onChange={handleBankChange}
                      />
                      {bankErrors.bankName && (
                        <span className="pi-error">{bankErrors.bankName}</span>
                      )}
                    </motion.div>
                  </div>

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>City *</label>
                      <Input
                        name="city"
                        type="text"
                        value={bankInfo.city}
                        onChange={handleBankChange}
                      />
                      {bankErrors.city && (
                        <span className="pi-error">{bankErrors.city}</span>
                      )}
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Branch Name *</label>
                      <Input
                        name="branchName"
                        type="text"
                        value={bankInfo.branchName}
                        onChange={handleBankChange}
                      />
                      {bankErrors.branchName && (
                        <span className="pi-error">
                          {bankErrors.branchName}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>IFSC Code *</label>
                      <Input
                        name="ifscCode"
                        type="text"
                        value={bankInfo.ifscCode}
                        onChange={handleBankChange}
                        placeholder="e.g., SBIN0001234"
                      />
                      {bankErrors.ifscCode && (
                        <span className="pi-error">{bankErrors.ifscCode}</span>
                      )}
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Account Number *</label>
                      <Input
                        name="accountNumber"
                        type="text"
                        value={bankInfo.accountNumber}
                        onChange={handleBankChange}
                      />
                      {bankErrors.accountNumber && (
                        <span className="pi-error">
                          {bankErrors.accountNumber}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <motion.div
                    className="pi-button-group"
                    variants={itemVariants}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setBankEditing(false);
                        setBankErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveBank} disabled={loading}>
                      {loading ? <Loader size="small" /> : "Save Changes"}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <motion.div
            className="pi-tab-content"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="documents-tab"
          >
            <motion.div
              className="pi-documents-section"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className="pi-documents-title">Upload Documents</h3>
              <motion.div className="pi-upload-form" variants={itemVariants}>
                <div className="pi-form-row">
                  <div className="pi-form-group">
                    <label>Document Type *</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="pi-select"
                    >
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pi-form-group">
                    <label>Choose File *</label>
                    <input
                      id="documentFile"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      className="pi-file-input"
                    />
                    {selectedFile && (
                      <span className="pi-file-name">{selectedFile.name}</span>
                    )}
                  </div>
                </div>

                <p className="pi-help-text">
                  Supported formats: {supportedFileFormats.join(", ")} (Max 5MB)
                </p>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleUploadDocument}
                    disabled={loading || !selectedFile}
                  >
                    {loading ? <Loader size="small" /> : "Upload Document"}
                  </Button>
                </motion.div>
              </motion.div>

              <h3 className="pi-documents-title" style={{ marginTop: "2rem" }}>
                Uploaded Documents
              </h3>
              <div className="pi-documents-grid">
                {documents.length === 0 ? (
                  <div className="pi-no-documents">
                    No documents uploaded yet
                  </div>
                ) : (
                  documents.map((doc, idx) => (
                    // <div className="pi-document-card" key={doc.id}>
                    <div key={doc.id} className="document-card">
                      <div className="document-header">
                        <span className="document-type">
                          {  (documentTypes.find(dt => dt.value === doc.documentType)?.label)}
                        </span>
                      </div>
                      <div className="document-body">
                        <strong>{doc.originalName || "N/A"}</strong>
                        <div className="document-meta">
                          <span>
                            Uploaded:{" "}
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Size:{" "}
                            {doc.size
                              ? (doc.size / 1024).toFixed(1) + " KB"
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="document-actions">
                        <IconButton
                          onClick={() => handlePreviewDocument(doc.filePath)}
                        >
                          <Eye size={20} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={loading}
                        >
                          <Trash size={20} />
                        </IconButton>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Preview Dialog */}
              <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="md"
                fullWidth
              >
                <div className="pi-preview-dialog">
                  <iframe
                    src={previewUrl}
                    title="Document Preview"
                    width="100%"
                    height="600px"
                    style={{ border: "none" }}
                  />
                </div>
              </Dialog>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
        autoHideDuration={5000}
      />
    </motion.div>
  );
};

export default ProfileForm;
