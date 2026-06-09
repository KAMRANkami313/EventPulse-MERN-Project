import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library"; 
import crypto from "crypto"; 
import User from "../models/User.js";
import { sendWelcomeEmail, sendResetEmail } from "../services/email.js"; 

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// JWT Token expiry configuration
const JWT_EXPIRY = "7d"; // Tokens expire after 7 days

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

    // Basic input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

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
      viewedProfile: 0, // Removed fake random data
      impressions: 0,
    });

    // 3. Save to MongoDB
    const savedUser = await newUser.save();

    // 4. SEND WELCOME EMAIL (Background Task - fire and forget)
    try {
      sendWelcomeEmail(savedUser.email, savedUser.firstName);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
    
    // 5. Generate JWT token with expiry
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // 6. Send back token and user data (remove password before sending for security)
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({ token, user: userResponse });

  } catch (err) {
    console.error("Registration Error:", err);
    // Don't leak internal error details to client
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials." }); // Generic message — prevents user enumeration

    // 2. Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." }); // Same generic message

    // 3. Generate JWT Token WITH expiry
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // 4. Send token and user data back
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({ token, user: userResponse });
    
  } catch (err) {
    res.status(500).json({ error: "Login failed. Please try again." });
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
        // Use crypto.randomBytes instead of Math.random for secure password generation
        const randomPassword = crypto.randomBytes(16).toString("base64url");
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(randomPassword, salt);

        user = new User({
            firstName: given_name,
            lastName: family_name,
            email,
            password: passwordHash,
            picturePath: "",
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

    // 4. Generate JWT WITH expiry (Same as normal login)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ token, user: userResponse });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: "Google authentication failed." });
  }
};

/* --- FORGOT PASSWORD (SEND EMAIL) --- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // SECURITY: Always return the same response whether user exists or not
    // This prevents email enumeration (attackers discovering which emails are registered)
    if (!user) {
      return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    // 1. Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // 2. Hash it before saving to DB (Security Best Practice)
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // 3. Send Email
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    
    try {
      sendResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      console.error("Error sending reset email:", emailErr);
    }

    res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });

  } catch (err) {
    res.status(500).json({ error: "Password reset request failed. Please try again." });
  }
};

/* --- RESET PASSWORD (VERIFY & UPDATE) --- */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate new password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

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
    res.status(500).json({ error: "Password reset failed. Please try again." });
  }
};

/* --- CHANGE PASSWORD (FROM SETTINGS) --- */
export const changePassword = async (req, res) => {
  try {
    // SECURITY FIX: Use userId from JWT token (req.user.id), NOT from request body
    // This prevents users from changing anyone else's password
    const userId = req.user.id;
    const { current, new: newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 1. Verify Current Password
    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    // 2. Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    // 3. Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Password change failed. Please try again." });
  }
};