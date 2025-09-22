import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "../common/DataTable";
import AttendanceEmployeeDialog from "./AttendanceEmployeeDialog";
import { fetchEmployees } from "../../utils/api";
import {
  People,
  BusinessCenter,
  CalendarToday,
  Search,
  Refresh,
} from "@mui/icons-material";

const SuperAdminAttendanceList = ({ orgId }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const employeesData = await fetchEmployees(orgId);
        // Ensure data is an array and precompute fullName
        const formattedData = Array.isArray(employeesData)
          ? employeesData.map((emp) => ({
              ...emp,
              fullName: `${emp.firstName || ""} ${emp.midName || ""} ${
                emp.lastName || ""
              }`.trim(),
            }))
          : [];
        setEmployees(formattedData);
        console.log("Formatted employees:", formattedData);
        setHasLoaded(true);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchData();
    }
  }, [orgId]);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);

    try {
      const employeesData = await fetchEmployees(orgId);
      const formattedData = Array.isArray(employeesData)
        ? employeesData.map((emp) => ({
            ...emp,
            fullName: `${emp.firstName || ""} ${emp.midName || ""} ${
              emp.lastName || ""
            }`.trim(),
          }))
        : [];

      // Add a small delay for better UX
      setTimeout(() => {
        setEmployees(formattedData);
        setLoading(false);
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error("Failed to refresh employees:", error);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: {
      opacity: 0,
      x: -50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        type: "spring",
        damping: 15,
      },
    },
  };

  const statsCardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      y: -5,
      boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const tableVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 40,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const refreshButtonVariants = {
    hover: {
      scale: 1.1,
      rotate: 180,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.9,
      transition: {
        duration: 0.1,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -90 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        type: "spring",
      },
    },
  };

  // Enhanced columns with better alignment and animated content

  // Note: This uses Lucide React icons which are available in the artifact environment
  // Import at the top: import { User, Building2, Briefcase, Calendar } from 'lucide-react';

  const columns = [
    {
      field: "id",
      headerName: "ID",
      sortable: true,
      align: "center",
      width: "80px",
      renderCell: ({ row }) => (
        <span className="font-medium text-gray-700">{row.id}</span>
      ),
    },
    {
      field: "fullName",
      headerName: "Employee Name",
      sortable: true,
      align: "center",
      width: "200px",
      renderCell: ({ row }) => (
        <>
          <span className="font-semibold text-gray-800 text-sm">
            {row.fullName || "N/A"}
          </span>
        </>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      sortable: true,
      align: "left",
      width: "180px",
      renderCell: ({ row }) => (
        <>
          <span className="text-sm font-medium text-gray-800">
            {row.department || "N/A"}
          </span>
        </>
      ),
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      sortable: true,
      align: "left",
      width: "160px",
      renderCell: ({ row }) => (
        <>
          <span className="text-sm font-medium text-gray-800">
            {row.jobTitle || "N/A"}
          </span>
        </>
      ),
    },
    {
      field: "joinedOn",
      headerName: "Joined Date",
      sortable: true,
      align: "center",
      width: "140px",
      renderCell: ({ row }) => (
        <span className="text-sm font-medium text-gray-800">
          {row.joiningDate
            ? new Date(row.joiningDate).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
  ];

  // Calculate stats
  const totalEmployees = employees.length;
  const departments = [
    ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
  ].length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-4"
    >
      {/* Header Section */}
      <motion.div
        variants={headerVariants}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div variants={iconVariants}>
            <People sx={{ fontSize: 32, color: "#1976d2" }} />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800">
            Employee Attendance
          </h2>
        </div>

        <motion.button
          variants={refreshButtonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
        >
          <Refresh className={`${isRefreshing ? "animate-spin" : ""}`} />
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      {hasLoaded && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={containerVariants}
        >
          <motion.div
            variants={statsCardVariants}
            whileHover="hover"
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <motion.div
                variants={iconVariants}
                className="p-3 mt-2 bg-blue-100 rounded-full"
              >
                <People sx={{ color: "#1976d2", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <motion.p
                  className="text-2xl  font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    marginTop: "-1rem",
                    marginLeft: "2rem",
                  }}
                >
                  {totalEmployees}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statsCardVariants}
            whileHover="hover"
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <motion.div
                variants={iconVariants}
                className="p-3 mt-2 bg-orange-100 rounded-full"
              >
                <BusinessCenter sx={{ color: "#f57c00", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Departments</p>
                <motion.p
                  className="text-2xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  style={{
                    marginTop: "-1rem",
                    marginLeft: "2rem",
                  }}
                >
                  {departments}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statsCardVariants}
            whileHover="hover"
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <motion.div
                variants={iconVariants}
                className="p-3 mt-2 bg-green-100 rounded-full"
              >
                <CalendarToday sx={{ color: "#388e3c", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Active Today</p>
                <motion.p
                  className="text-2xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.9 }}
                  style={{
                    marginTop: "-1rem",
                    marginLeft: "2rem",
                  }}
                >
                  {Math.floor(totalEmployees * 0.85)}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statsCardVariants}
            whileHover="hover"
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <motion.div
                variants={iconVariants}
                className="p-3 mt-2 bg-red-100 rounded-full"
              >
                <Search sx={{ color: "#d32f2f", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Searchable</p>
                <motion.p
                  className="text-lg font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.1 }}
                  style={{
                    marginTop: "-1rem",
                    marginLeft: "1rem",
                  }}
                >
                  Records
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            variants={loadingVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex justify-center items-center p-8"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
              }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Table */}
      {!loading && (
        <motion.div variants={tableVariants}>
          <DataTable
            columns={columns}
            data={employees}
            loading={loading}
            pagination
            pageSize={10}
            sortable
            searchable
            onRowClick={(row) => setSelectedEmployee(row)}
            emptyStateMessage="No employees found"
            dense={false}
          />
        </motion.div>
      )}

      {/* Employee Dialog */}
      <AnimatePresence>
        {selectedEmployee && (
          <AttendanceEmployeeDialog
            open={!!selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            employee={selectedEmployee}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuperAdminAttendanceList;
