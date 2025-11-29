import Event from "../models/Event.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendTicketEmail } from "../services/email.js"; 

/* CREATE */
export const createEvent = async (req, res) => {
  try {
    // Extract + parse coordinates (FormData sends string)
    const { userId, title, description, location, date, category, coordinates } = req.body;
    const picturePath = req.file ? req.file.filename : "";  
    const parsedCoordinates = JSON.parse(coordinates);

    const user = await User.findById(userId);

    const newEvent = new Event({
      userId,
      creatorName: `${user.firstName} ${user.lastName}`,
      title,
      description,
      location,
      coordinates: parsedCoordinates,
      date,
      category,
      picturePath,
      participants: [],
      comments: [],
      likes: {},
    });

    await newEvent.save();
    const post = await Event.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ FEED */
export const getFeedEvents = async (req, res) => {
  try {
    const post = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* READ USER EVENTS (Hosted) */
export const getUserEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ userId });
    res.status(200).json(events);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE JOIN (WITH NOTIFICATION & EMAIL) */
export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    const isJoined = event.participants.includes(userId);

    if (isJoined) {
      // UNJOIN LOGIC
      event.participants = event.participants.filter((id) => id !== userId);
    } else {
      // JOIN LOGIC
      event.participants.push(userId);

      /* 🔔 SEND NOTIFICATION to event creator */
      if (event.userId !== userId) {
        const newNotif = new Notification({
          userId: event.userId, // receiver
          fromUserId: userId,
          fromUserName: `${user.firstName} ${user.lastName}`,
          type: "join",
          message: `joined your event: ${event.title}`,
          eventId: id
        });

        await newNotif.save();
      }

      /* 📧 SEND TICKET EMAIL (Background Task) */
      try {
        const ticketId = `${event._id}-${user._id}`; 
        sendTicketEmail(user.email, user.firstName, event.title, ticketId);
      } catch (emailErr) {
        console.error("Error sending ticket email:", emailErr);
      }
    }

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE COMMENT */
export const postComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    const newComment = {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      picturePath: user.picturePath,
      text,
      createdAt: new Date(),
    };

    event.comments.push(newComment);

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE LIKE (WITH NOTIFICATION) */
export const likeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.likes) event.likes = new Map();

    const isLiked = event.likes.get(userId);

    if (isLiked) {
      event.likes.delete(userId);
    } else {
      event.likes.set(userId, true);

      /* 🔔 SEND LIKE NOTIFICATION */
      if (event.userId !== userId) {
        const newNotif = new Notification({
          userId: event.userId,     // receiver
          fromUserId: userId,       // liker
          fromUserName: `${user.firstName} ${user.lastName}`,
          type: "like",
          message: `liked your event: ${event.title}`,
          eventId: id
        });

        await newNotif.save();
      }
    }

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);

  } catch (err) {
    console.log("Like Error:", err.message);
    res.status(404).json({ message: err.message });
  }
};

/* DELETE */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From Token

    const user = await User.findById(userId);
    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.userId !== userId && user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own events." });
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* READ SINGLE EVENT (For Ticket Page) */
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    res.status(200).json(event);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* VERIFY TICKET (SCANNER LOGIC) */
export const verifyTicket = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found", valid: false });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", valid: false });

    // Check if user is actually in the participants list
    const isParticipant = event.participants.includes(userId);

    if (isParticipant) {
      res.status(200).json({ 
          valid: true, 
          message: "Access Granted", 
          attendee: `${user.firstName} ${user.lastName}`,
          event: event.title
      });
    } else {
      res.status(400).json({ 
          valid: false, 
          message: "Access Denied - User not on guest list" 
      });
    }

  } catch (err) {
    res.status(500).json({ message: err.message, valid: false });
  }
};

/* READ EVENTS USER IS ATTENDING (For Profile) */
export const getAttendingEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    // Find events where participants array contains the userId
    const events = await Event.find({ participants: userId });
    res.status(200).json(events);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};