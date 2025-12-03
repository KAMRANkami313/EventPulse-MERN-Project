import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]); 
  const [allEvents, setAllEvents] = useState([]); // Store Events for Table
  const [activeTab, setActiveTab] = useState("overview"); 
  const [graphData, setGraphData] = useState([]);

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

      const eventsRes = await axios.get("http://localhost:5000/admin/events", { headers: { Authorization: `Bearer ${token}` } });
      setAllEvents(eventsRes.data);

      // PREPARE CHART DATA (Group users by Month created)
      processChartData(usersRes.data, eventsRes.data);

    } catch (err) { console.error(err); }
  };

  // Helper to turn raw data into Graph Data
  const processChartData = (users, events) => {
      const dataMap = {};

      // Helper to get "Jan", "Feb" string
      const getMonth = (dateStr) => new Date(dateStr).toLocaleString('default', { month: 'short' });

      users.forEach(u => {
          const m = getMonth(u.createdAt);
          if(!dataMap[m]) dataMap[m] = { name: m, users: 0, events: 0 };
          dataMap[m].users += 1;
      });

      events.forEach(e => {
          const m = getMonth(e.createdAt);
          if(!dataMap[m]) dataMap[m] = { name: m, users: 0, events: 0 };
          dataMap[m].events += 1;
      });

      // Convert Map to Array
      const chartArray = Object.values(dataMap);
      setGraphData(chartArray);
  };

  const handleDeleteUser = async (userId) => {
      if(userId === user._id) return alert("Cannot delete self.");
      if(!window.confirm("Ban this user?")) return;
      try {
          await axios.delete(`http://localhost:5000/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
          setAllUsers(allUsers.filter(u => u._id !== userId));
      } catch (err) { alert("Failed to delete."); }
  };

  const handleDeleteEvent = async (eventId) => {
      if(!window.confirm("Delete this event permanently?")) return;
      try {
          await axios.delete(`http://localhost:5000/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
          setAllEvents(allEvents.filter(e => e._id !== eventId));
      } catch (err) { alert("Failed to delete."); }
  };

  if (!stats) return <div className="p-10 text-center text-gray-500">Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      
      {/* NAVBAR */}
      <nav className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-xl font-bold tracking-wider uppercase">Admin Console</h1>
        </div>
        <button onClick={() => navigate("/dashboard")} className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded text-sm transition">
            Exit to App
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <div className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col h-full">
              <div className="p-6 border-b">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Logged In As</p>
                  <p className="font-bold text-lg text-gray-800 mt-1">{user.firstName} {user.lastName}</p>
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">SUPER ADMIN</span>
              </div>
              <nav className="p-4 space-y-2">
                  {['overview', 'users', 'events'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium capitalize transition ${activeTab === tab ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                          {tab}
                      </button>
                  ))}
              </nav>
          </div>

          {/* CONTENT */}
          <div className="flex-1 p-8 overflow-y-auto h-full">
              
              {/* === OVERVIEW TAB === */}
              {activeTab === "overview" && (
                  <div className="max-w-6xl mx-auto animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">System Health</h2>
                    
                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Users</h3>
                            <p className="text-4xl font-extrabold text-blue-600 mt-2">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Events</h3>
                            <p className="text-4xl font-extrabold text-green-600 mt-2">{stats.totalEvents}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Total RSVPs</h3>
                            <p className="text-4xl font-extrabold text-purple-600 mt-2">{stats.totalRSVPs}</p>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-4">Growth Analytics</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={graphData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="users" stroke="#2563eb" fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-4">Event Activity</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={graphData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="events" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                  </div>
              )}

              {/* === USERS TAB === */}
              {activeTab === "users" && (
                  <div className="max-w-6xl mx-auto animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">User Database</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-blue-50/50 transition">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {u.firstName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{u.location || "N/A"}</td>
                                        <td className="p-4 text-right">
                                            {u.role !== "admin" && (
                                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 hover:bg-red-50 px-3 py-1 rounded transition">
                                                    BAN
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

              {/* === EVENTS TAB === */}
              {activeTab === "events" && (
                  <div className="max-w-6xl mx-auto animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Event Management</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Event Name</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Creator</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allEvents.map(e => (
                                    <tr key={e._id} className="hover:bg-blue-50/50 transition">
                                        <td className="p-4 font-bold text-gray-800 text-sm">{e.title}</td>
                                        <td className="p-4 text-sm text-gray-600">{e.creatorName}</td>
                                        <td className="p-4 text-sm text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">ACTIVE</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteEvent(e._id)} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 hover:bg-red-50 px-3 py-1 rounded transition">
                                                DELETE
                                            </button>
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