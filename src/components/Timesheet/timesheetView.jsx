import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { Home, Edit, Plus } from "lucide-react";
import CommonDrawer from "../common/Drawer";
import DataTable from "../common/DataTable";
import {
  fetchTimesheetEntries,
  // updateTimesheetEntry,
  // createTimesheetEntry,
  deleteTimesheetEntry,
} from "../../utils/api";
import "../../styles/timesheet.css";

const TimesheetView = () => {
  // State for timesheet data
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Status options
  const statusOptions = [
    "Present",
    "Absent",
    "Half Day",
    "Vacation",
    "Sick Leave",
  ];

  // Status color mapping
  const statusColorMap = {
    Present: "green",
    Absent: "red",
    "Half Day": "orange",
    Vacation: "blue",
    "Sick Leave": "purple",
  };

  // Define table columns with added columns for start time, end time, and task
  const columns = [
    { field: "date", headerName: "Date" },
    { field: "startTime", headerName: "Start Time" },
    { field: "endTime", headerName: "End Time" },
    { field: "hoursWorked", headerName: "Hours Worked" },
    { field: "task", headerName: "Task" },
    { field: "status", headerName: "Status" },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <Button
          variant="text"
          color="primary"
          onClick={() => handleEditClick(params.row)}
          startIcon={<Edit size={16} />}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Get current date and time for new entries
  const getCurrentDateTime = () => {
    const now = new Date();
    const dateString = now.toISOString().split("T")[0];
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Format hours and minutes to have leading zeros if needed
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return {
      date: dateString,
      time: `${hours}:${minutes}`,
    };
  };

  // Calculate hours between start and end time
  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;

    if (minutes < 0) {
      hours--;
      minutes += 60;
    }

    return parseFloat((hours + minutes / 60).toFixed(2));
  };

  // Fetch timesheet data on component mount
  useEffect(() => {
    loadTimesheetData();
  }, []);

  // Function to load timesheet data
  const loadTimesheetData = () => {
    try {
      setLoading(true);
      const data = fetchTimesheetEntries();
      setTimesheetEntries(data);
      setError(null);
    } catch (err) {
      setError("Failed to load timesheet data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total hours worked
  const totalHours = timesheetEntries.reduce(
    (sum, entry) => sum + entry.hoursWorked,
    0
  );

  // Handle opening the edit drawer
  const handleEditClick = (entry) => {
    setSelectedEntry({ ...entry });
    setIsNewEntry(false);
    setDrawerOpen(true);
  };

  // Handle opening the drawer for a new entry
  const handleAddNew = () => {
    const currentDateTime = getCurrentDateTime();
    setSelectedEntry({
      id: null,
      date: currentDateTime.date,
      startTime: "",
      endTime: "",
      hoursWorked: 0,
      task: "",
      status: "Present",
    });
    setIsNewEntry(true);
    setDrawerOpen(true);
  };

  // Handle closing the drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEntry(null);
    setIsNewEntry(false);
  };

  // Update hours worked when start or end time changes
  const handleTimeChange = (field, value) => {
    const updatedEntry = { ...selectedEntry, [field]: value };

    // Calculate hours if both start and end time are present
    if (updatedEntry.startTime && updatedEntry.endTime) {
      updatedEntry.hoursWorked = calculateHours(
        updatedEntry.startTime,
        updatedEntry.endTime
      );
    }

    setSelectedEntry(updatedEntry);
  };

  // Handle saving changes
  const handleSaveChanges = () => {
    try {
      // let updatedEntry;

      if (isNewEntry) {
        // updatedEntry = createTimesheetEntry(selectedEntry);
        setNotification({
          open: true,
          message: "Timesheet entry created successfully",
          severity: "success",
        });
      } else {
        // updatedEntry = updateTimesheetEntry(selectedEntry);
        setNotification({
          open: true,
          message: "Timesheet entry updated successfully",
          severity: "success",
        });
      }

      // Refresh the timesheet data
      loadTimesheetData();
      handleCloseDrawer();
    } catch (err) {
      setNotification({
        open: true,
        message: isNewEntry
          ? "Failed to create entry"
          : "Failed to update entry",
        severity: "error",
      });
    }
  };

  // Handle deleting an entry
  const handleDeleteEntry = async () => {
    if (!selectedEntry || !selectedEntry.id) return;

    try {
      await deleteTimesheetEntry(selectedEntry.id);
      setNotification({
        open: true,
        message: "Timesheet entry deleted successfully",
        severity: "success",
      });

      // Refresh the timesheet data
      await loadTimesheetData();
      handleCloseDrawer();
    } catch (err) {
      setNotification({
        open: true,
        message: "Failed to delete entry",
        severity: "error",
      });
    }
  };

  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Content for the drawer
  const drawerContent = (
    <Box className="timesheet-edit-form">
      {selectedEntry && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" className="form-title">
              {isNewEntry ? "Add New Timesheet Entry" : "Edit Timesheet Entry"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedEntry.date}
              onChange={(e) =>
                setSelectedEntry({ ...selectedEntry, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={selectedEntry.startTime || ""}
              onChange={(e) => handleTimeChange("startTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
              <TimePicker
                label="End Time"
                value={
                  selectedEntry.endTime
                    ? new Date(`2023-01-01T${selectedEntry.endTime}`)
                    : null
                }
                onChange={(newValue) => {
                  const formattedTime = newValue
                    ? newValue.toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  handleTimeChange("endTime", formattedTime);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Hours Worked"
              type="number"
              inputProps={{ min: 0, max: 24, step: 0.1 }}
              value={selectedEntry.hoursWorked}
              onChange={(e) =>
                setSelectedEntry({
                  ...selectedEntry,
                  hoursWorked: parseFloat(e.target.value),
                })
              }
              helperText="Automatically calculated from start/end time"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Description"
              multiline
              rows={3}
              value={selectedEntry.task || ""}
              onChange={(e) =>
                setSelectedEntry({ ...selectedEntry, task: e.target.value })
              }
              placeholder="What did you work on?"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Status"
              value={selectedEntry.status}
              onChange={(e) =>
                setSelectedEntry({ ...selectedEntry, status: e.target.value })
              }
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {!isNewEntry && (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleDeleteEntry}
              >
                Delete Entry
              </Button>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box className="timesheet-container">
      {/* Header */}
      <Box className="timesheet-header">
        <Typography variant="h4" component="h1">
          Timesheet Summary
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleAddNew}
            className="add-button"
          >
            Add Entry
          </Button>
          <IconButton className="home-button" aria-label="home">
            <Home />
          </IconButton>
        </Box>
      </Box>

      {/* Timesheet Table - Using the DataTable component */}
      <DataTable
        columns={columns}
        data={timesheetEntries}
        loading={loading}
        error={error}
        statusColorMap={statusColorMap}
      />

      {/* Total Hours */}
      {!loading && !error && (
        <Box className="total-hours">
          <Typography variant="h6">Total Hours Worked: {totalHours}</Typography>
        </Box>
      )}

      {/* Edit Drawer */}
      <CommonDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        width={400}
        tabs={[
          {
            label: isNewEntry ? "Add Entry" : "Edit Entry",
            content: drawerContent,
          },
        ]}
        footerActions={{
          primaryLabel: isNewEntry ? "Create Entry" : "Save Changes",
          primaryAction: handleSaveChanges,
          secondaryLabel: "Cancel",
          secondaryAction: handleCloseDrawer,
        }}
      />

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimesheetView;
