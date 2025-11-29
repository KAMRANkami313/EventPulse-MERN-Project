import Notification from "../models/Notification.js";

/* GET USER NOTIFICATIONS */
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    // Get notifications for this user, newest first
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* MARK AS READ */
export const markNotificationsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ userId }, { isRead: true });
        res.status(200).json({ message: "Marked as read" });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}