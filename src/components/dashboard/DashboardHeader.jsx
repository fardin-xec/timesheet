import React, { useState, useEffect, useRef } from "react";
import Button from "../common/Button";
import { updateAttendance } from "../../utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashboardHeader = ({ user, onLogout }) => {
  // Helper function to get today's date string (YYYY-MM-DD)
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to check if stored data is from today
  const isStoredDataFromToday = () => {
    const storedDate = localStorage.getItem("checkInDate");
    const today = getTodayDateString();
    return storedDate === today;
  };

  // Helper function to clear previous day's data
  const clearPreviousDayData = () => {
    localStorage.removeItem("startTime");
    localStorage.removeItem("elapsedTime");
    localStorage.removeItem("checkOutTime");
    localStorage.removeItem("showCheckOutTime");
    localStorage.removeItem("isCheckedIn");
    localStorage.removeItem("checkInDate");
  };

  // Initialize state from localStorage with proper fallbacks and daily reset
  const [startTime, setStartTime] = useState(() => {
    if (!isStoredDataFromToday()) {
      clearPreviousDayData();
      return null;
    }
    const savedStartTime = localStorage.getItem("startTime");
    return savedStartTime ? new Date(savedStartTime) : null;
  });
  
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (!isStoredDataFromToday()) {
      return 0;
    }
    const savedElapsedTime = localStorage.getItem("elapsedTime");
    return savedElapsedTime ? parseInt(savedElapsedTime, 10) : 0;
  });
  
  const [timerInterval, setTimerInterval] = useState(null);
  
  const [checkOutTime, setCheckOutTime] = useState(() => {
    if (!isStoredDataFromToday()) {
      return null;
    }
    const savedCheckOutTime = localStorage.getItem("checkOutTime");
    return savedCheckOutTime ? new Date(savedCheckOutTime) : null;
  });
  
  const [showCheckOutTime, setShowCheckOutTime] = useState(() => {
    if (!isStoredDataFromToday()) {
      return false;
    }
    const savedShowCheckOutTime = localStorage.getItem("showCheckOutTime");
    return savedShowCheckOutTime === "true";
  });
  
  // Fix: Initialize isCheckedIn from localStorage first, then fallback to user data
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    if (!isStoredDataFromToday()) {
      return false;
    }
    const savedIsCheckedIn = localStorage.getItem("isCheckedIn");
    if (savedIsCheckedIn !== null) {
      return savedIsCheckedIn === "true";
    }
    return user?.isClockedInToday || false;
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check for new day on component mount and periodically
  useEffect(() => {
    const checkForNewDay = () => {
      const storedDate = localStorage.getItem("checkInDate");
      const today = getTodayDateString();
      const isDataFromToday = storedDate === today;
      
      if (!isDataFromToday) {
        // New day detected, reset all timer states
        setStartTime(null);
        setElapsedTime(0);
        setCheckOutTime(null);
        setShowCheckOutTime(false);
        setIsCheckedIn(false);
        
        // Clear timer interval if running
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        
        // Clear localStorage
        clearPreviousDayData();
        
        console.log("New day detected - timer data reset");
      }
    };

    // Check immediately on mount
    checkForNewDay();

    // Check every minute for new day
    const newDayCheckInterval = setInterval(checkForNewDay, 60000);

    return () => {
      clearInterval(newDayCheckInterval);
    };
  }, [timerInterval]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    console.log(user);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  // Handle page visibility change to pause/resume timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, save current elapsed time
        if (isCheckedIn && startTime) {
          const currentElapsedTime = Math.floor(
            (new Date().getTime() - startTime.getTime()) / 1000
          );
          localStorage.setItem("elapsedTime", currentElapsedTime.toString());
        }
      } else {
        // Page is visible again, resume timer if needed
        if (isCheckedIn && startTime && !timerInterval) {
          const resumeElapsedTime = Math.floor(
            (new Date().getTime() - startTime.getTime()) / 1000
          );
          setElapsedTime(resumeElapsedTime);
          
          const interval = setInterval(() => {
            setElapsedTime((prev) => {
              const newElapsed = prev + 1;
              localStorage.setItem("elapsedTime", newElapsed.toString());
              return newElapsed;
            });
          }, 1000);
          setTimerInterval(interval);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCheckedIn, startTime, timerInterval]);

  // Resume timer on mount if checked in
  useEffect(() => {
    if (isCheckedIn && startTime && !timerInterval) {
      const resumeElapsedTime = Math.floor(
        (new Date().getTime() - startTime.getTime()) / 1000
      );
      setElapsedTime(resumeElapsedTime);

      const interval = setInterval(() => {
        setElapsedTime((prev) => {
          const newElapsed = prev + 1;
          localStorage.setItem("elapsedTime", newElapsed.toString());
          return newElapsed;
        });
      }, 1000);
      setTimerInterval(interval);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isCheckedIn, startTime, timerInterval]);

  // Sync localStorage when isCheckedIn changes
  useEffect(() => {
    localStorage.setItem("isCheckedIn", isCheckedIn.toString());
  }, [isCheckedIn]);

  // Handle check-in with API call
  const handleCheckIn = async () => {
    const now = new Date();
    const utcTime = now.toISOString().substr(11, 8);
    const today = getTodayDateString();
    
    setStartTime(now);
    setIsCheckedIn(true);
    setElapsedTime(0);
    setShowCheckOutTime(false);
    setCheckOutTime(null);

    localStorage.setItem("startTime", now.toISOString());
    localStorage.setItem("elapsedTime", "0");
    localStorage.setItem("isCheckedIn", "true");
    localStorage.setItem("showCheckOutTime", "false");
    localStorage.setItem("checkInDate", today); // Store today's date
    localStorage.removeItem("checkOutTime");

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const newElapsed = prev + 1;
        localStorage.setItem("elapsedTime", newElapsed.toString());
        return newElapsed;
      });
    }, 1000);
    setTimerInterval(interval);

    try {
      const data = { checkInTime: utcTime, status: "present" };
      await updateAttendance(user?.employee?.id, data);
      toast.success("Successfully checked in!");
      console.log("Checked in at:", utcTime);
    } catch (err) {
      console.error("Failed to check in:", err);
      toast.error(`Check-in failed: ${err.message || "Unknown error"}`);
      setIsCheckedIn(false);
      setStartTime(null);
      setElapsedTime(0);
      if (timerInterval) clearInterval(timerInterval);
      localStorage.setItem("isCheckedIn", "false");
      localStorage.removeItem("startTime");
      localStorage.removeItem("checkInDate");
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    const now = new Date();
    const utcTime = now.toISOString().substr(11, 8);
    setIsCheckedIn(false);
    setCheckOutTime(now);
    setShowCheckOutTime(true);

    localStorage.setItem("checkOutTime", now.toISOString());
    localStorage.setItem("elapsedTime", elapsedTime.toString());
    localStorage.setItem("isCheckedIn", "false");
    localStorage.setItem("showCheckOutTime", "true");
    localStorage.removeItem("startTime");

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    try {
      const data = { checkOutTime: utcTime };
      await updateAttendance(user?.employee?.id, data);
      toast.success("Successfully checked out!");
      console.log("Checked out at:", utcTime);
    } catch (err) {
      console.error("Failed to check out:", err);
      toast.error(`Check-out failed: ${err.message || "Unknown error"}`);
      setIsCheckedIn(true);
      setCheckOutTime(null);
      setShowCheckOutTime(false);
      localStorage.setItem("isCheckedIn", "true");
      localStorage.removeItem("checkOutTime");
    }
    console.log("Checked out at:", now);
    console.log("Total time:", formatTime(elapsedTime));
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
    const updatedUser = { ...user, role: "user" };

    // Save the updated user back to localStorage
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
        {isCheckedIn && user?.role==='user' && elapsedTime!==0 && (
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
        {user?.role === "user" && (
          <div className="check-buttons">
            {isCheckedIn ? (
              <Button onClick={handleCheckOut} className="checkout-btn">
                Check-Out
              </Button>
            ) : (
              <Button onClick={handleCheckIn} className="checkin-btn">
                Check-In
              </Button>
            )}
          </div>
        )}
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
              {user?.role === "superadmin" && (
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