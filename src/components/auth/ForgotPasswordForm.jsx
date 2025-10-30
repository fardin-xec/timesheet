import React, { useState } from "react";
import Button from "../common/Button";
import Toast from "../common/Toast";
import Loader from "../common/Loader";
import {
  requestPasswordResetOtp,
  verifyOtp,
  resetPassword,
} from "../../utils/api";
import "../../styles/forgotPassword.css";

const ForgotPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [step, setStep] = useState("email"); // 'email', 'otp', 'newPassword', 'success'
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});

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

  const validatePassword = (password) => {
    if (!password || !password.trim()) {
      return { valid: false, message: "Password is required" };
    }
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters",
      };
    }
    return { valid: true, message: "" };
  };

  const validateOtp = (otp) => {
    if (!otp || !otp.trim()) {
      return { valid: false, message: "OTP is required" };
    }
    if (otp.length !== 6) {
      return { valid: false, message: "OTP must be 6 digits" };
    }
    if (!/^\d+$/.test(otp)) {
      return { valid: false, message: "OTP must contain only digits" };
    }
    return { valid: true, message: "" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for OTP - only numbers, max 6 digits
    if (name === "otp") {
      const otpValue = value.replace(/[^0-9]/g, "").slice(0, 6);
      setFormData({ ...formData, [name]: otpValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (field) => {
    const newErrors = { ...errors };

    if (field === "email") {
      const validation = validateEmail(formData.email);
      if (!validation.valid) {
        newErrors.email = validation.message;
      } else {
        delete newErrors.email;
      }
    } else if (field === "otp") {
      const validation = validateOtp(formData.otp);
      if (!validation.valid) {
        newErrors.otp = validation.message;
      } else {
        delete newErrors.otp;
      }
    } else if (field === "newPassword") {
      const validation = validatePassword(formData.newPassword);
      if (!validation.valid) {
        newErrors.newPassword = validation.message;
      } else {
        delete newErrors.newPassword;
      }
    } else if (field === "confirmPassword") {
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setErrors({ ...errors, email: emailValidation.message });
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordResetOtp(formData.email);
      if (response.success) {
        setStep("otp");
        setToast({
          open: true,
          message: "OTP sent to your email",
          severity: "success",
        });
      }
    } catch (err) {
      // For security, don't reveal if email exists
      setStep("otp");
      setToast({
        open: true,
        message: "OTP sent to your email",
        severity: "success",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const otpValidation = validateOtp(formData.otp);
    if (!otpValidation.valid) {
      setErrors({ ...errors, otp: otpValidation.message });
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp(formData.email, formData.otp);

      if (result.success) {
        setStep("newPassword");
        setUser(result.data);
        setToast({
          open: true,
          message: "OTP verified successfully",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: result.message || "Invalid OTP. Please try again.",
          severity: "error",
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message:
          err.response?.data?.message ||
          "Error verifying OTP. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    const newErrors = {};
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.valid) {
      newErrors.newPassword = passwordValidation.message;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(user.id, formData.newPassword);

      if (result.statusCode === 200) {
        setStep("success");
        setToast({
          open: true,
          message: "Password reset successfully",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: result.message || "Failed to reset password",
          severity: "error",
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message:
          err.response?.data?.message ||
          "Error resetting password. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await requestPasswordResetOtp(formData.email);
      setToast({
        open: true,
        message: "OTP has been resent to your email",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message: "OTP has been resent to your email",
        severity: "success",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="auth-form success-container">
        <div className="success-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 className="success-title">Password Reset Successful</h3>
        <p className="success-message">
          Your password has been reset successfully. You can now log in with
          your new password.
        </p>
        <div className="center-div">
          <Button onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="auth-form">
          <p className="form-description">
            Enter your email address below. We'll send you an OTP to reset your
            password.
          </p>

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
            />
            {errors.email && (
              <span className="input-error">{errors.email}</span>
            )}
          </div>

          <div className="center-div">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader size="small" /> : "Send OTP"}
            </Button>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="auth-form">
          <p className="form-description">
            Enter the 6-digit OTP sent to your email
          </p>

          <div className="form-field">
            <label className="input-label">OTP Code</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit code"
              value={formData.otp}
              onChange={handleChange}
              onBlur={() => handleBlur("otp")}
              className={`input-field otp-input ${errors.otp ? "error" : ""}`}
              maxLength="6"
            />
            {errors.otp && <span className="input-error">{errors.otp}</span>}
          </div>

          <div className="resend-link">
            <span>Didn't receive the code? </span>
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-button"
              disabled={loading}
            >
              {loading ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              onClick={() => setStep("email")}
              className="secondary-button"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.otp.length !== 6}
            >
              {loading ? <Loader size="small" /> : "Verify OTP"}
            </Button>
          </div>
        </form>
      )}

      {step === "newPassword" && (
        <form onSubmit={handlePasswordSubmit} className="auth-form">
          <p className="form-description">
            Create a new password for your account
          </p>

          {/* New Password */}
          <div className="form-field">
            <label className="input-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("newPassword")}
                className={`input-field ${errors.newPassword ? "error" : ""}`}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                title={showPassword ? "Hide password" : "Show password"}
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
            {errors.newPassword && (
              <span className="input-error">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-field">
            <label className="input-label">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                className={`input-field ${
                  errors.confirmPassword ? "error" : ""
                }`}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleConfirmPasswordVisibility}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                 style={{
                  opacity: formData.newPassword ? 1 : 0.35,
                  cursor: formData.newPassword ? "pointer" : "default",
                }}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <span className="input-error">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="password-requirements">
            <p>Password must be at least 8 characters long</p>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              onClick={() => setStep("otp")}
              className="secondary-button"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !formData.newPassword || !formData.confirmPassword
              }
            >
              {loading ? <Loader size="small" /> : "Reset Password"}
            </Button>
          </div>
        </form>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default ForgotPasswordForm;
