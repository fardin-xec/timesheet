import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SummarizeIcon from '@mui/icons-material/Summarize';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BadgeIcon from '@mui/icons-material/Badge';
import PaymentsIcon from '@mui/icons-material/Payments';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';

const DashboardSidebar = ({ activePage }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useSelector(state => state.auth); // Get user from Redux state

  const isActive = (path) => {
    return currentPath === path;
  };

  return (
    <aside className="dashboard-sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <Link to="/dashboard" className="nav-link">
              <span className="nav-icon"><DashboardIcon /></span>
              <span className="nav-label">Dashboard</span>
            </Link>
          </li>
          <li className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <Link to="/profile" className="nav-link">
              <span className="nav-icon"><PersonIcon /></span>
              <span className="nav-label">Profile</span>
            </Link>
          </li>
          <li className={`nav-item ${isActive('/expenses') ? 'active' : ''}`}>
            <Link to="/expenses" className="nav-link">
              <span className="nav-icon"><ReceiptIcon /></span>
              <span className="nav-label">Expenses</span>
            </Link>
          </li>
          <li className={`nav-item ${isActive('/timesheet') ? 'active' : ''}`}>
            <Link to="/timesheet" className="nav-link">
              <span className="nav-icon"><SummarizeIcon /></span>
              <span className="nav-label">Timesheet Summary</span>
            </Link>
          </li>
          <li className={`nav-item ${isActive('/leaves') ? 'active' : ''}`}>
            <Link to="/leaves" className="nav-link">
              <span className="nav-icon"><EventBusyIcon /></span>
              <span className="nav-label">Leaves</span>
            </Link>
          </li>
          {/* Conditionally render Employees link for admin users */}
          {user?.role === 'admin' && (
            <>
            <li className={`nav-item ${isActive('/employees') ? 'active' : ''}`}>
              <Link to="/employees" className="nav-link">
                <span className="nav-icon"><BadgeIcon /></span>
                <span className="nav-label">Employee's Details</span>
              </Link>
            </li><li className={`nav-item ${isActive('/payroll') ? 'active' : ''}`}>
                <Link to="/payroll" className="nav-link">
                  <span className="nav-icon"><PaymentsIcon /></span>
                  <span className="nav-label">Payroll</span>
                </Link>
              </li>
            </>
          )}
          <li className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
            <Link to="/about" className="nav-link">
              <span className="nav-icon"><BusinessIcon /></span>
              <span className="nav-label">About Company</span>
            </Link>
          </li>
          <li className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Link to="/settings" className="nav-link">
              <span className="nav-icon"><SettingsIcon /></span>
              <span className="nav-label">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;