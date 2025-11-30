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
import rateLimit from "express-rate-limit"; // <--- NEW IMPORT

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import notificationRoutes from "./routes/notifications.js";
import messageRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";
import Message from "./models/Message.js";  
import paymentRoutes from "./routes/payment.js";

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// --- RATE LIMITER CONFIGURATION (Phase 20) ---
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true, 
	legacyHeaders: false,
    message: JSON.stringify({ message: "Too many requests, please try again later." })
});

// Apply rate limiting globally for security
app.use(limiter); 
// -----------------------------------------------

// --- MIDDLEWARE (UPDATED FOR GOOGLE LOGIN) ---
app.use(express.json());

// This specific configuration allows Google Login Popups to work
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, 
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("common"));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
// ---------------------------------------------

// Routes
// Note: Limiter is already applied globally above (app.use(limiter))
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);

// DB
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log(`${error} did not connect`));

// --- SOCKET.IO SETUP ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // JOIN ROOM
  socket.on("join_room", (eventId) => {
    socket.join(eventId);
    console.log(`User ${socket.id} joined room: ${eventId}`);
  });

  // SEND MESSAGE (SAVE + BROADCAST)
  socket.on("send_message", async (data) => {
    try {
      // 1️⃣ Save to database
      const savedMessage = new Message({
        eventId: data.room,
        senderId: data.userId,
        senderName: data.author,
        text: data.message,
        time: data.time
      });

      await savedMessage.save();

      // 2️⃣ Broadcast to other clients in the room
      socket.to(data.room).emit("receive_message", data);

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Server Listen
httpServer.listen(PORT, () =>
  console.log(`Server Port: ${PORT}`)
);