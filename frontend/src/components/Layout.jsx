import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Clear user context
    setUser(null);
    setRedirectPath(null); // ✅ this clears the stale path

    navigate("/login", { replace: true, state: {} })
  };

  return (
    <nav className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
      <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold tracking-tight">
        IntelliCode
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="bg-white text-indigo-600 px-4 py-1 rounded hover:bg-gray-200"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="bg-white text-indigo-600 px-4 py-1 rounded hover:bg-gray-200"
            >
              Courses
            </Link>
            <Link
              to="/profile"
              className="bg-white text-indigo-600 px-4 py-1 rounded hover:bg-gray-200"
            >
              Profile
            </Link>
            <span className="hidden sm:inline">
              Welcome, {user.first_name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-600 px-4 py-1 rounded hover:bg-gray-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Layout;
