import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import ProfilePage from '../components/Profile/ProfileForm';
import Card from '../components/common/Card';
import '../styles/dashboard.css';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="profile" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Profile</h1>
          <p>View and update your profile information.</p>
          
          <div className="profile-page-container">
            <Card>
              <ProfilePage />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;