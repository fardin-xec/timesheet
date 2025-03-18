import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import '../styles/dashboard.css';
import EmployeesView from '../components/Employees/EmployeesView';

const Employees = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employees', path: '/employees' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="Employees" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Employees</h1>
          <p>View your Employees information.</p>

          <Card>
            <EmployeesView />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Employees;