import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    if (password.length < 5) {
      setMessage("Password too short");
      return;
    }

    try {
      // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
      await axios.post(
        `${API_URL}/auth/reset-password/${token}`,
        { password }
      );
      alert("Password Reset Successful! Please login with your new password.");
      navigate("/login");
    } catch (err) {
      setMessage("Reset link expired or invalid.");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">

      {/* LEFT SIDE – LIGHT GRADIENT DECORATION */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-12 text-gray-800">

        {/* Decorative blurred shapes */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-700">
            EventPulse.
          </h1>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3">Reset Your Password</h2>
            <p className="text-lg text-gray-600">
              Create a new password to regain access to your account.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – RESET FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-10">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Create New Password
          </h2>

          <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="text-sm text-gray-700 font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              {message && (
                <p className="text-red-500 text-sm text-center">{message}</p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition mt-3"
              >
                Set New Password
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ResetPassword;