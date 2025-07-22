// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    navigate("/login");
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token");

    try {
      const res = await api.post("/api/refresh/", { refresh });
      const newAccess = res.data.access;
      localStorage.setItem("access", newAccess);
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
      return newAccess;
    } catch (err) {
      console.error("Token refresh failed", err);
      logout();
      throw err;
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      const res = await api.get("/api/profile/");
      setUser(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const newAccess = await refreshToken();
          const res = await api.get("/api/profile/");
          setUser(res.data);
        } catch (refreshErr) {
          console.error("Refresh and fetch failed", refreshErr);
          setUser(null);
        }
      } else {
        console.error("Profile fetch failed", err);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchProfile, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
