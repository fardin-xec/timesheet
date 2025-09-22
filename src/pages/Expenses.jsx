
import Breadcrumb from "../components/common/Breadcrumb";
import Card from "../components/common/Card";
import "../styles/dashboard.css";
import ExpensesView from "../components/Expenses/ExpensesView";

const Expenses = () => {

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Expenses", path: "/expenses" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <h1>Expenses</h1>
      <p>View your expenses information.</p>

      <div className="expenses-page-container">
        <Card>
          <ExpensesView />
        </Card>
      </div>
    </>
  );
};

export default Expenses;
