import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import notificationRoutes from "./routes/notifications.js";
import messageRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payment.js";
import Message from "./models/Message.js";
import aiRoutes from "./routes/ai.js";

// Sanitization & Security Middleware
import { noSqlSanitizer, xssSanitizer, securityHeaders } from "./middleware/sanitize.js";

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// --- 1. RATE LIMITER (Reduced from 5000 to a reasonable limit) ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 200 : 1000, // Stricter in production
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later."
});
app.use(limiter);

// --- MIDDLEWARE ---
// Set body size limit to prevent oversized payload attacks
app.use(express.json({ limit: "10mb" }));

// --- 2. NoSQL INJECTION PROTECTION ---
// Must come AFTER express.json() so it can sanitize the parsed body
// Prevents attackers from using MongoDB operators like $gt, $ne in req.body/query/params
app.use(noSqlSanitizer);

// --- 3. XSS PROTECTION ---
// Strips HTML tags from string values in req.body
app.use(xssSanitizer);

// --- 4. SECURITY HEADERS ---
app.use(securityHeaders);

// Helmet for Google Auth
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("common"));

// --- DYNAMIC CORS SETUP ---
// Filter out undefined values from allowedOrigins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL, // This will be your Vercel URL
].filter(Boolean); // FIX: Remove undefined if CLIENT_URL is not set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// --- HEALTH CHECK ENDPOINT ---
// Useful for Docker, load balancers, and monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// --- ROUTES ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
app.use("/ai", aiRoutes);

// --- GLOBAL ERROR HANDLER ---
// Must be defined AFTER all routes
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error."
  });
});

// --- DB CONNECTION ---
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("FATAL: MONGO_URL environment variable is not set.");
  process.exit(1); // Fail fast instead of crashing later
}

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set.");
  process.exit(1);
}

mongoose.connect(MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch((error) => {
    console.error(`DB Connection Error: ${error}`);
    process.exit(1); // Exit on DB connection failure
  });

// --- SOCKET.IO SETUP ---
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- SOCKET.IO JWT AUTH MIDDLEWARE ---
// Rejects unauthenticated socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const rawToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token;
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user to socket for use in handlers
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }
    return next(new Error("Invalid token"));
  }
});

// --- SOCKET.IO MESSAGE RATE LIMITER ---
// Prevents spam: max 30 messages per 60 seconds per socket
const messageTimestamps = new Map();
const MESSAGE_RATE_LIMIT = 30;
const MESSAGE_RATE_WINDOW = 60_000; // 60 seconds

const checkMessageRate = (socketId) => {
  const now = Date.now();
  const timestamps = messageTimestamps.get(socketId) || [];
  // Remove timestamps outside the window
  const recent = timestamps.filter((t) => now - t < MESSAGE_RATE_WINDOW);
  recent.push(now);
  messageTimestamps.set(socketId, recent);
  return recent.length <= MESSAGE_RATE_LIMIT;
};

// Clean up rate limit map periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [socketId, timestamps] of messageTimestamps) {
    const recent = timestamps.filter((t) => now - t < MESSAGE_RATE_WINDOW);
    if (recent.length === 0) {
      messageTimestamps.delete(socketId);
    } else {
      messageTimestamps.set(socketId, recent);
    }
  }
}, 5 * 60_000);

// --- XSS SANITIZATION HELPER FOR SOCKET MESSAGES ---
const sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").trim();
};

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id} (User: ${socket.user?.id || "unknown"})`);

  socket.on("join_room", (eventId) => {
    if (!eventId || typeof eventId !== "string") return;
    socket.join(eventId);
  });

  socket.on("leave_room", (eventId) => {
    if (!eventId || typeof eventId !== "string") return;
    socket.leave(eventId);
  });

  socket.on("send_message", async (data) => {
    try {
      // 1. Rate limit check
      if (!checkMessageRate(socket.id)) {
        socket.emit("error_message", { message: "You are sending messages too fast. Slow down." });
        return;
      }

      // 2. Validate required fields
      if (!data?.room || !data?.message) {
        socket.emit("error_message", { message: "Room and message are required." });
        return;
      }

      // 3. Sanitize inputs (prevent XSS)
      const sanitizedText = sanitizeString(data.message);
      const sanitizedRoom = sanitizeString(data.room);

      // 4. Message length limit (500 chars)
      if (sanitizedText.length === 0 || sanitizedText.length > 500) {
        socket.emit("error_message", { message: "Message must be between 1 and 500 characters." });
        return;
      }

      // 5. Use verified userId from JWT (NOT from client data)
      const verifiedUserId = socket.user?.id;
      const verifiedSenderName = data.author || "Anonymous";

      const messageData = {
        room: sanitizedRoom,
        userId: verifiedUserId,
        author: sanitizeString(verifiedSenderName),
        message: sanitizedText,
        time: data.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      // 6. Save to database with verified data
      const savedMessage = new Message({
        eventId: sanitizedRoom,
        senderId: verifiedUserId,
        senderName: sanitizeString(verifiedSenderName),
        text: sanitizedText,
        time: messageData.time
      });
      await savedMessage.save();

      // 7. Broadcast to room (including sender for consistency)
      io.to(sanitizedRoom).emit("receive_message", messageData);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket Disconnected: ${socket.id}`);
    messageTimestamps.delete(socket.id); // Clean up rate limit data
  });
});

// START SERVER
httpServer.listen(PORT, () =>
  console.log(`Server Port: ${PORT}`)
);