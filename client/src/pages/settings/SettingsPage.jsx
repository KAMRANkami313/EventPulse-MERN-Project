import { useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [privacy, setPrivacy] = useState(user.privacy || "public");

  const handlePasswordChange = async (e) => {
      e.preventDefault();
      if(passwords.new !== passwords.confirm) return toast.error("Passwords do not match");
      
      try {
          // You need to create this route in backend
          await axios.patch(`http://localhost:5000/auth/change-password`, 
            { userId: user._id, ...passwords }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Password Updated");
          setPasswords({ current: "", new: "", confirm: "" });
      } catch (err) { toast.error(err.response.data.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
            
            {/* PRIVACY SECTION */}
            <div className="mb-8 border-b pb-6">
                <h3 className="font-bold text-gray-700 mb-2">Privacy</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={privacy === "private"} 
                        onChange={() => setPrivacy(prev => prev === "public" ? "private" : "public")}
                    />
                    <span className="text-sm">Make Profile Private (Only followers can see posts)</span>
                </label>
            </div>

            {/* PASSWORD SECTION */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-700 mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                    <input type="password" placeholder="Current Password" className="w-full p-2 border rounded" onChange={e => setPasswords({...passwords, current: e.target.value})} />
                    <input type="password" placeholder="New Password" className="w-full p-2 border rounded" onChange={e => setPasswords({...passwords, new: e.target.value})} />
                    <input type="password" placeholder="Confirm New Password" className="w-full p-2 border rounded" onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Update Password</button>
                </form>
            </div>

            {/* DANGER ZONE */}
            <div className="pt-6 border-t border-red-100">
                <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                <button className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded text-sm font-bold hover:bg-red-100">
                    Delete Account
                </button>
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;