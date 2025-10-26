import Breadcrumb from "../components/common/Breadcrumb";
import ProfilePage from "../components/Profile/ProfileForm";
import Card from "../components/common/Card";
import "../styles/dashboard.css";

const Profile = () => {

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Profile", path: "/profile" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      

      <div className="profile-page-container">
        <Card>
          <ProfilePage />
        </Card>
      </div>
    </>
  );
};

export default Profile;
