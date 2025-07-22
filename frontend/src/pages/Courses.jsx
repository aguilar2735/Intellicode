import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { toast } from "react-hot-toast";

const Courses = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
  try {
    const res = await api.get("/api/courses/");
    console.log("Fetched courses:", res.data); // ✅ Add this
    setCourses(res.data);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    toast.error("Failed to load courses.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleCreateCourse = () => {
    navigate("/dashboard/courses/create");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Courses</h1>
        {user?.role === "Instructor" && (
          <button
            onClick={handleCreateCourse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            + Create Course
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No courses yet. This will list all your created courses.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <li
                key={course.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg font-medium">{course.title}</h2>
                <p className="text-sm text-gray-600">{course.category}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Status:{" "}
                  {course.is_approved
                    ? "Approved"
                    : course.submitted_for_approval
                    ? "Pending Approval"
                    : "Draft"}
                </p>

                <button
                  onClick={() =>
                    navigate(`/dashboard/courses/${course.id}/edit`)
                  }
                  className="mt-4 text-blue-600 hover:underline text-sm"
                >
                  ✏️ Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Courses;
