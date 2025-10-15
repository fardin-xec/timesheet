import React, { useState, useEffect } from "react";
import { Check, X, Calendar, Loader } from "lucide-react";
import "../../styles/employee.css";
import ReactCountryFlag from "react-country-flag";

// Enums matching backend
const EmployeeStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ONLEAVE: "onleave",
  TERMINATED: "terminated",
};

const Gender = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

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

// Country codes with dial codes
const COUNTRIES = [
  { code: "US", dialCode: "+1", name: "United States" },
  { code: "IN", dialCode: "+91", name: "India" },
  { code: "GB", dialCode: "+44", name: "United Kingdom" },
  { code: "CA", dialCode: "+1", name: "Canada" },
  { code: "AU", dialCode: "+61", name: "Australia" },
  { code: "DE", dialCode: "+49", name: "Germany" },
  { code: "FR", dialCode: "+33", name: "France" },
  { code: "JP", dialCode: "+81", name: "Japan" },
  { code: "CN", dialCode: "+86", name: "China" },
  { code: "BR", dialCode: "+55", name: "Brazil" },
  { code: "MX", dialCode: "+52", name: "Mexico" },
  { code: "IT", dialCode: "+39", name: "Italy" },
  { code: "ES", dialCode: "+34", name: "Spain" },
  { code: "NL", dialCode: "+31", name: "Netherlands" },
  { code: "SE", dialCode: "+46", name: "Sweden" },
  { code: "CH", dialCode: "+41", name: "Switzerland" },
  { code: "SG", dialCode: "+65", name: "Singapore" },
  { code: "AE", dialCode: "+971", name: "UAE" },
  { code: "SA", dialCode: "+966", name: "Saudi Arabia" },
  { code: "QA", dialCode: "+974", name: "Qatar" },
  { code: "ZA", dialCode: "+27", name: "South Africa" },
];

// Phone number length by country code
const PHONE_LENGTH_BY_COUNTRY = {
  US: 10, CA: 10, IN: 10, GB: 10, AU: 9,
  DE: 11, FR: 9, JP: 10, CN: 11, BR: 11,
  MX: 10, IT: 10, ES: 9, NL: 9, SE: 9,
  CH: 9, SG: 8, AE: 9, SA: 9, QA: 8, ZA: 9,
};

const EmployeeForm = ({
  employee,
  departments = [],
  workLocation = [],
  employmentType = [],
  managers = [],
  designations = [],
  subdepartment = [],
  jobTitle = [],
  onSave,
  onCancel,
}) => {
  const [employeeData, setEmployeeData] = useState({
    // Mandatory fields
    firstName: "",
    lastName: "",
    midName: "",
    email: "",
    phone: "",
    role: "",
    status: EmployeeStatus.ACTIVE,

    // Optional fields
    dob: "",
    gender: "",
    department: "",
    jobTitle: "",
    address: "",
    designation: "",
    employmentType: "",
    joiningDate: "",
    bio: "",
    reportTo: null,
    orgId: null,
    workLocation: "",

    // Salary Information
    ctc: "",
    currency: "",

    // Bank Information
    accountHolderName: "",
    bankName: "",
    city: "",
    branchName: "",
    ifscCode: "",
    accountNumber: "",

    // Document Information
    qid: "",
    qidExpirationDate: "",
    passportNumber: "",
    passportValidTill: "",
  });

  const [errors, setErrors] = useState({});
  const [currentTab, setCurrentTab] = useState("mandatory");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[1]); // Default to India
  const [isSaving, setIsSaving] = useState(false);
  const [mandatoryErrors, setMandatoryErrors] = useState({});

  useEffect(() => {
    if (employee) {
      const formattedEmployee = {
        ...employee,
        dob: employee.dob ? formatDateForInput(employee.dob) : "",
        joiningDate: employee.joiningDate
          ? formatDateForInput(employee.joiningDate)
          : "",
        qidExpirationDate: employee.qidExpirationDate
          ? formatDateForInput(employee.qidExpirationDate)
          : "",
        passportValidTill: employee.passportValidTill
          ? formatDateForInput(employee.passportValidTill)
          : "",
      };

      setEmployeeData(formattedEmployee);
    }
  }, [employee]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getMaxDobDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split("T")[0];
  };

  const handleInputChange = (field, value) => {
    setEmployeeData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }

    if (mandatoryErrors[field]) {
      setMandatoryErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };

  const validatePhoneNumber = (phone, countryCode) => {
    const expectedLength = PHONE_LENGTH_BY_COUNTRY[countryCode];
    const phoneDigitsOnly = phone.replace(/\D/g, "");

    if (!phoneDigitsOnly) {
      return { valid: false, message: "Phone number is required" };
    }

    if (phoneDigitsOnly.length !== expectedLength) {
      return {
        valid: false,
        message: `Phone number should be ${expectedLength} digits for ${countryCode}`,
      };
    }

    return { valid: true, message: "" };
  };

  const validateMandatoryFields = () => {
    const newErrors = {};
    const { firstName, lastName, email, phone, role, status } = employeeData;

    if (!firstName) newErrors.firstName = "First name is required.";
    if (!lastName) newErrors.lastName = "Last name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email must be a valid email address.";

    if (!phone) {
      newErrors.phone = "Phone number is required.";
    } else {
      const phoneValidation = validatePhoneNumber(phone, selectedCountry.code);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.message;
      }
    }

    if (!role) newErrors.role = "Role is required.";
    if (!status) newErrors.status = "Status is required.";

    setMandatoryErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = () => {
    return validateMandatoryFields();
  };

  const handleSave = async () => {
    if (validate()) {
      setIsSaving(true);
      try {
        await onSave(employeeData);
      } catch (error) {
        console.error("Error saving employee:", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      const firstErrorField = document.querySelector(".input-field.error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    if (mandatoryErrors.phone) {
      setMandatoryErrors({ ...mandatoryErrors, phone: "" });
    }
  };

  const handleNextTab = () => {
    if (validateMandatoryFields()) {
      setCurrentTab("optional");
    } else {
      const firstErrorField = document.querySelector(".input-field.error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
    }
  };

  const isMandatoryValid = () => {
    const { firstName, lastName, email, phone, role, status } = employeeData;
    
    if (!firstName || !lastName || !email || !phone || !role || !status) {
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false;
    }

    const phoneValidation = validatePhoneNumber(phone, selectedCountry.code);
    return phoneValidation.valid;
  };

  const renderMandatoryInfo = () => (
    <div className="form-section">
      <div className="grid-cols-3">
        <div className="input-wrapper">
          <label className="input-label">First Name *</label>
          <input
            type="text"
            className={`input-field ${mandatoryErrors.firstName ? "error" : ""}`}
            value={employeeData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            required
          />
          {mandatoryErrors.firstName && (
            <span className="input-error">{mandatoryErrors.firstName}</span>
          )}
        </div>
        <div className="input-wrapper">
          <label className="input-label">Middle Name</label>
          <input
            type="text"
            className={`input-field ${mandatoryErrors.midName ? "error" : ""}`}
            value={employeeData.midName}
            onChange={(e) => handleInputChange("midName", e.target.value)}
          />
          {mandatoryErrors.midName && (
            <span className="input-error">{mandatoryErrors.midName}</span>
          )}
        </div>
        <div className="input-wrapper">
          <label className="input-label">Last Name *</label>
          <input
            type="text"
            className={`input-field ${mandatoryErrors.lastName ? "error" : ""}`}
            value={employeeData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            required
          />
          {mandatoryErrors.lastName && (
            <span className="input-error">{mandatoryErrors.lastName}</span>
          )}
        </div>
      </div>

      <div className="grid-cols-2">
        <div className="input-wrapper">
          <label className="input-label">Official Email ID *</label>
          <input
            type="email"
            className={`input-field ${mandatoryErrors.email ? "error" : ""}`}
            value={employeeData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
          {mandatoryErrors.email && (
            <span className="input-error">{mandatoryErrors.email}</span>
          )}
        </div>

        <div className="input-wrapper">
          <label className="input-label">Phone Number *</label>
          <div className="mobile-input-group">
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="country-dropdown-btn"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                style={{ width: "20px" }}
              >
                <span style={{ fontSize: "1rem" }}>
                  <ReactCountryFlag
                    countryCode={selectedCountry.code}
                    svg
                    style={{ width: "1em", height: "1em" }}
                  />
                </span>
                <span>{selectedCountry.dialCode}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showCountryDropdown && (
                <div className="country-dropdown-menu" style={{ width: "180px" }}>
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      className={`country-dropdown-item ${
                        selectedCountry.code === country.code ? "selected" : ""
                      }`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span style={{ fontSize: "1.25rem" }}>
                        <ReactCountryFlag
                          countryCode={country.code}
                          svg
                          style={{ width: "1.25em", height: "1.25em" }}
                        />
                      </span>
                      <span className="country-name">{country.code}</span>
                      <span className="country-dial">{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your mobile number"
                value={employeeData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className={`input-field ${mandatoryErrors.phone ? "error" : ""}`}
                style={{ height: "2.7rem" }}
              />
            </div>
          </div>
          {mandatoryErrors.phone && (
            <span className="input-error">{mandatoryErrors.phone}</span>
          )}
        </div>
      </div>

      <div className="input-wrapper">
        <label className="input-label">Role *</label>
        <select
          value={employeeData.role}
          onChange={(e) => handleInputChange("role", e.target.value)}
          className={`input-field ${mandatoryErrors.role ? "error" : ""}`}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        {mandatoryErrors.role && (
          <span className="input-error">{mandatoryErrors.role}</span>
        )}
      </div>

      <div className="input-wrapper">
        <label className="input-label">Status *</label>
        <div className="status-button-group">
          <button
            className={`status-button ${
              employeeData.status === EmployeeStatus.ACTIVE
                ? "active-status"
                : ""
            }`}
            onClick={() => handleInputChange("status", EmployeeStatus.ACTIVE)}
            type="button"
          >
            <Check size={16} className="status-icon" />
            <span>Active</span>
          </button>
          <button
            className={`status-button ${
              employeeData.status === EmployeeStatus.INACTIVE
                ? "inactive-status"
                : ""
            }`}
            onClick={() => handleInputChange("status", EmployeeStatus.INACTIVE)}
            type="button"
          >
            <X size={16} className="status-icon" />
            <span>Inactive</span>
          </button>
          <button
            className={`status-button ${
              employeeData.status === EmployeeStatus.ONLEAVE
                ? "onleave-status"
                : ""
            }`}
            onClick={() => handleInputChange("status", EmployeeStatus.ONLEAVE)}
            type="button"
          >
            <Calendar size={16} className="status-icon" />
            <span>On Leave</span>
          </button>
          <button
            className={`status-button ${
              employeeData.status === EmployeeStatus.TERMINATED
                ? "terminated-status"
                : ""
            }`}
            onClick={() =>
              handleInputChange("status", EmployeeStatus.TERMINATED)
            }
            type="button"
          >
            <X size={16} className="status-icon" />
            <span>Terminated</span>
          </button>
        </div>
      </div>

      <div className="button-group">
        <button
          className="button button-outlined"
          onClick={onCancel}
          type="button"
        >
          CANCEL
        </button>
        <button
          className={`button button-primary ${!isMandatoryValid() ? "disabled" : ""}`}
          onClick={handleNextTab}
          type="button"
          disabled={!isMandatoryValid()}
        >
          NEXT
        </button>
      </div>
    </div>
  );

  const renderOptionalInfo = () => (
    <div>
      <div className="form-section">
        <h2 className="section-header">PERSONAL</h2>
        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">Date of Birth</label>
            <div className="input-with-icon">
              <input
                type="date"
                className="input-field"
                value={employeeData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                max={getMaxDobDate()}
              />
              <Calendar size={16} className="icon" />
            </div>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Gender</label>
            <div className="gender-button-group">
              <button
                className={`gender-button ${
                  employeeData.gender === Gender.MALE ? "selected" : ""
                }`}
                onClick={() => handleInputChange("gender", Gender.MALE)}
                type="button"
              >
                Male
              </button>
              <button
                className={`gender-button ${
                  employeeData.gender === Gender.FEMALE ? "selected" : ""
                }`}
                onClick={() => handleInputChange("gender", Gender.FEMALE)}
                type="button"
              >
                Female
              </button>
              <button
                className={`gender-button ${
                  employeeData.gender === Gender.OTHER ? "selected" : ""
                }`}
                onClick={() => handleInputChange("gender", Gender.OTHER)}
                type="button"
              >
                Other
              </button>
            </div>
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">Bio</label>
          <textarea
            className="input-field text-area"
            rows={3}
            value={employeeData.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label">Address</label>
          <textarea
            className="input-field text-area"
            rows={3}
            value={employeeData.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-header">WORK</h2>
        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">Department</label>
            <select
              value={employeeData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className="input-field"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Designation</label>
            <select
              value={employeeData.designation}
              onChange={(e) => handleInputChange("designation", e.target.value)}
              className="input-field"
            >
              <option value="">Select Designation</option>
              {designations.map((desg) => (
                <option key={desg.id} value={desg.name}>
                  {desg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">Job Title</label>
            <select
              value={employeeData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="input-field"
            >
              <option value="">Select Job Title</option>
              {jobTitle.map((jbTitle) => (
                <option key={jbTitle.id} value={jbTitle.name}>
                  {jbTitle.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Work Location</label>
            <select
              value={employeeData.workLocation}
              onChange={(e) => handleInputChange("workLocation", e.target.value)}
              className="input-field"
            >
              <option value="">Select Work Location</option>
              {workLocation.map((workLoc) => (
                <option key={workLoc.id} value={workLoc.name}>
                  {workLoc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">Employment Type</label>
            <select
              value={employeeData.employmentType}
              onChange={(e) =>
                handleInputChange("employmentType", e.target.value)
              }
              className="input-field"
            >
              <option value="">Select Employment Type</option>
              {employmentType.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Reporting Manager</label>
            <select
              value={employeeData.reportTo || ""}
              onChange={(e) =>
                handleInputChange(
                  "reportTo",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="input-field"
            >
              <option value="">Select Reporting Manager</option>
              {managers.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.midName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">Date of Joining</label>
          <div className="input-with-icon">
            <input
              type="date"
              className="input-field"
              value={employeeData.joiningDate}
              onChange={(e) =>
                handleInputChange("joiningDate", e.target.value)
              }
            />
            <Calendar size={16} className="icon" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-header">SALARY DETAILS</h2>
        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">CTC</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.ctc}
              onChange={(e) => handleInputChange("ctc", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Currency</label>
            <select
              value={employeeData.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className="input-field"
            >
              <option value="">Select Currency</option>
              <option value={Currency.QAR}>Qatari Riyal (QAR)</option>
              <option value={Currency.INR}>Indian Rupee (INR)</option>
              <option value={Currency.USD}>United States Dollar (USD)</option>
              <option value={Currency.EUR}>Euro (EUR)</option>
              <option value={Currency.GBP}>British Pound (GBP)</option>
              <option value={Currency.AUD}>Australian Dollar (AUD)</option>
              <option value={Currency.CAD}>Canadian Dollar (CAD)</option>
              <option value={Currency.JPY}>Japanese Yen (JPY)</option>
              <option value={Currency.CNY}>Chinese Yuan (CNY)</option>
              <option value={Currency.BRL}>Brazilian Real (BRL)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-header">BANK INFORMATION</h2>
        <div className="input-wrapper">
          <label className="input-label">Account Holder's Name</label>
          <input
            type="text"
            className="input-field"
            value={employeeData.accountHolderName}
            onChange={(e) =>
              handleInputChange("accountHolderName", e.target.value)
            }
          />
        </div>

        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">Bank Name</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">City</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">Branch Name</label>
          <input
            type="text"
            className="input-field"
            value={employeeData.branchName}
            onChange={(e) => handleInputChange("branchName", e.target.value)}
          />
        </div>

        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">IFSC Code</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.ifscCode}
              onChange={(e) => handleInputChange("ifscCode", e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Account Number</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.accountNumber}
              onChange={(e) =>
                handleInputChange("accountNumber", e.target.value)
              }
              placeholder="9-18 digits"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-header">DOCUMENT INFORMATION</h2>
        {employeeData.workLocation === "On-site" && (
          <>
            <div className="grid-cols-2">
              <div className="input-wrapper">
                <label className="input-label">QID</label>
                <input
                  type="text"
                  className="input-field"
                  value={employeeData.qid}
                  onChange={(e) => handleInputChange("qid", e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label className="input-label">QID Expiration Date</label>
                <div className="input-with-icon">
                  <input
                    type="date"
                    className="input-field"
                    value={employeeData.qidExpirationDate}
                    onChange={(e) =>
                      handleInputChange("qidExpirationDate", e.target.value)
                    }
                  />
                  <Calendar size={16} className="icon" />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">Passport Number</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.passportNumber}
              onChange={(e) =>
                handleInputChange("passportNumber", e.target.value)
              }
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Passport Valid Till</label>
            <div className="input-with-icon">
              <input
                type="date"
                className="input-field"
                value={employeeData.passportValidTill}
                onChange={(e) =>
                  handleInputChange("passportValidTill", e.target.value)
                }
              />
              <Calendar size={16} className="icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button
          className="button button-outlined"
          onClick={() => setCurrentTab("mandatory")}
          type="button"
          disabled={isSaving}
        >
          BACK
        </button>
        <button
          className={`button button-primary ${isSaving ? "loading" : ""}`}
          onClick={handleSave}
          type="button"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader size={18} className="spinner" style={{ marginRight: "8px" }} />
              SAVING...
            </>
          ) : (
            "SAVE"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="employee-form-container">
      <div className="form-tabs">
        <button
          className={`form-tab-button ${
            currentTab === "mandatory" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("mandatory")}
          type="button"
        >
          Mandatory Info
        </button>
        <button
          className={`form-tab-button ${
            currentTab === "optional" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("optional")}
          type="button"
        >
          Optional Info
        </button>
      </div>

      <div className="employee-profile">
        <div className="avatar">
          <span>{employeeData.firstName?.charAt(0) || "N"}</span>
        </div>
        <div className="profile-info">
          <div className="profile-name">
            {employee ? "Edit Employee" : "New Employee"}
          </div>
        </div>
      </div>

      <div className="form-content">
        {currentTab === "mandatory"
          ? renderMandatoryInfo()
          : renderOptionalInfo()}
      </div>
    </div>
  );
};

export default EmployeeForm;