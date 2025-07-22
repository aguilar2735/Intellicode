import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import StudentDashboard from "../components/Dashboards/StudentDashboard";
import InstructorDashboard from "../components/Dashboards/InstructorDashboard";
import AdminDashboard from "../components/Dashboards/AdminDashboard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null; // Or a loading spinner

  switch (user.role) {
    case "Student":
      return <StudentDashboard />;
    case "Instructor":
      return <InstructorDashboard />;
    case "Admin":
      return <AdminDashboard />;
    default:
      return <div>Unauthorized</div>;
  }
};

export default Dashboard;
