import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../redux/hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen"><div className="loader-md"></div></div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
