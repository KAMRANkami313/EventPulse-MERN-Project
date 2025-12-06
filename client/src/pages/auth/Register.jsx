import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

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

  /* STANDARD REGISTRATION */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/register",
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
      const response = await axios.post("http://localhost:5000/auth/google", {
        credential: credentialResponse.credential,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Account created and signed in!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Google sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">

      {/* LEFT PANEL — LIGHT GRADIENT + ABSTRACT SHAPES */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-12 text-gray-800">

        {/* Decorative blurred shapes */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-700">
              EventPulse.
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
            <p className="text-lg text-gray-600">
              Discover events, connect with people, and create unforgettable
              experiences.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-10">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-1">
              Enter your details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 font-medium">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                required
              />
            </div>

            {/* LOCATION / OCCUPATION */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 font-medium">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <p className="mx-4 text-gray-500 text-sm">OR</p>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign Up Failed")}
              theme="filled_blue"
              size="large"
              width="350"
              text="signup_with"
            />
          </div>

          {/* SWITCH TO LOGIN */}
          <p className="mt-8 text-center text-gray-600">
            Already have an account?
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline ml-1"
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
