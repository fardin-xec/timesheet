import React, { useState, useEffect } from "react";
import { Check, X, Calendar } from "lucide-react";
import "../../styles/employee.css"; // This will be our new CSS file
import { Typography } from "@mui/material";

// Import enums to match the backend entity
const EmployeeStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ONLEAVE: "onleave",
  TERMINATED: "terminated",
};

const GenderType = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

const ProbationPeriod = {
  NONE: 0,
  DAYS_30: 30,
  DAYS_60: 60,
  DAYS_90: 90,
  DAYS_120: 120,
  DAYS_150: 150,
  DAYS_180: 180,
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
  BRL: "sBRL",
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
    id: null,
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    orgId: null,
    bio: "",
    status: EmployeeStatus.ACTIVE,
    designation: "",
    avatar: "",
    phone: "",
    jobTitle: "",
    gender: null,
    department: "",
    subdepartment: "",
    reportTo: "",
    positionName: "",
    employmentType: "",
    positionStatus: "",
    joiningDate: "",
    ctc: "",
    currency: "",
    address: "",
    isProbation: false,
    probationPeriod: ProbationPeriod.NONE,
    bank_info: {
      account_holder_name: "",
      bank_name: "",
      branch_name: "",
      city: "",
      ifsc_code: "",
      account_number: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [currentTab, setCurrentTab] = useState("mandatory"); // "mandatory", "optional"

  useEffect(() => {
    if (employee) {
      // Format any date fields to display properly
      const formattedEmployee = {
        ...employee,
        joiningDate: employee.joiningDate
          ? formatDateForInput(employee.joiningDate)
          : "",
      };

      setEmployeeData(formattedEmployee);
    }
  }, [employee]);

  // Helper function to format dates for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
  };

  const handleInputChange = (field, value) => {
    // Handle nested bank_info object fields
    if (field.startsWith("bank_info.")) {
      const bankField = field.split(".")[1];
      setEmployeeData((prev) => ({
        ...prev,
        bank_info: {
          ...prev.bank_info,
          [bankField]: value,
        },
      }));
    } else {
      setEmployeeData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear the error for the field being changed
    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const { firstName, lastName, email, employeeId } = employeeData;

    if (!firstName) newErrors.firstName = "First Name is required.";
    if (!lastName) newErrors.lastName = "Last Name is required.";
    if (!email) newErrors.email = "Email is required.";
    if (!employeeId) newErrors.employeeId = "Employee ID is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    console.log("click");

    if (validate()) {
      onSave(employeeData);
    } else {
      // Scroll to first error field and focus it
      const firstErrorField = document.querySelector(".input-field.error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
    }
  };

  const renderMandatoryInfo = () => (
    <div className="form-section">
      <div className="grid-cols-3">
        <div className="input-wrapper">
          <label className="input-label">First Name</label>
          <input
            type="text"
            className={`input-field ${errors.firstName ? "error" : ""}`}
            value={employeeData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            required
          />
          {errors.first_name && (
            <span className="input-error">{errors.firstName}</span>
          )}
        </div>
        <div className="input-wrapper">
          <label className="input-label">Middle Name</label>
          <input
            type="text"
            className={`input-field ${errors.middleName ? "error" : ""}`}
            value={employeeData.middleName}
            onChange={(e) => handleInputChange("middleName", e.target.value)}
            required
          />
          {errors.last_name && (
            <span className="input-error">{errors.middleName}</span>
          )}
        </div>
        <div className="input-wrapper">
          <label className="input-label">Last Name</label>
          <input
            type="text"
            className={`input-field ${errors.lastName ? "error" : ""}`}
            value={employeeData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            required
          />
          {errors.last_name && (
            <span className="input-error">{errors.lastName}</span>
          )}
        </div>
      </div>

      <div className="grid-cols-2">
        <div className="input-wrapper">
          <label className="input-label">Official Email ID</label>
          <input
            type="email"
            className={`input-field ${errors.email ? "error" : ""}`}
            value={employeeData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
          {errors.email && <span className="input-error">{errors.email}</span>}
        </div>
        <div className="input-wrapper">
          <label className="input-label flex items-center">
            Phone Number
          </label>
          <input
            type="tel"
            className={`input-field ${errors.phone ? "error" : ""}`}
            value={employeeData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
          {errors.phone && <span className="input-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="input-wrapper">
        <label className="input-label">Status</label>
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
          className="button button-primary"
          onClick={() => setCurrentTab("optional")}
          type="button"
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
            <label className="input-label flex items-center">
              Date of Birth
            </label>
            <div className="input-with-icon">
              <input
                type="date"
                className="input-field"
                value={employeeData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
              />
              <Calendar size={16} className="icon" />
            </div>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Select Gender</label>
            <div className="gender-button-group">
              <button
                className={`gender-button ${
                  employeeData.gender === GenderType.MALE ? "selected" : ""
                }`}
                onClick={() => handleInputChange("gender", GenderType.MALE)}
                type="button"
              >
                Male
              </button>
              <button
                className={`gender-button ${
                  employeeData.gender === GenderType.FEMALE ? "selected" : ""
                }`}
                onClick={() => handleInputChange("gender", GenderType.FEMALE)}
                type="button"
              >
                Female
              </button>
              <button
                className={`gender-button ${
                  employeeData.gender === GenderType.OTHER ? "selected" : ""
                }`}
                onClick={() => handleInputChange("gender", GenderType.OTHER)}
                type="button"
              >
                Other
              </button>
            </div>
          </div>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={employeeData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className={`w-full p-2 border rounded-md ${
                errors.department ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="" disabled hidden>
                Select Department
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <span className="text-red-500 text-sm">{errors.department}</span>
            )}
          </div>
          <div>
            <Typography variant="subtitle2" className="text-gray-500 mb-1">
              Sub-Department
            </Typography>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={employeeData.subdepartment || ""}
              onChange={(e) =>
                handleInputChange("subdepartment", e.target.value)
              }
            >
              <option value="">Select Sub-Department</option>
              {subdepartment.map((Subdept) => (
                <option key={Subdept.id} value={Subdept.name}>
                  {Subdept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <select
              value={employeeData.designation}
              onChange={(e) => handleInputChange("designation", e.target.value)}
              className={`w-full p-2 border rounded-md ${
                errors.designation ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="" disabled hidden>
                Select Designation
              </option>
              {designations.map((desg) => (
                <option key={desg.id} value={desg.name}>
                  {desg.name}
                </option>
              ))}
            </select>
            {errors.designation && (
              <span className="text-red-500 text-sm">{errors.designation}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Location
            </label>
            <select
              value={employeeData.workLocation}
              onChange={(e) =>
                handleInputChange("workLocation", e.target.value)
              }
              className={`w-full p-2 border rounded-md ${
                errors.workLocation ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="" disabled hidden>
                Select Work Location
              </option>
              {workLocation.map((workLoc) => (
                <option key={workLoc.id} value={workLoc.name}>
                  {workLoc.name}
                </option>
              ))}
            </select>
            {errors.workLocation && (
              <span className="text-red-500 text-sm">
                {errors.workLocation}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <select
              value={employeeData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className={`w-full p-2 border rounded-md ${
                errors.jobTitle ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="" disabled hidden>
                Select Job Title
              </option>
              {jobTitle.map((jbTitle) => (
                <option key={jbTitle.id} value={jbTitle.name}>
                  {jbTitle.name}
                </option>
              ))}
            </select>
            {errors.designation && (
              <span className="text-red-500 text-sm">{errors.designation}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <select
              value={employeeData.employmentType}
              onChange={(e) =>
                handleInputChange("employmentType", e.target.value)
              }
              className={`w-full p-2 border rounded-md ${
                errors.employmentType ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="" disabled hidden>
                Select Employment Type
              </option>
              {employmentType.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.employmentType && (
              <span className="text-red-500 text-sm">
                {errors.employmentType}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reporting Manager
            </label>
            <select
              value={employeeData.reportTo}
              onChange={(e) => handleInputChange("reportTo", e.target.value)}
              className={`w-full p-2 border rounded-md ${
                errors.reportTo ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value="" disabled hidden>
                Select Reporting Manager
              </option>
              {managers.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.midName} {emp.lastName} .{" "}
                  {emp.department}
                </option>
              ))}
            </select>
            {errors.reportTo && (
              <span className="text-red-500 text-sm">{errors.reportTo}</span>
            )}
          </div>

          <div className="input-wrapper">
            <label className="input-label flex items-center">
              Date of Joining
            </label>
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
      </div>

      <div className="form-section">
        <h2 className="section-header">EMPLOYMENT DETAILS</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* ... other employment fields ... */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Probation Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  checked={employeeData.isProbation === true}
                  onChange={() => handleInputChange("isProbation", true)}
                />
                <span className="ml-2">On Probation</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  checked={employeeData.isProbation === false}
                  onChange={() => handleInputChange("isProbation", false)}
                />
                <span className="ml-2">Confirmed</span>
              </label>
            </div>
          </div>

          {employeeData.isProbation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probation Period (Days)
              </label>
              <select
                value={employeeData.probationPeriod}
                onChange={(e) =>
                  handleInputChange("probationPeriod", e.target.value)
                }
                className="w-full p-2 border rounded-md border-gray-300"
              >
                <option value={ProbationPeriod.NONE}></option>
                <option value={ProbationPeriod.DAYS_30}>30 Days</option>
                <option value={ProbationPeriod.DAYS_60}>60 Days</option>
                <option value={ProbationPeriod.DAYS_90}>90 Days</option>
                <option value={ProbationPeriod.DAYS_120}>120 Days</option>
                <option value={ProbationPeriod.DAYS_150}>150 Days</option>
                <option value={ProbationPeriod.DAYS_180}>180 Days</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-header">SALARY DETAILS</h2>
        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">CTC</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={employeeData.ctc}
              onChange={(e) => handleInputChange("ctc", e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={employeeData.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className="w-full p-2 border rounded-md border-gray-300"
            >
              <option value={""}></option>
              <option value={Currency.QAR}>Qatari Riyal (QAR)</option>
              <option value={Currency.INR}>Indian Rupee (INR)</option>
              <option value={Currency.USD}>United States Dollar (USD)</option>
              <option value={Currency.EUR}>Euro (EUR)</option>
              <option value={Currency.GBP}>British Pound (GBP)</option>
              <option value={Currency.AUD}>'Australian Dollar (AUD)</option>
              <option value={Currency.CAD}>Canadian Dollar (CAD)</option>
              <option value={Currency.JPY}>Japanese Yen (JPY)</option>
              <option value={Currency.CNY}>Chinese Yuan (CNY)</option>
              <option value={Currency.BRL}>Brazilian Real (BRL)</option>
            </select>
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">Account Holder's Name</label>
          <input
            type="text"
            className="input-field bg-highlight"
            value={employeeData.bank_info.account_holder_name}
            onChange={(e) =>
              handleInputChange("bank_info.account_holder_name", e.target.value)
            }
          />
        </div>

        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">Bank Name</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.bank_info.bank_name}
              onChange={(e) =>
                handleInputChange("bank_info.bank_name", e.target.value)
              }
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">City</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.bank_info.city}
              onChange={(e) =>
                handleInputChange("bank_info.city", e.target.value)
              }
            />
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">Branch Name</label>
          <input
            type="text"
            className="input-field"
            value={employeeData.bank_info.branch_name}
            onChange={(e) =>
              handleInputChange("bank_info.branch_name", e.target.value)
            }
          />
        </div>

        <div className="grid-cols-2">
          <div className="input-wrapper">
            <label className="input-label">IFSC Code</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.bank_info.ifsc_code}
              onChange={(e) =>
                handleInputChange("bank_info.ifsc_code", e.target.value)
              }
            />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Account Number</label>
            <input
              type="text"
              className="input-field"
              value={employeeData.bank_info.account_number}
              onChange={(e) =>
                handleInputChange("bank_info.account_number", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="button-group">
        <button
          className="button button-outlined"
          onClick={() => setCurrentTab("mandatory")}
          type="button"
        >
          BACK
        </button>
        <button
          className="button button-primary"
          onClick={handleSave}
          type="button"
        >
          SAVE
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
          {employeeData.avatar ? (
            <img
              src={employeeData.avatar}
              alt={`${employeeData.first_name} ${employeeData.last_name}`}
            />
          ) : (
            <span>{employeeData.first_name?.charAt(0) || "N"}</span>
          )}
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
