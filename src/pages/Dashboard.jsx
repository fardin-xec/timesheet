// pages/Dashboard.jsx
import { useAuth } from '../redux/hooks/useAuth';
import Breadcrumb from '../components/common/Breadcrumb';
import SuperadminDashboard from '../components/dashboard/SuperadminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <h1>Welcome, {user?.employee?.firstName || 'User'}!</h1>
      <p>This is your dashboard. You can manage your account and settings here.</p>
      {user?.role === "admin" ? (
        <SuperadminDashboard />
      ) : (
        <UserDashboard />
      )}
    </>
  );
};

export default Dashboard;