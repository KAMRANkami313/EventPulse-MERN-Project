import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, Calendar, DollarSign, Activity, Megaphone, Trash2, Shield, 
    LogOut, Flag, FileText, AlertTriangle, CheckCircle, Ban, XCircle,
    Menu, X 
} from "lucide-react";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

// Pie Chart Colors
const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const [stats, setStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [graphData, setGraphData] = useState([]);
    // ADD THIS STATE FOR MOBILE SIDEBAR
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Admin Features States
    const [broadcast, setBroadcast] = useState({ title: "", message: "" });
    const [reports, setReports] = useState([]);
    const [logs, setLogs] = useState([]);

    // --- NEW TRANSACTIONS STATE (Phase 29) ---
    const [transactions, setTransactions] = useState([]);
    // ------------------------------------------

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/dashboard");
            return;
        }
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            // Fetch core stats
            // 🟢 DEPLOYMENT CHANGE 1/12
            const statsRes = await axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
            setStats(statsRes.data);

            // Fetch user data
            // 🟢 DEPLOYMENT CHANGE 2/12
            const usersRes = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
            setAllUsers(usersRes.data);

            // Fetch event data
            // 🟢 DEPLOYMENT CHANGE 3/12
            const eventsRes = await axios.get(`${API_URL}/admin/events`, { headers: { Authorization: `Bearer ${token}` } });
            setAllEvents(eventsRes.data);

            // Fetch reports
            // 🟢 DEPLOYMENT CHANGE 4/12
            const reportsRes = await axios.get(`${API_URL}/admin/reports`, { headers: { Authorization: `Bearer ${token}` } });
            setReports(reportsRes.data);

            // Fetch logs
            // 🟢 DEPLOYMENT CHANGE 5/12
            const logsRes = await axios.get(`${API_URL}/admin/logs`, { headers: { Authorization: `Bearer ${token}` } });
            setLogs(logsRes.data);

            // --- FETCH TRANSACTIONS (Phase 29) ---
            // 🟢 DEPLOYMENT CHANGE 6/12
            const txnRes = await axios.get(`${API_URL}/admin/transactions`, { headers: { Authorization: `Bearer ${token}` } });
            setTransactions(txnRes.data);
            // -------------------------------------

            // PREPARE CHART DATA
            processChartData(usersRes.data, eventsRes.data);

        } catch (err) { console.error(err); }
    };

    // Helper to turn raw data into Graph Data
    const processChartData = (users, events) => {
        const dataMap = {};
        const getMonth = (dateStr) => new Date(dateStr).toLocaleString('default', { month: 'short' });

        users.forEach(u => {
            const m = getMonth(u.createdAt);
            if (!dataMap[m]) dataMap[m] = { name: m, users: 0, events: 0 };
            dataMap[m].users += 1;
        });

        events.forEach(e => {
            const m = getMonth(e.createdAt);
            if (!dataMap[m]) dataMap[m] = { name: m, users: 0, events: 0 };
            dataMap[m].events += 1;
        });

        const chartArray = Object.values(dataMap);
        setGraphData(chartArray);
    };

    const handleDeleteUser = async (userId) => {
        if (userId === user._id) return alert("Cannot delete self.");
        if (!window.confirm("Ban this user?")) return;
        try {
            // Deletion triggers logging in server/controllers/users.js
            // 🟢 DEPLOYMENT CHANGE 7/12
            await axios.delete(`${API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            // Re-fetch all data after action (to update users and logs)
            fetchAllData();
        } catch (err) { alert("Failed to delete."); }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Delete this event permanently?")) return;
        try {
            // Deletion triggers logging in server/controllers/events.js
            // 🟢 DEPLOYMENT CHANGE 8/12
            await axios.delete(`${API_URL}/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
            // Re-fetch all data after action (to update events and logs)
            fetchAllData();
        } catch (err) { alert("Failed to delete."); }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!window.confirm("Send this message to ALL users?")) return;
        try {
            // Broadcast triggers logging in server/controllers/admin.js
            // 🟢 DEPLOYMENT CHANGE 9/12
            await axios.post(`${API_URL}/admin/broadcast`, broadcast, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Re-fetch logs after action
            fetchAllData();
            alert("Broadcast Sent!");
            setBroadcast({ title: "", message: "" });
        } catch (err) { alert("Failed to send."); }
    };

    const handleDismissReport = async (reportId) => {
        if (!window.confirm("Are you sure you want to dismiss this report?")) return;
        // Resolution triggers logging in server/controllers/admin.js
        // 🟢 DEPLOYMENT CHANGE 10/12
        await axios.patch(`${API_URL}/admin/reports/${reportId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        // Re-fetch reports and logs
        fetchAllData();
        alert("Report dismissed.");
    };

    const handleBanEvent = async (report) => {
        if (!window.confirm(`Are you sure you want to DELETE the event "${report.eventTitle}" based on this report? This action is permanent.`)) return;
        try {
            // 1. Delete Event (Logging happens in events.js)
            // 🟢 DEPLOYMENT CHANGE 11/12
            await axios.delete(`${API_URL}/events/${report.targetEventId}`, { headers: { Authorization: `Bearer ${token}` } });

            // 2. Mark Report Resolved (Logging happens in admin.js)
            // 🟢 DEPLOYMENT CHANGE 12/12
            await axios.patch(`${API_URL}/admin/reports/${report._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });

            // 3. Update all data
            fetchAllData();

            alert("Event Deleted & Report Resolved");
        } catch (err) {
            alert("Failed to complete ban/resolution process.");
            console.error(err);
        }
    };

    if (!stats) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>;

    // Component for Tab Button
    const TabButton = ({ id, label, icon: Icon, badge }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                activeTab === id 
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" 
                : "text-slate-500 hover:bg-white hover:text-violet-600 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
        >
            <div className="flex items-center gap-3 relative z-10">
                <Icon className={`w-5 h-5 ${activeTab === id ? "text-white" : "group-hover:scale-110 transition"}`} />
                {label}
            </div>
            {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm z-10">
                    {badge}
                </span>
            )}
        </button>
    );

return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex text-slate-800 dark:text-slate-100 transition-colors relative">

            {/* 1. MOBILE OVERLAY (Click to close sidebar) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* 2. SIDEBAR (Responsive: Fixed on Desktop, Slide-in on Mobile) */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col h-screen 
                transform transition-transform duration-300 ease-in-out
                md:translate-x-0 
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-lg leading-tight tracking-tight dark:text-white">Admin<br />Console</h1>
                        </div>
                    </div>
                    {/* CLOSE BUTTON (Mobile Only) */}
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-red-500 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-6 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                        {user.firstName[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Super Admin</p>
                    </div>
                </div>

                <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Analytics</p>
                    <TabButton id="overview" label="Overview" icon={Activity} />
                    <TabButton id="financials" label="Financials" icon={DollarSign} />

                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Management</p>
                    <TabButton id="users" label="Users" icon={Users} />
                    <TabButton id="events" label="Events" icon={Calendar} />

                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">System</p>
                    <TabButton id="moderation" label="Moderation" icon={Flag} badge={reports.length} />
                    <TabButton id="broadcast" label="Broadcast" icon={Megaphone} />
                    <TabButton id="logs" label="Audit Logs" icon={FileText} />
                </nav>

                <button onClick={() => navigate("/dashboard")} className="mt-4 flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 transition font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10">
                    <LogOut className="w-5 h-5" /> Exit Console
                </button>
            </div>

            {/* 3. MAIN CONTENT (Adjusted margins) */}
            <div className="flex-1 md:ml-72 p-4 md:p-8 overflow-y-auto h-screen w-full transition-all duration-300">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                        {/* MOBILE HAMBURGER BUTTON */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold dark:text-white capitalize">{activeTab}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">Manage platform activity and settings.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 pl-4 pr-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 self-end md:self-auto">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">System Online</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {/* ... (Keep all your existing Tabs content: Overview, Users, Events, etc. exactly the same) ... */}
                    {/* Just paste the content from your previous file inside here starting from {activeTab === "overview" && ...} */}
                    
                    {/* === OVERVIEW TAB === */}
                    {activeTab === "overview" && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* STAT CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { label: "Total Users", val: stats.totalUsers, icon: Users, col: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                                    { label: "Total Events", val: stats.totalEvents, icon: Calendar, col: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                                    { label: "Revenue", val: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, col: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                                    { label: "Total RSVPs", val: stats.totalRSVPs, icon: Activity, col: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" }
                                ].map((s, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition duration-300">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{s.label}</p>
                                                <h3 className={`text-2xl md:text-3xl font-extrabold mt-2 ${s.col}`}>{s.val}</h3>
                                            </div>
                                            <div className={`p-3 rounded-2xl ${s.bg} ${s.col}`}>
                                                <s.icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CHARTS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 h-80 md:h-96">
                                    <h3 className="font-bold text-lg mb-6 dark:text-white flex items-center gap-2"><Activity className="w-5 h-5 text-violet-500"/> Growth Trend</h3>
                                    <ResponsiveContainer>
                                        <AreaChart data={graphData}>
                                            <defs>
                                                <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                            <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff'}} />
                                            <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fill="url(#c1)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 h-80 md:h-96">
                                    <h3 className="font-bold text-lg mb-6 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-500"/> Event Categories</h3>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={stats.categoryData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                                {stats.categoryData?.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />))}
                                            </Pie>
                                            <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff'}} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* === USERS TAB === */}
                    {activeTab === "users" && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]"> 
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">User</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Role</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Location</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map(u => (
                                        <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                            <td className="p-5 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300">
                                                    {u.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{u.location || "Unknown"}</td>
                                            <td className="p-5 text-right">
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition" title="Ban User">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {/* === EVENTS TAB === */}
                    {activeTab === "events" && (
                        <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Event Name</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Creator</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Date</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allEvents.map(e => (
                                        <tr key={e._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                            <td className="p-5 font-bold text-slate-800 dark:text-white text-sm">{e.title}</td>
                                            <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{e.creatorName}</td>
                                            <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{new Date(e.date).toLocaleDateString()}</td>
                                            <td className="p-5">
                                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Active</span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button onClick={() => handleDeleteEvent(e._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition" title="Delete Event">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {/* === BROADCAST TAB === */}
                    {activeTab === "broadcast" && (
                        <motion.div key="broadcast" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mt-4 md:mt-10">
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 -mr-10 -mt-10 bg-violet-500/10 rounded-full w-40 h-40 blur-2xl pointer-events-none"></div>
                                <h3 className="text-2xl font-bold mb-2 dark:text-white flex items-center gap-2"><Megaphone className="w-6 h-6 text-violet-600"/> System Broadcast</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Send notifications to all registered users immediately.</p>
                                
                                <form onSubmit={handleBroadcast} className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title</label>
                                        <input 
                                            className="w-full p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition" 
                                            placeholder="e.g. Scheduled Maintenance" 
                                            value={broadcast.title} 
                                            onChange={e => setBroadcast({...broadcast, title: e.target.value})} 
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Content</label>
                                        <textarea 
                                            className="w-full p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 h-40 resize-none transition" 
                                            placeholder="Write your announcement here..." 
                                            value={broadcast.message} 
                                            onChange={e => setBroadcast({...broadcast, message: e.target.value})} 
                                            required
                                        />
                                    </div>
                                    <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-violet-500/30 transition transform active:scale-95 flex items-center justify-center gap-2">
                                        Send Broadcast <Megaphone className="w-5 h-5"/>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* === MODERATION TAB === */}
                    {activeTab === "moderation" && (
                        <motion.div key="moderation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-4">
                            {reports.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-10 h-10"/></div>
                                    <p className="text-xl font-bold text-slate-800 dark:text-white">All Clear!</p>
                                    <p className="text-slate-500">No pending reports at this time.</p>
                                </div>
                            ) : (
                                reports.map(report => (
                                    <div key={report._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl mt-1">
                                                <AlertTriangle className="w-6 h-6"/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg dark:text-white">Report: <span className="text-violet-600">{report.eventTitle}</span></p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Reason: <span className="font-bold text-red-500">{report.reason}</span></p>
                                                <p className="text-xs text-slate-400 mt-2">By {report.reporterName} • {new Date(report.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button 
                                                onClick={() => handleDismissReport(report._id)}
                                                className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-bold transition flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4"/> Dismiss
                                            </button>
                                            <button 
                                                onClick={() => handleBanEvent(report)}
                                                className="flex-1 md:flex-none px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-bold shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4"/> Delete Event
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* === LOGS TAB === */}
                    {activeTab === "logs" && (
                        <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Admin</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Action</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Target</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                            <td className="p-5 text-sm font-bold text-slate-700 dark:text-slate-200">{log.adminName}</td>
                                            <td className="p-5">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                                    ${log.action.includes("DELETE") || log.action.includes("BAN") ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : 
                                                    log.action.includes("BROADCAST") ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : 
                                                    log.action.includes("RESOLVED") ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm text-slate-600 dark:text-slate-400">
                                                {log.target} <br/> <span className="text-xs text-slate-400">{log.details}</span>
                                            </td>
                                            <td className="p-5 text-xs text-slate-400">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {/* === FINANCIALS TAB === */}
                    {activeTab === "financials" && (
                        <motion.div key="financials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto">
                             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center min-w-[600px]">
                                <h3 className="font-bold text-lg dark:text-white">Transaction History</h3>
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                                    Total Revenue: ${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
                                </span>
                             </div>
                             <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">User</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Event</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                                        <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No transactions recorded yet.</td></tr>
                                    ) : (
                                        transactions.map(txn => (
                                            <tr key={txn._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                <td className="p-5">
                                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{txn.userName}</p>
                                                    <p className="text-xs text-slate-500">{txn.userEmail}</p>
                                                </td>
                                                <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{txn.eventTitle}</td>
                                                <td className="p-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">${txn.amount ? txn.amount.toFixed(2) : '0.00'}</td>
                                                <td className="p-5">
                                                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                                                        {txn.status}
                                                    </span>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">ID: {txn.stripePaymentId?.slice(-8) || "N/A"}</p>
                                                </td>
                                                <td className="p-5 text-right text-xs text-slate-500">
                                                    {new Date(txn.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;