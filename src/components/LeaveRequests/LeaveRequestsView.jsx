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
  personalInfoAPI,
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [viewDocumentDialog, setViewDocumentDialog] = useState({
    open: false,
    document: null,
    data: null,
    loading: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
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

  // Fetch leaves based on role and status filter
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      const params = { 
        status: statusFilter,
        startDate,
        endDate
      };
      
      if (isAdmin) {
        response = await getAllLeaves(params);
      } else {
        response = await getSubordinateLeaves(params);
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
  }, [isAdmin, statusFilter, startDate, endDate]);

  // Update leave status with remarks
  const handleStatusChange = useCallback(
    async (leaveId, newStatus, remarksText = "") => {
      setSubmitting(true);
      setOpenDropdownId(null);
      setRemarksDialogOpen(false);

      const originalLeave = leaves.find((leave) => leave.id === leaveId);

      try {
        const statusData ={
          status: newStatus,
          remarks: remarksText
        }
        // Call the actual API
        await approveRejectLeave(leaveId, statusData);

        // Optimistically update UI
        setLeaves((prev) =>
          prev.map((leave) =>
            leave.id === leaveId ? { ...leave, status: newStatus, remarks: remarksText } : leave
          )
        );

        await fetchLeaves();
        
        // If detail dialog is open for this leave, close it
        if (detailDialogOpen && selectedLeaveDetail?.id === leaveId) {
          setDetailDialogOpen(false);
          setSelectedLeaveDetail(null);
          setDocumentData(null);
        }
      } catch (err) {
        const errorMessage = err.message || "Failed to update leave status";
        setError(errorMessage);
        console.error("Failed to update leave status:", err);

        // Revert optimistic update
        if (originalLeave) {
          setLeaves((prev) =>
            prev.map((leave) => (leave.id === leaveId ? originalLeave : leave))
          );
        }
      } finally {
        setSubmitting(false);
        setRemarks("");
        setSelectedLeave(null);
        setPendingStatus(null);
      }
    },
    [leaves, fetchLeaves, detailDialogOpen, selectedLeaveDetail]
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

  

  // Handle row click to open detail dialog
  const handleRowClick = useCallback(async (leave) => {
    setSelectedLeaveDetail(leave);
    setDetailDialogOpen(true);
    setDocumentData(null);
    
    // Fetch document if documentId exists
    if (leave.documentId) {
      setDocumentLoading(true);
      try {
        const employeeId = leave.employee?.id || leave.employeeId;
        const document = await personalInfoAPI.getDocumentById(employeeId, leave.documentId);
        setDocumentData(document);
      } catch (error) {
        console.error("Error fetching document:", error);
        setDocumentData(null);
      } finally {
        setDocumentLoading(false);
      }
    }
  }, []);

  // Close detail dialog
  const handleCloseDetailDialog = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedLeaveDetail(null);
    setDocumentData(null);
    
    // Clean up blob URL if exists
    if (viewDocumentDialog.data && typeof viewDocumentDialog.data === 'string' && viewDocumentDialog.data.startsWith('blob:')) {
      window.URL.revokeObjectURL(viewDocumentDialog.data);
    }
    
    setViewDocumentDialog({
      open: false,
      document: null,
      data: null,
      loading: false,
    });
  }, [viewDocumentDialog.data]);

  // View document
  const handleViewDocument = async (document) => {
    setViewDocumentDialog({
      open: true,
      document,
      data: null,
      loading: true,
    });

    try {
      const response = await personalInfoAPI.downloadDocument(document.id);
      
      if (response.data instanceof Blob) {
        const blobUrl = window.URL.createObjectURL(response.data);
        
        setViewDocumentDialog((prev) => ({
          ...prev,
          data: blobUrl,
          loading: false,
        }));
      } else {
        throw new Error("Invalid document data received - expected Blob");
      }
    } catch (error) {
      console.error("Error loading document:", error);
      setError("Failed to load document for viewing");
      setViewDocumentDialog({
        open: false,
        document: null,
        data: null,
        loading: false,
      });
    }
  };

  const handleCloseViewDialog = () => {
    if (viewDocumentDialog.data && typeof viewDocumentDialog.data === 'string' && viewDocumentDialog.data.startsWith('blob:')) {
      window.URL.revokeObjectURL(viewDocumentDialog.data);
    }
    
    setViewDocumentDialog({
      open: false,
      document: null,
      data: null,
      loading: false,
    });
  };

  const handleDownloadFromView = () => {
    if (!viewDocumentDialog.document || !viewDocumentDialog.data) return;

    try {
      const url = viewDocumentDialog.data;
      const link = document.createElement("a");
      link.href = url;
      link.download = viewDocumentDialog.document.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
      setError("Failed to download document");
    }
  };

  // Helper functions
  const getFileExtension = (filename) => {
    return filename?.split(".").pop()?.toLowerCase() || "";
  };

  const getFileIconByType = (fileName, mimeType) => {
    const extension = getFileExtension(fileName);

    if (
      mimeType?.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)
    ) {
      return "🖼️";
    }

    if (mimeType?.includes("pdf") || extension === "pdf") {
      return "📄";
    }

    if (
      ["doc", "docx", "txt", "rtf", "odt"].includes(extension) ||
      mimeType?.includes("word") ||
      mimeType?.includes("text")
    ) {
      return "📝";
    }

    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

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

  // Helper functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  }, []);

  const formatName = useCallback((employee) => {
  if (!employee) return "";
  const { firstName = "", midName = "", lastName = "" } = employee;
  // Build an array with non-empty values only
  return [firstName, midName, lastName]
    .filter(part => part && part.trim())
    .join(" ");
}, []);

  // Format leave type name
  const formatLeaveTypeName = (leaveType) => {
    const nameMap = {
      casual: "Casual Leave",
      sick: "Sick Leave",
      annual: "Annual Leave",
      emergency: "Emergency Leave",
      lossOfPay: "Loss of Pay",
    };
    return (
      nameMap[leaveType] || leaveType.charAt(0).toUpperCase() + leaveType.slice(1)
    );
  };

  // Effect to force LTR direction in textarea
  useEffect(() => {
    if (remarksDialogOpen && textareaRef.current) {
      textareaRef.current.setAttribute('dir', 'ltr');
      textareaRef.current.style.direction = 'ltr';
    }
  }, [remarksDialogOpen]);

  // Detail Dialog Component
  const DetailDialog = () => {
    if (!detailDialogOpen || !selectedLeaveDetail) return null;

    const leave = selectedLeaveDetail;
    const status = leave.status;
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };

    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center z-10">
            <div className="text-white">
              <h3 className="text-2xl font-bold">{formatName(leave.employee)}</h3>
              <p className="text-blue-100 text-sm mt-1">
                {leave.employee?.employeeId} • {leave.employee?.department}
              </p>
            </div>
            <button
              onClick={handleCloseDetailDialog}
              className="text-white hover:text-blue-200 transition-colors"
              aria-label="Close dialog"
              disabled={submitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* KEY DETAILS CARD */}
            <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Leave Request Summary
              </h4>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Leave Type</p>
                  <p className="text-xl font-bold text-gray-900">{formatLeaveTypeName(leave.leaveType)}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Current Status</p>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
                  </span>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Start Date</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(leave.startDate)}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">End Date</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(leave.endDate)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <div className="bg-white border-2 border-blue-300 rounded-full px-6 py-2">
                  <span className="text-blue-900 font-bold text-lg">
                    {leave.isHalfDay ? `0.5 day (${leave.halfDayType === 'first_half' ? 'First Half' : 'Second Half'})` : `${leave.appliedDays} ${leave.appliedDays === 1 ? 'day' : 'days'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Contact Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{leave.employee?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applied On</p>
                  <p className="font-semibold text-gray-900">{formatDate(leave.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Reason for Leave
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-900 whitespace-pre-wrap">{leave.reason || "No reason provided"}</p>
              </div>
            </div>

            {/* Remarks */}
            {leave.remarks && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Manager's Remarks
                </h4>
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap font-medium">{leave.remarks}</p>
                </div>
              </div>
            )}

            {/* Document Attachment */}
            {(leave.documentId || documentLoading) && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  Attachment
                </h4>
                {documentLoading ? (
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">Loading document...</span>
                  </div>
                ) : documentData ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIconByType(documentData.originalName, documentData.mimeType)}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{documentData.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(documentData.size)} • {new Date(documentData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDocument(documentData)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">Failed to load document</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {status === "pending" && (
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => openRemarksDialog(leave.id, "rejected")}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={submitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Reject Request</span>
              </button>
              <button
                onClick={() => openRemarksDialog(leave.id, "approved")}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={submitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve Request</span>
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  // Document Viewer Dialog
  const DocumentViewerDialog = () => {
    if (!viewDocumentDialog.open) return null;

    const isImage = viewDocumentDialog.document?.mimeType?.includes("image") || 
      ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
        getFileExtension(viewDocumentDialog.document?.originalName)
      );
    const isPdf = viewDocumentDialog.document?.mimeType === "application/pdf" ||
      getFileExtension(viewDocumentDialog.document?.originalName) === "pdf";

    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">View Document</h3>
              {viewDocumentDialog.document && (
                <p className="text-sm text-gray-500 mt-1">{viewDocumentDialog.document.originalName}</p>
              )}
            </div>
            <button
              onClick={handleCloseViewDialog}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            {viewDocumentDialog.loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Loading document...</p>
              </div>
            ) : viewDocumentDialog.data ? (
              <div className="h-full bg-white rounded-lg overflow-hidden">
                {isImage ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <img
                      src={viewDocumentDialog.data}
                      alt={viewDocumentDialog.document?.originalName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : isPdf ? (
                  <iframe
                    src={viewDocumentDialog.data}
                    className="w-full h-full border-0"
                    title={viewDocumentDialog.document?.originalName}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <span className="text-6xl mb-4">📄</span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Preview not available</h3>
                    <p className="text-gray-600 mb-4">This file type cannot be previewed in the browser.</p>
                    <p className="text-gray-500">Please download the file to view it.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <span className="text-6xl text-red-500 mb-4">⚠️</span>
                <h3 className="text-xl font-semibold text-red-600">Failed to load document</h3>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleDownloadFromView}
              disabled={viewDocumentDialog.loading || !viewDocumentDialog.data}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>
            <button
              onClick={handleCloseViewDialog}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Remarks Dialog
  const RemarksDialog = () => {
    if (!remarksDialogOpen) return null;

    const handleTextInput = (e) => {
      const input = e.target;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const value = e.target.value;
      
      setRemarks(value);
      
      requestAnimationFrame(() => {
        if (input) {
          input.setSelectionRange(start, end);
        }
      });
    };

    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black bg-opacity-50">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              dir="ltr"
              disabled={submitting}
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleRemarksSubmit}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                pendingStatus === "approved"
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              }`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
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
        width: "200px",
        renderCell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {row.employee?.firstName?.charAt(0)}{row.employee?.lastName?.charAt(0)}
              </span>
            </div>
            <span className="font-semibold text-gray-900">
              {formatName(row.employee)}
            </span>
          </div>
        ),
      },
      {
        field: "employee.department",
        headerName: "Department",
        sortable: true,
        width: "140px",
        renderCell: ({ row }) => (
          <span className="text-gray-700 text-sm">
            {row.employee?.department || "N/A"}
          </span>
        ),
      },
      {
        field: "leaveType",
        headerName: "Leave Type",
        sortable: true,
        width: "160px",
        renderCell: ({ row }) => {
          const leaveType = row.leaveType;
          const typeColors = {
            sick: "bg-red-100 text-red-800 border-red-200",
            casual: "bg-blue-100 text-blue-800 border-blue-200",
            annual: "bg-green-100 text-green-800 border-green-200",
            emergency: "bg-orange-100 text-orange-800 border-orange-200",
            maternity: "bg-pink-100 text-pink-800 border-pink-200",
            paternity: "bg-purple-100 text-purple-800 border-purple-200",
          };
          return (
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                typeColors[leaveType?.toLowerCase()] ||
                "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {formatLeaveTypeName(leaveType)}
            </span>
          );
        },
      },
      {
        field: "startDate",
        headerName: "Start Date",
        sortable: true,
        width: "130px",
        renderCell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 font-medium">{formatDate(row.startDate)}</span>
          </div>
        ),
      },
      {
        field: "endDate",
        headerName: "End Date",
        sortable: true,
        width: "130px",
        renderCell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 font-medium">{formatDate(row.endDate)}</span>
          </div>
        ),
      },
      {
        field: "duration",
        headerName: "Duration",
        sortable: false,
        width: "100px",
        renderCell: ({ row }) => (
          <span className="text-gray-700 font-semibold bg-gray-100 px-2 py-1 rounded text-sm">
            {row.appliedDays} {row.appliedDays === 1 ? 'day' : 'days'}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Current Status",
        sortable: true,
        width: "140px",
        renderCell: ({ row }) => {
          const status = row.status;
          const statusColors = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
            approved: "bg-green-100 text-green-800 border-green-300",
            rejected: "bg-red-100 text-red-800 border-red-300",
          };
          
          const statusIcons = {
            pending: (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            ),
            approved: (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ),
            rejected: (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ),
          };

          return (
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                statusColors[status] ||
                "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {statusIcons[status]}
              <span>{status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}</span>
            </span>
          );
        },
      },
      
    ],
    [
      
      formatDate,
      formatName,
    ]
  );

  // Initialize and fetch leaves
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Filter leaves by search query
  const filteredLeaves = useMemo(() => {
    if (!searchQuery.trim()) return leaves;
    
    const query = searchQuery.toLowerCase();
    return leaves.filter((leave) => {
      const fullName = formatName(leave.employee).toLowerCase();
      const employeeId = leave.employee?.employeeId?.toLowerCase() || "";
      const department = leave.employee?.department?.toLowerCase() || "";
      
      return fullName.includes(query) || 
             employeeId.includes(query) || 
             department.includes(query);
    });
  }, [leaves, searchQuery, formatName]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setError(null);
    fetchLeaves();
  }, [fetchLeaves]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!filteredLeaves.length) {
      alert("No data to export");
      return;
    }

    try {
      const exportData = filteredLeaves.map((leave) => ({
        employeeId: leave.employee?.employeeId || "",
        name: formatName(leave.employee),
        department: leave.employee?.department || "",
        leaveType: leave.leaveType || "",
        startDate: leave.startDate || "",
        endDate: leave.endDate || "",
        duration: `${leave.appliedDays} days`,
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
      link.download = `leave_requests_${statusFilter}_${
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
  }, [filteredLeaves, formatName, statusFilter]);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center space-y-4">
            <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Processing Request</p>
              <p className="text-sm text-gray-600 mt-1">Please wait while we update the leave status...</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <svg className="w-8 h-8 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          {isAdmin ? "All Leave Requests" : "Team Leave Requests"}
        </h2>
        <p className="text-gray-600 mt-2 ml-11">
          {isAdmin
            ? "Review and manage all leave requests across the organization"
            : "Review and manage leave requests from your team members"}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex space-x-1 p-2" aria-label="Status Filter">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              statusFilter === "pending"
                ? "bg-yellow-100 text-yellow-800 shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Pending</span>
              {statusFilter === "pending" && filteredLeaves.length > 0 && (
                <span className="bg-yellow-200 text-yellow-900 py-1 px-2.5 rounded-full text-xs font-bold">
                  {filteredLeaves.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              statusFilter === "approved"
                ? "bg-green-100 text-green-800 shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Approved</span>
              {statusFilter === "approved" && filteredLeaves.length > 0 && (
                <span className="bg-green-200 text-green-900 py-1 px-2.5 rounded-full text-xs font-bold">
                  {filteredLeaves.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              statusFilter === "rejected"
                ? "bg-red-100 text-red-800 shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Rejected</span>
              {statusFilter === "rejected" && filteredLeaves.length > 0 && (
                <span className="bg-red-200 text-red-900 py-1 px-2.5 rounded-full text-xs font-bold">
                  {filteredLeaves.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Search and Date Filter Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Employee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, or department..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Showing:</span>
            <span>{filteredLeaves.length} of {leaves.length} requests</span>
          </div>
          {searchQuery && (
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 font-medium">
                Filtered by: "{searchQuery}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredLeaves}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          onExport={handleExport}
          emptyStateMessage={`No ${statusFilter} leave requests found`}
          onRowClick={handleRowClick}
        />
      </div>

      {detailDialogOpen && <DetailDialog />}
      {viewDocumentDialog.open && <DocumentViewerDialog />}
      {remarksDialogOpen && <RemarksDialog />}
    </div>
  );
};

export default LeaveRequestsView;