import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  FileText,
  Tag,
  AlignLeft,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { fetchTasksByDate, fetchEmployeeMonthlyLogs } from "../../utils/api";
import "../../styles/attendanceDailog.css";
import Toast from "../common/Toast";
import { format } from "date-fns";

// Helper function to get last month's date range
function getLastMonthDates() {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  return {
     start: lastMonth.toISOString().split("T")[0],
    end: lastMonthEnd.toISOString().split("T")[0],
  };
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { y: 50, opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  }),
};

const statusConfig = {
  active: {
    bg: "bg-gradient-to-r from-blue-500 to-blue-600",
    icon: PlayCircle,
    text: "Active",
    class: "status-active",
  },
  completed: {
    bg: "bg-gradient-to-r from-green-500 to-green-600",
    icon: CheckCircle,
    text: "Completed",
    class: "status-completed",
  },
  auto_stopped: {
    bg: "bg-gradient-to-r from-amber-500 to-amber-600",
    icon: AlertCircle,
    text: "Auto Stopped",
    class: "status-auto-stopped",
  },
  present: {
    bg: "bg-gradient-to-r from-green-500 to-green-600",
    icon: CheckCircle,
    text: "Present",
    class: "status-present",
  },
  absent: {
    bg: "bg-gradient-to-r from-red-500 to-red-600",
    icon: AlertCircle,
    text: "Absent",
    class: "status-absent",
  },
  on_leave: {
    bg: "bg-gradient-to-r from-purple-500 to-purple-600",
    icon: Calendar,
    text: "On Leave",
    class: "status-on-leave",
  },
  half_day: {
    bg: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    icon: Clock,
    text: "Half Day",
    class: "status-half-day",
  },
  week_off: {
    bg: "bg-gradient-to-r from-gray-500 to-gray-600",
    icon: Calendar,
    text: "Week Off",
    class: "status-week-off",
  },
};

const AttendanceEmployeeDialog = ({
  open = true,
  onClose = () => {},
  employee = { firstName: "John", lastName: "Doe", id: 1 },
  date = new Date(),
}) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedDate, setSelectedDate] = useState(
    date instanceof Date
      ? format(date, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );
  const [taskLogs, setTaskLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastSeverity, setToastSeverity] = React.useState("success");

  // Monthly logs state
  const [monthlyLogs, setMonthlyLogs] = useState({
    summary: {},
    dailyLogs: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: getLastMonthDates().start,
    endDate: getLastMonthDates().end,
  });
  const [expandedDays, setExpandedDays] = useState(new Set());

  const loadTaskLogs = useCallback(async () => {
    if (!employee || !selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchTasksByDate(selectedDate, employee.id);
      setTaskLogs(data || []);
      setToastMessage("task logs fetched successfully!");
      setToastSeverity("success");
      setToastOpen(true);
    } catch (err) {
      setError(err.response.data.message || "Failed to load task logs");
      setToastMessage(err.response.data.message || "Failed to load task logs");
      setToastSeverity("error");
      setToastOpen(true);
      setTaskLogs([]);
    } finally {
      setLoading(false);
    }
  }, [employee, selectedDate]);

  const loadMonthlyLogs = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchEmployeeMonthlyLogs(
        dateRange.startDate,
        dateRange.endDate,
        employee.id
      );
      setMonthlyLogs(data || { summary: {}, dailyLogs: [] });
      setToastMessage("Monthly logs fetched successfully!");
      setToastSeverity("success");
      setToastOpen(true);
    } catch (err) {
      setError(err.response.data.message || "Failed to load monthly logs");
      setToastMessage(
        err.response.data.message || "Failed to load monthly logs"
      );
      setToastSeverity("error");
      setToastOpen(true);
      setMonthlyLogs({ summary: {}, dailyLogs: [] });
    } finally {
      setLoading(false);
    }
  }, [employee, dateRange]);

  useEffect(() => {
    if (open) {
      if (activeTab === "tasks") {
        loadTaskLogs();
      } else if (activeTab === "monthly") {
        loadMonthlyLogs();
      }
    }
  }, [open, activeTab, loadTaskLogs, loadMonthlyLogs]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const today = format(new Date(), "yyyy-MM-dd");
    if (newDate <= today) setSelectedDate(newDate);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDuration = (start, end) => {
    if (!start) return "—";
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diff = Math.abs(endTime - startTime);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return "In Progress";
    if (minutes === 0) return "0m";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || {
      bg: "bg-gradient-to-r from-gray-500 to-gray-600",
      icon: AlertCircle,
      text: status,
      class: "status-default",
    };
    return {
      ...config,
      cssClass: `status-badge status-${status
        ?.toLowerCase()
        .replace(/_/g, "-")}`,
    };
  };

  const toggleDayExpansion = (date) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  if (!open || !employee) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-md p-4"
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Toast
            open={toastOpen}
            message={toastMessage}
            severity={toastSeverity}
            onClose={() => setToastOpen(false)}
          />
          <motion.div
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <p className="text-sm" style={{ color: "white" }}>
                    Task Activity Dashboard
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-8">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-6 py-4 font-semibold text-sm transition-all duration-200 border-b-2 ${
                  activeTab === "tasks"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Task Logs
              </button>
              <button
                onClick={() => setActiveTab("monthly")}
                className={`px-6 py-4 font-semibold text-sm transition-all duration-200 border-b-2 ${
                  activeTab === "monthly"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Monthly Logs
              </button>
            </div>

            {/* Date selector */}
            {activeTab === "tasks" ? (
              <div className="px-8 py-6 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <label
                      htmlFor="taskDate"
                      className="font-semibold text-gray-700"
                    >
                      Select Date:
                    </label>
                  </div>
                  <input
                    id="taskDate"
                    type="date"
                    max={format(new Date(), "yyyy-MM-dd")}
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="px-8 py-6 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <label className="font-semibold text-gray-700">
                      Date Range:
                    </label>
                  </div>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      handleDateRangeChange("startDate", e.target.value)
                    }
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white shadow-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      handleDateRangeChange("endDate", e.target.value)
                    }
                    max={format(new Date(), "yyyy-MM-dd")}
                    min={dateRange.startDate}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white shadow-sm"
                  />
                  <motion.button
                    onClick={loadMonthlyLogs}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply
                  </motion.button>
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <motion.div
                    className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="bg-red-100 rounded-full p-4 mb-4">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : activeTab === "tasks" ? (
                taskLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-gray-100 rounded-full p-4 mb-4">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      No task logs found for this date.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Try selecting a different date
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {taskLogs.map((log, index) => {
                      const status = getStatusBadge(log.status?.toLowerCase());
                      const StatusIcon = status.icon;

                      return (
                        <motion.div
                          key={log.id}
                          custom={index}
                          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ y: -4 }}
                        >
                          <div className={`h-1.5 ${status.bg}`}></div>

                          <div className="p-5">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {log.startTime
                                    ? new Date(
                                        log.startTime
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-pink-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {log.endTime
                                    ? new Date(log.endTime).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : "Ongoing"}
                                </span>
                              </div>
                            </div>

                            <div className="mb-3 flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">
                                Duration:
                              </span>
                              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <Clock className="w-3 h-3" />
                                {calculateDuration(log.startTime, log.endTime)}
                              </span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-3 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                              {log.taskDescription || "No description"}
                            </h3>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-semibold text-gray-500 block">
                                    Project
                                  </span>
                                  <span className="text-sm text-gray-700 block truncate">
                                    {log.projectName || "—"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-semibold text-gray-500 block">
                                    Category
                                  </span>
                                  <span className="text-sm text-gray-700 block truncate">
                                    {log.taskCategory || "—"}
                                  </span>
                                </div>
                              </div>
                              {log.notes && (
                                <div className="flex items-start gap-2">
                                  <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-gray-500 block">
                                      Notes
                                    </span>
                                    <span className="text-sm text-gray-600 block line-clamp-2">
                                      {log.notes}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end">
                              <div
                                className={`inline-flex items-center gap-1.5 ${status.bg} text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-md`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {status.text}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Monthly Logs Content */
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Total Days
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {monthlyLogs.summary.totalDays || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-green-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Present
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {monthlyLogs.summary.presentDays || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-red-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Absent
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {monthlyLogs.summary.absentDays || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-purple-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        On Leave
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {monthlyLogs.summary.leaveDays || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-yellow-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Half Days
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {monthlyLogs.summary.halfDays || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-300">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Week Offs
                      </p>
                      <p className="text-2xl font-bold text-gray-600">
                        {monthlyLogs.summary.weekOffs || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg">
                      <p className="text-xs font-semibold text-white/90 mb-1">
                        Total Hours
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {monthlyLogs.summary.totalHoursWorked || "0.00"}h
                      </p>
                    </div>
                  </div>

                  {/* Daily Logs Table */}
                  {!monthlyLogs.dailyLogs ||
                  monthlyLogs.dailyLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="bg-gray-100 rounded-full p-4 mb-4">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        No attendance logs found for the selected date range
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Day
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                First Start
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Last End
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Total Hours
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Tasks
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {monthlyLogs.dailyLogs.map((log, index) => {
                              const status = getStatusBadge(log.status);
                              const StatusIcon = status.icon;

                              return (
                                <React.Fragment key={log.date}>
                                  <motion.tr
                                    className="hover:bg-gray-50 transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {new Date(log.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        }
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                      {log.dayOfWeek}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div
                                        className={`inline-flex items-center gap-1.5 ${status.bg} text-white px-3 py-1 rounded-full text-xs font-bold`}
                                      >
                                        <StatusIcon className="w-3 h-3" />
                                        {status.text}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                      {log.firstStartTime
                                        ? formatTime(log.firstStartTime)
                                        : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                      {log.lastEndTime
                                        ? formatTime(log.lastEndTime)
                                        : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                      {log.totalWorkingHours}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {log.timeEntries &&
                                      log.timeEntries.length > 0 ? (
                                        <button
                                          onClick={() =>
                                            toggleDayExpansion(log.date)
                                          }
                                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                                        >
                                          {expandedDays.has(log.date) ? (
                                            <>
                                              <svg
                                                className="w-4 h-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                              >
                                                <path
                                                  d="M18 15L12 9L6 15"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                              Hide ({log.timeEntries.length})
                                            </>
                                          ) : (
                                            <>
                                              <svg
                                                className="w-4 h-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                              >
                                                <path
                                                  d="M6 9L12 15L18 9"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                              View ({log.timeEntries.length})
                                            </>
                                          )}
                                        </button>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                  </motion.tr>

                                  <AnimatePresence>
                                    {expandedDays.has(log.date) &&
                                      log.timeEntries &&
                                      log.timeEntries.length > 0 && (
                                        <motion.tr
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                          }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <td colSpan="7" className="px-0 py-0">
                                            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
                                              <h4 className="text-lg font-bold text-gray-800 mb-4">
                                                Task Entries for{" "}
                                                {new Date(
                                                  log.date
                                                ).toLocaleDateString("en-US", {
                                                  month: "long",
                                                  day: "numeric",
                                                  year: "numeric",
                                                })}
                                              </h4>
                                              <div className="overflow-x-auto">
                                                <table className="w-full bg-white rounded-lg shadow-sm">
                                                  <thead className="bg-gray-100">
                                                    <tr>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
                                                        Start Time
                                                      </th>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
                                                        End Time
                                                      </th>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
                                                        Duration
                                                      </th>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
                                                        Category
                                                      </th>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
                                                        Project
                                                      </th>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
                                                        Description
                                                      </th>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">
                                                        Status
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-200">
                                                    {log.timeEntries.map(
                                                      (entry) => {
                                                        const entryStatus =
                                                          getStatusBadge(
                                                            entry.status
                                                          );
                                                        const EntryStatusIcon =
                                                          entryStatus.icon;

                                                        return (
                                                          <tr
                                                            key={entry.id}
                                                            className="hover:bg-gray-50 transition-colors"
                                                          >
                                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                              {formatTime(
                                                                entry.startTime
                                                              )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                              {formatTime(
                                                                entry.endTime
                                                              )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                              {formatDuration(
                                                                entry.durationMinutes
                                                              )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                              {entry.taskCategory ? (
                                                                <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                                                                  {
                                                                    entry.taskCategory
                                                                  }
                                                                </span>
                                                              ) : (
                                                                <span className="text-gray-400">
                                                                  -
                                                                </span>
                                                              )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                              {entry.projectName ||
                                                                "-"}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                                                              {entry.taskDescription ||
                                                                "No description"}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                              <div
                                                                className={`inline-flex items-center gap-1 ${entryStatus.bg} text-white px-2 py-1 rounded-full text-xs font-bold`}
                                                              >
                                                                <EntryStatusIcon className="w-3 h-3" />
                                                                {
                                                                  entryStatus.text
                                                                }
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        );
                                                      }
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </td>
                                        </motion.tr>
                                      )}
                                  </AnimatePresence>
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttendanceEmployeeDialog;
