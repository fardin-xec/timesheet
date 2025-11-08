import React, { useState, useEffect, useRef, useCallback } from "react";
import Button from "../common/Button";
import { checkOut, checkIn, fetchActiveTimer } from "../../utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashboardHeader = ({ user, onLogout }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [showCheckOutTime, setShowCheckOutTime] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Fetch active timer data from API
  const loadActiveTimer = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchActiveTimer();
      console.log("Active timer response:", response);
      
      if (response?.isActive && response?.entry) {
        const timerData = response;
        
        setIsCheckedIn(true);
        setElapsedTime(timerData.elapsedSeconds || 0);
        setShowCheckOutTime(false);
        setCheckOutTime(null);

        // Start the interval timer if not already running
        if (!timerIntervalRef.current) {
          const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
          }, 1000);
          timerIntervalRef.current = interval;
        }
      } else {
        // No active timer
        setIsCheckedIn(false);
        setElapsedTime(0);
        setShowCheckOutTime(false);
        setCheckOutTime(null);
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error("Failed to fetch active timer:", err);
      // On error, assume no active timer
      setIsCheckedIn(false);
      setElapsedTime(0);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load active timer on component mount
  useEffect(() => {
    loadActiveTimer();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [loadActiveTimer]);

  // Periodically sync with server (every 5 minutes)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      loadActiveTimer();
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => {
      clearInterval(syncInterval);
    };
  }, [loadActiveTimer]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle page visibility change to pause/resume timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isCheckedIn) {
        // Page is visible again, resync with server
        loadActiveTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCheckedIn, loadActiveTimer]);

  // Handle check-in with API call
  const handleCheckIn = async () => {
    const now = new Date();
    const utcTime = now.toISOString().substr(11, 8);
    
    try {
      const data = { checkInTime: utcTime, status: "present" };
      await checkIn(user?.employee?.id, data);
      
      // Fetch the latest timer state from server after check-in
      await loadActiveTimer();
      
      toast.success("Successfully checked in!");
      console.log("Checked in at:", utcTime);
    } catch (err) {
      console.error("Failed to check in:", err);
      toast.error(`Check-in failed: ${err.message || "Unknown error"}`);
      setIsCheckedIn(false);
      setElapsedTime(0);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    const now = new Date();
    const utcTime = now.toISOString().substr(11, 8);
    const finalElapsedTime = elapsedTime;

    try {
      const data = { checkOutTime: utcTime };
      await checkOut(user?.employee?.id, data);
      
      // Update local state after successful check-out
      setIsCheckedIn(false);
      setCheckOutTime(now);
      setShowCheckOutTime(true);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      toast.success("Successfully checked out!");
      console.log("Checked out at:", utcTime);
      console.log("Total time:", formatTime(finalElapsedTime));
    } catch (err) {
      console.error("Failed to check out:", err);
      toast.error(`Check-out failed: ${err.message || "Unknown error"}`);
    }
  };

  // Format the timer display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle login as user (mock implementation)
  const handleLoginAsUser = () => {
    // Update the user role to 'user'
    const updatedUser = { ...user, role: "manager" };

    // Save the updated user back to localStorage (keeping this one for auth)
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Close the dropdown
    setIsDropdownOpen(false);

    // Perform a hard refresh
    window.location.reload();
  };

  return (
    <header className="dashboard-header">
      <div className="logo" style={{ fontWeight: "bold" }}>
        <h1>Timesheet App</h1>
      </div>

      <div className="time-tracking">
        {!isLoading && isCheckedIn && elapsedTime !== 0 && (
          <div className="timer-display">
            <span className="timer-label">Working:</span>
            <span className="timer-value">{formatTime(elapsedTime)}</span>
          </div>
        )}
        {showCheckOutTime && (
          <div className="checkout-time-display">
            <span className="checkout-label">Checked out at:</span>
            <span className="checkout-value">{formatDate(checkOutTime)}</span>
          </div>
        )}
      </div>

      <div className="user-actions">
        <div className="check-buttons">
          {isLoading ? (
            <Button disabled className="checkin-btn">
              Loading...
            </Button>
          ) : isCheckedIn ? (
            <Button onClick={handleCheckOut} className="checkout-btn">
              Check-Out
            </Button>
          ) : (
            <Button onClick={handleCheckIn} className="checkin-btn">
              Check-In
            </Button>
          )}
        </div>
        <div className="user-info">
          <span className="user-name">
            {user?.employee.firstName + " " + user?.employee.lastName || "User"}
          </span>
          <span className="user-email">{user?.email}</span>
        </div>
        <div className="avatar-container" ref={dropdownRef}>
          <div className="avatar" onClick={toggleDropdown}>
            {user?.employee.firstName.charAt(0).toUpperCase() || "U"}
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {user?.role === "admin" && (
                <button className="dropdown-item" onClick={handleLoginAsUser}>
                  Login as User
                </button>
              )}
              <button
                className="dropdown-item"
                onClick={() => {
                  onLogout();
                  setIsDropdownOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;