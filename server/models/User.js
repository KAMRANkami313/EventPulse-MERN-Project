import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    
    // --- ADVANCED SOCIAL GRAPH (Phase 33) ---
    // Replaces 'friends' array with explicit directional graph
    followers: { 
        type: Array, 
        default: [] 
    }, // People who follow ME
    
    following: { 
        type: Array, 
        default: [] 
    }, // People I follow

    // Backward compatibility (Optional: keep until migration is done, but unused in logic now)
    friends: {
      type: Array,
      default: [],
    },
    
    // NEW: Stores IDs of events the user has bookmarked/saved
    bookmarks: {
      type: Array,
      default: [],
    },

    location: String,
    occupation: String,
    
    // NEW: Social Media Links
    socials: {
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        instagram: { type: String, default: "" }
    },

    // SETTINGS PRIVACY
    privacy: { 
        type: String, 
        enum: ["public", "private"], 
        default: "public" 
    },

    viewedProfile: Number,
    impressions: Number,
    role: {
        type: String,
        default: "user" // 'user' or 'admin'
    },
    
    // --- NEW FIELDS FOR PASSWORD RESET ---
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;