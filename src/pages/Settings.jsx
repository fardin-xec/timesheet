import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import ChangePasswordForm from '../components/dashboard/ChangePasswordForm';
import Card from '../components/common/Card';
import '../styles/dashboard.css';

const Settings = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Settings', path: '/settings' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="settings" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Settings</h1>
          <p>Manage your account settings and change your password.</p>
          
          <div className="settings-container">
            <Card>
              <ChangePasswordForm />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;