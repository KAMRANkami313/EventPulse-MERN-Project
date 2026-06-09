import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must be at most 50 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name must be at most 50 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      maxlength: [100, "Email must be at most 100 characters"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
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

    location: {
      type: String,
      maxlength: [100, "Location must be at most 100 characters"],
      trim: true,
    },
    occupation: {
      type: String,
      maxlength: [100, "Occupation must be at most 100 characters"],
      trim: true,
    },

    // NEW: Social Media Links
    socials: {
        twitter: { type: String, default: "", maxlength: 200 },
        linkedin: { type: String, default: "", maxlength: 200 },
        instagram: { type: String, default: "", maxlength: 200 }
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
        enum: ["user", "admin"],
        default: "user"
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