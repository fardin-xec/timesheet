import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import { fetchAttendance } from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chart from "chart.js/auto";

const AttendanceEmployeeDialog = ({ open, onClose, employee }) => {
  const [tabValue, setTabValue] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const localTimezone =
    localStorage.getItem("timezone") ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [chartType, setChartType] = useState("pie");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (open && employee) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetchAttendance({
            page: 1,
            limit: 100,
            employeeId: employee.id,
            startDate: `${year}-${month.toString().padStart(2, "0")}-01`,
            endDate: `${year}-${month.toString().padStart(2, "0")}-${new Date(
              year,
              month,
              0
            ).getDate()}`,
          });

          const formattedData = response.data.data
            .map((item) => ({
              ...item,
              attendanceDateLocal: item.attendanceDate ? item.attendanceDate : "N/A",
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
              attendanceDateUTC: item.attendanceDate,
              checkInTimeUTC: item.checkInTime,
              checkOutTimeUTC: item.checkOutTime,
            }))
            .sort(
              (a, b) =>
                new Date(b.attendanceDateUTC) - new Date(a.attendanceDateUTC)
            );

          setAttendanceData(formattedData);
          toast.success(
            `Successfully loaded attendance for ${employee.firstName} ${employee.lastName}`
          );
        } catch (err) {
          setError(err.message || "Failed to load attendance data");
          toast.error(`Error loading attendance: ${err.message || "Unknown error"}`);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAttendanceData();
  }, [open, employee, month, year, localTimezone]);

  const handleTabChange = (newValue) => setTabValue(newValue);

  const attendanceColumns = [
    { field: "attendanceDateLocal", headerName: "Date", sortable: true, valueGetter: (params) => params.row.attendanceDateLocal || "N/A" },
    { field: "status", headerName: "Status", sortable: true },
    { field: "checkInTimeLocal", headerName: "Check In", sortable: true, valueGetter: (params) => params.row.checkInTimeLocal || "N/A" },
    { field: "checkOutTimeLocal", headerName: "Check Out", sortable: true, valueGetter: (params) => params.row.checkOutTimeLocal || "N/A" },
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
  };

  const analysisData = attendanceData.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    if (tabValue === 1 && Object.keys(analysisData).length > 0) {
      const ctx = document.getElementById("analysisChart").getContext("2d");
      if (window.myChart) window.myChart.destroy();

      window.myChart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: Object.keys(analysisData),
          datasets: [
            {
              label: "Attendance Count",
              data: Object.values(analysisData),
              backgroundColor: ["#10B981", "#EF4444", "#F59E0B", "#8B5CF6"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Attendance Status Distribution" },
          },
          scales: chartType === "bar" ? {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
            x: { grid: { display: false } },
          } : {},
          layout: {
            padding: 10,
          },
        },
      });

      const handleResize = () => {
        if (window.myChart) {
          window.myChart.resize();
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (window.myChart) {
          window.myChart.destroy();
        }
      };
    }
  }, [tabValue, analysisData, chartType]);

  if (!open || !employee) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto  bg-black bg-opacity-50 backdrop-blur-sm"

      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{`${employee.firstName} ${employee.lastName}`}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex border-b">
          <button
            onClick={() => handleTabChange(0)}
            className={`flex-1 p-4 text-center text-sm ${
              tabValue === 0 ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            Attendance Log
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex-1 p-4 text-center text-sm ${
              tabValue === 1 ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            Analysis
          </button>
        </div>
        <div className="p-6 max-h-[calc(90vh-150px)] overflow-y-auto">
          {tabValue === 0 && (
            <div>
              <div className="mb-4 flex gap-4">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border rounded-md p-2"
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
              <DataTable
                columns={attendanceColumns}
                data={attendanceData}
                loading={loading}
                error={error}
                pagination
                pageSize={5}
                sortable
                statusColorMap={statusColorMap}
                emptyStateMessage={error || "No attendance records found"}
              />
            </div>
          )}
          {tabValue === 1 && (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => setChartType("pie")}
                  className={`mr-2 px-3 py-1 rounded ${
                    chartType === "pie" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  Pie Chart
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1 rounded ${
                    chartType === "bar" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  Bar Chart
                </button>
              </div>
              {Object.keys(analysisData).length > 0 ? (
                <div className="w-full flex justify-center">
                  <canvas
                    id="analysisChart"
                    className="w-full max-w-[448px] h-[300px]"
                  ></canvas>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No data available for analysis.
                </p>
              )}
            </div>
          )}
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default AttendanceEmployeeDialog;