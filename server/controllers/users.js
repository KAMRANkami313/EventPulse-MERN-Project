import User from "../models/User.js";
import Event from "../models/Event.js";
import { createLog } from "../utils/logger.js"; // <--- NEW UTILITY IMPORT

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
    // req.user.id is the ID of the ADMIN performing the action (passed via verifyToken)
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
    const { firstName, lastName, location, occupation } = req.body;
    
    // Get the full Cloudinary URL (.path) if a file is uploaded
    const picturePath = req.file ? req.file.path : undefined;

    const updateData = {
      firstName,
      lastName,
      location,
      occupation
    };
    
    // Only update picture if a new one was uploaded
    if (picturePath) updateData.picturePath = picturePath;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    // Remove password before sending back
    const formattedUser = updatedUser.toObject();
    delete formattedUser.password;

    res.status(200).json(formattedUser);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* NEW: ADD / REMOVE FRIEND (FOLLOW SYSTEM) */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    
    // Prevent following yourself
    if (id === friendId) return res.status(400).json({ message: "Cannot follow yourself" });

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      // Unfollow: Remove friendId from user's friends list
      user.friends = user.friends.filter((fid) => fid !== friendId);
      // Optional: If you want mutual following, uncomment below
      // friend.friends = friend.friends.filter((fid) => fid !== id); 
    } else {
      // Follow: Add friendId to user's friends list
      user.friends.push(friendId);
      // Optional: Mutual
      // friend.friends.push(id); 
    }
    
    await user.save();
    // await friend.save();

    // Send back the updated list of friends (formatted nicely)
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


/* GET RECOMMENDED EVENTS */
export const getUserRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    // 1. Find all events the user participated in
    const historyEvents = await Event.find({ participants: id });

    // 2. Calculate Favorite Category
    const categoryCounts = {};
    historyEvents.forEach((event) => {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });

    // Find the category with max count
    let favoriteCategory = "";
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    });

    // Default if no history or current user is null
    if (!favoriteCategory || !user) {
        // Just return general trending events (most recent)
        const trending = await Event.find({ date: { $gte: new Date() } }) // Future only
            .sort({ createdAt: -1 }) 
            .limit(3);
        return res.status(200).json({ type: "trending", data: trending });
    }
    
    // Collect IDs of events already seen/joined to exclude them
    const excludedIds = historyEvents.map(e => e._id);

    // 3. Find Future Events in that Category
    const recommendations = await Event.find({
        category: favoriteCategory,
        date: { $gte: new Date() }, // Future events only
        _id: { $nin: excludedIds } // Exclude ones already joined/seen
    }).limit(3);

    res.status(200).json({ type: "based_on_history", category: favoriteCategory, data: recommendations });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* TOGGLE BOOKMARK (Save/Unsave Event) */
export const toggleBookmark = async (req, res) => {
  try {
    const { id, eventId } = req.params;
    const user = await User.findById(id);

    if (user.bookmarks.includes(eventId)) {
      // Remove from bookmarks
      user.bookmarks = user.bookmarks.filter((bid) => bid !== eventId);
    } else {
      // Add to bookmarks
      user.bookmarks.push(eventId);
    }

    await user.save();
    
    // Return updated bookmarks list
    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* GET BOOKMARKED EVENTS (For Profile Page) */
export const getBookmarkedEvents = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        // Find all events whose IDs are in the bookmarks array
        const events = await Event.find({ _id: { $in: user.bookmarks } });
        
        res.status(200).json(events);
    } catch (err) { 
        res.status(404).json({ message: err.message }); 
    }
};