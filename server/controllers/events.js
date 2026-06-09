import Event from "../models/Event.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Transaction from "../models/Transaction.js"; 
import { sendTicketEmail } from "../services/email.js"; 
import { createLog } from "../utils/logger.js"; 

/* CREATE EVENT */
export const createEvent = async (req, res) => {
  try {
    // SECURITY FIX: Use userId from JWT token, not from request body
    const userId = req.user.id;
    const { title, description, location, date, category, coordinates, price } = req.body;
    
    // Get the Full Cloudinary URL
    const picturePath = req.file ? req.file.path : "";  
    
    let parsedCoordinates;
    try {
        parsedCoordinates = JSON.parse(coordinates);
    } catch(e) {
        parsedCoordinates = { lat: 0, lng: 0 };
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newEvent = new Event({
      userId,
      creatorName: `${user.firstName} ${user.lastName}`,
      title,
      description,
      location,
      coordinates: parsedCoordinates,
      date,
      category,
      price: Number(price) || 0,
      picturePath, 
      participants: [],
      comments: [],
      likes: {},
    });

    await newEvent.save();
    
    // Return only the created event instead of fetching all events
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(409).json({ message: err.message });
  }
};

/* READ FEED */
export const getFeedEvents = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "", category = "All", sort = "Newest" } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    if (category !== "All") {
        query.category = category;
    }

    let sortQuery = { createdAt: -1 }; 
    if (sort === "Oldest") {
        sortQuery = { createdAt: 1 };
    } 
    
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(query);

    const posts = await Event.find(query)
        .sort(sortQuery)
        .limit(parseInt(limit))
        .skip(startIndex);

    res.status(200).json({
      data: posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalEvents: total
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* READ USER EVENTS */
export const getUserEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ userId });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE JOIN (FIXED FOR DUPLICATES) */
export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // SECURITY FIX: Use userId from JWT token, not from request body
    const userId = req.user.id;

    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isJoined = event.participants.includes(userId);

    if (isJoined) {
      // UNJOIN LOGIC
      event.participants = event.participants.filter((uid) => uid !== userId);
    } else {
      // JOIN LOGIC
      if (!event.participants.includes(userId)) {
          event.participants.push(userId);
      }

      // 1. SAVE TRANSACTION (Handle Race Condition)
      if (event.price > 0) {
          try {
              const newTransaction = new Transaction({
                  userId: user._id,
                  userName: `${user.firstName} ${user.lastName}`,
                  userEmail: user.email,
                  eventId: event._id,
                  eventTitle: event.title,
                  amount: event.price,
                  status: "success",
                  stripePaymentId: `TXN-${Date.now()}`
              });
              await newTransaction.save();
          } catch (txErr) {
              if (txErr.code === 11000) {
                  console.log("Duplicate Transaction prevented.");
              } else {
                  console.error("Transaction Error:", txErr);
              }
          }
      }

      // 2. SEND NOTIFICATION (Handle Race Condition)
      if (event.userId !== userId) {
        try {
            const newNotif = new Notification({
              userId: event.userId, 
              fromUserId: userId,
              fromUserName: `${user.firstName} ${user.lastName}`,
              type: "join",
              message: `joined your event: ${event.title}`,
              eventId: id
            });
            await newNotif.save();
        } catch (notifErr) {
            if (notifErr.code === 11000) {
                console.log("Duplicate Notification prevented.");
            }
        }
      }

      // 3. SEND EMAIL
      try {
        const ticketId = `${event._id.toString().slice(-6)}-${user._id.toString().slice(-4)}`;
        sendTicketEmail(user.email, user.firstName, event.title, ticketId);
      } catch (emailErr) {
        console.error("Error sending ticket email:", emailErr);
      }
    }

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE COMMENT */
export const postComment = async (req, res) => {
  try {
    const { id } = req.params;
    // SECURITY FIX: Use userId from JWT token, not from request body
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

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
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE LIKE */
export const likeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // SECURITY FIX: Use userId from JWT token, not from request body
    const userId = req.user.id;

    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.likes) event.likes = new Map();

    const isLiked = event.likes.get(userId);

    if (isLiked) {
      event.likes.delete(userId);
    } else {
      event.likes.set(userId, true);

      if (event.userId !== userId) {
        try {
            const newNotif = new Notification({
              userId: event.userId,     
              fromUserId: userId,       
              fromUserName: `${user.firstName} ${user.lastName}`,
              type: "like",
              message: `liked your event: ${event.title}`,
              eventId: id
            });
            await newNotif.save();
        } catch(e) {
            // Ignore duplicates for likes
        }
      }
    }

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);

  } catch (err) {
    console.log("Like Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* DELETE (WITH LOGGING) */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; 

    const user = await User.findById(userId);
    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.userId !== userId && user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own events." });
    }
    
    // Logging Logic
    if (user.role === "admin") {
        await createLog(
            userId, 
            "ADMIN_DELETE_EVENT", 
            `Event: ${event.title}`, 
            `Target ID: ${id}`
        );
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* READ SINGLE EVENT */
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* VERIFY TICKET */
export const verifyTicket = async (req, res) => {
  try {
    // SECURITY: Only event creators or admins can verify tickets
    const userId = req.user.id;
    const { eventId, ticketUserId } = req.body; // Renamed from userId to ticketUserId to avoid confusion

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found", valid: false });

    // Check if the requesting user is the event creator or an admin
    const requestingUser = await User.findById(userId);
    if (!requestingUser) return res.status(401).json({ message: "User not found", valid: false });
    
    if (event.userId !== userId && requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Only event creators or admins can verify tickets.", valid: false });
    }

    const user = await User.findById(ticketUserId);
    if (!user) return res.status(404).json({ message: "Ticket user not found", valid: false });

    const isParticipant = event.participants.includes(ticketUserId);

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

/* READ ATTENDING EVENTS */
export const getAttendingEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ participants: userId });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET FOLLOWING FEED */
export const getFollowingEvents = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // BUG FIX: Use user.following instead of user.friends
        const followingIds = user.following && user.following.length > 0 ? user.following : [];
        
        if (followingIds.length === 0) {
          return res.status(200).json([]); // Return empty array if not following anyone
        }

        const events = await Event.find({ userId: { $in: followingIds } }).sort({ createdAt: -1 });
        
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ADD REVIEW */
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    // SECURITY FIX: Use userId from JWT token, not from request body
    const userId = req.user.id;
    const { rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (new Date(event.date) > new Date()) {
        return res.status(400).json({ message: "You can only rate past events." });
    }

    if (!event.participants.includes(userId) && event.userId !== userId) {
        return res.status(403).json({ message: "You must participate or be the creator to rate this event." });
    }

    const alreadyReviewed = event.reviews.find(r => r.userId === userId);
    if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this event." });
    }

    const newReview = {
        userId,
        firstName: user.firstName,
        rating: Number(rating),
        text
    };
    event.reviews.push(newReview);

    const totalStars = event.reviews.reduce((acc, item) => item.rating + acc, 0);
    event.averageRating = Math.round((totalStars / event.reviews.length) * 10) / 10; 

    await event.save();
    res.status(200).json(event);

  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* GET EVENT GUESTS (For Organizer) */
export const getEventGuests = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    
    if (!event) return res.status(404).json({ message: "Event not found" });

    const guests = await User.find({ _id: { $in: event.participants } }).select("firstName lastName email location");
    
    res.status(200).json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};