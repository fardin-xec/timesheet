import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Welcome, {user?.firstName || 'User'}!</h1>
          <p>This is your dashboard. You can manage your account and settings here.</p>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Profile Completion</h3>
              <div className="stat-value">80%</div>
            </div>
            <div className="stat-card">
              <h3>Activity</h3>
              <div className="stat-value">Active</div>
            </div>
            <div className="stat-card">
              <h3>Last Login</h3>
              <div className="stat-value">Today</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;