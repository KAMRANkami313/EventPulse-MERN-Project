import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChatBox from "../../components/ChatBox";
import SkeletonEvent from "../../components/SkeletonEvent"; 
import { getImageUrl } from "../../utils/imageHelper"; 
import { loadStripe } from "@stripe/stripe-js"; 
import StarRating from "../../components/StarRating"; // <--- NEW IMPORT
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // <--- NEW ICONS IMPORT

// --- STRIPE CONFIGURATION ---
const stripePromise = loadStripe("pk_test_51SH0CJ7HwdZq8BC7oyKPjQxaAQ47C8IBRy0hzIgeUo4jdCSL6q6fTnI4Ut3JkRjgfvd0ys0cfWaiyVPqFSX3gKFd00ZEBHxmlC");

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

// PRESET CITIES
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
  
  // Feed Toggle State
  const [feedType, setFeedType] = useState("all"); // 'all' or 'following'

  // Chat State
  const [activeChat, setActiveChat] = useState(null); 

  // Event Data
  const [events, setEvents] = useState([]);

  // PAGINATION STATES (NEW in Phase 17)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // REVIEW STATES (NEW in Phase 18)
  const [tempRating, setTempRating] = useState(5); 


  // Create Event Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: CITIES[0].name,
    coordinates: { lat: CITIES[0].lat, lng: CITIES[0].lng },
    date: "",
    category: "",
    price: 0,
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

  // --- API FETCH FUNCTIONS ---
  
  // NOTE: This function is completely rewritten to handle pagination and backend filtering.
  const fetchEvents = async (pageNum = 1, reset = false) => {
    // Show main skeleton loader only on reset (initial load or filter change)
    if (reset) setLoading(true); 
    // Show button spinner when loading next pages
    if (pageNum > 1) setIsFetchingMore(true);

    try {
      
      let url;
      
      // Case 1: Following Feed (Non-paginated, based on current backend setup)
      if (feedType === "following") {
          url = `http://localhost:5000/events/following/${user._id}`;
          
          const response = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
          });
          
          setEvents(response.data);
          setHasMore(false); // Always false for the following feed (it loads all)
          setPage(1); 
          
      } else {
          // Case 2: Global Feed (PAGINATED + FILTERED)
          const params = new URLSearchParams({
              page: pageNum,
              limit: 5, // Fixed limit of 5 per page
              search: searchTerm,
              category: selectedCategory,
              sort: sortOption
          });

          url = `http://localhost:5000/events?${params.toString()}`;

          const response = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
          });

          if (reset) {
              // New Search/Filter/Initial Load: Replace all events
              setEvents(response.data.data);
          } else {
              // Load More: Append new events to existing list
              setEvents((prev) => [...prev, ...response.data.data]);
          }

          // Check if we reached the end
          setHasMore(pageNum < response.data.totalPages);
          setPage(pageNum);
      }

    } catch (err) {
      console.error("Error fetching events", err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
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

  // --- EFFECTS (MERGED) ---
  
  // Replaces the old useEffect. This runs on initial load AND whenever filters change.
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      // Use a timeout for Search (Debounce) to prevent API spam while typing
      const delayDebounceFn = setTimeout(() => {
        fetchEvents(1, true); // Always reset to Page 1 when filters or feedType changes
        fetchNotifications();
      }, 500);
      
      return () => clearTimeout(delayDebounceFn);
    }
    // Dependencies include all filters and the feed type
  }, [token, navigate, user?._id, feedType, searchTerm, selectedCategory, sortOption]); 


  // --- EVENT HANDLERS ---
// ... (All other handlers remain the same) ...

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
      formData.append("price", newEvent.price);
      if (newEvent.picture) formData.append("picture", newEvent.picture);

      const response = await axios.post("http://localhost:5000/events", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        alert("Event Created!");
        // After creating an event, trigger a reset fetch to show the new event on page 1
        fetchEvents(1, true); 
        setNewEvent({
          title: "", description: "",
          location: CITIES[0].name, coordinates: { lat: CITIES[0].lat, lng: CITIES[0].lng },
          date: "", category: "", price: 0, picture: null
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

  const handlePayment = async (event) => {
    try {
        const response = await axios.post("http://localhost:5000/payment/create-checkout-session", {
            eventId: event._id,
            eventTitle: event.title,
            price: event.price,
            userId: user._id
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (response.data.url) {
            window.location.href = response.data.url;
        } else {
            console.error("No payment URL received");
            alert("Payment Error: No URL received");
        }

    } catch (err) {
        console.error("Payment Error", err);
        alert("Could not initiate payment.");
    }
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
  
  // --- NEW RATING HANDLER ---
  const handleRateEvent = async (eventId, rating, text) => {
    try {
      const response = await axios.post(`http://localhost:5000/events/${eventId}/reviews`, 
        { userId: user._id, rating, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
      setTempRating(5); // Reset temp rating for next use
      alert("Review Submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    }
  };
  // --------------------------

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

          <Link
            to="/scan"
            className="text-xl hover:text-blue-200 transition hover:scale-110"
            title="Scan Tickets"
          >
            📷
          </Link>

          <div className="relative cursor-pointer hover:text-blue-200 transition hover:scale-110" onClick={handleMarkRead}>
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

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

              <div className="flex gap-2">
                  <input
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                  <input 
                    name="price" 
                    type="number"
                    min="0"
                    value={newEvent.price} 
                    onChange={handleChange} 
                    placeholder="Price ($)" 
                    className="w-28 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition" 
                  />
              </div>

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

          {/* FEATURED CAROUSEL */}
          {!showMap && !loading && events.length > 0 && feedType === 'all' && (
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
                      {event.picturePath ? (
                        <img 
                          src={getImageUrl(event.picturePath)} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          alt="featured" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-800 to-indigo-900"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
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
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              
              <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowMap(!showMap)}
                    className={`px-4 py-2 rounded-lg font-bold shadow transition flex items-center gap-2 active:scale-95 ${showMap ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
                >
                    {showMap ? "📋 List View" : "🗺️ Map View"}
                </button>

                {/* FEED TOGGLE SWITCH */}
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setFeedType("all")}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${feedType === "all" ? "bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                    >
                        Global
                    </button>
                    <button 
                        onClick={() => setFeedType("following")}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${feedType === "following" ? "bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                    >
                        Following
                    </button>
                </div>
              </div>

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
                  value={selectedCategory} // Ensure select reflects state
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
                  value={sortOption} // Ensure select reflects state
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

          {/* VIEW 2: LIST VIEW */}
          {!showMap && (
            <>
              {/* SKELETON LOADING */}
              {loading ? (
                <>
                  <SkeletonEvent />
                  <SkeletonEvent />
                  <SkeletonEvent />
                </>
              ) : (
                // Events found?
                events.length > 0 ? (
                  // Map directly over the events array (Frontend filtering is removed!)
                  events.map((event) => { 
                    const isJoined = event.participants.includes(user._id);
                    const isCommentsOpen = openComments[event._id];
                    const isLiked = Boolean(event.likes && event.likes[user._id]);
                    const likeCount = event.likes ? Object.keys(event.likes).length : 0;
                    const userReview = event.reviews?.find(r => r.userId === user._id); // Check for user's existing review

                    return (
                      <div 
                        key={event._id} 
                        data-aos="fade-up" 
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden group"
                      >

                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>

                        {event.picturePath && (
                          <div className="overflow-hidden rounded-xl mb-5 h-56 shadow-sm">
                            <img
                              src={getImageUrl(event.picturePath)} 
                              alt="event"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{event.title}</h4>
                            
                            {/* START: NEW RATING DISPLAY */}
                            <div className="flex items-center gap-2 mt-1">
                                <StarRating rating={event.averageRating || 0} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">({event.reviews?.length || 0})</span>
                            </div>
                            {/* END: NEW RATING DISPLAY */}

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              by <Link to={`/profile/${event.userId}`} className="hover:text-blue-600 font-semibold underline decoration-transparent hover:decoration-blue-600 transition">{event.creatorName}</Link>
                              • {new Date(event.date).toDateString()}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-sm">
                            {getCategoryIcon(event.category)} {event.category}
                          </span>
                        </div>

                        <div className="mb-2">
                            {event.price > 0 ? (
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-extrabold border border-green-200">💰 ${event.price}</span>
                            ) : (
                                <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-200">Free</span>
                            )}
                        </div>

                        <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">{event.description}</p>
                        
                        {/* --- REVIEW SECTION --- */}
                        {new Date(event.date) < new Date() && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-gray-700/50 rounded-lg border border-yellow-200 dark:border-gray-600">
                                
                                {/* Check if user has already reviewed */}
                                {!userReview ? (
                                    <div>
                                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                                            Event Finished. How was it?
                                        </p>
                                        <div className="flex gap-2 mb-2">
                                            {/* Use the tempRating state for the interactive stars */}
                                            <StarRating rating={tempRating} setRating={setTempRating} isEditable={true} />
                                        </div>
                                        <form 
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleRateEvent(event._id, tempRating, e.target.reviewText.value);
                                                e.target.reviewText.value = ""; // Clear input after submission
                                            }}
                                            className="flex gap-2"
                                        >
                                            <input 
                                                name="reviewText"
                                                placeholder="Write a review..."
                                                className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white outline-none"
                                                required 
                                            />
                                            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-bold transition active:scale-95">
                                                Submit
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    // If already reviewed, show their review status
                                    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                        <span className="text-lg">✅</span>
                                        <p>You rated this event: 
                                           <b className="ml-1">{userReview.rating} Stars</b>
                                           {userReview.text && <span className="italic ml-2">("{userReview.text}")</span>}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* --- END REVIEW SECTION --- */}


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

                            {isJoined && (
                              <button
                                onClick={() => setActiveChat({ id: event._id, title: event.title })}
                                className="text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 flex items-center gap-1 text-xs font-bold transition hover:bg-green-100 active:scale-95"
                              >
                                💬 Chat
                              </button>
                            )}

                            {(event.userId === user._id || user.role === "admin") && (
                              <button
                                onClick={() => handleDelete(event._id)}
                                className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition active:scale-95"
                                title="🗑️"
                              >
                                🗑️
                              </button>
                            )}

                            {isJoined ? (
                              <button
                                onClick={() => navigate(`/ticket/${event._id}`)}
                                className="px-5 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                              >
                                🎟️ Ticket
                              </button>
                            ) : (
                                event.price > 0 ? (
                                    <button 
                                        onClick={() => handlePayment(event)}
                                        className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                    >
                                        Buy Ticket ${event.price}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleJoin(event._id)}
                                        className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Join
                                    </button>
                                )
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
                ) : (
                  // No events found based on current filters/search
                  <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow">
                        <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">🔍 No events found.</h3>
                        <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )
              )}
              
              {/* LOAD MORE BUTTON UI */}
              {/* Only show Load More if not loading the initial page, we have more pages, and we are in Global feed */}
              {!loading && hasMore && events.length > 0 && feedType === 'all' && (
                  <div className="flex justify-center mt-8 mb-12">
                      <button 
                        onClick={() => fetchEvents(page + 1, false)} // false = append, don't reset
                        disabled={isFetchingMore}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                          {isFetchingMore ? (
                              <>
                                <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                                Loading...
                              </>
                          ) : (
                              "Load More Events ↓"
                          )}
                      </button>
                  </div>
              )}
              
              {/* END OF RESULTS MESSAGE */}
              {!loading && !hasMore && events.length > 0 && (
                  <p className="text-center text-gray-400 text-sm mt-8 mb-12">
                      🎉 You've reached the end of the list!
                  </p>
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