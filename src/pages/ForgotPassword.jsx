// src/pages/ForgotPassword.jsx
import { Link } from "react-router-dom";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import Card from "../components/common/Card";
import "../styles/auth.css";

const ForgotPassword = () => {
  return (
    <div className="auth-container">
      <Card>
        <h1 className="auth-title">Reset Password</h1>
        <ForgotPasswordForm />
        <div className="auth-links">
          <Link to="/login" className="auth-link">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
