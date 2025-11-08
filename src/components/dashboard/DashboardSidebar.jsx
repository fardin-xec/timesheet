import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import BadgeIcon from "@mui/icons-material/Badge";
import PaymentsIcon from "@mui/icons-material/Payments";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import { CalendarMonth } from "@mui/icons-material";
import "../../styles/common.css"

const DashboardSidebar = ({ activePage }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useSelector((state) => state.auth);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Set initialized after first render to prevent re-animation on route changes
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const isActive = (path) => {
    // Use activePage prop if provided, otherwise fall back to currentPath
    if (activePage) {
      const pageToPath = {
        'Dashboard': '/dashboard',
        'Profile': '/profile',
        'Attendance': '/attendance',
        'Leaves': '/leaves',
        'Employee\'s Details': '/employees',
        'Payroll': '/payroll',
        'Payslip': '/payroll',
        'Leave Requests': '/leaveRequests',
        'About': '/about',
        'About Company': '/about',
        'Settings': '/settings'
      };
      return pageToPath[activePage] === path;
    }
    return currentPath === path;
  };

  // Define navigation items with conditional rendering logic
  const getNavigationItems = () => {
    const baseItems = [
      {
        path: "/dashboard",
        icon: DashboardIcon,
        label: "Dashboard",
        show: true,
      },
      {
        path: "/profile",
        icon: PersonIcon,
        label: "Profile",
        show: true,
      },
      {
        path: "/attendance",
        icon: CalendarMonth,
        label: "Attendance",
        show: true,
      },
      {
        path: "/leaves",
        icon: EventBusyIcon,
        label: "Leaves",
        show: true,
      },
    ];

    const conditionalItems = [
      {
        path: "/employees",
        icon: BadgeIcon,
        label: "Employee's Details",
        show: user?.role === "admin" ,
      },
      {
        path: "/payroll",
        icon: PaymentsIcon,
        label: user?.role === "user" ? "Payslip" : "Payroll",
        show: true,
      },
      {
        path: "/leaveRequests",
        icon: EventBusyIcon,
        label: "Leave Requests",
        show: user?.hasSubordinates,
      },
    ];

    const endItems = [
      {
        path: "/about",
        icon: BusinessIcon,
        label: "About Company",
        show: true,
      },
      {
        path: "/settings",
        icon: SettingsIcon,
        label: "Settings",
        show: true,
      },
    ];

    return [...baseItems, ...conditionalItems, ...endItems].filter(
      (item) => item.show
    );
  };

  const navigationItems = getNavigationItems();

  return (
    <motion.aside
      className="dashboard-sidebar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ 
        duration: hasInitialized ? 0 : 0.6, 
        ease: "easeOut",
        staggerChildren: hasInitialized ? 0 : 0.1,
      }}
    >
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <motion.li
                key={item.path}
                className={`nav-item ${active ? "active" : ""}`}
                initial={{ x: hasInitialized ? 0 : -50, opacity: hasInitialized ? 1 : 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  duration: hasInitialized ? 0 : 0.5, 
                  ease: "easeOut",
                  delay: hasInitialized ? 0 : index * 0.1
                }}
                whileHover={{
                  x: 8,
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 },
                }}
                style={{
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Active indicator */}
                <motion.div
                  className="active-indicator"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={active ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    backgroundColor: "#007bff",
                    transformOrigin: "left center",
                  }}
                />

                <Link to={item.path} className="nav-link">
                  <motion.span
                    className="nav-icon"
                    whileHover={{
                      rotate: 5,
                      scale: 1.1,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{
                      rotate: -5,
                      scale: 0.9,
                    }}
                  >
                    <IconComponent />
                  </motion.span>
                  <motion.span
                    className="nav-label"
                    initial={{ opacity: 0.8 }}
                    whileHover={{
                      opacity: 1,
                      x: 4,
                      transition: { duration: 0.2 },
                    }}
                  >
                    {item.label}
                  </motion.span>
                </Link>

                {/* Hover background effect */}
                <motion.div
                  className="hover-bg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{
                    opacity: 0.1,
                    scale: 1,
                    transition: { duration: 0.2 },
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#007bff",
                    borderRadius: "8px",
                    zIndex: -1,
                  }}
                />
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
};

export default DashboardSidebar;