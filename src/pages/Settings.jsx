import Breadcrumb from "../components/common/Breadcrumb";
import ChangePasswordForm from "../components/dashboard/ChangePasswordForm";
import Card from "../components/common/Card";
import "../styles/dashboard.css";

const Settings = () => {
  

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <h1>Settings</h1>
      <p>Manage your account settings and change your password.</p>

      <div className="settings-container">
        <Card>
          <ChangePasswordForm />
        </Card>
      </div>
    </>
  );
};

export default Settings;
