import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import '../styles/dashboard.css';
import AboutView from '../components/about/AboutView';

const About = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'About', path: '/About' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="About" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <Card>
            <AboutView />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default About;