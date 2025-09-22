import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Paper,
  IconButton,
} from "@mui/material";
import api from "../../utils/api_call";
import "../../styles/employeeDailog.css";
import { Trash2 } from "lucide-react";
import { Facebook, LinkedIn, Twitter } from "@mui/icons-material";

const EmployeeProfileDialog = ({
  open,
  onClose,
  employee,
  departments,
  workLocation,
  employmentType,
  positions,
  onSave,
  managers,
}) => {
  const token = localStorage.getItem("access_token");
  const [activeTab, setActiveTab] = useState(0);
  const [employeeData, setEmployeeData] = useState(
    employee || { reportingManagers: [], reportTo: null }
  );
  const [personalData, setPersonalData] = useState({
    id: 0,
    email: "",
    alternativePhone: "",
    bloodGroup: "",
    weddingAnniversary: "",
    maritalStatus: "",
    currentAddress: "",
    permanentAddress: "",
  });
  const [loading, setLoading] = useState(true);
  const [reportingManager, setReportingManager] = useState([]);
  const [subOrdinates, setSubOrdinates] = useState([]);

  const ManagerList = [
    "Manager",
    "Lead",
    "Senior",
    "Director",
    "VP",
    "C-Level",
  ];

  const Currency = {
    USD: "USD",
    EUR: "EUR",
    INR: "INR",
    GBP: "GBP",
    AUD: "AUD",
    CAD: "CAD",
    QAR: "QAR",
    JPY: "JPY",
    CHF: "CHF",
    CNY: "CNY",
    BRL: "BRL",
  };
  // Memoized fetch functions
  const fetchEmployeePersonalData = useCallback(
    async (employeeId) => {
      try {
        setLoading(true);
        const response = await api.get(`/personal/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.data) {
          setPersonalData(response.data.data);
        } else {
          setPersonalData({ id: employeeId });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee personal data:", error);
        setLoading(false);
      }
    },
    [token]
  );

  const fetchReportingManagerData = useCallback(
    async (employeeId) => {
      try {
        setLoading(true);
        const response = await api.get(
          `/employees/${employeeId}/reprotingManager`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.data) {
          setReportingManager(response.data.data);
          setEmployeeData((prev) => ({
            ...prev,
            reportingManagers: response.data.data,
            reportTo: response.data.data[0]?.id || null, // Set primary manager
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reporting manager data:", error);
        setLoading(false);
      }
    },
    [token]
  );

  const fetchSubordinatesData = useCallback(
    async (employeeId) => {
      try {
        setLoading(true);
        const response = await api.get(
          `/employees/${employeeId}/subordinates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Subordinates response:", response.data.data); // Debug
        if (response.data.data) {
          setSubOrdinates(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subordinates data:", error);
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    
    if (employee) {
      setEmployeeData((prev) => ({ ...prev, ...employee }));
      fetchEmployeePersonalData(employee.id);
      fetchReportingManagerData(employee.id);
      fetchSubordinatesData(employee.id);
    }
  }, [
    employee,
    fetchEmployeePersonalData,
    fetchReportingManagerData,
    fetchSubordinatesData,
  ]);

  useEffect(() => {
    console.log("PersonalData", personalData);
  }, [personalData]); // Trigger on designation or subordinates change

  const handleRemoveManager = (index) => {
    setEmployeeData((prev) => {
      const updatedManagers = [...(prev.reportingManagers || [])];
      updatedManagers.splice(index, 1);
      const newReportTo =
        updatedManagers.length > 0 ? updatedManagers[0]?.id : null;
      return {
        ...prev,
        reportingManagers: updatedManagers,
        reportTo: newReportTo,
      };
    });
    setReportingManager((prev) => {
      const updated = [...(prev || [])];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleManagerSelection = (managerId) => {
    setEmployeeData((prev) => {
      const updatedData = { ...prev, reportTo: managerId };
      return updatedData;
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field, value) => {
    setEmployeeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  useEffect(() => {
        console.log(employee);

    console.log(employeeData);
    
  }, [employeeData,employee]);

  const handlePersonalInputChange = (field, value) => {
    setPersonalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getColorForStatus = (status) => {
    switch (status) {
      case "working":
        return "#22c55e";
      case "off":
        return "#ef4444";
      case "half":
        return "#eab308";
      default:
        return "#d1d5db";
    }
  };

  const getStatusForDay = (week, day) => {
    if (day === "fri" || day === "sat") {
      return "off";
    }
    return "working";
  };

  const renderWorkWeekTable = () => {
    const weeks = [1, 2, 3, 4, 5];
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dayLabels = {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    };

    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "16px",
          mt: 2,
        }}
      >
        <Typography variant="h6" className="font-bold mb-4">
          Fri & Sat Weekoffs
        </Typography>
        <div className="mb-4">
          <div className="mb-2">
            <Typography variant="subtitle2" className="text-gray-700">
              Description
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Custom Rule created
            </Typography>
          </div>
          <div className="mb-2">
            <Typography variant="subtitle2" className="text-gray-700">
              Effective Date
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              01 Dec, 2024
            </Typography>
          </div>
          <div className="mb-4">
            <Typography variant="subtitle2" className="text-gray-700">
              Rule Settings
            </Typography>
          </div>
          <div className="flex justify-end items-center mb-4">
            <input
              type="checkbox"
              id="halfDayEnabled"
              checked={employeeData.halfDayEnabled || false}
              onChange={(e) =>
                handleInputChange("halfDayEnabled", e.target.checked)
              }
              className="mr-2"
            />
            <label htmlFor="halfDayEnabled" className="text-gray-700">
              Half Day
            </label>
          </div>
        </div>
        <div className="overflow-x-auto work-week-table-container">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-center sticky-header">
                  Week
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-200 bg-gray-50 px-4 py-2 text-center sticky-header"
                  >
                    {dayLabels[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week}>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {week}
                  </td>
                  {days.map((day) => {
                    const status = getStatusForDay(week, day);
                    return (
                      <td
                        key={day}
                        className="border border-gray-200 px-4 py-2 text-center"
                      >
                        <div
                          className="w-8 h-8 rounded-sm flex items-center justify-center"
                          style={{ backgroundColor: getColorForStatus(status) }}
                          aria-label={`${status} - ${dayLabels[day]} week ${week}`}
                        ></div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="color-legend">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-500 mr-2 rounded-sm"></div>
            <span className="text-sm">Working Day</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-red-500 mr-2 rounded-sm"></div>
            <span className="text-sm">Weekly Off</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-yellow-500 mr-2 rounded-sm"></div>
            <span className="text-sm">Half Day</span>
          </div>
        </div>
      </Paper>
    );
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="flex items-center p-4 border-b sticky-header employee-header">
              <Avatar
                src={employeeData.avatar || "/default-avatar.png"}
                alt={`${employeeData.firstName} ${employeeData.lastName}`}
                className="w-16 h-16 mr-4"
              />
              <div>
                <Typography variant="h5" className="font-medium">
                  {employeeData.firstName} {employeeData.lastName || "Unknown"}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {employeeData.jobTitle || "N/A"} •{" "}
                  {employeeData.department || "N/A"}
                </Typography>
              </div>
            </div>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className="tabs-container sticky-tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                className={`tab ${activeTab === 0 ? "active" : ""}`}
                label="Personal"
              />
              <Tab
                className={`tab ${activeTab === 1 ? "active" : ""}`}
                label="Team"
              />
              <Tab
                className={`tab ${activeTab === 2 ? "active" : ""}`}
                label="Work Week"
              />
              <Tab
                className={`tab ${activeTab === 3 ? "active" : ""}`}
                label="CTC"
              />
              <Tab
                className={`tab ${activeTab === 4 ? "active" : ""}`}
                label="Documents"
              />
              <Tab
                className={`tab ${activeTab === 5 ? "active" : ""}`}
                label="Education"
              />
              <Tab
                className={`tab ${activeTab === 6 ? "active" : ""}`}
                label="Family"
              />
            </Tabs>
            <div className="tab-content p-4">
              {activeTab === 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6" className="font-medium">
                      PERSONAL INFO
                    </Typography>
                    <button
                      className="text-blue-500"
                      onClick={() => console.log("Edit clicked")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-500 mb-1"
                      >
                        Name
                      </Typography>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={`${employeeData.firstName || ""} ${
                          employeeData.middleName || ""
                        } ${employeeData.lastName || ""}`}
                        readOnly
                      />
                    </div>
                    <div>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-500 mb-1"
                      >
                        Date of Birth
                      </Typography>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={employeeData.dob || ""}
                        readOnly
                      />
                    </div>
                    <div>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-500 mb-1"
                      >
                        Gender
                      </Typography>
                      <input
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={employeeData.gender || ""}
                        readOnly
                      />
                    </div>
                    <div>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-500 mb-1"
                      >
                        Blood Group
                      </Typography>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={personalData?.bloodGroup}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "bloodGroup",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-500 mb-1"
                      >
                        Marital Status
                      </Typography>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={personalData?.maritalStatus}
                        onChange={(e) =>
                          handlePersonalInputChange(
                            "maritalStatus",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                    {personalData?.maritalStatus === "married" && (
                      <div>
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 mb-1"
                        >
                          Marriage Anniversary
                        </Typography>
                        <input
                          type="date"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={personalData?.weddingAnniversary}
                          onChange={(e) =>
                            handlePersonalInputChange(
                              "weddingAnniversary",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <Typography variant="h6" className="font-medium">
                        CONTACT INFO
                      </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 mb-1"
                        >
                          Official Email ID
                        </Typography>
                        <input
                          type="email"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={employeeData.email || ""}
                          readOnly
                        />
                      </div>
                      <div>
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 mb-1"
                        >
                          Personal Email ID
                        </Typography>
                        <input
                          type="email"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={personalData?.email}
                          onChange={(e) =>
                            handlePersonalInputChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 mb-1"
                        >
                          Phone Number
                        </Typography>
                        <input
                          type="tel"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={employeeData.phone || ""}
                          readOnly
                        />
                      </div>
                      <div>
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 mb-1"
                        >
                          Alternate Phone Number
                        </Typography>
                        <input
                          type="tel"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={personalData?.alternativePhone}
                          onChange={(e) =>
                            handlePersonalInputChange(
                              "alternativePhone",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <Typography variant="h6" className="font-medium">
                        ADDRESSES
                      </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 mb-1"
                        >
                          Current Address
                        </Typography>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="3"
                          value={personalData?.currentAddress}
                          onChange={(e) =>
                            handlePersonalInputChange(
                              "currentAddress",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Typography
                          variant="subtitle2"
                          className="text-gray-500 mb-1"
                        >
                          Permanent Address
                        </Typography>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="3"
                          value={personalData?.permanentAddress}
                          onChange={(e) =>
                            handlePersonalInputChange(
                              "permanentAddress",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <Typography variant="h6" className="font-medium">
                        SOCIAL PROFILE
                      </Typography>
                    </div>
                    <div className="flex space-x-4">
                      {/* LinkedIn Button */}
                      <button
                        className="bg-blue-600 text-white p-2 rounded-full"
                        onClick={() =>
                          window.open("https://www.linkedin.com", "_blank")
                        }
                      >
                        <LinkedIn className="w-5 h-5" />
                      </button>

                      {/* Facebook Button */}
                      <button
                        className="bg-blue-800 text-white p-2 rounded-full"
                        onClick={() =>
                          window.open("https://www.facebook.com", "_blank")
                        }
                      >
                        <Facebook className="w-5 h-5" />
                      </button>

                      {/* Twitter/X Button */}
                      <button
                        className="bg-blue-400 text-white p-2 rounded-full"
                        onClick={() =>
                          window.open("https://www.twitter.com", "_blank")
                        }
                      >
                        <Twitter className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <div>
                    <Typography
                      variant="subtitle2"
                      className="text-gray-500 mb-1"
                    >
                      Reporting Manager
                    </Typography>
                    {reportingManager && reportingManager.length > 0 ? (
                      <div className="border rounded-md">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="p-2">Name</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Department</th>
                              <th className="p-2">Designation</th>
                              <th className="p-2">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportingManager.map((manager, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">
                                  {manager.firstName} {manager.midName || ""}{" "}
                                  {manager.lastName || ""}
                                </td>
                                <td className="p-2">
                                  <input
                                    className="w-full p-1 border border-gray-300 rounded-md"
                                    value={manager.type || "Primary"}
                                    readOnly
                                  />
                                </td>
                                <td className="p-2">
                                  {manager.department || "N/A"}
                                </td>
                                <td className="p-2">
                                  {manager.designation || "N/A"}
                                </td>
                                <td className="p-2">
                                  <IconButton
                                    aria-label="delete"
                                    sx={{
                                      color: "gray.500",
                                      "&:hover": {
                                        color: "red.500",
                                      },
                                    }}
                                    onClick={() => handleRemoveManager(index)}
                                  >
                                    <Trash2 size={20} />
                                  </IconButton>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-gray-500 p-2">
                          No Secondary managers assigned.
                        </p>
                        {ManagerList.includes(employeeData.designation) && (
                          <>
                            <Typography
                              variant="subtitle2"
                              className="text-gray-500 mb-1"
                            >
                              Subordinates
                            </Typography>
                            {subOrdinates && subOrdinates.length > 0 ? (
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-gray-50 border-b">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2">Department</th>
                                    <th className="p-2">Designation</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subOrdinates.map((subordinate, index) => (
                                    <tr key={index} className="border-b">
                                      <td className="p-2">
                                        {subordinate.firstName || ""}{" "}
                                        {subordinate.midName || ""}{" "}
                                        {subordinate.lastName || ""}
                                      </td>
                                      <td className="p-2">
                                        <input
                                          className="w-full p-1 border border-gray-300 rounded-md"
                                          value={
                                            subordinate.type || "Subordinate"
                                          }
                                          readOnly
                                        />
                                      </td>
                                      <td className="p-2">
                                        {subordinate.department || "N/A"}
                                      </td>
                                      <td className="p-2">
                                        {subordinate.designation || "N/A"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-gray-500 p-2">
                                No subordinates assigned.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md mb-2"
                          value={employeeData.reportTo}
                          onChange={(e) =>
                            handleManagerSelection(e.target.value)
                          }
                        >
                          <option value="">Select Manager</option>
                          {managers
                            .filter((manager) => manager.id !== employeeData.id)
                            .map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {`${manager.firstName || ""} ${
                                  manager.midName || ""
                                } ${manager.lastName || ""} - ${
                                  manager.department || "N/A"
                                }`}
                              </option>
                            ))}
                        </select>
                        {ManagerList.includes(employeeData.designation) && (
                          <>
                            <Typography
                              variant="subtitle2"
                              className="text-gray-500 mb-1"
                            >
                              Subordinates
                            </Typography>
                            {subOrdinates && subOrdinates.length > 0 ? (
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-gray-50 border-b">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2">Department</th>
                                    <th className="p-2">Designation</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subOrdinates.map((subordinate, index) => (
                                    <tr key={index} className="border-b">
                                      <td className="p-2">
                                        {subordinate.firstName || ""}{" "}
                                        {subordinate.midName || ""}{" "}
                                        {subordinate.lastName || ""}
                                      </td>
                                      <td className="p-2">
                                        <input
                                          className="w-full p-1 border border-gray-300 rounded-md"
                                          value={
                                            subordinate.type || "Subordinate"
                                          }
                                          readOnly
                                        />
                                      </td>
                                      <td className="p-2">
                                        {subordinate.department || "N/A"}
                                      </td>
                                      <td className="p-2">
                                        {subordinate.designation || "N/A"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-gray-500 p-2">
                                No subordinates assigned.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 2 && renderWorkWeekTable()}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <div>
                    <Typography
                      variant="subtitle2"
                      className="text-gray-500 mb-1"
                    >
                      CTC
                    </Typography>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={employeeData?.ctc}
                      onChange={(e) => handleInputChange("ctc", e.target.value)}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="subtitle2"
                      className="text-gray-500 mb-1"
                    >
                      Currency
                    </Typography>
                    <select
                      value={employeeData?.currency}
                      onChange={(e) =>
                        handleInputChange("currency", e.target.value)
                      }
                      className="w-full p-2 border rounded-md border-gray-300"
                    >
                      <option value={""}></option>
                      <option value={Currency.QAR}>Qatari Riyal (QAR)</option>
                      <option value={Currency.INR}>Indian Rupee (INR)</option>
                      <option value={Currency.USD}>
                        United States Dollar (USD)
                      </option>
                      <option value={Currency.EUR}>Euro (EUR)</option>
                      <option value={Currency.GBP}>British Pound (GBP)</option>
                      <option value={Currency.AUD}>
                        'Australian Dollar (AUD)
                      </option>
                      <option value={Currency.CAD}>
                        Canadian Dollar (CAD)
                      </option>
                      <option value={Currency.JPY}>Japanese Yen (JPY)</option>
                      <option value={Currency.CNY}>Chinese Yuan (CNY)</option>
                      <option value={Currency.BRL}>Brazilian Real (BRL)</option>
                    </select>
                  </div>
                  {/* <div>
                    <Typography
                      variant="subtitle2"
                      className="text-gray-500 mb-1"
                    >
                      Account Holder Name
                    </Typography>
                    <input
                      type="text"
                      className="input-field bg-highlight"
                      value={employeeData.bank_info.account_holder_name}
                      onChange={(e) =>
                        handleInputChange(
                          "bank_info.account_holder_name",
                          e.target.value
                        )
                      }
                    />
                  </div> */}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "1.5rem",
                  gap: "16px",
                }}
              >
                <Button variant="outlined" onClick={onClose}>
                  Cancel
                </Button>
                {activeTab !== 2 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      onSave(activeTab === 1 || activeTab === 3  ? employeeData : personalData)
                    }
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfileDialog;
