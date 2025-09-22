import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchEmployeeLeaves,
  fetchEmployeeRules,
  assignRule,
  fetchLeaveBalance,
  fetchAllLeaveRules,
  unassignLeaveRule,
} from "../../utils/api";

const EmployeeDialog = ({ open, onClose, employee }) => {
  const [tabValue, setTabValue] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [rules, setRules] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPending, startTransition] = useTransition();
  const [isTabChanging, setIsTabChanging] = useState(false);
  // const user = JSON.parse(localStorage.getItem("user"));
  // const employeeId = user.employee.id;

  // Handle dialog close and reset rules
  const handleClose = useCallback(() => {
    setRules(null); // Reset rules to null when closing
    onClose(); // Call the original onClose prop
  }, [onClose]);

  // Fetch employee data when dialog opens or dependencies change
  useEffect(() => {
    if (open && employee) {
      setLoading(true);
      const loadData = async () => {
        try {
          console.log(employee);

          const [leavesData, rulesData, balanceData, allRulesData] =
            await Promise.all([
              fetchEmployeeLeaves(employee.id),
              fetchEmployeeRules(employee.id),
              fetchLeaveBalance(employee.id),
              fetchAllLeaveRules(employee.orgId),
            ]);

          const sortedLeaves = leavesData.sort(
            (a, b) => new Date(b.startDate) - new Date(a.startDate)
          );
          const assignedRuleNames = rulesData.map((rule) => rule.name);
          const unassignedRules = allRulesData.filter(
            (rule) => !assignedRuleNames.includes(rule.name)
          );
          console.log(allRulesData);
          

          setLeaves(
            sortedLeaves.filter(
              (leave) =>
                new Date(leave.startDate).getFullYear() === selectedYear
            )
          );

          setRules(rulesData);
          setLeaveBalance(balanceData);
          setAvailableRules(unassignedRules);
          toast.success("Employee data loaded successfully");
        } catch (err) {
          toast.error(err.message);
          console.error("Failed to load employee data:", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [open, employee, selectedYear]);

  // Handle tab changes with smooth transitions
  const handleTabChange = useCallback((newValue) => {
    if (newValue === tabValue) return; // Prevent unnecessary transitions
    
    setIsTabChanging(true);
    
    startTransition(() => {
      // Add a small delay to show the transition effect
      setTimeout(() => {
        setTabValue(newValue);
        setTimeout(() => {
          setIsTabChanging(false);
        }, 150); // Match the CSS transition duration
      }, 100);
    });
  }, [tabValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (employee) {
          if (tabValue === 1) {
            const rulesData = await fetchEmployeeRules(employee.id);
            setRules(rulesData);
            const availableRules = await fetchAllLeaveRules(employee.orgId);
            const assignedRuleNames = rulesData.map((rule) => rule.name);
            const unassignedRules = availableRules.filter(
              (rule) => !assignedRuleNames.includes(rule.name)
            );
            setAvailableRules(unassignedRules);
          } else if (tabValue === 2) {
            const balanceData = await fetchLeaveBalance(employee.id);
            setLeaveBalance(balanceData);
          }
        }
      } catch (err) {
        toast.error(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tabValue, employee]);

  // Update leave status
  // const handleStatusChange = useCallback(
  //   async (leaveId, newStatus) => {
  //     setLoading(true);
  //     try {
  //       const updatedStatus = {
  //         status: newStatus,
  //         approvedBy: employeeId,
  //       };
  //       await updateLeaveStatus(leaveId, updatedStatus);
  //       setLeaves((prev) =>
  //         prev.map((leave) =>
  //           leave.id === leaveId ? { ...leave, status: newStatus } : leave
  //         )
  //       );
  //       toast.success("Leave status updated");
  //     } catch (err) {
  //       toast.error(err.message);
  //       console.error("Failed to update leave status:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [employeeId]
  // );

  // Delete a rule
  const handleDeleteRule = useCallback(
    async (ruleId) => {
      setLoading(true);
      try {
        await unassignLeaveRule(employee.id, ruleId);
        const updatedRules = rules.filter((rule) => rule.id !== ruleId);
        setRules(updatedRules);
        const allRulesData = await fetchAllLeaveRules(employee.orgId);
        const assignedRuleNames = updatedRules.map((rule) => rule.name);
        setAvailableRules(
          allRulesData.filter((rule) => !assignedRuleNames.includes(rule.name))
        );
        const balance = await fetchLeaveBalance(employee.id);
        setLeaveBalance(balance);

        toast.success("Rule deleted");
      } catch (err) {
        toast.error(err.message);
        console.error("Failed to delete rule:", err);
      } finally {
        setLoading(false);
      }
    },
    [employee, rules]
  );

  // Assign a new rule
  const handleAssignRule = useCallback(async () => {
    if (newRule) {
      setLoading(true);
      try {
        await assignRule(employee.id, newRule);
        const updatedRules = await fetchEmployeeRules(employee.id);
        setRules(updatedRules);
        setNewRule("");
        const allRulesData = await fetchAllLeaveRules(employee.orgId);
        const assignedRuleNames = updatedRules.map((rule) => rule.name);
        setAvailableRules(
          allRulesData.filter((rule) => !assignedRuleNames.includes(rule.name))
        );
        const balance = await fetchLeaveBalance(employee.id);
        setLeaveBalance(balance);

        toast.success("Rule assigned");
      } catch (err) {
        toast.error(err.message);
        console.error("Failed to assign rule:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [employee, newRule]);

  // Generate list of years for the year filter
  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
    []
  );

  // Memoized Leaves tab content
  const LeavesTab = useMemo(
    () => (
      <div className={`p-6 transition-all duration-300 ease-in-out ${
        isTabChanging ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Applied Leaves</h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-md p-2 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {loading || isPending ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    End Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    No. of Days
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr
                    key={leave.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-sm">{leave.leaveType}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{leave.appliedDays}</td>
                    <td className="px-4 py-3 text-sm">{leave.reason}</td>
                    <td className="px-4 py-3 text-sm">{leave.status}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No leaves applied</p>
        )}
      </div>
    ),
    [leaves, loading, isPending, selectedYear, years, isTabChanging]
  );

  // Memoized Rules tab content
  const RulesTab = useMemo(
    () => (
      <div className={`p-6 transition-all duration-300 ease-in-out ${
        isTabChanging ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
      }`}>
        <h3 className="text-lg font-semibold mb-4">Assigned Rules</h3>
        {loading || isPending ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : rules?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Rule Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-sm">{rule.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200 hover:scale-110 transform"
                        aria-label={`Delete rule ${rule.id}`}
                      >
                        <svg
                          className="w-5 h-5"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No rules assigned</p>
        )}
        <div className="mt-4 flex gap-4">
          <select
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            disabled={loading}
            className="border rounded-md p-2 text-sm flex-1 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            aria-label="Assign new rule"
          >
            <option value="">Select Rule</option>
            {availableRules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignRule}
            disabled={loading || !newRule}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            Assign Rule
          </button>
        </div>
      </div>
    ),
    [
      rules,
      loading,
      isPending,
      newRule,
      availableRules,
      handleDeleteRule,
      handleAssignRule,
      isTabChanging,
    ]
  );

  // Memoized Balance tab content
  const BalanceTab = useMemo(
    () => (
      <div className={`p-6 transition-all duration-300 ease-in-out ${
        isTabChanging ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
      }`}>
        <h3 className="text-lg font-semibold mb-4">Leave Balance</h3>
        {loading || isPending ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : leaveBalance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Availed
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Total Entitled
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Carry Forward
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaveBalance.map((balance) => (
                  <tr
                    key={balance.type}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-sm text-center">{balance.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-center">{balance.used}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {balance.totalAllowed}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {balance.carryForwarded}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {(balance.totalAllowed - balance.used).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No balance data available</p>
        )}
      </div>
    ),
    [leaveBalance, loading, isPending, isTabChanging]
  );

  // Render nothing if dialog is closed or no employee data
  if (!open || !employee) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-50 transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {employee.firstName} {employee.lastName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110 transform"
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
        <div className="flex border-b relative">
          {/* Tab indicator */}
          <div
            className={`absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out`}
            style={{
              width: `${100/3}%`,
              transform: `translateX(${tabValue * 100}%)`,
            }}
          />
          <button
            onClick={() => handleTabChange(0)}
            className={`flex-1 p-4 text-center text-sm transition-all duration-200 ${
              tabValue === 0 ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
            aria-selected={tabValue === 0}
            role="tab"
          >
            Leaves
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex-1 p-4 text-center text-sm transition-all duration-200 ${
              tabValue === 1 ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
            aria-selected={tabValue === 1}
            role="tab"
          >
            Rules
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`flex-1 p-4 text-center text-sm transition-all duration-200 ${
              tabValue === 2 ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
            aria-selected={tabValue === 2}
            role="tab"
          >
            Balance
          </button>
        </div>
        <div role="tabpanel" className="min-h-[400px]">
          {tabValue === 0 && LeavesTab}
          {tabValue === 1 && RulesTab}
          {tabValue === 2 && BalanceTab}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default EmployeeDialog;