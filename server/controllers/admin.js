import User from "../models/User.js";
import Event from "../models/Event.js";

export const getAdminStats = async (req, res) => {
  try {
    // 1. Get Totals
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    // Calculate Total RSVPs (Sum of all participants arrays)
    const events = await Event.find();
    const totalRSVPs = events.reduce((acc, curr) => acc + curr.participants.length, 0);

    // 2. Get Recent Data (Limit 5)
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("-password");
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      totalUsers,
      totalEvents,
      totalRSVPs,
      recentUsers,
      recentEvents
    });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};