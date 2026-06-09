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

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import notificationRoutes from "./routes/notifications.js";
import messageRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payment.js";
import Message from "./models/Message.js";  
import aiRoutes from "./routes/ai.js";

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
    origin: allowedOrigins, // Use the cleaned array
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (eventId) => {
    socket.join(eventId);
  });

  socket.on("send_message", async (data) => {
    try {
      const savedMessage = new Message({
        eventId: data.room,
        senderId: data.userId,
        senderName: data.author,
        text: data.message,
        time: data.time
      });
      await savedMessage.save();
      socket.to(data.room).emit("receive_message", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// START SERVER
httpServer.listen(PORT, () =>
  console.log(`Server Port: ${PORT}`)
);