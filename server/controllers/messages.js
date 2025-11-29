import Message from "../models/Message.js";

/* GET CHAT HISTORY */
export const getMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const messages = await Message.find({ eventId }).sort({ createdAt: 1 }); // Oldest first
    res.status(200).json(messages);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};