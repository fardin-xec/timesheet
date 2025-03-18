import React from 'react';
import { Link } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import Card from '../components/common/Card';
import '../styles/auth.css';

const Signup = () => {
  return (
    <div className="auth-container">
      <Card>
        <h1 className="auth-title">Create Account</h1>
        <SignupForm />
        <div className="auth-links">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;