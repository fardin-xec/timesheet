import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Plus } from 'lucide-react';
import { useLeaveManagement } from '../../redux/hooks/useLeaveManagement';
import LeaveTable from './LeaveTable';
import LeaveDrawer from './LeaveDrawer';
import Toast from '../common/Toast';
import '../../styles/leave.css';

const LeaveContainer = () => {
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const employeeId = user?.employee?.id;
  const role = user?.role;

  const {
    leaveApplications,
    loading,
    error,
    drawerOpen,
    selectedApplication,
    isNewApplication,
    notification,
    handleAddNew,
    handleEditClick,
    handleCloseDrawer,
    handleDeleteApplication,
    handleCloseNotification,
    handleSearch,
    handleSort,
    handleRefresh,
    leaveTypeOptions,
    statusOptions,
    statusColorMap,
    setSelectedApplication,
  } = useLeaveManagement(role,employeeId);

  return (
    <Box className="leave-container">
      <Box className="leave-header">
        <Typography variant="h5" component="h1">
          
            Leave Applications
        </Typography>
        {role !== 'superadmin' && (
          <Box>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={handleAddNew}
              className="add-button"
            >
              Add Application
            </Button>
           
          </Box>
        )}
      </Box>

      <LeaveTable
        leaveApplications={leaveApplications}
        loading={loading}
        error={error}
        statusColorMap={statusColorMap}
        onRowClick={role === 'superadmin' ? undefined : handleEditClick}
        onSearch={handleSearch}
        onSort={handleSort}
        onRefresh={handleRefresh}
        searchable={true}
        sortable={true}
        pagination={true}
      />

      <LeaveDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        selectedApplication={selectedApplication}
        setSelectedApplication={setSelectedApplication}
        isNewApplication={isNewApplication}
        leaveTypeOptions={leaveTypeOptions}
        statusOptions={statusOptions}
        handleDeleteApplication={handleDeleteApplication}
        employeeId={employeeId}
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

export default LeaveContainer;