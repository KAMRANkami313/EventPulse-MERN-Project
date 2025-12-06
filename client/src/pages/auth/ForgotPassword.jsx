import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await axios.post("http://localhost:5000/auth/forgot-password", { email });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">

      {/* LEFT SIDE – DECORATIVE GRADIENT */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-12 text-gray-800">

        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-700">
            EventPulse.
          </h1>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3">Forgot Your Password?</h2>
            <p className="text-lg text-gray-600">
              Don't worry. We’ll help you recover access to your account.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Reset Password
          </h2>

          <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200">
            
            {/* SUCCESS STATE */}
            {status === "success" ? (
              <div className="text-center">
                <p className="text-green-600 font-semibold mb-4">
                  ✅ Reset link sent! Check your email inbox.
                </p>
                <Link
                  to="/login"
                  className="text-blue-600 font-bold underline hover:text-blue-800"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                <p className="text-gray-600 text-sm text-center">
                  Enter your email and we’ll send you a password reset link.
                </p>

                <div>
                  <label className="text-sm text-gray-700 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    User not found or an error occurred.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition"
                >
                  {status === "loading" ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="mt-4 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-gray-500 hover:text-gray-800"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
