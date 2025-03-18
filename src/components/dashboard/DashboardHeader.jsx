import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const DashboardHeader = ({ user, onLogout }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [showCheckOutTime, setShowCheckOutTime] = useState(false);

  // Handle check-in
  const handleCheckIn = () => {
    const now = new Date();
    setStartTime(now);
    setIsCheckedIn(true);
    setElapsedTime(0);
    setShowCheckOutTime(false);
    setCheckOutTime(null);
    
    // Start the timer
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
    
    // You might want to call an API to log the check-in
    console.log('Checked in at:', now);
  };

  // Handle check-out
  const handleCheckOut = () => {
    const now = new Date();
    setIsCheckedIn(false);
    setCheckOutTime(now);
    setShowCheckOutTime(true);
    
    // Clear the timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // You might want to call an API to log the check-out
    console.log('Checked out at:', now);
    console.log('Total time:', formatTime(elapsedTime));
  };

  // Format the timer display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clean up the interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  return (
    <header className="dashboard-header">
      <div className="logo">
        <h1>Timesheet App</h1>
      </div>
      
      <div className="time-tracking">
        {isCheckedIn && (
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
        <div className="user-info">
          <span className="user-name">{user?.firstName || 'User'}</span>
          <span className="user-email">{user?.email}</span>
        </div>
        <Button onClick={onLogout} className="logout-btn">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;