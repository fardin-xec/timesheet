import React from "react";
import { motion } from "framer-motion";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import {
  Info as InfoIcon,
  People as PeopleIcon,
  EmojiEvents as AwardIcon,
  Public as GlobeIcon,
  MenuBook as BookIcon,
  Email as MailIcon,
} from "@mui/icons-material";
import "../../styles/about.css";

// Animation variants
const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const heroVariants = {
  hidden: {
    opacity: 0,
    y: 100,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
      type: "spring",
      damping: 20,
    },
  },
};

const heroTextVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3,
    },
  },
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    y: -8,
    scale: 1.03,
    boxShadow: "0px 15px 35px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

const iconVariants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      type: "spring",
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
    },
  },
};

const textRevealVariants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const buttonVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.3,
    },
  },
  hover: {
    scale: 1.05,
    y: -2,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

const statsVariants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const teamCardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
  hover: {
    y: -10,
    rotateY: 5,
    scale: 1.02,
    boxShadow: "0px 20px 40px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.3,
    },
  },
};

// const gradientVariants = {
//   animate: {
//     backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//     transition: {
//       duration: 6,
//       repeat: Infinity,
//       ease: "linear",
//     },
//   },
// };

const AboutView = () => {
  return (
    <motion.div
      className="about-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <Box className="hero-section">
        <Container>
          <motion.div variants={heroVariants}>
            <Typography variant="h2" component="h1" className="hero-title">
              About Auxai Technologies
            </Typography>
          </motion.div>
          <motion.div variants={heroTextVariants}>
            <Typography variant="h4" className="hero-subtitle">
              Pioneering the future of intelligent automation
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Mission Statement */}
      <Container className="section">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Card elevation={3} className="mission-card">
                  <CardContent>
                    <motion.div variants={textRevealVariants}>
                      <Typography variant="h4" gutterBottom>
                        Our Mission
                      </Typography>
                    </motion.div>
                    <motion.div
                      variants={textRevealVariants}
                      transition={{ delay: 0.2 }}
                    >
                      <Typography variant="body1" className="mission-text">
                        AUXAI is the partner of choice for many of the world's leading
                        enterprises, government entities, real estate developers,
                        engineering consultants and contractors. We help businesses
                        elevate their value through digital transformation and
                        automation of business processes by implementing pragmatic
                        project control and construction project management solutions.
                        We are Oracle Partners, and our team of consultants have years
                        of real-world experience in implementing PMIS Solutions. We
                        are not just a technology provider; we understand your
                        business and your processes. We bring years of experience and
                        strong domain knowledge in Construction & Engineering &,
                        Public and Energy Sector. We can help optimize and digitally
                        transform your business processes to empower your organization
                        to manage projects more efficiently and effectively.
                      </Typography>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: 0.2 }}
              >
                <Paper className="vision-paper" elevation={1}>
                  <CardContent>
                    <motion.div variants={textRevealVariants}>
                      <Typography variant="h4" gutterBottom>
                        Our Vision
                      </Typography>
                    </motion.div>
                    <motion.div
                      variants={textRevealVariants}
                      transition={{ delay: 0.3 }}
                    >
                      <Typography variant="body1">
                        At AUXAI, our mission is to revolutionize the construction
                        industry through innovative technology solutions. We are
                        committed to enhancing efficiency, safety, and sustainability
                        in construction projects worldwide. By harnessing cutting-edge
                        technology and fostering collaborative partnerships, we aim to
                        empower construction professionals to build better, faster,
                        and smarter.
                      </Typography>
                    </motion.div>
                  </CardContent>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Company Values */}
      <Box className="values-section">
        <Container className="section">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              className="section-title"
            >
              Our Core Values
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  icon: InfoIcon,
                  title: "Innovation",
                  description: "We push boundaries and challenge the status quo, constantly seeking better ways to solve problems.",
                  className: "innovation"
                },
                {
                  icon: PeopleIcon,
                  title: "Collaboration",
                  description: "We believe in the power of diverse teams working together to create solutions greater than the sum of their parts.",
                  className: "collaboration"
                },
                {
                  icon: AwardIcon,
                  title: "Excellence",
                  description: "We maintain the highest standards in our research, development, and implementation of AI technologies.",
                  className: "excellence"
                }
              ].map((value, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    custom={index}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="value-card" elevation={2}>
                      <CardContent className="value-content">
                        <motion.div
                          variants={iconVariants}
                          whileHover="hover"
                        >
                          <Avatar className={`value-icon ${value.className}`}>
                            <value.icon />
                          </Avatar>
                        </motion.div>
                        <motion.div variants={textRevealVariants}>
                          <Typography variant="h5" gutterBottom>
                            {value.title}
                          </Typography>
                        </motion.div>
                        <motion.div
                          variants={textRevealVariants}
                          transition={{ delay: 0.2 }}
                        >
                          <Typography variant="body2">
                            {value.description}
                          </Typography>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Our Story */}
      <Container className="section">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            className="section-title"
          >
            Our Story
          </Typography>
          <Box maxWidth="md" mx="auto">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Card elevation={3}>
                <CardContent className="story-content">
                  <motion.div variants={textRevealVariants}>
                    <Typography variant="body1" paragraph>
                      At AUXAI, our philosophy is rooted in the belief that technology
                      should serve as a catalyst for positive change within the
                      construction industry. We are committed to leveraging innovation
                      to overcome traditional challenges and transform the way
                      construction projects are planned, executed, and managed.
                      Integrity, collaboration, and sustainability are at the heart of
                      everything we do. By prioritizing transparency, fostering strong
                      partnerships, and embracing environmental responsibility, we
                      strive to empower our clients and stakeholders to achieve their
                      goals efficiently, ethically, and with lasting impact.
                    </Typography>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Team Section */}
      <Box className="team-section">
        <Container className="section">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              className="section-title"
            >
              Our Leadership Team
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  name: "Umar Mirza Shaikh",
                  title: "CEO & Co-founder",
                  description: "Former AI Research Lead at MIT with over 15 years of experience in machine learning."
                },
                {
                  name: "Michael Rodriguez",
                  title: "CTO & Co-founder",
                  description: "Previously led AI engineering teams at Google and has contributed to groundbreaking NLP research."
                },
                {
                  name: "Aisha Patel",
                  title: "Chief Ethics Officer",
                  description: "Internationally recognized expert in AI ethics and responsible technology development."
                }
              ].map((member, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    variants={teamCardVariants}
                    whileHover="hover"
                    custom={index}
                    transition={{ delay: index * 0.15 }}
                  >
                    <Card className="team-card" elevation={2}>
                      <CardContent className="team-content">
                        <motion.div
                          variants={iconVariants}
                          whileHover="hover"
                        >
                          <Avatar className="team-avatar" />
                        </motion.div>
                        <motion.div variants={textRevealVariants}>
                          <Typography variant="h5" gutterBottom className="team-name">
                            {member.name}
                          </Typography>
                        </motion.div>
                        <motion.div
                          variants={textRevealVariants}
                          transition={{ delay: 0.1 }}
                        >
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            className="team-title"
                          >
                            {member.title}
                          </Typography>
                        </motion.div>
                        <motion.div
                          variants={textRevealVariants}
                          transition={{ delay: 0.2 }}
                        >
                          <Typography variant="body2">
                            {member.description}
                          </Typography>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Global Impact */}
      <Container className="section">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            className="section-title"
          >
            Our Global Impact
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              {[
                {
                  icon: GlobeIcon,
                  title: "Global Presence",
                  description: "Operating in 15+ countries across 4 continents",
                  className: "global"
                },
                {
                  icon: BookIcon,
                  title: "Research Publications",
                  description: "Over 50 peer-reviewed papers advancing the field",
                  className: "research"
                },
                {
                  icon: PeopleIcon,
                  title: "Community Engagement",
                  description: "Educational programs reaching 10,000+ students annually",
                  className: "community"
                }
              ].map((impact, index) => (
                <motion.div
                  key={index}
                  variants={statsVariants}
                  custom={index}
                  transition={{ delay: index * 0.2 }}
                  className="impact-stat"
                >
                  <motion.div
                    variants={iconVariants}
                    whileHover="hover"
                  >
                    <Avatar className={`impact-icon ${impact.className}`}>
                      <impact.icon />
                    </Avatar>
                  </motion.div>
                  <Box>
                    <motion.div variants={textRevealVariants}>
                      <Typography variant="h5">{impact.title}</Typography>
                    </motion.div>
                    <motion.div
                      variants={textRevealVariants}
                      transition={{ delay: 0.1 }}
                    >
                      <Typography variant="body2">
                        {impact.description}
                      </Typography>
                    </motion.div>
                  </Box>
                </motion.div>
              ))}
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Paper className="difference-paper">
                  <Box p={4}>
                    <motion.div variants={textRevealVariants}>
                      <Typography variant="h4" gutterBottom>
                        Making a Difference
                      </Typography>
                    </motion.div>
                    <motion.div
                      variants={textRevealVariants}
                      transition={{ delay: 0.2 }}
                    >
                      <Typography variant="body1" paragraph>
                        Our technologies have helped healthcare providers improve
                        diagnoses by 35%, reduced energy consumption in smart
                        buildings by 27%, and enhanced educational outcomes for
                        students in underserved communities.
                      </Typography>
                    </motion.div>
                    <motion.div
                      variants={textRevealVariants}
                      transition={{ delay: 0.3 }}
                    >
                      <Typography variant="body1">
                        We're proud to be part of a global movement advancing AI for
                        good, focusing on applications that have real, measurable
                        impacts on people's lives.
                      </Typography>
                    </motion.div>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Contact CTA */}
      <Box className="cta-section">
        <Container className="section">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={textRevealVariants}>
              <Typography variant="h3" align="center" gutterBottom>
                Join Us on Our Journey
              </Typography>
            </motion.div>
            <motion.div
              variants={textRevealVariants}
              transition={{ delay: 0.2 }}
            >
              <Typography
                variant="h6"
                align="center"
                paragraph
                className="cta-text"
              >
                Whether you're interested in partnering with us, joining our team,
                or learning more about our technologies, we'd love to hear from you.
              </Typography>
            </motion.div>
            <Box display="flex" justifyContent="center">
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  className="cta-button"
                  startIcon={<MailIcon />}
                >
                  Contact Us
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="footer">
        <Container>
          <motion.div
            variants={textRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Typography variant="body2" align="center">
              &copy; {new Date().getFullYear()} Auxai Technologies. All rights
              reserved.
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
};

export default AboutView;