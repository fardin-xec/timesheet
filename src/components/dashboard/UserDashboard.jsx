import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert, 
  Box, 
  Divider 
} from '@mui/material';
import { EventAvailable, TimeToLeave } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

// Mock data (subset for user)
const mockData = {
  attendance: {
    todayPresent: 130,
    todayAbsent: 10,
    avgAttendanceRate: 92.5,
  },
  leaves: {
    pendingRequests: 7,
    approvedThisMonth: 12,
    totalLeaveDays: 45,
  },
};

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5 },
  }),
  hover: { scale: 1.03, boxShadow: '0px 8px 24px rgba(0,0,0,0.2)' },
};

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/dashboard/overview', {
          headers: { Authorization: 'Bearer YOUR_JWT_TOKEN' },
        });
        setData({
          attendance: response.data.attendance,
          leaves: response.data.leaves,
        });
        setLoading(false);
      } catch (err) {
        console.warn('API fetch failed, using mock data');
        setData(mockData);
        setError('Using mock data due to API failure');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        User Dashboard
      </Typography>
      {error && (
        <Box mb={2}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}
      <Grid container spacing={3}>
        {/* Attendance Card */}
        <Grid item xs={12} sm={6}>
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover="hover"
          >
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EventAvailable sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Attendance</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography>Present Today: {data.attendance.todayPresent}</Typography>
                <Typography>Absent Today: {data.attendance.todayAbsent}</Typography>
                <Typography>Avg. Rate: {data.attendance.avgAttendanceRate}%</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Leaves Card */}
        <Grid item xs={12} sm={6}>
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover="hover"
          >
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TimeToLeave sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">Leaves</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography>Pending Requests: {data.leaves.pendingRequests}</Typography>
                <Typography>Approved This Month: {data.leaves.approvedThisMonth}</Typography>
                <Typography>Total Leave Days: {data.leaves.totalLeaveDays}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;