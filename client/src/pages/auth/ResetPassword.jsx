import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check Matching
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    // 2. Check Length (Min 8)
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // 3. Check Symbol (Regex for special characters)
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!symbolRegex.test(password)) {
      toast.error("Password must contain at least one special symbol (!@#$...)");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success("Password Reset Successful!");
      navigate("/login");
    } catch (err) {
      toast.error("Reset link expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-violet-50/50 to-fuchsia-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">

      {/* LEFT SIDE – LIGHT GRADIENT DECORATION (Hidden on Mobile) */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden items-center justify-center">
        <div className="absolute top-10 left-10 w-48 h-48 bg-violet-300/30 dark:bg-violet-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-fuchsia-300/20 dark:bg-fuchsia-800/20 rounded-full blur-2xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 text-center px-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-violet-500/30 mx-auto mb-8">
            E
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
            EventPulse
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Secure your account with a new password.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE – RESET FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl shadow-xl p-8"
        >

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Password</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center">
                    <Lock className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition dark:text-white"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition dark:text-white"
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Updating..." : "Set New Password"}
            </button>
          </form>

        </motion.div>
      </div>

    </div>
  );
};

export default ResetPassword;