import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import { Home, Plus } from 'lucide-react';
import CommonDrawer from '../common/Drawer';
import { 
  fetchleavesEntries, 
//   updateleavesEntry, 
//   createleavesEntry,
  deleteleavesEntry
} from '../../utils/api'
import Toast from '../common/Toast';
import '../../styles/leave.css';
import DataTable from '../common/DataTable';


const LeavesView = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isNewApplication, setIsNewApplication] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const leaveTypeOptions = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'];
  const statusOptions = ['Pending', 'Approved', 'Rejected']; // Added status options

  const columns = [
    { field: 'type', headerName: 'Leave Type' },
    { field: 'startDate', headerName: 'Start Date' },
    { field: 'endDate', headerName: 'End Date' },
    { field: 'reason', headerName: 'Reason' },
    { field: 'status', headerName: 'Status' },
    { field: 'days', headerName: 'Days' },
  ];

  // Define color mapping for statuses
  const statusColorMap = {
    Approved: '#4CAF50', // Green
    Pending: '#FFC107', // Yellow
    Rejected: '#F44336', // Red
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      const data = await fetchleavesEntries();
      setLeaveApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load leave data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

//   const handleEditClick = (application) => {
//     setSelectedApplication({ ...application });
//     setIsNewApplication(false);
//     setDrawerOpen(true);
//   };

  const handleAddNew = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedApplication({
      id: null,
      type: 'Annual',
      startDate: today,
      endDate: today,
      reason: '',
      status: 'Pending' // Default status for new applications
    });
    setIsNewApplication(true);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedApplication(null);
    setIsNewApplication(false);
  };

  const handleSaveChanges = async () => {
    try {
    //   let updatedApplication;
      if (isNewApplication) {
        // updatedApplication = await createleavesEntry(selectedApplication);
        setNotification({
          open: true,
          message: 'Leave application created successfully',
          severity: 'success'
        });
      } else {
        // updatedApplication = await updateleavesEntry(selectedApplication);
        setNotification({
          open: true,
          message: 'Leave application updated successfully',
          severity: 'success'
        });
      }
      await loadLeaveData();
      handleCloseDrawer();
    } catch (err) {
      setNotification({
        open: true,
        message: isNewApplication ? 'Failed to create application' : 'Failed to update application',
        severity: 'error'
      });
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplication || !selectedApplication.id) return;
    try {
      await deleteleavesEntry(selectedApplication.id);
      setNotification({
        open: true,
        message: 'Leave application deleted successfully',
        severity: 'success'
      });
      await loadLeaveData();
      handleCloseDrawer();
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to delete application',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const drawerContent = (
    <Box className="leave-edit-form">
      {selectedApplication && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" className="form-title">
              {isNewApplication ? 'Add New Leave Application' : 'Edit Leave Application'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Leave Type"
              value={selectedApplication.type}
              onChange={(e) => setSelectedApplication({ ...selectedApplication, type: e.target.value })}
            >
              {leaveTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={selectedApplication.startDate}
              onChange={(e) => setSelectedApplication({ ...selectedApplication, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={selectedApplication.endDate}
              onChange={(e) => setSelectedApplication({ ...selectedApplication, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Leave"
              multiline
              rows={4}
              value={selectedApplication.reason}
              onChange={(e) => setSelectedApplication({ ...selectedApplication, reason: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Status"
              value={selectedApplication.status}
              onChange={(e) => setSelectedApplication({ ...selectedApplication, status: e.target.value })}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {!isNewApplication && (
            <Grid item xs={12}>
              <Button
                variant="outlined" 
                color="error" 
                fullWidth
                onClick={handleDeleteApplication}
              >
                Delete Application
              </Button>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box className="leave-container">
      <Box className="leave-header">
        <Typography variant="h4" component="h1">
          Leave Applications
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<Plus size={16} />}
            onClick={handleAddNew}
            className="add-button"
          >
            Add Application
          </Button>
          <IconButton className="home-button" aria-label="home">
            <Home />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
      )}
       <DataTable
        columns={columns}
        data={leaveApplications}
        loading={loading}
        error={error}
        statusColorMap={statusColorMap}
      />
      
      
      <CommonDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        width={400}
        tabs={[
          { label: isNewApplication ? "Add Application" : "Edit Application", content: drawerContent }
        ]}
        footerActions={{
          primaryLabel: isNewApplication ? "Create Application" : "Save Changes",
          primaryAction: handleSaveChanges,
          secondaryLabel: "Cancel",
          secondaryAction: handleCloseDrawer
        }}
      />
      
      <Toast
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default LeavesView;