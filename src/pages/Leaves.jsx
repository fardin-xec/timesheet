import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import '../styles/dashboard.css';
import LeavesView from '../components/leave/LeavesView';

const Leaves = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Leaves', path: '/leaves' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="Leaves" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Leaves</h1>
          <p>View your Leaves information.</p>
          <Card>
            <LeavesView />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Leaves;