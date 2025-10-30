import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import Button from "../common/Button";
import Loader from "../common/Loader";
import Toast from "../common/Toast";
import "../../styles/loginForm.css";
import { useAuth } from "../../redux/hooks/useAuth";

// Country codes with dial codes
const COUNTRIES = [
  { code: "US", dialCode: "+1", name: "United States" },
  { code: "IN", dialCode: "+91", name: "India" },
  { code: "QA", dialCode: "+974", name: "Qatar" },
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
  { code: "ZA", dialCode: "+27", name: "South Africa" },
];

// Phone number length by country code
const PHONE_LENGTH_BY_COUNTRY = {
  US: 10,
  CA: 10,
  IN: 10,
  QA: 8,
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
  ZA: 9,
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const LoginForm = () => {
  const [loginMethod, setLoginMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[1]); // Default to India
  const [attemptCount, setAttemptCount] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    mobile: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  // Validation functions
  const validateEmail = (email) => {
    if (!email || !email.trim()) {
      return { valid: false, message: "Email is required" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Please enter a valid email address" };
    }
    return { valid: true, message: "" };
  };

  const validatePhoneNumber = (phone, countryCode) => {
    if (!phone || !phone.trim()) {
      return { valid: false, message: "Phone number is required" };
    }

    const expectedLength = PHONE_LENGTH_BY_COUNTRY[countryCode];
    const phoneDigitsOnly = phone.replace(/\D/g, "");

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

  const validatePassword = (password) => {
    if (!password || !password.trim()) {
      return { valid: false, message: "Password is required" };
    }
    if (password.length < 6) {
      return {
        valid: false,
        message: "Password must be at least 6 characters",
      };
    }
    return { valid: true, message: "" };
  };

  // Initialize login attempts from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem("loginAttempts");
    const lockoutTimestamp = localStorage.getItem("loginLockoutTime");
    const currentTime = Date.now();

    if (lockoutTimestamp) {
      const lockoutTime = parseInt(lockoutTimestamp);
      const timePassed = currentTime - lockoutTime;

      if (timePassed < LOCKOUT_DURATION) {
        setIsAccountLocked(true);
        setLockoutTimeRemaining(
          Math.ceil((LOCKOUT_DURATION - timePassed) / 1000)
        );
      } else {
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("loginLockoutTime");
        setIsAccountLocked(false);
        setAttemptCount(0);
      }
    } else if (storedAttempts) {
      setAttemptCount(parseInt(storedAttempts));
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    let timer;
    if (isAccountLocked && lockoutTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockoutTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsAccountLocked(false);
            localStorage.removeItem("loginAttempts");
            localStorage.removeItem("loginLockoutTime");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAccountLocked, lockoutTimeRemaining]);

  // Handle failed login attempts
  const handleFailedAttempt = (errorMessage) => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    localStorage.setItem("loginAttempts", newAttemptCount.toString());

    const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttemptCount;

    if (newAttemptCount >= MAX_LOGIN_ATTEMPTS) {
      setIsAccountLocked(true);
      setLockoutTimeRemaining(Math.ceil(LOCKOUT_DURATION / 1000));
      localStorage.setItem("loginLockoutTime", Date.now().toString());

      setToast({
        open: true,
        message: `Account locked due to too many failed attempts. Please try again after ${Math.ceil(
          LOCKOUT_DURATION / 60000
        )} minutes.`,
        severity: "error",
      });
    } else {
      setToast({
        open: true,
        message: `${errorMessage}. Remaining attempts: ${remainingAttempts}`,
        severity: "error",
      });
    }
  };

  // Reset login attempts on successful login
  const resetLoginAttempts = () => {
    localStorage.removeItem("loginAttempts");
    localStorage.removeItem("loginLockoutTime");
    setAttemptCount(0);
    setIsAccountLocked(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (field) => {
    const newErrors = { ...errors };

    if (field === "email" && loginMethod === "email") {
      const validation = validateEmail(formData.email);
      if (!validation.valid) {
        newErrors.email = validation.message;
      } else {
        delete newErrors.email;
      }
    } else if (field === "mobile" && loginMethod === "mobile") {
      const validation = validatePhoneNumber(
        formData.mobile,
        selectedCountry.code
      );
      if (!validation.valid) {
        newErrors.mobile = validation.message;
      } else {
        delete newErrors.mobile;
      }
    } else if (field === "password") {
      const validation = validatePassword(formData.password);
      if (!validation.valid) {
        newErrors.password = validation.message;
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginMethod === "email") {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.message;
      }
    } else {
      const phoneValidation = validatePhoneNumber(
        formData.mobile,
        selectedCountry.code
      );
      if (!phoneValidation.valid) {
        newErrors.mobile = phoneValidation.message;
      }
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    // Clear phone error when country changes
    if (errors.mobile) {
      setErrors({ ...errors, mobile: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if account is locked
    if (isAccountLocked) {
      setToast({
        open: true,
        message: `Account is locked. Please try again in ${lockoutTimeRemaining} seconds.`,
        severity: "error",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector(".input-field.error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      let credentials = {};

      if (loginMethod === "email") {
        credentials = {
          email: formData.email,
          password: formData.password,
        };
      } else {
        credentials = {
          mobile: selectedCountry.dialCode + formData.mobile.replace(/\D/g, ""),
          password: formData.password,
        };
      }

      await login(credentials);

      // Reset login attempts on successful login
      resetLoginAttempts();

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      handleFailedAttempt(
        error.message || "Login failed. Please check your credentials."
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Login Attempts Warning */}
        {!isAccountLocked && attemptCount > 0 && (
          <div
            className="attempt-warning"
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: "12px 16px",
              borderRadius: "4px",
              marginBottom: "16px",
              border: "1px solid #ffeeba",
            }}
          >
            <strong>Warning:</strong> {MAX_LOGIN_ATTEMPTS - attemptCount}{" "}
            attempt{MAX_LOGIN_ATTEMPTS - attemptCount !== 1 ? "s" : ""}{" "}
            remaining
          </div>
        )}

        {/* Account Locked Message */}
        {isAccountLocked && (
          <div
            className="lockout-warning"
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px 16px",
              borderRadius: "4px",
              marginBottom: "16px",
              border: "1px solid #f5c6cb",
            }}
          >
            <strong>Account Locked:</strong> Too many failed attempts. Try again
            in {formatTime(lockoutTimeRemaining)}
          </div>
        )}

        {/* Login Method Toggle */}
        <div className="login-method-toggle">
          <button
            type="button"
            className={`toggle-btn ${loginMethod === "email" ? "active" : ""}`}
            onClick={() => setLoginMethod("email")}
            disabled={isAccountLocked}
          >
            Email
          </button>
          <button
            type="button"
            className={`toggle-btn ${loginMethod === "mobile" ? "active" : ""}`}
            onClick={() => setLoginMethod("mobile")}
            disabled={isAccountLocked}
          >
            Mobile
          </button>
        </div>

        {/* Email input */}
        {loginMethod === "email" && (
          <div className="form-field">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              className={`input-field ${errors.email ? "error" : ""}`}
              disabled={isAccountLocked}
            />
            {errors.email && (
              <span className="input-error">{errors.email}</span>
            )}
          </div>
        )}

        {/* Mobile input with Country Code */}
        {loginMethod === "mobile" && (
          <div className="mobile-input-group">
            <label className="input-label">Mobile No.</label>
            <div className="country-selector-wrapper">
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className="country-dropdown-btn"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  disabled={isAccountLocked}
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
                  <div className="country-dropdown-menu">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className={`country-dropdown-item ${
                          selectedCountry.code === country.code
                            ? "selected"
                            : ""
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
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={() => handleBlur("mobile")}
                  className={`input-field ${errors.mobile ? "error" : ""}`}
                  disabled={isAccountLocked}
                />
                {errors.mobile && (
                  <span className="input-error">{errors.mobile}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Password input with Show/Hide */}
        <div className="form-field">
          <label className="input-label">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              className={`input-field ${errors.password ? "error" : ""}`}
              disabled={isAccountLocked}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
              title={showPassword ? "Hide password" : "Show password"}
              disabled={isAccountLocked}
              style={{
                opacity: formData.newPassword ? 1 : 0.35,
                cursor: formData.newPassword ? "pointer" : "default",
              }}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <span className="input-error">{errors.password}</span>
          )}
        </div>

        <div className="center-div">
          <Button type="submit" disabled={loading || isAccountLocked}>
            {loading ? <Loader size="small" /> : "Login"}
          </Button>
        </div>
      </form>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default LoginForm;
