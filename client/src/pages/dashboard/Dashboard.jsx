import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChatBox from "../../components/ChatBox";
import SkeletonEvent from "../../components/SkeletonEvent"; // Import Skeleton
import { getImageUrl } from "../../utils/imageHelper"; // <--- NEW CLOUDINARY IMPORT

// Swiper Imports (Carousel)
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Fix for Leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// PRESET CITIES (Lat/Lng) - Used for Auto-Mapping
const CITIES = [
  { name: "New York, USA", lat: 40.7128, lng: -74.0060 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Mumbai, India", lat: 19.0760, lng: 72.8777 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050 },
  { name: "Toronto, Canada", lat: 43.6510, lng: -79.3470 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
];

// Helper for Category Icons
const getCategoryIcon = (category) => {
  const lowerCat = category.toLowerCase();
  if (lowerCat.includes("music")) return "🎵";
  if (lowerCat.includes("tech")) return "💻";
  if (lowerCat.includes("sport")) return "⚽";
  if (lowerCat.includes("education")) return "📚";
  if (lowerCat.includes("party")) return "🎉";
  if (lowerCat.includes("art")) return "🎨";
  if (lowerCat.includes("food")) return "🍔";
  return "🏷️";
};

const Dashboard = ({ toggleTheme, theme }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [activeChat, setActiveChat] = useState(null); // { id, title }

  // Event Data
  const [events, setEvents] = useState([]);

  // Create Event Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: CITIES[0].name,
    coordinates: { lat: CITIES[0].lat, lng: CITIES[0].lng },
    date: "",
    category: "",
    picture: null,
  });

  // Filter & UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [openComments, setOpenComments] = useState({});
  const [showMap, setShowMap] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- EFFECTS ---

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchEvents();
      fetchNotifications();
    }
  }, []);

  // --- API FETCH FUNCTIONS ---

  const fetchEvents = async () => {
    setLoading(true); 
    try {
      const response = await axios.get("http://localhost:5000/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events", err);
    } finally {
      // Small delay to show off the skeleton animation (optional, purely for UX feel)
      setTimeout(() => setLoading(false), 800);
    }
  };


  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/notifications/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // --- EVENT HANDLERS ---

  const handleMarkRead = async () => {
    if (unreadCount > 0) {
      try {
        await axios.patch(`http://localhost:5000/notifications/${user._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
      } catch (err) {
        console.error(err);
      }
    }
    setShowNotifications(!showNotifications);
  };

  const handleImageChange = (e) => {
    setNewEvent({ ...newEvent, picture: e.target.files[0] });
  };

  const handleChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleCityChange = (e) => {
    const selectedCity = CITIES.find(c => c.name === e.target.value);
    setNewEvent({
      ...newEvent,
      location: selectedCity.name,
      coordinates: { lat: selectedCity.lat, lng: selectedCity.lng }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("title", newEvent.title);
      formData.append("description", newEvent.description);
      formData.append("location", newEvent.location);
      formData.append("coordinates", JSON.stringify(newEvent.coordinates));
      formData.append("date", newEvent.date);
      formData.append("category", newEvent.category);
      if (newEvent.picture) formData.append("picture", newEvent.picture);

      const response = await axios.post("http://localhost:5000/events", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        alert("Event Created!");
        setEvents(response.data);
        setNewEvent({
          title: "", description: "",
          location: CITIES[0].name, coordinates: { lat: CITIES[0].lat, lng: CITIES[0].lng },
          date: "", category: "", picture: null
        });
      }
    } catch (err) {
      console.error("Error creating event", err);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/events/${eventId}/join`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
    } catch (err) { console.error(err); }
  };

  const handleLike = async (eventId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/events/${eventId}/like`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (eventId, text) => {
    try {
      const response = await axios.post(`http://localhost:5000/events/${eventId}/comments`,
        { userId: user._id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (err) { alert("Could not delete event."); }
  };

  const handleShare = (eventId) => {
    navigator.clipboard.writeText(`Check out this event on EventPulse!`);
    alert("Link copied to clipboard!");
  };

  const toggleComments = (eventId) => {
    setOpenComments((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">

      {/* GLASSMORPHISM NAVBAR */}
      <nav className="bg-blue-600/90 backdrop-blur-md dark:bg-gray-800/90 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-[1000] border-b border-white/10">
        <h1 className="text-2xl font-extrabold tracking-tight">EventPulse</h1>
        <div className="flex items-center gap-5 relative">

          <button onClick={toggleTheme} className="text-xl hover:text-yellow-300 transition hover:scale-110">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* SCANNER BUTTON */}
          <Link
            to="/scan"
            className="text-xl hover:text-blue-200 transition hover:scale-110"
            title="Scan Tickets"
          >
            📷
          </Link>

          {/* NOTIFICATION BELL */}
          <div className="relative cursor-pointer hover:text-blue-200 transition hover:scale-110" onClick={handleMarkRead}>
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          {/* NOTIFICATION DROPDOWN */}
          {showNotifications && (
            <div className="absolute top-12 right-20 w-80 bg-white dark:bg-gray-700 shadow-2xl rounded-xl overflow-hidden border dark:border-gray-600 z-50 animate-fadeIn">
              <div className="p-3 font-bold border-b dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                Notifications
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`p-3 border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm dark:text-gray-200 transition ${!n.isRead ? 'bg-blue-50 dark:bg-gray-600 border-l-4 border-blue-500' : ''}`}>
                      <span className="font-bold">{n.fromUserName}</span> {n.message}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-end">
            <Link to={`/profile/${user._id}`} className="hover:underline font-semibold text-sm">
              Welcome, {user?.firstName}
            </Link>
            {/* Admin Dashboard Link */}
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ml-2 transition shadow-sm"
              >
                Admin Panel
              </Link>
            )}
          </div>

          <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-bold transition active:scale-95">
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN GRID LAYOUT */}
      <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: CREATE EVENT FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-2xl shadow-xl sticky top-24 transition-colors border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create Event</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                value={newEvent.title}
                onChange={handleChange}
                placeholder="Event Title"
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />

              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />

              {/* City Selector */}
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <label className="block text-xs mb-1 text-gray-500 dark:text-gray-300 font-bold uppercase tracking-wide">Location</label>
                <select
                  name="location"
                  value={newEvent.location}
                  onChange={handleCityChange}
                  className="w-full p-1 bg-transparent outline-none dark:text-white font-medium cursor-pointer"
                >
                  {CITIES.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>

              <input
                name="date"
                type="date"
                value={newEvent.date}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />

              <input
                name="category"
                value={newEvent.category}
                onChange={handleChange}
                placeholder="Category (e.g. Music)"
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />

              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <label className="block text-xs mb-1 dark:text-gray-300 font-bold uppercase tracking-wide">Cover Image</label>
                <input type="file" onChange={handleImageChange} className="w-full text-sm dark:text-gray-300 cursor-pointer" />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:scale-95">
                Post Event
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: FEED & MAP */}
        <div className="lg:col-span-2 space-y-6">

          {/* FEATURED CAROUSEL / SLIDER (Only show in List view & not loading) */}
          {!showMap && !loading && events.length > 0 && (
            <div className="rounded-2xl overflow-hidden shadow-2xl relative mb-6 border border-gray-100 dark:border-gray-700" data-aos="fade-down">
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                effect={'fade'}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                className="w-full h-72"
              >
                {events.slice(0, 5).map((event) => (
                  <SwiperSlide key={`slide-${event._id}`}>
                    <div className="relative w-full h-full cursor-pointer group" onClick={() => navigate(`/ticket/${event._id}`)}>
                      {/* Background Image */}
                      {event.picturePath ? (
                        <img 
                          src={getImageUrl(event.picturePath)} // <--- UPDATED FOR CLOUDINARY
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          alt="featured" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-800 to-indigo-900"></div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                        <span className="bg-blue-600 text-[10px] uppercase font-bold px-2 py-1 rounded mb-2 inline-block tracking-wider">Featured</span>
                        <h2 className="text-3xl font-extrabold truncate drop-shadow-lg">{event.title}</h2>
                        <p className="opacity-90 text-sm mt-2 flex items-center gap-3 font-medium">
                          <span>📅 {new Date(event.date).toDateString()}</span>
                          <span>📍 {event.location}</span>
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* CONTROLS BAR */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-6 transition-colors border border-gray-100 dark:border-gray-700 sticky top-24 z-10">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-2 rounded-lg font-bold shadow transition flex items-center gap-2 active:scale-95 ${showMap ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
              >
                {showMap ? "📋 List View" : "🗺️ Map View"}
              </button>

              <input
                type="text"
                placeholder="Search..."
                className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs transition"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {!showMap && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                <select
                  className="p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Business">Business</option>
                  <option value="Sports">Sports</option>
                  <option value="Education">Education</option>
                  <option value="Party">Party</option>
                </select>

                <select
                  className="p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Popular">Most Popular</option>
                </select>
              </div>
            )}
          </div>

          {/* VIEW 1: MAP VIEW */}
          {showMap && (
            <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 relative z-0 animate-fadeIn">
              <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {events.filter(e => e.coordinates).map(event => (
                  <Marker key={event._id} position={[event.coordinates.lat, event.coordinates.lng]}>
                    <Popup>
                      <div className="text-center min-w-[150px]">
                        <h3 className="font-bold text-blue-600">{event.title}</h3>
                        <p className="text-xs">{event.date.split('T')[0]}</p>
                        <p className="text-xs font-bold mt-1">{event.participants.length} attending</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* VIEW 2: LIST VIEW (MODERN CARDS) */}
          {!showMap && (
            <>
              {loading ? (
                // SKELETON LOADING STATE
                <>
                  <SkeletonEvent />
                  <SkeletonEvent />
                  <SkeletonEvent />
                </>
              ) : (
                // ACTUAL EVENTS LIST
                events
                  .filter((event) => {
                    if (searchTerm === "") return event;
                    return event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.category.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .filter((event) => {
                    if (selectedCategory === "All") return event;
                    return event.category.toLowerCase() === selectedCategory.toLowerCase();
                  })
                  .sort((a, b) => {
                    if (sortOption === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
                    if (sortOption === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt);
                    if (sortOption === "Popular") return b.participants.length - a.participants.length;
                    return 0;
                  })
                  .map((event) => {
                    const isJoined = event.participants.includes(user._id);
                    const isCommentsOpen = openComments[event._id];
                    const isLiked = Boolean(event.likes && event.likes[user._id]);
                    const likeCount = event.likes ? Object.keys(event.likes).length : 0;

                    return (
                      <div 
                        key={event._id} 
                        data-aos="fade-up" // Scroll Animation
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden group"
                      >

                        {/* Decorative Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>

                        {event.picturePath && (
                          <div className="overflow-hidden rounded-xl mb-5 h-56 shadow-sm">
                            <img
                              src={getImageUrl(event.picturePath)} // <--- UPDATED FOR CLOUDINARY
                              alt="event"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{event.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              by <Link to={`/profile/${event.userId}`} className="hover:text-blue-600 font-semibold underline decoration-transparent hover:decoration-blue-600 transition">{event.creatorName}</Link>
                              • {new Date(event.date).toDateString()}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-sm">
                            {getCategoryIcon(event.category)} {event.category}
                          </span>
                        </div>

                        <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">{event.description}</p>

                        <div className="mt-6 flex justify-between items-center border-t dark:border-gray-700 pt-4">
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-5 font-medium">
                            <span className="flex items-center gap-1">📍 {event.location}</span>
                            <span className="flex items-center gap-1">👥 {event.participants.length}</span>

                            <button
                              onClick={() => handleLike(event._id)}
                              className={`flex items-center gap-1 transition-transform active:scale-90 ${isLiked ? "text-red-500 font-bold" : "hover:text-red-500"}`}
                            >
                              {isLiked ? "❤️" : "🤍"} {likeCount}
                            </button>

                            <button onClick={() => handleShare(event._id)} className="hover:text-blue-500 transition active:scale-90" title="Share">
                              🔗
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleComments(event._id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition active:scale-95"
                            >
                              💬 <span className="text-xs font-bold">{event.comments.length}</span>
                            </button>

                            {/* CHAT BUTTON */}
                            {isJoined && (
                              <button
                                onClick={() => setActiveChat({ id: event._id, title: event.title })}
                                className="text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 flex items-center gap-1 text-xs font-bold transition hover:bg-green-100 active:scale-95"
                              >
                                💬 Chat
                              </button>
                            )}

                            {/* Delete Button */}
                            {(event.userId === user._id || user.role === "admin") && (
                              <button
                                onClick={() => handleDelete(event._id)}
                                className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition active:scale-95"
                                title="Delete Event"
                              >
                                🗑️
                              </button>
                            )}

                            {/* Ticket OR Join Button */}
                            {isJoined ? (
                              <button
                                onClick={() => navigate(`/ticket/${event._id}`)}
                                className="px-5 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                              >
                                🎟️ Ticket
                              </button>
                            ) : (
                              <button
                                onClick={() => handleJoin(event._id)}
                                className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:scale-95"
                              >
                                Join
                              </button>
                            )}
                          </div>

                        </div>

                        {isCommentsOpen && (
                          <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 animate-fadeIn">
                            <h4 className="font-bold text-sm mb-3 dark:text-white uppercase tracking-wide opacity-70">Discussion</h4>

                            <div className="max-h-40 overflow-y-auto mb-4 space-y-3 custom-scrollbar">
                              {event.comments.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No comments yet. Be the first!</p>
                              ) : (
                                event.comments.map((comment, i) => (
                                  <div key={i} className="bg-white dark:bg-gray-600 p-3 rounded-lg shadow-sm text-sm dark:text-white border border-gray-100 dark:border-gray-500">
                                    <span className="font-bold text-blue-600 dark:text-blue-300 mr-2">
                                      {comment.firstName}:
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-200">{comment.text}</span>
                                  </div>
                                ))
                              )}
                            </div>

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const text = e.target.comment.value;
                                if (!text) return;
                                handleComment(event._id, text);
                                e.target.comment.value = "";
                              }}
                              className="flex gap-2"
                            >
                              <input
                                name="comment"
                                type="text"
                                placeholder="Write a comment..."
                                className="w-full p-2.5 rounded-lg text-sm border bg-white dark:bg-gray-600 dark:border-gray-500 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                              />
                              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm font-bold transition active:scale-95">
                                Post
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </>
          )}
        </div>
      </div>

      {/* GLOBAL CHAT BOX OVERLAY */}
      {activeChat && (
        <ChatBox
          eventId={activeChat.id}
          eventTitle={activeChat.title}
          user={user}
          onClose={() => setActiveChat(null)}
        />
      )}

    </div>
  );
};

export default Dashboard;