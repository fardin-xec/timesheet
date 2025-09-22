import React, { useState, useEffect, useCallback, useRef } from "react";
import DataTable from "../common/DataTable";
import UserAttendanceDialog from "./UserAttendanceDialog";
import { fetchAttendance } from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Using react-chartjs-2 (requires: npm install react-chartjs-2 chart.js)
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserAttendanceList = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState("pie");
  
  // Get timezone from localStorage or fallback to browser timezone
  const localTimezone = useRef(
    (() => {
      try {
        return localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
    })()
  ).current;

  // Memoize fetchAttendanceData to avoid re-creation
  const fetchAttendanceData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const employeeId = user.employee?.id || user.id;
      if (!employeeId) {
        throw new Error("No employee ID available");
      }

      const lastDay = new Date(year, month, 0).getDate();
      
      const response = await fetchAttendance({
        page: 1,
        limit: 100,
        employeeId,
        startDate: `${year}-${month.toString().padStart(2, "0")}-01`,
        endDate: `${year}-${month.toString().padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`,
      });

      if (!response?.data?.data) {
        throw new Error("Invalid response format");
      }

      const formattedData = response.data.data
        .map((item) => {
          try {
            return {
              ...item,
              attendanceDateLocal: item.attendanceDate || "N/A",
              checkInTimeLocal: item.checkInTime
                ? new Date(`1970-01-01T${item.checkInTime}Z`).toLocaleString(
                    undefined,
                    {
                      timeZone: localTimezone,
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "N/A",
              checkOutTimeLocal: item.checkOutTime
                ? new Date(`1970-01-01T${item.checkOutTime}Z`).toLocaleString(
                    undefined,
                    {
                      timeZone: localTimezone,
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "N/A",
              startTimeLocal: item.startTime
                ? new Date(`1970-01-01T${item.startTime}Z`).toLocaleString(
                    undefined,
                    {
                      timeZone: localTimezone,
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "N/A",
              totalWorkingHoursLocal: item.totalWorkingHours
                ? `${item.totalWorkingHours} hrs`
                : "N/A",
              attendanceDateUTC: item.attendanceDate,
              checkInTimeUTC: item.checkInTime,
              checkOutTimeUTC: item.checkOutTime,
              startTimeUTC: item.startTime,
              totalWorkingHoursUTC: item.totalWorkingHours,
            };
          } catch (timeError) {
            console.warn("Error formatting time for item:", item, timeError);
            return {
              ...item,
              attendanceDateLocal: item.attendanceDate || "N/A",
              checkInTimeLocal: "N/A",
              checkOutTimeLocal: "N/A",
              startTimeLocal: "N/A",
              totalWorkingHoursLocal: "N/A",
              attendanceDateUTC: item.attendanceDate,
              checkInTimeUTC: item.checkInTime,
              checkOutTimeUTC: item.checkOutTime,
              startTimeUTC: item.startTime,
              totalWorkingHoursUTC: item.totalWorkingHours,
            };
          }
        })
        .sort((a, b) => {
          const dateA = new Date(a.attendanceDateUTC || 0);
          const dateB = new Date(b.attendanceDateUTC || 0);
          return dateB - dateA;
        });

      setAttendanceData(formattedData);
      
      const userName = user.employee?.firstName || user.firstName || "User";
      const userLastName = user.employee?.lastName || user.lastName || "";
      toast.success(
        `Successfully loaded attendance for ${userName} ${userLastName}`.trim()
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load attendance data";
      setError(errorMessage);
      toast.error(`Error loading attendance: ${errorMessage}`);
      console.error("Fetch attendance error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, month, year, localTimezone]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const columns = [
    {
      field: "attendanceDateLocal",
      headerName: "Date",
      sortable: true,
      valueGetter: (params) => params.row.attendanceDateLocal || "N/A",
    },
    { field: "status", headerName: "Status", sortable: true },
    {
      field: "checkInTimeLocal",
      headerName: "Check In",
      sortable: true,
      valueGetter: (params) => params.row.checkInTimeLocal || "N/A",
    },
    {
      field: "checkOutTimeLocal",
      headerName: "Check Out",
      sortable: true,
      valueGetter: (params) => params.row.checkOutTimeLocal || "N/A",
    },
    {
      field: "totalWorkingHoursLocal",
      headerName: "Total Hours",
      sortable: true,
      valueGetter: (params) => params.row.totalWorkingHoursLocal || "N/A",
    },
    { field: "tasksPerformed", headerName: "Tasks", sortable: true },
  ];

  const AttendanceStatus = {
    PRESENT: "present",
    ABSENT: "absent",
    ON_LEAVE: "on_leave",
    HALF_DAY: "half_day",
  };

  const statusColorMap = {
    [AttendanceStatus.PRESENT]: "#10B981",
    [AttendanceStatus.ABSENT]: "#EF4444",
    [AttendanceStatus.ON_LEAVE]: "#F59E0B",
    [AttendanceStatus.HALF_DAY]: "#8B5CF6",
    "absent": "#EF4444", // Additional mapping for "absent" string
  };

  const handleTabChange = (newValue) => setTabValue(newValue);

  const handleOnClose = () => {
    setSelectedAttendance(null);
    fetchAttendanceData();
  };

  // Fixed analysisData reducer to properly handle null values
  const analysisData = attendanceData.reduce((acc, record) => {
    let status = record.status;
    
    // Handle null, undefined, or empty status values
    if (status === null || status === undefined || status === '') {
      status = 'absent'; // Default null values to 'absent'
    }
    
    // Normalize status to lowercase for consistency
    status = status.toString().toLowerCase();
    
    // Map common variations to standard status names
    const statusMapping = {
      'present': 'Present',
      'absent': 'Absent', 
      'on_leave': 'On Leave',
      'half_day': 'Half Day',
      'leave': 'On Leave', // Alternative for on_leave
      'halfday': 'Half Day', // Alternative for half_day
    };
    
    const normalizedStatus = statusMapping[status] || status.charAt(0).toUpperCase() + status.slice(1);
    acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
    
    return acc;
  }, {});

  // Chart data configuration with dynamic colors
  const getStatusColor = (status) => {
    const colorMap = {
      'Present': "#10B981",
      'Absent': "#EF4444", 
      'On Leave': "#F59E0B",
      'Half Day': "#8B5CF6",
    };
    return colorMap[status] || "#6B7280"; // Default gray for unknown status
  };

  const chartData = {
    labels: Object.keys(analysisData),
    datasets: [
      {
        label: "Attendance Count",
        data: Object.values(analysisData),
        backgroundColor: Object.keys(analysisData).map(getStatusColor),
        borderColor: Object.keys(analysisData).map(getStatusColor),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        display: true,
      },
      title: {
        display: true,
        text: "Attendance Status Distribution",
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    ...(chartType === "bar" && {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    }),
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Attendance</h2>
      
      {/* Month/Year Selector */}
      <div className="mb-4 flex gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border rounded-md p-2"
          aria-label="Select month"
          disabled={loading}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded-md p-2"
          aria-label="Select year"
          disabled={loading}
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i
          ).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => handleTabChange(0)}
          className={`flex-1 p-4 text-center text-sm transition-colors ${
            tabValue === 0 ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"
          }`}
          disabled={loading}
        >
          View
        </button>
        <button
          onClick={() => handleTabChange(1)}
          className={`flex-1 p-4 text-center text-sm transition-colors ${
            tabValue === 1 ? "bg-blue-100 text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"
          }`}
          disabled={loading}
        >
          Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabValue === 0 && (
          <div>
            <DataTable
              columns={columns}
              data={attendanceData}
              loading={loading}
              error={error}
              pagination
              pageSize={5}
              sortable
              searchable
              statusColorMap={statusColorMap}
              onRowClick={(row) => setSelectedAttendance(row)}
              emptyStateMessage={error || "No attendance records found"}
            />
          </div>
        )}
        
        {tabValue === 1 && (
          <div>
            {/* Chart Type Selector */}
            <div className="mb-4">
              <button
                onClick={() => handleChartTypeChange("pie")}
                className={`mr-2 px-3 py-1 rounded transition-colors ${
                  chartType === "pie" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                disabled={loading}
              >
                Pie Chart
              </button>
              <button
                onClick={() => handleChartTypeChange("bar")}
                className={`px-3 py-1 rounded transition-colors ${
                  chartType === "bar" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                disabled={loading}
              >
                Bar Chart
              </button>
            </div>
            
            {/* Chart Container */}
            {Object.keys(analysisData).length > 0 ? (
              <div style={{ width: "100%", maxWidth: "600px", height: "400px", margin: "0 auto" }}>
                {chartType === "pie" ? (
                  <Pie data={chartData} options={chartOptions} />
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {loading ? "Loading..." : "No data available for analysis."}
              </div>
            )}
            
            {/* Summary Statistics */}
            {Object.keys(analysisData).length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analysisData).map(([status, count]) => (
                  <div key={status} className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-gray-800">{count}</div>
                    <div className="text-sm text-gray-600">{status}</div>
                    <div 
                      className="w-full h-2 rounded mt-2"
                      style={{ backgroundColor: getStatusColor(status) }}
                    ></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendance Dialog */}
      {selectedAttendance && selectedAttendance.status !== "on_leave" && (
        <UserAttendanceDialog
          open={!!selectedAttendance}
          onClose={handleOnClose}
          attendance={selectedAttendance}
          user={user}
        />
      )}

      {/* Toast Container */}
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default UserAttendanceList;