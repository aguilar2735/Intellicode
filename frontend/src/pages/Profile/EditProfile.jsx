import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const DEFAULT_IMAGE = "http://localhost:8000/media/default.png";

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    student_number: user?.student_number || "",
    email: user?.email || "",
  });

  const [profilePicture, setProfilePicture] = useState(undefined);
  const [previewUrl, setPreviewUrl] = useState(
    user?.profile_picture || DEFAULT_IMAGE
  );
  const [removePicture, setRemovePicture] = useState(false);

  useEffect(() => {
    if (!previewUrl) {
      setPreviewUrl(DEFAULT_IMAGE);
    }
  }, [previewUrl]);

  const isUsingDefault =
    previewUrl === DEFAULT_IMAGE || user?.profile_picture === DEFAULT_IMAGE;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePicture(false);
    }
  };

  const handleRemovePicture = () => {
    const currentPic = user?.profile_picture;

    const isAlreadyDefault =
      !currentPic ||
      currentPic === DEFAULT_IMAGE ||
      currentPic.endsWith("default.png");

    if (isAlreadyDefault) {
      toast("You're already using the default profile picture.");
      return;
    }

    setProfilePicture(null);
    setRemovePicture(true);
    setPreviewUrl(DEFAULT_IMAGE); // ✅ Force preview to show default
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (removePicture) {
        response = await api.put(
          "/api/profile/",
          {
            ...formData,
            profile_picture: null,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
      } else {
        const data = new FormData();
        for (let key in formData) {
          data.append(key, formData[key]);
        }

        if (profilePicture instanceof File) {
          data.append("profile_picture", profilePicture);
        }

        response = await api.put("/api/profile/", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
      }

      setUser(response.data);
      toast.success("Profile updated!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      student_number: user?.student_number || "",
      email: user?.email || "",
    });
    setPreviewUrl(user?.profile_picture || DEFAULT_IMAGE);
    setProfilePicture(undefined);
    setRemovePicture(false);
    navigate("/profile");
  };

  const profileImage = previewUrl;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">Edit Profile</h2>

      <div className="flex items-center space-x-6 mb-4">
        <img
          src={profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">
            Change Profile Picture
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button
          type="button"
          onClick={handleRemovePicture}
          className={`text-sm underline ${
            !user?.profile_picture ||
            user.profile_picture === "/media/default.png" ||
            user.profile_picture.endsWith("default.png")
              ? "text-gray-400 cursor-not-allowed"
              : "text-red-500 hover:text-red-600"
          }`}
        >
          Remove Profile Picture
        </button>

        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Student Number</label>
          <input
            type="text"
            name="student_number"
            value={formData.student_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
