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
  Fade,
  Slide,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  AttachFile,
  Delete,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Visibility,
  GetApp,
  DragIndicator,
  Description,
  Image,
  PictureAsPdf,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import CommonDrawer from "../common/Drawer";
import { leaveAPI } from "../../utils/api";

// Helper function to extract filename from S3 URL
const extractFilenameFromS3Url = (url) => {
  if (!url) return 'Attachment';
  
  try {
    // Handle different S3 URL formats:
    // https://bucket-name.s3.region.amazonaws.com/path/filename
    // https://s3.region.amazonaws.com/bucket-name/path/filename
    // https://bucket-name.s3.amazonaws.com/path/filename
    
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract filename from path (last segment after the last '/')
    const segments = pathname.split('/').filter(segment => segment.length > 0);
    const filename = segments[segments.length - 1];
    
    // Decode URI component to handle encoded characters
    return decodeURIComponent(filename) || 'Attachment';
  } catch (error) {
    console.warn('Error extracting filename from S3 URL:', error);
    // Fallback: try to get filename from the end of the URL string
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Attachment';
  }
};

// Helper function to get file type from S3 URL or filename
const getFileTypeFromUrl = (url, filename = '') => {
  const name = filename || extractFilenameFromS3Url(url);
  const extension = name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
};

// Helper function to check if S3 URL is accessible
const validateS3Url = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('S3 URL validation failed:', error);
    return false;
  }
};

// Enhanced existing attachment component
const ExistingAttachmentItem = ({ attachment, onRemove, onView, index, canDelete = true }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Validate S3 URL on mount
  useEffect(() => {
    if (attachment.url) {
      setIsValidating(true);
      validateS3Url(attachment.url)
        .then(setIsValid)
        .finally(() => setIsValidating(false));
    }
  }, [attachment.url]);

  const getFileIcon = (fileType, fileName) => {
    if (fileType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      return <PictureAsPdf color="error" />;
    }
    if (fileType?.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
      return <Image color="primary" />;
    }
    return <Description color="action" />;
  };

  const getFileTypeChip = (fileType, fileName) => {
    if (fileType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      return <Chip label="PDF" size="small" color="error" variant="outlined" />;
    }
    if (fileType?.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
      return <Chip label="Image" size="small" color="primary" variant="outlined" />;
    }
    return <Chip label="File" size="small" color="default" variant="outlined" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        elevation={2}
        sx={{
          mb: 2,
          backgroundColor: isValid ? "rgba(76, 175, 80, 0.05)" : "rgba(255, 152, 0, 0.05)",
          border: isValid ? "1px solid #4caf50" : "1px solid #ff9800",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getFileIcon(attachment.type, attachment.name)}
              {isValidating ? (
                <CircularProgress size={16} />
              ) : isValid ? (
                <CheckCircle color="success" fontSize="small" />
              ) : (
                <ErrorIcon color="warning" fontSize="small" />
              )}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {attachment.name || attachment.fileName || "Attachment"}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                {getFileTypeChip(attachment.type, attachment.name)}
                <Typography 
                  variant="caption" 
                  color={isValid ? "success.main" : "warning.main"}
                  sx={{ fontWeight: 500 }}
                >
                  {isValidating ? "Validating..." : isValid ? "S3 File Available" : "S3 File Unavailable"}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title={isValid ? "View attachment" : "File unavailable"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onView(attachment)}
                    disabled={!isValid || isValidating}
                    sx={{
                      color: "primary.main",
                      "&:hover:not(:disabled)": {
                        backgroundColor: "primary.light",
                        color: "white",
                      },
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              {attachment.url && isValid && (
                <Tooltip title="Download from S3">
                  <IconButton
                    size="small"
                    component="a"
                    href={attachment.url}
                    download={attachment.name || "attachment"}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "success.main",
                      "&:hover": {
                        backgroundColor: "success.light",
                        color: "white",
                      },
                    }}
                  >
                    <GetApp fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onRemove(attachment)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "white",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// File upload component with drag & drop (unchanged)
const FileUploadZone = ({ onFileDrop, uploading, children }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e) => {
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
      const files = Array.from(e.dataTransfer.files);
      onFileDrop(files);
    },
    [onFileDrop]
  );

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Paper
        elevation={isDragOver ? 8 : 2}
        sx={{
          border: `2px dashed ${isDragOver ? "#1976d2" : "#e0e0e0"}`,
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          backgroundColor: isDragOver
            ? "rgba(25, 118, 210, 0.04)"
            : "transparent",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                zIndex: 1,
                borderRadius: 8,
              }}
            >
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                Drop files here
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        {children}
      </Paper>
    </motion.div>
  );
};

// Enhanced file item component (unchanged from your original)
const FileItem = ({ file, progress, status, onRemove, onPreview, index }) => {
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

  const getFileIcon = () => {
    const extension = file.name.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <PictureAsPdf color="error" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <Image color="primary" />;
      default:
        return <AttachFile color="action" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        elevation={2}
        sx={{
          mb: 2,
          backgroundColor: getStatusColor(),
          position: "relative",
          overflow: "hidden",
          border: `1px solid ${
            status === "success"
              ? "#4caf50"
              : status === "error"
              ? "#f44336"
              : status === "uploading"
              ? "#2196f3"
              : "#e0e0e0"
          }`,
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getFileIcon()}
              {getStatusIcon()}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB
                {status === "success" && " • Uploaded to S3"}
                {status === "error" && " • Upload failed"}
                {status === "uploading" &&
                  ` • ${Math.round(progress || 0)}% uploaded`}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {status === "success" && onPreview && (
                <Tooltip title="Preview">
                  <IconButton
                    size="small"
                    onClick={() => onPreview(file)}
                    sx={{
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.light",
                        color: "white",
                      },
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {status !== "uploading" && (
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={onRemove}
                    sx={{
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "white",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {status === "uploading" && typeof progress === "number" && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LeaveDrawer = ({
  open,
  onClose,
  selectedApplication,
  setSelectedApplication,
  isNewApplication,
  leaveTypeOptions = [
    "Annual Leave",
    "Casual Leave",
    "Sick Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Loss of Pay",
  ],
  statusOptions = ["Pending", "Approved", "Rejected"],
  handleDeleteApplication,
  employeeId,
  employeeLocation = "India",
  onSuccess,
  onError,
}) => {
  const [uploadStates, setUploadStates] = useState(new Map());
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [fetchingBalance, setFetchingBalance] = useState(false);

  // Initialize existing attachments when component mounts or application changes
  useEffect(() => {
    if (selectedApplication && !isNewApplication) {
      const attachments = [];
      
      // Handle single attachmentUrl (S3 URL)
      if (selectedApplication.attachmentUrl) {
        const filename = extractFilenameFromS3Url(selectedApplication.attachmentUrl);
        const fileType = getFileTypeFromUrl(selectedApplication.attachmentUrl, filename);
        
        attachments.push({
          id: `s3-attachment-${Date.now()}`,
          name: filename,
          url: selectedApplication.attachmentUrl,
          type: fileType,
          isS3File: true,
        });
      }
      
      // Handle multiple attachments array (if exists alongside attachmentUrl)
      if (Array.isArray(selectedApplication.attachments)) {
        selectedApplication.attachments.forEach((attachment, index) => {
          if (typeof attachment === 'string') {
            // If attachment is a URL string
            const filename = extractFilenameFromS3Url(attachment);
            const fileType = getFileTypeFromUrl(attachment, filename);
            
            attachments.push({
              id: `s3-existing-${index}`,
              name: filename,
              url: attachment,
              type: fileType,
              isS3File: true,
            });
          } else {
            // If attachment is an object
            const filename = attachment.name || attachment.fileName || extractFilenameFromS3Url(attachment.url);
            const fileType = attachment.type || attachment.mimeType || getFileTypeFromUrl(attachment.url, filename);
            
            attachments.push({
              id: attachment.id || `s3-existing-obj-${index}`,
              name: filename,
              url: attachment.url || attachment.path,
              type: fileType,
              isS3File: true,
              ...attachment,
            });
          }
        });
      }
      
      setExistingAttachments(attachments);
    } else {
      setExistingAttachments([]);
    }
  }, [selectedApplication, isNewApplication]);

  // Handle viewing existing attachments (S3 URLs)
  const handleViewExistingAttachment = (attachment) => {
    if (attachment.url) {
      // For S3 URLs, open in new tab with proper security attributes
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    } else {
      onError?.('Unable to view attachment: S3 URL not available');
    }
  };

  // Handle removing existing attachments
  const handleRemoveExistingAttachment = (attachmentToRemove) => {
    if (window.confirm('Are you sure you want to remove this attachment? This will remove the reference but the file will remain in S3.')) {
      setExistingAttachments(prev => 
        prev.filter(attachment => attachment.id !== attachmentToRemove.id)
      );
      
      // Update the selectedApplication to reflect the change
      setSelectedApplication(prev => {
        const updatedAttachments = existingAttachments
          .filter(attachment => attachment.id !== attachmentToRemove.id)
          .map(attachment => attachment.url);
        
        return {
          ...prev,
          attachments: updatedAttachments,
          // If removing the main attachmentUrl, clear it
          attachmentUrl: attachmentToRemove.url === prev.attachmentUrl ? null : prev.attachmentUrl,
        };
      });
    }
  };

  // Default leave balances based on location
  const getDefaultLeaveBalances = () => {
    return {
      "Annual Leave": { total: 21, used: 0, carriedForward: 0 },
      "Casual Leave": { total: 12, used: 0, carriedForward: 0 },
      "Sick Leave": { total: 12, used: 0, carriedForward: 0 },
      "Emergency Leave": { total: 5, used: 0, carriedForward: 0 },
      "Maternity Leave": {
        total: employeeLocation === "India" ? 182 : 50,
        used: 0,
        carriedForward: 0,
      },
      "Loss of Pay": { total: 365, used: 0, carriedForward: 0 },
    };
  };

  // Fetch leave balances on component mount
  useEffect(() => {
    if (employeeId && open) {
      fetchLeaveBalance();
    }
  }, [employeeId, open]);

  const fetchLeaveBalance = async () => {
    if (!employeeId) {
      setLeaveBalances(getDefaultLeaveBalances());
      return;
    }

    setFetchingBalance(true);
    try {
      const response = await leaveAPI.getLeaveBalance(employeeId);
      if (response.success && response.data && response.data.length > 0) {
        const balances = {};
        response.data.forEach((balance) => {
          balances[balance.leaveType] = {
            total: balance.totalDays || 0,
            used: balance.usedDays || 0,
            carriedForward: balance.carriedForward || 0,
          };
        });
        setLeaveBalances({ ...getDefaultLeaveBalances(), ...balances });
      } else {
        setLeaveBalances(getDefaultLeaveBalances());
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      setLeaveBalances(getDefaultLeaveBalances());
    } finally {
      setFetchingBalance(false);
    }
  };

  // Enhanced file upload with progress tracking (returns S3 URLs)
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        onError?.(
          `Invalid file type: ${file.name}. Only PDF, JPG, PNG are allowed.`
        );
        return false;
      }
      if (file.size > maxSize) {
        onError?.(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Initialize upload states
    const newUploadStates = new Map(uploadStates);
    validFiles.forEach((file) => {
      const fileId = `${file.name}-${file.size}-${Date.now()}`;
      newUploadStates.set(fileId, {
        file,
        progress: 0,
        status: "uploading",
      });
    });
    setUploadStates(newUploadStates);

    // Upload files with progress tracking to S3
    const uploadPromises = validFiles.map(async (file) => {
      const fileId = `${file.name}-${file.size}-${Date.now()}`;

      try {
        // Upload to S3 and get back S3 URL
        const response = await leaveAPI.uploadAttachment(file, (progress) => {
          setUploadStates((prev) => {
            const updated = new Map(prev);
            const current = updated.get(fileId);
            if (current) {
              updated.set(fileId, {
                ...current,
                progress: Math.round(progress),
              });
            }
            return updated;
          });
        });

        // Mark as success
        setUploadStates((prev) => {
          const updated = new Map(prev);
          const current = updated.get(fileId);
          if (current) {
            updated.set(fileId, {
              ...current,
              status: "success",
              progress: 100,
            });
          }
          return updated;
        });

        // Return S3 URL and metadata
        return {
          file,
          fileId,
          url: response.data?.url || response.data?.s3Url, // S3 URL
          name: file.name,
          type: file.type,
          isS3File: true,
        };
      } catch (error) {
        // Mark as error
        setUploadStates((prev) => {
          const updated = new Map(prev);
          const current = updated.get(fileId);
          if (current) {
            updated.set(fileId, { ...current, status: "error", progress: 0 });
          }
          return updated;
        });

        onError?.(`S3 upload failed for ${file.name}: ${error.message}`);
        return null;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      if (successful.length > 0) {
        setUploadedAttachments((prev) => [...prev, ...successful]);
      }
    } catch (error) {
      console.error("Error during S3 file upload:", error);
    }
  };

  const removeFile = (fileId) => {
    setUploadStates((prev) => {
      const updated = new Map(prev);
      updated.delete(fileId);
      return updated;
    });

    setUploadedAttachments((prev) =>
      prev.filter((attachment) => attachment.fileId !== fileId)
    );
  };

  const previewFile = (file) => {
    // Find the uploaded attachment with this file
    const attachment = uploadedAttachments.find((att) => att.file === file);
    if (attachment && attachment.url) {
      window.open(attachment.url, "_blank", "noopener,noreferrer");
    }
  };

  // Validation logic
  const validateLeaveApplication = () => {
    const errors = {};

    if (!selectedApplication.leaveType) {
      errors.leaveType = "Please select a leave type";
    }

    if (!selectedApplication.startDate) {
      errors.startDate = "Please select a start date";
    }

    if (
      !selectedApplication.reason ||
      selectedApplication.reason.trim() === ""
    ) {
      errors.reason = "Please provide a reason for leave";
    }

    // Date validation
    if (selectedApplication.startDate && selectedApplication.endDate) {
      const startDate = new Date(selectedApplication.startDate);
      const endDate = new Date(selectedApplication.endDate);

      if (startDate > endDate) {
        errors.dateRange = "Start date cannot be after end date.";
      }

      // Check if CL/SL is being applied beyond current year
      const currentYear = new Date().getFullYear();
      if (
        ["Casual Leave", "Sick Leave"].includes(selectedApplication.leaveType)
      ) {
        if (
          startDate.getFullYear() > currentYear ||
          endDate.getFullYear() > currentYear
        ) {
          errors.dateRange =
            "Casual Leave and Sick Leave cannot be applied beyond the current leave cycle.";
        }
      }
    }

    // Emergency Leave attachment validation
    if (
      selectedApplication.leaveType === "emergency" &&
      uploadedAttachments.length === 0 &&
      existingAttachments.length === 0
    ) {
      errors.attachment =
        "Please upload supporting document for Emergency Leave.";
    }

    // Leave balance validation
    const leaveType = selectedApplication.leaveType;
    if (leaveType && leaveBalances[leaveType]) {
      const requestedDays = calculateLeaveDays();
      const available =
        leaveBalances[leaveType].total -
        leaveBalances[leaveType].used +
        (leaveBalances[leaveType].carriedForward || 0);

      if (requestedDays > available && leaveType !== "Loss of Pay") {
        errors.balance = `Insufficient leave balance. Available: ${available} days, Requested: ${requestedDays} days`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateLeaveDays = () => {
    if (!selectedApplication.startDate) return 0;

    if (selectedApplication.durationType === "half-day") {
      return 0.5;
    }

    const startDate = new Date(selectedApplication.startDate);
    const endDate = new Date(
      selectedApplication.endDate || selectedApplication.startDate
    );

    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    return Math.max(daysDiff, 1);
  };

  const handleEnhancedSave = async () => {
    if (!validateLeaveApplication()) {
      return;
    }

    setLoading(true);
    try {
      console.log(employeeId);

      // Combine existing and new attachments (all S3 URLs)
      const allAttachmentUrls = [
        ...existingAttachments.map(att => att.url),
        ...uploadedAttachments.map(att => att.url)
      ].filter(Boolean); // Remove any null/undefined URLs

      // Prepare application data with S3 URLs
      const applicationData = {
        ...selectedApplication,
        employeeId: employeeId,
        // Set primary attachment URL (first one) for backward compatibility
        attachmentUrl: allAttachmentUrls[0] || null,
        // Store all attachments as array
        attachments: allAttachmentUrls,
        calculatedDays: calculateLeaveDays(),
        // Ensure required fields are present
        status: selectedApplication.status || "Pending",
        durationType: selectedApplication.durationType || "full-day",
      };

      let response;
      if (isNewApplication) {
        response = await leaveAPI.createLeave(applicationData);
      } else {
        response = await leaveAPI.updateLeave(
          selectedApplication.id,
          applicationData
        );
      }

      if (response.statusCode === 201 || response.statusCode === 200) {
        onSuccess?.(
          isNewApplication
            ? "Leave application created successfully with S3 attachments"
            : "Leave application updated successfully with S3 attachments"
        );
        onClose();

       
      }
    } catch (error) {
      console.error("Error saving leave application:", error);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancedDelete = async () => {
    if (!selectedApplication.id) return;

    if (
      !window.confirm("Are you sure you want to delete this leave application? Note: Associated S3 files will remain in storage.")
    ) {
      return;
    }

    setLoading(true);
    try {
      // const response = await leaveAPI.deleteLeave(selectedApplication.id);

      if (handleDeleteApplication) {
        handleDeleteApplication();
      }
    } catch (error) {
      console.error("Error deleting leave application:", error);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      setUploadStates(new Map());
      setUploadedAttachments([]);
      setValidationErrors({});
    }
  }, [open]);

  const uploadStatesArray = Array.from(uploadStates.entries());
  const hasUploading = uploadStatesArray.some(
    ([_, state]) => state.status === "uploading"
  );

  // Check if we should show attachments section
  let shouldShowAttachments;
  if (selectedApplication !== null) {
    console.log(selectedApplication);
    
    shouldShowAttachments = selectedApplication.leaveType === "emergency" || 
                                  existingAttachments.length > 0 || 
                                  uploadStatesArray.length > 0;
  }

  const drawerContent = (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      <Box className="leave-edit-form">
        {selectedApplication && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Typography
                  variant="h6"
                  className="form-title"
                  sx={{
                    background:
                      "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {isNewApplication
                    ? "Add New Leave Application"
                    : "Edit Leave Application"}
                </Typography>
                {fetchingBalance && (
                  <Typography variant="caption" color="text.secondary">
                    Loading leave balances...
                  </Typography>
                )}
              </motion.div>
            </Grid>

            {/* Leave Type Selection */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TextField
                  fullWidth
                  select
                  label="Leave Type"
                  value={selectedApplication.leaveType || ""}
                  onChange={(e) => {
                    setSelectedApplication({
                      ...selectedApplication,
                      leaveType: e.target.value,
                      durationType: "full-day",
                    });
                    setValidationErrors((prev) => ({
                      ...prev,
                      leaveType: undefined,
                    }));
                  }}
                  error={!!validationErrors.leaveType}
                  helperText={validationErrors.leaveType}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      },
                    },
                  }}
                >
                  {leaveTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Box sx={{ width: "100%" }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {option}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Available:{" "}
                          {leaveBalances[option]
                            ? Math.max(
                                0,
                                leaveBalances[option].total -
                                  leaveBalances[option].used +
                                  (leaveBalances[option].carriedForward || 0)
                              )
                            : 0}{" "}
                          days
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </motion.div>
            </Grid>

            {/* Duration Type */}
            <AnimatePresence>
              {selectedApplication.leaveType &&
                selectedApplication.leaveType !== "Loss of Pay" && (
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                          Duration Type
                        </FormLabel>
                        <RadioGroup
                          row
                          value={selectedApplication.durationType || "full-day"}
                          onChange={(e) =>
                            setSelectedApplication({
                              ...selectedApplication,
                              durationType: e.target.value,
                              endDate:
                                e.target.value === "half-day"
                                  ? selectedApplication.startDate
                                  : selectedApplication.endDate,
                            })
                          }
                          sx={{ mt: 1 }}
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
                    </motion.div>
                  </Grid>
                )}
            </AnimatePresence>

            {/* Half Day Type Selection */}
            <AnimatePresence>
              {selectedApplication.durationType === "half-day" && (
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextField
                      fullWidth
                      select
                      label="Half Day Type"
                      value={selectedApplication.halfDayType || ""}
                      onChange={(e) =>
                        setSelectedApplication({
                          ...selectedApplication,
                          halfDayType: e.target.value,
                        })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.3s ease",
                        },
                      }}
                    >
                      <MenuItem value="first-half">
                        First Half (Morning)
                      </MenuItem>
                      <MenuItem value="second-half">
                        Second Half (Afternoon)
                      </MenuItem>
                    </TextField>
                  </motion.div>
                </Grid>
              )}
            </AnimatePresence>

            {/* Start Date */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={
                      selectedApplication.startDate
                        ? new Date(selectedApplication.startDate)
                        : null
                    }
                    onChange={(newValue) => {
                      const formattedDate = newValue
                        ? newValue.toISOString().split("T")[0]
                        : "";
                      setSelectedApplication((prev) => ({
                        ...prev,
                        startDate: formattedDate,
                        endDate:
                          selectedApplication.durationType === "half-day"
                            ? formattedDate
                            : prev.endDate,
                      }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        dateRange: undefined,
                        startDate: undefined,
                      }));
                    }}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!(
                          validationErrors.dateRange ||
                          validationErrors.startDate
                        ),
                        helperText:
                          validationErrors.dateRange ||
                          validationErrors.startDate ||
                          "",
                        InputLabelProps: { shrink: true },
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-1px)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            },
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </motion.div>
            </Grid>

            {/* End Date */}
            <AnimatePresence>
              {selectedApplication.durationType !== "half-day" && (
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="End Date"
                        value={
                          selectedApplication.endDate
                            ? new Date(selectedApplication.endDate)
                            : null
                        }
                        onChange={(newValue) => {
                          const formattedDate = newValue
                            ? newValue.toISOString().split("T")[0]
                            : "";
                          setSelectedApplication((prev) => ({
                            ...prev,
                            endDate: formattedDate,
                          }));
                          setValidationErrors((prev) => ({
                            ...prev,
                            dateRange: undefined,
                          }));
                        }}
                        minDate={
                          selectedApplication.startDate
                            ? new Date(selectedApplication.startDate)
                            : new Date()
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!validationErrors.dateRange,
                            helperText: validationErrors.dateRange || "",
                            InputLabelProps: { shrink: true },
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                },
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </motion.div>
                </Grid>
              )}
            </AnimatePresence>

            {/* Calculated Days Display */}
            <AnimatePresence>
              {selectedApplication.startDate &&
                (selectedApplication.endDate ||
                  selectedApplication.durationType === "half-day") && (
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Alert
                        severity="info"
                        sx={{
                          background:
                            "linear-gradient(45deg, #e3f2fd 30%, #f3e5f5 90%)",
                          border: "1px solid rgba(25, 118, 210, 0.2)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total Leave Days: {calculateLeaveDays()}
                          {selectedApplication.leaveType &&
                            leaveBalances[selectedApplication.leaveType] && (
                              <Typography
                                component="span"
                                color="text.secondary"
                                sx={{ ml: 2, fontSize: "0.875rem" }}
                              >
                                (Available:{" "}
                                {Math.max(
                                  0,
                                  leaveBalances[selectedApplication.leaveType]
                                    .total -
                                    leaveBalances[selectedApplication.leaveType]
                                      .used +
                                    (leaveBalances[
                                      selectedApplication.leaveType
                                    ].carriedForward || 0)
                                )}{" "}
                                days)
                              </Typography>
                            )}
                        </Typography>
                      </Alert>
                    </motion.div>
                  </Grid>
                )}
            </AnimatePresence>

            {/* Reason for Leave */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <TextField
                  fullWidth
                  label="Reason for Leave"
                  multiline
                  rows={4}
                  value={selectedApplication.reason || ""}
                  onChange={(e) => {
                    setSelectedApplication({
                      ...selectedApplication,
                      reason: e.target.value,
                    });
                    setValidationErrors((prev) => ({
                      ...prev,
                      reason: undefined,
                    }));
                  }}
                  error={!!validationErrors.reason}
                  helperText={validationErrors.reason}
                  placeholder="Please provide a detailed reason for your leave..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      },
                    },
                  }}
                />
              </motion.div>
            </Grid>

            {/* Attachments Section */}
            <AnimatePresence>
              {shouldShowAttachments && (
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        Supporting Documents (S3 Storage)
                        {selectedApplication.leaveType === "emergency" && (
                          <Chip
                            label="Required"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Typography>

                      {/* Display existing attachments from S3 */}
                      <AnimatePresence>
                        {existingAttachments.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <Box sx={{ mb: 3 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                                sx={{ fontWeight: 500 }}
                              >
                                Existing S3 Attachments ({existingAttachments.length})
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              
                              <AnimatePresence>
                                {existingAttachments.map((attachment, index) => (
                                  <ExistingAttachmentItem
                                    key={attachment.id}
                                    attachment={attachment}
                                    onView={handleViewExistingAttachment}
                                    onRemove={handleRemoveExistingAttachment}
                                    index={index}
                                    canDelete={!loading}
                                  />
                                ))}
                              </AnimatePresence>
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* File Upload Zone for S3 */}
                      <FileUploadZone
                        onFileDrop={handleFileUpload}
                        uploading={hasUploading}
                      >
                        <CloudUpload
                          sx={{
                            fontSize: 48,
                            color: "primary.main",
                            mb: 2,
                            opacity: hasUploading ? 0.5 : 0.7,
                          }}
                        />
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          {hasUploading
                            ? "Uploading to S3..."
                            : existingAttachments.length > 0
                            ? "Add more files to S3"
                            : "Drag & drop files here to upload to S3"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          or
                        </Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={
                            hasUploading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <AttachFile />
                            )
                          }
                          disabled={hasUploading}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                          }}
                        >
                          {hasUploading ? "Uploading to S3..." : "Browse Files"}
                          <input
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileUpload(Array.from(e.target.files))
                            }
                            disabled={hasUploading}
                          />
                        </Button>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          sx={{ mt: 2, maxWidth: 300 }}
                        >
                          Files will be uploaded to S3 • Allowed: PDF, JPG, PNG • Max 5MB per file
                        </Typography>
                      </FileUploadZone>

                      {/* Display newly uploaded files to S3 */}
                      <AnimatePresence>
                        {uploadStatesArray.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <Box sx={{ mt: 3 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                                sx={{
                                  fontWeight: 500,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                New S3 Uploads ({uploadStatesArray.length})
                                {hasUploading && (
                                  <Chip
                                    label="Uploading..."
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                )}
                              </Typography>
                              <Divider sx={{ mb: 2 }} />

                              <AnimatePresence>
                                {uploadStatesArray.map(
                                  ([fileId, state], index) => (
                                    <FileItem
                                      key={fileId}
                                      file={state.file}
                                      progress={state.progress}
                                      status={state.status}
                                      onRemove={() => removeFile(fileId)}
                                      onPreview={previewFile}
                                      index={index}
                                    />
                                  )
                                )}
                              </AnimatePresence>
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {validationErrors.attachment && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Alert
                            severity="error"
                            sx={{ mt: 2, borderRadius: 2 }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {validationErrors.attachment}
                            </Typography>
                          </Alert>
                        </motion.div>
                      )}
                    </Box>
                  </motion.div>
                </Grid>
              )}
            </AnimatePresence>

            {/* Status */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={selectedApplication.status || "Pending"}
                  onChange={(e) =>
                    setSelectedApplication({
                      ...selectedApplication,
                      status: e.target.value,
                    })
                  }
                  disabled={isNewApplication}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      transition: "all 0.3s ease",
                      "&:hover:not(.Mui-disabled)": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      },
                    },
                  }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>
                          {option}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                {isNewApplication && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    New applications are automatically set to Pending status
                  </Typography>
                )}
              </motion.div>
            </Grid>

            {/* Validation Error Messages */}
            <AnimatePresence>
              {validationErrors.balance && (
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Alert
                      severity="warning"
                      sx={{
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 152, 0, 0.1)",
                        borderLeft: "4px solid #ff9800",
                        "& .MuiAlert-message": {
                          fontWeight: 500,
                        },
                      }}
                    >
                      <Typography variant="body2">
                        {validationErrors.balance}
                      </Typography>
                    </Alert>
                  </motion.div>
                </Grid>
              )}
            </AnimatePresence>

            {/* Delete Button */}
            <AnimatePresence>
              {!isNewApplication && (
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Divider sx={{ mb: 2 }} />
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={handleEnhancedDelete}
                      disabled={loading}
                      startIcon={
                        loading ? <CircularProgress size={16} /> : <Delete />
                      }
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: 600,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
                          backgroundColor: "rgba(244, 67, 54, 0.1)",
                        },
                      }}
                    >
                      {loading ? "Deleting..." : "Delete Application"}
                    </Button>
                  </motion.div>
                </Grid>
              )}
            </AnimatePresence>
          </Grid>
        )}
      </Box>
    </motion.div>
  );

  return (
    <CommonDrawer
      open={open}
      onClose={onClose}
      width={520}
      tabs={[
        {
          label: isNewApplication
            ? "Add Application"
            : "Edit Application",
          content: drawerContent,
        },
      ]}
      footerActions={{
        primaryLabel: loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={16} color="inherit" />
            <Typography variant="button">
              {isNewApplication ? "Creating..." : "Saving..."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="button" sx={{ fontWeight: 600 }}>
              {isNewApplication ? "Create Application" : "Save Changes"}
            </Typography>
          </Box>
        ),
        primaryAction: handleEnhancedSave,
        secondaryLabel: "Cancel",
        secondaryAction: onClose,
        primaryDisabled: loading || hasUploading,
        primaryButtonProps: {
          sx: {
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            background: loading
              ? "linear-gradient(45deg, #bbb 30%, #ccc 90%)"
              : "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
            color: "white",
            "&:hover": {
              background: loading
                ? "linear-gradient(45deg, #bbb 30%, #ccc 90%)"
                : "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
              transform: loading ? "none" : "translateY(-2px)",
              boxShadow: loading
                ? "none"
                : "0 6px 16px rgba(25, 118, 210, 0.4)",
            },
            transition: "all 0.3s ease",
            "&:disabled": {
              background: "linear-gradient(45deg, #bbb 30%, #ccc 90%)",
              color: "rgba(255, 255, 255, 0.7)",
            },
          },
        },
        secondaryButtonProps: {
          sx: {
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          },
        },
      }}
    />
  );
};

export default LeaveDrawer;