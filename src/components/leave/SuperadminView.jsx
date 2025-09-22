import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import DataTable from '../common/DataTable';
import { fetchEmployeesWithLeaves } from '../../utils/api';
import EmployeeDialog from './EmployeeLeaveDialog';
import {
  BeachAccess,
  People,
  CheckCircle,
  PendingActions,
  Refresh,
  TrendingUp
} from "@mui/icons-material";

const SuperadminView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

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

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeesWithLeaves();
      // Ensure each employee has an id (add a fallback if missing)
      const employeesWithId = data.map((emp, index) => ({
        ...emp,
        id: emp.id || `emp-${index}`, // Fallback ID if not provided
      }));
      
      setEmployees(employeesWithId);
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);

    try {
      await loadEmployees();
      // Add a small delay for better UX
      setTimeout(() => {
        setLoading(false);
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error("Failed to refresh employees:", error);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      sortable: true, 
      width: "200px",
      align: "left",
      renderCell: ({ row }) => (
        <span className="font-semibold text-gray-800 text-sm">
          {`${row.firstName || ''} ${row.midName || ''} ${row.lastName || ''}`.trim()}
        </span>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      sortable: true,
      width: "220px",
      align: "left",
      renderCell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.email}</span>
      )
    },
    { 
      field: 'department', 
      headerName: 'Department', 
      sortable: true,
      width: "160px",
      align: "left",
      renderCell: ({ row }) => (
        <span className="text-sm font-medium text-gray-800">{row.department}</span>
      )
    },
    { 
      field: 'pendingLeaves', 
      headerName: 'Pending Leaves', 
      sortable: true,
      width: "140px",
      align: "center",
      renderCell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {row.pendingLeaves || 0}
          </span>
        </div>
      )
    },
    { 
      field: 'approvedLeaves', 
      headerName: 'Approved Leaves', 
      sortable: true,
      width: "140px",
      align: "center",
      renderCell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {row.approvedLeaves || 0}
          </span>
        </div>
      )
    },
  ];

  // Calculate stats
  const totalEmployees = employees.length;
  const totalPendingLeaves = employees.reduce((sum, emp) => sum + (emp.pendingLeaves || 0), 0);
  const totalApprovedLeaves = employees.reduce((sum, emp) => sum + (emp.approvedLeaves || 0), 0);
  const employeesWithPendingLeaves = employees.filter(emp => (emp.pendingLeaves || 0) > 0).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6"
    >
      {/* Header Section */}
      <motion.div
        variants={headerVariants}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div variants={iconVariants}>
            <BeachAccess sx={{ fontSize: 32, color: "#1976d2" }} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Leave Management
          </h1>
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
                  className="text-2xl font-bold text-gray-800"
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
                <PendingActions sx={{ color: "#f57c00", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Pending Leaves</p>
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
                  {totalPendingLeaves}
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
                <CheckCircle sx={{ color: "#388e3c", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Approved Leaves</p>
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
                  {totalApprovedLeaves}
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
                className="p-3 mt-2 bg-purple-100 rounded-full"
              >
                <TrendingUp sx={{ color: "#7b1fa2", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Employees with Pending</p>
                <motion.p
                  className="text-2xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.1 }}
                  style={{
                    marginTop: "-1rem",
                    marginLeft: "2rem",
                  }}
                >
                  {employeesWithPendingLeaves}
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

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <motion.div 
          variants={tableVariants}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          <DataTable
            columns={columns}
            data={employees}
            loading={loading}
            error={error}
            onRowClick={handleRowClick}
            searchable={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            emptyStateMessage="No employees found"
            stickyHeader={true}
            dense={false}
          />
        </motion.div>
      )}

      {/* Employee Dialog */}
      <AnimatePresence>
        {selectedEmployee && (
          <EmployeeDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            employee={selectedEmployee}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SuperadminView;