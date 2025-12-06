import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelper"; 

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
  const [savedEvents, setSavedEvents] = useState([]); // <--- NEW STATE
  
  // UI States
  const [activeTab, setActiveTab] = useState("hosted");
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); 
  
  // Edit Form State
  const [editFormData, setEditFormData] = useState({
      firstName: "", lastName: "", location: "", occupation: "", picture: null
  });

  const isOwnProfile = loggedInUser._id === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(userRes.data);
        setEditFormData({
            firstName: userRes.data.firstName,
            lastName: userRes.data.lastName,
            location: userRes.data.location,
            occupation: userRes.data.occupation,
            picture: null
        });

        const hostedRes = await axios.get(`http://localhost:5000/events/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setHostedEvents(hostedRes.data);

        const attendingRes = await axios.get(`http://localhost:5000/events/attending/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setAttendingEvents(attendingRes.data);

        // <--- NEW: FETCH SAVED EVENTS (Only if own profile)
        if (isOwnProfile) {
            const savedRes = await axios.get(`http://localhost:5000/users/${userId}/bookmarks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSavedEvents(savedRes.data);
        }

        // CHECK IF FOLLOWING
        if (loggedInUser.friends && loggedInUser.friends.includes(userId)) {
            setIsFollowing(true);
        } else {
            setIsFollowing(false);
        }

      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [userId, isOwnProfile, token]); // Added isOwnProfile and token to dependencies

  // FOLLOW HANDLER
  const handleFollow = async () => {
    try {
        const response = await axios.patch(`http://localhost:5000/users/${loggedInUser._id}/${userId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // 1. Toggle UI state
        setIsFollowing(!isFollowing);

        // 2. Update Local Storage
        const updatedFriendIds = response.data.map(f => f._id); 
        const updatedUser = { ...loggedInUser, friends: updatedFriendIds };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
    } catch (err) { 
        console.error("Follow Error:", err); 
    }
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
          if(editFormData.picture) formData.append("picture", editFormData.picture);

          const res = await axios.patch(`http://localhost:5000/users/${userId}`, formData, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
          });
          
          setUserProfile(res.data);
          // If editing own profile, update local storage
          if(isOwnProfile) {
              const currentUserData = JSON.parse(localStorage.getItem("user"));
              localStorage.setItem("user", JSON.stringify({ ...res.data, friends: currentUserData.friends, bookmarks: currentUserData.bookmarks, password: loggedInUser.password }));
          }
          setIsEditing(false);
          alert("Profile Updated!");
      } catch(err) { console.error(err); alert("Update failed"); }
  };

  if (!userProfile) return <div className="p-10 text-center">Loading Profile...</div>;

  // Helper to determine which events to show
  const eventsDisplay = activeTab === "hosted" ? hostedEvents 
                      : activeTab === "attending" ? attendingEvents 
                      : savedEvents;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      
      {/* 1. COVER BANNER */}
      <div className="h-60 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
         <button onClick={() => navigate("/dashboard")} className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full backdrop-blur-md transition">
             ← Back to Feed
         </button>
      </div>

      <div className="max-w-6xl mx-auto px-6">
          
          {/* 2. PROFILE HEADER CARD */}
          <div className="relative -mt-24 mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center md:items-end gap-6 border border-gray-100 dark:border-gray-700">
              
              {/* Avatar */}
              <div className="relative">
                  <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gray-200">
                      {userProfile.picturePath ? (
                          <img 
                            src={getImageUrl(userProfile.picturePath)} 
                            alt="profile" 
                            className="w-full h-full object-cover" 
                          />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-400">
                              {userProfile.firstName[0]}
                          </div>
                      )}
                  </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  <p className="text-blue-600 font-medium text-lg">{userProfile.occupation || "Community Member"}</p>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-1 mt-1">
                      📍 {userProfile.location || "Earth"}
                  </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8 text-center mr-8">
                  <div>
                      <p className="text-xl font-bold text-gray-800 dark:text-white">{hostedEvents.length}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Hosted</p>
                  </div>
                  <div>
                      <p className="text-xl font-bold text-gray-800 dark:text-white">{attendingEvents.length}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Attending</p>
                  </div>
                  {/* Saved Stat (Only for Owner) */}
                  {isOwnProfile && (
                    <div>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{savedEvents.length}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Saved</p>
                    </div>
                  )}
              </div>

              {/* ACTIONS (Edit OR Follow) */}
              <div className="flex gap-3">
                  {isOwnProfile ? (
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold transition"
                      >
                          {isEditing ? "Cancel" : "Edit Profile"}
                      </button>
                  ) : (
                      <button 
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-lg font-bold transition shadow-lg ${
                            isFollowing 
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                          {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                  )}
              </div>
          </div>

          {/* 3. EDIT FORM (Conditional) */}
          {isEditing && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8 border border-blue-100 dark:border-gray-700 animate-fadeIn">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">Update Your Details</h3>
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="firstName" value={editFormData.firstName} onChange={handleEditChange} placeholder="First Name" className="p-3 border rounded dark:bg-gray-700 dark:text-white" required />
                      <input name="lastName" value={editFormData.lastName} onChange={handleEditChange} placeholder="Last Name" className="p-3 border rounded dark:bg-gray-700 dark:text-white" required />
                      <input name="location" value={editFormData.location} onChange={handleEditChange} placeholder="Location" className="p-3 border rounded dark:bg-gray-700 dark:text-white" />
                      <input name="occupation" value={editFormData.occupation} onChange={handleEditChange} placeholder="Occupation" className="p-3 border rounded dark:bg-gray-700 dark:text-white" />
                      
                      <div className="md:col-span-2">
                          <label className="block text-sm mb-1 dark:text-gray-300">Profile Picture</label>
                          <input type="file" onChange={handleImageChange} className="w-full text-sm dark:text-gray-300" />
                      </div>

                      <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Save Changes</button>
                  </form>
              </div>
          )}

          {/* 4. TABS & CONTENT */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
              <button 
                onClick={() => setActiveTab("hosted")}
                className={`pb-3 px-2 font-bold text-sm ${activeTab === "hosted" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                  HOSTED EVENTS
              </button>
              <button 
                onClick={() => setActiveTab("attending")}
                className={`pb-3 px-2 font-bold text-sm ${activeTab === "attending" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                  ATTENDING
              </button>
              
              {/* NEW: SAVED TAB (Only for Owner) */}
              {isOwnProfile && (
                  <button 
                    onClick={() => setActiveTab("saved")}
                    className={`pb-3 px-2 font-bold text-sm ${activeTab === "saved" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                  >
                      SAVED ({savedEvents.length})
                  </button>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {activeTab === "hosted" && hostedEvents.length === 0 && <p className="text-gray-500">No events hosted yet.</p>}
              {activeTab === "attending" && attendingEvents.length === 0 && <p className="text-gray-500">Not attending any events.</p>}
              {activeTab === "saved" && savedEvents.length === 0 && <p className="text-gray-500">No saved events.</p>}

              {eventsDisplay.map((event) => (
                  <div key={event._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100 dark:border-gray-700 cursor-pointer" onClick={() => navigate(`/ticket/${event._id}`)}>
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                          {event.picturePath ? (
                              <img 
                                src={getImageUrl(event.picturePath)} 
                                className="w-full h-full object-cover" 
                                alt="event" 
                              />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
                          )}
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-blue-600 shadow-sm">
                              {new Date(event.date).toLocaleDateString()}
                          </div>
                      </div>
                      <div className="p-4">
                          <h4 className="font-bold text-lg mb-1 truncate dark:text-white">{event.title}</h4>
                          <p className="text-gray-500 text-sm mb-3 truncate dark:text-gray-400">{event.location}</p>
                          <div className="flex justify-between items-center">
                             <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-semibold">{event.category}</span>
                             
                             {/* Show different badge depending on tab */}
                             {activeTab === "attending" && (
                                 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                                     Going
                                 </span>
                             )}
                             {activeTab === "saved" && (
                                 <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">
                                     Saved
                                 </span>
                             )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>

      </div>
    </div>
  );
};

export default ProfilePage;