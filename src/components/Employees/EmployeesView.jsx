import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  Pagination,
} from "@mui/material";
import { MoreVertical, User, UserX, Plus, Trash2 } from "lucide-react";
import { debounce } from "lodash";
import {
  Event,
  BeachAccess,
  People,
  PersonAdd,
  Business,
  Refresh,
  Search,
} from "@mui/icons-material";
import AddEmployee from "./AddEmployee";
import CommonDrawer from "../common/Drawer";
import Toast from "../common/Toast";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import EmployeeProfileDialog from "./EmployeeProfileDialog";
import EmployeeDialog from "../leave/EmployeeLeaveDialog";
import AttendanceEmployeeDialog from "../Attendance/AttendanceEmployeeDialog";
import InactivationDialog from "./InactivationDialog";
import api from "../../utils/api_call";
import "../../styles/employee.css";

// Utility to format dates consistently
const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

const EmployeesView = () => {
  const [employees, setEmployees] = useState([]);
  const [department, setDepartment] = useState([]);
  const [subDepartment, setSubDepartment] = useState([]);
  const [jobTitle, setJobTitle] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuEmployee, setMenuEmployee] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workLocation, setWorkLocation] = useState([]);
  const [employmentType, setEmploymentType] = useState([]);
  const [positions, setPositions] = useState([]);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);

  // New state for inactivation dialog
  const [inactivationDialogOpen, setInactivationDialogOpen] = useState(false);
  const [employeeToInactivate, setEmployeeToInactivate] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const token = localStorage.getItem("access_token");
  const orgId = localStorage.getItem("orgId");

  const API_ENDPOINTS = useMemo(
    () => ({
      EMPLOYEES: `/employees/organization/${orgId}`,
      DEPARTMENTS: "/dropdowns/types/1",
      SUB_DEPARTMENTS: "/dropdowns/types/2",
      POSITIONS: "/dropdowns/types/5",
      EMPLOYMENT_TYPES: "/dropdowns/types/4",
      WORK_LOCATIONS: "/dropdowns/types/3",
      JOB_TITLES: "/dropdowns/types/9",
      MANAGERS: "/employees/managers",
    }),
    [orgId]
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
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

  const employeeCardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut", delay: index * 0.05 },
    }),
    hover: {
      scale: 1.02,
      y: -2,
      boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
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

  const searchBarVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
    },
  };

  const handleProfileDialogClose = async () => {
    setProfileDialogOpen(false);
    setSelectedEmployee(null);
    await handleRefresh();
  };

  const fetchData = useCallback(
    async (url, setter, errorMessage) => {
      try {
        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.statusCode !== 200) throw new Error(errorMessage);
        const data = response.data.data || [];
        setter(
          url.includes("manager")
            ? data.map((item) => ({
                id: item.id,
                firstName: item.firstName,
                lastName: item.lastName,
                midName: item.midName || "",
                department: item.department || "Unknown",
              }))
            : data.map((item) => ({
                id: item.valueId,
                name: item.valueName || "Unnamed",
              }))
        );
      } catch (err) {
        setError(err.message);
        setToastMessage(errorMessage);
        setToastOpen(true);
        console.error(err);
      }
    },
    [token]
  );

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.EMPLOYEES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.statusCode !== 200)
        throw new Error("Failed to fetch employee data");
      const employeeData = response.data.data || [];
      const processedEmployees = employeeData.map((emp) => ({
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        middleName: emp.midName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        jobTitle: emp.jobTitle,
        employmentType: emp.employmentType,
        workLocation: emp.workLocation,
        dob: emp.dob,
        joiningDate: emp.joiningDate,
        avatar: emp.avatar || "/default-avatar.png",
        status: emp.status,
        createdat: formatDate(emp.createdat),
        organization: emp.organization,
        bio: emp.bio,
        skills: emp.skills,
        phone: emp.phone,
        gender: emp.gender,
        orgId: emp.organization.orgId,
        ctc: emp.ctc,
        currency: emp.currency,
        qid: emp.qid,
        qidExpirationDate: emp.qidExpiration,
        passportNumber: emp.passportNumber,
        passportValidTill: emp.passportExpiration,
        isProbation: emp.isProbation,
        confirmationDate: emp.confirmationDate,
      }));
      setEmployees(processedEmployees);
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError(err.message);
      setToastMessage("Failed to load employee data");
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  }, [token, API_ENDPOINTS.EMPLOYEES]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);

    try {
      await fetchEmployees();
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

  useEffect(() => {
    if (!token || !orgId) {
      setError("Authentication token or organization ID missing");
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchData(
            API_ENDPOINTS.DEPARTMENTS,
            setDepartment,
            "Failed to fetch department data"
          ),
          fetchData(
            API_ENDPOINTS.SUB_DEPARTMENTS,
            setSubDepartment,
            "Failed to fetch sub department data"
          ),
          fetchData(
            API_ENDPOINTS.POSITIONS,
            setPositions,
            "Failed to fetch position data"
          ),
          fetchData(
            API_ENDPOINTS.EMPLOYMENT_TYPES,
            setEmploymentType,
            "Failed to fetch employment type data"
          ),
          fetchData(
            API_ENDPOINTS.WORK_LOCATIONS,
            setWorkLocation,
            "Failed to fetch work location data"
          ),
          fetchData(
            API_ENDPOINTS.JOB_TITLES,
            setJobTitle,
            "Failed to fetch job title data"
          ),
          fetchData(
            API_ENDPOINTS.MANAGERS,
            setManagers,
            "Failed to fetch managers data"
          ),
          fetchEmployees(),
        ]);
      } catch (err) {
        setError(err.message);
        setToastMessage("Failed to load data");
        setToastOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, orgId]);

  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    return employees.filter((emp) =>
      [
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.department,
        emp.designation,
      ].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, employees]);

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMenuOpen = (event, employee) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuEmployee(employee);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuEmployee(null);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setDrawerOpen(true);
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      let payload;
      let endpoint;
      const isNewEmployee = !employeeData.id;

      setLoading(true);

      if (isNewEmployee) {
        endpoint = `/employees`;
        payload = {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          midName: employeeData.middleName || employeeData.midName || null,
          email: employeeData.email,
          phone: employeeData.phone,
          role: employeeData.role || "user",
          status: employeeData.status || "active",
          dob: employeeData.dob || null,
          gender: employeeData.gender || null,
          department: employeeData.department || null,
          jobTitle: employeeData.jobTitle || null,
          designation: employeeData.designation || null,
          employmentType: employeeData.employmentType || null,
          workLocation: employeeData.workLocation || null,
          address: employeeData.address || null,
          joiningDate: employeeData.joiningDate || null,
          isProbation: employeeData.isProbation || false,
          confirmationDate: employeeData.confirmationDate || null,
          bio: employeeData.bio || null,
          ctc: employeeData.ctc ? employeeData.ctc.toString() : null,
          currency: employeeData.currency || null,
          reportTo: employeeData.reportTo
            ? parseInt(employeeData.reportTo)
            : null,
          orgId: orgId ? parseInt(orgId) : null,
          accountHolderName:
            employeeData.bank_info?.account_holder_name ||
            employeeData.accountHolderName ||
            null,
          bankName:
            employeeData.bank_info?.bank_name || employeeData.bankName || null,
          branchName:
            employeeData.bank_info?.branch_name ||
            employeeData.branchName ||
            null,
          city: employeeData.bank_info?.city || employeeData.city || null,
          ifscCode:
            employeeData.bank_info?.ifsc_code || employeeData.ifscCode || null,
          accountNumber:
            employeeData.bank_info?.account_number ||
            employeeData.accountNumber ||
            null,
          swiftCode:
            employeeData.bank_info?.swiftCode || employeeData.swiftCode || null,
          ibanNo: employeeData.bank_info?.ibanNo || employeeData.ibanNo || null,
          qid: employeeData.qid || null,
          qidExpiration: employeeData.qidExpirationDate || null,
          passportNumber: employeeData.passportNumber || null,
          passportExpiration: employeeData.passportValidTill || null,
        };
      } else {
        endpoint = `/employees/${employeeData.id}`;
        payload = {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          midName: employeeData.middleName || employeeData.midName,
          email: employeeData.email,
          phone: employeeData.phone,
          status: employeeData.status,
          dob: employeeData.dob,
          gender: employeeData.gender,
          department: employeeData.department,
          jobTitle: employeeData.jobTitle,
          designation: employeeData.designation,
          employmentType: employeeData.employmentType,
          workLocation: employeeData.workLocation,
          address: employeeData.address,
          joiningDate: employeeData.joiningDate,
          isProbation: employeeData.isProbation || false,
          confirmationDate: employeeData.confirmationDate || null,
          bio: employeeData.bio,
        };

        if (employeeData.ctc !== undefined && employeeData.ctc !== null) {
          payload.ctc = employeeData.ctc.toString();
        }
        if (employeeData.currency) {
          payload.currency = employeeData.currency;
        }
        if (employeeData.reportTo !== undefined) {
          payload.reportTo = employeeData.reportTo;
        }

        if (employeeData.qid) payload.qid = employeeData.qid;
        if (employeeData.qidExpirationDate)
          payload.qidExpiration = employeeData.qidExpirationDate;
        if (employeeData.passportNumber)
          payload.passportNumber = employeeData.passportNumber;
        if (employeeData.passportValidTill)
          payload.passportExpiration = employeeData.passportValidTill;

        Object.keys(payload).forEach(
          (key) => payload[key] === undefined && delete payload[key]
        );
      }

      console.log(payload);

      const method = isNewEmployee ? api.post : api.put;
      const response = await method(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.statusCode !== (isNewEmployee ? 201 : 200)) {
        throw new Error(
          `Failed to ${isNewEmployee ? "create" : "update"} employee`
        );
      }

      await fetchEmployees();
      await fetchData(
        API_ENDPOINTS.MANAGERS,
        setManagers,
        "Failed to fetch managers data"
      );

      setToastMessage(
        `Employee ${isNewEmployee ? "added" : "updated"} successfully`
      );
      setToastOpen(true);
    } catch (err) {
      console.error("Error saving employee:", err);
      setToastMessage(err.message || "Failed to save employee data");
      setToastOpen(true);
    } finally {
      setLoading(false);
      setDrawerOpen(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEmployee(null);
  };

  const handleToggleStatus = async (
    reason = null,
    remarks = null,
    inactivationDate = null
  ) => {
    if (!menuEmployee && !employeeToInactivate) return;

    const employee = menuEmployee || employeeToInactivate;
    const isActivating =
      employee.status === "inactive" || employee.status === "pending_inactive";
    console.log(isActivating);

    try {
      setIsUpdatingStatus(true);

      let endpoint = `/employees/${employee.id}/update-status`;
      let payload;

      if (isActivating) {
        payload = {
          status: "ACTIVE",
        };
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(inactivationDate);
        selectedDate.setHours(0, 0, 0, 0);

        const isToday = selectedDate.getTime() === today.getTime();

        if (selectedDate.getTime() < today.getTime()) {
          setToastMessage("Inactivation date cannot be in the past");
          setToastOpen(true);
          return;
        }

        payload = {
          status: isToday ? "INACTIVE" : "PENDING_INACTIVE",
          reason,
          remarks,
          inactivationDate,
        };
      }

      const response = await api.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.statusCode !== 200) {
        throw new Error("Failed to update employee status");
      }

      await fetchEmployees();
      setToastMessage(
        `Employee ${isActivating ? "activated" : "inactivated"} successfully`
      );
      setToastOpen(true);

      if (inactivationDialogOpen) {
        setInactivationDialogOpen(false);
        setEmployeeToInactivate(null);
      }
    } catch (err) {
      setToastMessage(err.message || "Failed to update employee status");
      setToastOpen(true);
    } finally {
      setIsUpdatingStatus(false);
      handleMenuClose();
    }
  };

  const handleStatusToggleClick = () => {
    if (!menuEmployee) return;

    if (menuEmployee.status === "active") {
      setEmployeeToInactivate(menuEmployee);
      setInactivationDialogOpen(true);
    } else {
      handleToggleStatus();
    }

    handleMenuClose();
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      setIsDeleting(true);
      const response = await api.delete(`/employees/${employeeToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.statusCode !== 200)
        throw new Error("Failed to delete employee");
      await fetchEmployees();
      setToastMessage("Employee deleted successfully");
      setToastOpen(true);
    } catch (err) {
      setToastMessage(err.message || "Failed to delete employee");
      setToastOpen(true);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setProfileDialogOpen(true);
  };

  const handleLeaveManagement = (employee) => {
    if (!employee) return;
    setSelectedEmployee(employee);
    setLeaveDialogOpen(true);
    handleMenuClose();
  };

  const handleAttendanceManagement = (employee) => {
    if (!employee) return;
    setSelectedEmployee(employee);
    setAttendanceDialogOpen(true);
    handleMenuClose();
  };

  const handleLeaveDialogClose = () => {
    setLeaveDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleAttendanceDialogClose = () => {
    setAttendanceDialogOpen(false);
    setSelectedEmployee(null);
  };

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (emp) => emp.status === "active"
  ).length;
  const departments = [
    ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
  ].length;
  const recentJoiners = employees.filter((emp) => {
    const joinDate = new Date(emp.joiningDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinDate > thirtyDaysAgo;
  }).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="w-full">
        <CardContent className="p-0">
          {/* Header Section */}
          <motion.div
            variants={headerVariants}
            className="bg-blue-50 p-4 border-b"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <motion.div variants={iconVariants}>
                  <People sx={{ fontSize: 32, color: "#1976d2" }} />
                </motion.div>
                <Typography variant="h5" className="font-medium">
                  Employees ({totalEmployees})
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  variants={refreshButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
                >
                  <Refresh
                    className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </motion.button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddEmployee}
                  startIcon={<Plus size={16} />}
                  className="shadow-md"
                >
                  Add Employee
                </Button>
              </div>
            </div>

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
                        className="text-xl font-bold text-gray-800"
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
                      <PersonAdd sx={{ color: "#f57c00", fontSize: 24 }} />
                    </motion.div>
                    <div>
                      <p className="text-gray-600 text-sm">Active Employees</p>
                      <motion.p
                        className="text-xl font-bold text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        style={{ marginTop: "-1rem", marginLeft: "2rem" }}
                      >
                        {activeEmployees}
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
                      <Business sx={{ color: "#388e3c", fontSize: 24 }} />
                    </motion.div>
                    <div>
                      <p className="text-gray-600 text-sm">Departments</p>
                      <motion.p
                        className="text-xl font-bold text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.9 }}
                        style={{ marginTop: "-1rem", marginLeft: "2rem" }}
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
                      className="p-3 mt-2 bg-purple-100 rounded-full"
                    >
                      <Search sx={{ color: "#7b1fa2", fontSize: 24 }} />
                    </motion.div>
                    <div>
                      <p className="text-gray-600 text-sm">Recent Joiners</p>
                      <motion.p
                        className="text-xl font-bold text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.1 }}
                        style={{ marginTop: "-1rem", marginLeft: "2rem" }}
                      >
                        {recentJoiners}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <Box className="p-4">
            {/* Search Bar */}
            <motion.div
              variants={searchBarVariants}
              className="mb-4 relative flex gap-2"
            >
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onChange={handleSearchChange}
              />
            </motion.div>

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
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: {
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Employee List */}
            {!loading && (
              <>
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <Typography color="error" align="center">
                      {error}
                    </Typography>
                  </motion.div>
                ) : filteredEmployees.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <Typography color="textSecondary" align="center">
                      No employees found
                    </Typography>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="space-y-2"
                      variants={containerVariants}
                    >
                      <AnimatePresence>
                        {currentEmployees.map((employee, index) => (
                          <motion.div
                            key={employee.id}
                            custom={index}
                            variants={employeeCardVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            whileHover="hover"
                            whileTap="tap"
                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-md transition-all duration-200"
                            onClick={() => handleEmployeeClick(employee)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Avatar
                                    src={
                                      "http://localhost:3000" + employee.avatar
                                    }
                                    alt={`${employee.firstName} ${employee.lastName}`}
                                    className="w-12 h-12"
                                  />
                                </motion.div>
                                {employee.status === "active" && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                                  />
                                )}
                                {employee.status === "pending_inactive" && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"
                                  />
                                )}
                              </div>
                              <div>
                                <motion.div
                                  className="font-semibold text-gray-800"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  {employee.firstName} {employee.lastName}
                                </motion.div>
                                <motion.div
                                  className="text-sm text-gray-500"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  {employee.jobTitle} • {employee.department}
                                </motion.div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <motion.div
                                className="text-xs text-gray-500 text-right"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <div className="font-medium">Joined on</div>
                                <div>{employee.joiningDate}</div>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, employee)}
                                >
                                  <MoreVertical size={16} />
                                </IconButton>
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center mt-6 mb-4"
                      >
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          size="large"
                          showFirstButton
                          showLastButton
                          sx={{
                            "& .MuiPaginationItem-root": {
                              fontSize: "1rem",
                            },
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Results info */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center text-sm text-gray-500 mt-2"
                    >
                      Showing {indexOfFirstEmployee + 1} to{" "}
                      {Math.min(indexOfLastEmployee, filteredEmployees.length)}{" "}
                      of {filteredEmployees.length} employees
                    </motion.div>
                  </>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Menu */}
      <AnimatePresence>
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          className="animate-in fade-in duration-200"
        >
          <MenuItem onClick={() => handleAttendanceManagement(menuEmployee)}>
            <Event sx={{ mr: 1 }} /> View Attendance
          </MenuItem>
          <MenuItem onClick={() => handleLeaveManagement(menuEmployee)}>
            <BeachAccess sx={{ mr: 1 }} /> Manage Leave
          </MenuItem>
          <MenuItem onClick={handleStatusToggleClick}>
            {menuEmployee?.status === "active" ? (
              <>
                <UserX size={16} className="mr-2" />
                Mark as Inactive
              </>
            ) : (
              <>
                <User size={16} className="mr-2" />
                Mark as Active
              </>
            )}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setEmployeeToDelete(menuEmployee);
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </MenuItem>
        </Menu>
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        <CommonDrawer
          open={drawerOpen}
          onClose={handleCloseDrawer}
          width={650}
          tabs={[
            {
              label: "Add Employee",
              content: (
                <AddEmployee
                  departments={department}
                  workLocation={workLocation}
                  employmentType={employmentType}
                  designations={positions}
                  subdepartment={subDepartment}
                  jobTitle={jobTitle}
                  managers={managers}
                  onSave={handleSaveEmployee}
                  onCancel={handleCloseDrawer}
                />
              ),
            },
          ]}
        />
      </AnimatePresence>

      {/* Profile Dialog */}
      <AnimatePresence>
        <EmployeeProfileDialog
          open={profileDialogOpen}
          onClose={handleProfileDialogClose}
          employee={selectedEmployee}
          departments={department}
          workLocation={workLocation}
          employmentType={employmentType}
          designations={positions}
          jobTitle={jobTitle}
          onSave={handleSaveEmployee}
          managers={managers}
        />
      </AnimatePresence>

      {/* Toast */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastMessage.includes("Failed") ? "error" : "success"}
        onClose={() => setToastOpen(false)}
        autoHideDuration={5000}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteEmployee}
          loading={isDeleting}
          title="Delete Employee?"
          message={
            employeeToDelete
              ? `Are you sure you want to delete ${employeeToDelete.firstName} ${employeeToDelete.lastName}?`
              : "Are you sure you want to delete this employee?"
          }
        />
      </AnimatePresence>

      {/* Inactivation Dialog */}
      <AnimatePresence>
        <InactivationDialog
          open={inactivationDialogOpen}
          onClose={() => {
            setInactivationDialogOpen(false);
            setEmployeeToInactivate(null);
          }}
          onConfirm={(reason, remarks, inactivationDate) =>
            handleToggleStatus(reason, remarks, inactivationDate)
          }
          loading={isUpdatingStatus}
          employee={employeeToInactivate}
        />
      </AnimatePresence>

      {/* Leave Dialog */}
      <AnimatePresence>
        <EmployeeDialog
          open={leaveDialogOpen}
          onClose={handleLeaveDialogClose}
          employee={selectedEmployee}
        />
      </AnimatePresence>

      {/* Attendance Dialog */}
      <AnimatePresence>
        <AttendanceEmployeeDialog
          open={attendanceDialogOpen}
          onClose={handleAttendanceDialogClose}
          employee={selectedEmployee}
        />
      </AnimatePresence>
    </motion.div>
  );
};

export default EmployeesView;