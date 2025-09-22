import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "../common/DataTable";
import { fetchLeaveBalance } from "../../utils/api";

const LeaveBalanceView = ({ employeeId }) => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBalances = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaveBalance(employeeId);
        console.log("hello");
        console.log(data);
        setBalances(data);
        setError(null);
      } catch (err) {
        setBalances([]);
        setError("Failed to load leave balances");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBalances();
  }, [employeeId]);

  const columns = [
    { 
      field: "leaveType", 
      headerName: "Leave Type", 
      sortable: true,
      headerAlign: "center"
    },
    { 
      field: "year", 
      headerName: "Year", 
      sortable: true,
      headerAlign: "center"
    },
    { 
      field: "totalAllowed", 
      headerName: "Total Entitled", 
      sortable: true,
      headerAlign: "center"
    },
    { 
      field: "used", 
      headerName: "Availed", 
      sortable: true,
      headerAlign: "center"
    },
    { 
      field: "carryForwarded", 
      headerName: "Carry Forward", 
      sortable: true,
      headerAlign: "center"
    },
    {
      field: "remaining",
      headerName: "Balance",
      sortable: true,
      headerAlign: "center",
      renderCell: ({ row }) => (row.totalAllowed - row.used).toFixed(2),
    },
  ];

  return (
    <Box
      sx={{
        padding: "20px",
      }}
    >
      <Typography variant="h5" mb={2}>
        Leave Balances
      </Typography>
      <DataTable
        columns={columns}
        data={balances}
        loading={loading}
        error={error}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={5}
        emptyStateMessage="No leave balances found"
        stickyHeader={true}
      />
    </Box>
  );
};

export default LeaveBalanceView;