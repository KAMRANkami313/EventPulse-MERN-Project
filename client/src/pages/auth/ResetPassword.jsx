import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password !== confirm) { setMessage("Passwords do not match"); return; }
    if(password.length < 5) { setMessage("Password too short"); return; }

    try {
      await axios.post(`http://localhost:5000/auth/reset-password/${token}`, { password });
      alert("Password Reset Successful! Login with new password.");
      navigate("/login");
    } catch (err) {
      setMessage("Link expired or invalid.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">New Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <input 
                type="password" 
                placeholder="New Password" 
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input 
                type="password" 
                placeholder="Confirm Password" 
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setConfirm(e.target.value)}
                required
            />
            
            {message && <p className="text-red-500 text-sm text-center">{message}</p>}

            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                Set New Password
            </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;