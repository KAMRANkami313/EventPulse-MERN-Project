import User from "../models/User.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import { createLog } from "../utils/logger.js"; 

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Security: Don't send the password back!
    const formattedUser = user.toObject();
    delete formattedUser.password;
    
    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* READ ALL USERS (For Admin) */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE USER (Admin Only) - UPDATED with Logging */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    // 1. Find user before deleting to get their name for the log
    const deletedUser = await User.findById(id);

    if (!deletedUser) {
        return res.status(404).json({ message: "User not found." });
    }

    // 2. Delete the User
    await User.findByIdAndDelete(id);

    // 3. Delete all Events created by this User (Cleanup)
    await Event.deleteMany({ userId: id });

    // 4. LOG IT
    await createLog(
        adminId, 
        "DELETE_USER", 
        `User: ${deletedUser.firstName} ${deletedUser.lastName}`, 
        `Banned ID: ${id}`
    );

    res.status(200).json({ message: "User and their events deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE USER */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.id;

    // SECURITY FIX: Users can only update their own profile (unless admin)
    const requestingUser = await User.findById(authenticatedUserId);
    if (id !== authenticatedUserId && requestingUser.role !== "admin") {
      return res.status(403).json({ message: "You can only update your own profile." });
    }

    const { firstName, lastName, location, occupation, twitter, linkedin, instagram, privacy } = req.body;
    
    const picturePath = req.file ? req.file.path : undefined;

    const updateData = {
      firstName,
      lastName,
      location,
      occupation,
      socials: {
          twitter: twitter || "",
          linkedin: linkedin || "",
          instagram: instagram || ""
      }
    };

    // Only include privacy if provided (from Settings page toggle)
    if (privacy) updateData.privacy = privacy;
    
    if (picturePath) updateData.picturePath = picturePath;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const formattedUser = updatedUser.toObject();
    delete formattedUser.password;

    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* --- TOGGLE FOLLOW (One-Way) --- */
export const toggleFollow = async (req, res) => {
  try {
    const { id, targetId } = req.params;
    const authenticatedUserId = req.user.id;

    // SECURITY FIX: Only the authenticated user can follow/unfollow on their own behalf
    if (id !== authenticatedUserId) {
      return res.status(403).json({ message: "You can only follow/unfollow on your own behalf." });
    }
    
    if (id === targetId) return res.status(400).json({ message: "Cannot follow yourself" });

    const user = await User.findById(id);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) return res.status(404).json({ message: "User not found" });

    if (user.following.includes(targetId)) {
      // UNFOLLOW
      user.following = user.following.filter((fid) => fid !== targetId);
      targetUser.followers = targetUser.followers.filter((fid) => fid !== id);
    } else {
      // FOLLOW
      user.following.push(targetId);
      targetUser.followers.push(id);
      
      // Send Notification to Target
      try {
          const newNotif = new Notification({
            userId: targetId,     
            fromUserId: id,       
            fromUserName: `${user.firstName} ${user.lastName}`,
            type: "follow",
            message: `started following you`,
            eventId: null
          });
          await newNotif.save();
      } catch(e) {
          // Ignore duplicate notifications
      }
    }
    
    await user.save();
    await targetUser.save();

    // Return my new 'following' list so frontend updates
    const following = await Promise.all(
        user.following.map((fid) => User.findById(fid))
    );
      
    const formattedFollowing = following.map(
        ({ _id, firstName, lastName, occupation, location, picturePath }) => {
          return { _id, firstName, lastName, occupation, location, picturePath };
        }
    );

    res.status(200).json(formattedFollowing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* GET RECOMMENDED EVENTS (SMART HYBRID) */
export const getUserRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const historyEvents = await Event.find({
        $or: [
            { participants: id },
            { _id: { $in: user.bookmarks || [] } }
        ]
    });

    const categoryCounts = {};
    historyEvents.forEach((event) => {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });

    let favoriteCategory = "";
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    });

    const excludedIds = historyEvents.map(e => e._id);

    let recommendations = [];
    let type = "trending";

    if (favoriteCategory) {
        recommendations = await Event.find({
            category: favoriteCategory,
            date: { $gte: new Date() },
            _id: { $nin: excludedIds }
        }).limit(5);

        if (recommendations.length > 0) {
            type = "based_on_history";
        }
    }

    if (recommendations.length < 3) {
        const currentRecIds = recommendations.map(r => r._id);
        const allExcluded = [...excludedIds, ...currentRecIds];

        const trending = await Event.find({
            date: { $gte: new Date() },
            _id: { $nin: allExcluded }
        })
        .sort({ createdAt: -1 })
        .limit(5 - recommendations.length);

        recommendations = [...recommendations, ...trending];
        
        if (recommendations.length === trending.length) {
            type = "trending"; 
        }
    }

    res.status(200).json({ 
        type: type, 
        category: favoriteCategory, 
        data: recommendations 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* TOGGLE BOOKMARK */
export const toggleBookmark = async (req, res) => {
  try {
    const { id, eventId } = req.params;
    const authenticatedUserId = req.user.id;

    // SECURITY FIX: Only the authenticated user can bookmark on their own behalf
    if (id !== authenticatedUserId) {
      return res.status(403).json({ message: "You can only bookmark on your own behalf." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.bookmarks.includes(eventId)) {
      user.bookmarks = user.bookmarks.filter((bid) => bid !== eventId);
    } else {
      user.bookmarks.push(eventId);
    }

    await user.save();
    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET BOOKMARKED EVENTS */
export const getBookmarkedEvents = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) return res.status(404).json({ message: "User not found." });

        const events = await Event.find({ _id: { $in: user.bookmarks || [] } });
        res.status(200).json(events);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
};