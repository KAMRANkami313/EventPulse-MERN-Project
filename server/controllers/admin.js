import User from "../models/User.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js"; // <-- NEW IMPORT

/* GET ADMIN STATS (ENHANCED) */
export const getAdminStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    // 2. Fetch all events to calculate Revenue & RSVPs
    const events = await Event.find();
    
    const totalRSVPs = events.reduce((acc, curr) => acc + curr.participants.length, 0);
    
    // Calculate Estimated Revenue (Price * Participants)
    const totalRevenue = events.reduce((acc, curr) => {
        // Ensure price is treated as a number, defaulting to 0 if null/undefined
        return acc + (curr.price || 0) * curr.participants.length; 
    }, 0);

    // 3. Category Distribution (For Pie Chart)
    const categoryMap = {};
    events.forEach(e => {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    });
    const categoryData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    }));

    // 4. Recent Data
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("-password");
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      totalUsers,
      totalEvents,
      totalRSVPs,
      totalRevenue, // NEW
      categoryData, // NEW
      recentUsers,
      recentEvents
    });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* GET ALL EVENTS (ADMIN VIEW) - Existing function, kept for completeness */
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


/* SEND GLOBAL BROADCAST (NEW FUNCTION) */
export const sendBroadcast = async (req, res) => {
    try {
        const { message, title } = req.body;
        const users = await User.find();

        // Create a notification for EVERY user
        // Note: In huge apps, this is done via a Queue (Redis/Bull), but for this project, simple loop is fine.
        const notifications = users.map(user => ({
            userId: user._id,
            fromUserId: "ADMIN",
            fromUserName: "System Admin",
            type: "alert", // Assuming 'alert' type exists or is handled gracefully
            message: `${title}: ${message}`,
            isRead: false
        }));

        await Notification.insertMany(notifications);

        res.status(200).json({ message: "Broadcast sent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};