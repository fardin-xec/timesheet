import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Button,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Trash2, Eye, Trash } from "lucide-react";
import { Facebook, LinkedIn, Twitter } from "@mui/icons-material";
import ReactCountryFlag from "react-country-flag";
import api from "../../utils/api_call";
import { personalInfoAPI } from "../../utils/api";
import "../../styles/employeeDailog.css";

import Toast from "../common/Toast"; // Adjust path if needed

const EmployeeProfileDialog = ({
  open,
  onClose,
  employee,
  departments,
  workLocation,
  employmentType,
  positions,
  onSave,
  managers,
}) => {
  const token = localStorage.getItem("access_token");
  const [activeTab, setActiveTab] = useState(0);
  const [employeeData, setEmployeeData] = useState(
    employee || { reportingManagers: [], reportTo: null }
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastSeverity, setToastSeverity] = React.useState("success");

  const [personalData, setPersonalData] = useState({
    id: 0,
    email: "",
    alternativePhone: "",
    bloodGroup: "",
    weddingAnniversary: "",
    maritalStatus: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    nationality: "",
  });
  const [bankInfo, setBankInfo] = useState({
    accountHolderName: "",
    bankName: "",
    city: "",
    branchName: "",
    ifscCode: "",
    accountNumber: "",
  });
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("AADHAR_CARD");
  const [loading, setLoading] = useState(true);
  const [reportingManager, setReportingManager] = useState([]);
  const [subOrdinates, setSubOrdinates] = useState([]);

  // Validation errors
  const [personalErrors, setPersonalErrors] = useState({});
  const [bankErrors, setBankErrors] = useState({});
  const [ctcErrors, setCtcErrors] = useState({});

  // Country code states
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [emergencyCountry, setEmergencyCountry] = useState("IN");
  const [showEmergencyCountryDropdown, setShowEmergencyCountryDropdown] =
    useState(false);
  const [alternateCountry, setAlternateCountry] = useState("IN");
  const [showAlternateCountryDropdown, setShowAlternateCountryDropdown] =
    useState(false);

  const ManagerList = [
    "Manager",
    "Lead",
    "Senior",
    "Director",
    "VP",
    "C-Level",
  ];

  const Currency = {
    USD: "USD",
    EUR: "EUR",
    INR: "INR",
    GBP: "GBP",
    AUD: "AUD",
    CAD: "CAD",
    QAR: "QAR",
    JPY: "JPY",
    CHF: "CHF",
    CNY: "CNY",
    BRL: "BRL",
  };

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
  // Validation functions
  const validateEmail = (email) => {
    if (!email) return { valid: true, message: "" }; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Please enter a valid email address" };
    }
    return { valid: true, message: "" };
  };

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

  const validateIFSCCode = (code) => {
    if (!code || code.trim() === "") {
      return { valid: true, message: "" }; // Optional field
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(code)) {
      return {
        valid: false,
        message: "IFSC code must be 11 characters (e.g., SBIN0001234)",
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

  const validatePhoneNumber = (phone, countryCode) => {
    const expectedLength = PHONE_LENGTH_BY_COUNTRY[countryCode];
    let phoneDigitsOnly = phone.replace(/\D/g, "");

    // Remove the country dial code (like +91, +1, etc.)
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

  const validateCTC = (ctc) => {
    if (!ctc || ctc.trim() === "") {
      return { valid: true, message: "" }; // Optional field
    }
    const numericValue = parseFloat(ctc);
    if (isNaN(numericValue) || numericValue < 0) {
      return {
        valid: false,
        message: "CTC must be a valid positive number",
      };
    }
    return { valid: true, message: "" };
  };

  // Clear all data function
  const clearAllData = useCallback(() => {
    setEmployeeData({ reportingManagers: [], reportTo: null });
    setPersonalData({
      id: 0,
      email: "",
      alternativePhone: "",
      bloodGroup: "",
      weddingAnniversary: "",
      maritalStatus: "",
      currentAddress: "",
      permanentAddress: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      nationality: "",
    });
    setBankInfo({
      accountHolderName: "",
      bankName: "",
      city: "",
      branchName: "",
      ifscCode: "",
      accountNumber: "",
    });
    setDocuments([]);
    setSelectedFile(null);
    setDocumentType("AADHAR_CARD");
    setReportingManager([]);
    setSubOrdinates([]);
    setPersonalErrors({});
    setBankErrors({});
    setCtcErrors({});
    setActiveTab(0);
    setSelectedCountry("IN");
    setEmergencyCountry("IN");
    setAlternateCountry("IN");
  }, []);

  // Handle dialog close
  const handleClose = useCallback(() => {
    clearAllData();
    onClose();
  }, [clearAllData, onClose]);

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

  const fetchEmployeePersonalData = useCallback(
    async (employeeId) => {
      try {
        setLoading(true);
        const response = await personalInfoAPI.getPersonalInfo(employeeId);
        if (response) {
          const phoneData = parsePhoneNumber(response.employee?.phone);
          const emergencyPhoneData = parsePhoneNumber(
            response.emergencyContactPhone
          );
          const alternatePhoneData = parsePhoneNumber(
            response.alternativePhone
          );

          setSelectedCountry(phoneData.countryCode);
          setEmergencyCountry(emergencyPhoneData.countryCode);
          setAlternateCountry(alternatePhoneData.countryCode);

          setPersonalData({
            id: employeeId,
            email: response.email || "",
            alternativePhone: response.alternativePhone || "",
            bloodGroup: response.bloodGroup || "",
            weddingAnniversary: response.weddingAnniversary || "",
            maritalStatus: response.maritalStatus || "",
            currentAddress: response.currentAddress || "",
            permanentAddress: response.permanentAddress || "",
            emergencyContactName: response.emergencyContactName || "",
            emergencyContactPhone: response.emergencyContactPhone || "",
            nationality: response.nationality || "",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee personal data:", error);
        setLoading(false);
      }
    },
    [parsePhoneNumber]
  );

  const fetchBankInfo = useCallback(async (employeeId) => {
    try {
      const data = await personalInfoAPI.getBankInfo(employeeId);
      setBankInfo({
        accountHolderName: data.accountHolderName || "",
        bankName: data.bankName || "",
        city: data.city || "",
        branchName: data.branchName || "",
        ifscCode: data.ifscCode || "",
        accountNumber: data.accountNo || "",
      });
    } catch (error) {
      console.error("Error fetching bank info:", error);
    }
  }, []);

  const fetchDocuments = useCallback(async (employeeId) => {
    try {
      const docs = await personalInfoAPI.getDocuments(employeeId);
      setDocuments(docs || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, []);

  const fetchReportingManagerData = useCallback(
    async (employeeId) => {
      try {
        setLoading(true);
        const response = await api.get(
          `/employees/${employeeId}/reprotingManager`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.data) {
          setReportingManager(response.data.data);
          setEmployeeData((prev) => ({
            ...prev,
            reportingManagers: response.data.data,
            reportTo: response.data.data[0]?.id || null,
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reporting manager data:", error);
        setLoading(false);
      }
    },
    [token]
  );

  const fetchSubordinatesData = useCallback(
    async (employeeId) => {
      try {
        setLoading(true);
        const response = await api.get(
          `/employees/${employeeId}/subordinates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.data) {
          setSubOrdinates(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subordinates data:", error);
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (employee && open) {
      setEmployeeData((prev) => ({ ...prev, ...employee }));
      fetchEmployeePersonalData(employee.id);
      fetchBankInfo(employee.id);
      fetchDocuments(employee.id);
      fetchReportingManagerData(employee.id);
      fetchSubordinatesData(employee.id);
    } else if (!open) {
      // Clear data when dialog is closed
      clearAllData();
    }
  }, [
    employee,
    open,
    fetchEmployeePersonalData,
    fetchBankInfo,
    fetchDocuments,
    fetchReportingManagerData,
    fetchSubordinatesData,
    clearAllData,
  ]);

  const handleRemoveManager = (index) => {
    setEmployeeData((prev) => {
      const updatedManagers = [...(prev.reportingManagers || [])];
      updatedManagers.splice(index, 1);
      const newReportTo =
        updatedManagers.length > 0 ? updatedManagers[0]?.id : null;
      return {
        ...prev,
        reportingManagers: updatedManagers,
        reportTo: newReportTo,
      };
    });
    setReportingManager((prev) => {
      const updated = [...(prev || [])];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleManagerSelection = (managerId) => {
    setEmployeeData((prev) => ({
      ...prev,
      reportTo: managerId,
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field, value) => {
    setEmployeeData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear CTC errors when editing
    if (field === "ctc" || field === "currency") {
      setCtcErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePersonalInputChange = (field, value) => {
    setPersonalData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    setPersonalErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleBankInputChange = (field, value) => {
    setBankInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    setBankErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleBlur = (field, tabType) => {
    if (tabType === "personal") {
      const newErrors = { ...personalErrors };

      if (field === "email") {
        if (personalData.email && personalData.email.trim() !== "") {
          const validation = validateEmail(personalData.email);
          if (!validation.valid) {
            newErrors.email = validation.message;
          } else {
            delete newErrors.email;
          }
        }
      } else if (field === "emergencyContactName") {
        if (
          personalData.emergencyContactName &&
          personalData.emergencyContactName.trim() !== ""
        ) {
          const validation = validateName(personalData.emergencyContactName);
          if (!validation.valid) {
            newErrors.emergencyContactName = validation.message;
          } else {
            delete newErrors.email;
          }
        }
      }

      setPersonalErrors(newErrors);
    } else if (tabType === "bank") {
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
      }

      setBankErrors(newErrors);
    } else if (tabType === "ctc") {
      const newErrors = { ...ctcErrors };

      if (field === "ctc") {
        const validation = validateCTC(employeeData.ctc);
        if (!validation.valid) {
          newErrors.ctc = validation.message;
        } else {
          delete newErrors.ctc;
        }
      }

      setCtcErrors(newErrors);
    }
  };

  const handlePhoneBlur = (field, tabType, countryCode) => {
    if (tabType === "personal") {
      const newErrors = { ...personalErrors };

      if (field === "phone") {
        if (employeeData.phone && employeeData.phone.trim() !== "") {
          const validation = validatePhoneNumber(
            employeeData.phone,
            countryCode
          );
          if (!validation.valid) {
            newErrors.phone = validation.message;
          } else {
            delete newErrors.phone;
          }
        }
      } else if (field === "emergencyContactPhone") {
        if (
          personalData.emergencyContactPhone &&
          personalData.emergencyContactPhone.trim() !== ""
        ) {
          const validation = validatePhoneNumber(
            personalData.emergencyContactPhone,
            countryCode
          );
          if (!validation.valid) {
            newErrors.emergencyContactPhone = validation.message;
          } else {
            delete newErrors.emergencyContactPhone;
          }
        }
      } else if (field === "alternativePhone") {
        if (
          personalData.alternativePhone &&
          personalData.alternativePhone.trim() !== ""
        ) {
          const validation = validatePhoneNumber(
            personalData.alternativePhone,
            countryCode
          );
          if (!validation.valid) {
            newErrors.alternativePhone = validation.message;
          } else {
            delete newErrors.alternativePhone;
          }
        }
      }

      setPersonalErrors(newErrors);
    }
  };

  const validatePersonalTab = () => {
    const newErrors = {};

    const emailValidation = validateEmail(personalData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    const emergencyNameValidation = validateName(
      personalData.emergencyContactName,
      "Emergency contact name"
    );
    if (!emergencyNameValidation.valid) {
      newErrors.emergencyContactName = emergencyNameValidation.message;
    }

    setPersonalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBankTab = () => {
    const newErrors = {};

    const accountHolderValidation = validateName(
      bankInfo.accountHolderName,
      "Account holder name"
    );
    if (!accountHolderValidation.valid) {
      newErrors.accountHolderName = accountHolderValidation.message;
    }

    const bankNameValidation = validateName(bankInfo.bankName, "Bank name");
    if (!bankNameValidation.valid) {
      newErrors.bankName = bankNameValidation.message;
    }

    const cityValidation = validateName(bankInfo.city, "City");
    if (!cityValidation.valid) {
      newErrors.city = cityValidation.message;
    }

    const branchValidation = validateName(bankInfo.branchName, "Branch name");
    if (!branchValidation.valid) {
      newErrors.branchName = branchValidation.message;
    }

    const ifscValidation = validateIFSCCode(bankInfo.ifscCode);
    if (!ifscValidation.valid) {
      newErrors.ifscCode = ifscValidation.message;
    }

    const accountValidation = validateAccountNumber(bankInfo.accountNumber);
    if (!accountValidation.valid) {
      newErrors.accountNumber = accountValidation.message;
    }

    const ctcValidation = validateCTC(employeeData.ctc);
    if (!ctcValidation.valid) {
      newErrors.ctc = ctcValidation.message;
    }

    setBankErrors(newErrors);
    setCtcErrors({ ctc: newErrors.ctc || "" });
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e, type) => {
    const value = e.target.value;
    let countryData;

    if (type === "main") {
      countryData = countryCodes.find((c) => c.code === selectedCountry);
      const fullPhone = countryData.dialCode + value;
      setEmployeeData((prev) => ({ ...prev, phone: fullPhone }));
    } else if (type === "emergency") {
      countryData = countryCodes.find((c) => c.code === emergencyCountry);
      const fullPhone = countryData.dialCode + value;
      setPersonalData((prev) => ({
        ...prev,
        emergencyContactPhone: fullPhone,
      }));
    } else if (type === "alternate") {
      countryData = countryCodes.find((c) => c.code === alternateCountry);
      const fullPhone = countryData.dialCode + value;
      setPersonalData((prev) => ({ ...prev, alternativePhone: fullPhone }));
    }
  };

  const handleCountrySelect = (countryCode, type) => {
    const newCountryData = countryCodes.find((c) => c.code === countryCode);

    if (type === "main") {
      setSelectedCountry(countryCode);
      setShowCountryDropdown(false);
      const phoneData = parsePhoneNumber(employeeData.phone);
      const newPhone = newCountryData.dialCode + phoneData.number;
      setEmployeeData((prev) => ({ ...prev, phone: newPhone }));
    } else if (type === "emergency") {
      setEmergencyCountry(countryCode);
      setShowEmergencyCountryDropdown(false);
      const phoneData = parsePhoneNumber(personalData.emergencyContactPhone);
      const newPhone = newCountryData.dialCode + phoneData.number;
      setPersonalData((prev) => ({ ...prev, emergencyContactPhone: newPhone }));
    } else if (type === "alternate") {
      setAlternateCountry(countryCode);
      setShowAlternateCountryDropdown(false);
      const phoneData = parsePhoneNumber(personalData.alternativePhone);
      const newPhone = newCountryData.dialCode + phoneData.number;
      setPersonalData((prev) => ({ ...prev, alternativePhone: newPhone }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      await personalInfoAPI.uploadDocument(
        employee.id,
        selectedFile,
        documentType
      );
      await fetchDocuments(employee.id);
      setSelectedFile(null);
      setDocumentType("AADHAR_CARD");
      const fileInput = document.getElementById("documentFile");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      setLoading(true);
      await personalInfoAPI.deleteDocument(employee.id, docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    let isValid = false;
    if (activeTab === 0) {
      isValid = validatePersonalTab();
    } else if (activeTab === 2) {
      isValid = validateBankTab();
    } else {
      isValid = true; // Other tabs don't need validation
    }

    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector(".input-field.error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setLoading(true);
      if (activeTab === 0) {
        await personalInfoAPI.updatePersonalInfo(employee.id, personalData);
        if (employeeData.phone) {
          await personalInfoAPI.updateEmployeePhone(
            employee.id,
            employeeData.phone
          );
        }
        if (activeTab !== 4) {
          setToastMessage("Personal Info saved successfully!");
          setToastSeverity("success");
          setToastOpen(true);
        }
      } else if (activeTab === 2) {
        await personalInfoAPI.updateCtC(
          employee.id,
          employeeData.ctc,
          employeeData.currency
        );
        await personalInfoAPI.updateBankInfo(employee.id, bankInfo);
        if (activeTab !== 4) {
          setToastMessage("Bank Info saved successfully!");
          setToastSeverity("success");
          setToastOpen(true);
        }
      } else if (activeTab === 4) {
        onSave(employeeData);
      } else {
        if (activeTab !== 4) {
          setToastMessage("Saved successfully!");
          setToastSeverity("success");
          setToastOpen(true);
        }
      }
      setLoading(false);
    } catch (error) {
      setToastMessage("Failed to save changes.");
      setToastSeverity("error");
      setToastOpen(true);
      setLoading(false);
    }
  };

  const getColorForStatus = (status) => {
    switch (status) {
      case "working":
        return "#22c55e";
      case "off":
        return "#ef4444";
      case "half":
        return "#eab308";
      default:
        return "#d1d5db";
    }
  };

  const getStatusForDay = (week, day) => {
    if (day === "fri" || day === "sat") {
      return "off";
    }
    return "working";
  };

  const renderWorkWeekTable = () => {
    const weeks = [1, 2, 3, 4, 5];
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dayLabels = {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    };

    return (
      <Paper elevation={0} className="work-week-paper">
        <Typography variant="h6" className="work-week-title">
          Fri & Sat Weekoffs
        </Typography>
        <div className="work-week-info">
          <div className="info-item">
            <Typography variant="subtitle2">Description</Typography>
            <Typography variant="body2">Custom Rule created</Typography>
          </div>
          <div className="info-item">
            <Typography variant="subtitle2">Effective Date</Typography>
            <Typography variant="body2">01 Dec, 2024</Typography>
          </div>
        </div>
        <div className="work-week-table-container">
          <table className="work-week-table">
            <thead>
              <tr>
                <th>Week</th>
                {days.map((day) => (
                  <th key={day}>{dayLabels[day]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week}>
                  <td>{week}</td>
                  {days.map((day) => {
                    const status = getStatusForDay(week, day);
                    return (
                      <td key={day}>
                        <div
                          className="status-indicator"
                          style={{ backgroundColor: getColorForStatus(status) }}
                        ></div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="color-legend">
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#22c55e" }}
            ></div>
            <span>Working Day</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ef4444" }}
            ></div>
            <span>Weekly Off</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#eab308" }}
            ></div>
            <span>Half Day</span>
          </div>
        </div>
      </Paper>
    );
  };

  const renderPhoneInput = (
    value,
    onChange,
    countryCode,
    showDropdown,
    setShowDropdown,
    onCountrySelect,
    type
  ) => {
    const selectedCountryData = countryCodes.find(
      (c) => c.code === countryCode
    );
    const phoneData = parsePhoneNumber(value);

    // ✅ Determine the correct field name for onBlur
    const getFieldName = () => {
      switch (type) {
        case "alternate":
          return "alternativePhone";
        case "emergency":
          return "emergencyContactPhone";
        default:
          return "phone"; // main phone
      }
    };
    const fieldName = getFieldName();

    return (
      <div className="phone-input-group">
        <div className="country-selector">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="country-button"
          >
            <ReactCountryFlag
              countryCode={selectedCountryData.code}
              svg
              style={{ width: "1.5em", height: "1.5em" }}
            />
            <span>{selectedCountryData.dialCode}</span>
          </button>

          {showDropdown && (
            <div className="country-dropdown">
              {countryCodes.map((country) => (
                <div
                  key={country.code}
                  onClick={() => onCountrySelect(country.code, type)}
                  className={`country-option ${
                    country.code === countryCode ? "active" : ""
                  }`}
                >
                  <ReactCountryFlag
                    countryCode={country.code}
                    svg
                    style={{ width: "1.5em", height: "1.5em" }}
                  />
                  <span>{country.name}</span>
                  <span>{country.dialCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneData.number}
          onChange={(e) => onChange(e, type)}
          onBlur={() =>
            handlePhoneBlur(getFieldName(), "personal", phoneData.countryCode)
          }
          placeholder="Enter phone number"
          className={`input-field ${
            personalErrors[getFieldName()] ? "error" : ""
          }`}
        />
        {personalErrors[fieldName] && (
          <span className="input-error">{personalErrors[fieldName]}</span>
        )}
      </div>
    );
  };

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      className="employee-dialog"
      sx={{
        "& .MuiDialog-paper": {
          height: isMobile ? "100vh" : "95vh",
          margin: isMobile ? 0 : 2,
          display: "flex",
          flexDirection: "column",
        },
        "& .MuiDialogContent-root": {
          flex: 1,
          overflowY: "auto",
        },
      }}
    >
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
      <DialogContent className="employee-dialog-content">
        {/* {loading ? (
          <div className="loading-container">
            <CircularProgress />
          </div>
        ) : ( */}
        <>
          <div className="employee-header">
            <Avatar
              src={"http://localhost:3000" + employeeData.avatar}
              alt={`${employeeData.firstName} ${employeeData.lastName}`}
              className="employee-avatar"
            />
            <div className="employee-info">
              <Typography variant="h5">
                {employeeData.firstName} {employeeData.lastName || "Unknown"}
              </Typography>
              <Typography variant="body2" className="employee-subtitle">
                {employeeData.jobTitle || "N/A"} •{" "}
                {employeeData.department || "N/A"}
              </Typography>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="employee-tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Personal" />
            <Tab label="Work Week" />
            <Tab label="Bank Details" />
            <Tab label="Documents" />
            <Tab label="Team" />
          </Tabs>

          <div className="tab-content">
            {activeTab === 0 && (
              <div className="personal-tab">
                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    PERSONAL INFO
                  </Typography>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Name</label>
                      <input
                        type="text"
                        value={`${employeeData.firstName || ""} ${
                          employeeData.middleName || ""
                        } ${employeeData.lastName || ""}`}
                        readOnly
                        className="input-field"
                      />
                    </div>
                    <div className="form-field">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={employeeData.dob || ""}
                        readOnly
                        className="input-field"
                      />
                    </div>
                    <div className="form-field">
                      <label>Gender</label>
                      <input
                        value={employeeData.gender || ""}
                        readOnly
                        className="input-field"
                      />
                    </div>
                    <div className="form-field">
                      <label>Blood Group</label>
                      <select
                        value={personalData?.bloodGroup}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "bloodGroup",
                            e.target.value
                          )
                        }
                        className="input-field"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Marital Status</label>
                      <select
                        value={personalData?.maritalStatus}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "maritalStatus",
                            e.target.value
                          )
                        }
                        className="input-field"
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                    {personalData?.maritalStatus === "married" && (
                      <div className="form-field">
                        <label>Marriage Anniversary</label>
                        <input
                          type="date"
                          value={personalData?.weddingAnniversary}
                          onChange={(e) =>
                            handlePersonalInputChange(
                              "weddingAnniversary",
                              e.target.value
                            )
                          }
                          className="input-field"
                        />
                      </div>
                    )}
                    <div className="form-field">
                      <label>Nationality</label>
                      <select
                        value={personalData?.nationality}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "nationality",
                            e.target.value
                          )
                        }
                        className="input-field"
                      >
                        <option value="">Select Nationality</option>
                        {nationalities.map((nat) => (
                          <option key={nat} value={nat}>
                            {nat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    CONTACT INFO
                  </Typography>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Official Email ID</label>
                      <input
                        type="email"
                        value={employeeData.email || ""}
                        readOnly
                        className="input-field"
                      />
                    </div>
                    <div className="form-field">
                      <label>Personal Email ID</label>
                      <input
                        type="email"
                        value={personalData?.email}
                        onChange={(e) =>
                          handlePersonalInputChange("email", e.target.value)
                        }
                        onBlur={() => handleBlur("email", "personal")}
                        className={`input-field ${
                          personalErrors.email ? "error" : ""
                        }`}
                      />
                      {personalErrors.email && (
                        <span className="input-error">
                          {personalErrors.email}
                        </span>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      {renderPhoneInput(
                        employeeData.phone || "",
                        handlePhoneChange,
                        selectedCountry,
                        showCountryDropdown,
                        setShowCountryDropdown,
                        handleCountrySelect,
                        "main"
                      )}
                    </div>
                    <div className="form-field">
                      <label>Alternate Phone Number</label>
                      {renderPhoneInput(
                        personalData?.alternativePhone || "",
                        handlePhoneChange,
                        alternateCountry,
                        showAlternateCountryDropdown,
                        setShowAlternateCountryDropdown,
                        handleCountrySelect,
                        "alternate"
                      )}
                    </div>
                  </div>
                </div>

                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    EMERGENCY CONTACT
                  </Typography>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Emergency Contact Name</label>
                      <input
                        type="text"
                        value={personalData?.emergencyContactName}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "emergencyContactName",
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          handleBlur("emergencyContactName", "personal")
                        }
                        className={`input-field ${
                          personalErrors.emergencyContactName ? "error" : ""
                        }`}
                      />
                      {personalErrors.emergencyContactName && (
                        <span className="input-error">
                          {personalErrors.emergencyContactName}
                        </span>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Emergency Contact Phone</label>
                      {renderPhoneInput(
                        personalData?.emergencyContactPhone || "",
                        handlePhoneChange,
                        emergencyCountry,
                        showEmergencyCountryDropdown,
                        setShowEmergencyCountryDropdown,
                        handleCountrySelect,
                        "emergency"
                      )}
                    </div>
                  </div>
                </div>

                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    ADDRESSES
                  </Typography>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Current Address</label>
                      <textarea
                        rows="3"
                        value={personalData?.currentAddress}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "currentAddress",
                            e.target.value
                          )
                        }
                        className="input-field"
                      />
                    </div>
                    <div className="form-field">
                      <label>Permanent Address</label>
                      <textarea
                        rows="3"
                        value={personalData?.permanentAddress}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "permanentAddress",
                            e.target.value
                          )
                        }
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    SOCIAL PROFILE
                  </Typography>
                  <div className="social-buttons">
                    <button
                      className="social-button linkedin"
                      onClick={() =>
                        window.open("https://www.linkedin.com", "_blank")
                      }
                    >
                      <LinkedIn />
                    </button>
                    <button
                      className="social-button facebook"
                      onClick={() =>
                        window.open("https://www.facebook.com", "_blank")
                      }
                    >
                      <Facebook />
                    </button>
                    <button
                      className="social-button twitter"
                      onClick={() =>
                        window.open("https://www.twitter.com", "_blank")
                      }
                    >
                      <Twitter />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="team-tab">
                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    Reporting Manager
                  </Typography>
                  {reportingManager && reportingManager.length > 0 ? (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportingManager.map((manager, index) => (
                            <tr key={index}>
                              <td>
                                {manager.firstName} {manager.midName || ""}{" "}
                                {manager.lastName || ""}
                              </td>
                              <td>{manager.type || "Primary"}</td>
                              <td>{manager.department || "N/A"}</td>
                              <td>{manager.designation || "N/A"}</td>
                              <td>
                                <IconButton
                                  onClick={() => handleRemoveManager(index)}
                                >
                                  <Trash2 size={20} />
                                </IconButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <select
                      value={employeeData.reportTo}
                      onChange={(e) => handleManagerSelection(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select Manager</option>
                      {managers
                        .filter((manager) => manager.id !== employeeData.id)
                        .map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {`${manager.firstName || ""} ${
                              manager.midName || ""
                            } ${manager.lastName || ""} - ${
                              manager.department || "N/A"
                            }`}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {ManagerList.includes(employeeData.designation) && (
                  <div className="section-tabs">
                    <Typography variant="h6" className="section-title">
                      Subordinates
                    </Typography>
                    {subOrdinates && subOrdinates.length > 0 ? (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Type</th>
                              <th>Department</th>
                              <th>Designation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subOrdinates.map((subordinate, index) => (
                              <tr key={index}>
                                <td>
                                  {subordinate.firstName || ""}{" "}
                                  {subordinate.midName || ""}{" "}
                                  {subordinate.lastName || ""}
                                </td>
                                <td>{subordinate.type || "Subordinate"}</td>
                                <td>{subordinate.department || "N/A"}</td>
                                <td>{subordinate.designation || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-data">No subordinates assigned.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 1 && renderWorkWeekTable()}

            {activeTab === 2 && (
              <div className="ctc-tab">
                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    COMPENSATION (CTC)
                  </Typography>
                  <div className="ctc-card">
                    <div className="ctc-display">
                      <div className="ctc-amount">
                        <span className="ctc-label">Annual CTC</span>
                        <div className="ctc-value">
                          <span className="currency-symbol">
                            {employeeData?.currency || "INR"}
                          </span>
                          <span className="amount">
                            {employeeData?.ctc
                              ? parseFloat(employeeData.ctc).toLocaleString()
                              : "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>CTC Amount (Annual) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={employeeData?.ctc || ""}
                          onChange={(e) =>
                            handleInputChange("ctc", e.target.value)
                          }
                          onBlur={() => handleBlur("ctc", "ctc")}
                          className={`input-field ${
                            ctcErrors.ctc ? "error" : ""
                          }`}
                          placeholder="Enter annual CTC"
                        />
                        {ctcErrors.ctc && (
                          <span className="input-error">{ctcErrors.ctc}</span>
                        )}
                      </div>
                      <div className="form-field">
                        <label>Currency *</label>
                        <select
                          value={employeeData?.currency || ""}
                          onChange={(e) =>
                            handleInputChange("currency", e.target.value)
                          }
                          className="input-field"
                        >
                          <option value="">Select Currency</option>
                          <option value={Currency.INR}>
                            Indian Rupee (INR)
                          </option>
                          <option value={Currency.USD}>
                            United States Dollar (USD)
                          </option>
                          <option value={Currency.EUR}>Euro (EUR)</option>
                          <option value={Currency.GBP}>
                            British Pound (GBP)
                          </option>
                          <option value={Currency.QAR}>
                            Qatari Riyal (QAR)
                          </option>
                          <option value={Currency.AUD}>
                            Australian Dollar (AUD)
                          </option>
                          <option value={Currency.CAD}>
                            Canadian Dollar (CAD)
                          </option>
                          <option value={Currency.JPY}>
                            Japanese Yen (JPY)
                          </option>
                          <option value={Currency.CNY}>
                            Chinese Yuan (CNY)
                          </option>
                          <option value={Currency.BRL}>
                            Brazilian Real (BRL)
                          </option>
                          <option value={Currency.CHF}>
                            Swiss Franc (CHF)
                          </option>
                        </select>
                      </div>
                    </div>
                    {employeeData?.ctc && employeeData?.currency && (
                      <div className="ctc-breakdown">
                        <div className="breakdown-item">
                          <span className="breakdown-label">Monthly CTC</span>
                          <span className="breakdown-value">
                            {employeeData.currency}{" "}
                            {(parseFloat(employeeData.ctc) / 12).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">
                            Daily CTC (approx)
                          </span>
                          <span className="breakdown-value">
                            {employeeData.currency}{" "}
                            {(
                              parseFloat(employeeData.ctc) / 365
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    BANK ACCOUNT DETAILS
                  </Typography>
                  <div className="bank-info-notice">
                    <span className="notice-icon">ℹ️</span>
                    <span>
                      Please ensure all bank details are accurate for salary
                      processing
                    </span>
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Account Holder Name *</label>
                      <input
                        type="text"
                        value={bankInfo?.accountHolderName || ""}
                        onChange={(e) =>
                          handleBankInputChange(
                            "accountHolderName",
                            e.target.value
                          )
                        }
                        onBlur={() => handleBlur("accountHolderName", "bank")}
                        className={`input-field ${
                          bankErrors.accountHolderName ? "error" : ""
                        }`}
                        placeholder="Enter account holder name"
                      />
                      {bankErrors.accountHolderName && (
                        <span className="input-error">
                          {bankErrors.accountHolderName}
                        </span>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Bank Name *</label>
                      <input
                        type="text"
                        value={bankInfo?.bankName || ""}
                        onChange={(e) =>
                          handleBankInputChange("bankName", e.target.value)
                        }
                        onBlur={() => handleBlur("bankName", "bank")}
                        className={`input-field ${
                          bankErrors.bankName ? "error" : ""
                        }`}
                        placeholder="Enter bank name"
                      />
                      {bankErrors.bankName && (
                        <span className="input-error">
                          {bankErrors.bankName}
                        </span>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Branch Name *</label>
                      <input
                        type="text"
                        value={bankInfo?.branchName || ""}
                        onChange={(e) =>
                          handleBankInputChange("branchName", e.target.value)
                        }
                        onBlur={() => handleBlur("branchName", "bank")}
                        className={`input-field ${
                          bankErrors.branchName ? "error" : ""
                        }`}
                        placeholder="Enter branch name"
                      />
                      {bankErrors.branchName && (
                        <span className="input-error">
                          {bankErrors.branchName}
                        </span>
                      )}
                    </div>
                    <div className="form-field">
                      <label>City *</label>
                      <input
                        type="text"
                        value={bankInfo?.city || ""}
                        onChange={(e) =>
                          handleBankInputChange("city", e.target.value)
                        }
                        onBlur={() => handleBlur("city", "bank")}
                        className={`input-field ${
                          bankErrors.city ? "error" : ""
                        }`}
                        placeholder="Enter city"
                      />
                      {bankErrors.city && (
                        <span className="input-error">{bankErrors.city}</span>
                      )}
                    </div>
                    <div className="form-field">
                      <label>IFSC Code *</label>
                      <input
                        type="text"
                        value={bankInfo?.ifscCode || ""}
                        onChange={(e) =>
                          handleBankInputChange(
                            "ifscCode",
                            e.target.value.toUpperCase()
                          )
                        }
                        onBlur={() => handleBlur("ifscCode", "bank")}
                        className={`input-field ${
                          bankErrors.ifscCode ? "error" : ""
                        }`}
                        placeholder="e.g., SBIN0001234"
                        maxLength="11"
                      />
                      {bankErrors.ifscCode && (
                        <span className="input-error">
                          {bankErrors.ifscCode}
                        </span>
                      )}
                      <span className="field-hint">11-character IFSC code</span>
                    </div>
                    <div className="form-field">
                      <label>Account Number *</label>
                      <input
                        type="text"
                        value={bankInfo?.accountNumber || ""}
                        onChange={(e) =>
                          handleBankInputChange("accountNumber", e.target.value)
                        }
                        onBlur={() => handleBlur("accountNumber", "bank")}
                        className={`input-field ${
                          bankErrors.accountNumber ? "error" : ""
                        }`}
                        placeholder="Enter account number"
                      />
                      {bankErrors.accountNumber && (
                        <span className="input-error">
                          {bankErrors.accountNumber}
                        </span>
                      )}
                      <span className="field-hint">
                        9-18 digit account number
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="documents-tab">
                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    Upload Documents
                  </Typography>
                  <div className="upload-form">
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Document Type</label>
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="input-field"
                        >
                          {documentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Choose File</label>
                        <input
                          id="documentFile"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.docx"
                          className="file-input"
                        />
                        {selectedFile && (
                          <span className="file-name">{selectedFile.name}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="contained"
                      onClick={handleUploadDocument}
                      disabled={loading || !selectedFile}
                      className="upload-btn"
                      style={{
                        marginTop: "20px",
                      }}
                    >
                      Upload Document
                    </Button>
                  </div>
                </div>

                <div className="section-tabs">
                  <Typography variant="h6" className="section-title">
                    Uploaded Documents
                  </Typography>
                  <div className="documents-grid">
                    {documents.length === 0 ? (
                      <p className="no-data">No documents uploaded yet</p>
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
                              onClick={() =>
                                window.open(
                                  `http://localhost:3000/${doc.filePath}`,
                                  "_blank"
                                )
                              }
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
                </div>
              </div>
            )}

            <div className="action-buttons">
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              {activeTab !== 3 &&
                activeTab !== 1 &&
                activeTab !== 5 &&
                activeTab !== 6 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <>SAVING...</> : "SAVE CHANGES"}
                  </Button>
                )}
            </div>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfileDialog;
