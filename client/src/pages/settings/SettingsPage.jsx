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

    // 1. Check Matching
    if (passwords.new !== passwords.confirm)
      return toast.error("Passwords do not match");

    // 2. Check Length
    if (passwords.new.length < 8) {
        return toast.error("New password must be at least 8 characters");
    }

    // 3. Check Symbol
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!symbolRegex.test(passwords.new)) {
        return toast.error("New password must contain at least one special symbol (!@#$...)");
    }

    try {
      // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
      await axios.patch(
        `${API_URL}/auth/change-password`,
        { userId: user._id, ...passwords },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password Updated Successfully");
      setPasswords({ current: "", new: "", confirm: "" });
      // Clear inputs manually in UI if needed, though state reset handles it
      e.target.reset(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating password");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10 flex justify-center relative transition-colors">

      {/* Back Button - Responsive Positioning */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-bold z-10 bg-white/50 dark:bg-black/20 p-2 rounded-xl backdrop-blur-sm"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-2xl mt-12 md:mt-0 p-6 md:p-10 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800 shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Account Settings
        </h1>

        {/* PRIVACY SECTION */}
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="text-violet-600 dark:text-violet-400" size={22} />
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg">Privacy</h3>
          </div>

          <label className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={privacy === "private"}
              onChange={() =>
                setPrivacy((prev) => (prev === "public" ? "private" : "public"))
              }
              className="accent-violet-600 w-5 h-5 rounded"
            />
            <span className="text-sm font-medium">
              Make Profile Private (Only followers can see posts)
            </span>
          </label>
        </div>

        {/* PASSWORD SECTION */}
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-purple-600 dark:text-purple-400" size={22} />
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg">
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />

            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-violet-500/30 transition transform active:scale-95">
              Update Password
            </button>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Trash className="text-red-500" size={22} />
            <h3 className="font-bold text-red-600 dark:text-red-400 text-lg">Danger Zone</h3>
          </div>

          <button className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 px-4 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition">
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;