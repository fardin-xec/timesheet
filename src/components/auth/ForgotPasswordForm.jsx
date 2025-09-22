import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../redux/hooks/useAuth';
import Loader from '../common/Loader';
import { requestPasswordResetOtp, verifyOtp, resetPassword } from '../../utils/api';
import "../../styles/auth.css"

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'newPassword'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const { error } = useAuth();
  const [user, setUser] = useState({}); // 'email', 'otp', 'newPassword'


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleOtpChange = (e) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    setOtpError('');
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (confirmPassword && confirmPassword !== e.target.value) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (newPassword !== e.target.value) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await requestPasswordResetOtp(email);
      if (response.success) {
        setStep('otp');
      }
    } catch (err) {
      // Don't reveal if email exists or not for security reasons
      // Just move to the next step regardless
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Verify OTP
      const result = await verifyOtp(email, otp);
      console.log(result);
      
      if (result.success) {
        setStep('newPassword');
        setUser(result.data)
      } else {
        setOtpError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Error verifying OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await resetPassword(user.id,newPassword);
      
      if (result.statusCode===200) {
        setStep('success');
      } else {
        setPasswordError(result.message || 'Failed to reset password');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await requestPasswordResetOtp(email);
      // Show temporary success message
      setOtpError('OTP has been resent to your email');
      setTimeout(() => {
        setOtpError('');
      }, 3000);
    } catch (err) {
      // Don't reveal if email exists or not
      setOtpError('OTP has been resent to your email');
      setTimeout(() => {
        setOtpError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="success-message">
        <h3>Password Reset Successful</h3>
        <p>Your password has been reset successfully. You can now log in with your new password.</p>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div>
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          <p className="form-description">
            Enter your email address below. We'll send you an OTP to reset your password.
          </p>
          <Input
            type="email"
            name="email"
            label="Email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <Button type="submit" disabled={loading || !email}>
            {loading ? <Loader size="small" /> : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="auth-form">
          {otpError && <div className={otpError.includes('resent') ? "success-message" : "error-message"}>{otpError}</div>}
          <p className="form-description">
            Enter the 6-digit OTP sent to {email}
          </p>
          <Input
            type="text"
            name="otp"
            label="OTP Code"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit code"
            required
          />
          <div className="resend-link">
            <Button 
              type="button" 
              onClick={handleResendOtp} 
              className="text-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Resend OTP'}
            </Button>
          </div>
          <div className="form-actions">
            <Button type="button" onClick={() => setStep('email')} className="secondary-button">
              Back
            </Button>
            <Button type="submit" disabled={loading || otp.length !== 6}>
              {loading ? <Loader size="small" /> : 'Verify OTP'}
            </Button>
          </div>
        </form>
      )}

      {step === 'newPassword' && (
        <form onSubmit={handlePasswordSubmit} className="auth-form">
          {passwordError && <div className="error-message">{passwordError}</div>}
          <p className="form-description">
            Create a new password for your account
          </p>
          <Input
            type="password"
            name="newPassword"
            label="New Password"
            value={newPassword}
            onChange={handlePasswordChange}
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={passwordError}
            required
          />
          <div className="password-requirements">
            <p>Password must be at least 8 characters long</p>
          </div>
          <div className="form-actions">
            <Button type="button" onClick={() => setStep('otp')} className="secondary-button">
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={loading || passwordError || !newPassword || !confirmPassword}
            >
              {loading ? <Loader size="small" /> : 'Reset Password'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;