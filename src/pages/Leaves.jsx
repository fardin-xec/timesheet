import { useAuth } from "../redux/hooks/useAuth";
import Breadcrumb from "../components/common/Breadcrumb";
import "../styles/dashboard.css";
import SuperadminLeavesView from "../components/leave/SuperadminLeavesView";
import UserLeavesView from "../components/leave/UserLeavesView";

const Leaves = () => {
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Leaves", path: "/leaves" },
  ];

  // Assuming the role is part of the user object (e.g., user.role)
  const role = user?.role; // Use optional chaining to safely access role

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <>
        {role === "admin" ? <SuperadminLeavesView /> : <UserLeavesView />}
      </>
    </>
  );
};

export default Leaves;
