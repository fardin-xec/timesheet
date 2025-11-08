import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  Stack,
  CircularProgress,
  LinearProgress,
  Paper,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Drawer,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  AttachFile,
  Delete,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile,
  Download,
  Close,
  Visibility,
  CalendarMonth,
} from "@mui/icons-material";
import { personalInfoAPI, leaveAPI } from "../../utils/api";

// Weekend configuration (Friday and Saturday)
const WEEKEND_CONFIG = {
  weekendDays: [5, 6], // 5 = Friday, 6 = Saturday (0 = Sunday, 1 = Monday, etc.)
  displayNames: ["Friday", "Saturday"]
};

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
    return <Image color="primary" />;
  }

  if (mimeType?.includes("pdf") || extension === "pdf") {
    return <PictureAsPdf color="error" />;
  }

  if (
    ["doc", "docx", "txt", "rtf", "odt"].includes(extension) ||
    mimeType?.includes("word") ||
    mimeType?.includes("text")
  ) {
    return <Description color="info" />;
  }

  return <InsertDriveFile color="action" />;
};

const getFileTypeLabel = (fileName, mimeType) => {
  const extension = getFileExtension(fileName).toUpperCase();

  if (mimeType?.includes("pdf") || extension === "PDF") return "PDF";
  if (mimeType?.includes("image")) return "Image";
  if (mimeType?.includes("word") || ["DOC", "DOCX"].includes(extension))
    return "Document";

  return extension || "File";
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  const mb = kb / 1024;
  return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
};

// Check if a date is a weekend based on configuration
const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return WEEKEND_CONFIG.weekendDays.includes(dayOfWeek);
};

// Check if there's a sandwich leave pattern (weekends surrounded by leave days)
const hasSandwichLeave = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return false;
  
  // Check if there are any weekends in between that are surrounded by working days
  const currentDate = new Date(start);
  let foundSandwich = false;
  
  while (currentDate <= end) {
    if (isWeekend(currentDate)) {
      // Check if this weekend is surrounded by leave days (sandwich pattern)
      const beforeWeekend = new Date(currentDate);
      beforeWeekend.setDate(beforeWeekend.getDate() - 1);
      
      const afterWeekend = new Date(currentDate);
      // Move to next non-weekend day
      do {
        afterWeekend.setDate(afterWeekend.getDate() + 1);
      } while (afterWeekend <= end && isWeekend(afterWeekend));
      
      // If both before and after dates are within the leave period and not weekends
      if (beforeWeekend >= start && afterWeekend <= end) {
        foundSandwich = true;
        break;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return foundSandwich;
};

// Calculate working days with sandwich leave logic
const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return 0;
  
  // Check if sandwich leave pattern exists
  const isSandwichLeave = hasSandwichLeave(startDate, endDate);
  
  if (isSandwichLeave) {
    // Include all days (weekends + working days) for sandwich leave
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return totalDays;
  }
  
  // Normal calculation - exclude weekends
  let workingDays = 0;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// Component for displaying existing attachments
const ExistingAttachmentItem = ({
  document,
  onRemove,
  onView,
  canDelete = true,
}) => {
  const getFileTypeChip = (fileName, mimeType) => {
    const label = getFileTypeLabel(fileName, mimeType);
    const extension = getFileExtension(fileName);

    let color = "default";
    if (["pdf"].includes(extension)) color = "error";
    else if (["jpg", "jpeg", "png", "gif"].includes(extension))
      color = "primary";
    else if (["doc", "docx", "txt"].includes(extension)) color = "info";

    return <Chip label={label} size="small" color={color} variant="outlined" />;
  };

  return (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: "rgba(76, 175, 80, 0.05)",
        border: "1px solid #4caf50",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getFileIconByType(document.originalName, document.mimeType)}
            <CheckCircle color="success" fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
              {document.originalName}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 0.5 }}
            >
              {getFileTypeChip(document.originalName, document.mimeType)}
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(document.size)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • {new Date(document.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Document">
              <IconButton size="small" color="primary" onClick={() => onView(document)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {canDelete && (
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemove(document.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// File upload zone
const FileUploadZone = ({ onFileDrop, uploading, disabled, children }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (!disabled) {
        const files = Array.from(e.dataTransfer.files);
        onFileDrop(files);
      }
    },
    [onFileDrop, disabled]
  );

  return (
    <Paper
      elevation={isDragOver ? 8 : 2}
      sx={{
        border: `2px dashed ${isDragOver ? "#1976d2" : "#e0e0e0"}`,
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: uploading || disabled ? "not-allowed" : "pointer",
        backgroundColor: isDragOver
          ? "rgba(25, 118, 210, 0.04)"
          : "transparent",
        transition: "all 0.3s ease",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </Paper>
  );
};

// File item component
const FileItem = ({ file, progress, status, onRemove }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
        return <CircularProgress size={20} color="primary" />;
      case "success":
        return <CheckCircle color="success" />;
      case "error":
        return <ErrorIcon color="error" />;
      default:
        return <AttachFile color="action" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "rgba(76, 175, 80, 0.1)";
      case "error":
        return "rgba(244, 67, 54, 0.1)";
      case "uploading":
        return "rgba(33, 150, 243, 0.1)";
      default:
        return "rgba(0, 0, 0, 0.05)";
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: getStatusColor(),
        border: `1px solid ${
          status === "success"
            ? "#4caf50"
            : status === "error"
            ? "#f44336"
            : "#e0e0e0"
        }`,
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getFileIconByType(file.name, file.type)}
            {getStatusIcon()}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)}
              {status === "success" && " • Uploaded"}
              {status === "error" && " • Upload failed"}
              {status === "uploading" &&
                ` • ${Math.round(progress || 0)}% uploading`}
            </Typography>
          </Box>
          {status !== "uploading" && (
            <Tooltip title="Remove">
              <IconButton size="small" color="error" onClick={onRemove}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {status === "uploading" && typeof progress === "number" && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main LeaveDrawer Component
const LeaveDrawer = ({
  open,
  onClose,
  selectedApplication,
  isNewApplication,
  statusOptions = ["Pending", "Approved", "Rejected"],
  handleDeleteApplication,
  employeeId,
  onSuccess,
  onError,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [eligibleLeaveTypes, setEligibleLeaveTypes] = useState([]);
  const [fetchingLeaveTypes, setFetchingLeaveTypes] = useState(false);
  const [viewDocumentDialog, setViewDocumentDialog] = useState({
    open: false,
    document: null,
    data: null,
    loading: false,
  });

  // Use local state for form data to prevent glitching
  const [formData, setFormData] = useState({
    durationType: "full-day",
    status: "Pending",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    halfDayType: null,
    documentId: null,
  });

  // Initialize formData only when drawer opens
  useEffect(() => {
    if (open) {
      if (selectedApplication) {
        setFormData({ ...selectedApplication });
      } else {
        setFormData({
          durationType: "full-day",
          status: "Pending",
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
          halfDayType: null,
          documentId: null,
        });
      }
    }
  }, [open, selectedApplication]);

  // Check if application is approved
  const isApproved = formData.status === "Approved";
  
  // Determine if document can be modified
  const canModifyDocument = isNewApplication || !isApproved;

  useEffect(() => {
    const fetchEligibleLeaveTypes = async () => {
      if (!open) return;

      setFetchingLeaveTypes(true);
      try {
        const response = await leaveAPI.fetchLeaveBalance(employeeId);

        if (response?.statusCode === 200 && response?.data) {
          const leaveTypes = Array.isArray(response.data) ? response.data : [];

          const transformedLeaveTypes = leaveTypes.map((leave) => ({
            leaveType: leave.leaveType,
            displayName: formatLeaveTypeName(leave.leaveType),
            totalAllowed: parseFloat(leave.totalAllowed),
            used: parseFloat(leave.used),
            carryForward: parseFloat(leave.carryForwarded),
            pending: parseFloat(leave.pending),
            availableBalance:
              parseFloat(leave.totalAllowed) -
              parseFloat(leave.used) -
              parseFloat(leave.pending),
            usedBalance: parseFloat(leave.used),
            isUnlimited: leave.leaveType === "lossOfPay",
            requiresDocument:
              leave.leaveType === "emergency",
          }));

          setEligibleLeaveTypes(transformedLeaveTypes);
        } else {
          setEligibleLeaveTypes([]);
        }
      } catch (error) {
        console.error("Error fetching eligible leave types:", error);
        setEligibleLeaveTypes([]);
        onError?.("Failed to fetch leave types");
      } finally {
        setFetchingLeaveTypes(false);
      }
    };

    fetchEligibleLeaveTypes();
  }, [open, employeeId, onError]);

  // Fetch existing document
  useEffect(() => {
    const fetchExistingDocument = async () => {
      if (!formData.documentId || !open) {
        setExistingDocuments([]);
        return;
      }

      try {
        setLoading(true);
        const response = await personalInfoAPI.getDocumentById(employeeId, formData.documentId);
        if (response) {
          setExistingDocuments([response]);
        } else {
          setExistingDocuments([]);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setExistingDocuments([]);
        // If document not found or error, clear the documentId
        if (error.response?.status === 404) {
          setFormData((prev) => ({
            ...prev,
            documentId: null,
          }));
          onError?.("Document not found. Please upload a new document.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExistingDocument();
  }, [formData.documentId, open, employeeId, onError]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setUploadingFiles([]);
      setValidationErrors({});
      
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
    }
  }, [open, viewDocumentDialog.data]);

  // Helper functions
  const getLeaveTypeDetails = (leaveType) => {
    return eligibleLeaveTypes.find((t) => t.leaveType === leaveType) || null;
  };

  const isDocumentRequired = () => {
    const typeDetails = getLeaveTypeDetails(formData.leaveType);
    return typeDetails?.requiresDocument || false;
  };

  const calculateLeaveDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    if (formData.durationType === "half-day") return 0.5;

    // Calculate working days with sandwich leave logic
    return calculateWorkingDays(formData.startDate, formData.endDate);
  };

  // Get list of weekend dates in the selected range
  const getWeekendDatesInRange = () => {
    if (!formData.startDate || !formData.endDate) return [];
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const weekendDates = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      if (isWeekend(currentDate)) {
        weekendDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weekendDates;
  };

  // Check if current selection has sandwich leave
  const isSandwichLeavePattern = () => {
    return hasSandwichLeave(formData.startDate, formData.endDate);
  };

  // Validation functions
  const validateLeaveType = (value) => {
    if (!value) {
      return "Leave type is required";
    }

    const typeDetails = getLeaveTypeDetails(value);
    if (typeDetails) {
      const requestedDays = calculateLeaveDays();
      if (
        !typeDetails.isUnlimited &&
        requestedDays > typeDetails.availableBalance
      ) {
        return `Insufficient balance. Available: ${typeDetails.availableBalance.toFixed(
          1
        )} days`;
      }
    }

    return null;
  };

  const validateStartDate = (value) => {
    if (!value) {
      return "Start date is required";
    }

    const start = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return "Cannot apply for past dates";
    }

    if (formData.endDate) {
      const end = new Date(formData.endDate);
      if (start > end) {
        return "Start date cannot be after end date";
      }
    }

    return null;
  };

  const validateEndDate = (value) => {
    if (!value) {
      return "End date is required";
    }

    const end = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end < today) {
      return "Cannot apply for past dates";
    }

    if (formData.startDate) {
      const start = new Date(formData.startDate);
      if (end < start) {
        return "End date cannot be before start date";
      }
    }

    return null;
  };

  const validateReason = (value) => {
    if (!value || !value.trim()) {
      return "Reason is required";
    }

    if (value.trim().length < 10) {
      return "Reason must be at least 10 characters";
    }

    return null;
  };

  const validateHalfDayType = () => {
    if (formData.durationType === "half-day" && !formData.halfDayType) {
      return "Please select half-day type";
    }
    return null;
  };

  const validateAttachments = () => {
    if (isDocumentRequired() && !formData.documentId && existingDocuments.length === 0) {
      const typeDetails = getLeaveTypeDetails(formData.leaveType);
      return `Supporting document is required for ${
        typeDetails?.displayName || "this leave type"
      }`;
    }
    return null;
  };

  // Handle field change with validation
  const handleFieldChange = (field, value) => {
    // Update local state
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Handle blur validation
  const handleBlur = (field, value) => {
    let error = null;

    switch (field) {
      case "leaveType":
        error = validateLeaveType(value);
        break;
      case "startDate":
        error = validateStartDate(value);
        break;
      case "endDate":
        error = validateEndDate(value);
        break;
      case "reason":
        error = validateReason(value);
        break;
      case "halfDayType":
        error = validateHalfDayType();
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  // Upload file to backend
  const uploadFileToBackend = async (file) => {
    try {
      const response = await personalInfoAPI.uploadDocument(
        employeeId,
        file,
        "LEAVE",
        (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file.name === file.name ? { ...f, progress } : f
            )
          );
        }
      );

      return response;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        onError?.(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        onError?.(
          `Invalid file type: ${file.name}. Accepted: PDF, JPG, PNG, DOC, DOCX`
        );
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading",
      id: `${file.name}-${Date.now()}`,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Upload files one by one
    for (const file of validFiles) {
      try {
        const uploadedDocument = await uploadFileToBackend(file);

        // Store document ID in form data
        handleFieldChange("documentId", uploadedDocument.id);

        // Add to existing documents
        setExistingDocuments([uploadedDocument]);

        // Remove from uploading files array after successful upload
        setUploadingFiles((prev) =>
          prev.filter((f) => f.file.name !== file.name)
        );

        // Clear attachment error if exists
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.attachments;
          return newErrors;
        });

        onSuccess?.(`${file.name} uploaded successfully`);
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file.name === file.name ? { ...f, status: "error" } : f
          )
        );
        onError?.(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveUploadingFile = (fileId) => {
    const fileToRemove = uploadingFiles.find((f) => f.id === fileId);
    
    // If the file was successfully uploaded, clear the documentId and existing documents
    if (fileToRemove && fileToRemove.status === "success" && fileToRemove.documentId) {
      handleFieldChange("documentId", null);
      setExistingDocuments([]);
    }
    
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleViewDocument = async (document) => {
    setViewDocumentDialog({
      open: true,
      document,
      data: null,
      loading: true,
    });

    try {
      const response = await personalInfoAPI.downloadDocument(document.id);
      
      // Check if response.data is a Blob
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
      onError?.("Failed to load document for viewing");
      setViewDocumentDialog({
        open: false,
        document: null,
        data: null,
        loading: false,
      });
    }
  };

  const handleCloseViewDialog = () => {
    // Clean up object URL to prevent memory leaks
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
      // If data is already a blob URL, use it directly
      const url = viewDocumentDialog.data;
      const link = document.createElement("a");
      link.href = url;
      link.download = viewDocumentDialog.document.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onSuccess?.("Document downloaded successfully");
    } catch (error) {
      console.error("Error downloading document:", error);
      onError?.("Failed to download document");
    }
  };

  const handleRemoveExistingDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to remove this document?"))
      return;

    setLoading(true);
    try {
      await personalInfoAPI.deleteDocument(employeeId, documentId);

      setExistingDocuments([]);
      handleFieldChange("documentId", null);

      onSuccess?.("Document removed successfully");
    } catch (error) {
      console.error("Error removing document:", error);
      onError?.("Failed to remove document");
    } finally {
      setLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    // Run all validations
    const errors = {};

    const leaveTypeError = validateLeaveType(formData.leaveType);
    if (leaveTypeError) errors.leaveType = leaveTypeError;

    const startDateError = validateStartDate(formData.startDate);
    if (startDateError) errors.startDate = startDateError;

    const endDateError = validateEndDate(formData.endDate);
    if (endDateError) errors.endDate = endDateError;

    const reasonError = validateReason(formData.reason);
    if (reasonError) errors.reason = reasonError;

    const halfDayError = validateHalfDayType();
    if (halfDayError) errors.halfDayType = halfDayError;

    const attachmentError = validateAttachments();
    if (attachmentError) errors.attachments = attachmentError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      onError?.("Please fix all validation errors before submitting");
      return;
    }

    // Check if there are files still uploading
    const hasUploadingFiles = uploadingFiles.some(
      (f) => f.status === "uploading"
    );
    if (hasUploadingFiles) {
      onError?.("Please wait for all files to finish uploading");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        employeeId: formData.employeeId || employeeId,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        appliedDays: calculateLeaveDays(),
        reason: formData.reason.trim(),
        status: formData.status || "Pending",
        isHalfDay: formData.durationType === "half-day",
        halfDayType:
          formData.durationType === "half-day" ? formData.halfDayType : null,
        documentId: formData.documentId || null,
      };

      if (isNewApplication) {
        await leaveAPI.applyLeave(submitData);
        onSuccess?.("Leave application submitted successfully!");
      } else {
        await leaveAPI.updateLeaveApplication(formData.id, submitData);
        onSuccess?.("Leave application updated successfully!");
      }

      // Reset state and close
      setValidationErrors({});
      setUploadingFiles([]);
      setExistingDocuments([]);
      onClose();
    } catch (error) {
      console.error("Submit error:", error);

      let errorMessage = "Failed to submit leave application";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (isApproved) {
      onError?.("Cannot delete an approved leave application");
      return;
    }
    
    // Just call the parent handler - no confirmation here
    handleDeleteApplication(formData.id);
  };

  const weekendDates = getWeekendDatesInRange();
  const totalCalendarDays = formData.startDate && formData.endDate 
    ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1 
    : 0;
  const isSandwich = isSandwichLeavePattern();

  // Get today's date for min attribute in date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 600 },
            p: 3,
          },
        }}
      >
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="600">
              {isNewApplication ? "Apply for Leave" : "Edit Leave Application"}
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Show alert if approved */}
          {isApproved && (
            <Alert severity="info" sx={{ mb: 3 }}>
              This leave application has been approved. Document modifications and deletion are disabled.
            </Alert>
          )}

          {/* Weekend Configuration Info */}
          <Alert severity="info" icon={<CalendarMonth />} sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="600">
              Weekend Configuration
            </Typography>
            <Typography variant="caption">
              Weekends: {WEEKEND_CONFIG.displayNames.join(" & ")} (excluded from leave calculation)
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Leave Type */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Leave Type"
                name="leaveType"
                value={formData.leaveType || ""}
                onChange={(e) => handleFieldChange("leaveType", e.target.value)}
                onBlur={(e) => handleBlur("leaveType", e.target.value)}
                error={!!validationErrors.leaveType}
                helperText={validationErrors.leaveType}
                disabled={fetchingLeaveTypes || loading}
                required
              >
                {fetchingLeaveTypes ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading leave types...
                  </MenuItem>
                ) : eligibleLeaveTypes.length === 0 ? (
                  <MenuItem disabled>No eligible leave types available</MenuItem>
                ) : (
                  eligibleLeaveTypes.map((type) => {
                    const balanceText = type.isUnlimited
                      ? "Unlimited"
                      : `${type.availableBalance.toFixed(1)} days available`;

                    const balanceColor = type.isUnlimited
                      ? "#1976d2"
                      : type.availableBalance > 0
                      ? "#4caf50"
                      : "#f44336";

                    return (
                      <MenuItem key={type.leaveType} value={type.leaveType}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2">
                            {type.displayName}
                          </Typography>
                          <Chip
                            label={balanceText}
                            size="small"
                            sx={{
                              backgroundColor: `${balanceColor}20`,
                              color: balanceColor,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>
                      </MenuItem>
                    );
                  })
                )}
              </TextField>

              {/* Balance Card */}
              {formData.leaveType &&
                (() => {
                  const typeDetails = getLeaveTypeDetails(formData.leaveType);
                  const requestedDays = calculateLeaveDays();

                  if (!typeDetails) return null;

                  return (
                    <Paper
                      elevation={1}
                      sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="600"
                        mb={2}
                        color="primary"
                      >
                        {typeDetails.displayName} - Balance Information
                      </Typography>

                      {typeDetails.isUnlimited ? (
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            ✓ Unlimited leaves available
                          </Typography>
                          {requestedDays > 0 && (
                            <Typography variant="body2" color="primary.main">
                              Requesting:{" "}
                              <strong>{requestedDays.toFixed(1)} days</strong>
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Available Balance
                              </Typography>
                              <Typography
                                variant="h6"
                                fontWeight="700"
                                color={
                                  typeDetails.availableBalance > 0
                                    ? "success.main"
                                    : "error.main"
                                }
                              >
                                {typeDetails.availableBalance.toFixed(1)} days
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Used This Year
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="600"
                                color="error.main"
                              >
                                {typeDetails.usedBalance.toFixed(1)} days
                              </Typography>
                            </Grid>
                            {typeDetails.carryForward > 0 && (
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Carry Forward
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  color="info.main"
                                >
                                  {typeDetails.carryForward.toFixed(1)} days
                                </Typography>
                              </Grid>
                            )}
                            {requestedDays > 0 && (
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Requesting
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  color={
                                    requestedDays <= typeDetails.availableBalance
                                      ? "primary.main"
                                      : "error.main"
                                  }
                                >
                                  {requestedDays.toFixed(1)} days
                                </Typography>
                              </Grid>
                            )}
                          </Grid>

                          {requestedDays > typeDetails.availableBalance && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                              Insufficient balance! You can only apply for up to{" "}
                              {typeDetails.availableBalance.toFixed(1)} days.
                            </Alert>
                          )}
                        </>
                      )}

                      {typeDetails.requiresDocument && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <strong>Document Required:</strong> Supporting documents
                          must be uploaded for {typeDetails.displayName}.
                        </Alert>
                      )}
                    </Paper>
                  );
                })()}
            </Grid>

            {/* Duration Type */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Duration Type</FormLabel>
                <RadioGroup
                  row
                  value={formData.durationType || "full-day"}
                  onChange={(e) =>
                    handleFieldChange("durationType", e.target.value)
                  }
                >
                  <FormControlLabel
                    value="full-day"
                    control={<Radio />}
                    label="Full Day"
                  />
                  <FormControlLabel
                    value="half-day"
                    control={<Radio />}
                    label="Half Day"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Half Day Type */}
            {formData.durationType === "half-day" && (
              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  error={!!validationErrors.halfDayType}
                >
                  <FormLabel component="legend">Half Day Type *</FormLabel>
                  <RadioGroup
                    row
                    value={formData.halfDayType || ""}
                    onChange={(e) =>
                      handleFieldChange("halfDayType", e.target.value)
                    }
                    onBlur={() => handleBlur("halfDayType")}
                  >
                    <FormControlLabel
                      value="first_half"
                      control={<Radio />}
                      label="First Half"
                    />
                    <FormControlLabel
                      value="second_half"
                      control={<Radio />}
                      label="Second Half"
                    />
                  </RadioGroup>
                  {validationErrors.halfDayType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {validationErrors.halfDayType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}

            {/* Start Date */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                value={formData.startDate || ""}
                onChange={(e) => handleFieldChange("startDate", e.target.value)}
                onBlur={(e) => handleBlur("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
                error={!!validationErrors.startDate}
                helperText={validationErrors.startDate}
                required
                disabled={loading}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={(e) => handleFieldChange("endDate", e.target.value)}
                onBlur={(e) => handleBlur("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.startDate || today }}
                error={!!validationErrors.endDate}
                helperText={validationErrors.endDate}
                required
                disabled={loading}
              />
            </Grid>

            {/* Leave Days Calculation Summary */}
            {formData.startDate && formData.endDate && formData.durationType === "full-day" && (
              <Grid item xs={12}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: isSandwich ? "rgba(255, 152, 0, 0.08)" : "rgba(33, 150, 243, 0.04)",
                    border: `1px solid ${isSandwich ? "rgba(255, 152, 0, 0.5)" : "rgba(33, 150, 243, 0.3)"}`,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" fontWeight="600" color={isSandwich ? "warning.main" : "primary"}>
                        Leave Period Summary
                      </Typography>
                      {isSandwich && (
                        <Chip 
                          label="Sandwich Leave" 
                          size="small" 
                          color="warning" 
                          icon={<CalendarMonth />}
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                    
                    {isSandwich && (
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        <strong>Sandwich Leave Detected:</strong> Weekends between working days will be counted as leave days.
                      </Alert>
                    )}
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Total Days
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {totalCalendarDays} days
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          {isSandwich ? "Weekends (Included)" : "Weekends"}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="600" 
                          color={isSandwich ? "warning.main" : "text.secondary"}
                          sx={{ textDecoration: isSandwich ? "none" : "line-through" }}
                        >
                          {weekendDates.length} days
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Leave Applied
                        </Typography>
                        <Typography variant="body1" fontWeight="700" color="success.main">
                          {calculateLeaveDays()} days
                        </Typography>
                      </Grid>
                    </Grid>
                    {weekendDates.length > 0 && (
                      <Box sx={{ mt: 1, pt: 1.5, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                          Weekend dates {isSandwich ? "(included in leave count)" : "(excluded)"}:
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5}>
                          {weekendDates.map((date, index) => (
                            <Chip
                              key={index}
                              label={date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                              size="small"
                              color={isSandwich ? "warning" : "default"}
                              variant={isSandwich ? "filled" : "outlined"}
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            )}

            {/* Half-day info */}
            {formData.durationType === "half-day" && formData.startDate && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Half-day leave: 0.5 days will be applied on{" "}
                  {new Date(formData.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Alert>
              </Grid>
            )}

            {/* Reason */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason"
                name="reason"
                value={formData.reason || ""}
                onChange={(e) => handleFieldChange("reason", e.target.value)}
                onBlur={(e) => handleBlur("reason", e.target.value)}
                error={!!validationErrors.reason}
                helperText={validationErrors.reason || "Minimum 10 characters"}
                placeholder="Please provide a detailed reason for your leave application"
                required
                disabled={loading}
              />
            </Grid>

            {/* File Upload Section */}
            {(isDocumentRequired() ||
              existingDocuments.length > 0 ||
              uploadingFiles.length > 0 ||
              formData.documentId) && (
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1" fontWeight="600">
                    Attachments{" "}
                    {isDocumentRequired() && (
                      <span style={{ color: "#d32f2f" }}>*</span>
                    )}
                  </Typography>
                  {isDocumentRequired() && (
                    <Chip
                      label="Required"
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {isDocumentRequired() && !formData.documentId && existingDocuments.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Document Required:</strong> Supporting documents must
                    be uploaded for this leave type.
                  </Alert>
                )}

                {validationErrors.attachments && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {validationErrors.attachments}
                  </Alert>
                )}

                {/* Loading indicator for fetching document */}
                {loading && formData.documentId && existingDocuments.length === 0 && uploadingFiles.length === 0 && (
                  <Card elevation={2} sx={{ mb: 2, p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">
                        Loading document...
                      </Typography>
                    </Stack>
                  </Card>
                )}

                {/* Show existing documents */}
                {existingDocuments.map((doc) => (
                  <ExistingAttachmentItem
                    key={doc.id}
                    document={doc}
                    onRemove={handleRemoveExistingDocument}
                    onView={handleViewDocument}
                    canDelete={canModifyDocument && !loading}
                  />
                ))}

                {/* Show files being uploaded */}
                {uploadingFiles.map((item) => (
                  <FileItem
                    key={item.id}
                    file={item.file}
                    progress={item.progress}
                    status={item.status}
                    onRemove={() => handleRemoveUploadingFile(item.id)}
                  />
                ))}

                {/* Upload zone */}
                {existingDocuments.length === 0 && canModifyDocument && !loading && (
                  <FileUploadZone
                    onFileDrop={handleFileUpload}
                    uploading={loading}
                    disabled={!canModifyDocument || loading}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      id="file-upload"
                      onChange={(e) => {
                        handleFileUpload(Array.from(e.target.files));
                        e.target.value = null;
                      }}
                      disabled={!canModifyDocument || loading}
                    />
                    <label htmlFor="file-upload">
                      <Box sx={{ cursor: loading || !canModifyDocument ? "not-allowed" : "pointer" }}>
                        <CloudUpload
                          sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                        />
                        <Typography variant="body1" color="text.secondary">
                          Drag and drop file here or click to browse
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Maximum file size: 10MB • Accepted formats: PDF, DOC,
                          DOCX, JPG, PNG
                        </Typography>
                      </Box>
                    </label>
                  </FileUploadZone>
                )}

                {!canModifyDocument && formData.documentId && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Document cannot be modified for approved leave applications.
                  </Alert>
                )}
              </Grid>
            )}
          </Grid>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} mt={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={
                loading ||
                uploadingFiles.some((f) => f.status === "uploading") ||
                fetchingLeaveTypes
              }
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isNewApplication ? (
                "Submit Application"
              ) : (
                "Update Application"
              )}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </Stack>

          {/* Delete Button for existing applications */}
          {!isNewApplication && handleDeleteApplication && (
            <Box mt={2}>
              <Tooltip 
                title={isApproved ? "Cannot delete approved leave applications" : "Delete this application"}
                arrow
              >
                <span>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                    disabled={loading || isApproved}
                  >
                    Delete Application
                  </Button>
                </span>
              </Tooltip>
              {isApproved && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Approved applications cannot be deleted
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Document Viewer Dialog */}
      <Dialog
        open={viewDocumentDialog.open}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: "90vh" }
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">View Document</Typography>
              {viewDocumentDialog.document && (
                <Typography variant="caption" color="text.secondary">
                  {viewDocumentDialog.document.originalName}
                </Typography>
              )}
            </Box>
            <IconButton onClick={handleCloseViewDialog}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {viewDocumentDialog.loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, p: 4 }}>
              <CircularProgress size={48} />
              <Typography variant="body2" color="text.secondary">
                Loading document...
              </Typography>
            </Box>
          ) : viewDocumentDialog.data && viewDocumentDialog.document ? (
            <Box sx={{ width: "100%", height: "100%", overflow: "auto", p: 2 }}>
              {(() => {
                const isImage = viewDocumentDialog.document.mimeType?.includes("image") || 
                  ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
                    getFileExtension(viewDocumentDialog.document.originalName)
                  );
                const isPdf = viewDocumentDialog.document.mimeType === "application/pdf" ||
                  getFileExtension(viewDocumentDialog.document.originalName) === "pdf";

                if (isImage) {
                  return (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        minHeight: "500px",
                        backgroundImage: `url(${viewDocumentDialog.data})`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  );
                } else if (isPdf) {
                  return (
                    <iframe
                      src={viewDocumentDialog.data}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        minHeight: "600px",
                      }}
                      title={viewDocumentDialog.document.originalName}
                    />
                  );
                } else {
                  return (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <InsertDriveFile sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Preview not available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        This file type cannot be previewed in the browser.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please download the file to view it.
                      </Typography>
                    </Box>
                  );
                }
              })()}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
              <Typography variant="h6" color="error">
                Failed to load document
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button
            startIcon={<Download />}
            onClick={handleDownloadFromView}
            disabled={viewDocumentDialog.loading || !viewDocumentDialog.data}
          >
            Download
          </Button>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeaveDrawer;