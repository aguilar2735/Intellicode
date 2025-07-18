import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // clear error
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*]/.test(password);
    return (
      password.length >= minLength &&
      hasUpper &&
      hasLower &&
      hasNumber &&
      hasSymbol
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { old_password, new_password, confirm_password } = form;

    const newErrors = {};
    if (!old_password) newErrors.old_password = "Current password is required.";
    if (!new_password) newErrors.new_password = "New password is required.";
    if (!confirm_password) newErrors.confirm_password = "Please confirm your new password.";

    if (new_password && confirm_password && new_password !== confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    if (new_password && !validatePassword(new_password)) {
      newErrors.new_password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted errors.");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/api/change-password/",
        { old_password, new_password, confirm_password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      toast.success("Password changed successfully 🎉");
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      const data = err.response?.data;

      if (data?.detail) {
        setErrors({ old_password: data.detail });
      } else if (data) {
        setErrors(data);
      }

      toast.error("Please fix the highlighted errors.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded shadow transition-all duration-300">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["old_password", "new_password", "confirm_password"].map((field) => {
          const labelMap = {
            old_password: "Current Password",
            new_password: "New Password",
            confirm_password: "Confirm New Password",
          };

          const fieldKey = field.split("_")[0]; // old/new/confirm
          const showField = show[fieldKey];

          return (
            <div className="relative" key={field}>
              <label className="block text-sm font-medium mb-1">
                {labelMap[field]}
              </label>
              <input
                type={showField ? "text" : "password"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded pr-10 ${
                  errors?.[field] ? "border-red-500" : ""
                }`}
              />
              <span
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                onClick={() =>
                  setShow((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }))
                }
              >
                {showField ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
              {errors?.[field] && (
                <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
              )}
            </div>
          );
        })}

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`bg-indigo-600 text-white px-4 py-2 rounded transition hover:bg-indigo-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
