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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Forgot Password?</h2>
        
        {status === "success" ? (
            <div className="text-green-600">
                <p className="mb-4">✅ Reset link sent! Check your inbox.</p>
                <Link to="/login" className="text-blue-600 font-bold underline">Back to Login</Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-gray-500 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
                
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                {status === "error" && <p className="text-red-500 text-sm">User not found or error occurred.</p>}

                <button type="submit" disabled={status === "loading"} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                    {status === "loading" ? "Sending..." : "Send Reset Link"}
                </button>
                
                <div className="mt-4">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800">← Back to Login</Link>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;