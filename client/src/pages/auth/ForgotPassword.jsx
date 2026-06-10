import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-violet-50/50 to-fuchsia-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">

      {/* LEFT SIDE – DECORATIVE GRADIENT (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
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
            We'll help you recover access to your account in no time.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE – FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-3xl shadow-xl p-8"
        >

            {/* SUCCESS STATE */}
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your Inbox</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  We have sent a password reset link to <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>.
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-violet-500/30"
                >
                  Back to Login
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center lg:text-left mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center">
                        <Mail className="w-4 h-4 text-slate-400" />
                    </span>
                    <input
                        type="email"
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition dark:text-white"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                  </div>
                </div>

                {status === "error" && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium">
                    User not found or an error occurred.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {status === "loading" ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium flex items-center justify-center gap-2 transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;