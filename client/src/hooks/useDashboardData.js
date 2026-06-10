import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { CITIES } from "../constants";
import toast from "react-hot-toast";

/**
 * useDashboardData — Extracted from Dashboard.jsx
 *
 * Encapsulates ALL dashboard state, API fetches, and event handlers.
 * Returns everything the Dashboard UI needs so the component stays slim.
 */
const useDashboardData = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useAuth();

  // --- RESPONSIVE ---
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // --- CORE DATA ---
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState("all");
  const [events, setEvents] = useState([]);

  // --- PAGINATION ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // --- REVIEW ---
  const [tempRating, setTempRating] = useState(5);

  // --- BOOKMARKS ---
  const [bookmarks, setBookmarks] = useState(user?.bookmarks || []);

  // --- FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [openComments, setOpenComments] = useState({});
  const [showMap, setShowMap] = useState(false);

  // --- MODALS ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "danger",
    onConfirm: () => {},
  });

  // --- CHAT ---
  const [activeChat, setActiveChat] = useState(null);

  // --- NOTIFICATIONS ---
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- CREATE EVENT FORM ---
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

  const fetchEvents = useCallback(
    async (pageNum = 1, reset = false) => {
      if (reset) setLoading(true);
      if (pageNum > 1) setIsFetchingMore(true);

      try {
        if (feedType === "following") {
          const response = await api.get(`/events/following/${user._id}`);
          setEvents(response.data);
          setHasMore(false);
          setPage(1);
        } else {
          const params = new URLSearchParams({
            page: pageNum,
            limit: 5,
            search: searchTerm,
            category: selectedCategory,
            sort: sortOption,
          });
          const response = await api.get(`/events?${params.toString()}`);

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
    },
    [feedType, user?._id, searchTerm, selectedCategory, sortOption]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get(`/notifications/${user._id}`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  }, [user?._id]);

  // --- EFFECTS ---

  // Responsive breakpoint
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth guard + debounced data fetch
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
  }, [token, navigate, user?._id, feedType, searchTerm, selectedCategory, sortOption, fetchEvents, fetchNotifications]);

  // --- EVENT HANDLERS ---

  const handleMarkRead = async () => {
    if (unreadCount > 0) {
      try {
        await api.patch(`/notifications/${user._id}/read`);
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
    const selectedCity = CITIES.find((c) => c.name === e.target.value);
    setNewEvent({
      ...newEvent,
      location: selectedCity.name,
      coordinates: { lat: selectedCity.lat, lng: selectedCity.lng },
    });
  };

  // CREATE EVENT — Returns true on success, false on failure
  const handleSubmit = async (e) => {
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.category) {
      toast.error("Please fill all required fields.");
      return false;
    }

    try {
      const formData = new FormData();
      formData.append("title", newEvent.title);
      formData.append("description", newEvent.description);
      formData.append("location", newEvent.location);
      formData.append("coordinates", JSON.stringify(newEvent.coordinates));
      formData.append("date", newEvent.date);
      formData.append("category", newEvent.category);
      formData.append("price", newEvent.price);
      if (newEvent.picture) formData.append("picture", newEvent.picture);

      const response = await api.post(`/events`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        toast.success("Event Created Successfully! 🎉");
        fetchEvents(1, true);
        setNewEvent({
          title: "",
          description: "",
          location: CITIES[0].name,
          coordinates: { lat: CITIES[0].lat, lng: CITIES[0].lng },
          date: "",
          category: "",
          price: 0,
          picture: null,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error creating event", err);
      const serverMsg =
        err.response?.data?.details?.map((d) => d.message).join(", ") ||
        err.response?.data?.message ||
        "Error creating event. Check form details.";
      toast.error(serverMsg);
      return false;
    }
  };

  // JOIN EVENT
  const handleJoin = async (eventId) => {
    try {
      const response = await api.patch(`/events/${eventId}/join`, {
        userId: user._id,
      });
      const updatedEvent = response.data;
      setEvents((prev) => prev.map((e) => (e._id === eventId ? updatedEvent : e)));
      toast.success("Ticket Booked! check your email 📧");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to book ticket.");
    }
  };

  // PAYMENT
  const handlePayment = async (event) => {
    try {
      // SECURITY FIX: No longer sending userId in body — server uses JWT
      const response = await api.post(`/payment/create-checkout-session`, {
        eventId: event._id,
        eventTitle: event.title,
        price: event.price,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        console.error("No payment URL received");
        toast.error("Payment Error: No secure payment link received.");
      }
    } catch (err) {
      console.error("Payment Error", err);
      toast.error(err.response?.data?.error || "Could not initiate payment.");
    }
  };

  // LIKE
  const handleLike = async (eventId) => {
    try {
      const response = await api.patch(`/events/${eventId}/like`);
      const updatedEvent = response.data;
      setEvents((prev) => prev.map((e) => (e._id === eventId ? updatedEvent : e)));
    } catch (err) {
      console.error(err);
    }
  };

  // COMMENT
  const handleComment = async (eventId, text) => {
    try {
      const response = await api.post(`/events/${eventId}/comments`, { text });
      const updatedEvent = response.data;
      setEvents((prev) => prev.map((e) => (e._id === eventId ? updatedEvent : e)));
    } catch (err) {
      console.error(err);
    }
  };

  // RATE EVENT
  const handleRateEvent = async (eventId, rating, text) => {
    try {
      const response = await api.post(`/events/${eventId}/reviews`, { rating, text });
      const updatedEvent = response.data;
      setEvents((prev) => prev.map((e) => (e._id === eventId ? updatedEvent : e)));
      setTempRating(5);
      toast.success("Review Submitted successfully! Thank you.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting review");
    }
  };

  // REPORT
  const handleReport = async (event) => {
    const reason = prompt("Why are you reporting this event? (Spam, Scam, Inappropriate, Other)");
    if (!reason || reason.trim() === "") return;

    try {
      await api.post(`/admin/report`, {
        reporterId: user._id,
        reporterName: `${user.firstName} ${user.lastName}`,
        targetEventId: event._id,
        eventTitle: event.title,
        reason: reason,
      });
      toast.success("Report submitted to Admins.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit report.");
    }
  };

  // DELETE
  const handleDelete = (eventId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Event",
      message: "Are you sure you want to delete this event? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/events/${eventId}`);
          setEvents((prev) => prev.filter((e) => e._id !== eventId));
          toast.success("Event deleted successfully.");
        } catch (err) {
          toast.error("Could not delete event.");
        }
      },
    });
  };

  // SHARE
  const handleShare = (eventId) => {
    const shareUrl = `${window.location.origin}/ticket/${eventId}`;
    navigator.clipboard.writeText(`Check out this event on EventPulse! ${shareUrl}`);
    toast.success("Link copied to clipboard! Ready to share.");
  };

  // BOOKMARK
  const handleBookmark = async (eventId) => {
    try {
      const res = await api.patch(`/users/${user._id}/bookmark/${eventId}`);
      setBookmarks(res.data);
      updateUser({ bookmarks: res.data });
      toast.success("Bookmarks updated! 🔖");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bookmark.");
    }
  };

  // DOWNLOAD GUEST LIST
  const downloadGuestList = async (eventId, eventTitle) => {
    try {
      const res = await api.get(`/events/${eventId}/guests`);
      const guests = res.data;
      if (guests.length === 0) return toast.error("No guests yet!");

      const headers = "Name,Email,Location\n";
      const rows = guests
        .map((g) => `${g.firstName} ${g.lastName},${g.email},${g.location}`)
        .join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${eventTitle}_GuestList.csv`);
      document.body.appendChild(link);
      link.click();

      toast.success("Guest list downloaded! 📋");
    } catch (err) {
      console.error(err);
    }
  };

  // TOGGLE COMMENTS
  const toggleComments = (eventId) => {
    setOpenComments((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  // LOGOUT
  const handleLogout = () => {
    logout();
  };

  return {
    // Auth & user
    user,
    token,
    navigate,

    // Responsive
    isDesktop,
    mobileMenuOpen,
    setMobileMenuOpen,
    showFilters,
    setShowFilters,

    // Core data
    loading,
    feedType,
    setFeedType,
    events,

    // Pagination
    page,
    hasMore,
    isFetchingMore,
    fetchEvents,

    // Review
    tempRating,
    setTempRating,

    // Bookmarks
    bookmarks,

    // Filters
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    showMap,
    setShowMap,

    // Modals
    isCreateModalOpen,
    setIsCreateModalOpen,
    confirmModal,
    setConfirmModal,

    // Chat
    activeChat,
    setActiveChat,

    // Notifications
    notifications,
    showNotifications,
    unreadCount,
    handleMarkRead,

    // Create event form
    newEvent,
    handleImageChange,
    handleChange,
    handleCityChange,
    handleSubmit,

    // Event actions
    handleJoin,
    handlePayment,
    handleLike,
    handleComment,
    handleRateEvent,
    handleReport,
    handleDelete,
    handleShare,
    handleBookmark,
    downloadGuestList,
    toggleComments,
    openComments,
    handleLogout,
  };
};

export default useDashboardData;