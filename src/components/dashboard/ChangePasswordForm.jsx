// src/components/dashboard/ChangePasswordForm.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { updatePassword } from '../../utils/api';
import Loader from '../common/Loader';
import { useAuth } from '../../redux/hooks/useAuth';

const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'confirmNewPassword' || name === 'newPassword') {
      if (name === 'confirmNewPassword' && value !== formData.newPassword) {
        setPasswordError('New passwords do not match');
      } else if (name === 'newPassword' && formData.confirmNewPassword && value !== formData.confirmNewPassword) {
        setPasswordError('New passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updatePassword(
        user.id, 
        formData.currentPassword, 
        formData.newPassword
      );
      
      setSuccess(result.message);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          type="password"
          name="currentPassword"
          label="Current Password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="newPassword"
          label="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="confirmNewPassword"
          label="Confirm New Password"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          error={passwordError}
          required
        />
        <Button type="submit" disabled={loading || passwordError}>
          {loading ? <Loader size="small" /> : 'Update Password'}
        </Button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;