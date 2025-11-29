import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]); 
  const [activeTab, setActiveTab] = useState("overview"); 

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const statsRes = await axios.get("http://localhost:5000/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
      setStats(statsRes.data);
      const usersRes = await axios.get("http://localhost:5000/users", { headers: { Authorization: `Bearer ${token}` } });
      setAllUsers(usersRes.data);
    } catch (err) { console.error(err); }
  };

  // --- NEW: CSV EXPORT LOGIC ---
  const downloadCSV = () => {
    if (!allUsers || allUsers.length === 0) return alert("No user data to export.");

    // Define Headers
    const headers = ["User ID,First Name,Last Name,Email,Role,Location,Occupation,Joined Date"];
    
    // Map Data Rows
    const rows = allUsers.map(u => {
        // Handle potentially missing fields or commas in data
        const clean = (text) => (text ? `"${text.replace(/"/g, '""')}"` : "");
        
        return [
            u._id,
            clean(u.firstName),
            clean(u.lastName),
            clean(u.email),
            u.role,
            clean(u.location),
            clean(u.occupation),
            new Date(u.createdAt).toLocaleDateString()
        ].join(",");
    });

    // Combine Headers and Rows
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    // Create Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eventpulse_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteUser = async (userId) => {
      if(userId === user._id) { alert("Cannot delete self."); return; }
      if(!window.confirm("Delete this user and all their events?")) return;
      try {
          await axios.delete(`http://localhost:5000/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
          setAllUsers(allUsers.filter(u => u._id !== userId));
          fetchAllData();
      } catch (err) { alert("Failed to delete."); }
  };

  if (!stats) return <div className="p-10 text-center font-bold text-gray-500">Loading Command Center...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* NAVBAR */}
      <nav className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-xl font-bold tracking-wider uppercase">Admin Console</h1>
        </div>
        <button onClick={() => navigate("/dashboard")} className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded text-sm transition">
            Exit to App
        </button>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
          {/* SIDEBAR */}
          <div className="w-64 bg-white border-r shadow-sm hidden md:block">
              <div className="p-6 border-b">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Logged In As</p>
                  <p className="font-bold text-lg text-gray-800 mt-1">{user.firstName} {user.lastName}</p>
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">SUPER ADMIN</span>
              </div>
              <nav className="p-4 space-y-2">
                  <button onClick={() => setActiveTab("overview")} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === "overview" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
                      📊 Dashboard Overview
                  </button>
                  <button onClick={() => setActiveTab("users")} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === "users" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
                      👥 User Management
                  </button>
              </nav>
          </div>

          {/* CONTENT */}
          <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
              
              {/* === OVERVIEW TAB === */}
              {activeTab === "overview" && (
                  <div className="max-w-5xl mx-auto animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">System Health</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500 opacity-10 rounded-bl-full"></div>
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Users</h3>
                            <p className="text-5xl font-extrabold text-blue-600 mt-2">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-green-500 opacity-10 rounded-bl-full"></div>
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Active Events</h3>
                            <p className="text-5xl font-extrabold text-green-600 mt-2">{stats.totalEvents}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500 opacity-10 rounded-bl-full"></div>
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Total RSVPs</h3>
                            <p className="text-5xl font-extrabold text-purple-600 mt-2">{stats.totalRSVPs}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6">Recent Platform Activity</h3>
                        <div className="space-y-6">
                            {stats.recentEvents.map(e => (
                                <div key={e._id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">📅</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{e.title}</p>
                                        <p className="text-sm text-gray-500">Created by <span className="font-medium text-blue-600">{e.creatorName}</span></p>
                                    </div>
                                    <span className="text-sm font-medium text-gray-400">{new Date(e.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
              )}

              {/* === USERS TAB === */}
              {activeTab === "users" && (
                  <div className="max-w-6xl mx-auto animate-fadeIn">
                    
                    {/* Header with Export Button */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">User Database</h2>
                        <button 
                            onClick={downloadCSV}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition transform active:scale-95"
                        >
                            📥 Export to Excel
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase">User Identity</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase">Role</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase">Location</th>
                                    <th className="p-5 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-blue-50/50 transition">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                                                    {u.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.firstName} {u.lastName}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {u.role === "admin" ? (
                                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">ADMIN</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">USER</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-sm text-gray-600">{u.location || "Unknown"}</td>
                                        <td className="p-5 text-right">
                                            {u.role !== "admin" && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                                >
                                                    BAN ACCOUNT
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;