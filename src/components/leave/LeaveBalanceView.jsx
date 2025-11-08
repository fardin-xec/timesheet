import React, { useState, useEffect } from "react";
import { Box, Typography, Alert, CircularProgress, Paper, Grid, Card, CardContent } from "@mui/material";
import { CheckCircle, Cancel, TrendingUp } from '@mui/icons-material';
import DataTable from "../common/DataTable";
import { leaveAPI } from "../../utils/api";

const LeaveBalanceView = ({ employeeId }) => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBalances = async () => {
      if (!employeeId) {
        setError("Employee ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await leaveAPI.getLeaveBalance(employeeId);
        
        // Handle response structure
        if (response?.statusCode === 200 && response?.data) {
          const balanceData = Array.isArray(response.data) ? response.data : [];
          setBalances(balanceData);
        } else if (response?.statusCode === 404) {
          setBalances([]);
          setError("No leave balance found. Please contact HR.");
        } else {
          setBalances([]);
        }
      } catch (err) {
        console.error("Error loading leave balances:", err);
        setBalances([]);
        setError(err.message || "Failed to load leave balances");
      } finally {
        setLoading(false);
      }
    };

    loadBalances();
  }, [employeeId]);

  // Format leave type for display
  const formatLeaveType = (leaveType) => {
    const typeMap = {
      'casual': 'Casual Leave',
      'sick': 'Sick Leave',
      'annual': 'Annual Leave',
      'emergency': 'Emergency Leave',
      'lossOfPay': 'Loss of Pay',
      'maternity': 'Maternity Leave',
      'paternity': 'Paternity Leave',
    };
    return typeMap[leaveType] || leaveType.charAt(0).toUpperCase() + leaveType.slice(1);
  };

  // Calculate remaining balance
  const calculateRemaining = (row) => {
    const total = parseFloat(row.totalAllowed) || 0;
    const used = parseFloat(row.used) || 0;
    return (total - used ).toFixed(2);
  };

  // Calculate usage percentage
  const calculateUsagePercentage = (row) => {
    const total = parseFloat(row.totalAllowed) || 0;
    const used = parseFloat(row.used) || 0;
    if (total === 0) return 0;
    return ((used / total) * 100).toFixed(1);
  };

  const columns = [
    { 
      field: "leaveType", 
      headerName: "Leave Type", 
      sortable: true,
      headerAlign: "center",
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={500}>
          {formatLeaveType(row.leaveType)}
        </Typography>
      )
    },
    { 
      field: "year", 
      headerName: "Year", 
      sortable: true,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "totalAllowed", 
      headerName: "Total Entitled", 
      sortable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => (
        <Typography variant="body2">
          {parseFloat(row.totalAllowed).toFixed(1)} days
        </Typography>
      )
    },
    { 
      field: "used", 
      headerName: "Availed", 
      sortable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => (
        <Typography variant="body2" color="error.main">
          {parseFloat(row.used).toFixed(1)} days
        </Typography>
      )
    },
    { 
      field: "carryForwarded", 
      headerName: "Carry Forward", 
      sortable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => (
        <Typography variant="body2" color="info.main">
          {parseFloat(row.carryForwarded).toFixed(1)} days
        </Typography>
      )
    },
    {
      field: "remaining",
      headerName: "Balance",
      sortable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        const remaining = calculateRemaining(row);
        return (
          <Typography 
            variant="body2" 
            fontWeight={600}
            color={parseFloat(remaining) > 0 ? "success.main" : "error.main"}
          >
            {remaining} days
          </Typography>
        );
      }
    },
    {
      field: "usage",
      headerName: "Usage %",
      sortable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        const percentage = calculateUsagePercentage(row);
        return (
          <Typography 
            variant="body2"
            color={parseFloat(percentage) > 80 ? "error.main" : "text.secondary"}
          >
            {percentage}%
          </Typography>
        );
      }
    },
  ];

  // Calculate summary statistics
  const summary = balances.reduce((acc, balance) => {
    const total = parseFloat(balance.totalAllowed) || 0;
    const used = parseFloat(balance.used) || 0;
    const carryForward = parseFloat(balance.carryForwarded) || 0;
    const remaining = total - used + carryForward;

    return {
      totalEntitled: acc.totalEntitled + total,
      totalUsed: acc.totalUsed + used,
      totalRemaining: acc.totalRemaining + remaining,
      totalCarryForward: acc.totalCarryForward + carryForward,
    };
  }, { totalEntitled: 0, totalUsed: 0, totalRemaining: 0, totalCarryForward: 0 });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" mb={3} fontWeight={600}>
        Leave Balance Overview
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {balances.length > 0 && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Entitled
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="primary.main">
                      {summary.totalEntitled.toFixed(1)}
                    </Typography>
                    <Typography variant="caption">days</Typography>
                  </Box>
                  <CheckCircle color="primary" sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Used
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="error.main">
                      {summary.totalUsed.toFixed(1)}
                    </Typography>
                    <Typography variant="caption">days</Typography>
                  </Box>
                  <Cancel color="error" sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Carry Forward
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="info.main">
                      {summary.totalCarryForward.toFixed(1)}
                    </Typography>
                    <Typography variant="caption">days</Typography>
                  </Box>
                  <TrendingUp color="info" sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Balance
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="success.main">
                      {summary.totalRemaining.toFixed(1)}
                    </Typography>
                    <Typography variant="caption">days available</Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Data Table */}
      <Paper elevation={2}>
        <DataTable
          columns={columns}
          data={balances}
          loading={loading}
          error={error}
          searchable={true}
          sortable={true}
          pagination={true}
          pageSize={10}
          emptyStateMessage="No leave balances found. Please contact HR to initialize your leave balance."
          stickyHeader={true}
        />
      </Paper>
    </Box>
  );
};

export default LeaveBalanceView;