import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check Matching
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }

    // 2. Check Length (Min 8)
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    // 3. Check Symbol (Regex for special characters)
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!symbolRegex.test(password)) {
        setMessage("Password must contain at least one special symbol (!@#$...)");
        return;
    }

    setLoading(true);
    try {
      // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
      await axios.post(
        `${API_URL}/auth/reset-password/${token}`,
        { password }
      );
      toast.success("Password Reset Successful!");
      navigate("/login");
    } catch (err) {
      setMessage("Reset link expired or invalid.");
      toast.error("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-blue-50 to-indigo-50">

      {/* LEFT SIDE – LIGHT GRADIENT DECORATION (Hidden on Mobile) */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden items-center justify-center">
        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 text-center px-10">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
            EventPulse.
          </h1>
          <p className="text-lg text-slate-600">
            Secure your account with a new password.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – RESET FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-xl p-8">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Create New Password</h2>
            <p className="text-slate-500 mt-2">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center">
                    <Lock className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            {message && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Set New Password"}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default ResetPassword;