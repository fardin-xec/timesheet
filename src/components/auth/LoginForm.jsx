import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Toast from '../common/Toast';
import '../../styles/auth.css';
import { useAuth } from '../../redux/hooks/useAuth';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // Toast state
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to close toast
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await login(formData);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login Error:', error);
      setToast({
        open: true,
        message: error.message || 'Login failed. Please check your credentials.',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        <Input
          type="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className='center-div'>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader size="small" /> : 'Login'}
          </Button>
        </div>
      </form>

      {/* Toast component */}
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
