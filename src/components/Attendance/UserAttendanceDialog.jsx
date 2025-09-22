import React, { useState, useEffect } from "react";
import { updateAttendanceTask } from "../../utils/api";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Ensure CSS is imported

const UserAttendanceDialog = ({ open, onClose, attendance, user }) => {
  const [tasksPerformed, setTasksPerformed] = useState(
    attendance.tasksPerformed || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTasksPerformed(attendance.tasksPerformed || "");
  }, [attendance]);

  const handleUpdateTask = async () => {
    if (!tasksPerformed.trim()) {
      toast.error("Tasks cannot be empty");
      return;
    }

    setLoading(true);
    try {
      // Call API to update tasksPerformed
      const data = { tasksPerformed };
      await updateAttendanceTask(attendance.id, data);
      toast.success("Tasks updated successfully!");
      onClose(); // Close dialog on success
    } catch (err) {
      console.error("Failed to update tasks:", err);
      toast.error(`Failed to update tasks: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !attendance) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto  bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="attendance-dialog-title"
        >
          <div className="p-6 border-b flex justify-between items-center">
            <h2 id="attendance-dialog-title" className="text-xl font-semibold">
              Attendance Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close dialog"
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
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Update Task</h3>{" "}
            {/* Added text */}
            <div>
              <textarea
                value={tasksPerformed}
                onChange={(e) => setTasksPerformed(e.target.value)}
                className="w-full p-2 border rounded-md mb-4"
                rows={4}
                placeholder="Enter tasks performed"
                aria-label="Tasks performed input"
              />
              <button
                onClick={handleUpdateTask}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                aria-label="Update tasks"
              >
                {loading ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default UserAttendanceDialog;
