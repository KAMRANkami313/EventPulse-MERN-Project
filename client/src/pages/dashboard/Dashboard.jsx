import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ChatBox from "../../components/ChatBox";
import SkeletonEvent from "../../components/SkeletonEvent";
import { getImageUrl } from "../../utils/imageHelper";
import { loadStripe } from "@stripe/stripe-js";
import StarRating from "../../components/StarRating";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import Recommendations from "../../components/Recommendations";
import toast from 'react-hot-toast';

// --- i18n Imports ---
import { useTranslation } from "react-i18next";

// --- MODERN UI IMPORTS (New) ---
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Map as MapIcon, List, Bell, LogOut, Sun, Moon,
  Plus, Filter, Heart, MessageCircle, Share2, Flag,
  Bookmark, Download, Trash2, Calendar, MapPin, DollarSign, User, X, Settings, Menu
} from "lucide-react";
import Button from "../../components/ui/Button"; // Your new component
import Card from "../../components/ui/Card";     // Your new component

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL;

// --- STRIPE CONFIGURATION ---
const stripePromise = loadStripe("pk_test_51SH0CJ7HwdZq8BC7oyKPQxaAQ47C8IBRy0hzIgeUo4jdCSL6q6fTnI4Ut3JkRjgfvd0ys0cfWaiyVPqFSX3gKFd00ZEBHxmlC");

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

// --- START: NEW CREATE EVENT MODAL COMPONENT (Dynamic) ---

const CreateEventModal = ({
  isOpen,
  onClose,
  newEvent,
  handleChange,
  handleCityChange,
  handleImageChange,
  handleSubmit,
  CITIES,
  t
}) => {
  if (!isOpen) return null;

  // Custom submit handler to close the modal on successful submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the main Dashboard handleSubmit logic
      await handleSubmit(e);
      // Close modal only if no error toast was shown (implicit success)
      onClose();
    } catch (error) {
      // Error handled by handleSubmit and toast, modal remains open
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with Glassmorphism Effect */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          ></div>

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-8 overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
              {t('create_new_event')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">{t('fill_event_details')}</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                name="title"
                value={newEvent.title}
                onChange={handleChange}
                placeholder={t('event_title')}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-transparent focus:border-violet-500 outline-none transition dark:text-white shadow-sm"
                required
              />

              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleChange}
                placeholder={t('description')}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-transparent focus:border-violet-500 outline-none transition dark:text-white resize-none h-24 shadow-sm"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{t('location')}</label>
                  <select
                    name="location"
                    value={newEvent.location}
                    onChange={handleCityChange}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 outline-none text-sm font-medium dark:text-white cursor-pointer border focus:border-violet-500 transition shadow-sm"
                  >
                    {CITIES.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{t('date')}</label>
                  <input
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 outline-none text-sm font-medium dark:text-white border focus:border-violet-500 transition shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={newEvent.price}
                  onChange={handleChange}
                  placeholder={t('price_usd')}
                  className="w-1/3 p-3 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white transition shadow-sm"
                />
                <input
                  name="category"
                  value={newEvent.category}
                  onChange={handleChange}
                  placeholder={t('category_placeholder')}
                  className="w-2/3 p-3 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white transition shadow-sm"
                  required
                />
              </div>

              <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">{t('upload_image')}</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>

              <Button type="submit" className="w-full py-3 text-lg font-bold shadow-lg shadow-violet-500/30 mt-6">
                {t('submit_event')}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- END: NEW CREATE EVENT MODAL COMPONENT ---

const Dashboard = ({ toggleTheme, theme }) => {
  const navigate = useNavigate();

  // --- i18n Hook Initialization ---
  const { t, i18n } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  // --- MOBILE RESPONSIVE STATES ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // --- STATES (ALL ORIGINAL STATES KEPT) ---
  const [loading, setLoading] = useState(true);

  // Feed Toggle State
  const [feedType, setFeedType] = useState("all");

  // Chat State
  const [activeChat, setActiveChat] = useState(null);

  // Event Data
  const [events, setEvents] = useState([]);

  // PAGINATION STATES
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // REVIEW STATES
  const [tempRating, setTempRating] = useState(5);

  // BOOKMARKS STATE
  const [bookmarks, setBookmarks] = useState(user?.bookmarks || []);

  // Filter & UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [openComments, setOpenComments] = useState({});
  const [showMap, setShowMap] = useState(false);

  // MODAL STATE (NEW)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // --- API FETCH FUNCTIONS ---

  const fetchEvents = async (pageNum = 1, reset = false) => {
    if (reset) setLoading(true);
    if (pageNum > 1) setIsFetchingMore(true);

    try {
      let url;
      if (feedType === "following") {
        // 🟢 DEPLOYMENT CHANGE 1/14
        url = `${API_URL}/events/following/${user._id}`;
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setEvents(response.data);
        setHasMore(false);
        setPage(1);
      } else {
        const params = new URLSearchParams({
          page: pageNum,
          limit: 5,
          search: searchTerm,
          category: selectedCategory,
          sort: sortOption
        });
        // 🟢 DEPLOYMENT CHANGE 2/14
        url = `${API_URL}/events?${params.toString()}`;
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

        if (reset) {
          setEvents(response.data.data);
        } else {
          setEvents((prev) => [...prev, ...response.data.data]);
        }
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
      // 🟢 DEPLOYMENT CHANGE 3/14
      const response = await axios.get(`${API_URL}/notifications/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchEvents(1, true);
        fetchNotifications();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, navigate, user?._id, feedType, searchTerm, selectedCategory, sortOption]);

  // --- EVENT HANDLERS (ALL ORIGINAL HANDLERS KEPT) ---

  const handleMarkRead = async () => {
    if (unreadCount > 0) {
      try {
        // 🟢 DEPLOYMENT CHANGE 4/14
        await axios.patch(`${API_URL}/notifications/${user._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
      } catch (err) { console.error(err); }
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

  // 1. CREATE EVENT
  const handleSubmit = async (e) => {
    // Note: The modal calls e.preventDefault() before calling this if using handleFormSubmit
    // We only need to construct the logic here.

    // Safety check: ensure required fields are present if not using native form validation
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.category) {
      toast.error("Please fill all required fields.");
      // We set defaultPrevented true to tell the modal not to close
      e.defaultPrevented = true;
      return;
    }

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

      // 🟢 DEPLOYMENT CHANGE 5/14
      const response = await axios.post(`${API_URL}/events`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        toast.success("Event Created Successfully! 🎉");
        fetchEvents(1, true);
        // Reset the form state
        setNewEvent({
          title: "", description: "",
          location: CITIES[0].name, coordinates: { lat: CITIES[0].lat, lng: CITIES[0].lng },
          date: "", category: "", price: 0, picture: null
        });
      }
    } catch (err) {
      console.error("Error creating event", err);
      toast.error(err.response?.data?.message || "Error creating event. Check form details.");
      e.defaultPrevented = true;
    }
  };

  // 2. JOIN EVENT
  const handleJoin = async (eventId) => {
    try {
      // 🟢 DEPLOYMENT CHANGE 6/14
      const response = await axios.patch(`${API_URL}/events/${eventId}/join`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
      toast.success("Ticket Booked! check your email 📧");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to book ticket.");
    }
  };

  // 3. PAYMENT
  const handlePayment = async (event) => {
    try {
      // 🟢 DEPLOYMENT CHANGE 7/14
      const response = await axios.post(`${API_URL}/payment/create-checkout-session`, {
        eventId: event._id,
        eventTitle: event.title,
        price: event.price,
        userId: user._id
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        console.error("No payment URL received");
        toast.error("Payment Error: No secure payment link received.");
      }
    } catch (err) {
      console.error("Payment Error", err);
      toast.error("Could not initiate payment.");
    }
  };

  const handleLike = async (eventId) => {
    try {
      // 🟢 DEPLOYMENT CHANGE 8/14
      const response = await axios.patch(`${API_URL}/events/${eventId}/like`,
        { userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (eventId, text) => {
    try {
      // 🟢 DEPLOYMENT CHANGE 9/14
      const response = await axios.post(`${API_URL}/events/${eventId}/comments`,
        { userId: user._id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
    } catch (err) { console.error(err); }
  };

  // 4. RATING
  const handleRateEvent = async (eventId, rating, text) => {
    try {
      // 🟢 DEPLOYMENT CHANGE 10/14
      const response = await axios.post(`${API_URL}/events/${eventId}/reviews`,
        { userId: user._id, rating, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedEvent = response.data;
      setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
      setTempRating(5);
      toast.success("Review Submitted successfully! Thank you.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting review");
    }
  };

  // 5. REPORT
  const handleReport = async (event) => {
    const reason = prompt("Why are you reporting this event? (Spam, Scam, Inappropriate, Other)");
    if (!reason || reason.trim() === "") return;

    try {
      // 🟢 DEPLOYMENT CHANGE 11/14
      await axios.post(`${API_URL}/admin/report`, {
        reporterId: user._id,
        reporterName: user.firstName,
        targetEventId: event._id,
        eventTitle: event.title,
        reason: reason
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Report submitted to Admins.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit report.");
    }
  };

  // 6. DELETE
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      // 🟢 DEPLOYMENT CHANGE 12/14
      await axios.delete(`${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((e) => e._id !== eventId));
      toast.success("Event deleted successfully.");
    } catch (err) {
      toast.error("Could not delete event.");
    }
  };

  // 7. SHARE
  const handleShare = (eventId) => {
    navigator.clipboard.writeText(`Check out this event on EventPulse!`);
    toast.success("Link copied to clipboard! Ready to share.");
  };

  // 8. BOOKMARK
  const handleBookmark = async (eventId) => {
    try {
      // 🟢 DEPLOYMENT CHANGE 13/14
      const res = await axios.patch(`${API_URL}/users/${user._id}/bookmark/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data);
      const updatedUser = { ...user, bookmarks: res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Bookmarks updated! 🔖");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bookmark.");
    }
  };

  // 9. DOWNLOAD GUEST LIST
  const downloadGuestList = async (eventId, eventTitle) => {
    try {
      // 🟢 DEPLOYMENT CHANGE 14/14
      const res = await axios.get(`${API_URL}/events/${eventId}/guests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const guests = res.data;
      if (guests.length === 0) return toast.error("No guests yet!");

      const headers = "Name,Email,Location\n";
      const rows = guests.map(g => `${g.firstName} ${g.lastName},${g.email},${g.location}`).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${eventTitle}_GuestList.csv`);
      document.body.appendChild(link);
      link.click();

      toast.success("Guest list downloaded! 📋");

    } catch (err) { console.error(err); }
  };

  const toggleComments = (eventId) => {
    setOpenComments((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Language Button Styling Helper
  const getLanguageButtonClass = (lang) => {
    return `hover:scale-110 transition active:scale-95 text-xl ${i18n.language === lang ? 'opacity-100 ring-2 ring-violet-500 rounded-lg p-0.5' : 'opacity-60'} cursor-pointer select-none`;
  };

  // --- MODERN RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-violet-200 dark:selection:bg-violet-900">

      {/* 1. GLASSMORPHISM NAVBAR - MOBILE RESPONSIVE */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 left-4 right-4 z-[1000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-xl p-3 px-6 flex justify-between items-center"
      >
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">E</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 hidden md:block tracking-tighter">EventPulse</h1>
        </div>

        {/* DESKTOP NAV ITEMS (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-4">

          {/* LANGUAGE SWITCHER (FIXED - NO CSS CONFLICT) */}
          {/* Changed 'flex ... hidden md:flex' to just 'hidden md:flex' */}
          <div className="hidden md:flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl items-center border border-slate-200 dark:border-slate-700">
            {['en', 'es', 'fr', 'ur', 'tr', 'ar'].map((lang) => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-lg transition-all ${i18n.language === lang ? 'bg-white dark:bg-slate-700 shadow-sm scale-110 opacity-100' : 'opacity-50 hover:opacity-100'}`}
                title={lang.toUpperCase()}
              >
                {lang === 'en' ? '🇬🇧' :
                  lang === 'es' ? '🇪🇸' :
                    lang === 'fr' ? '🇫🇷' :
                      lang === 'ur' ? '🇵🇰' :
                        lang === 'tr' ? '🇹🇷' : '🇸🇦'}
              </button>
            ))}
          </div>

          {/* Note: I also updated the Mobile Menu list below in the next block to include these */}

          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <Link to="/settings" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"><Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" /></Link>
          <Link to="/scan" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"><List className="w-5 h-5 text-slate-600 dark:text-slate-300" /></Link>

          {/* NOTIFICATION BELL */}
          <div className="relative cursor-pointer p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition" onClick={handleMarkRead}>
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-[10px] text-white rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          {/* USER PROFILE */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <Link to={`/profile/${user._id}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-violet-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-violet-500 transition-all">
                {user.picturePath ? <img src={getImageUrl(user.picturePath)} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-violet-600" />}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-bold dark:text-white">{user?.firstName}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">{user.role === "admin" ? "Admin" : "Member"}</span>
              </div>
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className="bg-red-100 text-red-600 text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ml-1 transition hover:bg-red-200">Panel</Link>
            )}
            <Button variant="ghost" onClick={handleLogout} className="p-2"><LogOut className="w-5 h-5 text-slate-500 hover:text-red-500 transition" /></Button>
          </div>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="flex md:hidden items-center gap-3">
          <div className="relative cursor-pointer p-2" onClick={handleMarkRead}>
            <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 h-3 w-3 rounded-full animate-pulse"></span>}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-700 dark:text-white">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="fixed top-24 left-4 right-4 z-[999] bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col gap-4 overflow-hidden md:hidden"
          >
            {/* User Profile Mobile */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <img src={getImageUrl(user.picturePath)} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold dark:text-white text-lg">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                {user.role === 'admin' && <Link to="/admin" className="text-xs font-bold text-red-500 mt-1 block">ACCESS ADMIN PANEL</Link>}
              </div>
            </div>

            {/* Mobile Actions Grid */}
            <div className="grid grid-cols-4 gap-2">
              <button onClick={toggleTheme} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1">
                {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                <span className="text-[10px] dark:text-white">Theme</span>
              </button>
              <Link to="/settings" className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-[10px] dark:text-white">Setting</span>
              </Link>
              <Link to="/scan" className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1">
                <List className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-[10px] dark:text-white">Orders</span>
              </Link>
              <Link to={`/profile/${user._id}`} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-[10px] dark:text-white">Profile</span>
              </Link>
            </div>

            {/* Mobile Language Selector */}
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Language</label>
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
                className="w-full bg-transparent dark:text-white font-bold outline-none"
              >
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="fr">🇫🇷 French</option>
                <option value="ur">🇵🇰 Urdu</option>
                <option value="tr">🇹🇷 Turkish</option>
                <option value="ar">🇸🇦 Arabic</option>
              </select>
            </div>

            <Button variant="danger" onClick={handleLogout} className="w-full justify-center py-3">Logout</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION DROPDOWN (Global) */}
      <AnimatePresence>
        {(showNotifications) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-20 right-4 w-80 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 z-[1002]"
          >
            {/* ... (Existing notification content remains the same) ... */}
            <div className="p-3 font-bold border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200">
              {t('notifications')}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-slate-400 text-center">{t('no_notifications_yet')}</p>
              ) : (
                notifications.map(n => (
                  <div key={n._id} className={`p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition ${!n.isRead ? 'bg-violet-50 dark:bg-slate-700/50 border-l-4 border-violet-500' : ''}`}>
                    <span className="font-bold text-violet-600 dark:text-violet-400">{n.fromUserName}</span> <span className="dark:text-slate-300">{n.message}</span>
                    <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING CREATE EVENT BUTTON */}
      {/* HIDDEN WHEN CHAT IS OPEN TO PREVENT OVERLAP */}
      {!activeChat && (
        <motion.button
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[900] p-4 rounded-full shadow-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:scale-105 transition-all"
          onClick={() => setIsCreateModalOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          title={t('create_new_event')}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* MAIN LAYOUT: CENTERED FEED */}
      {/* Fix: Changed grid to flex/mx-auto approach to center content when left side is empty */}
      <div className="container mx-auto p-4 pt-32 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: RECOMMENDATIONS (Hidden on mobile, col-span-3 on large) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28">
            <Recommendations userId={user._id} token={token} />
            <div className="h-6"></div>
          </div>

          {/* MAIN COLUMN: FEED & MAP (Centered, col-span-9 on large, adjusted for centering) */}
          {/* Using col-start to ensure centering if left column is visually ignored by user preference, but generally in 12-col grid, 3-6-3 or 3-9 split works nicely. */}
          {/* To force centering as requested "right positions... to be at center": */}
          <div className="col-span-1 lg:col-span-8 lg:col-start-4 xl:col-span-6 xl:col-start-4 space-y-6 w-full">

            {/* FEATURED CAROUSEL */}
            {!showMap && !loading && events.length > 0 && feedType === 'all' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl overflow-hidden shadow-2xl relative mb-6 border-4 border-white dark:border-slate-800">
                <Swiper
                  modules={[Autoplay, Pagination, EffectFade]}
                  spaceBetween={0}
                  slidesPerView={1}
                  effect={'fade'}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  className="w-full h-64 md:h-80"
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
                          <div className="w-full h-full bg-gradient-to-br from-violet-800 to-fuchsia-900"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                          <span className="bg-violet-600/90 backdrop-blur text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-3 inline-block tracking-wider shadow-lg">{t('featured_event')}</span>
                          <h2 className="text-2xl md:text-4xl font-extrabold truncate drop-shadow-2xl">{event.title}</h2>
                          <p className="opacity-90 text-sm mt-2 flex items-center gap-4 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toDateString()}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                          </p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </motion.div>
            )}

            {/* CONTROLS BAR (Mobile Responsive) */}
            <Card className="sticky top-24 z-20 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center mb-0 md:mb-4 gap-4">

                {/* Top Row: Map | Filters(Mobile) | Search */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {/* Map Toggle */}
                  <Button variant="secondary" onClick={() => setShowMap(!showMap)} className="shadow-sm text-sm whitespace-nowrap">
                    {showMap ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                    <span className="hidden md:inline">{showMap ? t('list_view') : t('map_view')}</span>
                  </Button>

                  {/* Mobile Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                  >
                    <Filter className="w-5 h-5" />
                  </button>

                  {/* Feed Toggle (Hidden on very small screens, shown in filters) */}
                  <div className="hidden md:flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setFeedType("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${feedType === "all" ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white" : "text-slate-500"}`}>{t('global_feed')}</button>
                    <button onClick={() => setFeedType("following")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${feedType === "following" ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white" : "text-slate-500"}`}>{t('following_feed')}</button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:max-w-xs focus-within:ring-2 ring-violet-500 transition-all">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('search_events')}
                    className="bg-transparent outline-none text-sm w-full dark:text-white placeholder:text-slate-400"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* COLLAPSIBLE FILTERS (Visible on Desktop, Toggled on Mobile) */}
              <AnimatePresence>
                {(!showMap && (showFilters || window.innerWidth > 768)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col md:flex-row gap-2 md:gap-4 overflow-hidden pt-3 md:pt-0"
                  >
                    {/* Mobile Feed Toggle (Only visible on mobile) */}
                    <div className="flex md:hidden bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
                      <button onClick={() => setFeedType("all")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${feedType === "all" ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white" : "text-slate-500"}`}>{t('global_feed')}</button>
                      <button onClick={() => setFeedType("following")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${feedType === "following" ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white" : "text-slate-500"}`}>{t('following_feed')}</button>
                    </div>

                    <select
                      className="w-full md:w-auto px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none cursor-pointer"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      value={selectedCategory}
                    >
                      <option value="All">{t('all_categories')}</option>
                      <option value="Music">{t('music')}</option>
                      <option value="Tech">{t('tech')}</option>
                      <option value="Business">{t('business')}</option>
                      <option value="Sports">{t('sports')}</option>
                      <option value="Education">{t('education')}</option>
                      <option value="Party">{t('party')}</option>
                    </select>

                    <select
                      className="w-full md:w-auto px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none cursor-pointer"
                      onChange={(e) => setSortOption(e.target.value)}
                      value={sortOption}
                    >
                      <option value="Newest">{t('sort_newest')}</option>
                      <option value="Oldest">{t('sort_oldest')}</option>
                      <option value="Popular">{t('sort_popular')}</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* VIEW 1: MAP VIEW */}
            {showMap && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 relative z-0">
                <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {events.filter(e => e.coordinates).map(event => (
                    <Marker key={event._id} position={[event.coordinates.lat, event.coordinates.lng]}>
                      <Popup>
                        <div className="text-center min-w-[150px]">
                          <h3 className="font-bold text-violet-600">{event.title}</h3>
                          <p className="text-xs">{event.date.split('T')[0]}</p>
                          <p className="text-xs font-bold mt-1">{event.participants.length} {t('attending')}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </motion.div>
            )}

            {/* VIEW 2: LIST VIEW */}
            {!showMap && (
              <>
                {loading ? (
                  <div className="space-y-4">
                    <SkeletonEvent />
                    <SkeletonEvent />
                    <SkeletonEvent />
                  </div>
                ) : (
                  // Events found?
                  events.length > 0 ? (
                    events.map((event) => {
                      const isJoined = event.participants.includes(user._id);
                      const isCommentsOpen = openComments[event._id];
                      const isLiked = Boolean(event.likes && event.likes[user._id]);
                      const likeCount = event.likes ? Object.keys(event.likes).length : 0;
                      const userReview = event.reviews?.find(r => r.userId === user._id);
                      const isBookmarked = bookmarks.includes(event._id);

                      return (
                        <Card
                          key={event._id}
                          id={event._id}
                          className="group hover:border-violet-500/30 transition-all duration-300 mb-6"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(event._id);
                            }}
                            className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-black/50 p-2 rounded-full shadow-lg hover:scale-110 transition backdrop-blur-md"
                            title={t('save_event')}
                          >
                            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-violet-500 text-violet-500" : "text-slate-600 dark:text-white"}`} />
                          </button>

                          {event.picturePath && (
                            <div className="overflow-hidden rounded-2xl mb-5 h-64 -mx-6 -mt-6 relative shadow-md">
                              <img
                                src={getImageUrl(event.picturePath)}
                                alt="event"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute top-4 left-4">
                                <span className="bg-white/90 dark:bg-black/70 backdrop-blur text-slate-800 dark:text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-sm border border-white/20">
                                  {getCategoryIcon(event.category)} {event.category}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">{event.title}</h4>

                              <div className="flex items-center gap-2 mt-1">
                                <StarRating rating={event.averageRating || 0} />
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">({event.reviews?.length || 0} {t('reviews')})</span>
                              </div>

                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                                {t('by')} <Link to={`/profile/${event.userId}`} className="hover:text-violet-600 font-bold underline decoration-transparent hover:decoration-violet-600 transition flex items-center gap-1"><User className="w-3 h-3" /> {event.creatorName}</Link>
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              {event.price > 0 ? (
                                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg text-sm font-extrabold border border-emerald-100 dark:border-emerald-900">
                                  ${event.price}
                                </span>
                              ) : (
                                <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-bold">
                                  {t('free')}
                                </span>
                              )}
                              <span className="text-xs text-slate-400 font-medium">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">{event.description}</p>

                          {new Date(event.date) < new Date() && (
                            <div className="mt-4 mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                              {!userReview ? (
                                <div>
                                  <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-2">{t('event_finished_review')}</p>
                                  <div className="flex gap-2 mb-2">
                                    <StarRating rating={tempRating} setRating={setTempRating} isEditable={true} />
                                  </div>
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleRateEvent(event._id, tempRating, e.target.reviewText.value);
                                      e.target.reviewText.value = "";
                                    }}
                                    className="flex gap-2"
                                  >
                                    <input
                                      name="reviewText"
                                      placeholder={t('write_a_review')}
                                      className="w-full p-2 text-sm border-none rounded-lg bg-white dark:bg-black/20 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                                      required
                                    />
                                    <Button type="submit" variant="secondary" className="px-4 py-2 text-xs h-auto">{t('submit')}</Button>
                                  </form>
                                </div>
                              ) : (
                                <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                  <span className="text-lg">✅</span>
                                  <p>{t('you_rated_this')}: <b className="ml-1 text-amber-500">{userReview.rating} {t('stars')}</b> {userReview.text && <span className="italic ml-2 opacity-75">"{userReview.text}"</span>}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 gap-4">

                            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-2 font-medium w-full sm:w-auto justify-between sm:justify-start">
                              <Button
                                variant="ghost"
                                onClick={() => handleLike(event._id)}
                                className={`px-2 gap-1 ${isLiked ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20" : "hover:text-rose-500"}`}
                              >
                                <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`} /> {likeCount}
                              </Button>

                              <Button variant="ghost" onClick={() => handleShare(event._id)} className="px-2" title={t('share')}><Share2 className="w-5 h-5" /></Button>

                              <Button variant="ghost" onClick={() => handleReport(event)} className="px-2 hover:text-red-500" title={t('report')}><Flag className="w-5 h-5" /></Button>

                              <span className="flex items-center gap-1 ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full"><MapPin className="w-3 h-3" /> {event.location}</span>
                              <span className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full"><User className="w-3 h-3" /> {event.participants.length}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                              {event.userId === user._id && (
                                <Button variant="secondary" onClick={() => downloadGuestList(event._id, event.title)} className="px-3 py-1.5 text-xs" title={t('guest_list')}>
                                  <Download className="w-4 h-4" /> CSV
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                onClick={() => toggleComments(event._id)}
                                className="px-3 py-1.5 text-xs gap-1"
                              >
                                <MessageCircle className="w-4 h-4" /> {event.comments.length}
                              </Button>

                              {isJoined && (
                                <Button
                                  variant="success"
                                  onClick={() => setActiveChat({ id: event._id, title: event.title })}
                                  className="px-3 py-1.5 text-xs gap-1"
                                >
                                  {t('chat')}
                                </Button>
                              )}

                              {(event.userId === user._id || user.role === "admin") && (
                                <Button
                                  variant="danger"
                                  onClick={() => handleDelete(event._id)}
                                  className="px-3 py-1.5 text-xs"
                                  title={t('delete_event')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}

                              {isJoined ? (
                                <Button
                                  variant="primary"
                                  onClick={() => navigate(`/ticket/${event._id}`)}
                                  className="px-5 py-2 text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none shadow-lg shadow-violet-500/20"
                                >
                                  {t('view_ticket')}
                                </Button>
                              ) : (
                                event.price > 0 ? (
                                  <Button
                                    variant="primary"
                                    onClick={() => handlePayment(event)}
                                    className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 border-none shadow-lg shadow-emerald-500/20"
                                  >
                                    {t('buy_ticket')} ${event.price}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    onClick={() => handleJoin(event._id)}
                                    className="px-5 py-2 text-sm shadow-lg shadow-blue-500/20"
                                  >
                                    {t('join_free')}
                                  </Button>
                                )
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isCommentsOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <h4 className="font-bold text-xs mb-3 dark:text-white uppercase tracking-wide opacity-50">{t('discussion_board')}</h4>

                                  <div className="max-h-40 overflow-y-auto mb-4 space-y-3 scrollbar-hide">
                                    {event.comments.length === 0 ? (
                                      <p className="text-xs text-slate-400 italic">{t('no_comments_yet')}</p>
                                    ) : (
                                      event.comments.map((comment, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm text-sm dark:text-white border border-slate-100 dark:border-slate-700">
                                          <span className="font-bold text-violet-600 dark:text-violet-400 mr-2">
                                            {comment.firstName}:
                                          </span>
                                          <span className="text-slate-700 dark:text-slate-300">{comment.text}</span>
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
                                      placeholder={t('write_a_comment')}
                                      className="w-full p-2.5 rounded-xl text-sm border-none bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition shadow-sm"
                                    />
                                    <Button type="submit" variant="secondary" className="px-4 py-2 text-xs">
                                      {t('post')}
                                    </Button>
                                  </form>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-white/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                      <Search className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">{t('no_events_found')}</h3>
                      <p className="text-slate-400 mt-2">{t('try_adjusting_filters')}</p>
                    </div>
                  )
                )}

                {!loading && hasMore && events.length > 0 && feedType === 'all' && (
                  <div className="flex justify-center mt-8 mb-12">
                    <Button
                      variant="secondary"
                      onClick={() => fetchEvents(page + 1, false)}
                      disabled={isFetchingMore}
                      className="px-8 py-3 rounded-full font-bold shadow-lg bg-white dark:bg-slate-800 hover:scale-105"
                    >
                      {isFetchingMore ? t('loading') : t('load_more_events')}
                    </Button>
                  </div>
                )}

                {!loading && !hasMore && events.length > 0 && (
                  <p className="text-center text-slate-400 text-sm mt-8 mb-12 flex justify-center items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span> {t('reached_end')}
                  </p>
                )}
              </>
            )}
          </div>
          {/* End of Main Column */}
        </div>
      </div>

      {/* 2. DYNAMIC CREATE EVENT MODAL */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        newEvent={newEvent}
        handleChange={handleChange}
        handleCityChange={handleCityChange}
        handleImageChange={handleImageChange}
        handleSubmit={handleSubmit}
        CITIES={CITIES}
        t={t}
      />

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