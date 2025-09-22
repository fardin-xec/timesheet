import Breadcrumb from "../components/common/Breadcrumb";
import Card from "../components/common/Card";
import "../styles/dashboard.css";
import AboutView from "../components/about/AboutView";

const About = () => {

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "About", path: "/About" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <Card>
        <AboutView />
      </Card>
    </>
  );
};

export default About;
