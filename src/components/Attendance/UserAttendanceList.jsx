import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchTodayTasks, 
  fetchTasksByDate, 
  updateAttendanceTask,
} from '../../utils/api';
import '../../styles/userAttendanceList.css';

const UserAttendanceList = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    taskDescription: '', 
    projectName: '', 
    taskCategory: '',
    notes: '' 
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = selectedDate === new Date().toISOString().split('T')[0]
        ? await fetchTodayTasks()
        : await fetchTasksByDate(selectedDate);
      setTimeEntries(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      setTimeEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      loadTasks();
    } 
  }, [activeTab, loadTasks]);

  const handleRefresh = async () => {
    if (loading || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await loadTasks();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      // Add a minimum delay to show the animation
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry.id);
    setEditForm({
      taskDescription: entry.taskDescription || '',
      projectName: entry.projectName || '',
      taskCategory: entry.taskCategory || '',
      notes: entry.notes || ''
    });
  };

  const handleEditCancel = () => {
    setEditingEntry(null);
    setEditForm({ 
      taskDescription: '', 
      projectName: '', 
      taskCategory: '',
      notes: '' 
    });
  };

  const handleEditSave = async (entryId) => {
    try {
      await updateAttendanceTask(entryId, editForm);
      setEditingEntry(null);
      loadTasks();
    } catch (err) {
      setError(err.message || 'Failed to update task');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return 'In Progress';
    if (minutes === 0) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const calculateTotalHours = () => {
    const total = timeEntries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0);
    return formatDuration(total);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', class: 'status-active' },
      completed: { label: 'Completed', class: 'status-completed' },
      auto_stopped: { label: 'Auto-stopped', class: 'status-auto-stopped' }
    };
    return statusConfig[status] || { label: status, class: 'status-default' };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="attendance-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="attendance-header"
        variants={itemVariants}
      >
        <h1>Attendance & Task Management</h1>
        <div className="header-controls">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="date-picker"
            />
          </motion.div>
          <motion.button
            className="btn-refresh"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            whileHover={{ scale: loading || isRefreshing ? 1 : 1.05 }}
            whileTap={{ scale: loading || isRefreshing ? 1 : 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ 
                duration: 0.6,
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear"
              }}
            >
              <path d="M21.5 2V8M21.5 8H15.5M21.5 8L18.5 5C17.3214 3.82143 15.8025 3.03677 14.1608 2.75973C12.519 2.48269 10.8336 2.72779 9.33212 3.46213C7.83062 4.19648 6.58674 5.38605 5.76341 6.86833C4.94009 8.35061 4.57873 10.0547 4.73 11.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.5 22V16M2.5 16H8.5M2.5 16L5.5 19C6.67858 20.1786 8.19752 20.9632 9.83924 21.2403C11.481 21.5173 13.1664 21.2722 14.6679 20.5379C16.1694 19.8035 17.4133 18.614 18.2366 17.1317C19.0599 15.6494 19.4213 13.9453 19.27 12.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        className="tabs"
        variants={itemVariants}
      >
        <motion.button
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Task Logs
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            className="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="loading"
          >
            <motion.div 
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p>Loading...</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {activeTab === 'tasks' && (
              <div className="tasks-section">
                <motion.div 
                  className="tasks-summary"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div className="summary-card" variants={itemVariants}>
                    <span className="summary-label">Total Entries</span>
                    <motion.span 
                      className="summary-value"
                      key={timeEntries.length}
                      initial={{ scale: 1.2, color: "#667eea" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      {timeEntries.length}
                    </motion.span>
                  </motion.div>
                  <motion.div className="summary-card" variants={itemVariants}>
                    <span className="summary-label">Total Hours</span>
                    <motion.span 
                      className="summary-value"
                      key={calculateTotalHours()}
                      initial={{ scale: 1.2, color: "#667eea" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      {calculateTotalHours()}
                    </motion.span>
                  </motion.div>
                  <motion.div className="summary-card" variants={itemVariants}>
                    <span className="summary-label">Date</span>
                    <span className="summary-value">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </motion.div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {timeEntries.length === 0 ? (
                    <motion.div 
                      className="no-data"
                      key="no-data"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.svg 
                        width="64" 
                        height="64" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                      >
                        <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </motion.svg>
                      <p>No time entries found for this date</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="tasks-list"
                      key="tasks-list"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <AnimatePresence>
                        {timeEntries.map((entry, index) => (
                          <motion.div 
                            key={entry.id} 
                            className="task-card"
                            variants={cardVariants}
                            custom={index}
                            layout
                            whileHover={{ 
                              y: -4,
                              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)"
                            }}
                          >
                            <div className="task-header">
                              <div className="task-time">
                                <motion.span 
                                  className="time-badge start"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                  {formatTime(entry.startTime)}
                                </motion.span>
                                <span className="time-separator">→</span>
                                <motion.span 
                                  className="time-badge end"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                  {formatTime(entry.endTime)}
                                </motion.span>
                              </div>
                              <div className="task-meta">
                                <motion.span 
                                  className={`status-badge ${getStatusBadge(entry.status).class}`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                  {getStatusBadge(entry.status).label}
                                </motion.span>
                                <motion.span 
                                  className="duration-badge"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                >
                                  {formatDuration(entry.durationMinutes)}
                                </motion.span>
                              </div>
                            </div>

                            <AnimatePresence mode="wait">
                              {editingEntry === entry.id ? (
                                <motion.div 
                                  className="task-edit-form"
                                  key="edit-form"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="form-group">
                                    <label>Task Description</label>
                                    <textarea
                                      value={editForm.taskDescription}
                                      onChange={(e) => setEditForm({ ...editForm, taskDescription: e.target.value })}
                                      placeholder="Enter task description"
                                      rows="3"
                                    />
                                  </div>
                                  <div className="form-row">
                                    <div className="form-group">
                                      <label>Project Name</label>
                                      <input
                                        type="text"
                                        value={editForm.projectName}
                                        onChange={(e) => setEditForm({ ...editForm, projectName: e.target.value })}
                                        placeholder="Enter project name"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Category</label>
                                      <input
                                        type="text"
                                        value={editForm.taskCategory}
                                        onChange={(e) => setEditForm({ ...editForm, taskCategory: e.target.value })}
                                        placeholder="e.g., Development, Meeting"
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                      value={editForm.notes}
                                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                      placeholder="Additional notes"
                                      rows="2"
                                    />
                                  </div>
                                  <div className="form-actions">
                                    <motion.button 
                                      className="btn-save" 
                                      onClick={() => handleEditSave(entry.id)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Save Changes
                                    </motion.button>
                                    <motion.button 
                                      className="btn-cancel" 
                                      onClick={handleEditCancel}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Cancel
                                    </motion.button>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div 
                                  className="task-details"
                                  key="task-details"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="task-info">
                                    {entry.taskCategory && (
                                      <div className="info-row">
                                        <span className="info-label">Category:</span>
                                        <span className="category-tag">{entry.taskCategory}</span>
                                      </div>
                                    )}
                                    {entry.projectName && (
                                      <div className="info-row">
                                        <span className="info-label">Project:</span>
                                        <span className="info-value">{entry.projectName}</span>
                                      </div>
                                    )}
                                    <div className="info-row">
                                      <span className="info-label">Description:</span>
                                      <span className="info-value">
                                        {entry.taskDescription || 'No description provided'}
                                      </span>
                                    </div>
                                    {entry.notes && (
                                      <div className="info-row">
                                        <span className="info-label">Notes:</span>
                                        <span className="info-value notes-text">{entry.notes}</span>
                                      </div>
                                    )}
                                    {entry.estimatedTimeMinutes && (
                                      <div className="info-row">
                                        <span className="info-label">Estimated:</span>
                                        <span className="info-value">{formatDuration(entry.estimatedTimeMinutes)}</span>
                                      </div>
                                    )}
                                  </div>
                                  {entry.status !== 'active' && (
                                    <motion.button 
                                      className="btn-edit" 
                                      onClick={() => handleEditClick(entry)}
                                      whileHover={{ scale: 1.05, y: -2 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                      </svg>
                                      Edit
                                    </motion.button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserAttendanceList;