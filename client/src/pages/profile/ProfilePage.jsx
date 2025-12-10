import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MapPin, Briefcase, Calendar, Users, Edit3, UserPlus, 
    UserCheck, X, Camera, Twitter, Linkedin, Instagram, ArrowLeft,
    Heart, Bookmark
} from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";
import { getUserBadges } from "../../utils/badgeHelper";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    // Get current user from local storage
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    // Data States
    const [userProfile, setUserProfile] = useState(null);
    const [hostedEvents, setHostedEvents] = useState([]);
    const [attendingEvents, setAttendingEvents] = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);

    // UI States
    const [activeTab, setActiveTab] = useState("hosted");
    const [isEditing, setIsEditing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    // Modal States (NEW Architecture: Generalized list modal)
    const [modalType, setModalType] = useState(null); // 'followers', 'following', or null
    const [modalList, setModalList] = useState([]);

    // Edit Form State
    const [editFormData, setEditFormData] = useState({
        firstName: "", lastName: "", location: "", occupation: "", picture: null,
        twitter: "", linkedin: "", instagram: ""
    });

    const isOwnProfile = loggedInUser._id === userId;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 🟢 DEPLOYMENT CHANGE 1/8: Fetch User Profile
                const userRes = await axios.get(`${API_URL}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserProfile(userRes.data);

                // Load existing data + socials
                setEditFormData({
                    firstName: userRes.data.firstName,
                    lastName: userRes.data.lastName,
                    location: userRes.data.location,
                    occupation: userRes.data.occupation,
                    twitter: userRes.data.socials?.twitter || "",
                    linkedin: userRes.data.socials?.linkedin || "",
                    instagram: userRes.data.socials?.instagram || "",
                    picture: null
                });

                // 🟢 DEPLOYMENT CHANGE 2/8: Fetch Hosted Events
                const hostedRes = await axios.get(`${API_URL}/events/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setHostedEvents(hostedRes.data);

                // 🟢 DEPLOYMENT CHANGE 3/8: Fetch Attending Events
                const attendingRes = await axios.get(`${API_URL}/events/attending/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAttendingEvents(attendingRes.data);

                // Fetch Saved Events (Only if own profile)
                if (isOwnProfile) {
                    // 🟢 DEPLOYMENT CHANGE 4/8: Fetch Bookmarks
                    const savedRes = await axios.get(`${API_URL}/users/${userId}/bookmarks`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setSavedEvents(savedRes.data);
                }

                // CHECK IF FOLLOWING (Now checks if loggedInUser ID exists in target user's followers array)
                if (userRes.data.followers.includes(loggedInUser._id)) {
                    setIsFollowing(true);
                } else {
                    setIsFollowing(false);
                }

            } catch (err) { console.error(err); }
        };
        fetchData();

    }, [userId, isOwnProfile, token, loggedInUser._id]);

    // FOLLOW/UNFOLLOW HANDLER (Now uses toggleFollow endpoint)
    const handleFollow = async () => {
        try {
            // 🟢 DEPLOYMENT CHANGE 5/8: Follow/Unfollow User
            await axios.patch(
                `${API_URL}/users/${loggedInUser._id}/follow/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistically update the UI profile state
            const newIsFollowing = !isFollowing;
            setIsFollowing(newIsFollowing);

            // Manually update the userProfile followers count/array
            setUserProfile(prevProfile => {
                let updatedFollowers;
                if (newIsFollowing) {
                    // If now following, add loggedInUser._id to target's followers list
                    updatedFollowers = [...prevProfile.followers, loggedInUser._id];
                } else {
                    // If now unfollowing, remove loggedInUser._id
                    updatedFollowers = prevProfile.followers.filter(id => id !== loggedInUser._id);
                }
                return { ...prevProfile, followers: updatedFollowers };
            });

        } catch (err) {
            console.error("Follow Error:", err);
        }
    };

    // NEW: FETCH & SHOW FOLLOWERS/FOLLOWING MODAL (General handler)
    const handleOpenList = async (type) => {
        // type will be 'followers' or 'following'
        const listIds = type === 'followers' ? userProfile.followers : userProfile.following;

        if (listIds.length === 0) {
            setModalList([]);
            setModalType(type);
            return;
        }

        try {
            // Fetch full user details for every ID
            const list = await Promise.all(
                // 🟢 DEPLOYMENT CHANGE 6/8: Fetch User details for modal list
                listIds.map(id => axios.get(`${API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
            );
            setModalList(list.map(res => res.data));
            setModalType(type);
        } catch (err) { console.error(err); }
    };

    const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    const handleImageChange = (e) => setEditFormData({ ...editFormData, picture: e.target.files[0] });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("firstName", editFormData.firstName);
            formData.append("lastName", editFormData.lastName);
            formData.append("location", editFormData.location);
            formData.append("occupation", editFormData.occupation);

            // Append Socials
            formData.append("twitter", editFormData.twitter);
            formData.append("linkedin", editFormData.linkedin);
            formData.append("instagram", editFormData.instagram);

            if (editFormData.picture) formData.append("picture", editFormData.picture);

            // 🟢 DEPLOYMENT CHANGE 7/8: Update Profile
            const res = await axios.patch(`${API_URL}/users/${userId}`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });

            setUserProfile(res.data);

            if (isOwnProfile) {
                // Note: We retain the bookmarks/following arrays for consistency in local storage
                const currentUserData = JSON.parse(localStorage.getItem("user"));
                // 🟢 DEPLOYMENT CHANGE 8/8: Get Image URL (Needed for local storage update, using helper now)
                localStorage.setItem("user", JSON.stringify({
                    ...res.data,
                    following: currentUserData.following, // Keep the correct following list
                    bookmarks: currentUserData.bookmarks,
                    password: loggedInUser.password
                }));
            }
            setIsEditing(false);
            alert("Profile Updated!");
        } catch (err) { console.error(err); alert("Update failed"); }
    };

    if (!userProfile) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;

    // CALCULATE BADGES
    const badges = getUserBadges(userProfile, hostedEvents.length);

    // Helper to determine which events to show
    const eventsDisplay = activeTab === "hosted" ? hostedEvents
        : activeTab === "attending" ? attendingEvents
            : savedEvents;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors relative">

            {/* 1. COVER BANNER */}
            <div className="h-72 w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <button onClick={() => navigate("/dashboard")} className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full backdrop-blur-md transition text-sm font-bold flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Feed
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* 2. PROFILE HEADER CARD */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="relative -mt-24 mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-slate-700 flex flex-col md:flex-row items-center md:items-end gap-8"
                >

                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-44 h-44 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-200">
                            {userProfile.picturePath ? (
                                <img
                                    src={getImageUrl(userProfile.picturePath)}
                                    alt="profile"
                                    className="w-full h-full object-cover transition transform group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-slate-400">
                                    {userProfile.firstName[0]}
                                </div>
                            )}
                        </div>
                        {isOwnProfile && <div className="absolute bottom-2 right-2 bg-violet-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition" onClick={() => setIsEditing(true)}><Camera className="w-5 h-5" /></div>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mb-2 space-y-2">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {userProfile.firstName} {userProfile.lastName}
                        </h1>

                        {/* BADGES SECTION */}
                        <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                            {badges.map((b, i) => (
                                <span key={i} className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm ${b.color}`}>
                                    {b.icon} {b.label}
                                </span>
                            ))}
                        </div>

                        <p className="text-violet-600 dark:text-violet-400 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                            <Briefcase className="w-4 h-4" /> {userProfile.occupation || "Community Member"}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 text-sm">
                            <MapPin className="w-4 h-4" /> {userProfile.location || "Earth"}
                        </p>

                        {/* SOCIAL LINKS */}
                        <div className="flex gap-4 mt-4 justify-center md:justify-start">
                            {userProfile.socials?.twitter && (
                                <a href={userProfile.socials.twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition"><Twitter className="w-5 h-5" /></a>
                            )}
                            {userProfile.socials?.linkedin && (
                                <a href={userProfile.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-700 transition"><Linkedin className="w-5 h-5" /></a>
                            )}
                            {userProfile.socials?.instagram && (
                                <a href={userProfile.socials.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition"><Instagram className="w-5 h-5" /></a>
                            )}
                        </div>
                    </div>

                    {/* Stats (Followers/Following) */}
                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex gap-8 text-center">
                            <div>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">{hostedEvents.length}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Hosted</p>
                            </div>
                            {/* FOLLOWERS COUNT */}
                            <div className="cursor-pointer hover:scale-110 transition" onClick={() => handleOpenList('followers')} title="View Followers">
                                <p className="text-2xl font-black text-slate-800 dark:text-white">{userProfile.followers.length}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Followers</p>
                            </div>
                            {/* FOLLOWING COUNT */}
                            <div className="cursor-pointer hover:scale-110 transition" onClick={() => handleOpenList('following')} title="View Following">
                                <p className="text-2xl font-black text-slate-800 dark:text-white">{userProfile.following.length}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Following</p>
                            </div>
                        </div>

                        {/* ACTIONS (Edit OR Follow) */}
                        <div className="flex gap-3">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 px-6 py-2 rounded-xl font-bold transition flex items-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    className={`px-6 py-2 rounded-xl font-bold transition shadow-lg flex items-center gap-2 ${isFollowing
                                            ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white'
                                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                                        }`}
                                >
                                    {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 3. TABS & CONTENT */}
                <div className="flex gap-8 border-b border-slate-200 dark:border-slate-700 mb-8">
                    <button
                        onClick={() => setActiveTab("hosted")}
                        className={`pb-4 px-2 font-bold text-sm uppercase tracking-wide transition-all relative ${activeTab === "hosted" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                    >
                        Hosted
                        {activeTab === "hosted" && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("attending")}
                        className={`pb-4 px-2 font-bold text-sm uppercase tracking-wide transition-all relative ${activeTab === "attending" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                    >
                        Going
                        {activeTab === "attending" && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-full" />}
                    </button>

                    {/* SAVED TAB (Only for Owner) */}
                    {isOwnProfile && (
                        <button
                            onClick={() => setActiveTab("saved")}
                            className={`pb-4 px-2 font-bold text-sm uppercase tracking-wide transition-all relative ${activeTab === "saved" ? "text-violet-600 dark:text-violet-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                        >
                            Saved ({savedEvents.length})
                            {activeTab === "saved" && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-full" />}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {activeTab === "hosted" && hostedEvents.length === 0 && <p className="text-slate-500 col-span-3 text-center">No events hosted yet.</p>}
                    {activeTab === "attending" && attendingEvents.length === 0 && <p className="text-slate-500 col-span-3 text-center">Not attending any events.</p>}
                    {activeTab === "saved" && savedEvents.length === 0 && <p className="text-slate-500 col-span-3 text-center">No saved events.</p>}

                    {eventsDisplay.map((event, i) => (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition duration-300 border border-slate-100 dark:border-slate-700 group cursor-pointer"
                            onClick={() => navigate(`/ticket/${event._id}`)}
                        >
                            <div className="h-40 relative overflow-hidden">
                                {event.picturePath ? (
                                    <img
                                        src={getImageUrl(event.picturePath)}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt="event"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-4xl"><Calendar className="w-8 h-8 text-slate-400" /></div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/70 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                            <div className="p-5">
                                <h4 className="font-bold text-lg mb-1 truncate dark:text-white group-hover:text-violet-500 transition">{event.title}</h4>
                                <p className="text-slate-500 text-sm flex items-center gap-1 mb-4"><MapPin className="w-3 h-3" /> {event.location}</p>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <span className="text-[10px] uppercase font-bold bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 px-2 py-1 rounded">{event.category}</span>

                                    {/* Show different badge depending on tab */}
                                    {activeTab === "attending" && (
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                            <Heart className="w-3 h-3 fill-emerald-700" /> Going
                                        </span>
                                    )}
                                    {activeTab === "saved" && (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                            <Bookmark className="w-3 h-3 fill-amber-700" /> Saved
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* EDIT FORM MODAL */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold dark:text-white">Edit Profile</h3>
                                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 dark:text-white" /></button>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="firstName" value={editFormData.firstName} onChange={handleEditChange} placeholder="First Name" className="p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" required />
                                        <input name="lastName" value={editFormData.lastName} onChange={handleEditChange} placeholder="Last Name" className="p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" required />
                                    </div>
                                    <input name="location" value={editFormData.location} onChange={handleEditChange} placeholder="Location" className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                                    <input name="occupation" value={editFormData.occupation} onChange={handleEditChange} placeholder="Occupation" className="w-full p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />

                                    {/* SOCIAL INPUTS */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <input name="twitter" value={editFormData.twitter} onChange={handleEditChange} placeholder="Twitter Link" className="p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                                        <input name="linkedin" value={editFormData.linkedin} onChange={handleEditChange} placeholder="LinkedIn Link" className="p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                                        <input name="instagram" value={editFormData.instagram} onChange={handleEditChange} placeholder="Instagram Link" className="p-3 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                                    </div>

                                    <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                                        <label className="block text-sm font-bold text-slate-500 mb-2 cursor-pointer">Change Profile Picture</label>
                                        <input type="file" onChange={handleImageChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                                    </div>

                                    <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-violet-700 transition">Save Changes</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* GENERALIZED FOLLOW LIST MODAL */}
                <AnimatePresence>
                    {modalType && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6 relative">
                                <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X className="w-5 h-5" /></button>

                                <h3 className="text-xl font-bold mb-4 dark:text-white">
                                    {modalType === 'followers' ? 'Followers' : 'Following'}
                                </h3>

                                <div className="max-h-64 overflow-y-auto space-y-3 custom-scrollbar">
                                    {modalList.length === 0 && (
                                        <p className="text-slate-500 italic text-center text-sm">
                                            {modalType === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                                        </p>
                                    )}
                                    {modalList.map(friend => (
                                        <div key={friend._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition" onClick={() => { navigate(`/profile/${friend._id}`); setModalType(null); }}>
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 dark:border-slate-600">
                                                {friend.picturePath ? (
                                                    <img src={getImageUrl(friend.picturePath)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{friend.firstName[0]}</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm dark:text-white">{friend.firstName} {friend.lastName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{friend.occupation || "Community Member"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default ProfilePage;