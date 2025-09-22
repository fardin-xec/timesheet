// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import PrivateRoute from "./routes/PrivateRoute";
import Profile from "./pages/Profile";
import Expenses from "./pages/Expenses";
import Leaves from "./pages/Leaves";
import Employees from "./pages/Employees";
import Payroll from "./pages/Payroll";
import About from "./pages/About";
import DashboardLayout from "./components/layout/DashboardLayout";
import "./styles/global.css";
import { useAuth } from "./redux/hooks/useAuth";
import Attendance from "./pages/Attendance";
import LeavesRequest from "./pages/LeaveRequest";

const App = () => {
  const { isAuthenticated, checkAuth } = useAuth();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token !== null) {
      checkAuth().catch((error) => {
        console.error("Authentication check failed:", error);
      });
    }
  }, [checkAuth, token]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/forgot-password"
        element={
          !isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />
        }
      />

      {/* Protected Routes with Shared Layout */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/leaveRequests" element={<LeavesRequest />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Route>

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
};

export default App;