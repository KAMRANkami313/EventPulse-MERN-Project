import User from "../models/User.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import Log from "../models/Log.js"; // <--- NEW IMPORT for getSystemLogs
import Transaction from "../models/Transaction.js"; // <--- NEW IMPORT (Phase 29)
import { createLog } from "../utils/logger.js"; // <--- NEW UTILITY IMPORT

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
      totalRevenue, 
      categoryData, 
      recentUsers,
      recentEvents
    });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* GET ALL EVENTS (ADMIN VIEW) */
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


/* SEND GLOBAL BROADCAST (UPDATED with Logging) */
export const sendBroadcast = async (req, res) => {
    try {
        const { message, title } = req.body;
        const users = await User.find();

        const notifications = users.map(user => ({
            userId: user._id,
            fromUserId: "ADMIN",
            fromUserName: "System Admin",
            type: "alert",
            message: `${title}: ${message}`,
            isRead: false
        }));

        await Notification.insertMany(notifications);

        // LOG IT
        await createLog(req.user.id, "BROADCAST_SENT", "All Users", `Title: ${title}`);

        res.status(200).json({ message: "Broadcast sent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- MODERATION FUNCTIONS ---

/* CREATE REPORT (User Action) - No change here as it's not an admin action */
export const createReport = async (req, res) => {
    try {
        const { reporterId, reporterName, targetEventId, eventTitle, reason } = req.body;
        const newReport = new Report({
            reporterId, reporterName, targetEventId, eventTitle, reason
        });
        await newReport.save();
        res.status(201).json({ message: "Report submitted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* GET PENDING REPORTS (Admin Action) */
export const getReports = async (req, res) => {
    try {
        const reports = await Report.find({ status: "pending" }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/* RESOLVE REPORT (Admin Action) - UPDATED with Logging */
export const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const resolvedReport = await Report.findByIdAndUpdate(id, { status: "resolved" });

        // LOG IT
        await createLog(req.user.id, "REPORT_RESOLVED", `Report ID: ${id}`, `Resolved report for: ${resolvedReport.eventTitle}`);
        
        res.status(200).json({ message: "Report resolved" });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/* GET AUDIT LOGS (NEW FUNCTION) */
export const getSystemLogs = async (req, res) => {
    try {
        const logs = await Log.find().sort({ createdAt: -1 }).limit(50); // Last 50 actions
        res.status(200).json(logs);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/* GET ALL TRANSACTIONS (NEW FUNCTION - Phase 29) */
export const getTransactions = async (req, res) => {
    try {
        // Fetch all transactions, newest first
        const transactions = await Transaction.find().sort({ createdAt: -1 }); 
        res.status(200).json(transactions);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};