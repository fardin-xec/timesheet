// components/layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../redux/hooks/useAuth';
import DashboardHeader from '../dashboard/DashboardHeader';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import '../../styles/dashboard.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;