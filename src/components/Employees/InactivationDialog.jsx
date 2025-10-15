import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { AlertCircle } from "lucide-react";
import "../../styles/InactivationDialog.css"; // Import the CSS file

// Inactivation Dialog Component
const InactivationDialog = ({ open, onClose, onConfirm, loading, employee }) => {
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});

  const inactivationReasons = [
    { value: "resignation", label: "Resignation" },
    { value: "termination", label: "Termination" },
    { value: "retirement", label: "Retirement" },
    { value: "long_leave", label: "Long Leave" },
    { value: "contract_ended", label: "Contract Ended" },
    { value: "other", label: "Other" },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!reason) {
      newErrors.reason = "Reason is required";
    }
    
    if (reason === "other" && !remarks.trim()) {
      newErrors.remarks = "Remarks are required when reason is 'Other'";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(reason, remarks);
    }
  };

  const handleClose = () => {
    setReason("");
    setRemarks("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      className="inactivation-dialog"
    >
      <DialogTitle className="inactivation-dialog-title">
        <AlertCircle className="inactivation-dialog-title-icon" size={24} />
        <span className="inactivation-dialog-title-text">Mark Employee as Inactive</span>
      </DialogTitle>
      
      <DialogContent className="inactivation-dialog-content">
        <div className="inactivation-form-container">
          {employee && (
            <Typography className="inactivation-dialog-description">
              You are about to mark <strong>{employee.firstName} {employee.lastName}</strong> as inactive.
            </Typography>
          )}

          <FormControl fullWidth error={!!errors.reason} className="inactivation-form-field">
            <InputLabel>Reason for Inactivation *</InputLabel>
            <Select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors({ ...errors, reason: "" });
              }}
              label="Reason for Inactivation *"
            >
              {inactivationReasons.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.reason && (
              <Typography variant="caption" color="error" className="inactivation-error-text">
                {errors.reason}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label={reason === "other" ? "Remarks *" : "Remarks (Optional)"}
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setErrors({ ...errors, remarks: "" });
            }}
            error={!!errors.remarks}
            helperText={errors.remarks || "Provide additional details about the inactivation"}
            placeholder="Enter remarks..."
            className="inactivation-form-field"
          />
        </div>
      </DialogContent>

      <DialogActions className="inactivation-dialog-actions">
        <Button onClick={handleClose} disabled={loading} className="inactivation-btn inactivation-btn-cancel">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} className="inactivation-spinner" />}
          className="inactivation-btn inactivation-btn-confirm"
        >
          {loading ? "Processing..." : "Mark as Inactive"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InactivationDialog;