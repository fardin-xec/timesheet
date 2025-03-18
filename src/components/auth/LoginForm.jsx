import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../redux/hooks/useAuth';
import Loader from '../common/Loader';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error handling is managed by the Redux slice
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}
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
      <Button type="submit" disabled={loading}>
        {loading ? <Loader size="small" /> : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;