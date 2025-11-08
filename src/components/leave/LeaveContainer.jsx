import React, { useState, useEffect ,useCallback } from 'react';
import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { Plus } from 'lucide-react';
import { leaveAPI } from '../../utils/api';
import LeaveTable from './LeaveTable';
import LeaveDrawer from './LeaveDrawer';
import LeaveBalanceView from './LeaveBalanceView';
import Toast from '../common/Toast';
import '../../styles/leave.css';

const LeaveContainer = () => {
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  const employeeId = user?.employee?.id;
  const role = user?.role;

  // State management
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isNewApplication, setIsNewApplication] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Configuration
  const statusOptions = ["Pending", "Approved", "Rejected"];
  const statusColorMap = {
    pending: '#FFA726',
    approved: '#66BB6A',
    rejected: '#EF5350',
    // Capitalized versions for backward compatibility
    Pending: '#FFA726',
    Approved: '#66BB6A',
    Rejected: '#EF5350'
  };

  // Fetch leave applications
  const fetchLeaveApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching leaves for role:', role);
      console.log('🔍 Employee ID:', employeeId);

      let response;
      if (role === 'admin') {
        // Admin sees all leaves
        response = await leaveAPI.getAllLeaves();
      } else {
        // User sees their own leaves
        response = await leaveAPI.getMyLeaves();
      }

      console.log('📦 Raw API Response:', response);
      console.log('📦 Response statusCode:', response?.statusCode);
      console.log('📦 Response data:', response?.data);

      // Handle response structure
      if (response?.statusCode === 200 && response?.data) {
        const leaves = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Leaves array length:', leaves.length);
        console.log('✅ First leave item:', leaves[0]);
        
        // Transform the data to ensure proper format
        const transformedLeaves = leaves.map(leave => ({
          ...leave,
          // Ensure dates are in proper format
          startDate: leave.startDate ? leave.startDate.split('T')[0] : '',
          endDate: leave.endDate ? leave.endDate.split('T')[0] : '',
          // Normalize status (API returns lowercase, UI might expect capitalized)
          status: leave.status || 'pending',
          displayStatus: leave.status ? 
            leave.status.charAt(0).toUpperCase() + leave.status.slice(1) : 
            'Pending',
          // Format leave type for display
          displayLeaveType: formatLeaveTypeName(leave.leaveType),
          // Parse numeric values
          appliedDays: parseFloat(leave.appliedDays) || 0,
          // Employee info
          employeeName: leave.employee ? 
            `${leave.employee.firstName} ${leave.employee.lastName}` : 
            'Unknown',
          employeeId: leave.employee?.employeeId || leave.employeeId
        }));
        
        console.log('🔄 Transformed leaves:', transformedLeaves);
        setLeaveApplications(transformedLeaves);
      } else {
        console.warn('⚠️ Invalid response structure or no data');
        console.log('Response:', response);
        setLeaveApplications([]);
      }
    } catch (err) {
      console.error('❌ Error fetching leaves:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError(err.message || 'Failed to load leave applications');
      setLeaveApplications([]);
    } finally {
      setLoading(false);
    }
  }, [role, employeeId]);

  // Helper function to format leave type names
  const formatLeaveTypeName = (leaveType) => {
    const nameMap = {
      'casual': 'Casual Leave',
      'sick': 'Sick Leave',
      'annual': 'Annual Leave',
      'emergency': 'Emergency Leave',
      'lossOfPay': 'Loss of Pay',
    };
    return nameMap[leaveType] || 
      (leaveType ? leaveType.charAt(0).toUpperCase() + leaveType.slice(1) : 'Unknown');
  };

  // Initial load
  useEffect(() => {
    if (employeeId) {
      fetchLeaveApplications();
    }
  }, [employeeId, fetchLeaveApplications]);


  // Handler functions
  const handleAddNew = () => {
    setSelectedApplication({
      employeeId: employeeId,
      durationType: "full-day",
      status: "pending",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      halfDayType: null,
      documentId: null,
      isHalfDay: false,
    });
    setIsNewApplication(true);
    setDrawerOpen(true);
  };

  const handleEditClick = (application) => {
    // Ensure dates are properly formatted for input fields
    const formattedApp = {
      ...application,
      startDate: application.startDate?.split('T')[0] || '',
      endDate: application.endDate?.split('T')[0] || '',
      durationType: application.isHalfDay ? 'half-day' : 'full-day',
      // Use the original employeeId (numeric ID, not the string like "AT-0001")
      employeeId: application.employeeId || employeeId,
    };
    setSelectedApplication(formattedApp);
    setIsNewApplication(false);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    // Clear selection after a small delay to prevent glitching
    setTimeout(() => {
      setSelectedApplication(null);
      setIsNewApplication(false);
    }, 200);
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave application?')) {
      return;
    }

    try {
      await leaveAPI.deleteLeaveApplication(id);
      showNotification('Leave application deleted successfully', 'success');
      fetchLeaveApplications();
      handleCloseDrawer();
    } catch (err) {
      showNotification(err.message || 'Failed to delete leave application', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSearch = (searchTerm) => {
    // Implement search logic if needed
    console.log('Search:', searchTerm);
  };

  const handleSort = (field, direction) => {
    // Implement sort logic if needed
    console.log('Sort:', field, direction);
  };

  const handleRefresh = () => {
    fetchLeaveApplications();
  };

  const handleSuccess = (message) => {
    showNotification(message, 'success');
    fetchLeaveApplications();
  };

  const handleError = (message) => {
    showNotification(message, 'error');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="leave-container">
      <Box className="leave-header">
        <Typography variant="h5" component="h1">
          Leave Management
        </Typography>
        {role !== 'admin' && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleAddNew}
            className="add-button"
          >
            Apply for Leave
          </Button>
        )}
      </Box>

      {/* Tabs for switching between applications and balance */}
      {role !== 'admin' && (
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="My Leave Applications" />
          <Tab label="Leave Balance" />
        </Tabs>
      )}

      {/* Tab panels */}
      {activeTab === 0 ? (
        <LeaveTable
          leaveApplications={leaveApplications}
          loading={loading}
          error={error}
          statusColorMap={statusColorMap}
          onRowClick={role === 'admin' ? undefined : handleEditClick}
          onSearch={handleSearch}
          onSort={handleSort}
          onRefresh={handleRefresh}
          searchable={true}
          sortable={true}
          pagination={true}
        />
      ) : (
        <LeaveBalanceView employeeId={employeeId} />
      )}

      <LeaveDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        selectedApplication={selectedApplication}
        isNewApplication={isNewApplication}
        statusOptions={statusOptions}
        handleDeleteApplication={handleDeleteApplication}
        employeeId={employeeId}
        onSuccess={handleSuccess}
        onError={handleError}
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