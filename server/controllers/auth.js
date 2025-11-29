import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library"; 
import crypto from "crypto"; // <--- NEW IMPORT
import User from "../models/User.js";
import { sendWelcomeEmail, sendResetEmail } from "../services/email.js"; // <--- UPDATED IMPORT

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      location,
      occupation,
    } = req.body;

    // 1. Encrypt the password (Security Best Practice)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Create new user object
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 1000), // Dummy data for now
      impressions: Math.floor(Math.random() * 1000),   // Dummy data for now
    });

    // 3. Save to MongoDB
    const savedUser = await newUser.save();

    // 4. SEND WELCOME EMAIL (Background Task)
    try {
      sendWelcomeEmail(savedUser.email, savedUser.firstName);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
    
    // 5. Send back the saved user (remove password before sending for security)
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    // 2. Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    // 3. Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // 4. Send token and user data back
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({ token, user: userResponse });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GOOGLE LOGIN */
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // 1. Verify the Token with Google
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // 2. Check if user exists in DB
    let user = await User.findOne({ email });

    if (!user) {
        // 3. If NOT exists, Register them automatically
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(randomPassword, salt);

        user = new User({
            firstName: given_name,
            lastName: family_name,
            email,
            password: passwordHash,
            picturePath: "", // We handle external URLs differently in frontend usually
            location: "Earth",
            occupation: "Google User",
            viewedProfile: 0,
            impressions: 0
        });
        await user.save();

        // Optional: Send welcome email to Google users too
        try {
          sendWelcomeEmail(email, given_name);
        } catch (e) {
          console.log("Email error for Google user:", e);
        }
    }

    // 4. Generate JWT (Same as normal login)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ token, user: userResponse });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* --- NEW: FORGOT PASSWORD (SEND EMAIL) --- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // 2. Hash it before saving to DB (Security Best Practice)
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // 3. Send Email
    // Use CLIENT_URL from .env or default to localhost
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    
    sendResetEmail(user.email, resetUrl);

    res.status(200).json({ message: "Email sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* --- NEW: RESET PASSWORD (VERIFY & UPDATE) --- */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. Hash the token from URL to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find user with this token AND make sure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // 3. Encrypt new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};