import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* STANDARD LOGIN */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/auth/login", formData);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Invalid Email or Password");
    } finally {
        setLoading(false);
    }
  };

  /* 🏳️‍🌈 GOOGLE SUCCESS HANDLER */
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
        const response = await axios.post("http://localhost:5000/auth/google", {
            credential: credentialResponse.credential
        });
        
        if (response.status === 200) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/dashboard");
        }
    } catch (error) {
        console.error("Google Login Error", error);
        alert("Google Login Failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      
      {/* LEFT SIDE: IMAGE & BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 items-center justify-center relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="text-white text-center z-10 px-10">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">EventPulse.</h1>
            <p className="text-xl font-light opacity-90">
                Discover events, connect with communities, and create memories that last a lifetime.
            </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-200"
                        placeholder="name@company.com"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-200"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {/* ✅ ADDED FORGOT PASSWORD LINK */}
                <div className="flex justify-end -mt-4">
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg shadow-blue-500/30 transform hover:-translate-y-1"
                >
                    {loading ? "Signing in..." : "Sign In"}
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
                        alert("Google Sign In Failed");
                    }}
                    theme="filled_blue"
                    size="large"
                    width="350"
                    text="signin_with"
                    shape="rectangular"
                />
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Don't have an account? 
                    <Link to="/register" className="text-blue-600 font-bold hover:underline ml-1">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;