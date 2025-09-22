import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import LeaveContainer from './LeaveContainer';
import LeaveBalanceView from './LeaveBalanceView';

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const EmployeeLeaveDetails = ({ role }) => {
  const [tabValue, setTabValue] = useState(0);
  const user=JSON.parse(localStorage.getItem("user"));
  const employeeId=user?.employee?.id;
  

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs sx={{
        marginLeft: '2.8rem'
      }} value={tabValue} onChange={handleTabChange}>
        <Tab label="Leaves" />
        <Tab label="Balance" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <LeaveContainer />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <LeaveBalanceView employeeId={parseInt(employeeId || '0')} />
      </TabPanel>
    </Box>
  );
};

export default EmployeeLeaveDetails;