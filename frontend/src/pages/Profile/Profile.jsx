import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");

  // Sync tab with route
  useEffect(() => {
    if (location.pathname.includes("change-password")) {
      setActiveTab("password");
    } else if (location.pathname.includes("achievements")) {
      setActiveTab("achievements");
    } else {
      setActiveTab("personal");
    }
  }, [location.pathname]);

  const tabButton = (tabKey, label, path) => (
    <button
      onClick={() => navigate(path)}
      className={`px-4 py-2 rounded-t-md font-medium transition ${
        activeTab === tabKey
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {/* Header */}
      <div className="flex items-center space-x-6 mb-8">
        <img
          src={user?.profile_picture || "/media/default.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">My Profile</h2>
          <p className="text-gray-500">Role: {user?.role}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b pb-2 mb-4">
        {tabButton("personal", "Personal Info", "/profile")}
        {tabButton("password", "Change Password", "/profile/change-password")}
        {tabButton("achievements", "Achievements", "/profile/achievements")}
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && (
        <>
          {location.pathname.includes("edit") ? (
            <EditProfile />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">First Name</p>
                  <p className="font-medium">{user?.first_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Last Name</p>
                  <p className="font-medium">{user?.last_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Student Number</p>
                  <p className="font-medium">{user?.student_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-medium">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Role</p>
                  <p className="font-medium capitalize">
                    {user?.role || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "password" && (
        <div className="mt-4">
          <Outlet />
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-gray-700">🏅 Badges</p>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-gray-700">📜 Certificates</p>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
