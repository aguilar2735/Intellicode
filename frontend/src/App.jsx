import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Layout from "./components/Layout";
import RequireAuth from "./routes/RequireAuth";
import { AuthProvider } from "./context/AuthContext";

// Profile + Subroutes
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/Profile/EditProfile";
import ChangePassword from "./pages/Auth/ChangePassword";
import Achievements from "./pages/Profile/Achievements";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔒 Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />

            {/* 🔁 Nested Profile Routes */}
            <Route path="/profile/*" element={<Profile />}>
              <Route path="edit" element={<EditProfile />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="achievements" element={<Achievements />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
