// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // adjust to your backend URL
});

// Attach access token if available on init
const access = localStorage.getItem("access");
if (access) {
  api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
}

// ✅ Axios interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token");

        // 🔁 Updated endpoint to match your working route
        const res = await axios.post("http://localhost:8000/api/refresh/", {
          refresh,
        });

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        return api(originalRequest); // Retry original request
      } catch (refreshErr) {
        console.error("Refresh token invalid:", refreshErr);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
