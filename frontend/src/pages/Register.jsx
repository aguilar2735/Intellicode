import { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    student_number: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let message = "";

    if (!value.trim()) {
      message = "This field is required.";
    } else {
      if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
        message = "Invalid email format.";
      }

      if (name === "password" && value.length < 8) {
        message = "Password must be at least 8 characters.";
      }

      if (name === "confirm_password" && value !== formData.password) {
        message = "Passwords do not match.";
      }

      if (
        name === "password" &&
        formData.confirm_password &&
        value !== formData.confirm_password
      ) {
        setErrors((prev) => ({
          ...prev,
          confirm_password: "Passwords do not match.",
        }));
      } else if (name === "password" && formData.confirm_password) {
        setErrors((prev) => ({
          ...prev,
          confirm_password: "",
        }));
      }
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const isFormValid = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = "This field is required.";
    });

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fix the errors above.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/register/", formData);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (err) {
      const serverMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.student_number?.[0] ||
        "Registration failed.";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded focus:ring-2 ${
      errors[field]
        ? "border-red-500 focus:ring-red-300"
        : "focus:ring-indigo-400"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Register to IntelliCode
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className={inputClass("first_name")}
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm">{errors.first_name}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className={inputClass("last_name")}
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm">{errors.last_name}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="student_number"
              placeholder="Student Number"
              value={formData.student_number}
              onChange={handleChange}
              className={inputClass("student_number")}
            />
            {errors.student_number && (
              <p className="text-red-500 text-sm">{errors.student_number}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass("password")}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={inputClass("confirm_password")}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>

            {errors.confirm_password && (
              <p className="text-red-500 text-sm">{errors.confirm_password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
