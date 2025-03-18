import React, { useState } from 'react';
import { Button, Typography, Paper, Box } from '@mui/material';
import { Download } from '@mui/icons-material';
import DataTable from '../common/DataTable'; // Import the DataTable component
import CommonDrawer from '../common/Drawer'; // Import the CommonDrawer component
import '../../styles/payroll.css'; // Import the CSS file

const PayrollView = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const payrollData = {
    period: '01/01/2019 - 31/01/2019',
    totalCost: '¥1,25,23,654.00',
    employees: [
      { id: 'ID12345', name: 'Meera Krishnan', paidDays: 31, netPay: '¥28,844.00', paymentMode: 'Bank Transfer', paymentStatus: 'Yet To Pay' },
      { id: 'ID22787', name: 'Rohit Vihari', paidDays: 31, netPay: '¥73,722.00', paymentMode: 'Cheque', paymentStatus: 'Yet To Pay' },
      { id: 'ID00010', name: 'Kartik Kumar', paidDays: 31, netPay: '¥89,222.00', paymentMode: 'Bank Transfer', paymentStatus: 'Yet To Pay' },
    ],
    taxesAndDeductions: {
      taxes: '¥22,78,978.00',
      preTaxDeductions: '¥18,34,789.00',
      postTaxDeductions: '¥1,23,450.00',
    },
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedEmployee(null);
  };

  const columns = [
    { field: 'name', headerName: 'EMPLOYEE NAME', sortable: true },
    { field: 'paidDays', headerName: 'PAID DAYS', sortable: true },
    { field: 'netPay', headerName: 'NET PAY', sortable: true },
    { field: 'paymentMode', headerName: 'PAYMENT MODE', sortable: true },
    { field: 'paymentStatus', headerName: 'PAYMENT STATUS', sortable: true },
  ];

  const drawerTabs = [
    {
      label: "Employee Details",
      content: (
        <Box>
          {selectedEmployee && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {selectedEmployee.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {selectedEmployee.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Paid Days:</strong> {selectedEmployee.paidDays}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Net Pay:</strong> {selectedEmployee.netPay}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Payment Mode:</strong> {selectedEmployee.paymentMode}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Payment Status:</strong> {selectedEmployee.paymentStatus}
              </Typography>
            </>
          )}
        </Box>
      ),
    },
  ];

  const footerActions = {
    primaryLabel: 'Close',
    primaryAction: handleDrawerClose,
  };

  return (
    <div className="payroll-container">
      <div className="payroll-header">
        <Typography variant="h4" gutterBottom>
          Regular Payroll
        </Typography>
        <Typography variant="h6" gutterBottom>
          APPROVED
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Period: {payrollData.period}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {payrollData.totalCost}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          PAYROLL COST
        </Typography>

        <Button variant="contained" startIcon={<Download />} className="download-button">
          Download Bank Advice
        </Button>
      </div>

      <Typography variant="h6" gutterBottom>
        Employee Summary
      </Typography>

      <Paper className="table-container">
        <DataTable
          columns={columns}
          data={payrollData.employees}
          onRowClick={handleEmployeeClick}
          pagination
          pageSize={5}
          searchable
          onSelectionChange={(selected) => console.log('Selected:', selected)}
        />
      </Paper>

      <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
        Comments
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Taxes & Deductions</strong>
      </Typography>
      <Typography variant="body1" gutterBottom>
        Taxes {payrollData.taxesAndDeductions.taxes}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Pre-Tax Deductions {payrollData.taxesAndDeductions.preTaxDeductions}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Post-Tax Deductions {payrollData.taxesAndDeductions.postTaxDeductions}
      </Typography>

      <CommonDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        tabs={drawerTabs}
        footerActions={footerActions}
      />
    </div>
  );
};

export default PayrollView;