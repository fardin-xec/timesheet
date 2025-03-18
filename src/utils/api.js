// src/utils/api.js
import usersData from '../data/users.json';
import expensesData from '../data/expenses.json';
import timesheetData from '../data/timesheet.json';
import leaveData from '../data/leaves.json';

// In a real app, you'd use a backend API to handle this
// This is a simulated API using localStorage to persist the data
const USERS_STORAGE_KEY = 'auth_app_users';

// Load initial data from JSON file if not already in localStorage
const initializeUsers = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersData.users));
  }
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));
};

// Get users from localStorage
const getUsers = () => {
  return usersData.users|| [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Login user
export const loginUser = async (credentials) => {
  await delay(800); // Simulate API delay
  
  // Initialize users if needed
  initializeUsers();
  
  const users = getUsers();
  const user = users.find(u => u.email === credentials.email);
  
  if (!user || user.password !== credentials.password) {
    throw new Error('Invalid email or password');
  }
  
  const { password, ...userWithoutPassword } = user;
  
  return {
    token: `mock-jwt-token-${user.id}`,
    user: userWithoutPassword
  };
};

// Register user
export const registerUser = async (userData) => {
  await delay(1000); // Simulate API delay
  
  // Initialize users if needed
  initializeUsers();
  
  const users = getUsers();
  
  if (users.find(u => u.email === userData.email)) {
    throw new Error('Email already in use');
  }
  
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    ...userData
  };
  
  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  
  const { password, ...userWithoutPassword } = newUser;
  
  return {
    token: `mock-jwt-token-${newUser.id}`,
    user: userWithoutPassword
  };
};


const getUsersUsingJson = () => {
  return usersData.users || [];
};


// Update password (when user knows their current password)
export const updatePassword = async (userId, currentPassword, newPassword) => {
  await delay(800); // Simulate API delay
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  if (users[userIndex].password !== currentPassword) {
    throw new Error('Current password is incorrect');
  }
  
  // Update the password
  users[userIndex].password = newPassword;
  saveUsers(users);
  
  return {
    success: true,
    message: 'Password updated successfully'
  };
};

// Reset forgotten password with token
export const completePasswordReset = async (email, newPassword, token) => {
  await delay(800); // Simulate API delay
  
  // In a real app, you would validate the token
  // Here we're simulating that the token is valid
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Update the password
  users[userIndex].password = newPassword;
  saveUsers(users);
  
  return {
    success: true,
    message: 'Password has been reset successfully'
  };
};

// Add these functions to your src/utils/api.js file

// Store OTPs temporarily (in a real app, these would be stored in a database)
const otpStore = 123456;

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Reset password with OTP (modify the existing resetPassword function)
export const resetPassword = async (email) => {
  await delay(1000); // Simulate API delay
  
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('No account found with this email address');
  }
  
  // Generate and store OTP
  const otp = generateOTP();
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes expiry
  };
  
  console.log(`OTP for ${email}: ${otp}`); // For testing purposes only
  
  // In a real app, you would send this OTP via email or SMS
  return {
    success: true,
    message: 'OTP has been sent to your email'
  };
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  await delay(800); // Simulate API delay
  
  if (!otpStore[email]) {
    throw new Error('OTP expired or not requested. Please request a new OTP.');
  }
  
  const storedOtp = otpStore[email];
  
  if (Date.now() > storedOtp.expiresAt) {
    delete otpStore[email];
    throw new Error('OTP has expired. Please request a new one.');
  }
  
  if (storedOtp.otp !== otp) {
    throw new Error('Invalid OTP. Please try again.');
  }
  
  return {
    success: true,
    message: 'OTP verified successfully'
  };
};

// Reset password with verified OTP
export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  await delay(800); // Simulate API delay
  
  // Verify OTP first
  try {
    await verifyOtp(email, otp);
  } catch (error) {
    throw error;
  }
  
  // Update password
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Update the password
  users[userIndex].password = newPassword;
  saveUsers(users);
  
  // Clear the OTP
  delete otpStore[email];
  
  return {
    success: true,
    message: 'Password has been reset successfully'
  };
};

// Add these functions to your src/utils/api.js file

// Get user profile
export const getUserProfile = async (email) => {
  await delay(600); // Simulate API delay
  
  const users =  getUsersUsingJson();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Return user profile without sensitive information
  const { password, ...userProfile } = user;
  
  return {
    success: true,
    profile: userProfile
  };
};

// Update user profile
export const updateUserProfile = async (email, profileData) => {
  await delay(800); // Simulate API delay
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Update only the provided fields, preserving other user data
  const updatedUser = {
    ...users[userIndex],
    ...profileData,
    // Ensure id remains unchanged
    id: users[userIndex].id
  };
  
  // Don't allow password to be updated through this endpoint
  updatedUser.password = users[userIndex].password;
  
  // Update the user in the array
  users[userIndex] = updatedUser;
  saveUsers(users);
  
  // Return updated profile without sensitive information
  const { password, ...updatedProfile } = updatedUser;
  
  return {
    success: true,
    message: 'Profile updated successfully',
    profile: updatedProfile
  };
};

const expensesDataUsingJson = () => {
  return expensesData || {};
};

// API utility function to fetch expenses data
export const getExpensesData = () => {
  try {
    // In a real app, you would use fetch or axios to get data from an API
    // For this example, we'll simulate an API call by importing the JSON directly
    const response = expensesDataUsingJson();
    console.log(response)
   
    return  response;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};


const timesheetDataUsingJson = () => {
  return timesheetData.data || [];
};

export const fetchTimesheetEntries = () => {
  try {
    // In a real app, you would use fetch or axios to get data from an API
    // For this example, we'll simulate an API call by importing the JSON directly
    const response = timesheetDataUsingJson();
    console.log(response)
   
    return  response;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const updateTimesheetEntry = async (entry) => {
  try {
    // In a real app, you would send a PUT request to update data
    // For this example, we'll simulate the update and return the entry
    console.log('Updating entry:', entry);
    
    // Here you would normally update the JSON or database
    // For now, we'll just return the updated entry as if it was successful
    return entry;
  } catch (error) {
    console.error('Error updating timesheet entry:', error);
    throw error;
  }
};

export const createTimesheetEntry = async (entry) => {
  try {
    // In a real app, you would send a PUT request to update data
    // For this example, we'll simulate the update and return the entry
    console.log('Creating entry:', entry);
    
    // Here you would normally update the JSON or database
    // For now, we'll just return the updated entry as if it was successful
    return entry;
  } catch (error) {
    console.error('Error updating timesheet entry:', error);
    throw error;
  }
};
export const deleteTimesheetEntry = async (entry) => {
  try {
    // In a real app, you would send a PUT request to update data
    // For this example, we'll simulate the update and return the entry
    console.log('Deleting entry:', entry);
    
    // Here you would normally update the JSON or database
    // For now, we'll just return the updated entry as if it was successful
    return entry;
  } catch (error) {
    console.error('Error updating timesheet entry:', error);
    throw error;
  }
};



const leavesDataUsingJson = () => {
  return leaveData.data || [];
};

export const fetchleavesEntries = () => {
  try {
    // In a real app, you would use fetch or axios to get data from an API
    // For this example, we'll simulate an API call by importing the JSON directly
    const response = leavesDataUsingJson();
    console.log(response)
   
    return  response;
  } catch (error) {
    console.error('Error fetching leaves:', error);
    throw error;
  }
};

export const updateleavesEntry = async (entry) => {
  try {
    // In a real app, you would send a PUT request to update data
    // For this example, we'll simulate the update and return the entry
    console.log('Updating entry:', entry);
    
    // Here you would normally update the JSON or database
    // For now, we'll just return the updated entry as if it was successful
    return entry;
  } catch (error) {
    console.error('Error updating leaves entry:', error);
    throw error;
  }
};

export const createleavesEntry = async (entry) => {
  try {
    // In a real app, you would send a PUT request to update data
    // For this example, we'll simulate the update and return the entry
    console.log('Creating entry:', entry);
    
    // Here you would normally update the JSON or database
    // For now, we'll just return the updated entry as if it was successful
    return entry;
  } catch (error) {
    console.error('Error updating leaves entry:', error);
    throw error;
  }
};
export const deleteleavesEntry = async (entry) => {
  try {
    // In a real app, you would send a PUT request to update data
    // For this example, we'll simulate the update and return the entry
    console.log('Deleting entry:', entry);
    
    // Here you would normally update the JSON or database
    // For now, we'll just return the updated entry as if it was successful
    return entry;
  } catch (error) {
    console.error('Error updating leaves entry:', error);
    throw error;
  }
};