import User from "../models/User.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js"; // Needed for follow notifications
import { createLog } from "../utils/logger.js"; 

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    // Security: Don't send the password back!
    const formattedUser = user.toObject();
    delete formattedUser.password;
    
    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* READ ALL USERS (For Admin) */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Don't send passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* DELETE USER (The Ban Hammer) - UPDATED with Logging */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
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
        req.user.id, 
        "DELETE_USER", 
        `User: ${deletedUser.firstName} ${deletedUser.lastName}`, 
        `Banned ID: ${id}`
    );

    res.status(200).json({ message: "User and their events deleted successfully." });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE USER */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, location, occupation, twitter, linkedin, instagram } = req.body;
    
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
    
    if (picturePath) updateData.picturePath = picturePath;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    const formattedUser = updatedUser.toObject();
    delete formattedUser.password;

    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* --- REPLACED LOGIC: TOGGLE FOLLOW (One-Way) --- */
export const toggleFollow = async (req, res) => {
  try {
    const { id, targetId } = req.params; // ID = Me, Target = Person I want to follow
    
    if (id === targetId) return res.status(400).json({ message: "Cannot follow yourself" });

    const user = await User.findById(id); // Me
    const targetUser = await User.findById(targetId); // Them

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
            type: "follow", // Ensure your Notification model supports this or 'like'/'join' generic types
            message: `started following you`,
            eventId: null // Not related to an event
          });
          await newNotif.save();
      } catch(e) {
          // Ignore duplicate notifications
      }
    }
    
    await user.save();
    await targetUser.save();

    // Return my new 'following' list so frontend updates
    // We return full objects for the 'following' list to make frontend easy
    const following = await Promise.all(
        user.following.map((id) => User.findById(id))
    );
      
    const formattedFollowing = following.map(
        ({ _id, firstName, lastName, occupation, location, picturePath }) => {
          return { _id, firstName, lastName, occupation, location, picturePath };
        }
    );

    res.status(200).json(formattedFollowing);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


/* GET RECOMMENDED EVENTS */
export const getUserRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const historyEvents = await Event.find({ participants: id });

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

    if (!favoriteCategory || !user) {
        const trending = await Event.find({ date: { $gte: new Date() } }).sort({ createdAt: -1 }).limit(3);
        return res.status(200).json({ type: "trending", data: trending });
    }
    
    const excludedIds = historyEvents.map(e => e._id);

    const recommendations = await Event.find({
        category: favoriteCategory,
        date: { $gte: new Date() }, 
        _id: { $nin: excludedIds }
    }).limit(3);

    res.status(200).json({ type: "based_on_history", category: favoriteCategory, data: recommendations });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* TOGGLE BOOKMARK */
export const toggleBookmark = async (req, res) => {
  try {
    const { id, eventId } = req.params;
    const user = await User.findById(id);

    if (user.bookmarks.includes(eventId)) {
      user.bookmarks = user.bookmarks.filter((bid) => bid !== eventId);
    } else {
      user.bookmarks.push(eventId);
    }

    await user.save();
    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* GET BOOKMARKED EVENTS */
export const getBookmarkedEvents = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const events = await Event.find({ _id: { $in: user.bookmarks } });
        res.status(200).json(events);
    } catch (err) { 
        res.status(404).json({ message: err.message }); 
    }
};