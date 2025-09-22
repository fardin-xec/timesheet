
import { useState, useEffect, useCallback } from 'react';
import {
  fetchLeavesEntries,
  createLeaveEntry,
  updateLeaveEntry,
  deleteLeaveEntry,
} from '../../utils/api';

export const useLeaveManagement = (role,employeeId) => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isNewApplication, setIsNewApplication] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const leaveTypeOptions = ['casual', 'sick', 'earned', 'maternity', 'paternity', 'bereavement', 'loss Of Pay','emergency'];
  const statusOptions = ['pending', 'approved', 'rejected', 'cancelled'];
  const statusColorMap = {
    approved: '#4CAF50',
    pending: '#FFC107',
    rejected: '#F44336',
    cancelled: '#9E9E9E',
  };

  const loadLeaveData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLeavesEntries(role,employeeId);
      setLeaveApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load leave data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role,employeeId]);

  useEffect(() => {
    loadLeaveData();
  }, [loadLeaveData]);

  const handleAddNew = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedApplication({
      id: null,
      employeeId: employeeId,
      leaveType: 'casual',
      startDate: today,
      endDate: today,
      reason: '',
      status: 'pending',
    });
    setIsNewApplication(true);
    setDrawerOpen(true);
  };

  const handleEditClick = (application) => {
    setSelectedApplication({ ...application });
    setIsNewApplication(false);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedApplication(null);
    setIsNewApplication(false);
  };

  // const handleSaveChanges = async () => {
  //   try {
  //     if (isNewApplication) {
  //       await createLeaveEntry(selectedApplication);
  //       setNotification({
  //         open: true,
  //         message: 'Leave application created successfully',
  //         severity: 'success',
  //       });
  //     } else {
  //       await updateLeaveEntry(selectedApplication);
  //       setNotification({
  //         open: true,
  //         message: 'Leave application updated successfully',
  //         severity: 'success',
  //       });
  //     }
  //     await loadLeaveData();
  //     handleCloseDrawer();
  //   } catch (err) {
  //     setNotification({
  //       open: true,
  //       message: isNewApplication ? 'Failed to create application' : 'Failed to update application',
  //       severity: 'error',
  //     });
  //   }
  // };

  const handleDeleteApplication = async () => {
    console.log(selectedApplication);
    
    if (!selectedApplication || !selectedApplication.id) return;
    try {
      await deleteLeaveEntry(selectedApplication.id);
      setNotification({
        open: true,
        message: 'Leave application deleted successfully',
        severity: 'success',
      });
      await loadLeaveData();
      handleCloseDrawer();
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to delete application',
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSearch = (term) => {
    // Client-side search handled by DataTable
  };

  const handleSort = (field, direction) => {
    // Client-side sorting handled by DataTable
  };

  const handleRefresh = () => {
    loadLeaveData();
  };

  return {
    leaveApplications,
    loading,
    error,
    drawerOpen,
    selectedApplication,
    setSelectedApplication,
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
  };
};
