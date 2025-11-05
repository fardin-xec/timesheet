import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../redux/hooks/useAuth";
import Button from "../common/Button";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import { personalInfoAPI } from "../../utils/api";
import "../../styles/profile.css";
import ReactCountryFlag from "react-country-flag";
import { Dialog, IconButton } from "@mui/material";
import { Eye, Trash } from "lucide-react";

// Phone number length by country code
const PHONE_LENGTH_BY_COUNTRY = {
  US: 10,
  CA: 10,
  IN: 10,
  GB: 10,
  AU: 9,
  DE: 11,
  FR: 9,
  JP: 10,
  CN: 11,
  BR: 11,
  MX: 10,
  IT: 10,
  ES: 9,
  NL: 9,
  SE: 9,
  CH: 9,
  SG: 8,
  AE: 9,
  SA: 9,
  QA: 8,
  ZA: 9,
};
const Gender = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};
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

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    midName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    bio: "",
    avatar: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    maritalStatus: "single",
    nationality: "",
    dob: "",
    gender: "",
    alternativePhone: "",
    workLocation: "",
  });
  const [personalErrors, setPersonalErrors] = useState({});

  const [bankInfo, setBankInfo] = useState({
    accountHolderName: "",
    bankName: "",
    city: "",
    branchName: "",
    ifscCode: "",
    accountNumber: "",
    swiftCode: "",
    ibankNo: "",
  });
  const [bankErrors, setBankErrors] = useState({});

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("AADHAR_CARD");

  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [emergencyCountry, setEmergencyCountry] = useState("IN");
  const [showEmergencyCountryDropdown, setShowEmergencyCountryDropdown] =
    useState(false);
  const [alternateCountry, setAlternateCountry] = useState("IN");
  const [showAlternateCountryDropdown, setShowAlternateCountryDropdown] =
    useState(false);

  const countryCodes = React.useMemo(
    () => [
      { code: "US", dialCode: "+1", flag: "🇺🇸", name: "United States" },
      { code: "QA", dialCode: "+974", flag: "QA", name: "Qatar" },
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

  // VALIDATION FUNCTIONS (matching dialog code)
  const validateName = (name, fieldName) => {
    if (!name || name.trim() === "") {
      return { valid: true, message: "" }; // Optional field
    }
    if (name.trim().length < 2) {
      return {
        valid: false,
        message: `${fieldName} must be at least 2 characters`,
      };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return {
        valid: false,
        message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
      };
    }
    return { valid: true, message: "" };
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Please enter a valid email address" };
    }

    return { valid: true, message: "" };
  };

  const validatePhoneNumber = (phone, countryCode) => {
    const expectedLength = PHONE_LENGTH_BY_COUNTRY[countryCode];
    let phoneDigitsOnly = phone.replace(/\D/g, "");

    // Remove the country dial code
    const dialCode = countryCodes
      .find((c) => c.code === countryCode)
      ?.dialCode.replace("+", "");
    if (dialCode && phoneDigitsOnly.startsWith(dialCode)) {
      phoneDigitsOnly = phoneDigitsOnly.slice(dialCode.length);
    }

    if (!phoneDigitsOnly) {
      return { valid: false, message: "Phone number is required" };
    }

    if (!/^\d+$/.test(phoneDigitsOnly)) {
      return { valid: false, message: "Phone number must contain only digits" };
    }

    if (phoneDigitsOnly.length !== expectedLength) {
      return {
        valid: false,
        message: `Phone number must be exactly ${expectedLength} digits for ${countryCode}`,
      };
    }

    return { valid: true, message: "" };
  };

  const validateIFSCCode = (code) => {
    if (!code || code.trim() === "") {
      return { valid: true, message: "" }; // Optional field
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(code)) {
      return {
        valid: false,
        message: "IFSC code must be 11 characters  with proper format (e.g., SBIN0001234)",
      };
    }
    return { valid: true, message: "" };
  };

  const validateAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.trim() === "") {
      return { valid: true, message: "" }; // Optional field
    }
    const digitsOnly = accountNumber.replace(/\D/g, "");
    if (digitsOnly.length < 9 || digitsOnly.length > 18) {
      return {
        valid: false,
        message: "Account number must be between 9-18 digits",
      };
    }
    if (!/^\d+$/.test(digitsOnly)) {
      return {
        valid: false,
        message: "Account number must contain only digits",
      };
    }
    return { valid: true, message: "" };
  };

  //
  const validateSWIFTCode = (code) => {
    // SWIFT code: 8 or 11 characters
    // Format: AAAABBCCXXX where:
    // AAAA = Bank code (4 letters)
    // BB = Country code (2 letters)
    // CC = Location code (2 letters or digits)
    // XXX = Branch code (3 letters or digits, optional)
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

    if (!code) {
      return { valid: true, message: "" }; // Optional field
    }

    if (!swiftRegex.test(code)) {
      return {
        valid: false,
        message:
          "SWIFT code must be 8 or 11 characters  with proper format (e.g., SBININBB or SBININBB123)",
      };
    }

    return { valid: true, message: "" };
  };

  const validateIBAN = (code) => {
    // IBAN: up to 34 alphanumeric characters
    // Format: 2 letter country code + 2 check digits + up to 30 alphanumeric characters
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

    if (!code) {
      return { valid: true, message: "" }; // Optional field
    }

    if (!ibanRegex.test(code)) {
      return {
        valid: false,
        message:
          "IBAN must start with 2 letter country code, 2 digits, followed by up to 30 alphanumeric characters (e.g., GB82WEST12345698765432)",
      };
    }

    // Length validation by country (common examples)
    const countryLengths = {
      AD: 24,
      AE: 23,
      AL: 28,
      AT: 20,
      AZ: 28,
      BA: 20,
      BE: 16,
      BG: 22,
      BH: 22,
      BR: 29,
      BY: 28,
      CH: 21,
      CR: 22,
      CY: 28,
      CZ: 24,
      DE: 22,
      DK: 18,
      DO: 28,
      EE: 20,
      EG: 29,
      ES: 24,
      FI: 18,
      FO: 18,
      FR: 27,
      GB: 22,
      GE: 22,
      GI: 23,
      GL: 18,
      GR: 27,
      GT: 28,
      HR: 21,
      HU: 28,
      IE: 22,
      IL: 23,
      IS: 26,
      IT: 27,
      JO: 30,
      KW: 30,
      KZ: 20,
      LB: 28,
      LI: 21,
      LT: 20,
      LU: 20,
      LV: 21,
      MC: 27,
      MD: 24,
      ME: 22,
      MK: 19,
      MR: 27,
      MT: 31,
      MU: 30,
      NL: 18,
      NO: 15,
      PK: 24,
      PL: 28,
      PS: 29,
      PT: 25,
      QA: 29,
      RO: 24,
      RS: 22,
      SA: 24,
      SE: 24,
      SI: 19,
      SK: 24,
      SM: 27,
      TN: 24,
      TR: 26,
      UA: 29,
      VA: 22,
      VG: 24,
      XK: 20,
    };

    const countryCode = code.substring(0, 2);
    const expectedLength = countryLengths[countryCode];

    if (expectedLength && code.length !== expectedLength) {
      return {
        valid: false,
        message: `IBAN for ${countryCode} must be exactly ${expectedLength} characters`,
      };
    }

    return { valid: true, message: "" };
  };

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

  const getAvatarUrl = (url) => {
    if (!url) return "https://randomuser.me/api/portraits/men/1.jpg";
    if (url.startsWith("data:image/")) return url;
    if (url.startsWith("/")) {
      return `${BASE_URL}${url}`;
    }
    if (!url.startsWith("http") && !url.includes("/")) {
      return `${BASE_URL}/uploads/avatars/${url}`;
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
      const phoneData = parsePhoneNumber(profileData.employee?.phone);
      setSelectedCountry(phoneData.countryCode);

      const emergencyPhoneData = parsePhoneNumber(
        profileData.emergencyContactPhone
      );
      setEmergencyCountry(emergencyPhoneData.countryCode);

      const alternatePhoneData = parsePhoneNumber(profileData.alternativePhone);
      setAlternateCountry(alternatePhoneData.countryCode);

      setPersonalInfo({
        firstName: profileData.employee.firstName || "",
        lastName: profileData.employee.lastName || "",
        midName: profileData.employee.midName || "",
        email: profileData.email || "",
        phone: profileData.employee.phone || "",
        position: profileData.employee.jobTitle || "",
        department: profileData.employee.department || "",
        bio: profileData.employee.bio || "",
        avatar: profileData.employee.avatar || "",
        permanentAddress: profileData.permanentAddress || "",
        emergencyContactName: profileData.emergencyContactName || "",
        emergencyContactPhone: profileData.emergencyContactPhone || "",
        maritalStatus: profileData.maritalStatus || "single",
        nationality: profileData.nationality || "",
        dob: profileData.employee.dob,
        gender: profileData.employee.gender,
        alternativePhone: profileData.alternativePhone,
        workLocation: profileData.employee.workLocation,
      });

      const bankData = await personalInfoAPI.getBankInfo(user.employee.id);
      setBankInfo({
        accountHolderName: bankData.accountHolderName || "",
        bankName: bankData.bankName || "",
        city: bankData.city || "",
        branchName: bankData.branchName || "",
        ifscCode: bankData.ifscCode || "",
        accountNumber: bankData.accountNo || "",
        swiftCode: bankData.swiftCode || "",
        ibankNo: bankData.ibankNo || "",
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

  // Handle blur events for validation (matching dialog pattern)
  const handlePersonalBlur = (field) => {
    const newErrors = { ...personalErrors };
    console.log(field);
    if (field === "firstName") {
      if (personalInfo.firstName && personalInfo.firstName.trim() !== "") {
        const validation = validateName(personalInfo.firstName, "First name");
        if (!validation.valid) {
          newErrors.firstName = validation.message;
        } else {
          delete newErrors.firstName;
        }
      }
    } else if (field === "lastName") {
      if (personalInfo.lastName && personalInfo.lastName.trim() !== "") {
        const validation = validateName(personalInfo.lastName, "Last name");
        if (!validation.valid) {
          newErrors.lastName = validation.message;
        } else {
          delete newErrors.lastName;
        }
      }
    } else if (field === "midName") {
      if (personalInfo.midName && personalInfo.midName.trim() !== "") {
        const validation = validateName(personalInfo.midName, "Middle name");
        if (!validation.valid) {
          newErrors.midName = validation.message;
        } else {
          delete newErrors.midName;
        }
      }
    } else if (field === "phone") {
      if (personalInfo.phone && personalInfo.phone.trim() !== "") {
        const validation = validatePhoneNumber(
          personalInfo.phone,
          selectedCountry
        );
        if (!validation.valid) {
          newErrors.phone = validation.message;
        } else {
          delete newErrors.phone;
        }
      }
    } else if (field === "email") {
      if (personalInfo.email && personalInfo.email.trim() !== "") {
        const validation = validateEmail(personalInfo.email);
        if (!validation.valid) {
          newErrors.email = validation.message;
        } else {
          delete newErrors.email;
        }
      }
    } else if (field === "emergencyContactName") {
      if (
        personalInfo.emergencyContactName &&
        personalInfo.emergencyContactName.trim() !== ""
      ) {
        const validation = validateName(
          personalInfo.emergencyContactName,
          "Emergency contact name"
        );
        if (!validation.valid) {
          newErrors.emergencyContactName = validation.message;
        } else {
          delete newErrors.emergencyContactName;
        }
      }
    } else if (field === "emergencyContactPhone") {
      if (
        personalInfo.emergencyContactPhone &&
        personalInfo.emergencyContactPhone.trim() !== ""
      ) {
        const validation = validatePhoneNumber(
          personalInfo.emergencyContactPhone,
          emergencyCountry
        );
        if (!validation.valid) {
          newErrors.emergencyContactPhone = validation.message;
        } else {
          delete newErrors.emergencyContactPhone;
        }
      }
    } else if (field === "alternativePhone") {
      if (
        personalInfo.alternativePhone &&
        personalInfo.alternativePhone.trim() !== ""
      ) {
        const validation = validatePhoneNumber(
          personalInfo.alternativePhone,
          alternateCountry
        );
        if (!validation.valid) {
          newErrors.alternativePhone = validation.message;
        } else {
          delete newErrors.alternativePhone;
        }
      }
    }

    setPersonalErrors(newErrors);
  };

  const handleBankBlur = (field) => {
    const newErrors = { ...bankErrors };

    if (field === "accountHolderName") {
      const validation = validateName(
        bankInfo.accountHolderName,
        "Account holder name"
      );
      if (!validation.valid) {
        newErrors.accountHolderName = validation.message;
      } else {
        delete newErrors.accountHolderName;
      }
    } else if (field === "bankName") {
      const validation = validateName(bankInfo.bankName, "Bank name");
      if (!validation.valid) {
        newErrors.bankName = validation.message;
      } else {
        delete newErrors.bankName;
      }
    } else if (field === "city") {
      const validation = validateName(bankInfo.city, "City");
      if (!validation.valid) {
        newErrors.city = validation.message;
      } else {
        delete newErrors.city;
      }
    } else if (field === "branchName") {
      const validation = validateName(bankInfo.branchName, "Branch name");
      if (!validation.valid) {
        newErrors.branchName = validation.message;
      } else {
        delete newErrors.branchName;
      }
    } else if (field === "ifscCode") {
      const validation = validateIFSCCode(bankInfo.ifscCode);
      if (!validation.valid) {
        newErrors.ifscCode = validation.message;
      } else {
        delete newErrors.ifscCode;
      }
    } else if (field === "accountNumber") {
      const validation = validateAccountNumber(bankInfo.accountNumber);
      if (!validation.valid) {
        newErrors.accountNumber = validation.message;
      } else {
        delete newErrors.accountNumber;
      }
    } else if (field === "swiftCode") {
      if (bankInfo.swiftCode && bankInfo.swiftCode.trim() !== "") {
        const validation = validateSWIFTCode(bankInfo.swiftCode);
        if (!validation.valid) {
          newErrors.swiftCode = validation.message;
        } else {
          delete newErrors.swiftCode;
        }
      } else {
        delete newErrors.swiftCode;
      }
    } else if (field === "ibankNo") {
      if (bankInfo.ibankNo && bankInfo.ibankNo.trim() !== "") {
        const validation = validateIBAN(bankInfo.ibankNo);
        if (!validation.valid) {
          newErrors.ibankNo = validation.message;
        } else {
          delete newErrors.ibankNo;
        }
      } else {
        delete newErrors.ibankNo;
      }
    }

    setBankErrors(newErrors);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    if (personalErrors[name]) {
      setPersonalErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e, type) => {
    const value = e.target.value;
    let countryData;

    if (type === "main") {
      countryData = countryCodes.find((c) => c.code === selectedCountry);
      const fullPhone = countryData.dialCode + value;
      setPersonalInfo((prev) => ({ ...prev, phone: fullPhone }));
    } else if (type === "emergency") {
      countryData = countryCodes.find((c) => c.code === emergencyCountry);
      const fullPhone = countryData.dialCode + value;
      setPersonalInfo((prev) => ({
        ...prev,
        emergencyContactPhone: fullPhone,
      }));
    } else if (type === "alternative") {
      countryData = countryCodes.find((c) => c.code === alternateCountry);
      const fullPhone = countryData.dialCode + value;
      setPersonalInfo((prev) => ({
        ...prev,
        alternativePhone: fullPhone,
      }));
    }

    if (
      personalErrors.phone ||
      personalErrors.emergencyContactPhone ||
      personalErrors.alternativePhone
    ) {
      setPersonalErrors((prev) => ({
        ...prev,
        phone: type === "main" ? "" : prev.phone,
        emergencyContactPhone:
          type === "emergency" ? "" : prev.emergencyContactPhone,
        alternativePhone: type === "alternative" ? "" : prev.alternativePhone,
      }));
    }
  };

  const handleCountrySelect = (countryCode, type) => {
    const newCountryData = countryCodes.find((c) => c.code === countryCode);

    if (type === "main") {
      setSelectedCountry(countryCode);
      setShowCountryDropdown(false);
      const phoneData = parsePhoneNumber(personalInfo.phone);
      const newPhone = newCountryData.dialCode + phoneData.number;
      setPersonalInfo((prev) => ({ ...prev, phone: newPhone }));
    } else if (type === "emergency") {
      setEmergencyCountry(countryCode);
      setShowEmergencyCountryDropdown(false);
      const phoneData = parsePhoneNumber(personalInfo.emergencyContactPhone);
      const newPhone = newCountryData.dialCode + phoneData.number;
      setPersonalInfo((prev) => ({ ...prev, emergencyContactPhone: newPhone }));
    } else if (type === "alternative") {
      setAlternateCountry(countryCode);
      setShowAlternateCountryDropdown(false);
      const phoneData = parsePhoneNumber(personalInfo.alternativePhone);
      const newPhone = newCountryData.dialCode + phoneData.number;
      setPersonalInfo((prev) => ({ ...prev, alternativePhone: newPhone }));
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        showToast(
          "Please upload a valid image file (JPG, PNG, GIF, or WebP)",
          "error"
        );
        return;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast("Image size must not exceed 10MB", "error");
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
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        showToast(
          "File format not supported. Please use PDF, JPG, PNG, or DOCX",
          "error"
        );
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast("File size must not exceed 5MB", "error");
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

  const handlePreviewDocument = (path) => {
    const url = `${BASE_URL}/${path.replace(/^\/+/, "")}`;
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleSavePersonalInfo = async () => {
    // Validate only filled fields
    const errors = {};

    if (personalInfo.firstName && personalInfo.firstName.trim() !== "") {
      const validation = validateName(personalInfo.firstName, "First name");
      if (!validation.valid) errors.firstName = validation.message;
    }

    if (personalInfo.lastName && personalInfo.lastName.trim() !== "") {
      const validation = validateName(personalInfo.lastName, "Last name");
      if (!validation.valid) errors.lastName = validation.message;
    }

    if (personalInfo.midName && personalInfo.midName.trim() !== "") {
      const validation = validateName(personalInfo.midName, "Middle name");
      if (!validation.valid) errors.midName = validation.message;
    }

    if (personalInfo.phone && personalInfo.phone.trim() !== "") {
      const validation = validatePhoneNumber(
        personalInfo.phone,
        selectedCountry
      );
      if (!validation.valid) errors.phone = validation.message;
    }

    if (
      personalInfo.emergencyContactName &&
      personalInfo.emergencyContactName.trim() !== ""
    ) {
      const validation = validateName(
        personalInfo.emergencyContactName,
        "Emergency contact name"
      );
      if (!validation.valid) errors.emergencyContactName = validation.message;
    }

    if (
      personalInfo.emergencyContactPhone &&
      personalInfo.emergencyContactPhone.trim() !== ""
    ) {
      const validation = validatePhoneNumber(
        personalInfo.emergencyContactPhone,
        emergencyCountry
      );
      if (!validation.valid) errors.emergencyContactPhone = validation.message;
    }
    if (
      personalInfo.alternativePhone &&
      personalInfo.alternativePhone.trim() !== ""
    ) {
      const validation = validatePhoneNumber(
        personalInfo.alternativePhone,
        alternateCountry
      );
      if (!validation.valid) errors.alternativePhone = validation.message;
    }

    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      showToast("Please fix all validation errors", "error");
      return;
    }
    //loading
    setLoading(true);
    try {
      const updateData = {
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        midName: personalInfo.midName.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phone.trim(),
        bio: personalInfo.bio.trim(),
        permanentAddress: personalInfo.permanentAddress.trim(),
        emergencyContactName: personalInfo.emergencyContactName.trim(),
        emergencyContactPhone: personalInfo.emergencyContactPhone.trim(),
        maritalStatus: personalInfo.maritalStatus,
        nationality: personalInfo.nationality.trim(),
        dob: personalInfo.dob,
        gender: personalInfo.gender,
        alternativePhone: personalInfo.alternativePhone,
      };

      if (selectedAvatarFile) {
        const base64Image = await convertFileToBase64(selectedAvatarFile);
        const data = await personalInfoAPI.updatePersonalPic(
          user.employee.id,
          base64Image
        );
        showToast("Profile picture updated successfully");
        setPersonalInfo((prev) => ({ ...prev, avatar: data.avatar }));
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

    const holderValidation = validateName(
      bankInfo.accountHolderName,
      "Account holder name"
    );
    if (!holderValidation.valid)
      errors.accountHolderName = holderValidation.message;

    const bankValidation = validateName(bankInfo.bankName, "Bank name");
    if (!bankValidation.valid) errors.bankName = bankValidation.message;

    const cityValidation = validateName(bankInfo.city, "City");
    if (!cityValidation.valid) errors.city = cityValidation.message;

    const branchValidation = validateName(bankInfo.branchName, "Branch name");
    if (!branchValidation.valid) errors.branchName = branchValidation.message;

    const ifscValidation = validateIFSCCode(bankInfo.ifscCode);
    if (!ifscValidation.valid) errors.ifscCode = ifscValidation.message;

    const accountValidation = validateAccountNumber(bankInfo.accountNumber);
    if (!accountValidation.valid)
      errors.accountNumber = accountValidation.message;

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

    setLoading(true);
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

  // Phone input renderer (matching dialog pattern)
  const renderPhoneInput = (
    value,
    countryCode,
    showDropdown,
    setShowDropdown,
    type
  ) => {
    const selectedCountryData = countryCodes.find(
      (c) => c.code === countryCode
    );
    const phoneData = parsePhoneNumber(value);
    let fieldName = type === "main" ? "phone" : "emergencyContactPhone";
    if (type === "alternative") {
      fieldName = "alternativePhone";
    }
    return (
      <div className="pi-phone-group">
        <div className="pi-country-selector">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="pi-country-btn"
          >
            <ReactCountryFlag
              countryCode={selectedCountryData.code}
              svg
              style={{ width: "1.5em", height: "1.5em" }}
            />
            <span>{selectedCountryData.dialCode}</span>
          </button>

          {showDropdown && (
            <motion.div
              className="pi-country-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {countryCodes.map((country) => (
                <motion.div
                  key={country.code}
                  onClick={() => handleCountrySelect(country.code, type)}
                  className={`pi-country-option ${
                    country.code === countryCode ? "active" : ""
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
        {console.log(fieldName)}

        <input
          type="tel"
          value={phoneData.number}
          onChange={(e) => handlePhoneChange(e, type)}
          onBlur={() => handlePersonalBlur(fieldName)}
          placeholder="Enter phone number"
          className={`pi-phone-input ${
            personalErrors[fieldName] ? "error" : ""
          }`}
          disabled={type === "main"}
          maxLength={PHONE_LENGTH_BY_COUNTRY[selectedCountryData.code]}
        />
      </div>
    );
  };

  if (fetchLoading) {
    return (
      <div className="pi-loading-container">
        <Loader size="medium" />
        <p>Loading personal information...</p>
      </div>
    );
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const getMaxDobDate = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split("T")[0];
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
                        {personalInfo.firstName} {personalInfo.midName}{" "}
                        {personalInfo.lastName}
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
                      <span className="pi-label">Alternate Phone:</span>
                      <span className="pi-value">
                        {personalInfo.alternativePhone}
                      </span>
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

                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">Residential Address:</span>
                      <span className="pi-value">
                        {personalInfo.permanentAddress || "Not provided"}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">DOB:</span>
                      <span className="pi-value">
                        {personalInfo.dob || "Not provided"}
                      </span>
                    </div>
                  </motion.div>
                  <motion.div className="pi-info-card" variants={itemVariants}>
                    <div className="pi-info-row-large">
                      <span className="pi-label">Gender:</span>
                      <span className="pi-value">
                        {personalInfo.gender || "Not provided"}
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

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>First Name</label>
                      <input
                        name="firstName"
                        type="text"
                        value={personalInfo.firstName}
                        onChange={handlePersonalChange}
                        onBlur={() => handlePersonalBlur("firstName")}
                        className={`input-field ${
                          personalErrors.firstName ? "error" : ""
                        }`}
                      />
                      {personalErrors.firstName && (
                        <span className="input-error">
                          {personalErrors.firstName}
                        </span>
                      )}
                    </motion.div>
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Last Name</label>
                      <input
                        name="lastName"
                        type="text"
                        value={personalInfo.lastName}
                        onChange={handlePersonalChange}
                        onBlur={() => handlePersonalBlur("lastName")}
                        className={`pi-phone-input ${
                          personalErrors.lastName ? "error" : ""
                        }`}
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
                    <input
                      name="midName"
                      type="text"
                      value={personalInfo.midName}
                      onChange={handlePersonalChange}
                      onBlur={() => handlePersonalBlur("midName")}
                      className={`pi-phone-input ${
                        personalErrors.midName ? "error" : ""
                      }`}
                    />
                    {personalErrors.midName && (
                      <span className="pi-error">{personalErrors.midName}</span>
                    )}
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Personal Email</label>
                    <input
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handlePersonalChange}
                      onBlur={() => handlePersonalBlur("email")}
                      className={`pi-phone-input ${
                        personalErrors.midName ? "error" : ""
                      }`}
                    />
                    {personalErrors.email && (
                      <span className="pi-error">{personalErrors.email}</span>
                    )}
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Phone Number</label>
                    {renderPhoneInput(
                      personalInfo.phone,
                      selectedCountry,
                      showCountryDropdown,
                      setShowCountryDropdown,
                      "main"
                    )}
                    {personalErrors.phone && (
                      <span className="pi-error">{personalErrors.phone}</span>
                    )}
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Alternative Phone Number</label>
                    {renderPhoneInput(
                      personalInfo.alternativePhone,
                      alternateCountry,
                      showAlternateCountryDropdown,
                      setShowAlternateCountryDropdown,
                      "alternative"
                    )}
                    {personalErrors.alternativePhone && (
                      <span className="pi-error">
                        {personalErrors.alternativePhone}
                      </span>
                    )}
                  </motion.div>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Position</label>
                    <input
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
                  </motion.div>

                  <motion.h4
                    className="pi-section-divider"
                    variants={itemVariants}
                    style={{ marginTop: "2rem", marginBottom: "1rem" }}
                  >
                    Personal Details
                  </motion.h4>

                  <motion.div className="pi-form-group" variants={itemVariants}>
                    <label>Residential Address</label>
                    <textarea
                      name="permanentAddress"
                      value={personalInfo.permanentAddress}
                      onChange={handlePersonalChange}
                      className="pi-textarea"
                      rows={3}
                    />
                  </motion.div>

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        className="input-field"
                        value={personalInfo.dob}
                        onChange={handlePersonalChange}
                        max={getMaxDobDate()}
                      />
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Gender</label>
                      <div className="gender-button-group">
                        <button
                          className={`gender-button ${
                            personalInfo.gender === Gender.MALE
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              gender: Gender.MALE,
                            }))
                          }
                          type="button"
                        >
                          Male
                        </button>
                        <button
                          className={`gender-button ${
                            personalInfo.gender === Gender.FEMALE
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              gender: Gender.FEMALE,
                            }))
                          }
                          type="button"
                        >
                          Female
                        </button>
                        <button
                          className={`gender-button ${
                            personalInfo.gender === Gender.OTHER
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              gender: Gender.OTHER,
                            }))
                          }
                          type="button"
                        >
                          Other
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Emergency Contact Name</label>
                      <input
                        name="emergencyContactName"
                        type="text"
                        value={personalInfo.emergencyContactName}
                        onChange={handlePersonalChange}
                        onBlur={() =>
                          handlePersonalBlur("emergencyContactName")
                        }
                        className={`pi-phone-input ${
                          personalErrors.midName ? "error" : ""
                        }`}
                      />
                      {personalErrors.emergencyContactName && (
                        <span className="pi-error">
                          {personalErrors.emergencyContactName}
                        </span>
                      )}
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Emergency Contact Phone</label>
                      {renderPhoneInput(
                        personalInfo.emergencyContactPhone,
                        emergencyCountry,
                        showEmergencyCountryDropdown,
                        setShowEmergencyCountryDropdown,
                        "emergency"
                      )}
                      {personalErrors.emergencyContactPhone && (
                        <span className="pi-error">
                          {personalErrors.emergencyContactPhone}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <div className="pi-form-row">
                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Marital Status</label>
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
                      <label>Nationality</label>
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
                    ...(personalInfo.workLocation?.trim().toLowerCase() ===
                    "on-site"
                      ? [
                          { label: "Swift Code", value: bankInfo.swiftCode },
                          { label: "IBank Number", value: bankInfo.iban },
                        ]
                      : []),
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
                      <label>Account Holder Name</label>
                      <input
                        name="accountHolderName"
                        type="text"
                        value={bankInfo.accountHolderName}
                        onChange={handleBankChange}
                        onBlur={() => handleBankBlur("accountHolderName")}
                        className={`pi-input ${
                          personalErrors.midName ? "error" : ""
                        }`}
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
                      <label>Bank Name</label>
                      <input
                        name="bankName"
                        type="text"
                        value={bankInfo.bankName}
                        onChange={handleBankChange}
                        onBlur={() => handleBankBlur("bankName")}
                        className={`pi-input ${
                          personalErrors.midName ? "error" : ""
                        }`}
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
                      <label>City</label>
                      <input
                        name="city"
                        type="text"
                        value={bankInfo.city}
                        onChange={handleBankChange}
                        onBlur={() => handleBankBlur("city")}
                        className={`pi-input ${
                          personalErrors.midName ? "error" : ""
                        }`}
                      />
                      {bankErrors.city && (
                        <span className="pi-error">{bankErrors.city}</span>
                      )}
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Branch Name</label>
                      <input
                        name="branchName"
                        type="text"
                        value={bankInfo.branchName}
                        onChange={handleBankChange}
                        onBlur={() => handleBankBlur("branchName")}
                        className={`pi-input ${
                          personalErrors.midName ? "error" : ""
                        }`}
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
                      <label>IFSC Code</label>
                      <input
                        name="ifscCode"
                        type="text"
                        value={bankInfo.ifscCode}
                        onChange={handleBankChange}
                        onBlur={() => handleBankBlur("ifscCode")}
                        placeholder="e.g., SBIN0001234"
                        className={`pi-input ${
                          personalErrors.midName ? "error" : ""
                        }`}
                      />
                      {bankErrors.ifscCode && (
                        <span className="pi-error">{bankErrors.ifscCode}</span>
                      )}
                    </motion.div>

                    <motion.div
                      className="pi-form-group"
                      variants={itemVariants}
                    >
                      <label>Account Number</label>
                      <input
                        name="accountNumber"
                        type="text"
                        value={bankInfo.accountNumber}
                        onChange={handleBankChange}
                        onBlur={() => handleBankBlur("accountNumber")}
                        placeholder="9-18 digits"
                        className={`pi-input ${
                          personalErrors.midName ? "error" : ""
                        }`}
                      />
                      {bankErrors.accountNumber && (
                        <span className="pi-error">
                          {bankErrors.accountNumber}
                        </span>
                      )}
                    </motion.div>
                  </div>
                  {personalInfo.workLocation === "On-site" && (
                    <div className="pi-form-row">
                      <motion.div
                        className="pi-form-group"
                        variants={itemVariants}
                      >
                        <label>Swift Code</label>
                        <input
                          name="swiftCode"
                          type="text"
                          value={bankInfo.swiftCode}
                          onChange={handleBankChange}
                          onBlur={() => handleBankBlur("swiftCode")}
                          placeholder="e.g., SBIN0001234"
                          className={`pi-input ${
                            personalErrors.midName ? "error" : ""
                          }`}
                          maxLength="11"
                          minLength="9"
                        />
                        {bankErrors.swiftCode && (
                          <span className="pi-error">
                            {bankErrors.swiftCode}
                          </span>
                        )}
                      </motion.div>

                      <motion.div
                        className="pi-form-group"
                        variants={itemVariants}
                      >
                        <label>IBank Number</label>
                        <input
                          name="ibankNo"
                          type="text"
                          value={bankInfo.ibankNo}
                          onChange={handleBankChange}
                          onBlur={() => handleBankBlur("ibankNo")}
                          placeholder="32-34 digits"
                          className={`pi-input ${
                            personalErrors.midName ? "error" : ""
                          }`}
                          maxLength="34"
                          minLength="32"
                        />
                        {bankErrors.ibankNo && (
                          <span className="pi-error">{bankErrors.ibankNo}</span>
                        )}
                      </motion.div>
                    </div>
                  )}

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
                    <label>Document Type</label>
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
                    <label>Choose File</label>
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
                  documents.map((doc) => (
                    <div key={doc.id} className="document-card">
                      <div className="document-header">
                        <span className="document-type">
                          {
                            documentTypes.find(
                              (dt) => dt.value === doc.documentType
                            )?.label
                          }
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
