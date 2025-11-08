import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  deletePayroll,
  fetchPayroll,
  updatePayroll,
  bulkUpdatePayroll,
} from "../../utils/api";
import PayrollDialog from "./PayrollDialog";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import Menu from "@mui/material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PaymentIcon from "@mui/icons-material/Payment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Refresh from "@mui/icons-material/Refresh";

// Third-party components
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from "../common/DataTable";
import { Trash2Icon } from "lucide-react";

const Status = {
  APPROVED: "approved",
  PENDING: "pending",
};

const statusColorMap = {
  [Status.APPROVED]: "#10B981",
  [Status.PENDING]: "#F59E0B",
};

const currency = {
  USD: "$",
  EUR: "€",
  INR: "Rs",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
  QAR: "QR",
};
const currencyToUSD = {
  USD: 1,
  EUR: 1.09,    // 1 EUR = 1.09 USD
  INR: 0.012,   // 1 INR = 0.012 USD
  GBP: 1.27,    // 1 GBP = 1.27 USD
  AUD: 0.67,    // 1 AUD = 0.67 USD
  CAD: 0.74,    // 1 CAD = 0.74 USD
  QAR: 0.27,    // 1 QAR = 0.27 USD
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

const filterVariants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
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

const cardVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
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

const drawerVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

const convertToUSD = (amount, currencyCode) => {
  const rate = currencyToUSD[currencyCode] || 1;
  return parseInt(amount || 0, 10) * rate;
};

// Component for month and year filters
const PayrollFilters = ({ month, setMonth, year, setYear }) => (
  <motion.div variants={filterVariants}>
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel id="month-select-label">Month</InputLabel>
        <Select
          labelId="month-select-label"
          value={month}
          label="Month"
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id="year-select-label">Year</InputLabel>
        <Select
          labelId="year-select-label"
          value={year}
          label="Year"
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i
          ).map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  </motion.div>
);

// Component for displaying status badges
const StatusBadge = ({ status }) => {
  return status === "approved" ? (
    <Chip label="Approved" color="success" size="medium" variant="outlined" />
  ) : (
    <Chip label="Pending" color="warning" size="medium" variant="outlined" />
  );
};

// Component for actions menu
const PayrollActions = ({
  row,
  onEdit,
  onView,
  onStatusChange,
  isSuperAdmin,
  handleDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        aria-label="Actions menu"
        aria-controls={open ? `payroll-menu-${row.id}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        id={`payroll-menu-${row.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            onEdit(row);
            handleClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        {isSuperAdmin && (
          <MenuItem
            onClick={() => {
              if (
                window.confirm(
                  `Change status to ${
                    row.status === "approved" ? "pending" : "approved"
                  }?`
                )
              ) {
                onStatusChange(row.id, row.status);
              }
              handleClose();
            }}
            sx={{
              color:
                row.status === "approved" ? "warning.main" : "success.main",
            }}
          >
            <ListItemIcon>
              {row.status === "approved" ? (
                <PendingIcon fontSize="small" color="warning" />
              ) : (
                <CheckCircleIcon fontSize="small" color="success" />
              )}
            </ListItemIcon>
            <ListItemText>
              {row.status === "approved" ? "Set Pending" : "Approve"}
            </ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            onView(row);
            handleClose();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {handleDelete && (
          <MenuItem
            onClick={() => {
              handleDelete(row);
              handleClose();
            }}
          >
            <ListItemIcon>
              <Trash2Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

// Component for employee view of payroll list
const EmployeePayrollList = ({
  payrollData,
  userId,
  onEdit,
  onView,
  handleDelete,
}) => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Stack spacing={2}>
        {payrollData
          .filter((row) => row.employeeId === userId)
          .map((row, index) => (
            <motion.div
              key={row.id}
              variants={cardVariants}
              custom={index}
              whileHover="hover"
              whileTap="tap"
            >
              <Card
                elevation={1}
                onClick={() => onView(row)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      Payslip for{" "}
                      {new Date(0, row.month - 1).toLocaleString("default", {
                        month: "long",
                      })}
                      /{row.year}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Net Salary: {currency[row.employee?.currency] || "$"}
                      {row.netSalary?.toLocaleString() || "0"}
                    </Typography>
                    <StatusBadge status={row.status} />
                  </Box>
                  <PayrollActions
                    row={row}
                    onEdit={onEdit}
                    onView={onView}
                    onStatusChange={() => {}} // Employee can't change status
                    isSuperAdmin={false}
                    handleDelete={handleDelete}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </Stack>
    </motion.div>
  );
};

// Component for the edit drawer
const EditDrawer = ({
  payroll,
  isOpen,
  onClose,
  onSave,
  isUpdating,
  selectedRows,
}) => {
  const isBulkEdit = Array.isArray(payroll);
  const [form, setForm] = useState({
    basicSalary: "",
    specialAllowances: "",
    otherAllowances: "",
  });

  useEffect(() => {
    if (isBulkEdit) {
      // Initialize empty for bulk edit
      setForm({
        basicSalary: "",
        specialAllowances: "",
        otherAllowances: "",
      });
    } else if (payroll) {
      // Single edit
      setForm({
        basicSalary: payroll.basicSalary,
        specialAllowances: payroll.specialAllowances,
        otherAllowances: payroll.otherAllowances,
      });
    }
  }, [payroll, isBulkEdit]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Drawer
          anchor="right"
          open={isOpen}
          onClose={onClose}
          sx={{
            "& .MuiDrawer-paper": {
              width: { xs: "100%", sm: 400 },
              p: 3,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ height: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">
                {isBulkEdit
                  ? `Edit ${selectedRows.length} Payroll Records`
                  : "Edit Payroll"}
              </Typography>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton edge="end" onClick={onClose} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </motion.div>
            </Box>

            <Stack spacing={3} sx={{ flex: 1 }}>
              <TextField
                label="Basic Salary"
                type="number"
                value={form.basicSalary}
                onChange={(e) =>
                  setForm({
                    ...form,
                    basicSalary: e.target.value ? Number(e.target.value) : "",
                  })
                }
                fullWidth
                disabled={isBulkEdit}
                InputProps={{ inputProps: { min: 0 } }}
                helperText={
                  isBulkEdit
                    ? "Cannot edit basic salary for multiple records"
                    : ""
                }
              />

              <TextField
                label="Special Allowances"
                type="number"
                value={form.specialAllowances}
                onChange={(e) =>
                  setForm({
                    ...form,
                    specialAllowances: e.target.value
                      ? Number(e.target.value)
                      : "",
                  })
                }
                fullWidth
                disabled={isBulkEdit}
                InputProps={{ inputProps: { min: 0 } }}
                helperText={
                  isBulkEdit
                    ? "Cannot edit special allowances for multiple records"
                    : ""
                }
              />

              <TextField
                label="Other Allowances"
                type="number"
                value={form.otherAllowances}
                onChange={(e) =>
                  setForm({
                    ...form,
                    otherAllowances: e.target.value
                      ? Number(e.target.value)
                      : "",
                  })
                }
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
                helperText={
                  isBulkEdit ? "Leave blank to keep existing values" : ""
                }
              />
            </Stack>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 3,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button onClick={onClose} sx={{ mr: 1 }} disabled={isUpdating}>
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  onClick={() => onSave(form, isBulkEdit ? selectedRows : null)}
                  disabled={isUpdating}
                  startIcon={
                    isUpdating ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Drawer>
      )}
    </AnimatePresence>
  );
};

// Main PayrollView component
const PayrollView = ({ user }) => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isSuperAdmin = user?.role === "admin";

  useEffect(() => {
    if (!editDrawerOpen) {
      setSelectedPayroll(null);
    }
  }, [editDrawerOpen]);

  // Column definitions for DataTable
  const columns = [
    {
      field: "employeeId",
      headerName: "Employee Id",
      width: 200,
      renderCell: ({ row }) => {
        return row.employee?.employeeId || "";
      },
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: ({ row }) => {
        if (!row.employee) return "";
        return `${row.employee.firstName || ""} ${
          row.employee.midName ? row.employee.midName : ""
        } ${row.employee.lastName || ""}`.trim();
      },
    },
    {
      field: "basicSalary",
      headerName: "Basic Salary",
      width: 150,
      renderCell: ({ row }) => {
        const currencySymbol = row.employee?.currency
          ? currency[row.employee.currency]
          : "$";
        return `${currencySymbol} ${row.basicSalary?.toLocaleString() || "0"}`;
      },
    },
    {
      field: "netSalary",
      headerName: "Net Salary",
      width: 150,
      renderCell: ({ row }) => {
        const currencySymbol = row.employee?.currency
          ? currency[row.employee.currency]
          : "$";
        return `${currencySymbol} ${row.netSalary?.toLocaleString() || "0"}`;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: ({ row }) => <StatusBadge status={row.status} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: ({ row }) => (
        <PayrollActions
          row={row}
          onEdit={handleEditClick}
          onView={(row) => setSelectedPayroll(row)}
          onStatusChange={handleStatusChange}
          isSuperAdmin={isSuperAdmin}
          handleDelete={handleDeleteClick}
        />
      ),
    },
  ];

  const bulkActions = isSuperAdmin
    ? [
        {
          label: "Approve Selected",
          icon: <CheckIcon />,
          variant: "success",
        },
        {
          label: "Edit Selected",
          icon: <EditNoteIcon />,
          variant: "primary",
        },
      ]
    : [];

  const fetchPayrollData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchPayroll(
        {
          page: 1,
          limit: 100,
          month,
          year,
          employeeId: isSuperAdmin ? null : user.employee?.id,
        },
        user.orgId
      );

      setPayrollData(response.data || []);
      setError(null);
      setHasLoaded(true);
      toast.success("Payroll data loaded successfully");
    } catch (err) {
      setError(err.message || "Failed to load payroll data");
      toast.error(`Error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [month, year, user.employee?.id, user.orgId, isSuperAdmin]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);

    try {
      await fetchPayrollData();
      // Add a small delay for better UX
      setTimeout(() => {
        setLoading(false);
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error("Failed to refresh payroll data:", error);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const newStatus = status === "approved" ? "pending" : "approved";
      await updatePayroll(id, { status: newStatus });
      setPayrollData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
      toast.success(`Payroll status changed to ${newStatus} successfully`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkAction = async (action, selectedItems, selectedIds) => {
    if (action.label === "Approve Selected") {
      setLoading(true);
      try {
        const bulkData = selectedItems
          .filter((item) => item.status !== Status.APPROVED)
          .map((item) => ({ id: item.id, status: Status.APPROVED }));
        if (bulkData.length === 0) {
          toast.info("No pending payrolls to approve");
          setLoading(false);
          return;
        }
        await bulkUpdatePayroll(bulkData);
        await fetchPayrollData();
        setSelectedRows([]);
        toast.success("Selected payrolls approved successfully");
      } catch (err) {
        toast.error(
          `Failed to approve payrolls: ${err.message || "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }
    } else if (action.label === "Edit Selected") {
      setSelectedPayroll(selectedItems);
      setEditDrawerOpen(true);
    }
  };

  const handleDeleteClick = async (row) => {
    try {
      await deletePayroll(row.id);
      await fetchPayrollData();
      setSelectedPayroll(null);
      toast.success("Payroll deleted successfully");
    } catch (err) {
      toast.error("Failed to delete payroll");
    }
  };

  const handleEditClick = (row) => {
    setSelectedPayroll(row);
    setEditDrawerOpen(true);
  };

  const handleEditSubmit = async (formData, selectedRowIds) => {
    setIsUpdating(true);
    try {
      if (selectedRowIds) {
        // Bulk edit
        const updatePayload = {};
        if (formData.otherAllowances !== "") {
          updatePayload.otherAllowances = formData.otherAllowances;
        }
        if (Object.keys(updatePayload).length === 0) {
          toast.warn("No changes provided for bulk update");
          setEditDrawerOpen(false);
          setIsUpdating(false);
          return;
        }
        const bulkData = selectedRowIds.map((id) => ({ id, ...updatePayload }));
        await bulkUpdatePayroll(bulkData);
        await fetchPayrollData();
        setSelectedRows([]);
        toast.success("Selected payrolls updated successfully");
      } else {
        // Single edit
        await updatePayroll(selectedPayroll.id, formData);
        await fetchPayrollData();
        toast.success("Payroll updated successfully");
      }
      setEditDrawerOpen(false);
    } catch (err) {
      toast.error(
        `Failed to update payroll(s): ${err.message || "Unknown error"}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate stats
  const totalPayrolls = payrollData.length;
  const pendingPayrolls = payrollData.filter(
    (item) => item.status === "pending"
  ).length;
  const approvedPayrolls = payrollData.filter(
    (item) => item.status === "approved"
  ).length;
  const totalSalaryPaid = payrollData
    .filter(item => item.status === 'approved')
    .reduce((sum, item) => {
      const employeeCurrency = item.employee?.currency || 'USD';
      const salaryInUSD = convertToUSD(item.netSalary, employeeCurrency);
      return sum + salaryInUSD;
    }, 0)

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
            <PaymentIcon sx={{ fontSize: 32, color: "#1976d2" }} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payroll Management
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
                <TrendingUpIcon sx={{ color: "#1976d2", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Total Payrolls</p>
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
                  {totalPayrolls}
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
                <CheckCircleIcon sx={{ color: "#388e3c", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Approved Payrolls</p>
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
                  {approvedPayrolls}
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
                className="p-3 mt-2 bg-yellow-100 rounded-full"
              >
                <PendingIcon sx={{ color: "#FFC900", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Pending Payrolls</p>
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
                  {pendingPayrolls}
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
                <MonetizationOnIcon sx={{ color: "#7b1fa2", fontSize: 24 }} />
              </motion.div>
              <div>
                <p className="text-gray-600 text-sm">Total Paid Out</p>
                <motion.p
                  className="text-2xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.1 }}
                  style={{
                    marginTop: "-1rem",
                  }}
                >
                  ${totalSalaryPaid.toLocaleString()}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Filters */}
      <PayrollFilters
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
      />

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

      {/* Content */}
      {!loading && !error && (
        <>
          {isSuperAdmin ? (
            <motion.div
              variants={tableVariants}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <DataTable
                columns={columns}
                data={payrollData}
                loading={loading}
                error={error}
                pagination
                pageSize={10}
                sortable
                searchable
                statusColorMap={statusColorMap}
                emptyStateMessage={
                  payrollData.length === 0 ? "No payroll records found" : error
                }
                selectable={isSuperAdmin}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                bulkActions={bulkActions}
                onBulkAction={handleBulkAction}
                stickyHeader={true}
                dense={false}
              />
            </motion.div>
          ) : (
            <EmployeePayrollList
              payrollData={payrollData}
              userId={user.employee?.id}
              onEdit={handleEditClick}
              onView={(row) => setSelectedPayroll(row)}
              handleDelete={handleDeleteClick}
            />
          )}
        </>
      )}

      {/* Payroll Dialog */}
      <AnimatePresence>
        {selectedPayroll && !Array.isArray(selectedPayroll) && (
          <PayrollDialog
            open={!!selectedPayroll && !editDrawerOpen}
            onClose={() => setSelectedPayroll(null)}
            payroll={selectedPayroll}
            month={month}
            year={year}
          />
        )}
      </AnimatePresence>

      {/* Edit Drawer */}
      <EditDrawer
        payroll={selectedPayroll}
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        onSave={handleEditSubmit}
        isUpdating={isUpdating}
        selectedRows={selectedRows}
      />

      <ToastContainer position="bottom-right" autoClose={3000} />
    </motion.div>
  );
};

export default PayrollView;
