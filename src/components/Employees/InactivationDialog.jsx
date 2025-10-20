import React, { useState, useEffect } from "react";
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
import "../../styles/InactivationDialog.css";

// Inactivation Dialog Component
const InactivationDialog = ({ open, onClose, onConfirm, loading, employee }) => {
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [inactivationDate, setInactivationDate] = useState("");
  const [errors, setErrors] = useState({});

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const inactivationReasons = [
    { value: "resignation", label: "Resignation" },
    { value: "termination", label: "Termination" },
    { value: "retirement", label: "Retirement" },
    { value: "long_leave", label: "Long Leave" },
    { value: "contract_ended", label: "Contract Ended" },
    { value: "other", label: "Other" },
  ];

  // Clear all data when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset all fields when dialog is closed
      setReason("");
      setRemarks("");
      setInactivationDate("");
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors = {};
    const today = getTodayDate();
    
    if (!reason) {
      newErrors.reason = "Reason is required";
    }
    
    if (reason === "other" && !remarks.trim()) {
      newErrors.remarks = "Remarks are required when reason is 'Other'";
    }
    
    if (!inactivationDate) {
      newErrors.inactivationDate = "Inactivation date is required";
    } else if (inactivationDate < today) {
      newErrors.inactivationDate = "Inactivation date cannot be in the past";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(reason, remarks, inactivationDate);
    }
  };

  const handleClose = () => {
    // Clear all form data
    setReason("");
    setRemarks("");
    setInactivationDate("");
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
        <h2 className="inactivation-dialog-title-text">
          Mark Employee as Inactive
        </h2>
      </DialogTitle>

      <DialogContent className="inactivation-dialog-content">
        {employee && (
          <Typography className="inactivation-dialog-description">
            You are about to mark <strong>{employee.firstName} {employee.lastName}</strong> as inactive.
          </Typography>
        )}

        <div className="inactivation-form-container">
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
              <Typography variant="caption" className="inactivation-error-text">
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

          <TextField
            fullWidth
            type="date"
            label="Inactivation Date *"
            value={inactivationDate}
            onChange={(e) => {
              setInactivationDate(e.target.value);
              setErrors({ ...errors, inactivationDate: "" });
            }}
            error={!!errors.inactivationDate}
            helperText={errors.inactivationDate || "Select the date of inactivation (today or future date)"}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: getTodayDate(),
            }}
            className="inactivation-form-field"
          />
        </div>
      </DialogContent>

      <DialogActions className="inactivation-dialog-actions">
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} className="inactivation-spinner" />}
        >
          {loading ? "Processing..." : "Mark as Inactive"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InactivationDialog;