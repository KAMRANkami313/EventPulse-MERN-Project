import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { ArrowLeft, Lock, Shield, Trash } from "lucide-react";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL;

const SettingsPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [privacy, setPrivacy] = useState(user?.privacy || "public");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm)
      return toast.error("Passwords do not match");

    try {
      // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
      await axios.patch(
        `${API_URL}/auth/change-password`,
        { userId: user._id, ...passwords },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password Updated");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-10 flex justify-center relative">

      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition font-medium"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-2xl p-10 rounded-3xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Account Settings
        </h1>

        {/* PRIVACY SECTION */}
        <div className="mb-10 bg-white/70 p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="text-blue-600" size={22} />
            <h3 className="text-gray-800 font-semibold text-lg">Privacy</h3>
          </div>

          <label className="flex items-center gap-3 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={privacy === "private"}
              onChange={() =>
                setPrivacy((prev) => (prev === "public" ? "private" : "public"))
              }
              className="accent-blue-600 w-5 h-5"
            />
            <span className="text-sm">
              Make Profile Private (Only followers can see posts)
            </span>
          </label>
        </div>

        {/* PASSWORD SECTION */}
        <div className="mb-10 bg-white/70 p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-purple-600" size={22} />
            <h3 className="text-gray-800 font-semibold text-lg">
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:border-purple-500"
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:border-purple-500"
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:border-purple-500"
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-bold shadow-md transition">
              Update Password
            </button>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="pt-6 border-t border-red-300">
          <div className="flex items-center gap-2 mb-3">
            <Trash className="text-red-600" size={22} />
            <h3 className="font-bold text-red-600 text-lg">Danger Zone</h3>
          </div>

          <button className="w-full bg-red-100 text-red-600 border border-red-300 px-4 py-3 rounded-lg font-bold hover:bg-red-200 transition">
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;