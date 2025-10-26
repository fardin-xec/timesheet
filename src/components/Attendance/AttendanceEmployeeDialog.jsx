import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, FileText, Tag, AlignLeft, CheckCircle, PlayCircle, AlertCircle, X } from "lucide-react";
import { fetchTasksByDate } from "../../utils/api";

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
      damping: 25
    }
  })
};

const statusConfig = {
  active: {
    bg: "bg-gradient-to-r from-blue-500 to-blue-600",
    icon: PlayCircle,
    text: "Active"
  },
  completed: {
    bg: "bg-gradient-to-r from-green-500 to-green-600",
    icon: CheckCircle,
    text: "Completed"
  },
  auto_stopped: {
    bg: "bg-gradient-to-r from-amber-500 to-amber-600",
    icon: AlertCircle,
    text: "Auto Stopped"
  }
};

const AttendanceEmployeeDialog = ({ open = true, onClose = () => {}, employee = { firstName: "John", lastName: "Doe", id: 1 }, date = new Date() }) => {
  const [selectedDate, setSelectedDate] = useState(
    date instanceof Date
      ? date.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [taskLogs, setTaskLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTaskLogs = useCallback(async () => {
    if (!employee || !selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchTasksByDate(selectedDate, employee.id);
      setTaskLogs(data || []);
    } catch (err) {
      setError(err.message || "Failed to load task logs");
      setTaskLogs([]);
    } finally {
      setLoading(false);
    }
  }, [employee, selectedDate]);

  useEffect(() => {
    if (open) {
      loadTaskLogs();
    }
  }, [open, loadTaskLogs]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const today = new Date().toISOString().split("T")[0];
    if (newDate <= today) setSelectedDate(newDate);
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
          <motion.div
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
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
                  <p className="text-sm" style={{color: "white"}}>Task Activity Dashboard</p>
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

            {/* Date selector */}
            <div className="px-8 py-6 bg-white border-b border-gray-200">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <label htmlFor="taskDate" className="font-semibold text-gray-700">
                    Select Date:
                  </label>
                </div>
                <input
                  id="taskDate"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Content area */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-220px)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <motion.div
                    className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-4 text-gray-600 font-medium">Loading task logs...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="bg-red-100 rounded-full p-4 mb-4">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : taskLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="bg-gray-100 rounded-full p-4 mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No task logs found for this date.</p>
                  <p className="text-gray-400 text-sm mt-2">Try selecting a different date</p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {taskLogs.map((log, index) => {
                    const status = statusConfig[log.status?.toLowerCase()] || statusConfig.completed;
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
                        {/* Status bar */}
                        <div className={`h-1.5 ${status.bg}`}></div>
                        
                        <div className="p-5">
                          {/* Time section */}
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm font-semibold text-gray-700">
                                {log.startTime
                                  ? new Date(log.startTime).toLocaleTimeString([], {
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
                                  ? new Date(log.endTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Ongoing"}
                              </span>
                            </div>
                          </div>

                          {/* Duration badge */}
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">Duration:</span>
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                              <Clock className="w-3 h-3" />
                              {calculateDuration(log.startTime, log.endTime)}
                            </span>
                          </div>

                          {/* Task description */}
                          <h3 className="font-bold text-gray-800 mb-3 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                            {log.taskDescription || "No description"}
                          </h3>

                          {/* Details */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-gray-500 block">Project</span>
                                <span className="text-sm text-gray-700 block truncate">{log.projectName || "—"}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-gray-500 block">Category</span>
                                <span className="text-sm text-gray-700 block truncate">{log.taskCategory || "—"}</span>
                              </div>
                            </div>
                            {log.notes && (
                              <div className="flex items-start gap-2">
                                <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-semibold text-gray-500 block">Notes</span>
                                  <span className="text-sm text-gray-600 block line-clamp-2">{log.notes}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status badge */}
                          <div className="flex justify-end">
                            <div className={`inline-flex items-center gap-1.5 ${status.bg} text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-md`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status.text}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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