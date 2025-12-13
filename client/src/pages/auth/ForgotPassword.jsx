import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react"; // Added icons for better UI

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-blue-50 to-indigo-50">

      {/* LEFT SIDE – DECORATIVE GRADIENT (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 text-center px-10">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
            EventPulse.
          </h1>
          <p className="text-lg text-slate-600">
             We’ll help you recover access to your account in no time.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE – FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-xl p-8">
          
            {/* SUCCESS STATE */}
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    ✅
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your Inbox</h2>
                <p className="text-slate-600 mb-6">
                  We have sent a password reset link to <span className="font-bold text-slate-800">{email}</span>.
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center lg:text-left mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
                    <p className="text-slate-500 mt-2">
                    Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center">
                        <Mail className="w-4 h-4 text-slate-400" />
                    </span>
                    <input
                        type="email"
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                  </div>
                </div>

                {status === "error" && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium">
                    User not found or an error occurred.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;