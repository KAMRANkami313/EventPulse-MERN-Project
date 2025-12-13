import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Mail, Lock, User, MapPin, Briefcase } from "lucide-react";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    location: "",
    occupation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* 🔒 PASSWORD VALIDATION LOGIC */
  const validateForm = () => {
    const { password } = formData;
    
    // Check length
    if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return false;
    }

    // Check for special symbol
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!symbolRegex.test(password)) {
        toast.error("Password must contain at least one special symbol (!@#$...).");
        return false;
    }

    return true;
  };

  /* STANDARD REGISTRATION */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run Validation
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 🟢 DEPLOYMENT CHANGE 1/2: Standard Registration API call
      const response = await axios.post(
        `${API_URL}/auth/register`,
        formData
      );

      if (response.status === 201) {
        toast.success("Registration Successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  /* GOOGLE SIGNUP */
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      // 🟢 DEPLOYMENT CHANGE 2/2: Google Signup/Login API call
      const response = await axios.post(`${API_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Account created and signed in!");
        if (response.data.user.role === "admin") {
           window.location.href = "/admin"; 
        } else {
           window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Google sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-blue-50 to-indigo-50">

      {/* LEFT PANEL — LIGHT GRADIENT + ABSTRACT SHAPES (Hidden on Mobile) */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden items-center justify-center">
        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 text-center px-10">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
              EventPulse.
            </h1>
            <p className="text-lg text-slate-600">
              Discover events, connect with people, and create unforgettable experiences.
            </p>
        </div>
      </div>

      {/* RIGHT SIDE — FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-xl p-6 md:p-8">

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="text-slate-500 mt-2">
              Enter your details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">First Name</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center"><User className="w-4 h-4 text-slate-400"/></span>
                    <input
                    type="text"
                    name="firstName"
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="John"
                    required
                    />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Last Name</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center"><User className="w-4 h-4 text-slate-400"/></span>
                    <input
                    type="text"
                    name="lastName"
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="Doe"
                    required
                    />
                </div>
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
              <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center"><Mail className="w-4 h-4 text-slate-400"/></span>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="name@company.com"
                    required
                  />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-bold text-slate-500 uppercase block">Password</label>
                 <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Min 8 chars + Symbol</span>
              </div>
              <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center"><Lock className="w-4 h-4 text-slate-400"/></span>
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="••••••••"
                    required
                  />
              </div>
            </div>

            {/* LOCATION / OCCUPATION */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Location</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center"><MapPin className="w-4 h-4 text-slate-400"/></span>
                    <input
                    type="text"
                    name="location"
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="City"
                    />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Occupation</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center"><Briefcase className="w-4 h-4 text-slate-400"/></span>
                    <input
                    type="text"
                    name="occupation"
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition"
                    placeholder="Student/Dev"
                    />
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5 mt-2"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-200"></div>
            <p className="mx-4 text-slate-400 text-sm font-medium">OR</p>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* GOOGLE LOGIN - MOBILE RESPONSIVE WRAPPER */}
          <div className="flex justify-center w-full overflow-hidden">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign Up Failed")}
              theme="filled_blue"
              size="large"
              width="300"
              text="signup_with"
              shape="pill"
            />
          </div>

          {/* SWITCH TO LOGIN */}
          <p className="mt-8 text-center text-slate-600 text-sm">
            Already have an account?
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline ml-1"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;