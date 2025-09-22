import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="delete-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description" style={{marginLeft: "1.5rem"}}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {confirmText}
          {loading && (
            <CircularProgress size={24} sx={{ position: 'absolute' }} />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;