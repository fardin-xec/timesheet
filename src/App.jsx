import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PrivateRoute from './routes/PrivateRoute';
import { useSelector } from 'react-redux';
import Profile from './pages/Profile';
import Expenses from './pages/Expenses';
import Timesheet from './pages/Timesheet';
import Leaves from './pages/Leaves';
import "./styles/global.css";
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import React from 'react';
import About from './pages/About';

const App = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth); // Assuming `user` contains role information

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/expenses" element={
          <PrivateRoute>
            <Expenses />
          </PrivateRoute>
        } />
        <Route path="/timesheet" element={
          <PrivateRoute>
            <Timesheet />
          </PrivateRoute>
        } />
        <Route path="/leaves" element={
          <PrivateRoute>
            <Leaves />
          </PrivateRoute>
        } />
        <Route path="/employees" element={
          <PrivateRoute>
            {user?.role === 'admin' ? <Employees /> : <Navigate to="/dashboard" />}
          </PrivateRoute>
        } />
        <Route path="/payroll" element={
          <PrivateRoute>
            {user?.role === 'admin' ? <Payroll /> : <Navigate to="/dashboard" />}
          </PrivateRoute>
        } />
         <Route path="/about" element={
          <PrivateRoute>
            <About />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;