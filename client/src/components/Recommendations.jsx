import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL; 

const Recommendations = ({ userId, token }) => {
  const [recs, setRecs] = useState([]);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable for API call
        const res = await axios.get(`${API_URL}/users/${userId}/recommendations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRecs(res.data.data);
        if(res.data.type === "based_on_history") {
            setReason(`Because you like ${res.data.category}`);
        } else {
            setReason("Trending Events");
        }
      } catch (err) { console.error(err); }
    };
    fetchRecs();
  }, [userId]);

  if (recs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="font-bold text-gray-800 dark:text-white mb-1">Recommended For You</h3>
        <p className="text-xs text-blue-500 font-medium mb-4 uppercase">{reason}</p>
        
        <div className="space-y-4">
            {recs.map(event => (
                <div 
                    key={event._id} 
                    onClick={() => navigate(`/ticket/${event._id}`)}
                    className="flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition"
                >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {event.picturePath ? (
                            // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable for image path
                            <img src={`${API_URL}/assets/${event.picturePath}`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-xs">📅</div>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Recommendations;