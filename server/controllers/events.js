import Event from "../models/Event.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendTicketEmail } from "../services/email.js"; 
import { createLog } from "../utils/logger.js"; // <--- NEW UTILITY IMPORT

/* CREATE - FIXED TO INCLUDE PRICE */
export const createEvent = async (req, res) => {
  try {
    // 1. Extract 'price' along with other fields
    const { userId, title, description, location, date, category, coordinates, price } = req.body;
    
    // Get the Full Cloudinary URL
    const picturePath = req.file ? req.file.path : "";  
    
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
      price: price || 0, // <--- 2. SAVE THE PRICE HERE
      picturePath, 
      participants: [],
      comments: [],
      likes: {},
    });

    await newEvent.save();
    
    // Return all events sorted by newest
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(201).json(events);
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(409).json({ message: err.message });
  }
};

/* READ FEED (PAGINATION + SEARCH + FILTER) */
export const getFeedEvents = async (req, res) => {
try {
  // 1. Get Params from URL
  const { page = 1, limit = 5, search = "", category = "All", sort = "Newest" } = req.query;

  // 2. Build the Query Object
  const query = {};

  // Search Logic (Regex = Partial Match, case insensitive)
  if (search) {
      query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
      ];
  }

  // Category Logic
  if (category !== "All") {
      query.category = category;
  }

  // 3. Build Sort Object
  let sortQuery = { createdAt: -1 }; // Default: Newest
  if (sort === "Oldest") {
      sortQuery = { createdAt: 1 };
  } 
  
  // 4. Pagination Math
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const total = await Event.countDocuments(query); // Count only matching items based on filters

  // 5. Fetch Data
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
// ... rest of joinEvent function ...
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
// ... rest of postComment function ...
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
// ... rest of likeEvent function ...
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

/* DELETE (UPDATED with Logging) */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // Note: Assuming 'verifyToken' middleware puts user info in req.user
    const userId = req.user.id; 

    const user = await User.findById(userId);
    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.userId !== userId && user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own events." });
    }
    
    // --- Logging Logic ---
    if (user.role === "admin") {
        await createLog(
            userId, 
            "ADMIN_DELETE_EVENT", 
            `Event: ${event.title}`, 
            `Target ID: ${id}`
        );
    }
    // ---------------------

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* READ SINGLE EVENT (For Ticket Page) */
export const getEvent = async (req, res) => {
  try {
// ... rest of getEvent function ...
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
// ... rest of verifyTicket function ...
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
// ... rest of getAttendingEvents function ...
    const { userId } = req.params;
    const events = await Event.find({ participants: userId });
    res.status(200).json(events);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* NEW: GET FOLLOWING FEED (Social Graph) */
export const getFollowingEvents = async (req, res) => {
    try {
// ... rest of getFollowingEvents function ...
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        // Find events where the creator (userId) is inside the current user's friends list
        const events = await Event.find({ userId: { $in: user.friends } }).sort({ createdAt: -1 });
        
        res.status(200).json(events);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/* ADD REVIEW */
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, text } = req.body;

    // We must fetch the user here to get their firstName for the review
    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Check if Event is Finished
    if (new Date(event.date) > new Date()) {
        return res.status(400).json({ message: "You can only rate past events." });
    }

    // 2. Check if User Attended (Optional - strict mode)
    if (!event.participants.includes(userId) && event.userId !== userId) {
        return res.status(403).json({ message: "You must participate or be the creator to rate this event." });
    }

    // 3. Check for Duplicate Review
    const alreadyReviewed = event.reviews.find(r => r.userId === userId);
    if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this event." });
    }

    // 4. Add Review
    const newReview = {
        userId,
        firstName: user.firstName,
        rating: Number(rating),
        text
    };
    event.reviews.push(newReview);

    // 5. Calculate New Average (Rounded to one decimal place)
    const totalStars = event.reviews.reduce((acc, item) => item.rating + acc, 0);
    event.averageRating = Math.round((totalStars / event.reviews.length) * 10) / 10; 

    await event.save();
    res.status(200).json(event);

  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(404).json({ message: err.message });
  }
};