import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../redux/hooks/useAuth';
import Loader from '../common/Loader';

const SignupForm = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      const [passwordError, setPasswordError] = useState('');
      const { signup, loading, error } = useAuth();
      const navigate = useNavigate();
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (name === 'confirmPassword' || name === 'password') {
          if (name === 'confirmPassword' && value !== formData.password) {
            setPasswordError('Passwords do not match');
          } else if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
          } else {
            setPasswordError('');
          }
        }
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Passwords do not match');
          return;
        }
        
        try {
          const { confirmPassword, ...userData } = formData;
          await signup(userData);
          navigate('/dashboard');
        } catch (err) {
          // Error handling is managed by the Redux slice
        }
      };
    
      return (
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          <Input
            type="text"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={passwordError}
            required
          />
          <Button type="submit" disabled={loading || passwordError}>
            {loading ? <Loader size="small" /> : 'Create Account'}
          </Button>
        </form>
      );
    };
    
    export default SignupForm;