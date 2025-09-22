import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import DataTable from "../common/DataTable";
import { fetchPendingEmployeesLeaves, updateLeaveStatus } from "../../utils/api";

const LeaveRequestsView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRefs = useRef({}); // Store refs for each button to calculate position

  // Get user data safely with error handling
  const getUserData = useCallback(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  }, []);

  const user = useMemo(() => getUserData(), [getUserData]);
  const employeeId = user?.employee?.id;

  // Memoize initialEmployees to prevent unnecessary re-renders
  const initialEmployees = useMemo(() => {
    return user?.employee?.subordinates || [];
  }, [user?.employee?.subordinates]);

  // Fetch pending leaves from backend
  const fetchLeaves = useCallback(async () => {
    if (!initialEmployees.length) {
      setLeaves([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const employeeIds = initialEmployees.map(employee => employee.id);
      const response = await fetchPendingEmployeesLeaves(employeeIds);
      setLeaves(Array.isArray(response) ? response : []);
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch leave data";
      setError(errorMessage);
      console.error("Error fetching leaves:", err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [initialEmployees]);

  // Update leave status
  const handleStatusChange = useCallback(
    async (leaveId, newStatus) => {
      if (!employeeId) {
        setError("Employee ID not found");
        return;
      }

      setLoading(true);
      setOpenDropdownId(null);

      const originalLeave = leaves.find(leave => leave.id === leaveId);

      try {
        setLeaves((prev) =>
          prev.map((leave) =>
            leave.id === leaveId
              ? { ...leave, status: newStatus, approvedBy: employeeId }
              : leave
          )
        );

        const updatedStatus = {
          status: newStatus,
          approvedBy: employeeId,
        };

        await updateLeaveStatus(leaveId, updatedStatus);
      } catch (err) {
        const errorMessage = err.message || "Failed to update leave status";
        setError(errorMessage);
        console.error("Failed to update leave status:", err);

        if (originalLeave) {
          setLeaves((prev) =>
            prev.map((leave) =>
              leave.id === leaveId ? originalLeave : leave
            )
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [employeeId, leaves]
  );

  // Toggle dropdown
  const toggleDropdown = useCallback((leaveId) => {
    setOpenDropdownId(prev => (prev === leaveId ? null : leaveId));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !Object.values(buttonRefs.current).some(ref => ref && ref.contains(event.target))
      ) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  }, []);

  // Format name helper
  const formatName = useCallback((employee) => {
    if (!employee) return "";
    const { firstName = "", midName = "", lastName = "" } = employee;
    return `${firstName} ${midName} ${lastName}`.trim().replace(/\s+/g, ' ');
  }, []);

  // Dropdown component to render via portal
  const Dropdown = ({ leaveId, currentStatus, onStatusChange }) => {
    const statusOptions = [
      { value: 'approved', label: 'Approve', color: 'text-green-600', icon: '✓' },
      { value: 'rejected', label: 'Reject', color: 'text-red-600', icon: '✗' },
      { value: 'pending', label: 'Mark as Pending', color: 'text-yellow-600', icon: '⏳' }
    ];

    const availableOptions = statusOptions.filter(option => option.value !== currentStatus);

    // Get button position for dynamic placement
    const buttonRef = buttonRefs.current[leaveId];
    const position = buttonRef ? buttonRef.getBoundingClientRect() : null;
    const style = position
      ? {
          position: 'fixed',
          top: position.bottom + window.scrollY + 2, // Position below button, account for scroll
          left: position.right + window.scrollX - 192, // Align right edge, 192px = w-48 (48 * 4px)
          zIndex: 1000, // High z-index to ensure visibility
        }
      : { display: 'none' }; // Hide if no position

    return ReactDOM.createPortal(
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-xl w-48 overflow-visible"
        style={style}
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
            Change Status
          </div>
          {availableOptions.length > 0 ? (
            availableOptions.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(leaveId, option.value);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2 ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                <span className="text-base" aria-hidden="true">{option.icon}</span>
                {option.label}
                {loading && (
                  <span className="ml-auto">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" aria-hidden="true">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 italic">
              No actions available
            </div>
          )}
        </div>
      </div>,
      document.body // Render dropdown at the body level
    );
  };

  // Define columns for the DataTable
  const columns = useMemo(() => [
    {
      field: "employee.employeeId",
      headerName: "Employee ID",
      sortable: true,
      renderCell: ({ row }) => row.employee?.employeeId || "N/A",
    },
    {
      field: "fullName",
      headerName: "Name",
      sortable: true,
      renderCell: ({ row }) => formatName(row.employee),
    },
    {
      field: "employee.jobTitle",
      headerName: "Job Title",
      sortable: true,
      renderCell: ({ row }) => row.employee?.jobTitle || "N/A",
    },
    {
      field: "leaveType",
      headerName: "Leave Type",
      sortable: true,
      renderCell: ({ row }) => {
        const leaveType = row.leaveType;
        return leaveType ? leaveType.charAt(0).toUpperCase() + leaveType.slice(1) : "N/A";
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      sortable: true,
      renderCell: ({ row }) => formatDate(row.startDate),
    },
    {
      field: "endDate",
      headerName: "End Date",
      sortable: true,
      renderCell: ({ row }) => formatDate(row.endDate),
    },
    {
      field: "reason",
      headerName: "Reason",
      sortable: true,
      renderCell: ({ row }) => row.reason || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      renderCell: ({ row }) => {
        const status = row.status;
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          approved: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ({ row }) => {
        const isDropdownOpen = openDropdownId === row.id;
        const currentStatus = row.status;

        return (
          <div className="relative dropdown-container">
            <button
              ref={(el) => (buttonRefs.current[row.id] = el)}
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown(row.id);
              }}
              className={`p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
              title="Status actions"
              aria-label="Status actions"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {isDropdownOpen && (
              <Dropdown
                leaveId={row.id}
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        );
      },
    },
  ], [openDropdownId, loading, toggleDropdown, handleStatusChange, formatDate, formatName]);

  // Initialize employees and fetch leaves
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Handle row selection
  const handleSelectionChange = useCallback((newSelected) => {
    setSelectedRows(newSelected);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setError(null);
    fetchLeaves();
  }, [fetchLeaves]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!leaves.length) {
      alert("No data to export");
      return;
    }

    try {
      const exportData = leaves.map((leave) => ({
        employeeId: leave.employee?.employeeId || "",
        name: formatName(leave.employee),
        jobTitle: leave.employee?.jobTitle || "",
        leaveType: leave.leaveType || "",
        startDate: leave.startDate || "",
        endDate: leave.endDate || "",
        reason: leave.reason || "",
        status: leave.status || "",
      }));

      const csvContent = [
        "Employee ID,Name,Job Title,Leave Type,Start Date,End Date,Reason,Status",
        ...exportData.map((row) =>
          Object.values(row)
            .map(value => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `employee_leaves_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  }, [leaves, formatName]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-600">
          <p>No user data found. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Employee Leave Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Manage leave requests for {initialEmployees.length} subordinate{initialEmployees.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-gray-200 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={leaves}
        loading={loading}
        error={error}
        statusColorMap={{
          active: "#10B981",
          inactive: "#EF4444",
        }}
        selectable={true}
        onSelectionChange={handleSelectionChange}
        selectedRows={selectedRows}
        maxSelectable={5}
        pagination={true}
        pageSize={5}
        sortable={true}
        searchable={true}
        onRefresh={handleRefresh}
        onExport={handleExport}
        emptyStateMessage={
          initialEmployees.length === 0
            ? "No subordinates found"
            : "No leave requests found"
        }
        stickyHeader={true}
        dense={false}
      />
    </div>
  );
};

export default LeaveRequestsView;