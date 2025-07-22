import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireAuth = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait for loading to complete before making auth decisions
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  // Redirect to login if no authenticated user
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated — render the protected route
  return <Outlet />;
};

export default RequireAuth;
