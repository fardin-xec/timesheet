import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import DataTable from "../common/DataTable";
import {
  getAllLeaves,
  getSubordinateLeaves,
  approveRejectLeave,
} from "../../utils/api";

const LeaveRequestsView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [remarks, setRemarks] = useState("");
  const dropdownRef = useRef(null);
  const buttonRefs = useRef({});
  const textareaRef = useRef(null);

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
  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === "admin";

  // Fetch leaves based on role
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isAdmin) {
        response = await getAllLeaves({ status: "pending" });
      } else {
        response = await getSubordinateLeaves({ status: "pending" });
      }

      setLeaves(Array.isArray(response) ? response : []);
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch leave data";
      setError(errorMessage);
      console.error("Error fetching leaves:", err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Update leave status with remarks
  const handleStatusChange = useCallback(
    async (leaveId, newStatus, remarksText = "") => {
      setLoading(true);
      setOpenDropdownId(null);
      setRemarksDialogOpen(false);

      const originalLeave = leaves.find((leave) => leave.id === leaveId);

      try {
        setLeaves((prev) =>
          prev.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus } : leave
          )
        );

        await approveRejectLeave(leaveId, {
          status: newStatus,
          remarks: remarksText || undefined,
        });

        await fetchLeaves();
      } catch (err) {
        const errorMessage = err.message || "Failed to update leave status";
        setError(errorMessage);
        console.error("Failed to update leave status:", err);

        if (originalLeave) {
          setLeaves((prev) =>
            prev.map((leave) => (leave.id === leaveId ? originalLeave : leave))
          );
        }
      } finally {
        setLoading(false);
        setRemarks("");
        setSelectedLeave(null);
        setPendingStatus(null);
      }
    },
    [leaves, fetchLeaves]
  );

  // Open remarks dialog
  const openRemarksDialog = useCallback((leaveId, status) => {
    setSelectedLeave(leaveId);
    setPendingStatus(status);
    setRemarksDialogOpen(true);
    setOpenDropdownId(null);
  }, []);

  // Handle remarks submission
  const handleRemarksSubmit = useCallback(() => {
    if (selectedLeave && pendingStatus) {
      handleStatusChange(selectedLeave, pendingStatus, remarks);
    }
  }, [selectedLeave, pendingStatus, remarks, handleStatusChange]);

  // Toggle dropdown
  const toggleDropdown = useCallback((leaveId) => {
    setOpenDropdownId((prev) => (prev === leaveId ? null : leaveId));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !Object.values(buttonRefs.current).some(
          (ref) => ref && ref.contains(event.target)
        )
      ) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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
    return `${firstName} ${midName} ${lastName}`.trim().replace(/\s+/g, " ");
  }, []);

  // Calculate days between dates
  const calculateDays = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } catch (error) {
      console.error("Error calculating days:", error);
      return "N/A";
    }
  }, []);

  // Effect to force LTR direction in textarea
  useEffect(() => {
    if (remarksDialogOpen && textareaRef.current) {
      textareaRef.current.setAttribute('dir', 'ltr');
      textareaRef.current.style.direction = 'ltr';
    }
  }, [remarksDialogOpen]);

  const RemarksDialog = () => {
    if (!remarksDialogOpen) return null;

    const handleTextInput = (e) => {
      const input = e.target;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const value = e.target.value;
      
      setRemarks(value);
      
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        if (input) {
          input.setSelectionRange(start, end);
        }
      });
    };

    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Add Remarks {pendingStatus === "approved" ? "(Optional)" : ""}
            </h3>
          </div>
          <div className="px-6 py-4">
            <input
              type="text"
              ref={textareaRef}
              value={remarks}
              onChange={handleTextInput}
              onInput={handleTextInput}
              placeholder="Enter remarks for this decision..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              dir="ltr"
              style={{
                direction: 'ltr !important',
                textAlign: 'left !important',
                unicodeBidi: 'normal'
              }}
            />
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => {
                setRemarksDialogOpen(false);
                setRemarks("");
                setSelectedLeave(null);
                setPendingStatus(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleRemarksSubmit}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                pendingStatus === "approved"
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Dropdown component
  const Dropdown = ({ leaveId, currentStatus, onStatusChange }) => {
    const statusOptions = [
      {
        value: "approved",
        label: "Approve",
        color: "text-green-600",
        icon: "✓",
      },
      { value: "rejected", label: "Reject", color: "text-red-600", icon: "✗" },
    ];

    const availableOptions = statusOptions.filter(
      (option) => option.value !== currentStatus
    );

    const buttonRef = buttonRefs.current[leaveId];
    const position = buttonRef ? buttonRef.getBoundingClientRect() : null;
    const style = position
      ? {
          position: "fixed",
          top: position.bottom + window.scrollY + 2,
          left: position.right + window.scrollX - 192,
          zIndex: 1000,
        }
      : { display: "none" };

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
                  openRemarksDialog(leaveId, option.value);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2 ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                <span className="text-base" aria-hidden="true">
                  {option.icon}
                </span>
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 italic">
              No actions available
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  // Define columns for the DataTable
  const columns = useMemo(
    () => [
      {
        field: "employee.employeeId",
        headerName: "Employee ID",
        sortable: true,
        width: "120px",
        renderCell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.employee?.employeeId || "N/A"}
          </span>
        ),
      },
      {
        field: "fullName",
        headerName: "Employee Name",
        sortable: true,
        width: "180px",
        renderCell: ({ row }) => (
          <span className="font-semibold text-gray-800">
            {formatName(row.employee)}
          </span>
        ),
      },
      {
        field: "employee.department",
        headerName: "Department",
        sortable: true,
        width: "150px",
        renderCell: ({ row }) => (
          <span className="text-gray-700">
            {row.employee?.department || "N/A"}
          </span>
        ),
      },
      {
        field: "leaveType",
        headerName: "Leave Type",
        sortable: true,
        width: "140px",
        renderCell: ({ row }) => {
          const leaveType = row.leaveType;
          const typeColors = {
            sick: "bg-red-100 text-red-800",
            casual: "bg-blue-100 text-blue-800",
            annual: "bg-green-100 text-green-800",
            emergency: "bg-orange-100 text-orange-800",
            maternity: "bg-pink-100 text-pink-800",
            paternity: "bg-purple-100 text-purple-800",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                typeColors[leaveType?.toLowerCase()] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {leaveType
                ? leaveType.charAt(0).toUpperCase() + leaveType.slice(1)
                : "N/A"}
            </span>
          );
        },
      },
      {
        field: "startDate",
        headerName: "Start Date",
        sortable: true,
        width: "120px",
        renderCell: ({ row }) => (
          <span className="text-gray-700">{formatDate(row.startDate)}</span>
        ),
      },
      {
        field: "endDate",
        headerName: "End Date",
        sortable: true,
        width: "120px",
        renderCell: ({ row }) => (
          <span className="text-gray-700">{formatDate(row.endDate)}</span>
        ),
      },
      {
        field: "duration",
        headerName: "Duration",
        sortable: false,
        width: "100px",
        renderCell: ({ row }) => (
          <span className="text-gray-700 font-medium">
            {row.appliedDays + " days"}
          </span>
        ),
      },
      {
        field: "reason",
        headerName: "Reason",
        sortable: true,
        width: "200px",
        renderCell: ({ row }) => (
          <span className="text-gray-700" title={row.reason}>
            {row.reason || "N/A"}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        sortable: true,
        width: "110px",
        renderCell: ({ row }) => {
          const status = row.status;
          const statusColors = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            approved: "bg-green-100 text-green-800 border-green-200",
            rejected: "bg-red-100 text-red-800 border-red-200",
          };

          return (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                statusColors[status] ||
                "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "Unknown"}
            </span>
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        width: "80px",
        align: "center",
        renderCell: ({ row }) => {
          const isDropdownOpen = openDropdownId === row.id;
          const currentStatus = row.status;

          if (currentStatus !== "pending") {
            return (
              <span className="text-xs text-gray-400 italic">
                {currentStatus === "approved" ? "Approved" : "Rejected"}
              </span>
            );
          }

          return (
            <div className="relative dropdown-container">
              <button
                ref={(el) => (buttonRefs.current[row.id] = el)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(row.id);
                }}
                className={`p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
                title="Status actions"
                aria-label="Status actions"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
    ],
    [
      openDropdownId,
      loading,
      toggleDropdown,
      handleStatusChange,
      formatDate,
      formatName,
    ]
  );

  // Initialize and fetch leaves
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

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
        department: leave.employee?.department || "",
        leaveType: leave.leaveType || "",
        startDate: leave.startDate || "",
        endDate: leave.endDate || "",
        duration: calculateDays(leave.startDate, leave.endDate),
        reason: leave.reason || "",
        status: leave.status || "",
        remarks: leave.remarks || "",
      }));

      const csvContent = [
        "Employee ID,Name,Department,Leave Type,Start Date,End Date,Duration,Reason,Status,Remarks",
        ...exportData.map((row) =>
          Object.values(row)
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leave_requests_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  }, [leaves, formatName, calculateDays]);

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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin ? "All Leave Requests" : "Team Leave Requests"}
        </h2>
        <p className="text-gray-600 mt-1">
          {isAdmin
            ? "Review and manage all pending leave requests across the organization"
            : "Review and manage leave requests from your team members"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <DataTable
          columns={columns}
          data={leaves}
          loading={loading}
          error={error}
          statusColorMap={{
            pending: "#F59E0B",
            approved: "#10B981",
            rejected: "#EF4444",
          }}
          selectable={false}
          pagination={true}
          pageSize={10}
          sortable={true}
          searchable={true}
          onRefresh={handleRefresh}
          onExport={handleExport}
          emptyStateMessage="No pending leave requests found"
          stickyHeader={true}
          dense={false}
        />
      </div>

      <RemarksDialog />
    </div>
  );
};

export default LeaveRequestsView;