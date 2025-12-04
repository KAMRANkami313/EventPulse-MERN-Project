import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google'; 
import toast from 'react-hot-toast'; // ✅ NEW IMPORT

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 
  
  // State to hold form data
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
      const response = await axios.post("http://localhost:5000/auth/register", formData);
      
      if (response.status === 201) {
        // 🔔 TOAST REPLACEMENT
        toast.success("Registration Successful! Please login.");
        navigate("/login"); 
      }
    } catch (error) {
      console.error("Error registering:", error);
      // 🔔 TOAST REPLACEMENT
      const errorMessage = error.response?.data?.message || "Registration Failed. Try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* 🏳️‍🌈 GOOGLE SUCCESS HANDLER */
  // If user doesn't exist, backend automatically registers them
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
        const response = await axios.post("http://localhost:5000/auth/google", {
            credential: credentialResponse.credential
        });
        
        if (response.status === 200) {
            // Save token and redirect directly to Dashboard
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            
            // 🔔 TOAST REPLACEMENT
            toast.success("Account created and signed in!");
            
            navigate("/dashboard");
        }
    } catch (error) {
        console.error("Google Auth Error", error);
        // 🔔 TOAST REPLACEMENT
        toast.error("Google Sign-Up Failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      
      {/* LEFT SIDE: BRANDING IMAGE (Hidden on mobile) */}
      <div className="hidden lg:flex w-5/12 bg-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop')] bg-cover opacity-30"></div>
        
        <div className="z-10 relative">
            <h1 className="text-4xl font-extrabold tracking-tighter">EventPulse.</h1>
        </div>
        
        <div className="z-10 relative mb-10">
            <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
            <p className="text-lg font-light text-gray-300">
                "Connect with people, discover events, and create memories that matter."
            </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-md">
            
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-500 mt-2">Enter your details to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                      required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                      required
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                    required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                    required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        name="location"
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                        type="text"
                        name="occupation"
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                    />
                 </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg shadow-blue-500/30 mt-4"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            {/* 🏳️‍🌈 DIVIDER */}
            <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <p className="mx-4 text-gray-500 text-sm font-medium">OR</p>
                <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* 🏳️‍🌈 GOOGLE BUTTON */}
            <div className="flex justify-center w-full">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        console.log('Login Failed');
                        // 🔔 TOAST REPLACEMENT
                        toast.error("Google Sign Up Failed");
                    }}
                    theme="filled_blue"
                    size="large"
                    width="350"
                    text="signup_with" // Changes text to "Sign up with Google"
                    shape="rectangular"
                />
            </div>

            <p className="mt-8 text-center text-gray-600">
                Already have an account? 
                <Link to="/login" className="text-blue-600 font-bold hover:underline ml-1">
                    Log in
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;