import React from "react";
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

const AboutView = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <Box className="hero-section">
        <Container>
          <Typography variant="h2" component="h1" className="hero-title">
            About Auxai Technologies
          </Typography>
          <Typography variant="h4" className="hero-subtitle">
            Pioneering the future of intelligent automation
          </Typography>
        </Container>
      </Box>

      {/* Mission Statement */}
      <Container className="section">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Card elevation={3} className="mission-card">
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Our Mission
                </Typography>
                <Typography variant="body1" className="mission-text">
                  AUXAI is the partner of choice for many of the world’s leading
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className="vision-paper" elevation={1}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Our Mission
                </Typography>
                <Typography variant="body1">
                  At AUXAI, our mission is to revolutionize the construction
                  industry through innovative technology solutions. We are
                  committed to enhancing efficiency, safety, and sustainability
                  in construction projects worldwide. By harnessing cutting-edge
                  technology and fostering collaborative partnerships, we aim to
                  empower construction professionals to build better, faster,
                  and smarter.”
                </Typography>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Company Values */}
      <Box className="values-section">
        <Container className="section">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            className="section-title"
          >
            Our Core Values
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className="value-card" elevation={2}>
                <CardContent className="value-content">
                  <Avatar className="value-icon innovation">
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    Innovation
                  </Typography>
                  <Typography variant="body2">
                    We push boundaries and challenge the status quo, constantly
                    seeking better ways to solve problems.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="value-card" elevation={2}>
                <CardContent className="value-content">
                  <Avatar className="value-icon collaboration">
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    Collaboration
                  </Typography>
                  <Typography variant="body2">
                    We believe in the power of diverse teams working together to
                    create solutions greater than the sum of their parts.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="value-card" elevation={2}>
                <CardContent className="value-content">
                  <Avatar className="value-icon excellence">
                    <AwardIcon />
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    Excellence
                  </Typography>
                  <Typography variant="body2">
                    We maintain the highest standards in our research,
                    development, and implementation of AI technologies.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Our Story */}
      <Container className="section">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          className="section-title"
        >
          Our Story
        </Typography>
        <Box maxWidth="md" mx="auto">
          <Card elevation={3}>
            <CardContent className="story-content">
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
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Team Section */}
      <Box className="team-section">
        <Container className="section">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            className="section-title"
          >
            Our Leadership Team
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className="team-card" elevation={2}>
                <CardContent className="team-content">
                  <Avatar className="team-avatar" />
                  <Typography variant="h5" gutterBottom className="team-name">
                    Umar Mirza Shaikh
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    className="team-title"
                  >
                    CEO & Co-founder
                  </Typography>
                  <Typography variant="body2">
                    Former AI Research Lead at MIT with over 15 years of
                    experience in machine learning.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="team-card" elevation={2}>
                <CardContent className="team-content">
                  <Avatar className="team-avatar" />
                  <Typography variant="h5" gutterBottom className="team-name">
                    Michael Rodriguez
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    className="team-title"
                  >
                    CTO & Co-founder
                  </Typography>
                  <Typography variant="body2">
                    Previously led AI engineering teams at Google and has
                    contributed to groundbreaking NLP research.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="team-card" elevation={2}>
                <CardContent className="team-content">
                  <Avatar className="team-avatar" />
                  <Typography variant="h5" gutterBottom className="team-name">
                    Aisha Patel
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    className="team-title"
                  >
                    Chief Ethics Officer
                  </Typography>
                  <Typography variant="body2">
                    Internationally recognized expert in AI ethics and
                    responsible technology development.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Global Impact */}
      <Container className="section">
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
            <Box className="impact-stat">
              <Avatar className="impact-icon global">
                <GlobeIcon />
              </Avatar>
              <Box>
                <Typography variant="h5">Global Presence</Typography>
                <Typography variant="body2">
                  Operating in 15+ countries across 4 continents
                </Typography>
              </Box>
            </Box>

            <Box className="impact-stat">
              <Avatar className="impact-icon research">
                <BookIcon />
              </Avatar>
              <Box>
                <Typography variant="h5">Research Publications</Typography>
                <Typography variant="body2">
                  Over 50 peer-reviewed papers advancing the field
                </Typography>
              </Box>
            </Box>

            <Box className="impact-stat">
              <Avatar className="impact-icon community">
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h5">Community Engagement</Typography>
                <Typography variant="body2">
                  Educational programs reaching 10,000+ students annually
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="difference-paper">
              <Box p={4}>
                <Typography variant="h4" gutterBottom>
                  Making a Difference
                </Typography>
                <Typography variant="body1" paragraph>
                  Our technologies have helped healthcare providers improve
                  diagnoses by 35%, reduced energy consumption in smart
                  buildings by 27%, and enhanced educational outcomes for
                  students in underserved communities.
                </Typography>
                <Typography variant="body1">
                  We're proud to be part of a global movement advancing AI for
                  good, focusing on applications that have real, measurable
                  impacts on people's lives.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Contact CTA */}
      <Box className="cta-section">
        <Container className="section">
          <Typography variant="h3" align="center" gutterBottom>
            Join Us on Our Journey
          </Typography>
          <Typography
            variant="h6"
            align="center"
            paragraph
            className="cta-text"
          >
            Whether you're interested in partnering with us, joining our team,
            or learning more about our technologies, we'd love to hear from you.
          </Typography>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              className="cta-button"
              startIcon={<MailIcon />}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="footer">
        <Container>
          <Typography variant="body2" align="center">
            &copy; {new Date().getFullYear()} Auxai Technologies. All rights
            reserved.
          </Typography>
        </Container>
      </Box>
    </div>
  );
};

export default AboutView;
