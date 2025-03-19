import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import Card from '../components/common/Card';
import '../styles/auth.css';

const Login = () => {
  return (
    <div className="auth-container">
      <Card>
        <h1 className="auth-title">Login</h1>
        <LoginForm />
        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;