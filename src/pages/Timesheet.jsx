import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import '../styles/dashboard.css';
import TimesheetView from '../components/Timesheet/timesheetView';

const Timesheet = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Timesheet', path: '/timesheet' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="timesheet" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Timesheet</h1>
          <p>View your timesheet.</p>
          
          <Card>
            <TimesheetView />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Timesheet;