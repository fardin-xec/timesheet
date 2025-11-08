import { useAuth } from "../redux/hooks/useAuth";
import Breadcrumb from "../components/common/Breadcrumb";
import Card from "../components/common/Card";
import "../styles/dashboard.css";
import UserAttendanceList from "../components/Attendance/UserAttendanceList";
import SuperAdminAttendanceList from "../components/Attendance/SuperAdminAttendanceList"; // Adjust path if needed

const Attendance = () => {
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Attendance", path: "/attendance" },
  ];

  const isSuperAdmin = user?.role === "admin"; // Adjust role field as per your auth schema

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
     
      <Card>
        {isSuperAdmin ? (
          <SuperAdminAttendanceList orgId={user?.orgId} />
        ) : (
          <UserAttendanceList user={user} />
        )}
      </Card>
    </>
  );
};

export default Attendance;
