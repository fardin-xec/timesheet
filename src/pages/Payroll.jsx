import { useAuth } from "../redux/hooks/useAuth";
import Breadcrumb from "../components/common/Breadcrumb";
import "../styles/dashboard.css";
import PayrollView from "../components/Payroll/PayrollView";
import UserPayroll from "../components/Payroll/UserPayroll";

const Payroll = () => {
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Payroll", path: "/payroll" },
  ];
  const breadcrumbUserItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Payslip", path: "/payslip" },
  ];

  return (
    <>
      {user.role === "admin" ? (
        <>
          <Breadcrumb items={breadcrumbItems} />
          <h1>Payroll</h1>
          <p>View your Payroll information.</p>
          <PayrollView user={user} />
        </>
      ) : (
        <>
          <Breadcrumb items={breadcrumbUserItems} />
          <h1>Payslip</h1>
          <p>View your Payslip information.</p>
          <UserPayroll user={user} />
        </>
      )}
    </>
  );
};

export default Payroll;
