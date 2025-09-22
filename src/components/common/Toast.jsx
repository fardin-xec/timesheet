// src/components/common/Toast.js
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import '../../styles/toast.css'; // Import the CSS file

const Toast = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000} // Auto-hide after 6 seconds
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      className="toast-container"
    >

      <Alert
        onClose={onClose}
        severity={severity}
        className={`toast-alert toast-${severity}`}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;