import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { TrendingUp, People, Work, RateReview, Refresh } from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const SuperadminDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState(false);
  const controls = useAnimation();

  // Show charts after metrics are loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCharts(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock Data
  const metrics = {
    weeklyHires: 714000,
    activeEmployees: 1350000,
    openPositions: 1720000,
    pendingReviews: 234
  };

  const employeeTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Team A',
        data: [30, 40, 35, 50, 60, 45, 70, 55, 60, 65, 50, 80],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Team B',
        data: [20, 30, 25, 40, 50, 35, 60, 45, 50, 55, 40, 70],
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Team C',
        data: [10, 20, 15, 30, 40, 25, 50, 35, 40, 45, 30, 60],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const regionalData = {
    labels: ['America', 'Asia', 'Europe', 'Africa'],
    datasets: [
      {
        data: [34.7, 28.4, 27.7, 9.2],
        backgroundColor: ['#1976d2', '#ff9800', '#2196f3', '#f44336'],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#fff'
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 8
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  // Handle refresh action
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await controls.start({
      rotate: 360,
      transition: { duration: 1, ease: "easeInOut" }
    });
    setTimeout(() => {
      setIsRefreshing(false);
      controls.start({ rotate: 0 });
    }, 1000);
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: 'easeOut',
        type: "spring",
        damping: 15
      }
    }),
    hover: {
      scale: 1.05,
      y: -10,
      boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const chartVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      rotateX: -15
    },
    visible: (delay) => ({
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        delay: delay * 0.3,
        duration: 0.8,
        ease: 'easeOut',
        type: "spring",
        damping: 20
      }
    }),
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const numberCounterVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.2,
      rotate: 10,
      transition: {
        duration: 0.2
      }
    }
  };

  const refreshButtonVariants = {
    hover: {
      scale: 1.1,
      backgroundColor: "#e3f2fd",
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.9
    }
  };

  // Metric card data with icons
  const metricCards = [
    { 
      title: 'Weekly Hires', 
      value: `${(metrics.weeklyHires / 1000).toFixed(1)}k`, 
      bgColor: '#bbdefb',
      icon: TrendingUp,
      color: '#1976d2'
    },
    { 
      title: 'Active Employees', 
      value: `${(metrics.activeEmployees / 1000000).toFixed(2)}m`, 
      bgColor: '#c8e6c9',
      icon: People,
      color: '#388e3c'
    },
    { 
      title: 'Open Positions', 
      value: `${(metrics.openPositions / 1000000).toFixed(2)}m`, 
      bgColor: '#ffecb3',
      icon: Work,
      color: '#f57c00'
    },
    { 
      title: 'Pending Reviews', 
      value: metrics.pendingReviews, 
      bgColor: '#ffcdd2',
      icon: RateReview,
      color: '#d32f2f'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box p={4} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <motion.div variants={titleVariants}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              HR Management Dashboard
            </Typography>
          </motion.div>

          <motion.div
            variants={refreshButtonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <IconButton 
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{ 
                borderRadius: '12px',
                padding: '12px'
              }}
            >
              <motion.div animate={controls}>
                <Refresh sx={{ fontSize: 28 }} />
              </motion.div>
            </IconButton>
          </motion.div>
        </Box>

        <Grid container spacing={3}>
          {/* Animated Metrics Cards */}
          {metricCards.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={metric.title}>
                <motion.div
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Card sx={{ 
                    boxShadow: 3,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}>
                    <CardContent sx={{ 
                      bgcolor: metric.bgColor, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      position: 'relative',
                      padding: '24px'
                    }}>
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px'
                        }}
                      >
                        <IconComponent sx={{ 
                          fontSize: 32, 
                          color: metric.color,
                          opacity: 0.8
                        }} />
                      </motion.div>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: metric.color,
                          textAlign: 'center',
                          mb: 2
                        }}
                      >
                        {metric.title}
                      </Typography>
                      
                      <motion.div variants={numberCounterVariants}>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: metric.color
                          }}
                        >
                          {metric.value}
                        </Typography>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}

          {/* Animated Charts */}
          <AnimatePresence>
            {visibleCharts && (
              <>
                <Grid item xs={12} md={8}>
                  <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={chartVariants}
                    whileHover="hover"
                  >
                    <Card sx={{ 
                      boxShadow: 3,
                      borderRadius: '16px',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ padding: '24px' }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#1976d2',
                            mb: 3
                          }}
                        >
                          Employee Trends (Last Year)
                        </Typography>
                        <Box sx={{ height: '300px' }}>
                          <Line data={employeeTrendsData} options={lineOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                <Grid item xs={12} md={4}>
                  <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={chartVariants}
                    whileHover="hover"
                  >
                    <Card sx={{ 
                      boxShadow: 3,
                      borderRadius: '16px',
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ padding: '24px' }}>
                        <Typography 
                          variant="h6"
                          sx={{ 
                            fontWeight: 600,
                            color: '#1976d2',
                            mb: 3
                          }}
                        >
                          Regional Distribution
                        </Typography>
                        <Box sx={{ height: '300px' }}>
                          <Pie data={regionalData} options={pieOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </>
            )}
          </AnimatePresence>
        </Grid>

        {/* Loading State Animation */}
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Refresh sx={{ color: 'white', fontSize: 30 }} />
            </motion.div>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
};

export default SuperadminDashboard;