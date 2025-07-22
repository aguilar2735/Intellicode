// src/components/Dashboards/StudentDashboard.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access");

        const [coursesRes, certsRes] = await Promise.all([
          axios.get("http://localhost:8000/api/courses/?enrolled=true", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/certificates/?student=true", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setEnrolledCourses(coursesRes.data);
        setCertificates(certsRes.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600">
        Welcome back, {user.first_name || user.name || "Student"}!
      </h1>

      {/* Enrolled Courses */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Courses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledCourses.length === 0 ? (
            <p className="text-gray-500">You’re not enrolled in any courses yet.</p>
          ) : (
            enrolledCourses.map(course => (
              <div
                key={course.id}
                className="bg-white rounded shadow p-4 hover:shadow-md transition"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-32 w-full object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.course_code}</p>
                {/* Later: Add progress bar */}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Certificates */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Certificates</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.length === 0 ? (
            <p className="text-gray-500">No certificates yet — complete a course to earn one!</p>
          ) : (
            certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-white p-4 border border-green-300 rounded shadow"
              >
                <h3 className="text-lg font-medium text-green-700">
                  {cert.course_title}
                </h3>
                <p className="text-sm text-gray-500">Issued: {cert.issued_at}</p>
                <a
                  href={cert.file}
                  className="text-blue-600 underline text-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Certificate
                </a>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
