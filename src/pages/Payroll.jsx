import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import '../styles/dashboard.css';
import PayrollView from '../components/Payroll/PayrollView';

const Payroll = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Payroll', path: '/payroll' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="Payroll" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Payroll</h1>
          <p>View your Payroll information.</p>
          <Card>
            <PayrollView />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Payroll;