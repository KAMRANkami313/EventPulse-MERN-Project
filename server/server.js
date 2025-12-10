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

// --- 1. RELAXED RATE LIMITER (INCREASED LIMIT) ---
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5000, // <--- INCREASED FROM 100 TO 5000 FOR DEV
	standardHeaders: true, 
	legacyHeaders: false,
    message: "Too many requests, please try again later."
});
app.use(limiter); 

// --- MIDDLEWARE ---
app.use(express.json());

// Helmet for Google Auth
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, 
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("common"));

// ------------------------------------------------------------------
// --- START OF REQUIRED DEPLOYMENT CHANGES: DYNAMIC CORS SETUP ---
// ------------------------------------------------------------------

// Allow Localhost AND Production URL (We will set CLIENT_URL in Render later)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL, // This will be your Vercel URL
];

// --- 2. DYNAMIC CORS ---
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

// ------------------------------------------------------------------
// --- END OF REQUIRED DEPLOYMENT CHANGES ---
// ------------------------------------------------------------------


app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// --- ROUTES ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
app.use("/ai", aiRoutes);

// --- DB CONNECTION ---
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log(`${error} did not connect`));

// --- SOCKET.IO SETUP ---
const httpServer = createServer(app);

// Update Socket.io to use the dynamic allowedOrigins array
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Use the dynamic array
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