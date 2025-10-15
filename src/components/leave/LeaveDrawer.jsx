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
} from "@mui/material";
import {
  AttachFile,
  Delete,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Visibility,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile,
  Download,
  Close,
} from "@mui/icons-material";
import { leaveAPI } from "../../utils/api";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000"; // Update with your backend URL

// Helper to get file extension
const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || '';
};

// Helper to get file icon based on type
const getFileIconByType = (fileName, mimeType) => {
  const extension = getFileExtension(fileName);
  
  if (mimeType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
    return <Image color="primary" />;
  }
  
  if (mimeType?.includes('pdf') || extension === 'pdf') {
    return <PictureAsPdf color="error" />;
  }
  
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension) || 
      mimeType?.includes('word') || mimeType?.includes('text')) {
    return <Description color="info" />;
  }
  
  return <InsertDriveFile color="action" />;
};

// Helper to get file type label
const getFileTypeLabel = (fileName, mimeType) => {
  const extension = getFileExtension(fileName).toUpperCase();
  
  if (mimeType?.includes('pdf') || extension === 'PDF') {
    return 'PDF';
  }
  if (mimeType?.includes('image')) {
    return 'Image';
  }
  if (mimeType?.includes('word') || ['DOC', 'DOCX'].includes(extension)) {
    return 'Document';
  }
  
  return extension || 'File';
};

// Helper to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  const mb = kb / 1024;
  return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
};

// Component for displaying existing attachments (from backend)
const ExistingAttachmentItem = ({ document, onRemove, onDownload, canDelete = true }) => {
  const getFileTypeChip = (fileName, mimeType) => {
    const label = getFileTypeLabel(fileName, mimeType);
    const extension = getFileExtension(fileName);
    
    let color = "default";
    if (['pdf'].includes(extension)) color = "error";
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) color = "primary";
    else if (['doc', 'docx', 'txt'].includes(extension)) color = "info";
    
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
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
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
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => onDownload(document.id)}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
            {canDelete && (
              <Tooltip title="Remove">
                <IconButton size="small" color="error" onClick={() => onRemove(document.id)}>
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

// File upload zone with drag & drop
const FileUploadZone = ({ onFileDrop, uploading, children }) => {
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
      const files = Array.from(e.dataTransfer.files);
      onFileDrop(files);
    },
    [onFileDrop]
  );

  return (
    <Paper
      elevation={isDragOver ? 8 : 2}
      sx={{
        border: `2px dashed ${isDragOver ? "#1976d2" : "#e0e0e0"}`,
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: uploading ? "not-allowed" : "pointer",
        backgroundColor: isDragOver ? "rgba(25, 118, 210, 0.04)" : "transparent",
        transition: "all 0.3s ease",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </Paper>
  );
};

// File item component for files being uploaded
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
          status === "success" ? "#4caf50" : status === "error" ? "#f44336" : "#e0e0e0"
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
              {status === "uploading" && ` • ${Math.round(progress || 0)}% uploading`}
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
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
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
  setSelectedApplication,
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
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [fetchingBalance, setFetchingBalance] = useState(false);

  const formData = selectedApplication || {
    durationType: "full-day",
    status: "Pending",
    leaveType: "",
    startDate: null,
    endDate: null,
    reason: "",
    halfDayType: null,
    documentId: null,
  };

  // Format leave type display name
  const formatLeaveType = (leaveType) => {
    const typeMap = {
      'casual': 'Casual Leave',
      'sick': 'Sick Leave',
      'annual': 'Annual Leave',
      'emergency': 'Emergency Leave',
      'lossOfPay': 'Loss of Pay',
      'maternity': 'Maternity Leave',
    };
    return typeMap[leaveType] || leaveType.charAt(0).toUpperCase() + leaveType.slice(1);
  };

  // Fetch leave balances
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      if (!employeeId || !open) return;
      
      setFetchingBalance(true);
      try {
        const response = await leaveAPI.getLeaveBalance(employeeId);
        if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
          const transformedBalances = response.data.map(balance => ({
            id: balance.id,
            leaveType: balance.leaveType,
            displayName: formatLeaveType(balance.leaveType),
            totalDays: parseFloat(balance.totalAllowed) || 0,
            usedDays: parseFloat(balance.used) || 0,
            carriedForward: parseFloat(balance.carryForwarded) || 0,
            year: balance.year,
            isUnlimited: balance.leaveType === 'lossOfPay' || parseFloat(balance.totalAllowed) >= 365,
          }));
          
          setLeaveBalances(transformedBalances);
        }
      } catch (error) {
        console.error("Error fetching leave balance:", error);
        onError?.("Failed to fetch leave balances");
      } finally {
        setFetchingBalance(false);
      }
    };

    fetchLeaveBalance();
  }, [employeeId, open, onError]);

  // Fetch existing document if documentId exists
  useEffect(() => {
    const fetchExistingDocument = async () => {
      if (!formData.documentId || !open) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/documents/${formData.documentId}`);
        setExistingDocuments([response.data]);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchExistingDocument();
  }, [formData.documentId, open]);

  const getLeaveBalance = (leaveType) => {
    const balance = leaveBalances.find(b => b.leaveType === leaveType);
    if (!balance) return { total: 0, used: 0, carriedForward: 0, available: 0, isUnlimited: false };
    
    const available = balance.totalDays - balance.usedDays + balance.carriedForward;
    return {
      total: balance.totalDays,
      used: balance.usedDays,
      carriedForward: balance.carriedForward,
      available: Math.max(0, available),
      isUnlimited: balance.isUnlimited,
      displayName: balance.displayName,
    };
  };

  const calculateLeaveDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (formData.durationType === "half-day") return 0.5;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const isDocumentRequired = () => {
    return formData.leaveType === "emergency";
  };

  const handleFieldChange = (field, value) => {
    setSelectedApplication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Upload file to backend
  const uploadFileToBackend = async (file) => {
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents/upload`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles(prev => 
              prev.map(f => f.file.name === file.name ? { ...f, progress } : f)
            );
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0,
      status: "uploading",
      id: `${file.name}-${Date.now()}`
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files one by one
    for (const file of validFiles) {
      try {
        const uploadedDocument = await uploadFileToBackend(file);
        
        // Update status to success
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file.name === file.name 
              ? { ...f, status: "success", documentId: uploadedDocument.id }
              : f
          )
        );

        // Store document ID in form data (only one document supported)
        handleFieldChange('documentId', uploadedDocument.id);
        
        // Add to existing documents
        setExistingDocuments([uploadedDocument]);

      } catch (error) {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file.name === file.name 
              ? { ...f, status: "error" }
              : f
          )
        );
        onError?.(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveUploadingFile = (fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      window.open(`${API_BASE_URL}/documents/${documentId}/download`, '_blank');
    } catch (error) {
      onError?.("Failed to download document");
    }
  };

  const handleRemoveExistingDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    
    try {
      // Remove document from backend
      await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
      
      // Remove from state
      setExistingDocuments([]);
      handleFieldChange('documentId', null);
      
      onSuccess?.("Document removed successfully");
    } catch (error) {
      onError?.("Failed to remove document");
    }
  };

  const handleSubmit = async () => {
    // Validation
    const errors = {};
    if (!formData.leaveType) errors.leaveType = "Leave type is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.endDate) errors.endDate = "End date is required";
    if (!formData.reason?.trim()) errors.reason = "Reason is required";

    // Validate leave balance
    if (formData.leaveType) {
      const balance = getLeaveBalance(formData.leaveType);
      const requestedDays = calculateLeaveDays();
      
      if (!balance.isUnlimited && requestedDays > balance.available) {
        errors.leaveType = `Insufficient balance. Available: ${balance.available} days`;
      }

      // Validate document requirement
      if (isDocumentRequired() && !formData.documentId) {
        errors.attachments = "Document is required for Emergency Leave";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
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
        reason: formData.reason,
        status: formData.status,
        isHalfDay: formData.durationType === "half-day",
        halfDayType: formData.durationType === "half-day" ? formData.halfDayType : null,
        documentId: formData.documentId, // Send document ID
      };

      // Call your leave creation/update API
      if (isNewApplication) {
        await leaveAPI.createLeave(submitData);
      } else {
        await leaveAPI.updateLeave(formData.id, submitData);
      }
      
      onSuccess?.("Leave application submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      onError?.("Failed to submit leave application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 600 },
          p: 3,
        },
      }}
    >
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="600">
            {isNewApplication ? "New Leave Application" : "Edit Leave Application"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Leave Type"
              value={formData.leaveType || ""}
              onChange={(e) => {
                handleFieldChange("leaveType", e.target.value);
                setValidationErrors(prev => ({ ...prev, leaveType: null }));
              }}
              error={!!validationErrors.leaveType}
              helperText={validationErrors.leaveType}
              disabled={fetchingBalance}
            >
              {fetchingBalance ? (
                <MenuItem disabled>Loading leave types...</MenuItem>
              ) : leaveBalances.length === 0 ? (
                <MenuItem disabled>No leave types available</MenuItem>
              ) : (
                leaveBalances
                  .filter(balance => {
                    const available = balance.totalDays - balance.usedDays + balance.carriedForward;
                    return balance.isUnlimited || available > 0;
                  })
                  .map((balance) => {
                    const available = balance.isUnlimited 
                      ? "Unlimited" 
                      : `${(balance.totalDays - balance.usedDays + balance.carriedForward).toFixed(1)} days`;
                    
                    return (
                      <MenuItem key={balance.id} value={balance.leaveType}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>{balance.displayName}</span>
                          <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '12px' }}>
                            {available}
                          </span>
                        </Box>
                      </MenuItem>
                    );
                  })
              )}
            </TextField>

            {formData.leaveType && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="600" mb={1}>
                  Leave Balance for {getLeaveBalance(formData.leaveType).displayName}
                </Typography>
                {(() => {
                  const balance = getLeaveBalance(formData.leaveType);
                  const requestedDays = calculateLeaveDays();
                  
                  if (balance.isUnlimited) {
                    return (
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          ✓ Unlimited leaves available
                        </Typography>
                        {requestedDays > 0 && (
                          <Typography variant="body2" color="primary.main">
                            Requesting: <strong>{requestedDays} days</strong>
                          </Typography>
                        )}
                      </Stack>
                    );
                  }
                  
                  return (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Available Balance</Typography>
                        <Typography 
                          variant="h6" 
                          fontWeight="700"
                          color={balance.available > 0 ? "success.main" : "error.main"}
                        >
                          {balance.available.toFixed(1)} days
                        </Typography>
                      </Grid>
                      {requestedDays > 0 && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Requesting</Typography>
                          <Typography variant="body2" fontWeight="600" color="primary.main">
                            {requestedDays.toFixed(1)} days
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  );
                })()}
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Duration Type</FormLabel>
              <RadioGroup
                row
                value={formData.durationType || "full-day"}
                onChange={(e) => handleFieldChange("durationType", e.target.value)}
              >
                <FormControlLabel value="full-day" control={<Radio />} label="Full Day" />
                <FormControlLabel value="half-day" control={<Radio />} label="Half Day" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {formData.durationType === "half-day" && (
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Half Day Type</FormLabel>
                <RadioGroup
                  row
                  value={formData.halfDayType || ""}
                  onChange={(e) => handleFieldChange("halfDayType", e.target.value)}
                >
                  <FormControlLabel value="first-half" control={<Radio />} label="First Half" />
                  <FormControlLabel value="second-half" control={<Radio />} label="Second Half" />
                </RadioGroup>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={formData.startDate || ""}
              onChange={(e) => handleFieldChange("startDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!validationErrors.startDate}
              helperText={validationErrors.startDate}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={formData.endDate || ""}
              onChange={(e) => handleFieldChange("endDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!validationErrors.endDate}
              helperText={validationErrors.endDate}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason"
              value={formData.reason || ""}
              onChange={(e) => handleFieldChange("reason", e.target.value)}
              error={!!validationErrors.reason}
              helperText={validationErrors.reason}
            />
          </Grid>

          {(isDocumentRequired() || existingDocuments.length > 0 || uploadingFiles.length > 0) && (
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="600">
                  Attachments {isDocumentRequired() && <span style={{ color: '#d32f2f' }}>*</span>}
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

              {isDocumentRequired() && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Document Required:</strong> Supporting documents must be uploaded for Emergency Leave.
                </Alert>
              )}

              {validationErrors.attachments && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {validationErrors.attachments}
                </Alert>
              )}

              {/* Show existing documents */}
              {existingDocuments.map((doc) => (
                <ExistingAttachmentItem
                  key={doc.id}
                  document={doc}
                  onRemove={handleRemoveExistingDocument}
                  onDownload={handleDownloadDocument}
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

              {/* Upload zone - only show if no document exists */}
              {!formData.documentId && (
                <FileUploadZone onFileDrop={handleFileUpload} uploading={loading}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="file-upload"
                    onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                  />
                  <label htmlFor="file-upload">
                    <Box sx={{ cursor: 'pointer' }}>
                      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        Drag and drop file here or click to browse
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Maximum file size: 10MB • Accepted formats: PDF, DOC, DOCX, JPG, PNG
                      </Typography>
                    </Box>
                  </label>
                </FileUploadZone>
              )}
            </Grid>
          )}
        </Grid>

        <Stack direction="row" spacing={2} mt={4}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || uploadingFiles.some(f => f.status === "uploading")}
          >
            {loading ? <CircularProgress size={24} /> : isNewApplication ? "Submit" : "Update"}
          </Button>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default LeaveDrawer;