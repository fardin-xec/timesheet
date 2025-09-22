import Breadcrumb from "../components/common/Breadcrumb";
import Card from "../components/common/Card";
import "../styles/dashboard.css";
import EmployeesView from "../components/Employees/EmployeesView";

const Employees = () => {

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Employees", path: "/employees" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <h1>Employees</h1>
      <p>View your Employees information.</p>

      <Card>
        <EmployeesView />
      </Card>
    </>
  );
};

export default Employees;
