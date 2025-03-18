import React from 'react';
import { useAuth } from '../redux/hooks/useAuth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import '../styles/dashboard.css';
import ExpensesView from '../components/Expenses/ExpensesView';

const Expenses = () => {
  const { user, logout } = useAuth();
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Expenses', path: '/expenses' }
  ];

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} onLogout={logout} />
      <div className="dashboard-content">
        <DashboardSidebar activePage="expenses" />
        <main className="dashboard-main">
          <Breadcrumb items={breadcrumbItems} />
          <h1>Expenses</h1>
          <p>View your expenses information.</p>
          
          <div className="expenses-page-container">
            <Card>
              <ExpensesView />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Expenses;