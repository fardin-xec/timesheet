import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import "../../styles/employeeLeaveDailog.css"

// Animation variants - moved outside component to avoid recreation
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.4
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const tabContentVariants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0,
    x: 20,
    transition: { duration: 0.15 }
  }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3
    }
  })
};

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

  // Handle dialog close and reset rules
  const handleClose = useCallback(() => {
    setRules(null);
    onClose();
  }, [onClose]);

  // Fetch employee data when dialog opens or dependencies change
  useEffect(() => {
    if (open && employee) {
      setLoading(true);
      const loadData = async () => {
        try {
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
    if (newValue === tabValue) return;
    startTransition(() => {
      setTabValue(newValue);
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
            setLeaveBalance(balanceData.data);
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
        setLeaveBalance(balance.data);

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
        setLeaveBalance(balance.data);

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
      <motion.div
        key="leaves-tab"
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h3 
            className="text-xl font-semibold text-gray-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Applied Leaves
          </motion.h3>
          <motion.select
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.05 }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </motion.select>
        </div>
        {loading || isPending ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full"
            />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : leaves.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Leave Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">End Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No. of Days</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <AnimatePresence>
                  {leaves.map((leave, index) => (
                    <motion.tr
                      key={leave.id}
                      custom={index}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ backgroundColor: "#f0f9ff", scale: 1.01 }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{leave.leaveType}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{leave.appliedDays}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{leave.reason}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-50 rounded-lg"
          >
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No leaves applied for {selectedYear}</p>
          </motion.div>
        )}
      </motion.div>
    ),
    [leaves, loading, isPending, selectedYear, years]
  );

  // Memoized Rules tab content
  const RulesTab = useMemo(
    () => (
      <motion.div
        key="rules-tab"
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="p-6"
      >
        <motion.h3 
          className="text-xl font-semibold text-gray-800 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Assigned Rules
        </motion.h3>
        {loading || isPending ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full"
            />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : rules?.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rule Name</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <AnimatePresence>
                  {rules.map((rule, index) => (
                    <motion.tr
                      key={rule.id}
                      custom={index}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      whileHover={{ backgroundColor: "#f0f9ff" }}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{rule.name}</td>
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                          aria-label={`Delete rule ${rule.name}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-50 rounded-lg mb-6"
          >
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No rules assigned</p>
          </motion.div>
        )}
        <motion.div 
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            disabled={loading}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50"
            aria-label="Assign new rule"
          >
            <option value="">Select Rule</option>
            {availableRules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.name}
              </option>
            ))}
          </motion.select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAssignRule}
            disabled={loading || !newRule}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            Assign Rule
          </motion.button>
        </motion.div>
      </motion.div>
    ),
    [rules, loading, isPending, newRule, availableRules, handleDeleteRule, handleAssignRule]
  );

  // Memoized Balance tab content
  const BalanceTab = useMemo(
    () => (
      <motion.div
        key="balance-tab"
        variants={tabContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="p-6"
      >
        <motion.h3 
          className="text-xl font-semibold text-gray-800 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Leave Balance
        </motion.h3>
        {loading || isPending ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full"
            />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : leaveBalance.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Leave Type</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Availed</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Total Entitled</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Carry Forward</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <AnimatePresence>
                  {leaveBalance.map((balance, index) => (
                    <motion.tr
                      key={balance.leaveType}
                      custom={index}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ backgroundColor: "#f0f9ff" }}
                    >
                      <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">{balance.leaveType}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{balance.used}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{balance.totalAllowed}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-700">{balance.carryForwarded}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          (balance.totalAllowed - balance.used) > 5 ? 'bg-green-100 text-green-800' :
                          (balance.totalAllowed - balance.used) > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(balance.totalAllowed - balance.used).toFixed(2)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-50 rounded-lg"
          >
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No balance data available</p>
          </motion.div>
        )}
      </motion.div>
    ),
    [leaveBalance, loading, isPending]
  );

  // Render nothing if dialog is closed or no employee data
  if (!open || !employee) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white z-10 rounded-t-xl">
              <div className="flex-1">
                <motion.h2 
                  className="text-2xl font-semibold text-gray-800 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {employee.firstName} {employee.lastName}
                </motion.h2>
                <motion.div
                  className="flex flex-wrap gap-4 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span className="font-medium">ID:</span>
                    <span>{employee.employeeId || employee.id}</span>
                  </div>
                  {employee.department && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">Department:</span>
                      <span>{employee.department}</span>
                    </div>
                  )}
                  {employee.position && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Position:</span>
                      <span>{employee.position}</span>
                    </div>
                  )}
                </motion.div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Close dialog"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 relative sticky top-[89px] bg-white z-10">
              <motion.div
                className="absolute bottom-0 h-0.5 bg-blue-600"
                animate={{
                  width: `${100/3}%`,
                  x: `${tabValue * 100}%`,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              />
              {['Leaves', 'Rules', 'Balance'].map((tab, index) => (
                <motion.button
                  key={tab}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange(index)}
                  className={`flex-1 p-4 text-center text-sm font-medium transition-colors ${
                    tabValue === index 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  aria-selected={tabValue === index}
                  role="tab"
                >
                  {tab}
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div role="tabpanel" className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {tabValue === 0 && LeavesTab}
                {tabValue === 1 && RulesTab}
                {tabValue === 2 && BalanceTab}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AnimatePresence>
  );
};

export default EmployeeDialog;