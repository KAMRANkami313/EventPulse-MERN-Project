import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Sparkles, CalendarX } from "lucide-react"; // Added CalendarX for empty state

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

const Recommendations = ({ userId, token }) => {
  const [recs, setRecs] = useState([]);
  const [reason, setReason] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/users/${userId}/recommendations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Ensure we always have an array
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setRecs(data);

        if(res.data.type === "based_on_history") {
            setReason(`Because you like ${res.data.category}`);
        } else {
            setReason("Trending Events");
        }
      } catch (err) { 
        console.error(err); 
        setReason("Trending Events");
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [userId]);
  // 🟢 NEW FUNCTION: Handle Click to Scroll
  const handleRecommendationClick = (eventId) => {
    // 1. Try to find the event card on the current page by its ID
    const eventElement = document.getElementById(eventId);

    if (eventElement) {
        // 2. If found, scroll to it smoothly
        eventElement.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // 3. Optional: Add a temporary highlight ring so the user sees it
        eventElement.classList.add("ring-4", "ring-violet-500", "ring-offset-4");
        setTimeout(() => {
            eventElement.classList.remove("ring-4", "ring-violet-500", "ring-offset-4");
        }, 2000);
    } else {
        // 4. If not found (fallback), go to the ticket page
        navigate(`/ticket/${eventId}`); 
    }
  };

  // 🟢 FIX: Don't return null. Render a container even if empty.
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Recommended</h3>
        </div>
        
        {!loading && recs.length > 0 && (
            <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold mb-4 uppercase tracking-wide bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-lg inline-block">
                {reason}
            </p>
        )}
        
        <div className="space-y-3">
            {loading ? (
                // SKELETON LOADER
                <>
                    <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </>
            ) : recs.length === 0 ? (
                // EMPTY STATE (Instead of disappearing)
                <div className="text-center py-8 text-slate-400">
                    <CalendarX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No recommendations yet.</p>
                </div>
            ) : (
                // LIST OF EVENTS
                recs.map(event => (
                    <div 
                        key={event._id} 
                       onClick={() => handleRecommendationClick(event._id)}
                        className="flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition group"
                    >
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 relative">
                            {event.picturePath ? (
                                <img src={getImageUrl(event.picturePath)} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">📅</div>
                            )}
                        </div>
                        <div className="overflow-hidden flex flex-col justify-center">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-violet-600 transition">{event.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

// Helper for image if not imported from utility
const getImageUrl = (path) => {
    return path?.startsWith("http") ? path : `${API_URL}/assets/${path}`;
};

export default Recommendations;