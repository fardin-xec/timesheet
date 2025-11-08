import { useAuth } from "../redux/hooks/useAuth";

import Breadcrumb from "../components/common/Breadcrumb";
import "../styles/dashboard.css";
import LeaveRequestsView from "../components/LeaveRequests/LeaveRequestsView";

const LeavesRequest = () => {
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "LeavesRequest", path: "/leaveRequests" },
  ];

  // Assuming the role is part of the user object (e.g., user.role)
  const role = user?.role; // Use optional chaining to safely access role
  console.log(role)
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {(role === "admin" || role === "manager") && <LeaveRequestsView />}
    </>
  );
};

export default LeavesRequest;
