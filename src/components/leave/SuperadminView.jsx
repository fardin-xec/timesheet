import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "../common/DataTable";
import { fetchEmployeesWithLeaves } from "../../utils/api";
import {
  getLeaveRules,
  updateLeaveRule,
  initializeDefaultLeaveRules,
} from "../../utils/api";
import EmployeeDialog from "./EmployeeLeaveDialog";
import {
  BeachAccess,
  People,
  CheckCircle,
  PendingActions,
  Refresh,
  TrendingUp,
  Settings,
  Edit,
  Save,
  AddCircle,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

const SuperadminView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Tab state
  const [currentTab, setCurrentTab] = useState(0);

  // Leave Rules state
  const [leaveRules, setLeaveRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("India");
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
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
    hidden: { opacity: 0, x: -50, scale: 0.9 },
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
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      scale: 1.02,
      y: -5,
      boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.3 },
    },
  };

  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const refreshButtonVariants = {
    hover: {
      scale: 1.1,
      rotate: 180,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    tap: { scale: 0.9, transition: { duration: 0.1 } },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -90 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, ease: "easeOut", type: "spring" },
    },
  };

  // Validation functions
  const validateMaxAllowed = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) {
      return "Max allowed must be a number";
    }
    if (num < 0) {
      return "Max allowed cannot be negative";
    }
    if (num > 365) {
      return "Max allowed cannot exceed 365 days";
    }
    return "";
  };

  const validateCarryForwardMax = (value, maxAllowed) => {
    if (value === "" || value === null || value === undefined) {
      return ""; // Optional field
    }
    const num = parseInt(value);
    if (isNaN(num)) {
      return "Carry forward must be a number";
    }
    if (num < 0) {
      return "Carry forward cannot be negative";
    }
    if (num > parseInt(maxAllowed)) {
      return "Carry forward cannot exceed max allowed days";
    }
    return "";
  };

  const validateAccrualRate = (value) => {
    if (value === "" || value === null || value === undefined) {
      return ""; // Optional field
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return "Accrual rate must be a number";
    }
    if (num < 0) {
      return "Accrual rate cannot be negative";
    }
    if (num > 30) {
      return "Accrual rate cannot exceed 30 days per month";
    }
    return "";
  };

  const validateMinTenureMonths = (value) => {
    if (value === "" || value === null || value === undefined) {
      return ""; // Optional field
    }
    const num = parseInt(value);
    if (isNaN(num)) {
      return "Minimum tenure must be a number";
    }
    if (num < 0) {
      return "Minimum tenure cannot be negative";
    }
    if (num > 120) {
      return "Minimum tenure cannot exceed 120 months (10 years)";
    }
    return "";
  };

  const validateAdvanceNoticeDays = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) {
      return "Advance notice days must be a number";
    }
    if (num < 1) {
      return "Advance notice days must be at least 1";
    }
    if (num > 90) {
      return "Advance notice days cannot exceed 90 days";
    }
    return "";
  };

  const validateAllFields = (rule) => {
    const errors = {};
    
    const maxAllowedError = validateMaxAllowed(rule.maxAllowed);
    if (maxAllowedError) errors.maxAllowed = maxAllowedError;

    const carryForwardError = validateCarryForwardMax(rule.carryForwardMax, rule.maxAllowed);
    if (carryForwardError) errors.carryForwardMax = carryForwardError;

    const accrualRateError = validateAccrualRate(rule.accrualRate);
    if (accrualRateError) errors.accrualRate = accrualRateError;

    const minTenureError = validateMinTenureMonths(rule.minTenureMonths);
    if (minTenureError) errors.minTenureMonths = minTenureError;

    const advanceNoticeError = validateAdvanceNoticeDays(rule.advanceNoticeDays);
    if (advanceNoticeError) errors.advanceNoticeDays = advanceNoticeError;

    return errors;
  };

  const handleFieldChange = (field, value) => {
    // Input-level restrictions
    let sanitizedValue = value;

    switch (field) {
      case "maxAllowed":
        // Only allow positive integers, max 365
        if (value === "" || value === null) {
          sanitizedValue = 0;
        } else {
          const num = parseInt(value);
          if (isNaN(num) || num < 0) {
            sanitizedValue = 0;
          } else if (num > 365) {
            sanitizedValue = 365;
          } else {
            sanitizedValue = num;
          }
        }
        break;

      case "carryForwardMax":
        // Only allow positive integers, max = maxAllowed
        if (value === "" || value === null) {
          sanitizedValue = 0;
        } else {
          const num = parseInt(value);
          const maxAllowed = editingRule?.maxAllowed || 365;
          if (isNaN(num) || num < 0) {
            sanitizedValue = 0;
          } else if (num > maxAllowed) {
            sanitizedValue = maxAllowed;
          } else {
            sanitizedValue = num;
          }
        }
        break;

      case "accrualRate":
        // Only allow positive numbers with decimals, max 30
        if (value === "" || value === null) {
          sanitizedValue = 0;
        } else {
          const num = parseFloat(value);
          if (isNaN(num) || num < 0) {
            sanitizedValue = 0;
          } else if (num > 30) {
            sanitizedValue = 30;
          } else {
            // Round to 2 decimal places
            sanitizedValue = Math.round(num * 100) / 100;
          }
        }
        break;

      case "minTenureMonths":
        // Only allow positive integers, max 120
        if (value === "" || value === null) {
          sanitizedValue = 0;
        } else {
          const num = parseInt(value);
          if (isNaN(num) || num < 0) {
            sanitizedValue = 0;
          } else if (num > 120) {
            sanitizedValue = 120;
          } else {
            sanitizedValue = num;
          }
        }
        break;

      case "advanceNoticeDays":
        // Only allow positive integers, min 1, max 90
        if (value === "" || value === null) {
          sanitizedValue = 1;
        } else {
          const num = parseInt(value);
          if (isNaN(num) || num < 1) {
            sanitizedValue = 1;
          } else if (num > 90) {
            sanitizedValue = 90;
          } else {
            sanitizedValue = num;
          }
        }
        break;

      default:
        sanitizedValue = value;
        break;
    }

    setEditingRule({
      ...editingRule,
      [field]: sanitizedValue,
    });

    // Clear error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the field
    let error = "";
    switch (field) {
      case "maxAllowed":
        error = validateMaxAllowed(editingRule[field]);
        break;
      case "carryForwardMax":
        error = validateCarryForwardMax(editingRule[field], editingRule.maxAllowed);
        break;
      case "accrualRate":
        error = validateAccrualRate(editingRule[field]);
        break;
      case "minTenureMonths":
        error = validateMinTenureMonths(editingRule[field]);
        break;
      case "advanceNoticeDays":
        error = validateAdvanceNoticeDays(editingRule[field]);
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeesWithLeaves();
      const employeesWithId = data.map((emp, index) => ({
        ...emp,
        id: emp.id || `emp-${index}`,
      }));

      setEmployees(employeesWithId);
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError("Failed to load employees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveRules = async () => {
    try {
      setRulesLoading(true);
      const rules = await getLeaveRules();
      setLeaveRules(rules);
    } catch (err) {
      console.error("Failed to load leave rules:", err);
      setError("Failed to load leave rules");
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadLeaveRules();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);

    try {
      if (currentTab === 0) {
        await loadEmployees();
      } else {
        await loadLeaveRules();
      }
      setTimeout(() => {
        setLoading(false);
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error("Failed to refresh:", error);
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle Edit Rule
  const handleEditRule = (rule) => {
    setEditingRule({ ...rule });
    setEditDialogOpen(true);
    setValidationErrors({});
    setTouched({});
  };

  const handleSaveRule = async () => {
    // Validate all fields
    const errors = validateAllFields(editingRule);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Mark all fields as touched to show errors
      setTouched({
        maxAllowed: true,
        carryForwardMax: true,
        accrualRate: true,
        minTenureMonths: true,
        advanceNoticeDays: true,
      });
      return;
    }

    try {
      setRulesLoading(true);
      await updateLeaveRule(editingRule.id, {
        maxAllowed: editingRule.maxAllowed,
        carryForwardMax: editingRule.carryForwardMax || null,
        accrualRate: editingRule.accrualRate || null,
        isActive: editingRule.isActive,
        minTenureMonths: editingRule.minTenureMonths || null,
        advanceNoticeDays: editingRule.advanceNoticeDays,
        requiresDocument: editingRule.requiresDocument,
      });

      await loadLeaveRules();
      setEditDialogOpen(false);
      setEditingRule(null);
      setValidationErrors({});
      setTouched({});
    } catch (err) {
      console.error("Failed to update leave rule:", err);
      alert("Failed to update leave rule: " + err.message);
    } finally {
      setRulesLoading(false);
    }
  };

  const handleInitializeRules = async () => {
    try {
      setRulesLoading(true);
      await initializeDefaultLeaveRules(selectedLocation);
      await loadLeaveRules();
      setInitDialogOpen(false);
      alert(
        `Default ${selectedLocation} leave rules initialized successfully!`
      );
    } catch (err) {
      console.error("Failed to initialize rules:", err);
      alert("Failed to initialize rules: " + err.message);
    } finally {
      setRulesLoading(false);
    }
  };

  const isFormValid = () => {
    if (!editingRule) return false;
    const errors = validateAllFields(editingRule);
    return Object.keys(errors).length === 0;
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      width: "200px",
      align: "left",
      renderCell: ({ row }) => (
        <span className="font-semibold text-gray-800 text-sm">
          {`${row.firstName || ""} ${row.midName || ""} ${
            row.lastName || ""
          }`.trim()}
        </span>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      sortable: true,
      width: "220px",
      align: "left",
      renderCell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.email}</span>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      sortable: true,
      width: "160px",
      align: "left",
      renderCell: ({ row }) => (
        <span className="text-sm font-medium text-gray-800">
          {row.department}
        </span>
      ),
    },
    {
      field: "pendingLeaves",
      headerName: "Pending Leaves",
      sortable: true,
      width: "140px",
      align: "center",
      renderCell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {row.pendingLeaves || 0}
          </span>
        </div>
      ),
    },
    {
      field: "approvedLeaves",
      headerName: "Approved Leaves",
      sortable: true,
      width: "140px",
      align: "center",
      renderCell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {row.approvedLeaves || 0}
          </span>
        </div>
      ),
    },
  ];

  // Leave Rules columns
  const rulesColumns = [
    {
      field: "leaveType",
      headerName: "Leave Type",
      sortable: true,
      width: "180px",
      align: "left",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Chip
            label={row.leaveType}
            size="small"
            color="primary"
            variant="outlined"
          />
        </div>
      ),
    },
    {
      field: "maxAllowed",
      headerName: "Max Allowed",
      sortable: true,
      width: "120px",
      align: "center",
      renderCell: ({ row }) => (
        <span className="font-semibold text-gray-800">{row.maxAllowed}</span>
      ),
    },
    {
      field: "carryForwardMax",
      headerName: "Carry Forward",
      sortable: true,
      width: "130px",
      align: "center",
      renderCell: ({ row }) => (
        <span className="text-gray-700">{row.carryForwardMax || "N/A"}</span>
      ),
    },
    {
      field: "accrualRate",
      headerName: "Accrual Rate",
      sortable: true,
      width: "120px",
      align: "center",
      renderCell: ({ row }) => (
        <span className="text-gray-700">{row.accrualRate || "N/A"}</span>
      ),
    },
    {
      field: "requiresDocument",
      headerName: "Document Required",
      sortable: true,
      width: "150px",
      align: "center",
      renderCell: ({ row }) => (
        <Chip
          label={row.requiresDocument ? "Yes" : "No"}
          size="small"
          color={row.requiresDocument ? "warning" : "default"}
        />
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      sortable: true,
      width: "100px",
      align: "center",
      renderCell: ({ row }) => (
        <Chip
          label={row.isActive ? "Active" : "Inactive"}
          size="small"
          color={row.isActive ? "success" : "default"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: "100px",
      align: "center",
      renderCell: ({ row }) => (
        <Tooltip title="Edit Rule">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditRule(row);
            }}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Calculate stats
  const totalEmployees = employees.length;
  const totalPendingLeaves = employees.reduce(
    (sum, emp) => sum + (emp.pendingLeaves || 0),
    0
  );
  const totalApprovedLeaves = employees.reduce(
    (sum, emp) => sum + (emp.approvedLeaves || 0),
    0
  );
  const employeesWithPendingLeaves = employees.filter(
    (emp) => (emp.pendingLeaves || 0) > 0
  ).length;

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

        <div className="flex gap-2">
          {currentTab === 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInitDialogOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 flex items-center gap-2"
            >
              <AddCircle fontSize="small" />
              Initialize Rules
            </motion.button>
          )}

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
        </div>
      </motion.div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<People />} iconPosition="start" label="Employee Leaves" />
          <Tab icon={<Settings />} iconPosition="start" label="Manage Rules" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <>
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
                      style={{ marginTop: "-1rem", marginLeft: "2rem" }}
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
                      style={{ marginTop: "-1rem", marginLeft: "2rem" }}
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
                      style={{ marginTop: "-1rem", marginLeft: "2rem" }}
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
                    <p className="text-gray-600 text-sm">
                      Employees with Pending
                    </p>
                    <motion.p
                      className="text-2xl font-bold text-gray-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 1.1 }}
                      style={{ marginTop: "-1rem", marginLeft: "2rem" }}
                    >
                      {employeesWithPendingLeaves}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
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
        </>
      )}

      {currentTab === 1 && (
        <motion.div
          variants={tableVariants}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          <DataTable
            columns={rulesColumns}
            data={leaveRules}
            loading={rulesLoading}
            error={error}
            searchable={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            emptyStateMessage="No leave rules found. Click 'Initialize Rules' to create default rules."
            stickyHeader={true}
            dense={false}
          />
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

      {/* Edit Rule Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Leave Rule - {editingRule?.leaveType}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Max Allowed"
              type="number"
              value={editingRule?.maxAllowed || 0}
              onChange={(e) => handleFieldChange("maxAllowed", e.target.value)}
              onBlur={() => handleFieldBlur("maxAllowed")}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e'
                if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
              error={touched.maxAllowed && !!validationErrors.maxAllowed}
              helperText={touched.maxAllowed && validationErrors.maxAllowed}
              fullWidth
              required
              inputProps={{ min: 0, max: 365, step: 1 }}
            />

            <TextField
              label="Carry Forward Max"
              type="number"
              value={editingRule?.carryForwardMax || 0}
              onChange={(e) => handleFieldChange("carryForwardMax", e.target.value)}
              onBlur={() => handleFieldBlur("carryForwardMax")}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e'
                if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
              error={touched.carryForwardMax && !!validationErrors.carryForwardMax}
              helperText={touched.carryForwardMax ? validationErrors.carryForwardMax : "Maximum days that can be carried forward to next year"}
              fullWidth
              inputProps={{ min: 0, max: editingRule?.maxAllowed || 365, step: 1 }}
            />

            <TextField
              label="Accrual Rate"
              type="number"
              value={editingRule?.accrualRate || 0}
              onChange={(e) => handleFieldChange("accrualRate", e.target.value)}
              onBlur={() => handleFieldBlur("accrualRate")}
              onKeyDown={(e) => {
                // Prevent negative sign and 'e', allow decimal point
                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
              error={touched.accrualRate && !!validationErrors.accrualRate}
              helperText={touched.accrualRate ? validationErrors.accrualRate : "Leaves accrued per month"}
              fullWidth
              inputProps={{ min: 0, max: 30, step: 0.1 }}
            />

            <TextField
              label="Minimum Tenure (Months)"
              type="number"
              value={editingRule?.minTenureMonths || 0}
              onChange={(e) => handleFieldChange("minTenureMonths", e.target.value)}
              onBlur={() => handleFieldBlur("minTenureMonths")}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e'
                if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
              error={touched.minTenureMonths && !!validationErrors.minTenureMonths}
              helperText={touched.minTenureMonths ? validationErrors.minTenureMonths : "Minimum months of employment required"}
              fullWidth
              inputProps={{ min: 0, max: 120, step: 1 }}
            />

            <TextField
              label="Advance Notice Days"
              type="number"
              value={editingRule?.advanceNoticeDays || 1}
              onChange={(e) => handleFieldChange("advanceNoticeDays", e.target.value)}
              onBlur={() => handleFieldBlur("advanceNoticeDays")}
              onKeyDown={(e) => {
                // Prevent negative sign, decimal point, and 'e'
                if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
              error={touched.advanceNoticeDays && !!validationErrors.advanceNoticeDays}
              helperText={touched.advanceNoticeDays ? validationErrors.advanceNoticeDays : "Days of advance notice required"}
              fullWidth
              required
              inputProps={{ min: 1, max: 90, step: 1 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editingRule?.requiresDocument || false}
                  onChange={(e) => handleFieldChange("requiresDocument", e.target.checked)}
                />
              }
              label="Requires Document"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editingRule?.isActive || false}
                  onChange={(e) => handleFieldChange("isActive", e.target.checked)}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setValidationErrors({});
              setTouched({});
            }}
            style={{
              color: "red",
              backgroundColor: "transparent",
              border: "2px solid red",
              borderRadius: "4px",
              padding: "8px 16px",
              maxHeight: "38px",
              cursor: "pointer",
              transition: "background-color 0.3s, color 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "red";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "red";
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRule}
            variant="contained"
            startIcon={<Save />}
            disabled={rulesLoading || !isFormValid()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Initialize Rules Dialog */}
      <Dialog
        open={initDialogOpen}
        onClose={() => setInitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Initialize Default Leave Rules</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <p className="text-gray-600 mb-4">
              Select the location to initialize default leave rules based on
              regional compliance.
            </p>

            <TextField
              select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              fullWidth
            >
              <MenuItem value="India">India</MenuItem>
              <MenuItem value="Qatar">Qatar</MenuItem>
            </TextField>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-2">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Default rules for {selectedLocation}:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Annual Leave: 11 days</li>
                <li>• Casual Leave: 11 days</li>
                <li>• Sick Leave: 2 days</li>
                <li>• Emergency Leave: 3 days</li>
                {selectedLocation === "India" && (
                  <li>• Maternity Leave: 26 weeks</li>
                )}
                {selectedLocation === "Qatar" && (
                  <li>• Maternity Leave: 50 days</li>
                )}
                <li>• Loss of Pay: 365 days</li>
              </ul>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInitDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInitializeRules}
            variant="contained"
            color="success"
            disabled={rulesLoading}
          >
            Initialize
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default SuperadminView;