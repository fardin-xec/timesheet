import React, { useState } from "react";
import {
  Button,
  Typography,
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import { Download, PersonAdd, AttachMoney } from "@mui/icons-material";
import DataTable from "../common/DataTable";
import CommonDrawer from "../common/Drawer";
import "../../styles/payroll.css";

const PayrollView = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currency, setCurrency] = useState("ر.ق");
  const [currencyName, setCurrencyName] = useState("Qatari riyal (QAR)");
  const [newEmployee, setNewEmployee] = useState({
    id: "",
    name: "",
    paidDays: "",
    netPay: "",
    paymentMode: "Bank Transfer",
    paymentStatus: "Yet To Pay",
  });

  const currencies = [
    { symbol: "ر.ق", name: "Qatari riyal (QAR)", code: "QAR" },
    { symbol: "¥", name: "Japanese Yen (JPY)", code: "JPY" },
    { symbol: "$", name: "US Dollar (USD)", code: "USD" },
    { symbol: "€", name: "Euro (EUR)", code: "EUR" },
    { symbol: "£", name: "British Pound (GBP)", code: "GBP" },
    { symbol: "₹", name: "Indian Rupee (INR)", code: "INR" },
    { symbol: "₩", name: "South Korean Won (KRW)", code: "KRW" },
    { symbol: "₽", name: "Russian Ruble (RUB)", code: "RUB" },
    { symbol: "฿", name: "Thai Baht (THB)", code: "THB" },
    { symbol: "₱", name: "Philippine Peso (PHP)", code: "PHP" },
    { symbol: "₺", name: "Turkish Lira (TRY)", code: "TRY" },
    { symbol: "R$", name: "Brazilian Real (BRL)", code: "BRL" },
    { symbol: "R", name: "South African Rand (ZAR)", code: "ZAR" },
    { symbol: "kr", name: "Swedish Krona (SEK)", code: "SEK" },
    { symbol: "CHF", name: "Swiss Franc (CHF)", code: "CHF" },
    { symbol: "A$", name: "Australian Dollar (AUD)", code: "AUD" },
    { symbol: "C$", name: "Canadian Dollar (CAD)", code: "CAD" },
    { symbol: "HK$", name: "Hong Kong Dollar (HKD)", code: "HKD" },
    { symbol: "₴", name: "Ukrainian Hryvnia (UAH)", code: "UAH" },
    { symbol: "₸", name: "Kazakhstani Tenge (KZT)", code: "KZT" },
    { symbol: "₦", name: "Nigerian Naira (NGN)", code: "NGN" },
    { symbol: "₲", name: "Paraguayan Guarani (PYG)", code: "PYG" },
    { symbol: "₡", name: "Costa Rican Colón (CRC)", code: "CRC" },
    { symbol: "₼", name: "Azerbaijani Manat (AZN)", code: "AZN" },
    { symbol: "RM", name: "Malaysian Ringgit (MYR)", code: "MYR" },
    { symbol: "S/", name: "Peruvian Sol (PEN)", code: "PEN" },
    { symbol: "₫", name: "Vietnamese Dong (VND)", code: "VND" },
    { symbol: "₪", name: "Israeli New Shekel (ILS)", code: "ILS" },
    { symbol: "Дин.", name: "Serbian Dinar (RSD)", code: "RSD" },
    { symbol: "CN¥", name: "Chinese Yuan (CNY)", code: "CNY" },
    { symbol: "MX$", name: "Mexican Peso (MXN)", code: "MXN" },
    { symbol: "Kč", name: "Czech Koruna (CZK)", code: "CZK" },
    { symbol: "Ft", name: "Hungarian Forint (HUF)", code: "HUF" },
    { symbol: "zł", name: "Polish Złoty (PLN)", code: "PLN" },
    { symbol: "RON", name: "Romanian Leu (RON)", code: "RON" },
    { symbol: "د.إ", name: "UAE Dirham (AED)", code: "AED" },
    { symbol: "৳", name: "Bangladeshi Taka (BDT)", code: "BDT" },
    { symbol: "₵", name: "Ghanaian Cedi (GHS)", code: "GHS" },
    { symbol: "лв", name: "Bulgarian Lev (BGN)", code: "BGN" },
    { symbol: "د.ج", name: "Algerian Dinar (DZD)", code: "DZD" },
    { symbol: "Ksh", name: "Kenyan Shilling (KES)", code: "KES" },
  ];

  const [payrollData, setPayrollData] = useState({
    period: "01/01/2019 - 31/01/2019",
    totalCost: "¥1,25,23,654.00",
    employees: [
      {
        id: "ID12345",
        name: "Meera Krishnan",
        paidDays: 31,
        netPay: "¥28,844.00",
        paymentMode: "Bank Transfer",
        paymentStatus: "Yet To Pay",
      },
      {
        id: "ID22787",
        name: "Rohit Vihari",
        paidDays: 31,
        netPay: "¥73,722.00",
        paymentMode: "Cheque",
        paymentStatus: "Yet To Pay",
      },
      {
        id: "ID00010",
        name: "Kartik Kumar",
        paidDays: 31,
        netPay: "¥89,222.00",
        paymentMode: "Bank Transfer",
        paymentStatus: "Yet To Pay",
      },
    ],
    taxesAndDeductions: {
      taxes: "¥22,78,978.00",
      preTaxDeductions: "¥18,34,789.00",
      postTaxDeductions: "¥1,23,450.00",
    },
  });

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedEmployee(null);
  };

  const handleAddDialogOpen = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setNewEmployee({
      id: "",
      name: "",
      paidDays: "",
      netPay: "",
      paymentMode: "Bank Transfer",
      paymentStatus: "Yet To Pay",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleCurrencyChange = (event, newValue) => {
    if (!newValue) return;

    const newCurrencySymbol = newValue.symbol;
    setCurrency(newCurrencySymbol);
    setCurrencyName(newValue.name);
  };

  const handleAddEmployee = () => {
    const formattedNetPay = `${currency}${newEmployee.netPay.replace(/^[^\d]+/, "")}`;

    const updatedEmployees = [
      ...payrollData.employees,
      { ...newEmployee, netPay: formattedNetPay },
    ];

    setPayrollData({
      ...payrollData,
      employees: updatedEmployees,
    });

    handleAddDialogClose();
  };

  const columns = [
    { field: "name", headerName: "EMPLOYEE NAME", sortable: true },
    { field: "paidDays", headerName: "PAID DAYS", sortable: true },
    { field: "netPay", headerName: "NET PAY", sortable: true },
    { field: "paymentMode", headerName: "PAYMENT MODE", sortable: true },
    { field: "paymentStatus", headerName: "PAYMENT STATUS", sortable: true },
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
    primaryLabel: "Close",
    primaryAction: handleDrawerClose,
  };

  return (
    <div className="payroll-container">
      <div className="payroll-header">
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box>
            <Typography variant="h4" gutterBottom>
              Regular Payroll
            </Typography>
            <Typography variant="body1" className="status-badge" gutterBottom>
              APPROVED
            </Typography>
            <Typography variant="subtitle1" gutterBottom style={{ marginTop: 12 }}>
              Period: {payrollData.period}
            </Typography>
            <Typography variant="h5" gutterBottom>
              {payrollData.totalCost}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              PAYROLL COST
            </Typography>
          </Box>

          <Box>
            <Button
              variant="contained"
              startIcon={<Download />}
              className="download-button"
              style={{ marginRight: 16 }}
            >
              Download Bank Advice
            </Button>
          </Box>
        </Box>
      </div>

      <div className="payroll-card">
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
          <Typography variant="h6">Employee Summary</Typography>
          <Button
            variant="contained"
            className="action-button add-employee-button"
            startIcon={<PersonAdd />}
            onClick={handleAddDialogOpen}
          >
            Add Employee
          </Button>
        </Box>

        <Paper className="table-container">
          <DataTable
            columns={columns}
            data={payrollData.employees}
            onRowClick={handleEmployeeClick}
            pagination
            pageSize={5}
            searchable
            onSelectionChange={(selected) => console.log("Selected:", selected)}
            rowClassName="employee-row"
            headerClassName="table-header"
          />
        </Paper>
      </div>

      <div className="payroll-card">
        <Typography variant="h6">Taxes & Deductions</Typography>
        <Box>
          <div className="deduction-item">
            <Typography variant="body1">Taxes</Typography>
            <Typography variant="body1" className="deduction-value">
              {payrollData.taxesAndDeductions.taxes}
            </Typography>
          </div>
          <div className="deduction-item">
            <Typography variant="body1">Pre-Tax Deductions</Typography>
            <Typography variant="body1" className="deduction-value">
              {payrollData.taxesAndDeductions.preTaxDeductions}
            </Typography>
          </div>
          <div className="deduction-item">
            <Typography variant="body1">Post-Tax Deductions</Typography>
            <Typography variant="body1" className="deduction-value">
              {payrollData.taxesAndDeductions.postTaxDeductions}
            </Typography>
          </div>
        </Box>
      </div>

      {/* Add Employee Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={handleAddDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: { borderRadius: 12, overflow: "hidden" },
        }}
      >
        <DialogTitle className="dialog-title">
          Add Employee Payroll Data
        </DialogTitle>
        <DialogContent className="dialog-content">
          <div className="currency-info">
           

          <FormControl fullWidth margin="dense" variant="outlined">
            <Autocomplete
              options={currencies}
              getOptionLabel={(option) => option.name}
              value={currencies.find((c) => c.symbol === currency)}
              onChange={handleCurrencyChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Currency"
                  variant="outlined"
                  className="currency-selector"
                  InputProps={{
                    ...params.InputProps,
                    style: {
                      color: "black",
                      backgroundColor: "rgb(255, 251, 251)",
                    },
                  }}
                  InputLabelProps={{
                    style: { color: "rgba(20, 19, 19, 0.7)" },
                  }}
                />
              )}
            />
          </FormControl>
          </div>


          <TextField
            autoFocus
            margin="dense"
            name="id"
            label="Employee ID"
            type=""
            fullWidth
            variant="outlined"
            value={newEmployee.id}
            onChange={handleInputChange}
            style={{ marginTop: 16 }}
          />
          <TextField
            margin="dense"
            name="name"
            label="Employee Name"
            type=""
            fullWidth
            value={newEmployee.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="paidDays"
            label="Paid Days"
            type="number"
            fullWidth
            variant="outlined"
            value={newEmployee.paidDays}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="netPay"
            label="Net Pay"
            type=""
            fullWidth
            variant="outlined"
            value={newEmployee.netPay}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: currency,
            }}
          />
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Payment Mode</InputLabel>
            <Select
              name="paymentMode"
              value={newEmployee.paymentMode}
              onChange={handleInputChange}
              label="Payment Mode"
            >
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Digital Wallet">Digital Wallet</MenuItem>
              <MenuItem value="Cryptocurrency">Cryptocurrency</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Payment Status</InputLabel>
            <Select
              name="paymentStatus"
              value={newEmployee.paymentStatus}
              onChange={handleInputChange}
              label="Payment Status"
            >
              <MenuItem value="Yet To Pay">Yet To Pay</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className="dialog-footer">
          <Button onClick={handleAddDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleAddEmployee}
            color="primary"
            variant="contained"
            className="action-button add-employee-button"
          >
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

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